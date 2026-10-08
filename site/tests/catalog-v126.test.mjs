import assert from 'node:assert/strict';
import {products,partsCatalog,catalogBrands,optionalCatalogBrands,registerCatalogPack,catalogCoverage,filterCatalog} from '../src/data/catalog.js';
import {catalogTargetProgress} from '../src/data/catalog-plan.js';
import {partIdentity} from '../src/data/miele-parts.js';
import {isPhysicalPart} from '../src/data/part-taxonomy.js';
import {reviewTypePlate,reviewScannedCode,parseTypePlate} from '../src/core/typeplate.js';
import {quoteForPart,cartQuoteItem} from '../src/data/miele-commerce.js';
import {installationTime} from '../src/data/miele-installation-times.js';

assert.equal(catalogBrands.length,10);
const before=catalogCoverage();
for(const brand of optionalCatalogBrands){
 const {brandPack}=await import(`../src/data/${brand.toLowerCase()}-pack.js`);
 registerCatalogPack(brandPack);registerCatalogPack(brandPack);
}
assert.equal(new Set(partsCatalog.map(partIdentity)).size,partsCatalog.length);
for(const row of catalogCoverage()){
 const devices=products.filter(p=>p.brand===row.brand&&p.recordType==='model');
 assert.equal(row.recordsWithoutParts,devices.filter(p=>!p.parts.some(isPhysicalPart)).length);
 assert.equal(row.recordsWithParts+row.recordsWithoutParts,row.records);
 assert.equal(filterCatalog({brand:row.brand,partCoverage:'missing'}).length,row.recordsWithoutParts);
 assert.equal(before.find(r=>r.brand===row.brand).physicalParts,row.physicalParts,'lightweight and loaded coverage agree');
 assert.equal(before.find(r=>r.brand===row.brand).recordsWithoutParts,row.recordsWithoutParts);
}
const progress=catalogTargetProgress(catalogCoverage());
assert.equal(progress.filter(r=>r.parts>=100).length,8);
assert.equal(progress.find(r=>r.brand==='Samsung').partsMissing,73);
assert.equal(progress.find(r=>r.brand==='Hoover').partsMissing,40);
assert.equal(progress.find(r=>r.brand==='Vorwerk').models,18,'accessories and sales sets do not create main devices');
const vp=partsCatalog.filter(p=>p.brand==='Vorwerk');
const vk7=products.find(p=>p.id==='vac-vorwerk-model-vk7');
assert.equal(vk7.parts.length,9);
assert.ok(vk7.partListCoverage.note.startsWith('9 ausgewählte Originalartikel'),'the model explanation follows its expanded article list');
assert.equal(new Set(vp.map(p=>p.sourceUrl.split('?')[0])).size,vp.length,'alternate titles do not duplicate one Vorwerk article');
const eb=vp.find(p=>p.name.includes('EB400 Revisionsklappe'));
assert.ok(eb);assert.ok(eb.attachmentReferences.includes('EB400'));assert.equal(eb.modelIds.length,0,'an attachment spare is not assigned to every Kobold');
assert.equal(quoteForPart(eb),null);assert.equal(installationTime(eb).status,'unknown');
assert.ok(!partsCatalog.some(p=>p.brand==='Rowenta'&&p.identifiers.some(i=>i.value==='SS-1600007277')),'a steam-generator cover does not enter the vacuum catalog');
const hooverParts=partsCatalog.filter(p=>p.brand==='Hoover');
assert.equal(hooverParts.length,60);assert.equal(hooverParts.filter(p=>p.modelIds.length).length,12);
for(const [code,count] of [['39401035',10],['39401038',12]]){
 const model=products.find(p=>p.brand==='Hoover'&&p.identifiers.some(i=>i.value===code));
 assert.ok(model);assert.equal(model.parts.length,count);assert.equal(model.physicalPartCount,count);
 assert.ok(model.parts.every(p=>p.fitment.status==='variant_check_required'));
 assert.ok(model.partListCoverage.note.includes('italienische Servicepreise'));
}
assert.equal(catalogCoverage().find(r=>r.brand==='Hoover').recordsWithoutParts,22);
for(const part of hooverParts){
 assert.notEqual(part.sourceMarket,'DE','EU-service evidence is not presented as a German offer');
 assert.equal(quoteForPart(part),null);assert.equal(cartQuoteItem(part),null);assert.equal(installationTime(part).status,'unknown');
}
assert.ok(hooverParts.some(p=>p.sourceMarket==='GB / EU-Service'),'the original GB market remains visible on verified shared articles');
const samsungParts=partsCatalog.filter(p=>p.brand==='Samsung');
assert.equal(samsungParts.length,27);assert.equal(samsungParts.filter(p=>p.modelIds.length).length,19);
for(const [code,count] of [['VS20B75BDR5',8],['VS20C95D2TK',10],['VS20B95C43W',11]]){
 const model=products.find(p=>p.brand==='Samsung'&&p.identifiers.some(i=>i.value===code));
 assert.ok(model);assert.equal(model.parts.length,count);assert.equal(model.physicalPartCount,count);
 assert.ok(model.parts.every(p=>p.fitment.status==='variant_check_required'));
}
assert.equal(catalogCoverage().find(r=>r.brand==='Samsung').recordsWithoutParts,61);
for(const part of samsungParts){assert.equal(quoteForPart(part),null);assert.equal(cartQuoteItem(part),null);assert.equal(installationTime(part).status,'unknown');}
const samsungBattery=samsungParts.find(p=>p.identifiers.some(i=>i.value==='VCA-SAPB95/WA'));
assert.ok(samsungBattery);assert.equal(samsungBattery.sourceQuote,null);assert.equal(samsungBattery.sourceCoverage.ean,'8806095344393');
for(const code of ['VCA-SPA75E/GL','VCA-SPW75E/VT','VCA-SPA95/GL','VCA-SPW95/VT','VCA-ADB952']){
 const part=samsungParts.find(p=>p.identifiers.some(i=>i.value===code));
 assert.ok(part?.attachmentReferences.length,`${code} keeps its attachment requirement`);
}
assert.ok(samsungParts.some(p=>p.identifiers.some(i=>i.value==='VCA-SHF90')),'the exact bare filter code is retained');
assert.ok(!samsungParts.find(p=>p.identifiers.some(i=>i.value==='VCA-SHF90/VT'))?.modelIds.length,'a different filter variant is not silently assigned');
for(const text of ['Samsung\nModellcode: VS15A6031R1/EG','Samsung\nVS15A6031R1/EG']){
 const r=reviewTypePlate(text);assert.equal(r.status,'catalog_reference');assert.equal(r.suggestions[0].model,'VS15A6031R1');
 assert.ok(parseTypePlate(text).entries.every(e=>e.kind!=='enumber'),'Samsung VS codes are not Siemens E-Nr.');
}
assert.equal(reviewTypePlate('Siemens\nModell: VS15A6031R1/EG').suggestions.length,0);
assert.equal(reviewTypePlate('Samsung\nSeriennummer: VS15A6031R1/EG').suggestions.length,0);
const h=reviewTypePlate('Hoover\nModell: HF910H 011\nProduktcode: 39401000');
assert.equal(h.status,'catalog_reference');assert.equal(h.suggestions.length,1);assert.equal(h.suggestions[0].brand,'Hoover');
assert.equal(reviewScannedCode('39401000').suggestions[0].id,h.suggestions[0].id);
assert.equal(reviewTypePlate('Bosch\nProduktcode: 39401000').suggestions.length,0);
assert.equal(reviewTypePlate('Hoover\nSeriennummer: 39401000').suggestions.length,0);
console.log('Catalog 1.26 passed: ten active brands, eight physical-part targets, exact gaps before/after hydration, preserved article identities, accessory-only scope and Samsung/Hoover identity boundaries.');
