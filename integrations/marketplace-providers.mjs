// Server-only modules; GitHub Pages publishes site/, never this directory.
import { Buffer } from 'node:buffer';
import { ebayListings, amazonListings } from '../site/src/core/marketplaces.js';

async function readJson(response){
  if(!response.ok)throw new Error(`Marketplace request failed (${response.status})`);
  return response.json();
}
function cachedToken(fetchToken,clock){
  let token=null,expires=0,pending=null;
  return async signal=>{
    if(token&&clock()<expires)return token;
    if(!pending)pending=fetchToken(signal).then(data=>{
      if(!data?.access_token||!Number.isFinite(Number(data.expires_in)))throw new Error('Invalid token response');
      token=data.access_token;expires=clock()+Math.max(0,Number(data.expires_in)-60)*1000;return token;
    }).finally(()=>{pending=null;});
    return pending;
  };
}
const disabled=id=>({id,mode:'unavailable',search:async()=>({status:'access_required',offers:[]})});

export function createEbayProvider({env=process.env,fetchImpl=fetch,clock=Date.now}={}){
  if(env.EBAY_BUY_APPROVED!=='true'||!env.EBAY_CLIENT_ID||!env.EBAY_CLIENT_SECRET)return disabled('ebay');
  const token=cachedToken(async signal=>readJson(await fetchImpl('https://api.ebay.com/identity/v1/oauth2/token',{
    method:'POST',signal,headers:{'Content-Type':'application/x-www-form-urlencoded',Authorization:`Basic ${Buffer.from(`${env.EBAY_CLIENT_ID}:${env.EBAY_CLIENT_SECRET}`).toString('base64')}`},
    body:new URLSearchParams({grant_type:'client_credentials',scope:'https://api.ebay.com/oauth/api_scope'}).toString()
  })),clock);
  return {id:'ebay',mode:'live',async search({query,condition},{signal}={}){
    const accessToken=await token(signal);
    const ids=condition==='used'?'3000':condition==='new'?'1000':'1000|1500|1750|2000|2010|2020|2030|2500|3000';
    const url=new URL('https://api.ebay.com/buy/browse/v1/item_summary/search');
    url.searchParams.set('q',query);url.searchParams.set('limit','20');
    url.searchParams.set('filter',`conditionIds:{${ids}},buyingOptions:{FIXED_PRICE},deliveryCountry:DE`);
    const payload=await readJson(await fetchImpl(url.href,{signal,headers:{Authorization:`Bearer ${accessToken}`,'X-EBAY-C-MARKETPLACE-ID':'EBAY_DE','Accept-Language':'de-DE'}}));
    if(!Array.isArray(payload.itemSummaries)&&payload.total!==0)throw new Error('Invalid eBay search response');
    return {status:'ok',offers:ebayListings(payload,new Date(clock()).toISOString())};
  }};
}

export function createAmazonProvider({env=process.env,fetchImpl=fetch,clock=Date.now}={}){
  const tokenHosts={'3.1':'https://api.amazon.com/auth/o2/token','3.2':'https://api.amazon.co.uk/auth/o2/token','3.3':'https://api.amazon.co.jp/auth/o2/token'};
  const version=env.AMAZON_CREDENTIAL_VERSION||'3.2';
  if(env.AMAZON_CREATORS_APPROVED!=='true'||!env.AMAZON_CREDENTIAL_ID||!env.AMAZON_CREDENTIAL_SECRET||!env.AMAZON_PARTNER_TAG||!tokenHosts[version])return disabled('amazon');
  const token=cachedToken(async signal=>readJson(await fetchImpl(tokenHosts[version],{method:'POST',signal,headers:{'Content-Type':'application/json'},
    body:JSON.stringify({grant_type:'client_credentials',client_id:env.AMAZON_CREDENTIAL_ID,client_secret:env.AMAZON_CREDENTIAL_SECRET,scope:'creatorsapi::default'})
  })),clock);
  return {id:'amazon',mode:'live',async search({query,condition},{signal}={}){
    const accessToken=await token(signal);
    const payload=await readJson(await fetchImpl('https://creatorsapi.amazon/catalog/v1/searchItems',{method:'POST',signal,
      headers:{Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json','x-marketplace':'www.amazon.de'},
      body:JSON.stringify({keywords:query,condition:condition==='used'?'Used':condition==='new'?'New':'Any',marketplace:'www.amazon.de',partnerTag:env.AMAZON_PARTNER_TAG,itemCount:10,
        resources:['itemInfo.title','offersV2.listings.condition','offersV2.listings.merchantInfo','offersV2.listings.price']})
    }));
    if(!Array.isArray(payload.searchResult?.items))throw new Error('Invalid Amazon search response');
    return {status:'ok',offers:amazonListings(payload,new Date(clock()).toISOString())};
  }};
}
