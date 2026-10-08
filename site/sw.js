const CACHE='universal-fitment-v1.26.8-categorized-catalog';
const ASSETS=['./','./index.html','./styles.css?v=1.26.8','./manifest.webmanifest','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png','./icons/vacuum.svg','./app-v1.26.8.js'];

self.addEventListener('install',event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())
));

self.addEventListener('activate',event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())
));

self.addEventListener('fetch',event=>{
  // Auth and marketplace responses must never enter the offline cache.
  if(new URL(event.request.url).origin!==self.location.origin) return;
  if(event.request.method!=='GET') return;
  const request=event.request;
  const assetUrl=new URL(request.url);
  const assetPath=assetUrl.pathname;
  const knownAsset=ASSETS.some(asset=>new URL(asset,self.registration.scope).pathname===assetPath);
  const optionalAsset=['./services-v1.26.8.js','./catalog-dyson-v1.26.8.js','./catalog-aeg-v1.26.8.js','./catalog-rowenta-v1.26.8.js','./catalog-philips-v1.26.8.js','./catalog-siemens-v1.26.8.js','./catalog-vorwerk-v1.26.8.js','./catalog-samsung-v1.26.8.js','./catalog-hoover-v1.26.8.js'].some(asset=>assetUrl.href===new URL(asset,self.registration.scope).href);
  if(request.mode!=='navigate'&&!knownAsset&&!optionalAsset)return;
  if(request.mode==='navigate'){
    event.respondWith(
      fetch(request).then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put('./index.html',copy)).catch(()=>{});
        return response;
      }).catch(()=>caches.match('./index.html'))
    );
    return;
  }
  event.respondWith(
    caches.match(request).then(cached=>cached||fetch(request).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});}
      return response;
    }))
  );
});
