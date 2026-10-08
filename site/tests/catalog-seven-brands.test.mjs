import assert from 'node:assert/strict';
import {products,partsCatalog,optionalCatalogBrands,catalogBrands,catalogStats,catalogCoverage,brandManifest,registerCatalogPack,filterCatalog} from '../src/data/catalog.js';
import {brandPack as philips} from '../src/data/philips-pack.js';
import {brandPack as siemens} from '../src/data/siemens-pack.js';
import {parseSiemensENumber,reviewSiemensENumber,siemensServiceLink,parsePhilipsModelReference} from '../src/core/brand-identity.js';
import {reviewTypePlate,reviewScannedCode} from '../src/core/typeplate.js';
import {createCatalogLoader,brandsForBackup} from '../src/core/catalog-loader.js';
import {partIdentity,partCategory} from '../src/data/miele-parts.js';
import {installationInfo} from '../src/data/miele-guides.js';
import {installationTime} from '../src/data/miele-installation-times.js';
import {cartQuoteItem,quoteForPart,canSelectQuote,singleQuoteTotal,shippingCost} from '../src/data/miele-commerce.js';
import {catalogTargetProgress,deviceBudgetBand} from '../src/data/catalog-plan.js';
import {createBackup,reviewBackup} from '../src/core/backup.js';
import {buildHandoffPlan} from '../src/core/handoff.js';

assert.deepEqual(catalogBrands,['Miele','Bosch','Dyson','AEG','Rowenta','Philips','Siemens','Samsung','Hoover','Vorwerk']);
assert.deepEqual(new Set(optionalCatalogBrands),new Set(['AEG','Dyson','Rowenta','Philips','Siemens','Vorwerk','Samsung','Hoover']));
assert.equal(catalogStats.modelCount,870);assert.equal(catalogStats.recordCount,881);
assert.equal(philips.models.length,140);assert.equal(siemens.models.length,101);
const refs=new Map(products.filter(p=>['Philips','Siemens'].includes(p.brand)).map(p=>[p.id,p]));
assert.ok([...refs.values()].every(p=>p.catalogLoaded===false));
const countBefore=partsCatalog.length;
const invalid=structuredClone(siemens);invalid.parts[0].relationships.push({code:'VSNOTINCATALOG',model:'VSNOTINCATALOG',reference:'VSNOTINCATALOG/01',url:invalid.parts[0].url});
assert.throws(()=>registerCatalogPack(invalid));assert.equal(partsCatalog.length,countBefore);
assert.ok([...refs.values()].every(p=>!p.catalogLoaded),'invalid pack registration is atomic');
let imports=0;
const loader=createCatalogLoader({packs:{Philips:'philips',Siemens:'siemens'},register:registerCatalogPack,importModule:async name=>{imports++;return {brandPack:name==='philips'?philips:siemens};}});
await Promise.all([loader.ensure('Philips'),loader.ensure('Siemens'),loader.ensure('Siemens')]);assert.equal(imports,2);
assert.equal(partsCatalog.length,countBefore+philips.parts.length+siemens.parts.length);
registerCatalogPack(siemens);assert.equal(partsCatalog.length,countBefore+philips.parts.length+siemens.parts.length);
assert.equal(new Set(partsCatalog.map(partIdentity)).size,partsCatalog.length,'same BSH number stays scoped to its manufacturer');
assert.ok(siemens.parts.length>=400,'named articles, not unidentified BOM positions');
assert.equal(philips.parts.length,104);
const legacyFilter=partsCatalog.find(p=>p.id==='miele-part-6713110');
assert.ok(legacyFilter);assert.equal(installationTime(legacyFilter).status,'estimate','existing Miele filter estimates remain available after the new brand guard');
for(const pack of [philips,siemens]){
 const devices=filterCatalog({brand:pack.brand}),coverage=catalogCoverage().find(r=>r.brand===pack.brand);
 assert.equal(coverage.models,pack.models.length);assert.equal(coverage.parts,pack.parts.length);
 assert.equal(coverage.manuals,devices.filter(p=>p.manuals.some(m=>m.label==='Gebrauchsanweisung')).length);
 assert.equal(coverage.parts,brandManifest[pack.brand].partCount);
 for(const device of devices){
  assert.equal(device,refs.get(device.id));assert.equal(device.identityScope,'model-reference');assert.equal(device.catalogLoaded,true);
  assert.equal(device.sources[0].retrievedAt,'2026-10-07');assert.equal(device.vacuumMeta.materialNumber,null);
  assert.equal(device.partCount,device.parts.length);
  assert.ok(device.partListCoverage.note);assert.equal(typeof device.partListCoverage.note,'string');
  for(const manual of device.manuals)assert.equal(new URL(manual.url).protocol,'https:');
  for(const part of device.parts){
   assert.equal(part.brand,device.brand);assert.equal(part.fitment.status,'variant_check_required');
   assert.equal(cartQuoteItem(part,device,Date.parse('2026-10-07T08:00:00Z')),null,'model and price never approve a part');
   assert.equal(installationTime(part).status,'unknown','no invented installation duration');
   assert.ok(part.relationships.some(r=>r.code===device.model));
   assert.ok(part.fitment.evidence.every(e=>e.retrievedAt==='2026-10-07'));
  }
 }
 for(const raw of pack.parts){
  assert.equal(raw.sourceDeviceCategory,'Staubsauger');assert.ok(raw.name&&!/^Originalartikel \d/i.test(raw.name));
  assert.ok(raw.relationships.every(r=>pack.models.some(m=>m.code===r.code)));
  assert.ok(raw.relationships.every(r=>new URL(r.url).protocol==='https:'));
 }
 for(const part of partsCatalog.filter(p=>p.brand===pack.brand))assert.equal(installationTime(part).status,'unknown','global catalog cards must not invent time for an unreviewed device');
}

const s=products.find(p=>p.id==='vac-siemens-model-vsz7a400');
assert.deepEqual(s.deviceReferences,['VSZ7A400/17'],'returned manufacturer index is preserved after redirect');
assert.equal(reviewSiemensENumber(s,'vsz7a400 / 17').status,'listed');
assert.equal(reviewSiemensENumber(s,'VSZ7A400/08').status,'unlisted_index');
assert.equal(reviewSiemensENumber(s,'VSZ7A400').status,'index_open');
assert.equal(reviewSiemensENumber(s,'VS06A111/13').status,'different_model');
for(const input of ['BGB6MPOW/03','VSZ7A400/1','VSZ7A400/170','VSZ7A400/xx','VSZ7A400/17?','00123456','VZ16GALL/01']){
 assert.equal(parseSiemensENumber(input),null,input);assert.equal(reviewSiemensENumber(s,input).status,'invalid');
}
assert.equal(siemensServiceLink('VSZ7A400'),null);
assert.equal(siemensServiceLink('VSZ7A400/08').url,'https://www.siemens-home.bsh-group.com/de/de/productservice/VSZ7A400-08');
assert.equal(s.partListCoverage.reference,'VSZ7A400/17');
assert.equal(s.partListCoverage.sourcePositions,50);
assert.equal(s.partListCoverage.namedPositions+s.partListCoverage.unresolvedPositions,50);
assert.match(s.spareFinderUrl,/VSZ7A400-17$/);
assert.ok(s.parts.length>10);
assert.ok(s.parts.some(part=>part.relationships.some(r=>r.code==='VSZ7A400'&&r.position)));
for(const part of s.parts){
 const rows=part.relationships.filter(r=>r.code==='VSZ7A400');
 assert.ok(rows.every(r=>r.reference==='VSZ7A400/17'));
 assert.ok(rows.every(r=>r.position?new URL(r.url).pathname.includes('/spare-parts-list/'):new URL(r.url).pathname.includes('/productservice/')));
 assert.match(part.fitment.condition,/VSZ7A400\/17/);assert.doesNotMatch(part.fitment.condition,/VSZ7A400\/08/);
}
assert.ok(s.manuals.some(m=>m.kind==='parts-diagram'));
const electrical=products.filter(p=>p.brand==='Siemens').flatMap(p=>p.parts).find(p=>p.professionalOnly&&partCategory(p)==='Motoren & Elektrik');
assert.ok(electrical);assert.equal(installationInfo(electrical,s).links.some(m=>m.label.includes('Geräteanleitung')),false,'ordinary device care manual is not a guide to internal electrical repair');
for(const raw of siemens.parts){
 assert.equal(new URL(raw.url).hostname,'www.siemens-home.bsh-group.com');
 assert.ok(/^(?:\d{8}|VZ[A-Z0-9]+)$/.test(raw.code));
 for(const r of raw.relationships){
  assert.ok(r.reference===r.code||/^VS[A-Z0-9]+\/\d{2}$/.test(r.reference));
  if(r.position){assert.match(r.reference,/\/\d{2}$/);assert.match(r.url,/spare-parts-list\//);}
 }
}
const siemensQuotes=partsCatalog.filter(p=>p.brand==='Siemens'&&quoteForPart(p));
assert.ok(siemensQuotes.length>100);
for(const part of siemensQuotes){const q=quoteForPart(part);assert.ok(q.price>0);assert.equal(q.market,'DE');assert.equal(q.currency,'EUR');assert.equal(q.partKey,partIdentity(part));assert.equal(q.stock,'unknown');assert.equal(q.delivery,null);assert.equal(canSelectQuote(q,Date.parse('2026-10-07T08:00:00Z')),false);assert.equal(singleQuoteTotal(q),null);}
const priced=filterCatalog({brand:'Siemens'}).filter(p=>p.deviceQuote);assert.equal(priced.length,10);
assert.equal(products.find(p=>p.model==='VS06A111').deviceQuote.price,99.99);
for(const band of ['budget','middle'])assert.ok(filterCatalog({brand:'Siemens',budget:band}).length);
assert.equal(filterCatalog({brand:'Siemens',budget:'unknown'}).length,91);
assert.ok(priced.every(p=>['budget','middle','premium'].includes(deviceBudgetBand(p))));
assert.ok(filterCatalog({brand:'Philips'}).every(p=>deviceBudgetBand(p)==='unknown'));
for(const [subtotal,cost] of [[0,4.70],[19.99,4.70],[20,5.95],[49.99,5.95],[50,0]])assert.equal(shippingCost('siemens-de',subtotal),cost);
assert.equal(shippingCost('philips-home-de',19.99),null);assert.equal(shippingCost('philips-home-de',20),0);

const p=products.find(p=>p.id==='vac-philips-model-fc9745'),filter=p.parts.find(a=>a.identifiers[0].value==='FC8003/01');
assert.ok(filter);assert.equal(filter.id,'philips-part-fc8003_2F01');assert.equal(quoteForPart(filter).price,18.99,'positive price actually visible in the DE maker article page');
assert.match(filter.availabilityNote,/nicht auf Lager/);
assert.ok(installationInfo(filter,p).links.some(m=>m.label.includes('Philips Geräteanleitung')));
assert.equal(products.find(p=>p.model==='FC9003').vacuumMeta.bagSystem,'unknown');
assert.equal(products.find(p=>p.model==='XC8043').vacuumMeta.deviceType,'cordless');
assert.equal(parsePhilipsModelReference('fc9745 / 09r1').full,'FC9745/09R1');
for(const input of ['FC9745/9','FC9745/009','FC9745/09R','FC9745/09R10','FC9745/09?','CP0766/01'])assert.equal(parsePhilipsModelReference(input),null,input);
assert.equal(philips.parts.find(p=>p.code==='CP0542/01').relationships.length,0,'no exact model table means catalog-only');

for(const [text,id] of [
 ['Siemens\nE-Nr.: VSZ7A400/17','vac-siemens-model-vsz7a400'],
 ['Siemens\nVSZ7A400/08','vac-siemens-model-vsz7a400'],
 ['Philips\nModell: FC9745/09','vac-philips-model-fc9745'],
 ['Philips\nFC9745/09R1','vac-philips-model-fc9745'],
 ['Philips\nProdukt-Nr.: XD3112/09','vac-philips-model-xd3112'],
]){const r=reviewTypePlate(text);assert.equal(r.status,'catalog_reference',text);assert.equal(r.suggestions.length,1,text);assert.equal(r.suggestions[0].id,id);}
for(const text of ['Siemens\nSeriennummer: VSZ7A400/17','Philips\nFD: FC9745/09','Bosch\nE-Nr.: VSZ7A400/17','Siemens\nE-Nr.: BGB6MPOW/03','AEG\nModell: FC9745/09'])assert.equal(reviewTypePlate(text).suggestions.length,0,text);
assert.equal(reviewTypePlate('Siemens\nE-Nr.: VSZ7A400/17\nE-Nr.: VSZ7A400/08').status,'conflict');
assert.equal(reviewTypePlate('Philips\nModell: FC9745/99').status,'unresolved');
const partReview=reviewScannedCode('FC8003/01');assert.equal(partReview.status,'part_only');assert.equal(partReview.suggestions.length,0);assert.equal(partReview.partSuggestions[0].id,filter.id);

assert.deepEqual(new Set(brandsForBackup({saved:[s.id,p.id]},products)),new Set(['Siemens','Philips']));
const note={key:'philips-unpriced',productId:p.id,partId:filter.id,partKey:partIdentity(filter),sourceUrl:filter.sourceUrl,fitmentStatus:'variant_check_required',price:null};
const restored=reviewBackup(JSON.stringify(createBackup({saved:[p.id,s.id]},[note],{})));
assert.equal(restored.summary.devices,2);assert.equal(restored.cart.length,1);assert.equal(restored.cart[0].partId,filter.id);assert.equal(restored.cart[0].price,null);
assert.equal(restored.cart[0].sourceUrl,filter.sourceUrl,'slash-containing part code preserves direct manufacturer handoff');
const handoff=buildHandoffPlan(restored.cart);assert.equal(handoff.total,null);assert.equal(handoff.groups[0].lines[0].partNumber,'FC8003/01');
const progress=catalogTargetProgress(catalogCoverage());assert.equal(progress.reduce((n,r)=>n+r.slots,0),657);assert.equal(progress.filter(p=>!p.active).length,0);

console.log(`Catalog brand checks passed: 140 Philips / 101 Siemens references, ${philips.parts.length+siemens.parts.length} named original articles, full-index boundaries, manuals/drawings, device budgets, unknown-stock price gates and stable handoff/backup.`);
