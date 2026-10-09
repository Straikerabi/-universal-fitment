import {catalogSnapshot} from './catalog-snapshot.mjs';
import {mockScenarios} from './mock-fitment-adapter.mjs';
import {buildSyntheticUiRequest} from '../dual-platform-owner-review/ui-fixtures.mjs';
import {inspectOnBothSurfaces} from '../dual-platform-owner-review/bridge.mjs';
import {catalogFingerprint} from './offline-config.mjs';
export const assemblies=[
 {id:'filter',label:'Filter & Beutel',hint:'Filter und Staubbeutel',types:['filter','bag']},
 {id:'brush',label:'Bürsten & Düsen',hint:'Walze, Bodendüse und Aufnahme',types:['roller','nozzle']},
 {id:'battery',label:'Akku & Elektrik',hint:'Akku, Ladezubehör und Anschluss',types:['battery','charger','electrical']},
 {id:'hose',label:'Schläuche',hint:'Schlauch und Luftverbindung',types:['hose']},
 {id:'body',label:'Gehäuse & Behälter',hint:'Behälter, Griff und Abdeckungen',types:['bin','mechanical','storage']}
];
export const problems=[{id:'suction',label:'Saugleistung lässt nach'},{id:'brush',label:'Bürste oder Düse prüfen'},{id:'power',label:'Akku oder Laden prüfen'},{id:'part',label:'Ein bestimmtes Teil finden'}];
export const dataFingerprint=catalogFingerprint;
export const storageKey=mode=>'uf-repair-mission-poc-v1-'+mode;
export function freshMission(mode='real'){return {version:2,fingerprint:dataFingerprint,mode,step:1,deviceId:null,problemId:'part',scenarioId:'filter-positive',variantKnown:false,observedCode:'',assemblyId:null,selectedPartIds:[],done:[]};}
export function currentDevice(state){return state.mode==='synthetic'?(state.deviceId==='demo:vacuum-a'?{id:'demo:vacuum-a',brand:'Synthetisches Beispiel',model:'Demo Vacuum A',reference:mockScenarios.find(x=>x.id===state.scenarioId)?.variant||'Revision offen',type:'cordless',variantHint:'Fiktives Gerät und fiktive Teile. Dieses Beispiel ist keine Aussage zu einer realen Marke.'}:null):catalogSnapshot.devices.find(x=>x.id===state.deviceId)||null;}
export function searchDevices(query='',brand='all'){
 const q=query.trim().toLocaleUpperCase('de-DE');
 return catalogSnapshot.devices.filter(d=>(brand==='all'||d.brand===brand)&&(!q||[d.model,d.brand,d.reference,d.productCode,...d.identifiers.map(x=>x.value)].filter(Boolean).some(x=>x.toLocaleUpperCase('de-DE').includes(q))));
}
export function candidateParts(state){const device=currentDevice(state),assembly=assemblies.find(x=>x.id===state.assemblyId);if(state.mode!=='real'||!device||!assembly)return [];return catalogSnapshot.parts.filter(p=>device.candidatePartIds.includes(p.id)&&assembly.types.includes(p.assembly));}
export function transition(state,action){
 let s={...state,selectedPartIds:[...state.selectedPartIds],done:[...state.done]};
 if(action.type==='mode')return freshMission(action.value==='synthetic'?'synthetic':'real');
 if(action.type==='device'){if(!catalogSnapshot.devices.some(x=>x.id===action.value))return s;return {...freshMission('real'),deviceId:action.value,problemId:s.problemId};}
 if(action.type==='scenario'){if(!mockScenarios.some(x=>x.id===action.value))return s;return {...freshMission('synthetic'),deviceId:'demo:vacuum-a',scenarioId:action.value};}
 if(action.type==='problem'&&problems.some(x=>x.id===action.value))s.problemId=action.value;
 if(action.type==='variant'){s.variantKnown=action.known===true;s.observedCode=typeof action.code==='string'?action.code.trim().slice(0,100):'';s.selectedPartIds=[];s.done=[];}
 if(action.type==='assembly'&&assemblies.some(x=>x.id===action.value)&&s.assemblyId!==action.value){s.assemblyId=action.value;s.selectedPartIds=[];s.done=[];}
 if(action.type==='part'&&candidateParts(s).some(x=>x.id===action.value)){s.selectedPartIds=s.selectedPartIds.includes(action.value)?s.selectedPartIds.filter(x=>x!==action.value):[...s.selectedPartIds,action.value];s.done=[];}
 if(action.type==='done'&&checklist(s).some(x=>x.id===action.value))s.done=s.done.includes(action.value)?s.done.filter(x=>x!==action.value):[...s.done,action.value];
 if(action.type==='step'&&Number.isInteger(action.value)&&action.value>=1&&action.value<=5){if(action.value>1&&!currentDevice(s))return s;if(action.value>3&&!s.assemblyId)return s;s.step=action.value;}
 return s;
}
export function assessment(state){
 if(state.mode==='synthetic'){
  const fixture=mockScenarios.find(x=>x.id===state.scenarioId);
  try{
   const request=buildSyntheticUiRequest(state.scenarioId,{variantKnown:state.variantKnown,assemblyId:state.assemblyId||'unselected'});
   const v=inspectOnBothSurfaces(request,{tenantId:'demo-consumer',caseId:'demo-'+state.scenarioId});
   const sameAssembly=fixture?.assembly===state.assemblyId;
   const status=v.consumer.status;
   // The shared FitmentResponse decides the status; texts cannot grant compatibility.
   const reasons=(sameAssembly&&state.variantKnown?[...fixture.reasons]:[]).concat(v.engine.reasons.map(x=>'Fitment v1 · '+x));
   const missing=[...(sameAssembly?fixture.missing:[]),...v.engine.nextChecks];
   if(!state.variantKnown)missing.unshift('Ausführung auswählen oder als unbekannt weitergehen; Kennung möglichst vom Typenschild ablesen.');
   return {synthetic:true,status,headline:status==='supported'?'Belegt passend · nur synthetischer Test':status==='incompatible'?'Belegt nicht passend · nur synthetischer Test':'Passung unklar',reasons,missing,evidence:v.engine.sources.map(x=>({id:x.id,label:'Synthetische Testquelle · keine echte OEM-Freigabe',kind:'synthetic',url:null})),purchaseAllowed:false,partCode:sameAssembly?fixture.part:null,completeKit:false};
  }catch {
   return {synthetic:true,status:'unclear',headline:'Passung unklar',reasons:['Der gemeinsame Fitment-Vertrag hat diese Demoantwort nicht freigegeben.'],missing:['Testdaten und exakte Ausführung erneut prüfen.'],evidence:[],purchaseAllowed:false,partCode:null,completeKit:false};
  }
 }
 const device=currentDevice(state);
 const userCodeMismatch=state.observedCode&&device&&state.observedCode.toLocaleUpperCase('de-DE')!==device.reference.toLocaleUpperCase('de-DE');
 return {synthetic:false,status:'unclear',headline:'Passung noch nicht geprüft',reasons:['Die Geräteidentität stammt aus dem dokumentierten Bestandskatalog.','Für diese Mission liegt noch keine Antwort der gemeinsamen Passungsprüfung vor. Eine Katalogzuordnung allein bestätigt den Einbau nicht.'],missing:[...(!state.variantKnown?['Vollständige Gerätekennung und Ausführung vom Typenschild übernehmen.']:[]),...(userCodeMismatch?['Eigene Kennung weicht von der Quellenkennung ab: genaue Variante klären, keine ähnliche Ausführung übernehmen.']:[]),...(device?.brand==='Bosch'?['Vollständige E-Nr. mit /xx-Index und passenden Herstellerbeleg prüfen.']:[]),...(device?.brand==='Hoover'?['Produktcode und regionalen Serien-/Revisionsbereich prüfen.']:[]),'Modellbezogene Passung sowie Anschluss-/Revisionsbedingungen anhand eines geeigneten Herstellerbelegs klären.'],evidence:[],purchaseAllowed:false,completeKit:false,partCode:null};
}
export function checklist(state){
 if(!state.assemblyId||!currentDevice(state))return [];
 const a=assessment(state),assembly=assemblies.find(x=>x.id===state.assemblyId),device=currentDevice(state);const list=[{id:'identity',label:'Gerätekennung und Ausführung abgleichen',detail:device.reference,kind:'review'},{id:'fitment',label:'Passungsprüfung klären',detail:a.headline+(state.mode==='synthetic'?' · nur Demo':''),kind:'review'}];
 a.missing.forEach((text,i)=>list.push({id:'missing-'+i,label:text,detail:'Offene Angabe',kind:'missing'}));
 if(state.mode==='synthetic'&&a.partCode&&a.status!=='incompatible')list.push({id:'demo-part',label:a.partCode,detail:'Synthetischer Demoartikel; keine Einkaufsliste',kind:'synthetic'});
 if(state.mode==='real'){
  for(const id of state.selectedPartIds){const p=candidateParts(state).find(x=>x.id===id);if(p)list.push({id:'part-'+p.id,label:p.name,detail:p.code+' · Prüfkandidat, Passung unbestätigt',kind:'candidate',source:p.source});}
  if(!state.selectedPartIds.length)list.push({id:'part-open',label:assembly.label+' – Originalteil bestimmen',detail:'OEM-Nummer und genaue Ausführung offen',kind:'missing'});
 }
 list.push({id:'sources',label:'Herstellerbelege und Reparaturvoraussetzungen prüfen',detail:'Keine Werkzeug-, Drehmoment- oder Montagefreigabe aus diesem Prototyp.',kind:'review'});
 return list;
}
export function exportMission(state){
 const d=currentDevice(state),a=assessment(state),items=checklist(state);
 const partSources=items.filter(x=>x.source).map(x=>'Artikelidentität: '+x.source.url+' · Stand '+x.source.checkedAt+' · keine Passungsfreigabe');
 return ['Universal Fitment · Reparaturmission',state.mode==='synthetic'?'SYNTHETISCHE DEMO – keine reale OEM-Passung':'Prüfliste – Passung unbestätigt; keine Kauf- oder Montagefreigabe',d?d.brand+' · '+d.model:'Gerät offen',d?'Quellenkennung: '+d.reference:'',d?.productCode?'Produktcode: '+d.productCode:'',d?.market?'Quellenmarkt: '+d.market:'','Frage: '+problems.find(x=>x.id===state.problemId).label,state.assemblyId?'Suchbereich: '+assemblies.find(x=>x.id===state.assemblyId).label:'',state.observedCode?'Eigene Angabe (ungeprüft): '+state.observedCode:'',a.headline,...items.map(x=>'['+(state.done.includes(x.id)?'x':' ')+'] '+x.label+' — '+x.detail),...(state.mode==='real'&&d?['Gerätequelle: '+d.source.url+' · Stand '+d.source.checkedAt]:[]),...partSources,'Angebote, Preise und Lieferbarkeit: nicht angebunden.'].filter(Boolean).join('\n');
}
export function restoreMission(raw,mode='real'){
 const fallback=freshMission(mode);try{
  const s=typeof raw==='string'?JSON.parse(raw):raw;if(!s||s.version!==2||s.fingerprint!==dataFingerprint||s.mode!==mode)return fallback;
  const keys=Object.keys(fallback);if(Object.keys(s).some(x=>!keys.includes(x)))return fallback;
  if(!Number.isInteger(s.step)||s.step<1||s.step>5||typeof s.variantKnown!=='boolean'||typeof s.observedCode!=='string'||s.observedCode.length>100||!Array.isArray(s.selectedPartIds)||!Array.isArray(s.done)||!problems.some(x=>x.id===s.problemId)||!mockScenarios.some(x=>x.id===s.scenarioId))return fallback;
  if(s.deviceId!==null&&(mode==='real'?!catalogSnapshot.devices.some(x=>x.id===s.deviceId):s.deviceId!=='demo:vacuum-a'))return fallback;
  if(s.assemblyId!==null&&!assemblies.some(x=>x.id===s.assemblyId))return fallback;
  if(s.step>1&&!currentDevice(s)||s.step>3&&!s.assemblyId)return fallback;
  if(new Set(s.selectedPartIds).size!==s.selectedPartIds.length||s.selectedPartIds.some(id=>!candidateParts(s).some(p=>p.id===id)))return fallback;
  const allowed=new Set(checklist(s).map(x=>x.id));if(s.done.length>30||new Set(s.done).size!==s.done.length||s.done.some(id=>!allowed.has(id)))return fallback;
  return {...s,selectedPartIds:[...s.selectedPartIds],done:[...s.done]};
 }catch{return fallback;}
}
export function saveMission(storage,state){try{storage.setItem(storageKey(state.mode),JSON.stringify(state));return true;}catch{return false;}}
export function loadMission(storage,mode='real'){try{return restoreMission(storage.getItem(storageKey(mode)),mode);}catch{return freshMission(mode);}}
