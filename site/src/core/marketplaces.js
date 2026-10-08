import { partIdentity } from '../data/miele-parts.js';

export const marketplaceConditions=[['used','Gebraucht'],['new','Neu'],['all','Alle Zustände']];
export const marketplaceProviders={
  ebay:{name:'eBay',status:'access_required',requirementsUrl:'https://developer.ebay.com/api-docs/buy/buy-requirements.html'},
  amazon:{name:'Amazon',status:'access_required',requirementsUrl:'https://partnernet.amazon.de/creatorsapi/docs/en-us/introduction'}
};
export const normalizeCondition=value=>marketplaceConditions.some(([id])=>id===value)?value:'used';

export function partSearchIdentity(part){
  if(!part||!['oem','aftermarket'].includes(part.tier))return null;
  const identifier=part.identifiers?.find(i=>i.type===(part.tier==='oem'?'material-number':'supplier-article'))||part.identifiers?.find(i=>part.tier==='oem'&&['manufacturer-article','manufacturer-designation'].includes(i.type));
  if(!identifier?.value)return null;
  const code=String(identifier.value).trim();
  const brand=part.tier==='oem'?(part.brand||'Miele'):String(part.name||'').split(/[\s·]/)[0];
  const queryCode=code.replace(new RegExp(`^${brand}-`,'i'),'').replace(/-/g,' ');
  return {partKey:partIdentity(part),code,codeType:identifier.type,query:`${brand} ${queryCode}`.trim()};
}

export function searchLinksForPart(part,condition='used'){
  const identity=partSearchIdentity(part);
  if(!identity)return [];
  condition=normalizeCondition(condition);
  const ebay=new URL('https://www.ebay.de/sch/i.html');
  ebay.searchParams.set('_nkw',identity.query);
  ebay.searchParams.set('LH_BIN','1');
  if(condition==='used')ebay.searchParams.set('LH_ItemCondition','3000');
  else if(condition==='new')ebay.searchParams.set('LH_ItemCondition','1000');
  const amazon=new URL('https://www.amazon.de/s');
  amazon.searchParams.set('k',identity.query);
  return [
    {provider:'ebay',name:'eBay',url:ebay.href,label:condition==='used'?'Gebraucht auf eBay':condition==='new'?'Neu auf eBay':'Auf eBay suchen',conditionApplied:condition!=='all',note:'Sofort-Kaufen-Suche. Zustand und Teilenummer im einzelnen Angebot prüfen.'},
    {provider:'amazon',name:'Amazon',url:amazon.href,label:'Amazon Kaufoptionen',conditionApplied:false,note:condition==='used'?'Gebrauchte Kaufoptionen, falls verfügbar, auf der Produktseite prüfen.':condition==='new'?'Zustand „Neu“ auf der Produktseite prüfen.':'Zustand und Kaufoptionen auf der Produktseite prüfen.'}
  ];
}

export function marketplaceSearchNote(part,product,condition='used'){
  const mapped=product?.parts?.find(p=>p.id===part?.id&&partIdentity(p)===partIdentity(part));
  const candidate=product?.candidateParts?.find(p=>p.id===part?.id&&partIdentity(p)===partIdentity(part));
  if(!mapped&&!candidate)return null;
  const links=searchLinksForPart(part,condition);
  if(!links.length)return null;
  condition=normalizeCondition(condition);
  return {entryType:'marketplace-search',productId:product.id,partId:part.id,partKey:partIdentity(part),label:part.name,
    productLabel:`${product.brand} ${product.model}`,fitment:mapped?.fitment.confidence||0,
    fitmentStatus:candidate?'variant_check_required':mapped.fitment.status,
    offerId:`search:${partIdentity(part)}:${condition}`,merchant:'Anbieter noch auswählen',price:null,stock:'unknown',requestedCondition:condition,
    lookupLinks:links.map(({provider,name,url})=>({provider,name,url}))};
}

const amount=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0?value:null;
const moneyValue=value=>typeof value==='string'&&/^\d+(\.\d{1,2})?$/.test(value)?amount(Number(value)):amount(value);
const ebayCondition=id=>id==='1000'?'new':id==='3000'?'used':['2000','2010','2020','2030','2500'].includes(id)?'refurbished':id==='7000'?'for-parts':'unknown';
function listingUrl(value,provider){
  try{const url=new URL(value);const hosts=provider==='ebay'?['www.ebay.de','www.ebay.com','ebay.de','ebay.com']:['www.amazon.de','amazon.de'];return url.protocol==='https:'&&!url.username&&!url.password&&hosts.includes(url.hostname)?url.href:null;}catch{return null;}
}

// These adapters preserve seller claims. A search title never supplies a verified part identity.
export function ebayListings(payload,checkedAt){
  return (payload?.itemSummaries||[]).map(item=>({provider:'ebay',offerId:item.itemId,title:item.title,url:item.itemWebUrl,
    sellerId:item.seller?.username||null,seller:item.seller?.username||null,condition:ebayCondition(String(item.conditionId)),
    fixedPrice:item.buyingOptions?.includes('FIXED_PRICE')===true,price:moneyValue(item.price?.value),currency:item.price?.currency||null,
    shipping:null,delivery:null,checkedAt,identifiers:[],identityStatus:'unverified',dataMode:payload.dataMode||'live',testData:payload.testData===true||item.testData===true}));
}
export function amazonListings(payload,checkedAt){
  return (payload?.searchResult?.items||payload?.itemsResult?.items||[]).flatMap(item=>(item.offersV2?.listings||[]).map((offer,index)=>({
    provider:'amazon',offerId:`${item.asin}:${offer.merchantInfo?.id||'unknown'}:${offer.condition?.value||'unknown'}:${index}`,
    title:item.itemInfo?.title?.displayValue,url:item.detailPageURL,sellerId:offer.merchantInfo?.id||null,seller:offer.merchantInfo?.name||null,
    condition:offer.condition?.value==='Used'?'used':offer.condition?.value==='New'?'new':offer.condition?.value==='Refurbished'?'refurbished':'unknown',
    fixedPrice:true,price:offer.violatesMAP===true?null:moneyValue(offer.price?.money?.amount),currency:offer.price?.money?.currency||null,
    shipping:null,delivery:null,checkedAt,identifiers:[],identityStatus:'unverified',dataMode:payload.dataMode||'live',testData:payload.testData===true||item.testData===true||offer.testData===true
  })));
}

export function normalizeMarketplaceOffer(raw,provider,now=Date.now()){
  const url=listingUrl(raw?.url,provider);
  const age=Number(now)-Date.parse(raw?.checkedAt);
  if(!raw||raw.provider!==provider||raw.dataMode!=='live'||raw.testData===true||!raw.offerId||!url||raw.fixedPrice!==true||
    ['for-parts','unknown'].includes(raw.condition)||!['used','new','refurbished'].includes(raw.condition)||!Number.isFinite(age)||age< -300000||age>3600000)return null;
  // No shipping estimate, fitment approval or review score is inferred from a listing.
  return {provider,offerId:String(raw.offerId),title:String(raw.title||''),url,sellerId:raw.sellerId?String(raw.sellerId):null,seller:raw.seller?String(raw.seller):null,
    condition:raw.condition,price:raw.currency==='EUR'?amount(raw.price):null,currency:raw.currency==='EUR'?'EUR':null,shipping:null,delivery:null,
    checkedAt:raw.checkedAt,identityStatus:'unverified',fitmentStatus:'offer_check_required',dataMode:'live'};
}

// An approved server provider can be injected here. The static site has no credentials or live provider.
export async function searchMarketplaceOffers({provider,part,condition='used',now=Date.now(),timeoutMs=10000}={}){
  const identity=partSearchIdentity(part),id=provider?.id;
  if(!identity||!marketplaceProviders[id])return {status:'invalid_request',offers:[]};
  if(provider.mode!=='live'||typeof provider.search!=='function')return {provider:id,status:'access_required',offers:[]};
  const controller=new AbortController();
  let timer;
  const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('timeout'));},timeoutMs);});
  try{
    const result=await Promise.race([provider.search({...identity,condition:normalizeCondition(condition),market:'DE'},{signal:controller.signal}),timeout]);
    if(result?.status==='access_required')return {provider:id,status:'access_required',offers:[]};
    if(result?.status!=='ok'||!Array.isArray(result.offers))return {provider:id,status:'unavailable',offers:[]};
    const offers=result.offers.map(o=>normalizeMarketplaceOffer(o,id,now)).filter(o=>o&&(condition==='all'||o.condition===normalizeCondition(condition)));
    return {provider:id,status:'ok',offers};
  }catch{return {provider:id,status:controller.signal.aborted?'timeout':'unavailable',offers:[]};}
  finally{clearTimeout(timer);}
}
