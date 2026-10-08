import assert from 'node:assert/strict';
import { isBarcodeQuery, lookupOpenFactsBarcode, lookupUpcItemDbBarcode, searchUpcItemDb, resolveProductQuery } from '../src/data/product-resolver.js';
import { products } from '../src/data/demo-products.js';

assert.equal(isBarcodeQuery('3017620422003'),true);
assert.equal(isBarcodeQuery('WAN282H3'),false);

const openFactsFetch=async url=>({
  ok:true,status:200,
  async json(){
    if(String(url).includes('upcitemdb')) return {items:[]};
    return {code:'3017620422003',product:{product_name:'Test Product',brands:'Example',quantity:'1 pc',image_front_url:'https://example.test/p.jpg'}};
  }
});
const hit=await lookupOpenFactsBarcode('3017620422003',{fetchFn:openFactsFetch,timeoutMs:50});
assert.equal(hit.status,'found');
assert.equal(hit.candidate.brand,'Example');
assert.equal(hit.candidate.verifiedCompatibility,false);
assert.equal(hit.candidate.evidenceGrade,'C');

const upcFetch=async()=>({
  ok:true,status:200,
  async json(){return {items:[{ean:'8004399021549',title:"De'Longhi Magnifica Coffee Machine",brand:"De'Longhi",model:'ECAM22.110.B',category:'Home > Coffee Machines',images:['https://example.test/coffee.jpg']}]};}
});
const upc=await lookupUpcItemDbBarcode('8004399021549',{fetchFn:upcFetch,timeoutMs:50});
assert.equal(upc.status,'found');
assert.equal(upc.candidates[0].model,'ECAM22.110.B');
assert.equal(upc.candidates[0].verifiedCompatibility,false);

const search=await searchUpcItemDb('ECAM22.110.B',{fetchFn:upcFetch,timeoutMs:50});
assert.equal(search.status,'found');
assert.equal(search.candidates[0].source,'UPCitemdb');

const notFound=await lookupOpenFactsBarcode('3017620422003',{fetchFn:async()=>({ok:false,status:404,json:async()=>({})})});
assert.equal(notFound.status,'not-found');

const local=await resolveProductQuery(products,'WAN282H3',{fetchFn:async()=>{throw new Error('must not fetch')}});
assert.ok(local.localMatches[0].score>=96);
assert.equal(local.usedExternal,false);

const ext=await resolveProductQuery(products,'8004399021549',{fetchFn:upcFetch});
assert.equal(ext.usedExternal,true);
assert.equal(ext.externalCandidates[0]?.model,'ECAM22.110.B');
assert.equal(ext.externalStatus,'found');

const textExt=await resolveProductQuery(products,'ECAM22.110.B',{fetchFn:upcFetch});
assert.equal(textExt.usedExternal,true);
assert.equal(textExt.externalCandidates.length,1);
console.log('All resolver checks passed.');
