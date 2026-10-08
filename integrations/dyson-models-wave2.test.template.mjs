import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {products,partsCatalog,brandManifest,registerCatalogPack,catalogCoverage,catalogStats,filterCatalog} from '../src/data/catalog.js';
import {brandPack} from '../src/data/dyson-pack.js';
import {dysonWave2Models} from '../src/data/dyson-models-wave2.js';
import {brandDeviceId} from '../src/data/brand-products.js';
import {isPhysicalPart} from '../src/data/part-taxonomy.js';
import {partIdentity} from '../src/data/miele-parts.js';
import {quoteForPart,cartQuoteItem} from '../src/data/miele-commerce.js';
import {reviewTypePlate,reviewScannedCode} from '../src/core/typeplate.js';
import {createCatalogLoader,brandsForBackup} from '../src/core/catalog-loader.js';
import {createBackup,reviewBackup} from '../src/core/backup.js';
import {catalogTargetProgress} from '../src/data/catalog-plan.js';

const evidence=JSON.parse(fs.readFileSync(new URL('../../integrations/dyson-model-research-wave2.json',import.meta.url)));
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const legacyIds=new Set(evidence.baseline.modelCodes.map(code=>brandDeviceId('Dyson',code)));
const old=products.filter(p=>legacyIds.has(p.id)),fresh=products.filter(p=>p.brand==='Dyson'&&!legacyIds.has(p.id));
const refs=new Map(products.filter(p=>p.brand==='Dyson').map(p=>[p.id,p]));
assert.equal(digest(old),evidence.baseline.catalogIndexSha256,'All legacy index fields, aliases and IDs stay unchanged');
assert.equal(digest(products.filter(p=>p.brand!=='Dyson')),evidence.baseline.otherBrandIndexSha256,'Other brand indices unchanged');
assert.equal(old.length,60);assert.equal(fresh.length,38);assert.equal(dysonWave2Models.length,38);
assert.equal(brandPack.models.length,98);assert.equal(brandPack.parts.length,191);
assert.equal(digest({brand:brandPack.brand,models:brandPack.models.slice(0,60),parts:brandPack.parts}),evidence.baseline.packDataSha256,'Legacy articles, prices, stock, manuals and relationships preserved verbatim');
assert.equal(catalogStats.modelCount,981);assert.equal(catalogStats.recordCount,992);
assert.equal(brandManifest.Dyson.modelCount,92);assert.equal(brandManifest.Dyson.recordCount,98);
assert.equal(brandManifest.Dyson.independentModelCount,null);assert.equal(brandManifest.Dyson.verifiedAdditionalModelCount,38);
assert.ok(brandManifest.Dyson.note.includes('nicht belegte unabhängige Grundgeräte'));
assert.equal(filterCatalog({brand:'Dyson',partCoverage:'missing'}).length,40);
const beforeParts=partsCatalog.length;
const invalid=structuredClone(brandPack);invalid.parts[0].relationships.push({code:'DC01',model:'DC01',url:invalid.parts[0].url});
// A stale/mismatched model index rejects the entire pack before hydration.
invalid.models.pop();assert.throws(()=>registerCatalogPack(invalid));
assert.equal(partsCatalog.length,beforeParts);assert.ok([...refs.values()].every(p=>p.catalogLoaded===false));
let loads=0;
const loader=createCatalogLoader({packs:{Dyson:'dyson'},register:registerCatalogPack,importModule:async()=>{loads++;return {brandPack};}});
await Promise.all([loader.ensure('Dyson'),loader.ensure('Dyson')]);assert.equal(loads,1);
assert.equal(partsCatalog.length,beforeParts+191);registerCatalogPack(brandPack);assert.equal(partsCatalog.length,beforeParts+191);
const parts=partsCatalog.filter(p=>p.brand==='Dyson');
assert.equal(parts.filter(isPhysicalPart).length,185);assert.equal(new Set(parts.map(partIdentity)).size,191);
assert.equal(digest(old),evidence.baseline.hydratedProductsSha256,'All hydrated legacy device fields unchanged');
assert.equal(digest(parts),evidence.baseline.hydratedPartsSha256,'All legacy part identifiers, fitment states and commercial snapshots unchanged');
for(const p of fresh){
 assert.equal(p,refs.get(p.id),'Lazy load preserves object references');assert.equal(p.catalogLoaded,true);
 assert.equal(p.deviceSku,null);assert.equal(p.deviceQuote,null);assert.equal(p.vacuumMeta.materialNumber,null);
 assert.ok(p.identifiers.every(i=>i.type==='manufacturer-model'));
 assert.ok(!p.facts.some(f=>f.label==='Dyson-Produktnummer'));assert.equal(p.sources[0].retrievedAt,'2026-10-08');
 assert.equal(new URL(p.sources[0].url).hostname,'www.dyson.de');
 assert.deepEqual(p.parts,[]);assert.deepEqual(p.candidateParts,[]);assert.deepEqual(p.stockPlans,[]);
 assert.equal(p.partCount,0);assert.equal(p.physicalPartCount,0);assert.equal(p.partListCoverage.status,'not-reviewed');
 assert.ok(!parts.some(part=>part.modelIds.includes(p.id)),'No legacy family part is inherited');
 const code=dysonWave2Models.find(r=>brandDeviceId('Dyson',r.code)===p.id).code;
 for(const text of [`Dyson\nModell: ${code}`,`Dyson ${p.model}`]){
  const review=reviewTypePlate(text);assert.deepEqual(review.suggestions.map(x=>x.id),[p.id],text);
  assert.equal(review.status,'catalog_reference');assert.ok(review.warnings.some(w=>w.includes('Ausführung')));
 }
 for(const text of [`Dyson\nSeriennummer: ${code}`,`Bosch\nModell: ${code}`,`Dyson\nModell: ${code}X`,`Dyson\nModell: ${code}/01/02`,`Dyson\nProduktnummer: ${code}`]){
  assert.ok(!reviewTypePlate(text).suggestions.some(x=>x.id===p.id),text+' cannot prove this device');
 }
 assert.ok(!reviewScannedCode(code).suggestions.some(x=>x.id===p.id),'Model name is not a numeric product barcode');
}
for(const text of ['Dyson\nModell: DC01/02','Dyson\nModell: DC19 T2X','Dyson Omni-glide+','Dyson PencilVac Fluffycones','Dyson\nModell: Small Ball','Dyson\nModell: DC62','Dyson\nModell: DC26 City','Dyson\nModell: Ball']){
 assert.ok(!reviewTypePlate(text).suggestions.some(p=>fresh.includes(p)),'Deferred identities/bundles do not create an extra base: '+text);
}
const legacy=old.find(p=>p.parts.length>0),sku=legacy.deviceSku;
assert.ok(reviewTypePlate(`Dyson\nProduktnummer: ${sku}`).suggestions.some(p=>p.id===legacy.id),'Original SKU lookup remains available');
for(const part of parts){assert.equal(part.fitment.status,'catalog_only');assert.equal(cartQuoteItem(part,fresh[0]),null);const quote=quoteForPart(part);if(quote)assert.ok(quote.checkedAt!=='2026-10-08','Identity audit does not renew price observation');}
const coverage=catalogCoverage().find(c=>c.brand==='Dyson');
assert.deepEqual([coverage.models,coverage.records,coverage.parts,coverage.physicalParts,coverage.recordsWithoutParts],[92,98,191,185,40]);
assert.equal(coverage.manuals,54+dysonWave2Models.filter(r=>r.manuals.length).length);
assert.equal(catalogTargetProgress(catalogCoverage()).reduce((n,r)=>n+r.slots,0),768);
const saved=[legacy.id,fresh[0].id];assert.deepEqual(brandsForBackup({saved},products),['Dyson']);
const backup=reviewBackup(JSON.stringify(createBackup({saved},[],{})));assert.equal(backup.summary.devices,2);
assert.deepEqual(backup.data.saved,saved);
console.log('Dyson wave2 passed: 38 new references, 60 legacy records and 191 articles unchanged; 185 physical parts, atomic lazy load, backup, filters, coverage, SKU separation and OCR boundaries.');
