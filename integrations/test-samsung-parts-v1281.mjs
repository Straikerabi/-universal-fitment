import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const src=JSON.parse(fs.readFileSync(path.join(root,'integrations/samsung-parts-wave1-v1281.json'),'utf8'));
const pack=JSON.parse(fs.readFileSync(path.join(root,'site/src/data/samsung-pack.js'),'utf8').split('export const brandPack=')[1].trim().replace(/;\s*$/,''));
const s=fs.readFileSync(path.join(root,'site/src/data/new-brands-index.js'),'utf8');
const ix=JSON.parse(s.split('export const newBrandsIndex=')[1].split(';\nexport const newBrandsManifest=')[0]);
const manifest=JSON.parse(s.split('export const newBrandsManifest=')[1].trim().replace(/;\s*$/,'')).Samsung;
const codeSet=new Set(pack.parts.map(x=>x.code));
assert.equal(pack.models.length,77);
assert.equal(ix.filter(x=>x.brand==='Samsung').length,77);
assert.equal(pack.parts.length,46);
assert.equal(codeSet.size,46);
assert.equal(manifest.partCount,46);
assert.equal(manifest.physicalPartCount,46);
assert.equal(manifest.modelCount,77);
assert.equal(manifest.partTypes.reduce((sum,t)=>sum+t.count,0),46);
assert.equal(src.newParts.length,10);
const partByCode=new Map(pack.parts.map(x=>[x.code,x]));
for(const x of src.newParts){
 const p=partByCode.get(x.code);
 assert.ok(p,x.code);
 assert.equal(p.ean,x.ean);
 assert.equal(p.url,x.url);
 assert.equal(p.partTypeId,x.partTypeId);
 assert.equal(p.checkedAt,src.date);
 assert.equal(p.manufacturerCompatibilityFamily,x.compatibility);
 assert.equal(p.relationships.length,0,'Unverified specific model fitment forbidden');
 assert.equal(p.sourceCoverage.observedReferences.length,0);
 assert.ok(!Object.hasOwn(p,'price')&&!Object.hasOwn(p,'stock')&&!Object.hasOwn(p,'shipping'));
 assert.match(p.sourceCoverage.note,/keine pauschale technische Teilepassung/i);
 assert.equal(p.specifications?.capacityMah,x.specifications?.capacityMah);
 if(x.partTypeId==='battery'){
  assert.equal(p.specifications.includesCharger,x.specifications.includesCharger);
  assert.ok(p.safetyNotices.some(x=>x.includes('Lithium')));
 }
}
const battery=src.newParts.filter(x=>x.partTypeId==='battery');
assert.equal(battery.length,4);
assert.equal(new Set(battery.map(x=>x.ean)).size,4,'Distinct original SKUs with distinct manufacturer EAN');
assert.ok(src.newParts.every(x=>x.url.includes(x.code.toLowerCase().replace('/','-'))),'Manufacturer URL must match product');
const samsungWithLinks=pack.models.filter(x=>x.partCount).length;
assert.equal(samsungWithLinks,20,'Do not infer accessories by device family');
console.log('Samsung OEM accessory integration passed: 10 distinct manufacturer products, 4 batteries, 6 brushes, zero invented model fitments, unchanged 77 devices and 20 linked device profiles, 46 total Samsung articles.');
