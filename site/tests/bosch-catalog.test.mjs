import assert from 'node:assert/strict';
import {products,partsCatalog,mielePartsCatalog,boschPartsCatalog,boschCatalogStats,filterCatalog} from '../src/data/catalog.js';
import {boschModelRecords,boschPartRecords} from '../src/data/bosch-records.js';
import {partIdentity,partBrands,filterParts} from '../src/data/miele-parts.js';
import {matchProducts,matchReason} from '../src/core/matcher.js';
import {isValidGTIN} from '../src/core/identifiers.js';
import {parseBoschENumber} from '../src/core/bosch-identity.js';
import {quoteForPart,cartQuoteItem} from '../src/data/miele-commerce.js';
import {installationInfo} from '../src/data/miele-guides.js';
const models=products.filter(p=>p.brand==='Bosch');
assert.equal(models.length,60);assert.equal(boschCatalogStats.modelCount,60);assert.equal(new Set(models.map(p=>p.model)).size,60);assert.equal(boschCatalogStats.variantCount,0,'unverified /xx indices are not counted as device variants');
assert.equal(boschPartsCatalog.filter(p=>p.tier==='oem').length,101);assert.equal(boschPartsCatalog.filter(p=>p.tier==='aftermarket').length,2);
assert.equal(new Set(partsCatalog.map(partIdentity)).size,partsCatalog.length,'part keys do not collide across manufacturers');
assert.equal(new Set(products.map(p=>p.id)).size,products.length);
for(const product of models){
 const raw=boschModelRecords.find(r=>r.code===product.model);assert.ok(raw);assert.ok(parseBoschENumber(product.model));
 assert.equal(product.identityScope,'model-reference');assert.equal(product.vacuumMeta.materialNumber,null,'no numeric material or index invented for a Bosch model');
 assert.ok(isValidGTIN(raw.ean),product.model);assert.ok(matchProducts(products,raw.ean,{limit:100}).some(x=>x.product.id===product.id));
 assert.equal(matchProducts(products,product.model)[0].product.id,product.id);assert.match(matchReason(product,product.model),/Modellreferenz.*Index/);
 assert.ok(product.imageUrl.startsWith('https://media3.bsh-group.com/'));
 assert.ok(product.sources.every(s=>new URL(s.url).hostname==='www.bosch-home.com'));
 assert.ok(product.manuals.some(m=>m.label==='Gebrauchsanweisung'));assert.ok(product.manuals.some(m=>m.label==='Produktblatt'));
 for(const m of product.manuals){const u=new URL(m.url);assert.equal(u.protocol,'https:');assert.ok(['www.bosch-home.com','media3.bsh-group.com','media3.bosch-home.com'].includes(u.hostname));}
 for(const part of product.parts){
  assert.ok(partBrands(part).includes('Bosch'));assert.ok(!part.id.startsWith('miele-'));assert.equal(part.offers.length,0);
  assert.equal(part.fitment.status,'variant_check_required','the /xx index is still open');assert.equal(cartQuoteItem(part,product),null,'a dated price does not approve an unresolved device index');
  const codes=part.identifiers.filter(i=>i.type==='manufacturer-article').map(i=>i.value);assert.ok(codes.some(code=>raw.accessoryCodes.includes(code)),'every OEM relationship is present in that exact manufacturer model list');
 }
 for(const part of product.candidateParts){assert.equal(part.tier,'aftermarket');assert.ok(product.model.startsWith('BGL8SIL'));assert.equal(part.fitment.status,'variant_check_required');}
 if(product.vacuumMeta.deviceType!=='bagged'){assert.equal(product.vacuumMeta.bagSystem,'none');assert.ok(!product.parts.some(p=>/staubbeutel/i.test(p.name)));}
 for(const job of product.jobs)for(const item of job.items)assert.ok(!item.partId||product.parts.some(p=>p.id===item.partId));
}
for(const part of boschPartsCatalog){
 assert.equal(part.offers.length,0);assert.ok(partBrands(part).includes('Bosch'));assert.ok(!mielePartsCatalog.some(p=>p.id===part.id));
 if(part.tier==='oem'){
  const records=boschPartRecords.filter(r=>r.material===part.identifiers.find(i=>i.type==='material-number')?.value);if(!records.length){assert.equal(quoteForPart(part),null);assert.equal(part.modelIds.length,0);assert.equal(part.fitment.status,'catalog_only');assert.equal(new URL(part.sourceUrl).hostname,'www.bosch-home.com');continue;}
  const q=quoteForPart(part);assert.equal(q.partKey,partIdentity(part));assert.equal(q.market,'DE');assert.equal(q.delivery,null);assert.ok(Number.isFinite(Date.parse(q.checkedAt)));assert.ok(q.price===null||typeof q.price==='number');
 }else assert.ok(part.fitment.evidence.every(s=>s.type==='aftermarket-manufacturer'&&s.grade==='B'));
}
assert.equal(filterCatalog({brand:'Bosch',deviceType:'bagged'}).length,22);assert.equal(filterCatalog({brand:'Bosch',deviceType:'bagless'}).length,18);assert.equal(filterCatalog({brand:'Bosch',deviceType:'cordless'}).length,20);
assert.equal(filterCatalog({brand:'Miele'}).length,62);assert.equal(filterCatalog({brand:'Bosch',series:'Guard M1'}).length,0);
assert.equal(filterParts(partsCatalog,{brand:'Bosch'}).length,103);assert.equal(filterParts(partsCatalog,{brand:'Miele'}).length,mielePartsCatalog.length);
const bag=boschPartsCatalog.find(p=>p.identifiers.some(i=>i.value==='BBZ41FGALL')),device=models.find(p=>p.model==='BGB6MPOW');assert.ok(installationInfo(bag,device).links.some(l=>/Bosch Geräteanleitung/.test(l.label)));
console.log('Bosch catalog checks passed: 60 source-linked model references, 101 unique original articles, 2 narrow Swirl sources, manufacturer-list relationships, brand filters and explicit open indices.');
