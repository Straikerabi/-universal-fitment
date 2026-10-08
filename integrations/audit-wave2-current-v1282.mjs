import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const models=[
 {brand:'Miele',file:'miele-model-research-wave2.json',status:'decision',accept:'accepted',expected:25,goal:82},
 {brand:'Dyson',file:'dyson-model-research-wave2.json',status:'status',accept:'accepted',expected:38,goal:92},
 {brand:'Hoover',file:'hoover-model-research-wave2.json',status:'decision',accept:'accepted',expected:76,goal:100}
];
const {products}=await import(path.resolve(root,'site/src/data/catalog.js'));
const packFiles={Dyson:'dyson-pack.js',Hoover:'hoover-pack.js'};
const existing=new Map();
for(const x of models) {
 let arr=products.filter(p=>p.brand===x.brand&&p.recordType==='model').map(p=>({
  code:p.vacuumMeta?.modelName||p.identifiers?.find(y=>y.type==='manufacturer-model')?.value||p.name,
  name:p.name
 }));
 if(packFiles[x.brand]){
  const {brandPack}=await import(path.resolve(root,'site/src/data/'+packFiles[x.brand]));
  arr=brandPack.models.map(m=>({code:m.code,name:m.model}));
 }
 existing.set(x.brand,arr);
}
const sourceHost=url=>new URL(url).hostname.toLowerCase();
const manifests=[];
const totals={oldNames:943,oldRecords:954,goalSlots:730,articles:1940,physical:1822};
const normalize=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
for(const x of models){
 const raw=JSON.parse(fs.readFileSync(path.join(root,'integrations',x.file),'utf8'));
 const accepted=raw.candidates.filter(m=>m[x.status]===x.accept);
 assert.equal(accepted.length,x.expected,'Unexpected accepted data changes '+x.brand);
 const seen=new Set();
 const legacy=existing.get(x.brand);
 const prior=new Set(legacy.flatMap(m=>[normalize(m.code),normalize(m.name)]));
 assert.ok(prior.size>0,'Loaded existing source missing');
 const identities=[];
 for(const c of accepted){
  const name=x.brand==='Miele'?c.modelCode:x.brand==='Dyson'?c.canonicalModel:c.model;
  assert.ok(name&&typeof name==='string','Missing candidate identity');
  const norm=normalize(name);
  assert.ok(norm);
  assert.ok(!seen.has(norm),'New candidates duplicate within source '+name);
  seen.add(norm);
  assert.ok(!prior.has(norm),'Candidate already exists in current checkpoint '+x.brand+': '+name);
  assert.equal(c.brand||c.manufacturer,x.brand);
  if(x.brand==='Miele'){
   assert.ok(c.primarySourceId);
   assert.ok(c.primaryPdfPage>=1);
   assert.equal(c.addedParts,0);
   assert.equal(c.executionNumber,null);
   assert.equal(c.materialNumber,null);
  }else if(x.brand==='Dyson'){
   assert.ok(c.sources?.some(s=>sourceHost(s.url)==='www.dyson.de'),'Dyson-DE manufacturer primary required');
   assert.equal(c.newParts,0);
   assert.equal(c.relationships.length,0);
  }else{
   assert.match(c.productCode,/^\d{8}$/);
   assert.ok(['DE','GB','FR'].includes(c.sourceMarket));
   assert.ok(sourceHost(c.url)==='service.hoover.co.uk'||sourceHost(c.url).endsWith('.hoover-home.com'),'Hoover manufacturer/service URL');
   assert.equal(c.partsAdded,0);
   assert.equal(c.fitmentRelationshipsAdded,0);
  }
  identities.push(name);
 }
 const expectedBaseline=x.brand==='Miele'?57:x.brand==='Dyson'?54:24;
 // Miele has extra 5 variant records; keep that distinction from count of names.
 const reported=x.brand==='Miele'?raw.baseline?.modelCount:x.brand==='Dyson'?raw.baseline?.modelNames:raw.summary.initialHooverModels;
 assert.equal(reported,expectedBaseline);
 assert.equal(expectedBaseline+accepted.length,x.goal);
 manifests.push({brand:x.brand,priorModels:expectedBaseline,newEvidenceBackedModels:accepted.length,preparedModels:x.goal,
  acceptedNames:identities,unverifiedExactFitmentAdded:0,sourceFile:x.file});
 console.log('PASS '+x.brand+' '+accepted.length+' accepted without duplicate current device names');
}
const count=manifests.reduce((n,m)=>n+m.newEvidenceBackedModels,0);
assert.equal(count,139);
assert.equal(totals.goalSlots+count,869);
assert.equal(totals.oldNames+count,1082);
assert.equal(totals.oldRecords+count,1093);
console.log(JSON.stringify({phase:'read-only evidence check',v:'1.28.2',baseline:totals,accepted:count,
 expectedAfter:{modelNames:1082,modelRecords:1093,goalSlots:869,articles:1940,physical:1822},
 manufacturers:manifests.map(({acceptedNames,...v})=>v),limitations:[
 'Does not itself modify live model catalogue',
 'Individual series/manufacturer identification does not imply part-to-device fitment',
 'Only integrated build, regression and SHA-replay may authorize release'
]},null,2));
