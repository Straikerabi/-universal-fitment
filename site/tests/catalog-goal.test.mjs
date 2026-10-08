import assert from 'node:assert/strict';
import {products,registerCatalogPack,catalogCoverage,filterCatalog} from '../src/data/catalog.js';
import {brandPack} from '../src/data/rowenta-pack.js';
import {catalogTarget,catalogTargetProgress,deviceBudgetBand} from '../src/data/catalog-plan.js';
import {reviewTypePlate} from '../src/core/typeplate.js';
import {cartQuoteItem,shippingCost,quoteForPart} from '../src/data/miele-commerce.js';
const rowenta=products.filter(p=>p.brand==='Rowenta');
assert.equal(catalogTarget.brands.length,10);assert.equal(catalogTarget.modelsPerBrand,100);assert.equal(catalogTarget.rankingStatus,'unverified');
assert.equal(rowenta.length,272);assert.equal(new Set(rowenta.map(p=>p.id)).size,272);
assert.ok(rowenta.every(p=>p.catalogLoaded===false));
const before=rowenta[0];registerCatalogPack(brandPack);assert.equal(rowenta[0],before);
assert.ok(rowenta.every(p=>p.catalogLoaded===true&&p.identityScope==='model-reference'&&p.manualFinderUrl==='https://www.rowenta.de/bedienungsanleitungen'));
for(const p of rowenta){assert.equal(new URL(p.sources[0].url).hostname,'www.rowenta.de');assert.equal(p.sources[0].retrievedAt,'2026-10-07');assert.ok(!p.pncs.length);for(const part of p.parts){assert.equal(part.brand,'Rowenta');assert.ok(part.fitment.evidence.every(e=>e.retrievedAt==='2026-10-07')); assert.equal(part.fitment.status,'variant_check_required');assert.equal(cartQuoteItem(part,p),null);}}
for(const [price,band] of [[0,'budget'],[150,'budget'],[150.01,'middle'],[350,'middle'],[350.01,'premium']])assert.equal(deviceBudgetBand({deviceQuote:{price,currency:'EUR'}}),band);
for(const price of [NaN,Infinity,-1,'75'])assert.equal(deviceBudgetBand({deviceQuote:{price,currency:'EUR'}}),'unknown');
assert.equal(deviceBudgetBand({parts:[{offers:[{price:30}]}]}),'unknown','a part offer is never a device purchase price');
const priced=rowenta.filter(p=>p.deviceQuote);assert.equal(priced.length,24);
for(const band of ['budget','middle','premium']){const list=filterCatalog({brand:'Rowenta',budget:band});assert.ok(list.length);assert.ok(list.every(p=>deviceBudgetBand(p)===band));}
assert.equal(filterCatalog({brand:'Rowenta',budget:'unknown'}).length,248);assert.equal(filterCatalog({brand:'Rowenta'}).length,272);
const sorted=filterCatalog({brand:'Rowenta',sort:'price'});assert.equal(sorted[0].deviceQuote.price,74.99);assert.equal(sorted.at(-1).deviceQuote,null);
const progress=catalogTargetProgress(catalogCoverage());assert.equal(progress.find(r=>r.brand==='Rowenta').slots,100);assert.equal(progress.find(r=>r.brand==='Rowenta').models,272);assert.equal(progress.find(r=>r.brand==='Philips').active,true);assert.equal(progress.find(r=>r.brand==='Philips').missing,0);
for(const query of ['Rowenta\nModell: RO2913','Rowenta\nModell: RO4931EA','Rowenta\nModell: RO4931EA/410']){const r=reviewTypePlate(query);assert.equal(r.status,'catalog_reference');assert.equal(r.suggestions.length,1);assert.equal(r.suggestions[0].brand,'Rowenta');}
assert.equal(reviewTypePlate('Rowenta\nSeriennummer: RO4931EA').suggestions.length,0);
assert.equal(reviewTypePlate('Bosch\nModell: RO4931EA').suggestions.length,0,'foreign maker cannot use a Rowenta model');
assert.equal(shippingCost('rowenta-parts-de',29.99),null);assert.equal(shippingCost('rowenta-parts-de',30),0);
for(const p of brandPack.parts)assert.ok(p.relationships.every(r=>/^(?:RO|RH)[A-Z0-9]{6}(?:\/[A-Z0-9]{3})?$/.test(r.reference)),'robot listings are excluded');
console.log('Catalog goal checks passed: 272 grouped Rowenta references, 24 device price snapshots, all three budgets, variant review, source/cart boundaries, and ten-brand target gaps.');
