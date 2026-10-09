// UI fixtures only. This is NOT #48's contract or an OEM compatibility engine.
export const mockScenarios=Object.freeze([
 {id:'filter-positive',label:'Filter · belegtes Demo-Beispiel',variant:'DEMO-R1',assembly:'filter',status:'supported',headline:'Belegt passend',part:'DEMO-FILTER-R1',reasons:['Das synthetische Gerät DEMO-VAC-A hat die Ausführung DEMO-R1.','Der Demo-Beleg DEMO-EVIDENCE-F1 nennt genau DEMO-FILTER-R1 für diese Ausführung.'],missing:[]},
 {id:'revision-missing',label:'Revision fehlt · unklar',variant:null,assembly:'filter',status:'unclear',headline:'Passung unklar',part:'DEMO-FILTER-R1',reasons:['Im synthetischen Beispiel fehlt die Revision.','Ein gleicher Modellname reicht für dieses Demo-Teil nicht.'],missing:['Revision vom Typenschild übernehmen.']},
 {id:'filter-negative',label:'Andere Revision · nicht passend',variant:'DEMO-R2',assembly:'filter',status:'incompatible',headline:'Belegt nicht passend',part:'DEMO-FILTER-R1',reasons:['Der synthetische Ausschlussbeleg DEMO-EVIDENCE-X1 schließt DEMO-R2 für DEMO-FILTER-R1 aus.'],missing:[]},
 {id:'connector-negative',label:'Akkuanschluss abweichend',variant:'DEMO-R1',assembly:'battery',status:'incompatible',headline:'Belegt nicht passend',part:'DEMO-BATTERY-B',reasons:['Das Demo-Gerät benötigt den synthetischen Anschluss DEMO-A.','Das Demo-Teil hat DEMO-B. Der Demo-Ausschlussbeleg bestätigt die Abweichung.'],missing:[]},
 {id:'kit-incomplete',label:'Filterpaket · Position fehlt',variant:'DEMO-R1',assembly:'filter',status:'unclear',headline:'Checkliste noch offen',part:'DEMO-FILTER-R1',reasons:['Der synthetische Demo-Paketbeleg nennt zusätzlich eine DEMO-DICHTUNG.','Für diese Position fehlt ein belegter Demo-Artikel. Das Paket wird nicht als vollständig bezeichnet.'],missing:['DEMO-DICHTUNG anhand eines geeigneten Belegs klären.']}
]);
const assemblyIds=['filter','brush','battery','body'];
const fail=()=>{throw new Error('Synthetic fixture adapter refuses this request');};
function requestFixture(request){
 if(!request||request.mode!=='synthetic'||request.assetId!=='demo:vacuum-a'||!assemblyIds.includes(request.assemblyId))fail();
 const fixture=mockScenarios.find(x=>x.id===request.scenarioId);if(!fixture)fail();
 if(request.variantId!==(fixture.variant||'unknown'))fail();
 if(typeof request.requestId!=='string'||!request.requestId.startsWith('demo:request:'))fail();
 return fixture;
}
export function getSyntheticResponse(request){
 const fixture=requestFixture(request);
 const modeled=fixture.assembly===request.assemblyId;
 return Object.freeze({viewVersion:'consumer-ui-fixture/1',synthetic:true,mode:'synthetic',requestId:request.requestId,assetId:request.assetId,variantId:request.variantId,assemblyId:request.assemblyId,scenarioId:fixture.id,status:modeled?fixture.status:'unclear',headline:modeled?fixture.headline:'Kein Demo-Beleg',reasons:modeled?[...fixture.reasons]:['Für diesen Bereich gibt es in der ausgewählten synthetischen Szene keine Antwort.'],missing:modeled?[...fixture.missing]:['Geeigneten Demo-Beleg ergänzen.'],partCode:modeled?fixture.part:null,evidence:modeled?[{id:'DEMO-EVIDENCE-'+fixture.id,label:'Synthetischer Beispielbeleg',kind:'synthetic',url:null}]:[],purchaseAllowed:false,completeKit:false});
}
export function acceptSyntheticResponse(response,request){
 requestFixture(request);
 if(!response||response.synthetic!==true||response.mode!=='synthetic'||response.viewVersion!=='consumer-ui-fixture/1'||response.purchaseAllowed!==false||response.completeKit!==false)fail();
 for(const key of ['requestId','assetId','variantId','assemblyId','scenarioId'])if(response[key]!==request[key])fail();
 if(!['supported','unclear','incompatible'].includes(response.status)||typeof response.headline!=='string'||!Array.isArray(response.reasons)||!response.reasons.every(x=>typeof x==='string')||!Array.isArray(response.missing)||!response.missing.every(x=>typeof x==='string')||!Array.isArray(response.evidence))fail();
 if(response.partCode&&!response.partCode.startsWith('DEMO-'))fail();
 if(response.evidence.some(x=>x.kind!=='synthetic'||x.url!==null||!x.id.startsWith('DEMO-')))fail();
 for(const key of ['price','offers','stock','shipping','oemCode','sourceUrl'])if(Object.hasOwn(response,key))fail();
 return response;
}
