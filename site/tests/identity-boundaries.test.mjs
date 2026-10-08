import assert from 'node:assert/strict';
import {lookupOpenFactsBarcode,lookupUpcItemDbBarcode,searchUpcItemDb,resolveProductQuery} from '../src/data/product-resolver.js';
import {products} from '../src/data/catalog.js';
import {matchProducts,matchReason} from '../src/core/matcher.js';
const deferred=()=>{let resolve;return {promise:new Promise(r=>resolve=r),resolve:value=>resolve(value)};};
const p=products.find(p=>p.id==='vac-miele-model-12560300'),ean=p.identifiers.find(i=>i.type==='ean').value;
for(const value of ['SERIAL '+ean,ean+'X','1234567890123']){
 let calls=0;const opts={fetchFn:async()=>{calls++;assert.fail('invalid barcode should not query a lookup');}};
 assert.equal((await lookupOpenFactsBarcode(value,opts)).status,'not-applicable');assert.equal((await lookupUpcItemDbBarcode(value,opts)).status,'not-applicable');assert.equal(calls,0);
}
const other=products.find(p=>p.id==='vac-miele-model-12887840').identifiers.find(i=>i.type==='ean').value;
let r=await lookupUpcItemDbBarcode(ean,{fetchFn:async()=>({ok:true,json:async()=>({items:[{ean:other,title:'Wrong response',brand:'Miele'}]})})});assert.equal(r.status,'not-found');
r=await lookupOpenFactsBarcode(ean,{fetchFn:async()=>({ok:true,json:async()=>({code:other,product:{product_name:'Wrong response',brands:'Miele'}})})});assert.equal(r.status,'not-found');
for(const bad of [{},null,'invalid']){r=await lookupUpcItemDbBarcode(ean,{fetchFn:async()=>({ok:true,json:async()=>({items:bad})})});assert.equal(r.status,'not-found');}
const cancel=new AbortController(),pending=deferred();let calls=0,requestSignal;
const lookup=resolveProductQuery([],ean,{signal:cancel.signal,fetchFn:(_url,opts)=>{calls++;requestSignal=opts.signal;return pending.promise;}});
cancel.abort();r=await lookup;assert.equal(r.externalStatus,'cancelled');assert.equal(calls,1,'abort prevents every fallback request');assert.equal(requestSignal.aborted,true);pending.resolve({ok:true,json:async()=>({items:[{ean,title:'Late',brand:'Miele'}]})});await Promise.resolve();assert.equal(r.externalCandidates.length,0);
const cancelled=new AbortController();cancelled.abort();r=await searchUpcItemDb('Miele',{signal:cancelled.signal,fetchFn:()=>assert.fail('no request after pre-cancel')});assert.equal(r.status,'cancelled');
r=await searchUpcItemDb('Miele',{timeoutMs:10,fetchFn:()=>new Promise(()=>{})});assert.equal(r.status,'error');assert.equal(r.reason,'timeout','timeout settles even if an adapter ignores AbortSignal');
r=await searchUpcItemDb('Miele',{timeoutMs:10,fetchFn:async()=>({ok:true,json:()=>new Promise(()=>{})})});assert.equal(r.reason,'timeout','body parsing is bounded too');
assert.ok(matchReason(p,'12560300').includes('Materialnummer'));assert.ok(matchReason(p,ean).includes('EAN'));assert.ok(matchReason(p,p.identifiers.find(i=>i.type==='product-type').value).includes('Variante prüfen'));
assert.ok(matchReason(p,'unexpected text').includes('Ähnlicher'));assert.equal(matchProducts(products,'SERIAL '+ean).some(x=>x.score===100),false);
for(const x of matchProducts(products,'12557060',{limit:100}))assert.ok(matchReason(x.product,'12557060').includes('Zubehörkennung'));
console.log('Identity boundary checks passed: typed lookup input, exact returned barcode, malformed responses, cancellation without fallbacks, bounded request/body and explanatory search labels. No external request made.');
