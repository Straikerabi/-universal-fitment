import {assetPaths,cacheName} from './offline-config.mjs';
const prefix='uf-legal-wave7-assets-';
const allowed=new Set(assetPaths.map(asset=>new URL(asset,self.registration.scope).href));
let disabled=false;
self.addEventListener('message',event=>{if(event.data?.type==='uf-legal-wave7-stop'){disabled=true;event.ports[0]?.postMessage({type:'uf-legal-wave7-stopped'});}});
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(cacheName);
 try{await cache.addAll([...allowed].map(url=>new Request(url,{cache:'reload'})));}catch(error){await caches.delete(cacheName);throw error;}
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const key of await caches.keys())if(key.startsWith(prefix)&&key!==cacheName)await caches.delete(key);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);url.hash=''; // Fragments are UI routes, never server/cache identities.
 if(disabled||request.method!=='GET'||url.origin!==self.location.origin||url.search||!allowed.has(url.href))return;
 event.respondWith((async()=>{
  const cache=await caches.open(cacheName),cached=await cache.match(url.href);
  return cached||fetch(request); // Never cache user data, query strings or arbitrary responses.
 })());
});
