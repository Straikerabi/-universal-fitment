import assert from 'node:assert/strict';
import { createAuthenticator, createMarketplaceHandler } from './marketplace-handler.mjs';
import { mielePartsCatalog } from '../site/src/data/catalog.js';
import { partSearchIdentity } from '../site/src/core/marketplaces.js';

const userId='00000000-0000-4000-8000-000000000001';
const partIndex=mielePartsCatalog.map(partSearchIdentity);
assert.equal(partIndex.length,167);
assert.equal(new Set(partIndex.map(x=>x.partKey)).size,167);
const url='https://example.invalid/functions/v1/marketplace-search';
const input={provider:'ebay',partKey:partIndex[0].partKey,condition:'used'};
const request=(data=input,headers={})=>new Request(url,{method:'POST',headers:{'content-type':'application/json',...headers},body:typeof data==='string'?data:JSON.stringify(data)});
let providerCalls=0;
const providers={ebay:{mode:'live',search:async()=>{providerCalls++;throw new Error('Must not be called');}},amazon:{mode:'live',search:async()=>{providerCalls++;}}};
const approved=createMarketplaceHandler({env:{MARKETPLACE_USER_IDS:userId},partIndex,providers,authenticate:async()=>({id:userId})});
const health=await approved(new Request(`${url}/health`));
assert.equal(health.status,200);assert.equal((await health.json()).partCount,167);
assert.equal(health.headers.get('cache-control'),'no-store');
assert.equal((await approved(new Request(url))).status,405);
assert.equal((await approved(new Request(`${url}/other`))).status,404);
assert.equal((await approved(request(input,{origin:'https://attacker.invalid'}))).status,403);
const preflight=await approved(new Request(url,{method:'OPTIONS',headers:{origin:'https://straikerabi.github.io'}}));
assert.equal(preflight.status,204);assert.equal(preflight.headers.get('access-control-allow-origin'),'https://straikerabi.github.io');
const unauthenticated=createMarketplaceHandler({partIndex,providers,authenticate:async()=>null});
assert.equal((await unauthenticated(request())).status,401);
const noPilot=createMarketplaceHandler({partIndex,providers,authenticate:async()=>({id:userId})});
assert.equal((await noPilot(request())).status,403);
const authFailure=createMarketplaceHandler({partIndex,providers,authenticate:async()=>{throw new Error('Sensitive internal error');}});
const authResponse=await authFailure(request());assert.equal(authResponse.status,503);assert.deepEqual(await authResponse.json(),{status:'auth_unavailable'});
for(const bad of [null,[],{...input,query:'unrestricted search'},{...input,url:'https://internal.invalid'},
  {...input,partKey:'device-material-number'},{...input,provider:'other'},{...input,condition:'defective'},'{']){
  assert.equal((await approved(request(bad))).status,400);
}
assert.equal((await approved(request('x'.repeat(4097)))).status,413);
const oversizedUtf8=request(JSON.stringify('é'.repeat(2050)));
assert.equal((await approved(oversizedUtf8)).status,413);
const stalledBody=new ReadableStream({start(){}});
const stalled=new Request(url,{method:'POST',headers:{'content-type':'application/json'},body:stalledBody,duplex:'half'});
assert.equal((await approved(stalled)).status,408);
assert.equal((await approved(request(input,{'content-type':'text/plain'}))).status,415);
for(const part of partIndex){
  const response=await approved(request({...input,partKey:part.partKey}));
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{provider:'ebay',partKey:part.partKey,status:'access_required',offers:[]});
}
const guarded=createMarketplaceHandler({env:{MARKETPLACE_USER_IDS:userId,MARKETPLACE_LIVE_ENABLED:'true'},partIndex,providers,authenticate:async()=>({id:userId})});
const guardedResponse=await guarded(request());assert.equal(guardedResponse.status,503);assert.equal((await guardedResponse.json()).status,'quota_unavailable');
assert.equal(providerCalls,0);

const rawOffer={provider:'ebay',offerId:'test-listing',title:'Seller claim',url:'https://www.ebay.de/itm/123',condition:'used',
  fixedPrice:true,price:19,currency:'EUR',checkedAt:new Date().toISOString(),dataMode:'live'};
let quotaCalls=0,searchCalls=0;
const liveEnv={MARKETPLACE_USER_IDS:userId,MARKETPLACE_LIVE_ENABLED:'true'};
const liveOptions={env:liveEnv,partIndex,authenticate:async()=>({id:userId}),providers:{ebay:{mode:'live',search:async(identity)=>{
  searchCalls++;assert.equal(identity.query,partIndex[0].query);assert.equal(identity.market,'DE');return {status:'ok',offers:[rawOffer,{...rawOffer,testData:true}]};
}}},reserveQuota:async(id,provider)=>{quotaCalls++;assert.equal(id,userId);assert.equal(provider,'ebay');return {allowed:true};}};
const live=createMarketplaceHandler(liveOptions);
const liveResult=await (await live(request())).json();assert.equal(liveResult.offers.length,1);
assert.equal(liveResult.offers[0].fitmentStatus,'offer_check_required');assert.equal(quotaCalls,1);assert.equal(searchCalls,1);
const limited=createMarketplaceHandler({...liveOptions,reserveQuota:async()=>({allowed:false,retryAfterSeconds:42})});
const limitedResult=await limited(request());assert.equal(limitedResult.status,429);assert.equal(limitedResult.headers.get('retry-after'),'42');assert.equal(searchCalls,1);
const quotaDown=createMarketplaceHandler({...liveOptions,reserveQuota:async()=>{throw new Error('internal secret');}});
assert.equal((await quotaDown(request())).status,503);assert.equal(searchCalls,1);
const failing=createMarketplaceHandler({...liveOptions,providers:{ebay:{mode:'live',search:async()=>{throw new Error('provider secret');}}}});
assert.deepEqual(await (await failing(request())).json(),{status:'unavailable',offers:[]});
const timeout=createMarketplaceHandler({...liveOptions,timeoutMs:10,providers:{ebay:{mode:'live',search:async()=>new Promise(()=>{})}}});
assert.equal((await timeout(request())).status,504);

let authCalls=0;
const env={SUPABASE_URL:'https://test-project.invalid',SUPABASE_ANON_KEY:'test-public-key'};
const auth=createAuthenticator({env,fetchImpl:async(target,options)=>{
  authCalls++;assert.equal(target,'https://test-project.invalid/auth/v1/user');
  assert.equal(options.headers.apikey,'test-public-key');assert.equal(options.headers.authorization,'Bearer header.payload.signature');
  return Response.json({id:userId,role:'authenticated',is_anonymous:false,user_metadata:{admin:true}});
}});
assert.equal(await auth(request()),null);assert.equal(authCalls,0);
assert.equal(await auth(request(input,{authorization:'Bearer sb_publishable_test'})),null);assert.equal(authCalls,0);
assert.deepEqual(await auth(request(input,{authorization:'Bearer header.payload.signature'})),{id:userId});assert.equal(authCalls,1);
for(const payload of [{role:'anon'}, {id:userId,role:'authenticated',is_anonymous:true}, {id:userId,role:'service_role'}]){
  const verify=createAuthenticator({env,fetchImpl:async()=>Response.json(payload)});
  assert.equal(await verify(request(input,{authorization:'Bearer header.payload.signature'})),null);
}
const expired=createAuthenticator({env,fetchImpl:async()=>new Response(null,{status:401})});
assert.equal(await expired(request(input,{authorization:'Bearer header.payload.signature'})),null);
const serverFailure=createAuthenticator({env,fetchImpl:async()=>new Response(null,{status:500})});
await assert.rejects(serverFailure(request(input,{authorization:'Bearer header.payload.signature'})));
for(const keyEnv of [
  {...env,MARKETPLACE_SUPABASE_PUBLISHABLE_KEY:'test-preferred-key'},
  {...env,SUPABASE_PUBLISHABLE_KEYS:JSON.stringify({default:'test-preferred-key'})},
  {...env,SUPABASE_PUBLISHABLE_KEYS:JSON.stringify({default:'KEY_ENV'}),KEY_ENV:'test-preferred-key'}
]){
  const verify=createAuthenticator({env:keyEnv,fetchImpl:async(target,options)=>{
    assert.equal(options.headers.apikey,'test-preferred-key');return Response.json({id:userId,role:'authenticated',is_anonymous:false});
  }});
  assert.deepEqual(await verify(request(input,{authorization:'Bearer header.payload.signature'})),{id:userId});
}
console.log('Marketplace endpoint checks passed: Auth, pilot isolation, CORS, all 167 parts, quota gates and bounded provider dispatch. No external API was called.');
