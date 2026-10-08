import assert from 'node:assert/strict';
import fs from 'node:fs';
import {products,partsCatalog,registerCatalogPack,catalogCoverage,brandManifest,catalogBrands} from '../src/data/catalog.js';
import {brandPack as philips} from '../src/data/philips-pack.js';
import {brandPack as aeg} from '../src/data/aeg-pack.js';
import {brandPack as dyson} from '../src/data/dyson-pack.js';
import {brandPack as rowenta} from '../src/data/rowenta-pack.js';
import {brandPack as siemens} from '../src/data/siemens-pack.js';
import {reviewPhilipsModelReference} from '../src/core/brand-identity.js';
import {reviewTypePlate,reviewScannedCode} from '../src/core/typeplate.js';
import {partIdentity} from '../src/data/miele-parts.js';
import {installationTime} from '../src/data/miele-installation-times.js';
import {installationInfo} from '../src/data/miele-guides.js';
import {quoteForPart,quoteStatus,canSelectQuote,cartQuoteItem,singleQuoteTotal,shippingCost} from '../src/data/miele-commerce.js';
import {createBackup,reviewBackup} from '../src/core/backup.js';
import {buildHandoffPlan} from '../src/core/handoff.js';

const originalIds=new Map(products.map(p=>[p.id,p]));
for(const pack of [aeg,dyson,rowenta,philips,siemens])registerCatalogPack(pack);
registerCatalogPack(philips);
assert.deepEqual(catalogBrands,['Miele','Bosch','Dyson','AEG','Rowenta','Philips','Siemens','Samsung','Hoover','Vorwerk']);
assert.equal(new Set(partsCatalog.map(partIdentity)).size,1729);
for(const product of products)assert.equal(product,originalIds.get(product.id),'all saved device objects stay stable during optional imports');
for(const [brand,models,parts] of [['Miele',57,167],['Bosch',60,103],['Dyson',54,191],['AEG',78,354],['Rowenta',272,100],['Philips',140,104],['Siemens',101,710]]){
 const coverage=catalogCoverage().find(r=>r.brand===brand);assert.equal(coverage.models,models);assert.equal(coverage.parts,parts);
}
assert.equal(brandManifest.Philips.manualCount,138);
assert.equal(philips.parts.length,104);assert.equal(philips.models.filter(m=>m.partCount).length,53);
const raw=code=>philips.parts.find(p=>p.code===code);
const model=code=>products.find(p=>p.id==='vac-philips-model-'+code.toLowerCase());
const part=(device,code)=>device.parts.find(p=>p.identifiers[0].value===code);
const expert=model('FC9743'),active=model('FC9552'),go=model('FC8246');
assert.ok(part(expert,'CP0617/01'));assert.ok(part(expert,'CP0618/01'));
assert.match(part(expert,'CP0617/01').fitment.condition,/FC9743\/09/);
assert.doesNotMatch(part(expert,'CP0617/01').fitment.condition,/FC9743\/09R1/,'an observed regular device table does not approve R1');
assert.ok(part(active,'CP0762/01'));assert.ok(!part(expert,'CP0762/01'),'same maker and similar series do not merge hoses');
assert.ok(part(model('XC5043'),'XV1653/01'));assert.ok(!part(model('XC3033'),'XV1653/01'),'25.2 V alone never transfers a 5000-series battery to the 3000 series');
assert.ok(!raw('CP0669/01'),'a conflicting nozzle table is not broadened to local devices');
assert.equal(raw('CP0542/01').relationships.length,0,'legacy hose without a visible exact table stays unassigned');
assert.deepEqual(new Set(raw('CP0680/01').relationships.map(r=>r.reference)),new Set(['FC9528/09R1','FC9529/09','FC9528/09','FC9530/09','FC9531/09','FC9532/09']));
assert.ok(!raw('CP0661/01').relationships.some(r=>r.code.startsWith('XC834')),'wildcard XC834x is not turned into precise model rows');
assert.ok(!raw('CP0189/01').relationships.some(r=>r.code==='FC9745'),'unexpanded range FC9741..FC9746 does not fabricate a precise article table');
assert.ok(raw('CP0791/01').relationships.some(r=>r.reference==='FC8244/09'&&new URL(r.url).hostname==='www.philips.co.uk'));
assert.equal(quoteForPart(part(model('FC8244'),'CP0791/01')),null,'foreign compatibility evidence is never a DE price');

for(const [value,status] of [['fc9743 / 09','listed'],['FC9743/09R1','listed'],['FC9743','variant_open'],['FC9743/99','unlisted_variant'],['FC9552/09','different_model'],['CP0617/01','invalid'],['FC9743/009','invalid'],['FC9743/09R10','invalid'],['FC9743/09?','invalid'],['','invalid']])assert.equal(reviewPhilipsModelReference(expert,value).status,status,value);
assert.equal(reviewPhilipsModelReference(go,'FC8246/09').status,'unlisted_variant');
assert.equal(reviewPhilipsModelReference(go,'FC8246/09R1').status,'listed');
assert.equal(reviewPhilipsModelReference(products.find(p=>p.brand==='Bosch'),'FC9743/09').status,'invalid');
for(const text of ['Philips\nModell: FC8246/09R1','Philips\nFC8246']){const r=reviewTypePlate(text);assert.equal(r.status,'catalog_reference');assert.equal(r.suggestions[0].id,go.id);}
assert.equal(reviewTypePlate('Bosch\nModell: FC8246/09R1').suggestions.length,0);
assert.equal(reviewScannedCode('CP0617/01').status,'part_only');

const affected=['XC2011','XC2012','XC3031','XC3032','XC3033','XC3131','XC3132','XC3133'];
assert.deepEqual(products.filter(p=>p.safetyNotices?.length).map(p=>p.model).sort(),affected.sort());
for(const code of affected){const notice=model(code).safetyNotices[0];assert.equal(notice.scope,'model-and-battery-code');assert.equal(notice.batteryCodeFrom,'2328');assert.equal(notice.batteryCodeThrough,'2423');assert.equal(notice.publishedAt,'2024-12-09');assert.match(notice.url,/philips\.de\/c-e\/recall/);}
for(const code of ['FC8244','XC5041','XC5043','XC8043','XC8349'])assert.equal(model(code).safetyNotices.length,0,'no transfer of the recall to unrelated series');
for(const code of ['XV1633/01','XV1633/01R1']){assert.equal(raw(code).safetyNotices.length,1);assert.match(raw(code).safetyNotices[0].note,/Refurbished/);}
assert.equal(raw('XV1653/01').safetyNotices,undefined,'5000-series battery has its own document, not a 2000/3000 recall');

for(const device of products.filter(p=>p.brand==='Philips'))for(const p of device.parts){
 assert.equal(p.fitment.status,'variant_check_required');assert.equal(cartQuoteItem(p,device),null);assert.equal(installationTime(p).status,'unknown');
 assert.ok(p.relationships.every(r=>new URL(r.url).protocol==='https:'&&r.checkedAt==='2026-10-07'));
}
const priced=partsCatalog.filter(p=>p.brand==='Philips'&&quoteForPart(p));assert.equal(priced.length,5);
for(const p of priced){const quote=quoteForPart(p);assert.ok(quote.price>0);assert.equal(quote.market,'DE');assert.equal(quote.currency,'EUR');assert.equal(quote.vatIncluded,null);assert.equal(quote.stock,'unknown');assert.equal(quote.delivery,null);assert.equal(quoteStatus(quote,Date.parse('2026-10-07T12:00:00Z')),'reference');assert.equal(canSelectQuote(quote),false);assert.equal(singleQuoteTotal(quote),null);assert.equal(new URL(quote.sourceUrl).hostname,'www.home-appliances.philips');}
assert.equal(quoteForPart(part(expert,'FC8003/01')).price,18.99);
assert.equal(shippingCost('philips-home-de',19.99),null);assert.equal(shippingCost('philips-home-de',20),0);
assert.equal(shippingCost('miele-de',48.99),6.50);assert.equal(shippingCost('bosch-de',20),5.95);assert.equal(shippingCost('aeg-de',100),5.99);assert.equal(shippingCost('dyson-de',48.99),6);assert.equal(shippingCost('rowenta-parts-de',30),0);assert.equal(shippingCost('siemens-de',50),0);
for(const code of ['CP0537/01','CP0538/01']){const info=installationInfo(part(go,code),go);assert.ok(info.links.some(m=>m.url.endsWith('#page=7')));assert.ok(info.links.some(m=>m.label.includes('Philips Geräteanleitung')));}
assert.ok(raw('XV1653/01').manuals.some(m=>m.kind==='safety-information'&&m.pages===4));

const chosen=part(expert,'CP0617/01');
const note={key:'philips-source-note',productId:expert.id,partId:chosen.id,partKey:partIdentity(chosen),label:chosen.name,sourceUrl:chosen.sourceUrl,fitmentStatus:'variant_check_required',price:null};
const restored=reviewBackup(JSON.stringify(createBackup({saved:[expert.id,go.id,'vac-rowenta-model-ro2932']},[note],{})));
assert.equal(restored.summary.devices,3);assert.equal(restored.cart.length,1);assert.equal(restored.cart[0].price,null);assert.equal(restored.cart[0].sourceUrl,chosen.sourceUrl);
const handoff=buildHandoffPlan(restored.cart);assert.equal(handoff.total,null);assert.equal(handoff.groups[0].lines[0].partNumber,'CP0617/01');assert.equal(handoff.groups[0].lines[0].links[0].url,chosen.sourceUrl);
const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');
assert.doesNotMatch(sw.split("self.addEventListener('install'")[0],/\.pdf|dam\.versuni|catalog-philips/,'manufacturer PDFs and optional detail pack remain outside the start cache');
console.log('Philips expansion passed: all ten catalog brands, explicit /xx/R boundaries, separate battery series, actual recall model/code scope, five unknown-stock source prices, external illustrated filter care, stable backup and honest maker-list handoff.');
