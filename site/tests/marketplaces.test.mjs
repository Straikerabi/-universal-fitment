import assert from 'node:assert/strict';
import fs from 'node:fs';
import { products, mielePartsCatalog } from '../src/data/catalog.js';
import { partIdentity } from '../src/data/miele-parts.js';
import { cartQuoteItem, groupCartItems, cartPriceKnown } from '../src/data/miele-commerce.js';
import { partSearchIdentity, searchLinksForPart, marketplaceSearchNote, normalizeMarketplaceOffer, searchMarketplaceOffers, ebayListings, amazonListings } from '../src/core/marketplaces.js';

const NOW=Date.parse('2026-10-06T18:00:00Z'),checkedAt=new Date(NOW).toISOString();
const hx2=products.find(p=>p.id==='vac-miele-model-11806000');
const hx3=products.find(p=>p.vacuumMeta.series==='Triflex HX3'&&p.recordType==='model');
const battery=hx2.parts.find(p=>p.id==='aftermarket-vhbw-889005195');
const brush=hx2.parts.find(p=>partIdentity(p)==='oem:11936221');
for(const part of mielePartsCatalog){
  const identity=partSearchIdentity(part),links=searchLinksForPart(part);
  assert.ok(identity&&identity.query.includes(identity.code.replace(/-/g,' '))||part.tier==='aftermarket');
  assert.equal(links.length,2);
  const ebay=new URL(links[0].url),amazon=new URL(links[1].url);
  assert.equal(ebay.hostname,'www.ebay.de');assert.equal(amazon.hostname,'www.amazon.de');
  assert.equal(ebay.searchParams.get('_nkw'),identity.query);
  assert.equal(amazon.searchParams.get('k'),identity.query);
  assert.equal(ebay.searchParams.get('LH_ItemCondition'),'3000');
  assert.equal(ebay.searchParams.get('LH_BIN'),'1');
  assert.equal(amazon.searchParams.has('tag'),false,'no invented affiliate tags');
  assert.equal(links[1].conditionApplied,false,'Amazon links do not pretend to filter condition');
}
assert.equal(new URL(searchLinksForPart(brush,'new')[0].url).searchParams.get('LH_ItemCondition'),'1000');
assert.equal(new URL(searchLinksForPart(brush,'all')[0].url).searchParams.has('LH_ItemCondition'),false);
assert.equal(searchLinksForPart(brush,'invalid')[0].conditionApplied,true);
assert.equal(partSearchIdentity({tier:'oem',identifiers:[{type:'device-material',value:'11806000'}]}),null,'device IDs never stand in for part IDs');
assert.ok(!partSearchIdentity(brush).query.includes('11806000'));
assert.deepEqual(searchLinksForPart(null),[]);

const note=marketplaceSearchNote(battery,hx2,'used');
assert.equal(note.requestedCondition,'used');assert.equal(note.price,null);assert.equal(note.stock,'unknown');
assert.equal(note.lookupLinks.length,2);assert.equal(note.entryType,'marketplace-search');
assert.equal(marketplaceSearchNote(battery,hx3),null,'marketplace search does not broaden HX2 fitment to HX3');
assert.equal(cartQuoteItem(battery,hx3,NOW),null,'a quoted part must be mapped to the chosen device');
assert.equal(marketplaceSearchNote(battery,null),null);
const sourceQuote=cartQuoteItem(brush,hx2,NOW);
assert.ok(sourceQuote);
const groups=groupCartItems([{...sourceQuote,quantity:1},{...note,quantity:1}],NOW);
assert.equal(groups.length,2);assert.equal(groups[0].knownSubtotal,30.15);assert.equal(groups[0].total,36.65);
assert.equal(groups[1].knownSubtotal,0);assert.equal(groups[1].unknownPriceCount,1);assert.equal(groups[1].shipping,null);assert.equal(groups[1].total,null);
assert.equal(cartPriceKnown({...note,...sourceQuote},NOW),false,'a search note cannot be turned into a confirmed price by merging a source quote');
assert.equal(cartPriceKnown({...sourceQuote,testData:true},NOW),false);
assert.equal(cartPriceKnown({...sourceQuote,dataMode:'sandbox'},NOW),false);
assert.equal(cartPriceKnown({...sourceQuote,fitmentStatus:'offer_check_required'},NOW),false);
const sellers=groupCartItems([{...sourceQuote,provider:'ebay',merchantId:'ebay',sellerId:'seller-a'}, {...sourceQuote,provider:'ebay',merchantId:'ebay',sellerId:'seller-b'}],NOW);
assert.equal(sellers.length,2,'different sellers on one marketplace cannot share a shipping threshold');
assert.equal(sellers[0].shipping,6.50);assert.equal(sellers[1].shipping,6.50);

// Synthetic external responses exist only in tests and are never imported by the public UI.
const listing={provider:'ebay',offerId:'test-listing',title:'TEST ONLY Miele 11936221',url:'https://www.ebay.de/itm/123456789012',sellerId:'test-seller',condition:'used',fixedPrice:true,price:20,currency:'EUR',checkedAt,dataMode:'live'};
const normalized=normalizeMarketplaceOffer({...listing,identityStatus:'manufacturer_verified',fitmentStatus:'manufacturer_verified',shipping:0},'ebay',NOW);
assert.equal(normalized.identityStatus,'unverified');assert.equal(normalized.fitmentStatus,'offer_check_required');assert.equal(normalized.shipping,null);
assert.equal(normalizeMarketplaceOffer({...listing,price:null},'ebay',NOW).price,null);
assert.equal(normalizeMarketplaceOffer({...listing,currency:'USD'},'ebay',NOW).price,null);
for(const extra of [{condition:'for-parts'},{condition:'unknown'},{fixedPrice:false},{testData:true},{dataMode:'sandbox'}, {url:'javascript:alert(1)'},{url:'https://www.ebay.de.evil.example/itm/1'},{url:'https://www.ebay.de@evil.example/itm/1'}, {checkedAt:new Date(NOW-3600001).toISOString()}]){
  assert.equal(normalizeMarketplaceOffer({...listing,...extra},'ebay',NOW),null);
}
let calls=0;
const result=await searchMarketplaceOffers({provider:{id:'ebay',mode:'unavailable',search(){calls++;}},part:brush,now:NOW});
assert.equal(result.status,'access_required');assert.equal(calls,0);assert.deepEqual(result.offers,[]);
const provider={id:'ebay',mode:'live',async search(request){assert.equal(request.partKey,'oem:11936221');assert.equal(request.market,'DE');return {status:'ok',offers:[listing,{...listing,offerId:'new',condition:'new'},{...listing,testData:true}]};}};
assert.equal((await searchMarketplaceOffers({provider,part:brush,condition:'used',now:NOW})).offers.length,1,'used requests reject new offers and flagged fixtures');
assert.equal((await searchMarketplaceOffers({provider,part:brush,condition:'new',now:NOW})).offers[0].condition,'new');
assert.equal((await searchMarketplaceOffers({provider,part:brush,condition:'all',now:NOW})).offers.length,2);
assert.equal((await searchMarketplaceOffers({provider:{...provider,search:async()=>{throw new Error('API offline');}},part:brush,now:NOW})).status,'unavailable');
assert.equal((await searchMarketplaceOffers({provider:{...provider,search:async()=>new Promise(()=>{})},part:brush,now:NOW,timeoutMs:5})).status,'timeout');
assert.equal((await searchMarketplaceOffers({provider:{...provider,mode:'sandbox'},part:brush,now:NOW})).status,'access_required');

const ebayPayload={itemSummaries:[{itemId:'test',itemWebUrl:listing.url,title:listing.title,conditionId:'3000',buyingOptions:['FIXED_PRICE'],price:{value:'20.00',currency:'EUR'},seller:{username:'test-seller'}}]};
const e=ebayListings(ebayPayload,checkedAt)[0];assert.equal(e.condition,'used');assert.equal(e.price,20);assert.equal(e.identityStatus,'unverified');
assert.equal(ebayListings({...ebayPayload,itemSummaries:[{...ebayPayload.itemSummaries[0],conditionId:'7000'}]},checkedAt)[0].condition,'for-parts');
assert.equal(normalizeMarketplaceOffer(ebayListings({...ebayPayload,testData:true},checkedAt)[0],'ebay',NOW),null);
const amazonPayload={searchResult:{items:[{asin:'TESTONLY01',detailPageURL:'https://www.amazon.de/dp/TESTONLY01',itemInfo:{title:{displayValue:'TEST ONLY'}},offersV2:{listings:[{condition:{value:'Used'},merchantInfo:{id:'test-seller',name:'Test only'},price:{money:{amount:19.95,currency:'EUR'}}}]}}]}};
const a=amazonListings(amazonPayload,checkedAt)[0];assert.equal(a.condition,'used');assert.equal(a.price,19.95);assert.equal(a.shipping,null);
amazonPayload.searchResult.items[0].offersV2.listings[0].violatesMAP=true;
assert.equal(amazonListings(amazonPayload,checkedAt)[0].price,null,'a MAP-suppressed price must remain hidden');
assert.deepEqual(amazonListings({searchResult:{items:[{asin:'TESTONLY02'}]}},checkedAt),[],'missing featured offers are not fabricated');

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8'),sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');
assert.ok(sw.includes("'./app-v1.26.8.js'"));
assert.ok(!/from.*(fixtures|integrations\/)/.test(app),'the public UI does not load mocks or server credentials');
console.log('Marketplace checks passed: 167 part searches, condition semantics, device boundaries, open-price cart notes, distinct sellers, mock isolation, price age, API failures and deadlines.');
