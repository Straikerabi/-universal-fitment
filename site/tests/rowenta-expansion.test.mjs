import assert from 'node:assert/strict';
import fs from 'node:fs';
import {products,partsCatalog,registerCatalogPack,catalogCoverage,brandManifest} from '../src/data/catalog.js';
import {brandPack} from '../src/data/rowenta-pack.js';
import {reviewTypePlate} from '../src/core/typeplate.js';
import {installationTime} from '../src/data/miele-installation-times.js';
import {installationInfo} from '../src/data/miele-guides.js';
import {quoteForPart,quoteStatus,canSelectQuote,cartQuoteItem,singleQuoteTotal,shippingCost,groupCartItems} from '../src/data/miele-commerce.js';
import {partIdentity} from '../src/data/miele-parts.js';
import {buildHandoffPlan} from '../src/core/handoff.js';

const devices=products.filter(p=>p.brand==='Rowenta'),before=partsCatalog.length;
const existing=devices.find(p=>p.id==='vac-rowenta-model-ro2932');
registerCatalogPack(brandPack);registerCatalogPack(brandPack);
assert.equal(partsCatalog.length,before+100,'registration is idempotent');
assert.equal(devices.find(p=>p.id===existing.id),existing,'saved object identity is preserved');
assert.equal(brandPack.models.length,272);assert.equal(brandPack.parts.length,100);
assert.equal(catalogCoverage().find(r=>r.brand==='Rowenta').manuals,7);
assert.equal(brandManifest.Rowenta.partCount,100);

const raw=code=>brandPack.parts.find(p=>p.code===code);
const model=code=>devices.find(p=>p.id==='vac-rowenta-model-'+code.toLowerCase());
const article=code=>partsCatalog.find(p=>p.brand==='Rowenta'&&p.identifiers[0].value===code);
const filter=raw('ZR904301');
assert.equal(filter.sourceCoverage.manufacturerRows,11);
assert.equal(filter.sourceCoverage.observedRows,9);
assert.deepEqual(filter.sourceCoverage.observedReferences,['RO2910EA','RO2913EA','RO2917EA','RO2932EA','RO2933EA','RO2981EA']);
assert.ok(model('RO2932').parts.some(p=>p.identifiers[0].value==='ZR904301'));
assert.ok(!model('RO4931').parts.some(p=>p.identifiers[0].value==='ZR904301'),'same brand does not broaden a filter family');

assert.deepEqual(model('RH9878').deviceReferences,['RH9878WO','RH9878WO/4Q0','RH9878WO/4Q1']);
const battery=model('RH98C0').parts.find(p=>p.identifiers[0].value==='ZR009705');
assert.ok(battery);assert.match(battery.fitment.condition,/RH98C0WO/);
assert.match(battery.fitment.condition,/andere Ausführungen bleiben offen/);
assert.doesNotMatch(battery.fitment.condition,/RH98C0WO\/4Q2/,'a source without /xxx does not approve a production index');
assert.equal(quoteForPart(battery),null,'no price from a product support page');
assert.ok(!model('RH9878').parts.some(p=>p.id===battery.id),'11.60 and 12.60 batteries are not merged');
for(const text of ['Rowenta\nRef.: RH9878WO/4Q0','Rowenta\nModell: RH9878WO']){
 const r=reviewTypePlate(text);assert.equal(r.status,'catalog_reference');assert.equal(r.suggestions.length,1);assert.equal(r.suggestions[0].id,model('RH9878').id);
}
assert.equal(reviewTypePlate('Bosch\nRef.: RH9878WO/4Q0').suggestions.length,0);
assert.equal(reviewTypePlate('Rowenta\nSeriennummer: RH9878WO/4Q0').suggestions.length,0);

for(const part of partsCatalog.filter(p=>p.brand==='Rowenta')){
 assert.equal(part.fitment.status,'catalog_only');assert.equal(part.sourceDeviceCategory,'Staubsauger');
 assert.equal(installationTime(part).status,'unknown');
 assert.ok(part.relationships.every(r=>r.basis==='manufacturer-article-table'&&part.sourceCoverage.observedReferences.includes(r.reference)));
 assert.ok(part.relationships.every(r=>/^(?:RO|RH)[A-Z0-9]{6}(?:\/[A-Z0-9]{3})?$/.test(r.reference)));
 const quote=quoteForPart(part);
 if(quote){
  assert.ok(quote.price>0);assert.equal(quote.partKey,partIdentity(part));assert.equal(quote.stock,'unknown');
  assert.equal(quoteStatus(quote,Date.parse('2026-10-07T12:00:00Z')),'reference');
  assert.equal(canSelectQuote(quote,Date.parse('2026-10-07T12:00:00Z')),false);assert.equal(singleQuoteTotal(quote),null);
 }
}
for(const device of devices)for(const part of device.parts){assert.equal(part.fitment.status,'variant_check_required');assert.equal(cartQuoteItem(part,device),null);assert.equal(installationTime(part).status,'unknown');}
assert.equal(article('RS-RT3130').modelIds.length,0,'an observed article with no local device stays unassigned');
assert.ok(article('ZR010770'));assert.equal(article('ZR010770').modelIds.length,0,'an observed X-Ô battery does not acquire an unobserved local device relationship');
const shop=quoteForPart(article('ZR200520')),accessories=quoteForPart(article('SS-2230002948')),unresolved=quoteForPart(article('SS-2230002827'));
assert.equal(shop.merchant,'Rowenta Shop');assert.equal(shop.shippingRuleId,'rowenta-shop-de');
assert.equal(accessories.merchant,'Rowenta Zubehör');assert.notEqual(shop.merchantId,accessories.merchantId);
assert.equal(shippingCost(shop.shippingRuleId,100),null,'conflicting seller thresholds remain unresolved');
assert.equal(shippingCost(unresolved.shippingRuleId,100),null,'unknown seller does not inherit accessory shipping');
assert.equal(shippingCost(accessories.shippingRuleId,30),0);
const groups=groupCartItems([shop,accessories]);assert.equal(groups.length,2);assert.ok(groups.every(g=>g.total===null));

for(const code of ['RO2932','RO3725','RO7935','RH2078','RH2036','RH6A31','RH6737']){
 const manual=model(code).manuals.find(m=>m.label==='Gebrauchsanweisung');assert.ok(manual,code);
 assert.equal(new URL(manual.url).hostname,'dam.groupeseb.com');assert.equal(new URL(manual.sourceUrl).hostname,'www.rowenta.de');
 assert.ok(manual.pages>=2);assert.ok(!fs.existsSync(new URL('../'+new URL(manual.url).pathname.split('/').at(-1),import.meta.url)));
}
for(const code of ['RO4B50','RH9AD1','RH9A36'])assert.ok(!model(code).manuals.some(m=>m.label==='Gebrauchsanweisung'),'unreadable documents are not counted');
const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');
assert.doesNotMatch(sw.split("self.addEventListener('install'")[0],/dam\.groupeseb|\.pdf|catalog-rowenta/,'manufacturer PDFs and optional details are not precached');
const motor=model('RH1238').parts.find(p=>p.identifiers[0].value==='SS-2230002976');
assert.equal(motor.professionalOnly,true);assert.ok(!installationInfo(motor,model('RH1238')).links.some(l=>l.label.includes('Geräteanleitung')),'device care instructions do not become motor repair instructions');
const note={key:'rowenta-reference',productId:model('RH98C0').id,partId:battery.id,partKey:partIdentity(battery),label:battery.name,sourceUrl:battery.sourceUrl,fitmentStatus:'variant_check_required',price:null};
const handoff=buildHandoffPlan([note]);assert.equal(handoff.total,null);
assert.equal(handoff.groups[0].lines[0].partNumber,'ZR009705');assert.equal(handoff.groups[0].lines[0].links[0].url,battery.sourceUrl);
console.log('Rowenta expansion passed: country-reference fitment boundaries, article coverage, reference prices, separate seller shipping, readable external manuals, internal motor guidance and unpriced shop handoff.');
