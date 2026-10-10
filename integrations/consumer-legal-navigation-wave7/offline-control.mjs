import {matchingWorker} from './deletion.mjs';
// Stop cache reads/opens in already controlled tabs BEFORE unregister/delete.
export async function quiescePreviewWorkers(serviceWorkers,scope){
 const script=new URL('sw.mjs',scope).href;
 for(const registration of await serviceWorkers.getRegistrations()){
  if(!matchingWorker(registration,scope,script))continue;
  const workers=new Set(['active','waiting','installing'].map(k=>registration[k]).filter(w=>w?.scriptURL===script));
  for(const worker of workers)await new Promise((resolve,reject)=>{
   const channel=new MessageChannel();
   const finish=error=>{clearTimeout(timeout);channel.port1.close();channel.port2.close();error?reject(error):resolve();};
   const timeout=setTimeout(()=>finish(Error('Worker stop unverified')),2000);
   channel.port1.onmessage=event=>finish(event.data?.type==='uf-legal-wave7-stopped'?null:Error('Invalid worker acknowledgment'));
   try{worker.postMessage({type:'uf-legal-wave7-stop'},[channel.port2]);}catch{finish(Error('Worker unavailable'));}
  });
 }
}
