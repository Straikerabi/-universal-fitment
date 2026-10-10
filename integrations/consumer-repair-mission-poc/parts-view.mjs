// Presentation of existing identities only. No fitment or commercial decisions.
import {assemblies,candidateParts,assessment,checklist} from './mission-state.mjs';
import {mockScenarios} from './mock-fitment-adapter.mjs';

export const partTypes=Object.freeze([
 {id:'filter',label:'Filter',types:['filter']},
 {id:'bag',label:'Staubbeutel',types:['bag']},
 {id:'roller',label:'Bürstenwalze',types:['roller']},
 {id:'nozzle',label:'Düse / Bürste',types:['nozzle']},
 {id:'energy',label:'Akku / Elektrik',types:['battery','charger','electrical']},
 {id:'hose',label:'Schlauch',types:['hose']},
 {id:'body',label:'Gehäuse / Behälter',types:['bin','mechanical','storage']}
]);
export const evidenceOptions=Object.freeze([
 {id:'all',label:'Alle Nachweise'},
 {id:'original',label:'Originalteil-Identität belegt'},
 {id:'alternative',label:'Alternative belegt'},
 {id:'unknown',label:'Nachweis offen'},
 {id:'synthetic',label:'Synthetischer Testfall'}
]);
export const defaultFilters=()=>({query:'',assembly:'all',type:'all',evidence:'all',sort:'name'});
const collator=new Intl.Collator('de',{numeric:true,sensitivity:'base'});

// Website locale only; never transfer it to a device, part or fitment condition.
export function sourceRegion(source){
 try{
  const url=new URL(source.url);
  if(url.hostname==='service.hoover.co.uk')return 'GB';
  if(url.hostname==='www.hoover-home.com'&&url.pathname.startsWith('/en_GB/'))return 'GB (en_GB)';
  if(['www.miele.de','www.dyson.de','shop.aeg.de'].includes(url.hostname)||
   (['www.siemens-home.bsh-group.com','www.vorwerk.com'].includes(url.hostname)&&url.pathname.startsWith('/de/de/'))||
   (url.hostname==='www.hoover-home.com'&&url.pathname.startsWith('/de_DE/'))||
   (url.hostname==='www.samsung.com'&&url.pathname.startsWith('/de/'))||
   (url.hostname==='www.bosch-home.com'&&url.pathname.startsWith('/de/de/')))return 'DE';
 }catch{}
 return 'nicht dokumentiert';
}

export function cleanFilters(input={}){
 return {
  query:typeof input.query==='string'?input.query.trim().slice(0,100):'',
  assembly:assemblies.some(x=>x.id===input.assembly)?input.assembly:'all',
  type:partTypes.some(x=>x.id===input.type)?input.type:'all',
  evidence:evidenceOptions.some(x=>x.id===input.evidence)?input.evidence:'all',
  // No licensed, current price exists in this dataset. Never fall back to a price.
  sort:input.sort==='code'?'code':'name'
 };
}

function typeOf(part){return partTypes.find(x=>x.types.includes(part.assembly))?.id||'unknown';}
function evidenceOf(part){
 return part.source?.scope==='catalog-identity-observation'&&
  part.identifiers.some(x=>['material-number','manufacturer-article'].includes(x.type))
  ?'original':'unknown';
}

export function rowsForAssembly(state,assemblyId){
 if(state.mode==='real')return candidateParts({...state,assemblyId}).map(part=>({
  ...part,type:typeOf(part),identityEvidence:evidenceOf(part),synthetic:false,
  fitmentStatus:'unclear',fitmentConfirmed:false
 }));
 const fixture=mockScenarios.find(x=>x.id===state.scenarioId);
 if(!state.deviceId||fixture?.assembly!==assemblyId)return [];
 const answer=assessment({...state,assemblyId});
 return [{id:'demo:'+fixture.id,name:'Synthetischer Demoartikel',code:fixture.part,
  assembly:fixture.assembly,type:fixture.assembly==='battery'?'energy':'filter',
  source:null,synthetic:true,identityEvidence:'synthetic',fitmentStatus:answer.status,
  fitmentConfirmed:false,syntheticSupported:answer.status==='supported'}];
}

export function sortRows(rows,sort='name'){
 const field=sort==='code'?'code':'name';
 return [...rows].sort((a,b)=>collator.compare(a[field],b[field])||
  collator.compare(a.code,b.code)||collator.compare(a.id,b.id));
}

export function browseParts(state,input=defaultFilters()){
 const filters=cleanFilters(input),needle=filters.query.toLocaleUpperCase('de-DE');
 const groups=assemblies.filter(a=>filters.assembly==='all'||a.id===filters.assembly).map(a=>{
  const all=rowsForAssembly(state,a.id);
  const visible=all.filter(p=>(!needle||[p.name,p.code,partTypes.find(x=>x.id===p.type)?.label].filter(Boolean).some(x=>x.toLocaleUpperCase('de-DE').includes(needle)))&&
   (filters.type==='all'||p.type===filters.type)&&
   (filters.evidence==='all'||p.identityEvidence===filters.evidence));
  return {...a,parts:sortRows(visible,filters.sort),candidates:all.length,visibleCount:visible.length,
   confirmedReal:0,syntheticSupported:all.filter(x=>x.syntheticSupported).length,
   emptyReason:all.length===0?'not-documented':visible.length===0?'filtered':null};
 });
 return {filters,groups,visibleCount:groups.reduce((n,g)=>n+g.visibleCount,0),
  candidates:groups.reduce((n,g)=>n+g.candidates,0),priceSortAvailable:false};
}

export function checklistSections(state){
 const items=checklist(state);
 return [
  {id:'gaps',title:'Noch zu klären',items:items.filter(x=>x.kind==='missing'||x.id==='fitment')},
  {id:'parts',title:state.mode==='synthetic'?'Synthetische Teile-Notizen':'Vorgemerkte Prüfkandidaten',
   items:items.filter(x=>x.kind==='candidate'||x.kind==='synthetic')},
  {id:'preparation',title:'Gerät & Belege',items:items.filter(x=>x.kind==='review'&&x.id!=='fitment')}
 ];
}
