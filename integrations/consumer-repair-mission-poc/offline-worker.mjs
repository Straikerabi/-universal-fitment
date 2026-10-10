// Generated constants by prepare-offline.mjs; worker policy below is hashed independently.
const cacheName="uf-consumer-mobile-wave4-d9177cfc0405e9f762be4170";
const assetPaths=["/","/index.html","/styles.css","/app.mjs","/mission-state.mjs","/parts-view.mjs","/catalog-snapshot.mjs","/mobile-ui.mjs","/mock-fitment-adapter.mjs","/manifest.webmanifest","/app-icon.svg","/dual-platform-owner-review/bridge.mjs","/dual-platform-owner-review/ui-fixtures.mjs","/fitment-engine-v1-poc/contract.mjs","/fitment-engine-v1-poc/fixtures.mjs","/business-embed-poc/adapter.mjs","/offline-config.mjs"];
// Offline worker policy (hashed for cache version)
const allowed=new Set(assetPaths);
const prefix='uf-consumer-mobile-wave4-';

self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(cacheName);
  try{await cache.addAll(assetPaths.map(url=>new Request(url,{cache:'reload'})));}
  catch(error){await caches.delete(cacheName);throw error;}
  // No skipWaiting: an open mission keeps one consistent UI/core asset version.
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith(prefix)&&key!==cacheName)await caches.delete(key);
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin||url.search||!allowed.has(url.pathname))return;
 event.respondWith((async()=>{
  const cached=await (await caches.open(cacheName)).match(url.pathname);
  // Never cache arbitrary responses, source links, user input or a fitment result.
  return cached||fetch(req);
 })());
});
