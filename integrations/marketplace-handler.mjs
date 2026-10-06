import { normalizeMarketplaceOffer } from '../site/src/core/marketplaces.js';
import { createQuotaReservation } from './marketplace-quota.mjs';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const origin='https://straikerabi.github.io';
const bodyLimit=4096;

// Authenticate with the project's Auth server, never with decoded JWT claims.
export function createAuthenticator({env,fetchImpl=fetch}){
  let publishable;
  try{publishable=JSON.parse(env.SUPABASE_PUBLISHABLE_KEYS||'{}').default;}catch{}
  const apiKey=env.MARKETPLACE_SUPABASE_PUBLISHABLE_KEY||
    (typeof publishable==='string'?(env[publishable]||publishable):null)||env.SUPABASE_ANON_KEY;
  return async request=>{
    const authorization=request.headers.get('authorization')||'';
    if(!/^Bearer [A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(authorization)||authorization.length>8192)return null;
    if(!env.SUPABASE_URL||!apiKey)throw new Error('Auth configuration missing');
    const response=await fetchImpl(`${env.SUPABASE_URL}/auth/v1/user`,{
      headers:{authorization,apikey:apiKey},signal:AbortSignal.timeout(5000)
    });
    if(response.status===401||response.status===403)return null;
    if(!response.ok)throw new Error('Auth unavailable');
    const user=await response.json();
    return uuid.test(user?.id||'')&&user.role==='authenticated'&&user.is_anonymous!==true?{id:user.id}:null;
  };
}

async function readBody(request){
  if(!request.body)return null;
  const reader=request.body.getReader();let size=0;const chunks=[];
  let timedOut=false;
  const timer=setTimeout(()=>{timedOut=true;void reader.cancel().catch(()=>{});},5000);
  try{
    while(true){const {value,done}=await reader.read();if(done)break;
      size+=value.byteLength;
      if(size>bodyLimit){await reader.cancel();throw new RangeError('Body too large');}
      chunks.push(value);
    }
    if(timedOut)throw new DOMException('Body read timed out','TimeoutError');
  }finally{clearTimeout(timer);reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;
  for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  return JSON.parse(new TextDecoder().decode(bytes));
}

export function createMarketplaceHandler({env={},partIndex=[],providers={},authenticate,reserveQuota,quotaBackendVerifiedAtStartup=false,timeoutMs=10000}={}){
  const parts=new Map(partIndex.map(part=>[part.partKey,part]));
  const allowedUsers=new Set((env.MARKETPLACE_USER_IDS||'').split(',').map(x=>x.trim()).filter(x=>uuid.test(x)));
  authenticate=authenticate||createAuthenticator({env});
  reserveQuota=reserveQuota||createQuotaReservation({env});
  return async request=>{
    const requestOrigin=request.headers.get('origin');
    const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin'};
    if(requestOrigin===origin)Object.assign(headers,{'Access-Control-Allow-Origin':origin,
      'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info, x-region',
      'Access-Control-Allow-Methods':'POST, GET, OPTIONS'});
    const reply=(status,data,extra={})=>new Response(JSON.stringify(data),{status,headers:{...headers,...extra}});
    if(requestOrigin&&requestOrigin!==origin)return reply(403,{status:'origin_denied'});
    const path=new URL(request.url).pathname;
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
    if(request.method==='GET'&&path.endsWith('/marketplace-search/health'))return reply(200,{
      status:'ready',backendVersion:2,liveOffersEnabled:env.MARKETPLACE_LIVE_ENABLED==='true'&&Object.values(providers).some(p=>p.mode==='live'),partCount:parts.size,
      quota:'persistent-postgres',
      quotaBackendVerifiedAtStartup,
      authentication:'supabase-user-and-pilot-allowlist',providers:{ebay:'access_required',amazon:'access_required'}
    });
    if(!path.endsWith('/marketplace-search'))return reply(404,{status:'not_found'});
    if(request.method!=='POST')return reply(405,{status:'method_not_allowed'},{Allow:'POST, OPTIONS'});
    let user;
    try{user=await authenticate(request);}catch{return reply(503,{status:'auth_unavailable'});}
    if(!user||!uuid.test(user.id))return reply(401,{status:'auth_required'});
    if(!allowedUsers.has(user.id))return reply(403,{status:'pilot_access_required'});
    if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type')||''))return reply(415,{status:'json_required'});
    let input;
    try{input=await readBody(request);}catch(error){return reply(error instanceof RangeError?413:error.name==='TimeoutError'?408:400,{status:'invalid_request'});}
    const valid=input&&typeof input==='object'&&!Array.isArray(input)&&Object.keys(input).every(key=>['provider','partKey','condition'].includes(key));
    if(!valid||!['ebay','amazon'].includes(input.provider)||!['used','new','all'].includes(input.condition)||
      typeof input.partKey!=='string'||!parts.has(input.partKey))return reply(400,{status:'invalid_request'});
    const provider=providers[input.provider];
    if(env.MARKETPLACE_LIVE_ENABLED!=='true'||!provider||provider.mode!=='live')return reply(200,{
      provider:input.provider,partKey:input.partKey,status:'access_required',offers:[]
    });
    let quota;
    try{quota=await reserveQuota(user.id,input.provider);}catch{return reply(503,{status:'quota_unavailable',offers:[]});}
    if(quota?.allowed!==true)return reply(429,{status:'quota_exceeded',offers:[]},{'Retry-After':String(quota?.retryAfterSeconds||60)});
    const controller=new AbortController();let timer;
    try{
      const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('timeout'));},timeoutMs);});
      const result=await Promise.race([provider.search({...parts.get(input.partKey),condition:input.condition,market:'DE'},{signal:controller.signal}),timeout]);
      if(result?.status!=='ok'||!Array.isArray(result.offers))return reply(502,{status:'unavailable',offers:[]});
      const offers=result.offers.map(x=>normalizeMarketplaceOffer(x,input.provider)).filter(x=>x&&(input.condition==='all'||x.condition===input.condition));
      return reply(200,{provider:input.provider,partKey:input.partKey,status:'ok',offers});
    }catch{return reply(controller.signal.aborted?504:502,{status:controller.signal.aborted?'timeout':'unavailable',offers:[]});}
    finally{clearTimeout(timer);}
  };
}
