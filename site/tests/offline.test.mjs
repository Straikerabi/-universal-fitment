import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const origin='https://example.test',base=origin+'/app/';
const listeners=new Map(),stores=new Map();let offline=false,claimed=false,skipped=false;
const key=v=>new URL(typeof v==='string'?v:v.url,base).href;
const cacheFor=name=>{
  if(!stores.has(name))stores.set(name,new Map());const data=stores.get(name);
  return {addAll:async paths=>{for(const p of paths){assert.ok(fs.existsSync(new URL('../'+p.split('?')[0],import.meta.url)),p);data.set(key(p),{body:p,clone(){return this;}});}},put:async(k,v)=>data.set(key(k),v)};
};
const caches={open:async name=>cacheFor(name),keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name),match:async request=>{for(const data of stores.values())if(data.has(key(request)))return data.get(key(request));}};
vm.runInNewContext(fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8'),{URL,Promise,caches,self:{location:{origin},registration:{scope:base},addEventListener:(name,fn)=>listeners.set(name,fn),skipWaiting:async()=>{skipped=true;},clients:{claim:async()=>{claimed=true;}}},fetch:async request=>{if(offline)throw Error('offline');return {ok:true,body:key(request),clone(){return this;}};}});
async function lifecycle(name){let done;listeners.get(name)({waitUntil:p=>{done=p;}});await done;}
stores.set('old-version',new Map());await lifecycle('install');await lifecycle('activate');assert.equal(stores.size,1);assert.ok(claimed&&skipped);
function request(url,mode='cors',method='GET'){let response;listeners.get('fetch')({request:{url:key(url),mode,method},respondWith:p=>{response=p;}});return response;}
assert.equal(request('https://auth.example/token'),undefined,'Auth/API response is never intercepted');
assert.equal(request('./api','cors','POST'),undefined);
offline=true;
assert.equal((await request('./app-v1.26.8.js')).body,'./app-v1.26.8.js');
assert.equal((await request('./styles.css?v=1.26.8')).body,'./styles.css?v=1.26.8');
assert.equal((await request('./?v=1.14#backup','navigate')).body,'./index.html');
offline=false;
assert.equal(request('./api/listings'),undefined,'same-origin API must not enter offline cache');
assert.equal(request('./photo.webp'),undefined,'images outside core must not enter offline cache');
assert.ok(await request('./services-v1.26.8.js'));
await new Promise(resolve=>setTimeout(resolve,0));
offline=true;assert.ok(await request('./services-v1.26.8.js'),'optional pack available offline after first use');
for(const brand of ['aeg','dyson','rowenta','philips','siemens','vorwerk']){
 const path=`./catalog-${brand}-v1.26.8.js`;
 offline=true;await assert.rejects(request(path),'optional brand is not precached');
 offline=false;assert.ok(await request(path));await new Promise(resolve=>setTimeout(resolve,0));
 offline=true;assert.ok(await request(path),'opened brand works offline');
 offline=false;assert.equal(request(path+'?unknown'),undefined,'unrecognised pack query does not enter offline cache');
}
assert.equal(request('./manual.pdf'),undefined,'external/manual downloads are not core data');
assert.equal((await request('./?v=1.14','navigate')).body,key('./?v=1.14'));
console.log('Offline checks passed: versioned entry/CSS cached, old caches removed, offline navigation and Auth/API exclusion. Simulated network only.');
