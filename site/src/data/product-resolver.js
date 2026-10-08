import { matchProducts } from '../core/matcher.js';
import { normalizeGTIN } from '../core/normalization.js';
import { classifyIdentifier, isValidGTIN } from '../core/identifiers.js';

const DEFAULT_TIMEOUT_MS = 5200;
const OPEN_PRODUCTS_FACTS_ENDPOINT = code => `https://world.openproductsfacts.org/api/v3/product/${encodeURIComponent(code)}?fields=code,product_name,brands,image_front_url,product_type,categories_tags,quantity&lc=de&cc=de`;
const OPEN_FACTS_FALLBACK_ENDPOINT = code => `https://world.openfoodfacts.org/api/v3/product/${encodeURIComponent(code)}?product_type=all&fields=code,product_name,brands,image_front_url,product_type,categories_tags,quantity&lc=de&cc=de`;
const UPCITEMDB_LOOKUP_ENDPOINT = code => `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(code)}`;
const UPCITEMDB_SEARCH_ENDPOINT = query => `https://api.upcitemdb.com/prod/trial/search?s=${encodeURIComponent(query)}&match_mode=0&type=product`;

export function isBarcodeQuery(value=''){
  return isValidGTIN(value);
}

function rawBarcode(value=''){
  if(!isValidGTIN(value))return null;
  const digits=String(value).replace(/\D/g,'');
  return [8,12,13,14].includes(digits.length) ? digits : null;
}

function externalCandidateFromOpenFacts(payload){
  const product=payload?.product;
  if(!product || !payload?.code) return null;
  const name=product.product_name || product.generic_name || '';
  const brands=product.brands || '';
  if(!name && !brands) return null;
  return {
    id:`external-openfacts-${payload.code}`,
    source:'Open Products Facts', sourceKey:'open-products-facts',
    sourceUrl:`https://world.openproductsfacts.org/product/${encodeURIComponent(payload.code)}`,
    code:String(payload.code), name:name || 'Unbenanntes Produkt', title:name || 'Unbenanntes Produkt',
    brand:brands || 'Unbekannte Marke', model:'', imageUrl:product.image_front_url || null,
    productType:product.product_type || null,
    category:Array.isArray(product.categories_tags) ? product.categories_tags.slice(0,4).join(' · ') : '',
    categories:Array.isArray(product.categories_tags) ? product.categories_tags.slice(0,4) : [],
    quantity:product.quantity || null, confidence:0.72, evidenceGrade:'C', verifiedCompatibility:false,
    note:'Live-Produktidentität aus einer offenen Produktdatenbank. Ersatzteil-Kompatibilität ist damit noch nicht bestätigt.'
  };
}

function externalCandidateFromUpcItem(item,index=0){
  if(!item || !(item.title || item.brand || item.model)) return null;
  const code=String(item.ean || item.upc || item.gtin || '').trim();
  const name=String(item.title || item.model || 'Unbenanntes Produkt').trim();
  const brand=String(item.brand || 'Unbekannte Marke').trim();
  const model=String(item.model || '').trim();
  return {
    id:`external-upcitemdb-${code || `${brand}-${model || index}`}`.replace(/[^a-z0-9_-]+/gi,'-').toLowerCase(),
    source:'UPCitemdb', sourceKey:'upcitemdb',
    sourceUrl:code ? `https://www.upcitemdb.com/upc/${encodeURIComponent(code)}` : 'https://www.upcitemdb.com/',
    code, name, title:name, brand, model,
    imageUrl:Array.isArray(item.images) && item.images.length ? item.images[0] : null,
    category:item.category || '', productType:item.category || null,
    quantity:null, confidence:0.78, evidenceGrade:'C', verifiedCompatibility:false,
    identifiers:[
      item.ean ? {type:'ean',value:String(item.ean)} : null,
      item.upc ? {type:'upc',value:String(item.upc)} : null,
      item.gtin ? {type:'gtin',value:String(item.gtin)} : null,
      item.model ? {type:'model',value:String(item.model)} : null
    ].filter(Boolean),
    note:'Live-Katalogtreffer zur Produktidentifikation. Hersteller, Modell und Barcode können helfen; Ersatzteil-Fitment wird separat verifiziert.'
  };
}

function dedupeCandidates(candidates=[]){
  const seen=new Set();
  return candidates.filter(candidate=>{
    if(!candidate) return false;
    const key=[candidate.code,candidate.brand,candidate.model,candidate.name].filter(Boolean).join('|').toLowerCase();
    if(seen.has(key)) return false;
    seen.add(key); return true;
  });
}

async function fetchJson(url,{fetchFn,timeoutMs=DEFAULT_TIMEOUT_MS,signal}={}){
  if(signal?.aborted)return {status:'cancelled',payload:null};
  if(typeof fetchFn!=='function')return {status:'unavailable',payload:null,reason:'fetch-unavailable'};
  const controller=new AbortController();let timer,cancel;
  try{
    const aborted=new Promise((_,reject)=>{
      cancel=()=>{controller.abort();reject(new DOMException('Lookup cancelled','AbortError'));};
      signal?.addEventListener('abort',cancel,{once:true});
      timer=setTimeout(()=>{controller.abort();reject(new DOMException('Lookup timed out','TimeoutError'));},timeoutMs);
    });
    const request=async()=>{
      const response=await fetchFn(url,{method:'GET',headers:{'Accept':'application/json'},signal:controller.signal});
      if(signal?.aborted)return {status:'cancelled',payload:null};
      if(!response.ok){if(response.status===404)return {status:'not-found',payload:null};if(response.status===429)return {status:'rate-limited',payload:null,reason:'rate-limit'};return {status:'error',payload:null,reason:`http-${response.status}`};}
      const payload=await response.json();
      if(signal?.aborted)return {status:'cancelled',payload:null};
      return {status:'ok',payload,headers:response.headers};
    };
    return await Promise.race([request(),aborted]);
  }catch(error){return {status:signal?.aborted?'cancelled':'error',payload:null,reason:error?.name==='TimeoutError'?'timeout':'network'};}
  finally{clearTimeout(timer);signal?.removeEventListener('abort',cancel);}
}

async function fetchOpenFactsCandidate(endpoint,code,{fetchFn,timeoutMs,signal}){
  const result=await fetchJson(endpoint(code),{fetchFn,timeoutMs,signal});
  if(result.status!=='ok') return {status:result.status,candidate:null,reason:result.reason};
  const candidate=externalCandidateFromOpenFacts(result.payload);
  if(candidate&&normalizeGTIN(candidate.code)!==normalizeGTIN(code))return {status:'not-found',candidate:null};
  return candidate ? {status:'found',candidate} : {status:'not-found',candidate:null};
}

export async function lookupOpenFactsBarcode(value,{fetchFn=globalThis.fetch,timeoutMs=DEFAULT_TIMEOUT_MS,signal}={}){
  const code=rawBarcode(value);
  if(!code) return {status:'not-applicable',candidate:null};
  const primary=await fetchOpenFactsCandidate(OPEN_PRODUCTS_FACTS_ENDPOINT,code,{fetchFn,timeoutMs,signal});
  if(primary.status==='found'||primary.status==='cancelled') return primary;
  const fallback=await fetchOpenFactsCandidate(OPEN_FACTS_FALLBACK_ENDPOINT,code,{fetchFn,timeoutMs,signal});
  return fallback.status==='found' ? fallback : primary.status==='error' ? primary : fallback;
}

export async function lookupUpcItemDbBarcode(value,{fetchFn=globalThis.fetch,timeoutMs=DEFAULT_TIMEOUT_MS,signal}={}){
  const code=rawBarcode(value);
  if(!code) return {status:'not-applicable',candidates:[]};
  const result=await fetchJson(UPCITEMDB_LOOKUP_ENDPOINT(code),{fetchFn,timeoutMs,signal});
  if(result.status!=='ok') return {status:result.status,candidates:[],reason:result.reason};
  const candidates=dedupeCandidates((Array.isArray(result.payload?.items)?result.payload.items:[]).slice(0,20).map(externalCandidateFromUpcItem)).filter(x=>normalizeGTIN(x.code)===normalizeGTIN(code));
  return {status:candidates.length?'found':'not-found',candidates};
}

export async function searchUpcItemDb(value,{fetchFn=globalThis.fetch,timeoutMs=DEFAULT_TIMEOUT_MS,signal}={}){
  const query=String(value||'').trim();
  if(query.length<3) return {status:'not-applicable',candidates:[]};
  const result=await fetchJson(UPCITEMDB_SEARCH_ENDPOINT(query),{fetchFn,timeoutMs,signal});
  if(result.status!=='ok') return {status:result.status,candidates:[],reason:result.reason};
  const candidates=dedupeCandidates((Array.isArray(result.payload?.items)?result.payload.items:[]).slice(0,6).map(externalCandidateFromUpcItem));
  return {status:candidates.length?'found':'not-found',candidates};
}

export async function resolveProductQuery(products,query,{allowExternal=true,fetchFn=globalThis.fetch,forceExternal=false,signal}={}){
  const value=String(query||'').trim();
  const localMatches=matchProducts(products,value,{minScore:35});
  const identifier=classifyIdentifier(value);
  const exactLocal=localMatches.some(x=>x.score>=96);
  const result={
    query:value, identifier, localMatches, external:null, externalCandidates:[], externalStatus:'not-run', externalSources:[], usedExternal:false
  };

  if(signal?.aborted){result.externalStatus='cancelled';return result;}
  if(!allowExternal || exactLocal || globalThis.navigator?.onLine===false) return result;
  if(!forceExternal && ['manufacturer-code','numeric-code'].includes(identifier.kind)){
    result.externalStatus='needs-model';
    return result;
  }

  result.usedExternal=true;
  if(isBarcodeQuery(value)){
    const upc=await lookupUpcItemDbBarcode(value,{fetchFn,signal});
    if(upc.status==='cancelled'){result.externalStatus='cancelled';return result;}
    if(upc.status==='found'){
      result.externalCandidates=upc.candidates;
      result.external=result.externalCandidates[0]||null;
      result.externalStatus='found'; result.externalSources.push('UPCitemdb');
      return result;
    }
    const open=await lookupOpenFactsBarcode(value,{fetchFn,signal});
    if(open.status==='cancelled'){result.externalStatus='cancelled';return result;}
    if(open.status==='found'){
      result.externalCandidates=[open.candidate]; result.external=open.candidate; result.externalStatus='found'; result.externalSources.push('Open Products Facts');
      return result;
    }
    result.externalStatus=upc.status==='rate-limited'?'rate-limited':open.status==='error'&&upc.status==='error'?'error':'not-found';
    return result;
  }

  const search=await searchUpcItemDb(value,{fetchFn,signal});
  result.externalCandidates=search.candidates||[];
  result.external=result.externalCandidates[0]||null;
  result.externalStatus=search.status;
  if(search.status==='found') result.externalSources.push('UPCitemdb');
  return result;
}
