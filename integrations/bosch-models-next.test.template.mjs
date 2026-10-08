// Copied into site/tests by the importer so this runs in the complete App suite.
import assert from 'node:assert/strict';
import {products,boschPartsCatalog,boschCatalogStats,catalogCoverage,filterCatalog,optionalCatalogBrands,registerCatalogPack} from '../src/data/catalog.js';
import {boschModelRecords} from '../src/data/bosch-records.js';
import {boschNextModels,boschNextModelRecords} from '../src/data/bosch-models-next.js';
import {parseBoschENumber,boschServiceLink} from '../src/core/bosch-identity.js';
import {reviewTypePlate,reviewScannedCode} from '../src/core/typeplate.js';
import {reviewedBoschENumber,createBoschContext} from '../src/core/bosch-context.js';
import {matchProducts} from '../src/core/matcher.js';
import {createCatalogLoader,brandsForBackup} from '../src/core/catalog-loader.js';
import {createBackup,reviewBackup} from '../src/core/backup.js';
import {isValidGTIN} from '../src/core/identifiers.js';
import {isPhysicalPart} from '../src/data/part-taxonomy.js';

const models=products.filter(p=>p.brand==='Bosch');
assert.equal(boschModelRecords.length,60);assert.equal(boschNextModels.length,40);
assert.equal(models.length,100);assert.equal(new Set(models.map(p=>p.model)).size,100);
assert.equal(new Set(products.map(p=>p.id)).size,products.length);
assert.equal(boschCatalogStats.modelCount,100);
assert.equal(boschCatalogStats.documentedENumberCount,36,'Observed indices do not increase the model count');
assert.equal(boschPartsCatalog.length,103);assert.equal(boschPartsCatalog.filter(isPhysicalPart).length,102);
const coverage=catalogCoverage().find(r=>r.brand==='Bosch');
assert.deepEqual([coverage.models,coverage.records,coverage.recordsWithParts,coverage.recordsWithoutParts,coverage.physicalParts],[100,100,58,42,102]);
assert.equal(filterCatalog({brand:'Bosch',partCoverage:'missing'}).length,42);
const oldCodes=new Set(boschModelRecords.map(r=>r.code));
const newIds=new Set(boschNextModels.map(p=>p.id));
assert.ok(boschPartsCatalog.every(part=>!(part.modelIds||[]).some(id=>newIds.has(id))&&!(part.candidateModelIds||[]).some(id=>newIds.has(id))),'No family-based or aftermarket assignment to a new model');

for(const record of boschNextModelRecords){
 const product=products.find(p=>p.model===record.code);
 assert.equal(product,boschNextModels.find(p=>p.model===record.code));
 assert.equal(product.id,`vac-bosch-model-${record.code.toLowerCase()}`);
 assert.ok(!oldCodes.has(product.model));assert.equal(product.recordType,'model');
 assert.equal(product.identityScope,'model-reference');assert.equal(product.dataStatus,'manufacturer-verified');
 assert.deepEqual(product.deviceReferences,record.variants.map(v=>v.eNumber));
 assert.equal(product.vacuumMeta.materialNumber,null);assert.equal(product.deviceQuote,null);
 assert.deepEqual(product.parts,[]);assert.deepEqual(product.candidateParts,[]);
 assert.equal(product.partCount,0);assert.equal(product.physicalPartCount,0);
 assert.ok(product.partListCoverage.note.includes('noch keine'));
 assert.equal(product.vacuumMeta.bagSystem,product.vacuumMeta.deviceType==='bagged'?'unbestätigt':'none');
 assert.deepEqual(product.identifiers,[{type:'manufacturer-model',value:record.code},{type:'ean',value:record.ean}]);
 assert.ok(isValidGTIN(record.ean));
 assert.equal(matchProducts(products,record.code)[0].product.id,product.id);
 assert.equal(reviewScannedCode(record.ean).suggestions[0].id,product.id);
 assert.ok(filterCatalog({brand:'Bosch',partCoverage:'missing',budget:'unknown'}).some(p=>p.id===product.id));
 for(const source of product.sources){
  const url=new URL(source.url);assert.equal(url.protocol,'https:');assert.equal(url.hostname,'www.bosch-home.com');
  assert.ok(url.pathname.startsWith('/de/de/'));assert.equal(source.grade,'A');assert.equal(source.type,'manufacturer');
  assert.equal(source.retrievedAt,'2026-10-08');
 }
 assert.equal(product.sources[0].url,record.url);assert.ok(record.url.endsWith('/'+record.code));
 for(const manual of product.manuals){
  const url=new URL(manual.url);assert.equal(url.protocol,'https:');
  assert.ok(['www.bosch-home.com','media3.bsh-group.com'].includes(url.hostname));
 }
 for(const variant of record.variants){
  assert.deepEqual(parseBoschENumber(variant.eNumber),{base:record.code,index:variant.eNumber.slice(-2),full:variant.eNumber});
  assert.equal(boschServiceLink(variant.eNumber).url,variant.url);
  assert.ok(product.sources.some(source=>source.url===variant.url));
  const review=reviewTypePlate(`Bosch\nE-Nr.: ${variant.eNumber}\nFD: 9901\nZ-Nr.: private`);
  assert.equal(review.status,'model_reference');assert.deepEqual(review.suggestions.map(p=>p.id),[product.id]);
  assert.equal(reviewedBoschENumber(review,product),variant.eNumber);
 }
 // Syntax-only input may resolve a base; it cannot fabricate a documented index or a part.
 const unknownIndex=`${record.code}/98`;
 const review=reviewTypePlate(`Bosch\nE-Nr.: ${unknownIndex}`);
 assert.equal(review.status,'model_reference');assert.equal(review.suggestions[0].id,product.id);
 assert.ok(!product.deviceReferences.includes(unknownIndex));assert.deepEqual(product.parts,[]);
 const context=createBoschContext();context.rememberReview(review,product);assert.equal(context.get(product).eNumber,unknownIndex);
 assert.equal(boschServiceLink(record.code),null,'Base model has no fabricated service index');
 for(const value of [`${record.code}/1`,`${record.code}/001`,`${record.code}/XX`,`${record.code}/`,`${record.code}/01/02`]){
  assert.equal(parseBoschENumber(value),null);assert.equal(reviewTypePlate(`Bosch\nE-Nr.: ${value}`).hasInvalidFields,true);
  assert.equal(reviewTypePlate(`Bosch\n${value}`).hasInvalidFields,true,'Bare E-Nr. must retain and reject extra suffixes');
 }
 for(const brand of ['Miele','Siemens','AEG','Samsung','Hoover'])assert.equal(reviewTypePlate(`${brand}\nE-Nr.: ${record.code}/01`).suggestions.length,0);
 for(const label of ['Seriennummer','Z-Nr.','FD'])assert.equal(reviewTypePlate(`Bosch\n${label}: ${record.code}/01`).suggestions.length,0);
 assert.equal(reviewTypePlate(`Bosch\nSeriennummer: ${record.ean}`).suggestions.length,0);
 const unbranded=reviewTypePlate(`E-Nr.: ${record.code}/01`);
 assert.equal(unbranded.needsBrandConfirmation,true);assert.equal(reviewedBoschENumber(unbranded,product),null);
 assert.equal(reviewTypePlate(`Bosch\nE-Nr.: ${record.code}/01\nE-Nr.: ${record.code}/02`).status,'conflict');
}
const first=boschNextModels[0],second=boschNextModels[1];
assert.equal(reviewTypePlate(`Bosch\nE-Nr.: ${first.model}/01\nEAN: ${second.identifiers[1].value}`).status,'conflict');
const snapshot=createBackup({saved:[first.id],deviceMeta:{[first.id]:{nickname:'Neues Bosch-Gerät'}}},[],{});
assert.deepEqual(reviewBackup(JSON.stringify(snapshot)).data.saved,[first.id]);
assert.deepEqual(brandsForBackup(snapshot,products),[],'Bosch is already synchronously available');
assert.ok(products.filter(p=>optionalCatalogBrands.includes(p.brand)).every(p=>p.catalogLoaded===false),'Other brand packs are still lazy');
let imports=0;
const loader=createCatalogLoader({packs:{Siemens:'siemens'},register:registerCatalogPack,importModule:async()=>{imports++;return import('../src/data/siemens-pack.js');}});
await loader.ensure('Bosch');assert.equal(imports,0);
await Promise.all([loader.ensure('Siemens'),loader.ensure('Siemens')]);assert.equal(imports,1);
assert.equal(products.find(p=>p.id===first.id),first,'Hydration preserves Bosch object and saved ID');
assert.equal(catalogCoverage().find(r=>r.brand==='Bosch').recordsWithoutParts,42);
assert.equal(filterCatalog({brand:'Bosch'}).length,100);
console.log('Bosch next passed: 40 new bases, 100 unique models, 36 observed E-Nr. references, 6 open indices, 0 inferred parts, brand/serial/conflict boundaries, stable backup IDs and unchanged lazy loading.');
