import assert from 'node:assert/strict';
import {products,partsCatalog,boschPartsCatalog} from '../src/data/catalog.js';
import {reviewTypePlate} from '../src/core/typeplate.js';
import {createBoschContext,reviewedBoschENumber,boschPartReviewText} from '../src/core/bosch-context.js';
import {filterParts,partFilterOptions} from '../src/data/miele-parts.js';
import {cartQuoteItem} from '../src/data/miele-commerce.js';

const a=products.find(p=>p.model==='BBS611BSC'),b=products.find(p=>p.model==='BBS611PCK'),miele=products.find(p=>p.id==='vac-miele-model-12560300');
const context=createBoschContext();
for(const p of products.filter(p=>p.brand==='Bosch')){
 const review=reviewTypePlate(`Bosch\nE-Nr.: ${p.model} / 02\nFD: 9912\nZ-Nr.: PRIVATE-SERIAL`);
 assert.equal(reviewedBoschENumber(review,p),`${p.model}/02`);
 context.rememberReview(review,p);
 assert.equal(context.get(p).eNumber,`${p.model}/02`);
 assert.ok(!JSON.stringify(context.get(p)).includes('PRIVATE-SERIAL'));
 assert.ok(!JSON.stringify(context.get(p)).includes('9912'));
 assert.equal(context.get(miele),null);
 context.retainForRoute('product',p.id,products);assert.ok(context.get(p));
}
const review=value=>reviewTypePlate(value);
assert.equal(reviewedBoschENumber(review('E-Nr.: BBS611BSC/02'),a),null);
assert.equal(reviewedBoschENumber(review('E-Nr.: BBS611BSC/02'),a,{brandConfirmed:true}),'BBS611BSC/02');
for(const text of ['Bosch BBS611BSC','Bosch E-Nr.: BBS611BSC/2','Bosch E-Nr.: BBS611BSC/002',
 'Bosch E-Nr.: BBS611BSC/02 E-Nr.: BBS611BSC/03','Bosch E-Nr.: BBS611PCK/02',
 'Bosch E-Nr.: BBS611BSC/02 EAN: 1234567890123','Miele Bosch E-Nr.: BBS611BSC/02',
 'Bosch Z-Nr.: BBS611BSC/02']){
 context.set(a,'BBS611BSC/02');context.rememberReview(review(text),a,{brandConfirmed:true});
 assert.equal(context.get(a),null,text);
}
for(const value of ['BBS611PCK/02','BBS611BSC/2','BBS611BSC','https://evil.test','BBS611BSC/02 FD: 1234']){
 context.set(a,'BBS611BSC/02');assert.equal(context.set(a,value),null);assert.equal(context.get(a),null);
}
assert.equal(context.set(a,' bbs611bsc / 02 ').eNumber,'BBS611BSC/02');
const copy=context.get(a);copy.eNumber='BBS611PCK/99';copy.serviceLink.url='https://evil.test';
assert.equal(context.get(a).eNumber,'BBS611BSC/02');assert.match(context.get(a).serviceLink.url,/BBS611BSC-02$/);
const part=a.parts[0];
for(const [route,param] of [['product',a.id],['parts',a.id],['prices',a.id],['marketplaces',a.id],['passport',a.id],['part',`${a.id}:${part.id}`],['job',`${a.id}:${a.jobs[0].id}`]]){
 context.set(a,'BBS611BSC/02');context.retainForRoute(route,param,products);assert.ok(context.get(a),route);
}
for(const [route,param] of [['home',''],['scan',''],['plate-review',''],['cart',''],['checkout',''],['backup',''],['access',''],
 ['prices',''],['parts',''],['marketplaces',''],['shipping',''],['catalog-part',part.id],['product',b.id],
 ['part',`${a.id}:unknown-part`],['part',`${b.id}:${part.id}`],['job',`${a.id}:unknown-job`],['part',`${a.id}:${part.id}:extra`],['unknown',a.id]]){
 context.set(a,'BBS611BSC/02');context.retainForRoute(route,param,products);assert.equal(context.get(a),null,`${route}/${param}`);
}
context.set(a,'BBS611BSC/02');
const text=boschPartReviewText(a,part,context.get(a));
assert.match(text,/Gerät: Bosch BBS611BSC\/02/);assert.ok(text.includes(part.name));
assert.ok(part.identifiers.some(i=>text.includes(i.value)));assert.match(text,/Eignung dieses Teils.*noch prüfen/);
assert.equal(boschPartReviewText(b,part,context.get(a)),null);
assert.equal(boschPartReviewText(a,boschPartsCatalog.find(p=>!a.parts.some(x=>x.id===p.id)),context.get(a)),null);
for(const p of a.parts)assert.equal(cartQuoteItem(p,a),null,'carrying a real E-Nr. does not approve fitment or a priced cart');
const candidateProduct=products.find(p=>p.model==='BGL8SIL0L'),candidate=candidateProduct.candidateParts[0];
context.set(candidateProduct,'BGL8SIL0L/02');
assert.match(boschPartReviewText(candidateProduct,candidate,context.get(candidateProduct)),/Nachbau laut Anbieter; keine Bosch-Freigabe/);
context.clear();assert.equal(context.get(candidateProduct),null);assert.equal(createBoschContext().get(a),null,'a new page has no persisted E-Nr.');

for(const brand of ['Miele','Bosch','all']){
 const options=partFilterOptions(partsCatalog,products,brand);
 for(const series of options.series)assert.ok(filterParts(partsCatalog,{brand,series},products).length,`${brand}: every offered series has a part`);
 for(const category of options.categories)assert.ok(filterParts(partsCatalog,{brand,category},products).length,`${brand}: every offered category has a part`);
 if(brand==='Bosch')assert.ok(options.series.every(s=>s.startsWith('Bosch ')));
 if(brand==='Miele')assert.ok(options.series.every(s=>!s.startsWith('Bosch ')));
}
assert.equal(partFilterOptions([],products,'Bosch').series.length,0);
console.log('Bosch workflow checks passed: all 60 reviewed indices, brand confirmation, conflicts, immediate invalidation, device-route isolation, discard/reload, part-copy membership, unchanged cart gate and brand-scoped filter choices.');
