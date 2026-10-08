import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const data=JSON.parse(fs.readFileSync(path.join(root,'integrations/samsung-parts-wave1-v1281.json'),'utf8'));
const packFile=path.join(root,'site/src/data/samsung-pack.js');
const idxFile=path.join(root,'site/src/data/new-brands-index.js');
const packHeader='export const brandPack=';
const rawPack=fs.readFileSync(packFile,'utf8');
const pack=JSON.parse(rawPack.split(packHeader)[1].trim().replace(/;\s*$/,''));
const idxHeader='export const newBrandsIndex=';
const manHeader='export const newBrandsManifest=';
const rawIndex=fs.readFileSync(idxFile,'utf8');
const [header,manifestText]=rawIndex.split(manHeader);
const index=JSON.parse(header.split(idxHeader)[1].trim().replace(/;\s*$/,''));
const manifests=JSON.parse(manifestText.trim().replace(/;\s*$/,''));
const manifest=manifests.Samsung;

assert.equal(data.brand,'Samsung');assert.equal(data.market,'DE');
assert.equal(data.baseline.version,'1.28.0');
assert.equal(pack.brand,'Samsung');
assert.equal(pack.models.length,77);
assert.equal(index.filter(x=>x.brand==='Samsung').length,77);
assert.equal(pack.parts.length,36);
assert.equal(manifest.modelCount,77);
assert.equal(manifest.partCount,36);
assert.equal(manifest.physicalPartCount,36);
assert.equal(data.newParts.length,10);
const knownParts=new Set(pack.parts.map(x=>x.code));
console.log(JSON.stringify({baselineSamsungSKUs:[...knownParts].sort(),newCandidateOverlaps:data.newParts.filter(x=>knownParts.has(x.code)).map(x=>x.code)}));
assert.equal(knownParts.size,36);
const originalModels=JSON.stringify(pack.models);
const originalIndex=JSON.stringify(index);
const originalParts=JSON.stringify(pack.parts);
let count={nozzle:0,battery:0};
const allEan=new Set();
for(const item of data.newParts) {
 assert.match(item.code,/^VCA-[A-Z0-9]+(?:\/[A-Z]{2})?$/);
 assert.ok(!knownParts.has(item.code),'SKU duplicate '+item.code);
 assert.equal(new Set([...knownParts,item.code]).size,knownParts.size+1);
 assert.match(item.ean,/^\d{13}$/);
 assert.ok(!allEan.has(item.ean),'EAN collision');
 allEan.add(item.ean);
 assert.ok(['nozzle','battery'].includes(item.partTypeId));
 assert.equal(new URL(item.url).origin,'https://www.samsung.com');
 assert.ok(item.url.startsWith('https://www.samsung.com/de/home-appliance-accessories/'));
 assert.ok(item.url.includes(item.code.toLowerCase().replace('/','-')),'Manufacturer page must name exact article');
 assert.ok(typeof item.compatibility==='string'&&item.compatibility.length>4);
 assert.ok(item.name&&item.notes&&item.specifications);
 const part={
  brand:'Samsung',code:item.code,name:item.name,url:item.url,checkedAt:data.date,
  sourcePageType:'manufacturer-original-accessory-product',
  partTypeId:item.partTypeId,purposeId:item.partTypeId==='battery'?'replacement':'accessory',
  ean:item.ean,manufacturerCompatibilityFamily:item.compatibility,
  specifications:item.specifications,
  relationships:[],attachmentReferences:[],restrictions:[],
  availabilityNote:'Kein verifizierter Händlerpreis, Bestand oder Versanddatum. Geräteausführung und technischen Anschluss vor einer Bestellung beim Hersteller prüfen.',
  sourceCoverage:{
   status:'partial',observedReferences:[],
   note:'Samsung Deutschland bestätigt die Originalzubehörkennung '+item.code+', EAN '+item.ean+' und kompatible Gerätefamilien ('+item.compatibility+'). Ein exakter Gerätecode mit vollständiger Länder-/Revisionskennung ist hier noch nicht belegt. Deshalb keine pauschale technische Teilepassung. '+item.notes
  }
 };
 if(item.partTypeId==='battery'){
  assert.ok(item.specifications.capacityMah>0);
  assert.equal(typeof item.specifications.includesCharger,'boolean');
  part.safetyNotices=['Lithium-Ionen-Akku: Kontakte nicht kurzschließen, beschädigte Akkus nicht verwenden, Transport- und Entsorgungsvorschriften beachten.','Exakten Akkutyp, Ladegerät und Gerätevariante anhand Herstellerangaben abgleichen.'];
 }else{
  assert.ok(item.specifications.bodenart);
 }
 pack.parts.push(part);
 count[item.partTypeId]++;
 knownParts.add(item.code);
}
assert.deepEqual(count,{nozzle:5,battery:5});
assert.equal(JSON.stringify(pack.models),originalModels);
assert.equal(JSON.stringify(index),originalIndex);
assert.equal(JSON.stringify(pack.parts.slice(0,36)),originalParts);
assert.equal(pack.parts.length,46);
manifest.partCount=46;manifest.physicalPartCount=46;
for(const type of manifest.partTypes)if(Object.hasOwn(count,type.id))type.count+=count[type.id];
assert.equal(manifest.partTypes.reduce((n,x)=>n+x.count,0),46,'Physical parts by type must agree with listed parts');
manifest.note='77 konkrete Samsung-Gerätemodelle, 46 individuelle physische Originalzubehör-/Ersatzteilartikel. 10 neue aus Samsung-DE-Produktseiten belegte SKUs (5 Ersatz-Akkus, 5 Bürsten/Wischaufsätze) wurden als herstellerechte Artikel ohne unbestätigte gerätespezifische Teilepassung erfasst; 57 Geräte weiterhin ohne geprüfte Modellartikel-Liste. Herstellerseitige Kompatibilität auf Familienebene ist nicht identisch mit exaktem Länder-/Revisionscode.';
fs.writeFileSync(packFile,'// Samsung original articles: ten additional verified manufacturer SKUs, 2026-10-08; no inferred device fitment.\nexport const brandPack='+JSON.stringify(pack)+';\n');
fs.writeFileSync(idxFile,'// Samsung and Hoover compact model records, article coverage from the Samsung original parts first wave.\n'+idxHeader+JSON.stringify(index)+';\n'+manHeader+JSON.stringify(manifests)+';\n');
console.log(JSON.stringify({addedOriginalArticles:10,batteries:5,brushesOrMopHeads:5,samsungTotal:46,modelsStill:77,modelWithNewParts:0,globalArticles:1940,globalPhysicalParts:1822}));
