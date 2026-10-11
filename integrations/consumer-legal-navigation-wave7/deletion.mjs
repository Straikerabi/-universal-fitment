export const policies=Object.freeze({
 preview:Object.freeze({keys:['uf-legal-wave7:mission:real','uf-legal-wave7:mission:synthetic'],cachePrefix:'uf-legal-wave7-assets-',worker:'sw.mjs'}),
 consumer:Object.freeze({keys:['uf-repair-mission-poc-v1-real','uf-repair-mission-poc-v1-synthetic','uf-consumer-offline-disabled'],cachePrefix:'uf-consumer-mobile-wave4-',worker:'offline-worker.mjs'})
});
export function matchingWorker(registration,scope,script){
 return registration.scope===scope&&['active','waiting','installing'].some(k=>registration[k]?.scriptURL===script);
}
// Exact allowlisted policies; never clear an origin, arbitrary prefix or other app.
export async function eraseLocal({policy='preview',scope,storage,cacheStorage,serviceWorkers,beforeErase,afterErase}){
 const spec=Object.hasOwn(policies,policy)?policies[policy]:null;
 const url=new URL(scope);
 if(!spec||url.origin==='null'||!url.pathname.endsWith('/')||url.search||url.hash||url.username||url.password)throw Error('Invalid deletion scope');
 const script=new URL(spec.worker,url).href;
 const result={storage:'UNKNOWN',workers:'UNKNOWN',caches:'UNKNOWN',memory:'UNKNOWN',status:'PARTIAL',serverErasure:false,downloadsErased:false};
 try{await beforeErase();result.memory='PASS';}catch{return result;} // Never persist stale state after deletion.
 try{
  for(const key of spec.keys)storage.removeItem(key);
  result.storage=spec.keys.every(key=>storage.getItem(key)===null)?'PASS':'BLOCKED';
 }catch{result.storage='UNKNOWN';}
 try{
  const registrations=await serviceWorkers.getRegistrations();
  for(const reg of registrations)if(matchingWorker(reg,url.href,script))await reg.unregister();
  result.workers=(await serviceWorkers.getRegistrations()).some(reg=>matchingWorker(reg,url.href,script))?'BLOCKED':'PASS';
 }catch{result.workers='UNKNOWN';}
 // Do not remove caches while an unverified matching worker might refill them.
 if(result.workers==='PASS')try{
  for(const key of await cacheStorage.keys())if(key.startsWith(spec.cachePrefix))await cacheStorage.delete(key);
  result.caches=(await cacheStorage.keys()).some(key=>key.startsWith(spec.cachePrefix))?'BLOCKED':'PASS';
 }catch{result.caches='UNKNOWN';}
 try{await afterErase(result);}catch{result.memory='UNKNOWN';}
 result.status=['storage','workers','caches','memory'].every(k=>result[k]==='PASS')?'PASS':'PARTIAL';
 return result;
}
