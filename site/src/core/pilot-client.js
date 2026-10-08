import { normalizeMarketplaceOffer, partSearchIdentity, normalizeCondition } from './marketplaces.js';
import {pilotConfig} from './pilot-config.js';
import {normalizeProviderStatus} from './pilot-readiness.js';
export {pilotConfig};
export const pilotMessages={auth_required:'Bitte mit deinem Pilotkonto anmelden.',pilot_access_required:'Dein Konto ist noch nicht für die Angebotssuche freigeschaltet.',access_required:'Der Händlerzugang ist noch nicht freigeschaltet. Nutze weiterhin die externe Suche.',quota_exceeded:'Suchlimit erreicht. Bitte später erneut versuchen.',auth_unavailable:'Die Anmeldung kann gerade nicht beim Server geprüft werden.',pilot_unavailable:'Die Pilotfreigabe kann gerade nicht geprüft werden. Es werden keine Angebote abgerufen.',quota_unavailable:'Das Suchkontingent kann gerade nicht geprüft werden.',timeout:'Die Angebotssuche hat zu lange gedauert. Bitte erneut versuchen.',unavailable:'Die Angebotssuche ist gerade nicht erreichbar.',ready:'Angebotssuche bereit.'};

// Auth mutations are serialized so a late login cannot restore the SDK session after logout.
export function createPilotClient({auth,fetchImpl=fetch,config=pilotConfig}){
  let user=null,epoch=0,authQueue=Promise.resolve();
  const result=status=>({status,offers:[]});
  const runAuth=operation=>{const next=authQueue.then(operation,operation);authQueue=next.catch(()=>{});return next;};
  const clear=version=>{if(version===epoch){user=null;++epoch;}};
  auth.onAuthStateChange?.(event=>{if(event==='SIGNED_OUT'&&user){user=null;++epoch;}});
  const request=async(path,options={},version=epoch)=>{
    if(!user)return {status:'auth_required'};
    if(options.signal?.aborted)return {status:'cancelled'};
    const {data,error}=await auth.getSession();
    if(version!==epoch)return {status:'auth_required'};
    if(options.signal?.aborted)return {status:'cancelled'};
    if(error||!data?.session?.access_token){clear(version);return {status:'auth_required'};}
    const timeout=AbortSignal.timeout(15000);
    const response=await fetchImpl(`${config.url}/functions/v1/marketplace-search${path}`,{...options,cache:'no-store',signal:options.signal?AbortSignal.any([options.signal,timeout]):timeout,
      headers:{apikey:config.key,Authorization:`Bearer ${data.session.access_token}`,...(options.method==='POST'?{'Content-Type':'application/json'}:{})}});
    if(version!==epoch)return {status:'auth_required'};
    if(response.status===401){clear(version);return {status:'auth_required'};}
    const payload=await response.json();
    if(version!==epoch)return {status:'auth_required'};
    if(options.signal?.aborted)return {status:'cancelled'};
    return {response,payload};
  };
  return {
    get user(){return user?{...user}:null;},
    async signIn(email,password){
      const version=++epoch;user=null;
      return runAuth(async()=>{
        if(version!==epoch)return false;
        try{
          // Clear an earlier SDK session before starting a replacement attempt.
          await auth.signOut({scope:'local'});
          if(version!==epoch)return false;
          const signed=await auth.signInWithPassword({email,password});
          if(version!==epoch)return false;
          if(signed.error)return false;
          const verified=await auth.getUser(),candidate=verified.data?.user;
          if(version!==epoch)return false;
          if(verified.error||!candidate?.id||candidate.role!=='authenticated'||candidate.is_anonymous===true){await auth.signOut({scope:'local'});return false;}
          user={id:candidate.id,email:candidate.email};return true;
        }catch{return false;}
      });
    },
    async signOut(){++epoch;user=null;return runAuth(async()=>{try{await auth.signOut({scope:'local'});}catch{}});},
    async checkAccess({signal}={}){
      const version=epoch;
      try{
        const {response,payload,status}=await request('/access',{method:'GET',signal},version);
        if(status)return {status};
        if(response.status===403&&payload?.status==='pilot_access_required'&&payload.pilotAllowed===false)return {status:'pilot_access_required',pilotAllowed:false};
        if(!response.ok)return {status:['auth_unavailable','pilot_unavailable'].includes(payload?.status)?payload.status:'unavailable'};
        const providers=normalizeProviderStatus(payload?.providers);
        if(payload?.status!=='pilot_allowed'||payload.pilotAllowed!==true||payload.backendVersion!==4||!providers)return {status:'unsupported'};
        return {status:'pilot_allowed',pilotAllowed:true,providers,checkedAt:new Date().toISOString()};
      }catch{return {status:version!==epoch?'auth_required':signal?.aborted?'cancelled':'unavailable'};}
    },
    async search(provider,part,condition){
      const identity=partSearchIdentity(part),version=epoch;
      if(!identity||!['ebay','amazon'].includes(provider))return result('invalid_request');
      if(!user)return result('auth_required');
      try{
        const {response,payload,status}=await request('',{method:'POST',body:JSON.stringify({provider,partKey:identity.partKey,condition:normalizeCondition(condition)})},version);
        if(status)return result(status);
        if(response.status===403)return result(payload?.status==='pilot_access_required'?'pilot_access_required':'unavailable');
        if(response.status===429)return result('quota_exceeded');
        if(!response.ok)return result(['auth_unavailable','pilot_unavailable','quota_unavailable','timeout'].includes(payload?.status)?payload.status:'unavailable');
        if(payload.status==='access_required')return result('access_required');
        if(payload.status!=='ok'||payload.provider!==provider||payload.partKey!==identity.partKey)return result('unavailable');
        return {status:'ready',offers:(Array.isArray(payload.offers)?payload.offers:[]).map(raw=>normalizeMarketplaceOffer({...raw,fixedPrice:true},provider)).filter(offer=>offer&&(condition==='all'||offer.condition===normalizeCondition(condition)))};
      }catch{return result(version!==epoch?'auth_required':'unavailable');}
    }
  };
}
