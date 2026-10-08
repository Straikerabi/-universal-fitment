import assert from 'node:assert/strict';
import fs from 'node:fs';
import { products, scenarios, mieleCatalogStats, mieleSeries, filterMieleCatalog } from '../src/data/catalog.js';
import { mieleModelRecords } from '../src/data/miele-model-records.js';
import { mieleOriginalSpareParts, mieleAftermarketParts, scopeMatchesProduct } from '../src/data/miele-parts.js';
import { matchProducts } from '../src/core/matcher.js';
import { extractTypePlateIdentity, isValidGTIN } from '../src/core/identifiers.js';
import { resolveProductQuery } from '../src/data/product-resolver.js';

const models=products.filter(p=>p.brand==='Miele'&&p.recordType==='model');
assert.ok(mieleCatalogStats.modelCount>=50,'at least 50 distinct model names, excluding color variants and family fallbacks');
assert.equal(mieleCatalogStats.modelCount,new Set(models.map(p=>p.model)).size);
assert.equal(mieleCatalogStats.variantCount,models.length);
assert.equal(new Set(products.map(p=>p.id)).size,products.length);
assert.ok(mieleCatalogStats.variantCount>mieleCatalogStats.modelCount);
assert.equal(mieleCatalogStats.familyCount,9,'preserve saved family IDs');
for(const product of models){
  const raw=mieleModelRecords.find(r=>r.material===product.vacuumMeta.materialNumber);
  const material=product.identifiers.find(i=>i.type==='material-number').value;
  const ean=product.identifiers.find(i=>i.type==='ean').value;
  assert.ok(isValidGTIN(ean),`invalid device EAN on ${material}`);
  assert.equal(matchProducts(products,material)[0].product.id,product.id,`material number resolves ${material}`);
  assert.equal(matchProducts(products,ean)[0].product.id,product.id,`EAN resolves ${ean}`);
  assert.equal(matchProducts(products,`0${ean}`)[0].product.id,product.id,'GTIN-14 resolves the same EAN-13 device');
  assert.ok(product.manuals.some(d=>d.label==='Produktblatt'));
  assert.ok(product.manuals.some(d=>/gebrauchsanweisung/i.test(d.label)),'link exact instructions or an explicitly labelled official manual finder');
  assert.ok(product.sources.every(s=>new URL(s.url).hostname==='www.miele.de'));
  assert.equal(new Set(product.parts.map(p=>p.id)).size,product.parts.length);
  for(const part of product.parts){
    assert.equal(part.offers.length,0,'dated source prices must not become live offers');
    const code=part.identifiers.find(i=>i.type==='material-number')?.value;
    const extra=[...mieleOriginalSpareParts,...mieleAftermarketParts].find(p=>p.id===part.id);
    assert.ok(raw.accessories.some(a=>a.material===code)||part.id.startsWith('miele-bag-')||(extra&&scopeMatchesProduct(extra.scope,product)),'every part comes from model accessory references, verified bag mapping, or an explicit spare/supplier scope');
  }
  for(const job of product.jobs){
    if(job.mainPartId) assert.ok(product.parts.some(p=>p.id===job.mainPartId));
    for(const item of job.items) if(item.partId) assert.ok(product.parts.some(p=>p.id===item.partId));
  }
  if(product.vacuumMeta.deviceType!=='bagged'){
    assert.equal(product.vacuumMeta.bagSystem,'none');
    assert.equal(product.stockPlans.length,0,'cordless and bagless vacuums have no bag stock plan');
    assert.ok(!product.parts.some(p=>/staubsaugerbeutel/i.test(p.kind)));
  }
}
const l1=filterMieleCatalog({series:'Guard L1'});
assert.equal(l1.length,10);
assert.ok(l1.every(p=>p.vacuumMeta.bagSystem==='TU'));
assert.equal(filterMieleCatalog({bagSystem:'CO'}).length,8);
assert.equal(filterMieleCatalog({deviceType:'cordless'}).length,19);
assert.equal(filterMieleCatalog({deviceType:'bagless'}).length,13);
assert.equal(filterMieleCatalog({series:'Guard L1',deviceType:'cordless'}).length,0);
assert.ok(mieleSeries.includes('Compact C2'));
for(const scenario of scenarios) assert.ok(products.some(p=>p.id===scenario.productId));
for(const [plate,id] of [
  [['Miele','Mat.-Nr.: 12560300','Typ: SVZF0','Seriennummer: 20D14W81E04831820UB'],'vac-miele-model-12560300'],
  [['Miele','EAN: 4002516925668','Typ: SWDL0'],'vac-miele-model-12887840']
]){
  const identity=extractTypePlateIdentity(plate);
  assert.equal(matchProducts(products,identity.primary)[0]?.product.id,id);
}
assert.ok(extractTypePlateIdentity(['Miele Triflex HX3']).candidates.includes('TRIFLEX HX3'));
assert.ok(extractTypePlateIdentity(['Miele SWDL0']).candidates.includes('SWDL0'));
const exact=await resolveProductQuery(products,'12560300',{fetchFn:async()=>{throw new Error('known model must resolve offline');}});
assert.equal(exact.usedExternal,false);
const bag=matchProducts(products,'12557060',{limit:100});
assert.ok(bag.length>1,'a shared bag code must show multiple possible devices');
assert.ok(bag.every(x=>x.score<96),'a bag barcode must never be an exact device identity');
assert.ok(bag.filter(x=>x.product.recordType==='model').every(x=>x.product.vacuumMeta.bagSystem==='TU'));
const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');
assert.ok(sw.includes("'./app-v1.26.8.js'"));
assert.ok(fs.readFileSync(new URL('../app-v1.26.8.js',import.meta.url),'utf8').includes('12560300'));
console.log(`Miele model checks passed: ${mieleCatalogStats.modelCount} models, ${models.length} variants, exact identifier matching, compatible parts, filter combinations and OCR.`);
