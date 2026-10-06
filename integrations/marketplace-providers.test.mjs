import assert from 'node:assert/strict';
import { createEbayProvider, createAmazonProvider } from './marketplace-providers.mjs';
import { searchMarketplaceOffers } from '../site/src/core/marketplaces.js';
import { products } from '../site/src/data/catalog.js';

const NOW=Date.parse('2026-10-06T18:00:00Z');
const part=products.find(p=>p.id==='vac-miele-model-11806000').parts.find(p=>p.id==='miele-part-11936221');
let calls=[];
const forbidden=async()=>{throw new Error('No network call allowed without approval and credentials');};
for(const factory of [createEbayProvider,createAmazonProvider]){
  const provider=factory({env:{},fetchImpl:forbidden,clock:()=>NOW});
  assert.equal(provider.mode,'unavailable');
  assert.equal((await searchMarketplaceOffers({provider,part,now:NOW})).status,'access_required');
}
const response=body=>({ok:true,status:200,json:async()=>body});
const env={EBAY_BUY_APPROVED:'true',EBAY_CLIENT_ID:'TEST_ONLY',EBAY_CLIENT_SECRET:'TEST_ONLY'};
const ebay=createEbayProvider({env,clock:()=>NOW,fetchImpl:async(url,options)=>{
  calls.push({url,options});
  if(url.endsWith('/oauth2/token'))return response({access_token:'TEST_ONLY',expires_in:7200});
  return response({itemSummaries:[]});
}});
assert.equal((await searchMarketplaceOffers({provider:ebay,part,condition:'used',now:NOW})).status,'ok');
assert.equal((await searchMarketplaceOffers({provider:ebay,part,condition:'new',now:NOW})).status,'ok');
assert.equal(calls.length,3,'one cached token and two search calls');
assert.equal(new URLSearchParams(calls[0].options.body).get('grant_type'),'client_credentials');
assert.ok(calls[0].options.headers.Authorization.startsWith('Basic '));
assert.equal(calls[1].options.headers['X-EBAY-C-MARKETPLACE-ID'],'EBAY_DE');
assert.equal(new URL(calls[1].url).searchParams.get('q'),'Miele 11936221');
assert.equal(new URL(calls[1].url).searchParams.get('filter'),'conditionIds:{3000},buyingOptions:{FIXED_PRICE},deliveryCountry:DE');
assert.ok(new URL(calls[2].url).searchParams.get('filter').includes('conditionIds:{1000}'));
assert.equal(createEbayProvider({env:{...env,EBAY_BUY_APPROVED:'false'},fetchImpl:forbidden}).mode,'unavailable');

calls=[];
const amazonEnv={AMAZON_CREATORS_APPROVED:'true',AMAZON_CREDENTIAL_ID:'TEST_ONLY',AMAZON_CREDENTIAL_SECRET:'TEST_ONLY',AMAZON_CREDENTIAL_VERSION:'3.2',AMAZON_PARTNER_TAG:'test-only-21'};
const amazon=createAmazonProvider({env:amazonEnv,clock:()=>NOW,fetchImpl:async(url,options)=>{
  calls.push({url,options});
  return response(url.includes('/auth/o2/token')?{access_token:'TEST_ONLY',expires_in:3600}:{searchResult:{items:[]}});
}});
assert.equal((await searchMarketplaceOffers({provider:amazon,part,condition:'used',now:NOW})).status,'ok');
assert.equal((await searchMarketplaceOffers({provider:amazon,part,condition:'new',now:NOW})).status,'ok');
assert.equal(calls.length,3);
assert.equal(calls[0].url,'https://api.amazon.co.uk/auth/o2/token');
assert.equal(JSON.parse(calls[0].options.body).scope,'creatorsapi::default');
assert.equal(calls[1].url,'https://creatorsapi.amazon/catalog/v1/searchItems');
assert.equal(calls[1].options.headers['x-marketplace'],'www.amazon.de');
const request=JSON.parse(calls[1].options.body);
assert.equal(request.condition,'Used');assert.equal(request.keywords,'Miele 11936221');
assert.equal(request.partnerTag,'test-only-21');assert.equal(request.marketplace,'www.amazon.de');
assert.ok(request.resources.includes('offersV2.listings.condition'));assert.ok(request.resources.includes('offersV2.listings.price'));
assert.equal(JSON.parse(calls[2].options.body).condition,'New');
assert.equal(createAmazonProvider({env:{...amazonEnv,AMAZON_CREDENTIAL_VERSION:'2.2'},fetchImpl:forbidden}).mode,'unavailable','legacy credentials require a separate verified auth implementation');
for(const factory of [createEbayProvider,createAmazonProvider]){
  const provider=factory({env:{...env,...amazonEnv},clock:()=>NOW,fetchImpl:async()=>({ok:false,status:403})});
  const result=await searchMarketplaceOffers({provider,part,now:NOW});
  assert.equal(result.status,'unavailable');assert.deepEqual(result.offers,[]);
  assert.equal(JSON.stringify(result).includes('TEST_ONLY'),false,'credential values never enter client errors');
  const malformed=factory({env:{...env,...amazonEnv},clock:()=>NOW,fetchImpl:async url=>response(String(url).includes('/token')?{access_token:'TEST_ONLY',expires_in:3600}:{unexpected:'payload'})});
  assert.equal((await searchMarketplaceOffers({provider:malformed,part,now:NOW})).status,'unavailable','malformed data cannot look like an empty valid search');
}
console.log('Server provider contract checks passed: disabled access, OAuth and regional Creators authentication, cached tokens, DE marketplace, part queries, condition filters and safe access failures. No external API was called.');
