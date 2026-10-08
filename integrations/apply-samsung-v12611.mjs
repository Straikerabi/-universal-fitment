import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=process.cwd();
const evidence=JSON.parse(fs.readFileSync(path.join(root,'integrations/samsung-evidence-v12611.json'),'utf8'));
const packFile=path.join(root,'site/src/data/samsung-pack.js');
const indexFile=path.join(root,'site/src/data/new-brands-index.js');
const packSource=fs.readFileSync(packFile,'utf8');
const packPrefix='export const brandPack=';
assert.ok(packSource.includes(packPrefix));
const pack=JSON.parse(packSource.split(packPrefix)[1].trim().replace(/;\s*$/,''));
const indexSource=fs.readFileSync(indexFile,'utf8');
const idxPrefix='export const newBrandsIndex=';
const manifestPrefix='export const newBrandsManifest=';
assert.ok(indexSource.includes(idxPrefix) && indexSource.includes(manifestPrefix));
const [indexJson,manifestJson]=indexSource.split(manifestPrefix);
const idx=JSON.parse(indexJson.split(idxPrefix)[1].trim().replace(/;\s*$/,''));
const manifest=JSON.parse(manifestJson.trim().replace(/;\s*$/,''));
assert.equal(pack.brand,'Samsung');
assert.equal(pack.models.length,66);
assert.equal(pack.parts.length,34);
assert.equal(manifest.Samsung.partCount,34);
const modelMap=new Map(pack.models.map(m=>[m.code,m]));
const partsMap=new Map(pack.parts.map(p=>[p.code,p]));
assert.equal(modelMap.size,66);
assert.equal(partsMap.size,34);
assert.equal(evidence.models.length,4);
let relationships=0, createdArticles=0;
for(const source of evidence.models){
 const full=source.model;
 const modelCode=full.split('/')[0];
 const model=modelMap.get(modelCode);
 assert.ok(model,'Model not in catalog: '+full);
 assert.ok((model.deviceReferences||[]).includes(full),'Different country suffix from manufacturer source: '+full);
 assert.ok(!model.partCount,'Model already has assigned parts: '+full);
 assert.ok(source.url.startsWith('https://www.samsung.com/de/vacuum-cleaners/stick/'));
 assert.ok(source.url.endsWith(full.toLowerCase().replace('/','-')+'/'));
 assert.equal(source.codes.length,new Set(source.codes).size);
 model.url=source.url;
 model.guideUrl=source.url;
 model.partsUrl=source.url;
 model.checkedAt=evidence.date;
 model.sourceNote='Deutsche Samsung-Geräteseite mit ausdrücklich aufgeführten optionalen Zubehörartikeln. Das ist keine vollständige Ersatzteilliste und keine technische Passungsfreigabe.';
 model.partCount=source.codes.length;
 model.physicalPartCount=source.codes.length;
 model.partListCoverage={sourceUrl:source.url,note:source.codes.length+' ausdrücklich vom Hersteller gelistete optionale Zubehörartikel für '+full+'. Varianten, Zubehörvoraussetzungen und Anschlüsse selbst prüfen; Artikelpreise und Bestände sind nicht verifiziert.'};
 const entry=idx.find(m=>m.brand==='Samsung'&&m.code===modelCode);
 assert.ok(entry,'Missing lightweight model index: '+modelCode);
 for(const key of ['url','guideUrl','partsUrl','checkedAt','sourceNote','partCount','physicalPartCount'])entry[key]=model[key];
 for(const partCode of source.codes){
   let part=partsMap.get(partCode);
   if(!part){
     assert.equal(partCode,'VCA-SABA95','Do not create an unsupported part code');
     part={brand:'Samsung',code:partCode,name:'Slim Action Bürste VCA-SABA95',url:source.url,
       sourcePageType:'device-optional-accessories',checkedAt:evidence.date,
       relationships:[],partTypeId:'nozzle',attachmentReferences:[],restrictions:[],
       sourceCoverage:{status:'partial',note:'Original-Zubehörkennung von deutscher Samsung-Geräteseite für vollständiges Modell /WA. Nur optional gelistet; Ausführungs- und Anschlussprüfung erforderlich.',observedReferences:[]}};
     pack.parts.push(part);
     partsMap.set(partCode,part);
     createdArticles++;
   }
   assert.ok(!part.relationships?.some(r=>r.reference===full),'No duplicate relationship '+partCode+' '+full);
   part.relationships??=[];
   part.relationships.push({code:modelCode,model:modelCode,reference:full,url:source.url,checkedAt:evidence.date,basis:'manufacturer-device-optional-accessories'});
   part.sourceCoverage??={status:'partial',observedReferences:[]};
   const observed=[...new Set(part.relationships.map(r=>r.reference).filter(Boolean))];
   part.sourceCoverage.observedReferences=observed;
   part.sourceCoverage.note='Samsung nennt '+partCode+' in den optionalen Zubehörlisten für '+observed.join(', ')+'. Vollständige Modellkennung, Zubehörvariante, Anschlüsse und Lieferumfang prüfen. Keine pauschale Freigabe für andere Ausführungen.';
   if(['VCA-SPA95/GL','VCA-SPW95/VT','VCA-SPW95'].includes(partCode)){
      assert.ok(part.attachmentReferences?.length,'Wipe consumables require specific mop attachment');
   }
   if(partCode==='VCA-ADB952')assert.ok(part.attachmentReferences?.length,'Clean station bags require station');
   relationships++;
 }
}
assert.equal(relationships,36);
assert.equal(createdArticles,1);
assert.equal(pack.parts.length,35);
assert.equal(modelMap.size,pack.models.length);
assert.equal(new Set(pack.parts.map(p=>p.code)).size,35);
manifest.Samsung.partCount=35;
manifest.Samsung.physicalPartCount=35;
const nozzle=manifest.Samsung.partTypes.find(t=>t.id==='nozzle');
assert.ok(nozzle);
nozzle.count+=1;
manifest.Samsung.note='66 genaue Samsung-Modellreferenzen, 35 individuelle physische Artikel. 17 /WD- oder /WA-Modelle haben jeweils explizite optionale Zubehörlisten. 49 Geräte bleiben ohne konkrete Artikelzuordnung; Modell-Ländercode, optionale Anbauten und technische Passung gesondert prüfen.';
fs.writeFileSync(packFile,'// Source-linked manufacturer model references and articles, checked 2026-10-08.\nexport const brandPack='+JSON.stringify(pack)+';\n');
fs.writeFileSync(indexFile,'// Manufacturer model references and lightweight catalogue coverage for Samsung and Hoover.\nexport const newBrandsIndex='+JSON.stringify(idx)+';\nexport const newBrandsManifest='+JSON.stringify(manifest)+';\n');
console.log(JSON.stringify({imported_models:evidence.models.map(m=>m.model),added_relationships:relationships,added_unique_parts:createdArticles,samsung_models:66,samsung_parts:pack.parts.length,samsung_models_without_parts:pack.models.filter(m=>!m.partCount).length}));
