import assert from 'node:assert/strict';
import {createBackup,reviewBackup,MAX_BACKUP_BYTES} from '../src/core/backup.js';
import {products} from '../src/data/catalog.js';
import {cartQuoteItem,cartPriceKnown,quoteForPart} from '../src/data/miele-commerce.js';
import {marketplaceSearchNote} from '../src/core/marketplaces.js';
import {buildHandoffPlan} from '../src/core/handoff.js';
const now=Date.parse('2026-10-06T18:00:00Z');
const product=products.find(p=>p.id==='vac-miele-model-12560300'),part=product.parts.find(p=>p.id==='miele-part-12557080');
const source=cartQuoteItem(part,product,now);assert.ok(source);
const saved={schemaVersion:2,saved:[product.id],recent:[product.id],deviceMeta:{[product.id]:{nickname:'Wohnzimmer',serial:'MY-SERIAL',notes:'Filter wechseln'}},jobSelections:{},inventory:{},reminderPrefs:{},toolInventory:{},maintenance:{},reports:[{reason:'Zuordnung prüfen',productId:product.id}]};
const quote={...source,key:'source',quantity:2,addedAt:'2026-10-06T12:00:00Z'};
const note={...marketplaceSearchNote(part,product,'used'),key:'note',quantity:4};
const fixture=createBackup(saved,[quote,note],{radiusKm:10});fixture.access_token='never-import';fixture.password='never-import';
let result=reviewBackup(JSON.stringify(fixture));assert.equal(result.summary.devices,1);assert.equal(result.summary.cartPositions,2);assert.equal(result.data.deviceMeta[product.id].serial,'MY-SERIAL');
assert.equal(result.preferences.radiusKm,10);assert.equal(cartPriceKnown(result.cart[0],now),true);assert.equal(result.cart[0].quantity,2);
assert.equal(result.data.reports[0].reason,'Zuordnung prüfen');
assert.ok(!JSON.stringify(result).includes('never-import'),'unknown credential fields are not imported');
const resolvePart=item=>products.find(p=>p.id===item.productId)?.parts.find(p=>p.id===item.partId);
let plan=buildHandoffPlan(result.cart,{resolvePart,now});assert.equal(plan.total,null,'a note still has an open price');assert.equal(plan.searchCount,1);
const wrongLinks=[{provider:'ebay',url:'https://www.ebay.de/sch/i.html?_nkw=WRONG-PART'}];
plan=buildHandoffPlan([{...note,lookupLinks:wrongLinks}],{resolvePart,now});assert.ok(plan.groups[0].lines[0].links[0].url.includes('12557080'));assert.ok(!plan.groups[0].lines[0].links[0].url.includes('WRONG'));
for(const extra of [{price:0},{sourceUrl:'https://evil.example/part'},{checkedAt:'2099-01-01'},{stock:'available',testData:true},{shippingRuleId:'electropapa-free-de'},{dataMode:'mock'}]){
  const restored=reviewBackup(JSON.stringify({...fixture,cart:[{...quote,...extra}]}));assert.equal(restored.cart[0].price,null);assert.equal(restored.stats.openPrices,1);assert.equal(cartPriceKnown(restored.cart[0],now),false);assert.equal(restored.cart[0].sourceUrl,quoteForPart(part).sourceUrl);
}
result=reviewBackup(JSON.stringify({...fixture,cart:[{...quote,checkedAt:quote.checkedAt}]}));assert.equal(cartPriceKnown(result.cart[0],now+86400001),false,'restore never refreshes the source timestamp');
const hx2=products.find(p=>p.id==='vac-miele-model-11806000'),hx3=products.find(p=>p.id==='vac-miele-model-12887840'),battery=hx2.parts.find(p=>p.id==='aftermarket-vhbw-889005195');
const invalid={...cartQuoteItem(battery,hx2,now),key:'wrong-device',productId:hx3.id,quantity:1};
result=reviewBackup(JSON.stringify({...fixture,cart:[invalid,{...quote,partKey:'wrong-part'}],saved:['unknown',product.id]}));assert.equal(result.cart.length,0);assert.equal(result.summary.devices,1);assert.equal(result.stats.skipped,3);
assert.throws(()=>reviewBackup('{'),/gültige JSON/);assert.throws(()=>reviewBackup(JSON.stringify({schemaVersion:99})),/nicht unterstützt/);assert.throws(()=>reviewBackup('x'.repeat(MAX_BACKUP_BYTES+1)),/höchstens/);
result=reviewBackup(JSON.stringify({...saved,cart:[quote],preferences:{market:'US',currency:'USD'}}));assert.equal(result.summary.cartPositions,1,'v1.13 schema 2 backups remain readable');assert.equal(result.preferences.currency,'EUR');
const external={id:'external-miele-test',brand:'Miele',name:'Unbekanntes Gerät',sourceUrl:'https://www.upcitemdb.com/upc/123',verifiedCompatibility:true};
result=reviewBackup(JSON.stringify({...fixture,externalProducts:{[external.id]:external},saved:[external.id]}));assert.equal(result.summary.devices,1);assert.equal(result.externalProducts[external.id].verifiedCompatibility,false);
console.log('Backup checks passed: schema round trip, exact device/part boundaries, canonical search links, forged/open/stale prices, schema 2 compatibility and no account credentials.');
const empty=createBackup({},[],{});assert.equal(reviewBackup(JSON.stringify(empty)).summary.devices,0);
for(const key of ['saved','reports','deviceMeta','cart','preferences','externalProducts']){const broken={...empty};delete broken[key];assert.throws(()=>reviewBackup(JSON.stringify(broken)),/unvollständig/);}
for(const bad of [null,[],true])assert.throws(()=>reviewBackup(JSON.stringify({...empty,deviceMeta:bad})),/unvollständig/);
result=reviewBackup(JSON.stringify({...fixture,cart:[null,{},{...quote},{...quote}]}));assert.equal(result.cart.length,1);assert.equal(result.stats.skipped,3,'malformed and duplicate cart rows are reported');
