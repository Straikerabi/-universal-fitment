// One request per brand; a failed import is retryable. No device data is uploaded.
export function brandsForBackup(snapshot,devices){
 const ids=new Set();
 for(const key of ['saved','recent'])if(Array.isArray(snapshot?.[key]))for(const id of snapshot[key])if(typeof id==='string')ids.add(id);
 if(Array.isArray(snapshot?.cart))for(const item of snapshot.cart)if(typeof item?.productId==='string')ids.add(item.productId);
 for(const key of ['deviceMeta','maintenance','jobSelections','inventory','reminderPrefs']){
  const map=snapshot?.[key];if(!map||typeof map!=='object'||Array.isArray(map))continue;
  for(const id of Object.keys(map))ids.add(id.split(':')[0]);
 }
 return [...new Set(devices.filter(p=>p.catalogPack&&ids.has(p.id)).map(p=>p.catalogPack))];
}
export function createCatalogLoader({packs,register,importModule=url=>import(url)}){
 const pending=new Map(),loaded=new Set();
 const isLoaded=brand=>!packs[brand]||loaded.has(brand);
 async function ensure(brand){
  if(isLoaded(brand))return;
  if(pending.has(brand))return pending.get(brand);
  const promise=Promise.resolve().then(()=>importModule(packs[brand])).then(module=>{
   if(module.brandPack?.brand!==brand)throw Error('Der Markenkatalog passt nicht zur angeforderten Marke.');
   register(module.brandPack);loaded.add(brand);
  }).finally(()=>pending.delete(brand));
  pending.set(brand,promise);return promise;
 }
 return {ensure,isLoaded,ensureAll:()=>Promise.all(Object.keys(packs).map(ensure))};
}
