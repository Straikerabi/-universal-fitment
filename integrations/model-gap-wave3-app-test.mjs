import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {products,partsCatalog,optionalCatalogBrands,registerCatalogPack,catalogCoverage,catalogStats,brandManifest,filterCatalog} from '../src/data/catalog.js';
import {wave3Audit as audit,mieleWave3Models,dysonWave3Rows,samsungWave3Rows,vorwerkWave3Rows} from '../src/data/model-gap-wave3.js';
import {brandDeviceId} from '../src/data/brand-products.js';
import {reviewTypePlate,reviewScannedCode} from '../src/core/typeplate.js';
import {matchProducts} from '../src/core/matcher.js';
import {resolveProductQuery} from '../src/data/product-resolver.js';
import {createBackup,reviewBackup} from '../src/core/backup.js';
import {catalogTargetProgress,deviceBudgetBand} from '../src/data/catalog-plan.js';
import {cartQuoteItem} from '../src/data/miele-commerce.js';

const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const freshIds=new Set(audit.models.map(m=>m.id));
assert.equal(freshIds.size,22);
assert.equal(hash(products.filter(p=>!freshIds.has(p.id))),audit.baseline.productsSha256,'All existing eager/index records, families, IDs, prices, aliases and fitment unchanged');
assert.equal(hash(partsCatalog),audit.baseline.partsSha256,'All eager article and fitment fields unchanged');
assert.deepEqual([catalogStats.modelCount,catalogStats.recordCount],[1104,1115]);
assert.equal(catalogTargetProgress(catalogCoverage()).reduce((n,r)=>n+r.slots,0),891);
const refs=new Map(products.map(p=>[p.id,p]));
for(const brand of optionalCatalogBrands){
 const pack=(await import('../src/data/'+brand.toLowerCase()+'-pack.js')).brandPack;
 registerCatalogPack(pack);registerCatalogPack(pack);
}
assert.equal(partsCatalog.length,1940);assert.equal(hash(partsCatalog),audit.baseline.hydratedPartsSha256,'ALL1940 hydrated articles and every old article relationship/price unchanged');
assert.equal(hash(products.filter(p=>!freshIds.has(p.id))),audit.baseline.hydratedProductsSha256,'ALL1093 previous models plus family fallbacks remain object-identical after lazy hydration');
for(const p of products)assert.equal(p,refs.get(p.id),'Hydration retains saved-device object identity');
for(const [brand,expected] of Object.entries(audit.result.byBrand)){
 const coverage=catalogCoverage().find(r=>r.brand===brand);
 assert.equal(coverage.models,expected.after);assert.equal(coverage.recordsWithoutParts,{Miele:27,Dyson:44,Samsung:59,Vorwerk:18}[brand]);
 assert.equal(filterCatalog({brand}).filter(p=>freshIds.has(p.id)).length,expected.added);
}
for(const m of audit.models){
 const p=products.find(p=>p.id===m.id);assert.ok(p);assert.equal(p.recordType,'model');
 assert.equal(p.imageUrl,null);assert.equal(p.deviceQuote??null,null);assert.equal(p.deviceSku??null,null);
 assert.equal(p.vacuumMeta.materialNumber,null);assert.equal(p.vacuumMeta.bagSystem,'unknown');assert.equal(deviceBudgetBand(p),'unknown');
 assert.ok(p.facts.some(f=>f.label==='Quellenmarkt'&&f.value===m.market));
 assert.ok(p.identifiers.every(i=>i.type==='manufacturer-model'));
 assert.deepEqual(p.parts,[]);assert.deepEqual(p.candidateParts,[]);assert.deepEqual(p.stockPlans,[]);
 assert.ok(!partsCatalog.some(part=>(part.modelIds||[]).includes(p.id)||(part.candidateModelIds||[]).includes(p.id)));
 for(const part of partsCatalog)assert.equal(cartQuoteItem(part,p),null);
 assert.equal(matchProducts(products,m.model)[0].product.id,p.id,'Canonical manufacturer name resolves offline');
 const result=await resolveProductQuery(products,m.model,{fetchFn:async()=>{throw Error('Known name must resolve offline');}});assert.equal(result.usedExternal,false);
 const review=reviewTypePlate(m.brand+'\nModell: '+m.model);
 assert.deepEqual(review.suggestions.map(p=>p.id),[m.id],m.brand+' '+m.model);
 assert.equal(review.status,m.brand==='Miele'?'model_reference':'catalog_reference');assert.notEqual(review.status,'exact_device');
 for(const label of ['Seriennummer','Fabrikationsnummer','FD'])assert.ok(!reviewTypePlate(m.brand+'\n'+label+': '+m.model).suggestions.some(p=>p.id===m.id),label+' is not a model');
 for(const text of ['Bosch\nModell: '+m.model,m.brand+' Bosch\nModell: '+m.model,m.brand+'\nModell: '+m.code+'X',m.brand+'\nModell: '+m.code+'/99/99'])assert.ok(!reviewTypePlate(text).suggestions.some(p=>p.id===m.id),text);
 assert.ok(!reviewScannedCode('9999999999999').suggestions.some(p=>p.id===m.id));
 const backup=reviewBackup(JSON.stringify(createBackup({saved:[p.id]},[],{})));assert.deepEqual(backup.data.saved,[p.id]);
}
for(const alias of ['S 4812 Hybrid','S4812'])for(const text of ['Miele\nModell: '+alias,'Miele '+alias])assert.deepEqual(reviewTypePlate(text).suggestions.map(p=>p.id),['vac-miele-model-s4812'],'Observed manufacturer alias is one model, never a second device');
assert.ok(!reviewTypePlate('Miele\nModell: S 4812 HybridX').suggestions.some(p=>p.id==='vac-miele-model-s4812'));
for(const r of samsungWave3Rows){
 const id=brandDeviceId('Samsung',r.code);
 assert.deepEqual(reviewTypePlate('Samsung\nModel Code: '+r.deviceReferences[0]).suggestions.map(p=>p.id),[id]);
 assert.ok(!reviewTypePlate('Samsung\nModel Code: '+r.code+'/ZZZ').suggestions.some(p=>p.id===id),'Unknown country is not an exact model reference');
}
for(const [text,code] of [['Vorwerk VK240/99','VK240'],['Vorwerk Tiger 250/99','VT250'],['Vorwerk VK240X','VK240'],['Vorwerk Tiger 250X','VT250']])assert.ok(!reviewTypePlate(text).suggestions.some(p=>p.id===brandDeviceId('Vorwerk',code)),'Unlabelled suffix cannot prove a new device: '+text);
for(const r of vorwerkWave3Rows.filter(r=>r.identityClass==='historical-name-reference')){
 const p=products.find(p=>p.id===brandDeviceId('Vorwerk',r.code));
 assert.ok(!p.identifiers.some(i=>/^V[KT B]/.test(i.value)),'Never invent historical VK prefixes');
 assert.deepEqual(reviewTypePlate('Vorwerk\n'+r.model).suggestions.map(p=>p.id),[p.id]);
 assert.ok(!reviewTypePlate('Vorwerk\nModell: VK'+r.model.replace(/\D/g,'')).suggestions.some(s=>s.id===p.id),'Name-only archive does not certify inferred VK code');
}
assert.equal(mieleWave3Models.length,2);assert.equal(dysonWave3Rows.length,4);assert.equal(samsungWave3Rows.length,2);assert.equal(vorwerkWave3Rows.length,14);
assert.equal(brandManifest.Dyson.independentModelCount,null);assert.equal(brandManifest.Vorwerk.independentModelCount,null);
assert.equal(audit.vorwerkBoundary.confirmedNamedProfiles,32);assert.equal(audit.vorwerkBoundary.conditionalArchiveLabelCeiling,41);
assert.equal(audit.vorwerkBoundary.absoluteGlobalTechnicalMaximum,null);assert.equal(audit.vorwerkBoundary.range.expandedIntoModels,false);
for(const name of ['Kobold 111','Kobold 112','Kobold 113','Kobold 115','Modell T','Elf 52','VK188','VT240'])assert.ok(!vorwerkWave3Rows.some(r=>r.model===name||r.code===name));
console.log('Wave3 app passed: 22 new manufacturer profiles,891/1000 target slots,1104 names/1115 rows; ALL1940 articles, all old models and fitment unchanged; regional/serial/typeplate/OCR/offline/backup boundaries, no invented variants or parts.');
