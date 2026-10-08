import {pilotConfig} from './pilot-config.js';

const providerStates=new Set(['configured','access_required']);
export function normalizeProviderStatus(value){
  if(!value||typeof value!=='object'||!['ebay','amazon'].every(p=>providerStates.has(value[p])))return null;
  return {ebay:value.ebay,amazon:value.amazon};
}
export function normalizeHealth(value){
  const providers=normalizeProviderStatus(value?.providers);
  if(value?.status!=='ready'||!Number.isInteger(value.backendVersion)||value.backendVersion<4||value.backendVersion>99||
    !Number.isInteger(value.partCount)||value.partCount<1||typeof value.liveOffersEnabled!=='boolean'||
    typeof value.pilotBackendVerifiedAtStartup!=='boolean'||typeof value.quotaBackendVerifiedAtStartup!=='boolean'||!providers)return null;
  return {status:'ready',backendVersion:value.backendVersion,partCount:value.partCount,liveOffersEnabled:value.liveOffersEnabled,
    pilotBackendVerifiedAtStartup:value.pilotBackendVerifiedAtStartup,quotaBackendVerifiedAtStartup:value.quotaBackendVerifiedAtStartup,providers};
}
export async function checkPilotHealth({fetchImpl=fetch,config=pilotConfig,signal}={}){
  if(signal?.aborted)return {status:'cancelled'};
  try{
    const timeout=AbortSignal.timeout(12000);
    const response=await fetchImpl(`${config.url}/functions/v1/marketplace-search/health`,{method:'GET',cache:'no-store',signal:signal?AbortSignal.any([signal,timeout]):timeout});
    if(!response.ok)return {status:'unavailable'};
    const health=normalizeHealth(await response.json());
    if(signal?.aborted)return {status:'cancelled'};
    return health?{status:'checked',health,checkedAt:new Date().toISOString()}:{status:'unsupported'};
  }catch{return {status:signal?.aborted?'cancelled':'unavailable'};}
}
// Only whitelisted non-personal status fields enter the copyable support report.
export function readinessReport({appVersion,healthResult,accessResult,loggedIn}){
  const health=normalizeHealth(healthResult?.health);
  const accessStatus=['pilot_allowed','pilot_access_required','auth_required','auth_unavailable','pilot_unavailable','unsupported','unavailable','not_checked'].includes(accessResult?.status)?accessResult.status:'not_checked';
  return ['Universal Fitment – Zugangsdiagnose',`App: ${String(appVersion||'unbekannt').replace(/[^0-9.]/g,'').slice(0,20)}`,
    `Verbindung: ${healthResult?.status==='checked'&&health?'geprüft':healthResult?.status==='unsupported'?'Versionsantwort prüfen':'nicht bestätigt'}`,
    `Server: ${health?.backendVersion||'offen'}`,`Katalogteile: ${health?.partCount||'offen'}`,
    `Anmeldung: ${loggedIn===true?'angemeldet':'Gast'}`,`Pilotfreigabe: ${accessStatus}`,
    `eBay: ${health?.providers.ebay||'offen'}`,`Amazon: ${health?.providers.amazon||'offen'}`,
    'Geräte und Warenkorb: lokal; keine Cloud-Synchronisation','Dieser Bericht enthält keine E-Mail, Geräte-/Seriennummern oder Zugangsdaten.'].join('\n');
}
