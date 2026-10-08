import assert from 'node:assert/strict';
import { products, mielePartsCatalog } from '../src/data/catalog.js';
import { partIdentity } from '../src/data/miele-parts.js';
import { mielePriceRecords } from '../src/data/miele-commerce-records.js';
import { quoteForPart, quoteFresh, canSelectQuote, shippingCost, singleQuoteTotal, cartQuoteItem, groupCartItems, isAmount, sortCommerceParts } from '../src/data/miele-commerce.js';
import { installationTime } from '../src/data/miele-installation-times.js';
import {groupPartsByType} from '../src/data/part-taxonomy.js';

const NOW=Date.parse('2026-10-06T18:00:00Z');
const part=code=>mielePartsCatalog.find(p=>partIdentity(p)===`oem:${code}`);
const bag=part('12421170'),bagQuote=quoteForPart(bag);
const fresh={...bagQuote,checkedAt:'2026-10-06T12:00:00Z',stock:'available'};
assert.equal(mielePriceRecords.length,mielePartsCatalog.length,'every part has an explicit provider price record');
assert.equal(new Set(mielePriceRecords.map(q=>q.partKey)).size,mielePriceRecords.length);
for(const p of mielePartsCatalog){
  const q=quoteForPart(p);
  assert.ok(q&&isAmount(q.price),`missing sourced price: ${p.id}`);
  assert.equal(new URL(q.sourceUrl).protocol,'https:');
  if(p.tier==='oem')assert.ok(q.sourceUrl.includes(`/product/${p.identifiers.find(i=>i.type==='material-number').value}/`),'an accessory price must come from its own material page, not the vacuum page');
}
assert.equal(bagQuote.price,15.95);
assert.equal(bagQuote.vatIncluded,true);
assert.equal(shippingCost('miele-de',48.99),6.50);
assert.equal(shippingCost('miele-de',49),0,'inclusive free-shipping threshold');
assert.equal(shippingCost('miele-de',0),6.50);
assert.equal(shippingCost('miele-de',null),null,'unknown goods value is never zero');
assert.equal(shippingCost('missing',49),null);
assert.equal(shippingCost('electropapa-free-de',20.49),0);
assert.equal(shippingCost('mueller-de',48.99),3.95);
assert.equal(shippingCost('mueller-de',49),0);
assert.equal(shippingCost('reinigungsberater-de',40),null,'parcel count and small-parcel eligibility are not fabricated');
assert.equal(isAmount(null),false);
assert.equal(isAmount(''),false);
assert.equal(isAmount(0),true);
assert.equal(isAmount(-1),false);
assert.equal(singleQuoteTotal({...fresh,price:3.49}),9.99,'round to cents');
assert.equal(singleQuoteTotal({...fresh,stock:'unavailable'}),null,'an unorderable part is not a purchasable total');
assert.equal(singleQuoteTotal({...fresh,currency:'PLN'}),null);
assert.equal(singleQuoteTotal({...fresh,vatIncluded:false}),null);
assert.equal(quoteFresh({...fresh,checkedAt:new Date(NOW-86400000).toISOString()},NOW),true);
assert.equal(quoteFresh({...fresh,checkedAt:new Date(NOW-86400001).toISOString()},NOW),false);
assert.equal(quoteFresh({...fresh,sourceAgeNote:'older cached source'},NOW),false);
assert.equal(canSelectQuote({...fresh,stock:'unknown'},NOW),false);

const item=(price,extra={})=>({...fresh,price,merchantId:'miele-de',quantity:1,...extra});
let group=groupCartItems([item(20),item(20)],NOW)[0];
assert.equal(group.knownSubtotal,40);
assert.equal(group.shipping,6.50,'shipping charged once, not once per item');
assert.equal(group.total,46.50);
group=groupCartItems([item(20),item(29)],NOW)[0];
assert.equal(group.shipping,0,'combined same-merchant goods unlock free shipping');
assert.equal(group.total,49);
assert.equal(groupCartItems([item(15.95,{quantity:4})],NOW)[0].shipping,0,'quantity affects the merchant threshold');
group=groupCartItems([item(20),item(null)],NOW)[0];
assert.equal(group.knownSubtotal,20);
assert.equal(group.unknownPriceCount,1);
assert.equal(group.shippingKnown,false);
assert.equal(group.total,null,'a partial basket must not display a complete total');
group=groupCartItems([item(0)],NOW)[0];
assert.equal(group.unknownPriceCount,0,'explicit zero prices and missing prices differ');
assert.equal(group.total,6.50);
for(const invalid of [{currency:'PLN'},{vatIncluded:false},{market:'PL'},{priceBasis:'bulk-from'},{stock:'unavailable'},{checkedAt:'2026-10-01T12:00:00Z'}]){
  assert.equal(groupCartItems([item(20,invalid)],NOW)[0].total,null,'foreign, net, bulk, unavailable or old records cannot enter a confirmed EUR total');
}
const mixed=groupCartItems([item(20),item(40,{merchantId:'electropapa-de',merchant:'Electropapa',shippingRuleId:'electropapa-free-de'})],NOW);
assert.equal(mixed.length,2);
assert.equal(mixed[0].shipping,6.50,'a second merchant cannot satisfy Miele’s threshold');
assert.equal(mixed[1].shipping,0);

const pl=quoteForPart(mielePartsCatalog.find(p=>p.id==='aftermarket-vhbw-888400575'));
assert.equal(pl.currency,'PLN');
assert.equal(pl.market,'PL');
assert.equal(pl.price,122.29);
const b2b=quoteForPart(mielePartsCatalog.find(p=>p.id==='aftermarket-sqoon-685205812'));
assert.equal(b2b.vatIncluded,false);
assert.equal(b2b.priceBasis,'bulk-from');
assert.equal(b2b.delivery,null,'a conditional backorder time cannot become an arrival promise');
assert.equal(quoteForPart(mielePartsCatalog.find(p=>p.id==='aftermarket-vhbw-889005195')).delivery,null,'dispatch within 24 hours is not delivery within 24 hours');
const hx2=products.find(p=>p.id==='vac-miele-model-11806000');
const battery=hx2.parts.find(p=>p.id==='aftermarket-vhbw-889005195');
assert.ok(cartQuoteItem(battery,hx2,NOW));
assert.equal(cartQuoteItem({...battery,fitment:{...battery.fitment,status:'variant_check_required'}},hx2,NOW),null);
assert.equal(cartQuoteItem(battery,null,NOW),null,'choose a device before carrying a fitment-labelled quote to the cart');
const sorted=sortCommerceParts([mielePartsCatalog.find(p=>p.id==='aftermarket-sqoon-685205812'),bag,part('10563760')],'price',installationTime,NOW);
assert.equal(sorted[0].id,bag.id,'net and unavailable reference prices are kept after comparable orderable prices');

const recorded=(id,name,price,extra={})=>({id:`model-sort-${id}`,name,tier:'oem',sourceQuote:{...fresh,price,checkedAt:'2026-10-01T12:00:00Z',stock:'unknown',...extra}});
const priceCases=[recorded('missing','A ohne Preis',null),recorded('higher','Teurer',25),recorded('lower','Günstiger',10),recorded('foreign','Fremdwährung',1,{currency:'PLN',market:'PL'}),recorded('net','Nettopreis',2,{vatIncluded:false}),recorded('zero','Null Euro',0),recorded('bulk','Staffelpreis',3,{priceBasis:'bulk-from'})];
const originalIds=priceCases.map(p=>p.id);
assert.deepEqual(sortCommerceParts(priceCases,'recorded-price',installationTime,NOW).slice(0,3).map(p=>p.sourceQuote.price),[0,10,25],'recorded gross EUR prices remain sortable when older or stock is unknown');
const descending=sortCommerceParts(priceCases,'recorded-price-desc',installationTime,NOW);
assert.deepEqual(descending.slice(0,3).map(p=>p.sourceQuote.price),[25,10,0],'descending price does not move missing/foreign/net/bulk prices to the front');
assert.deepEqual(new Set(descending.slice(3).map(p=>p.id)),new Set(priceCases.filter(p=>!['model-sort-higher','model-sort-lower','model-sort-zero'].includes(p.id)).map(p=>p.id)));
assert.deepEqual(priceCases.map(p=>p.id),originalIds,'sorting never changes the model source list');
assert.equal(canSelectQuote(priceCases[1].sourceQuote,NOW),false,'sorting an older price does not make it a current selectable offer');
assert.deepEqual(sortCommerceParts(priceCases,'name-desc').map(p=>p.name),priceCases.map(p=>p.name).sort((a,b)=>b.localeCompare(a,'de')));
const modelGroups=groupPartsByType(sortCommerceParts(hx2.parts,'recorded-price',installationTime,NOW));
assert.deepEqual(new Set(modelGroups.flatMap(g=>g.parts).map(p=>p.id)),new Set(hx2.parts.map(p=>p.id)),'model categories contain exactly the assigned model parts');
for(const group of modelGroups){
 const prices=group.parts.map(p=>quoteForPart(p)).filter(q=>q?.currency==='EUR'&&q?.market==='DE'&&q?.vatIncluded===true&&q?.priceBasis==='unit'&&isAmount(q.price)).map(q=>q.price);
 assert.deepEqual(prices,[...prices].sort((a,b)=>a-b),'price order survives category grouping');
}

assert.deepEqual([installationTime(bag).minMinutes,installationTime(bag).maxMinutes],[2,5]);
assert.equal(installationTime(battery).status,'estimate');
assert.ok(installationTime(battery).excludes.includes('Ladezeit'));
assert.equal(installationTime(part('12021962')).status,'unknown','no invented time for internal spring repairs');
assert.equal(installationTime(part('10132491')).status,'unknown','a filter frame is not a simple filter swap');
assert.equal(installationTime({...bag,fitment:{status:'variant_check_required'}}).status,'unknown');
assert.ok(installationTime(battery).maxMinutes<60,'battery charge time must not inflate active installation time');
console.log('Commerce checks passed: own-part sources, gross/currency/quantity handling, basket shipping thresholds, price age, unavailable parts and active installation estimates.');
