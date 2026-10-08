import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const source=JSON.parse(fs.readFileSync(path.join(root,'integrations/samsung-evidence-v12612.json'),'utf8'));
const file=path.join(root,'site/src/data/samsung-pack.js');
const indexFile=path.join(root,'site/src/data/new-brands-index.js');
const packText=fs.readFileSync(file,'utf8');
const packTag='export const brandPack=';
assert.ok(packText.includes(packTag));
const pack=JSON.parse(packText.split(packTag)[1].trim().replace(/;\s*$/,''));
const idxText=fs.readFileSync(indexFile,'utf8');
const idxTag='export const newBrandsIndex=';
const manifestTag='export const newBrandsManifest=';
assert.ok(idxText.includes(idxTag)&&idxText.includes(manifestTag));
const [idxData,manifestData]=idxText.split(manifestTag);
const index=JSON.parse(idxData.split(idxTag)[1].trim().replace(/;\s*$/,''));
const manifest=JSON.parse(manifestData.trim().replace(/;\s*$/,''));
assert.equal(pack.brand,'Samsung');
assert.equal(pack.models.length,66);
assert.equal(pack.parts.length,35);
assert.equal(index.filter(x=>x.brand==='Samsung').length,66);
assert.equal(manifest.Samsung.partCount,35);
const models=new Map(pack.models.map(x=>[x.code,x]));
const parts=new Map(pack.parts.map(x=>[x.code,x]));
assert.equal(models.size,pack.models.length);
assert.equal(parts.size,pack.parts.length);
let madeModels=0,madeParts=0,relationships=0;
for(const row of source.models){
 const code=row.full_code.split('/')[0];
 let model=models.get(code);
 const url=row.manufacturer_url;
 assert.ok(url.startsWith('https://www.samsung.com/de/vacuum-cleaners/stick/'));
 assert.ok(url.endsWith(row.full_code.toLowerCase().replace('/','-')+'/'));
 if(row.catalog_status==='new_concrete_model'){
  assert.equal(model,undefined,'No duplicate model '+code);
  model={brand:'Samsung',code,model:code,series:'Bespoke AI Jet',deviceType:'cordless',
  type:row.name,url,guideUrl:url,partsUrl:url,
  deviceReferences:[row.full_code],aliases:[row.name],checkedAt:source.checked_at,
  variantNote:'Vollständigen Modellcode /WD vom Typenschild prüfen. Bürsten, Akkus, Wischaufsätze und Clean Station sind ausführungsspezifisch.',
  sourceNote:'Exakte deutsche Samsung-Geräteseite mit ausdrücklich optional gelisteten Zubehörkennungen; kein Live-Angebot, keine technische Pauschalfreigabe.'};
  pack.models.push(model);models.set(code,model);madeModels++;
 }else{
  assert.ok(model,'Existing listed model absent: '+code);
  assert.ok(model.deviceReferences?.includes(row.full_code),'Different model suffix: '+code);
  assert.ok(!model.partCount,'Model must not already contain source-linked parts: '+code);
 }
 model.url=url;model.guideUrl=url;model.partsUrl=url;model.checkedAt=source.checked_at;
 model.sourceNote='Exakte Samsung-Produktseite für '+row.full_code+' nennt optionales Zubehör; mögliche Anbauvoraussetzungen und Passung sind einzeln zu prüfen.';
 model.partCount=row.optional_accessories.length;
 model.physicalPartCount=row.optional_accessories.length;
 model.partListCoverage={sourceUrl:url,note:row.optional_accessories.length+' ausdrücklich optional gelistete Samsung-Artikel für '+row.full_code+'. Keine vollständige Ersatzteilliste; Zubehöranbau und Geräterevision prüfen.'};
 let lite=index.find(x=>x.brand==='Samsung'&&x.code===code);
 if(!lite){
  assert.equal(row.catalog_status,'new_concrete_model');
  const {partListCoverage,manuals,...summary}=model;
  lite={...summary};
  let after=index.map(x=>x.brand).lastIndexOf('Samsung');
  assert.ok(after>=0);
  index.splice(after+1,0,lite);
 }else{
  for(const k of ['url','guideUrl','partsUrl','checkedAt','sourceNote','partCount','physicalPartCount'])lite[k]=model[k];
 }
 lite.partCount=model.partCount;lite.physicalPartCount=model.physicalPartCount;
 for(const partCode of row.optional_accessories){
  let part=parts.get(partCode);
  if(!part){
   assert.equal(partCode,'VCA-SABC97/GL','No invented article identifier');
   part={brand:'Samsung',code:partCode,name:'Slim LED+ Hartbodenbürste VCA-SABC97/GL',url,
   sourcePageType:'device-optional-accessories',checkedAt:source.checked_at,
   relationships:[],partTypeId:'nozzle',attachmentReferences:[],restrictions:[],
   sourceCoverage:{status:'partial',observedReferences:[],note:'Hersteller nennt diese Bürste als optionales Zubehör für das exakte Gerät. Anschluss, Land und Revision prüfen.'}};
   pack.parts.push(part);parts.set(partCode,part);madeParts++;
  }
  part.relationships??=[];
  assert.ok(!part.relationships.some(r=>r.reference===row.full_code),'Duplicate exact relationship '+code+' '+partCode);
  part.relationships.push({code,model:code,reference:row.full_code,url,checkedAt:source.checked_at,basis:'manufacturer-device-optional-accessories'});
  part.sourceCoverage??={status:'partial',observedReferences:[]};
  const refs=[...new Set(part.relationships.map(r=>r.reference).filter(Boolean))];
  part.sourceCoverage.observedReferences=refs;
  part.sourceCoverage.note='Samsung nennt '+partCode+' als optionalen Zubehörartikel für '+refs.join(', ')+'. Passung, Zubehörvariante, vollständigen Geräteländercode und zusätzliche Baugruppenbedingungen vor einem Kauf prüfen.';
  if(['VCA-SPA95/GL','VCA-SPW95/VT'].includes(partCode))assert.ok(part.attachmentReferences?.length,'Wipe consumable requires appropriate mop head');
  if(partCode==='VCA-ADB952')assert.ok(part.attachmentReferences?.length,'Clean Station bag needs station');
  relationships++;
 }
}
assert.equal(madeModels,1);
assert.equal(madeParts,1);
assert.equal(relationships,14);
assert.equal(pack.models.length,67);
assert.equal(pack.parts.length,36);
assert.equal(index.filter(m=>m.brand==='Samsung').length,67);
assert.equal(new Set(pack.parts.map(p=>p.code)).size,36);
manifest.Samsung.modelCount=67;
manifest.Samsung.recordCount=67;
manifest.Samsung.partCount=36;
manifest.Samsung.physicalPartCount=36;
const nozzle=manifest.Samsung.partTypes.find(x=>x.id==='nozzle');assert.ok(nozzle);nozzle.count++;
manifest.Samsung.note='67 konkrete Samsung-Gerätereferenzen und 36 unterschiedliche physische Zubehör- bzw. Ersatzteilartikel. Zwanzig Modelle haben jeweils herstellerseitig ausdrücklich genannte optionale Zubehörartikel; 47 verbleiben ohne belegte konkrete Zuordnung. Vollständige /WD-Kennung, Zubehörvoraussetzungen und einzelne Geräte-Revisionen prüfen.';
fs.writeFileSync(file,'// Manufacturer-linked models and articles; exact German manufacturer code citations checked 2026-10-08.\nexport const brandPack='+JSON.stringify(pack)+';\n');
fs.writeFileSync(indexFile,'// Samsung and Hoover source-linked device references and compact catalogue metadata.\nexport const newBrandsIndex='+JSON.stringify(index)+';\nexport const newBrandsManifest='+JSON.stringify(manifest)+';\n');
console.log(JSON.stringify({addedModels:madeModels,addedArticles:madeParts,addedRelationships:relationships,samsungModels:pack.models.length,samsungArticles:pack.parts.length,remainingUnassigned:pack.models.filter(m=>!m.partCount).length}));
