import assert from 'node:assert/strict';
import fs from 'node:fs';
import { products, mielePartsCatalog } from '../src/data/catalog.js';
import { mieleSpareRecords } from '../src/data/miele-spare-records.js';
import { mieleOriginalSpareParts, mieleAftermarketParts, mielePartsCoverage, filterParts, scopeMatchesProduct, partIdentity } from '../src/data/miele-parts.js';
import { installationInfo } from '../src/data/miele-guides.js';
import { matchProducts } from '../src/core/matcher.js';

assert.equal(mielePartsCoverage.originalSpareCount,109);
assert.equal(mielePartsCoverage.aftermarketCount,10);
assert.equal(mieleSpareRecords.length,109);
assert.equal(new Set(mielePartsCatalog.map(partIdentity)).size,mielePartsCatalog.length,'one catalog entry per original material number / supplier article');
assert.equal(new Set(mielePartsCatalog.map(p=>p.id)).size,mielePartsCatalog.length);
assert.ok(!mieleSpareRecords.some(p=>/Geschirrspüler/.test(p.description)));
for(const part of [...mieleOriginalSpareParts,...mieleAftermarketParts]){
  assert.ok(mielePartsCatalog.some(p=>partIdentity(p)===partIdentity(part)),'every captured part remains accessible even when device fitment is unconfirmed');
  assert.equal(part.offers.length,0);
  assert.equal(new URL(part.sourceUrl).protocol,'https:');
  assert.ok(part.fitment.evidence.length);
  for(const m of part.manuals||[])assert.equal(new URL(m.url).protocol,'https:');
}
for(const product of products.filter(p=>p.brand==='Miele')){
  assert.equal(new Set(product.parts.map(partIdentity)).size,product.parts.length);
  assert.ok(!(product.candidateParts||[]).some(p=>product.parts.some(p2=>partIdentity(p)===partIdentity(p2))));
  for(const part of product.parts.filter(p=>p.catalogOrigin==='aftermarket')){
    assert.equal(part.fitment.status,'supplier_listed');
    assert.ok(scopeMatchesProduct(part.scope,product));
    assert.ok(part.fitment.evidence.every(s=>s.grade==='B'&&s.type!=='manufacturer'),'aftermarket statements cannot become a Miele approval');
  }
  for(const part of product.candidateParts||[]){
    assert.equal(part.fitment.status,'variant_check_required');
    assert.ok(part.fitment.condition);
  }
  if(product.recordType==='model'){
    assert.equal(new URL(product.imageUrl).hostname,'media.miele.com','use the exact manufacturer photo for each variant');
  }
}
const model=series=>products.find(p=>p.recordType==='model'&&p.vacuumMeta.series===series);
const hx2=model('Triflex HX2'),hx3=model('Triflex HX3'),duoflex=model('Duoflex HX1');
assert.ok(hx2.parts.some(p=>p.id==='miele-part-12431950'));
assert.ok(!hx3.parts.some(p=>p.id==='miele-part-12431950'),'HX1/HX2 prefilter must not leak into HX3');
assert.ok(hx3.parts.some(p=>p.id==='miele-part-13028050'));
assert.ok(!hx2.parts.some(p=>p.id==='miele-part-13028050'));
assert.ok(![hx2,hx3].some(d=>d.parts.some(p=>p.id==='miele-part-12790140')),'HX1-only dust bin must not leak into HX2/HX3');
assert.ok(hx2.parts.some(p=>p.id==='aftermarket-vhbw-889005195'));
assert.ok(!hx3.parts.some(p=>p.tier==='aftermarket'),'no unverified HX3 battery/charger substitution');
assert.ok(!duoflex.parts.some(p=>p.id==='aftermarket-vhbw-889002523'),'supplier typo Duroflex is not a Duoflex compatibility proof');
assert.ok(duoflex.parts.some(p=>p.id==='aftermarket-vhbw-889010451'));
const c3=model('Complete C3'),c2=model('Complete C2');
assert.ok(c3.candidateParts.some(p=>/Elek\.-Saugschlauch/.test(p.name)));
assert.ok(!c3.parts.some(p=>/Elek\.-Saugschlauch/.test(p.name)),'electrical hoses require an electrical/variant check');
assert.ok(!c2.parts.some(p=>p.id==='aftermarket-swirl-swirl-m40-m50-anti-geruch'),'Tango PowerLine is not the explicitly listed Tango EcoLine');
const bagless=model('Boost CX1');
assert.ok(!bagless.parts.some(p=>p.id==='miele-part-6713110'),'cut motor-protection filter must not be inferred for a bagless vacuum');
const unscoped=mielePartsCatalog.find(p=>p.id==='miele-part-9764420');
assert.equal(unscoped.modelIds.length,0,'radio-board holder has no public model-specific mapping');
assert.ok(filterParts(mielePartsCatalog,{query:'09442602'}).some(p=>p.id==='miele-part-9442602'),'material numbers work with the optional leading zero printed by Miele');
assert.equal(filterParts(mielePartsCatalog,{tier:'aftermarket'}).length,10);
assert.ok(filterParts(mielePartsCatalog,{series:'Triflex HX3'},products).every(p=>p.tier==='oem'));
const shared=matchProducts(products,'8720812661139',{limit:100});
assert.ok(shared.length>1&&shared.every(m=>m.score<96),'a shared aftermarket bag EAN never identifies an exact vacuum');

const spring=mieleOriginalSpareParts.find(p=>p.id==='miele-part-12021962');
const springGuide=installationInfo(spring,model('Guard L1'));
assert.equal(springGuide.missing,true,'a lid spring is not given an invented user installation guide');
assert.ok(springGuide.dataSheets.some(m=>m.label==='Produktblatt'));
const hose=c3.parts.find(p=>p.id==='miele-part-10563760');
assert.ok(installationInfo(hose,c3).links.some(m=>/Miele Geräteanleitung/.test(m.label)));
const battery=hx2.parts.find(p=>p.id==='aftermarket-vhbw-889005195');
assert.ok(installationInfo(battery,hx2).links.some(m=>new URL(m.url).hostname==='www.vhbw.de'));
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
assert.ok(!app.includes('.map(renderPart)'),'array indexes must not change card navigation into catalog routes');
assert.match(app,/data-vacuum-photo/);
assert.match(app,/img\.src='\.\/icons\/vacuum\.svg'/,'failed/offline photos get an accessible vacuum fallback');
const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');
for(const rel of ['app-v1.26.8.js','icons/vacuum.svg'])assert.ok(sw.includes(`'./${rel}'`));
console.log(`Miele spare-parts checks passed: ${mielePartsCatalog.length} unique parts, 109 vacuum spares, 10 supplier-linked alternatives, restricted fitment and honest installation coverage.`);
