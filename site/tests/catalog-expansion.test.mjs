import assert from 'node:assert/strict';
import fs from 'node:fs';
import {products,partsCatalog,registerCatalogPack,catalogCoverage,filterCatalog,brandManifest} from '../src/data/catalog.js';
import {createCatalogLoader,brandsForBackup} from '../src/core/catalog-loader.js';
import {brandPack as aegPack} from '../src/data/aeg-pack.js';
import {brandPack as dysonPack} from '../src/data/dyson-pack.js';
import {partIdentity,partBrands} from '../src/data/miele-parts.js';
import {quoteForPart,cartQuoteItem,shippingCost} from '../src/data/miele-commerce.js';
import {installationTime} from '../src/data/miele-installation-times.js';
import {reviewAegPNC,parseAegPNC,aegPartsLink} from '../src/core/brand-identity.js';
import {reviewTypePlate,reviewScannedCode} from '../src/core/typeplate.js';
import {createBackup,reviewBackup} from '../src/core/backup.js';
import {addCartItem,cartItems} from '../src/core/cart.js';
import {buildHandoffPlan} from '../src/core/handoff.js';
import {marketplaceSearchNote} from '../src/core/marketplaces.js';
const added=products.filter(p=>['Dyson','AEG'].includes(p.catalogPack));
assert.ok(added.length>=120);
assert.ok(added.every(p=>p.catalogLoaded===false&&p.parts.length===0));
assert.equal(partsCatalog.length,270,'new detailed catalogs are absent from the core');
const references=new Map(added.map(p=>[p.id,p]));
const newAEG=added.find(p=>p.brand==='AEG'),newDyson=added.find(p=>p.brand==='Dyson');
assert.deepEqual(brandsForBackup({maintenance:{[newAEG.id]:[]},jobSelections:{[newDyson.id+':care']:[]}},products).sort(),['AEG','Dyson'],'unbookmarked device activity also loads before backup review');
assert.deepEqual(brandsForBackup({saved:null,cart:[null,{productId:'unknown'}],deviceMeta:[]},products),[]);
let calls=0;
const loader=createCatalogLoader({packs:{AEG:'aeg',Dyson:'dyson'},register:registerCatalogPack,importModule:async url=>{calls++;return {brandPack:url==='aeg'?aegPack:dysonPack};}});
await Promise.all([loader.ensure('AEG'),loader.ensure('AEG'),loader.ensure('Dyson')]);
assert.equal(calls,2,'concurrent requests share one import per brand');
for(const p of added){assert.equal(p,references.get(p.id),'backup/device references survive hydration');assert.equal(p.catalogLoaded,true);}
assert.equal(partsCatalog.length,270+aegPack.parts.length+dysonPack.parts.length);
registerCatalogPack(aegPack);assert.equal(partsCatalog.length,270+aegPack.parts.length+dysonPack.parts.length,'registration is idempotent');
assert.equal(new Set(partsCatalog.map(partIdentity)).size,partsCatalog.length,'article keys are scoped to their maker');
assert.equal(new Set(products.map(p=>p.id)).size,products.length);
assert.deepEqual(catalogCoverage().map(r=>r.brand),['Miele','Bosch','Dyson','AEG','Rowenta','Philips','Siemens','Samsung','Hoover','Vorwerk']);
for(const brand of ['AEG','Dyson']){
 const pack=brand==='AEG'?aegPack:dysonPack,devices=filterCatalog({brand});
 assert.equal(devices.length,pack.models.length);assert.equal(catalogCoverage().find(r=>r.brand===brand).parts,pack.parts.length);
 assert.equal(brandManifest[brand].partCount,pack.parts.length);
 for(const p of devices){
  assert.equal(p.identityScope,'model-reference');assert.equal(p.vacuumMeta.materialNumber,null);
  assert.equal(new URL(p.spareFinderUrl).hostname,brand==='AEG'?'shop.aeg.de':'www.dyson.de');
  assert.doesNotMatch(p.model,/LXB|VACUUM CL|Car\s*(?:\+|&)\s*Boat|Submarine/i);
  for(const part of p.parts){
   assert.deepEqual(partBrands(part),[brand]);assert.equal(part.fitment.status,'variant_check_required');
   assert.equal(cartQuoteItem(part,p),null,'a price does not resolve device fitment');assert.equal(installationTime(part).status,'unknown');
   assert.equal(part.offers.length,0);assert.ok(part.relationships.some(r=>brand==='AEG'?p.pncs.includes(r.pnc):r.code===p.deviceSku));
   const q=quoteForPart(part);if(q){assert.equal(q.partKey,partIdentity(part));assert.equal(q.market,'DE');assert.ok(Number.isFinite(Date.parse(q.checkedAt)));}
   assert.equal(new URL(part.sourceUrl).hostname,brand==='AEG'?'shop.aeg.de':'www.dyson.de');
  }
  for(const manual of p.manuals)assert.equal(new URL(manual.url).protocol,'https:');
 }
}
for(const r of aegPack.parts){assert.ok(/staubsauger/i.test(r.sourceDeviceCategory),'only manufacturer-classified vacuum articles enter the catalog');assert.doesNotMatch(r.name,/Mikrowellen|Kühlschrank|Geschirrspüler|Backofen/i);}
const aeg=added.find(p=>p.brand==='AEG'&&p.parts.length);
assert.equal(reviewAegPNC(aeg,aeg.pncs[0]).status,'listed');assert.equal(reviewAegPNC(aeg,aeg.pncs[0].slice(0,9)).status,'prefix_only');
assert.equal(reviewAegPNC(aeg,'99999999999').status,'unknown');assert.equal(reviewAegPNC(aeg,'PNC 123').status,'invalid');
assert.equal(aegPartsLink(aeg.pncs[0].slice(0,9)),null);assert.equal(new URL(aegPartsLink(aeg.pncs[0])).searchParams.get('pnc'),aeg.pncs[0]);
assert.equal(parseAegPNC('900 940 633 00').full,'90094063300');assert.equal(parseAegPNC('9009406330'),null);
let r=reviewTypePlate(`AEG\nModell: ${aeg.model}\nProd.No.: ${aeg.pncs[0]}\nSeriennummer: ${aeg.pncs[0]}`);
assert.equal(r.status,'catalog_reference');assert.ok(r.suggestions.some(p=>p.id===aeg.id));assert.equal(r.entries.find(e=>e.kind==='serial').matches.length,0);
assert.ok(reviewScannedCode(aeg.pncs[0]).suggestions.some(p=>p.id===aeg.id));
assert.equal(reviewTypePlate(`Miele\nPNC: ${aeg.pncs[0]}`).suggestions.length,0);
const dyson=added.find(p=>p.brand==='Dyson'&&p.parts.length);
r=reviewTypePlate(`Dyson\nProdukt-Nr.: ${dyson.deviceSku}`);assert.equal(r.status,'catalog_reference');assert.equal(r.suggestions[0].id,dyson.id);
assert.equal(reviewTypePlate(`Dyson\nMaterial-Nr.: 12560300`).suggestions.length,0);
assert.equal(shippingCost('dyson-de',48.99),6);assert.equal(shippingCost('dyson-de',49),0);assert.equal(shippingCost('aeg-de',100),5.99);
const note=marketplaceSearchNote(dyson.parts[0],dyson,'used');
addCartItem(note);const backup=createBackup({saved:[dyson.id,aeg.id]},cartItems(),{});r=reviewBackup(JSON.stringify(backup));assert.equal(r.summary.devices,2);assert.equal(r.cart.length,1);assert.equal(r.cart[0].price,null);
const openNote={key:'dyson-open-part',productId:dyson.id,partId:dyson.parts[0].id,partKey:partIdentity(dyson.parts[0]),sourceUrl:dyson.parts[0].sourceUrl,fitmentStatus:'variant_check_required',price:null};
const noDetails=buildHandoffPlan([openNote]);assert.equal(noDetails.groups[0].lines[0].partNumber,dyson.parts[0].identifiers[0].value,'an unloaded brand keeps the article code in shopping handoff');assert.equal(noDetails.groups[0].lines[0].links[0].url,dyson.parts[0].sourceUrl);assert.equal(noDetails.total,null);
addCartItem(openNote);const restored=reviewBackup(JSON.stringify(createBackup({saved:[dyson.id]},cartItems(),{})));assert.equal(restored.cart.find(i=>i.key==='dyson-open-part').sourceUrl,dyson.parts[0].sourceUrl,'unpriced restoration preserves the direct article page');
let attempts=0,registered=0;
const retry=createCatalogLoader({packs:{AEG:'aeg'},importModule:async()=>{if(++attempts===1)throw Error('offline');return {brandPack:aegPack};},register:()=>registered++});
await assert.rejects(retry.ensure('AEG'));assert.equal(retry.isLoaded('AEG'),false);await retry.ensure('AEG');assert.equal(attempts,2);assert.equal(registered,1);
const mismatch=createCatalogLoader({packs:{AEG:'aeg'},importModule:async()=>({brandPack:dysonPack}),register:()=>assert.fail('mismatched brand must not register')});await assert.rejects(mismatch.ensure('AEG'));assert.equal(mismatch.isLoaded('AEG'),false);
const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');assert.doesNotMatch(sw.split("self.addEventListener('install'")[0],/catalog-(aeg|dyson)-v/,'brand details are not precached');
console.log(`Catalog expansion checks passed: ${added.length} new references, ${aegPack.parts.length+dysonPack.parts.length} source articles, maker/category boundaries, PNC/SKU checks, lazy retry, stable backup objects and open fitment.`);
