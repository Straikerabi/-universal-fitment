import assert from 'node:assert/strict';
import {products,boschPartsCatalog} from '../src/data/catalog.js';
import {parseBoschENumber,boschServiceLink} from '../src/core/bosch-identity.js';
import {parseTypePlate,reviewTypePlate,reviewScannedCode} from '../src/core/typeplate.js';
import {partSearchIdentity,searchLinksForPart,marketplaceSearchNote} from '../src/core/marketplaces.js';
import {shippingCost,groupCartItems,cartPriceKnown} from '../src/data/miele-commerce.js';
import {createBackup,reviewBackup} from '../src/core/backup.js';
import {buildHandoffPlan} from '../src/core/handoff.js';
import {partIdentity} from '../src/data/miele-parts.js';
const a=products.find(p=>p.model==='BBS611BSC'),b=products.find(p=>p.model==='BGB6MPOW'),ean=p=>p.identifiers.find(i=>i.type==='ean').value;
for(const p of products.filter(p=>p.brand==='Bosch')){
 let r=reviewTypePlate(`Bosch\nE-Nr: ${p.model} / 02\nEAN: ${ean(p)}\nFD: 9912\nZ-Nr: SERIAL123`);assert.equal(r.status,'model_reference');assert.equal(r.suggestions[0].id,p.id);assert.equal(r.entries.find(e=>e.kind==='enumber').deviceIndex,'02');assert.ok(r.entries.filter(e=>e.kind==='serial').every(e=>!e.matches.length));
 r=reviewTypePlate(`Bosch\n${p.model}`);assert.equal(r.status,'model_reference');assert.ok(r.suggestions.some(x=>x.id===p.id));
 r=reviewTypePlate(`E-Nr: ${p.model}/02`);assert.equal(r.needsBrandConfirmation,true);assert.equal(r.confirmationBrand,'Bosch');
}
assert.deepEqual(parseBoschENumber('bbs611bsc / 02'),{base:'BBS611BSC',index:'02',full:'BBS611BSC/02'});
for(const v of ['BBS611BSC/2','BBS611BSC/002','BBS611BSC/XX','BBS611BSC/','PREFIXBBS611BSC/02','BBS611BSC/02/03','https://evil.test/02','BBZ41FGALL','SN:BBS611BSC/02'])assert.equal(parseBoschENumber(v),null,v);
assert.equal(boschServiceLink(a.model),null);assert.equal(boschServiceLink(a.model+'/02').url,'https://www.bosch-home.com/de/de/productservice/BBS611BSC-02');
for(const v of ['Bosch E-Nr: BBS611BSC / 2','Bosch E-Nr: BBS611BSC/002','Bosch E-Nr: BBS611BSC/'])assert.equal(reviewTypePlate(v).hasInvalidFields,true,v);
assert.equal(reviewTypePlate(`Bosch E-Nr: ${a.model}/02 E-Nr: ${a.model}/03`).status,'conflict');
assert.equal(reviewTypePlate(`Bosch E-Nr: ${a.model}/02 EAN: ${ean(b)}`).status,'conflict');
assert.equal(reviewTypePlate(`Bosch E-Nr: ${a.model}/02 E-Nr: BBS999UNKNOWN/02`).status,'conflict');
assert.equal(reviewTypePlate('Miele Bosch\nE-Nr: BBS611BSC/02').status,'unsupported_brand');
assert.equal(reviewTypePlate(`Miele EAN: ${ean(a)}`).suggestions.length,0);
assert.equal(reviewTypePlate('Bosch Material-Nr.: 12560300').suggestions.length,0);
for(const v of [`Bosch\nSeriennummer: ${ean(a)}`,`Bosch\nFD:\n${ean(a)}`,'Bosch\nZ-Nr: BBS611BSC/02'])assert.equal(reviewTypePlate(v).suggestions.length,0);
assert.ok(parseTypePlate('Bosch E-Nr: BBS611BSC/02 FD: 9912 Z-Nr: 1234').entries.filter(e=>e.kind==='serial').length===2);
for(const part of boschPartsCatalog.filter(p=>p.tier==='oem')){
 for(const id of part.identifiers.filter(i=>['material-number','manufacturer-article','ean'].includes(i.type))){const r=reviewScannedCode(id.value);assert.equal(r.status,'part_only',id.value);assert.ok(r.partSuggestions.some(p=>p.id===part.id));assert.equal(r.suggestions.length,0);}
 const identity=partSearchIdentity(part);assert.match(identity.query,/^Bosch /);assert.equal(identity.partKey,partIdentity(part));
 const links=searchLinksForPart(part,'used');assert.match(new URL(links[0].url).searchParams.get('_nkw'),/^Bosch /);assert.equal(new URL(links[0].url).searchParams.get('LH_ItemCondition'),'3000');
}
for(const [value,expected]of [[0,4.7],[19.99,4.7],[20,5.95],[49.99,5.95],[50,0],[100,0]])assert.equal(shippingCost('bosch-de',value),expected);
for(const invalid of [null,NaN,-1,Infinity,'50'])assert.equal(shippingCost('bosch-de',invalid),null);
const part=b.parts[0],note=marketplaceSearchNote(part,b,'used');assert.equal(note.fitmentStatus,'variant_check_required');assert.equal(cartPriceKnown(note),false);
const backup=createBackup({saved:[b.id],deviceMeta:{[b.id]:{nickname:'Bosch im Flur'}}},[{...note,key:`${b.id}:${part.id}:${note.offerId}`,quantity:2}],{}),restored=reviewBackup(JSON.stringify(backup));assert.ok(restored.data.saved.includes(b.id));assert.equal(restored.cart[0].partKey,partIdentity(part));assert.equal(restored.cart[0].price,null);assert.equal(restored.cart[0].fitmentStatus,'variant_check_required');
const plan=buildHandoffPlan(restored.cart,{resolvePart:()=>part});assert.equal(plan.unitCount,2);assert.equal(plan.total,null);assert.equal(plan.groups[0].lines[0].needsVariantCheck,true);assert.match(new URL(plan.groups[0].lines[0].links[0].url).searchParams.get('_nkw'),/^Bosch /);
// A second merchant cannot make a Bosch order qualify for free shipping.
const now=Date.parse('2026-10-06T20:00:00Z'),quote=(merchant,price,rule)=>({merchantId:merchant,merchant,price,quantity:1,currency:'EUR',market:'DE',vatIncluded:true,priceBasis:'unit',stock:'available',checkedAt:new Date(now).toISOString(),shippingRuleId:rule});
const groups=groupCartItems([quote('bosch-de',20,'bosch-de'),quote('miele-de',50,'miele-de')],now);assert.equal(groups[0].shipping,5.95);assert.equal(groups[0].total,25.95);
console.log('Bosch boundary checks passed: /xx parsing, all model references, brand conflicts, FD/serial exclusion, every captured part code, tiered shipping and unresolved cart/backup handoff.');
