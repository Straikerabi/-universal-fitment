import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readiness,routes,legalRoute,modes} from '../readiness.mjs';
import {eraseLocal,policies,matchingWorker} from '../deletion.mjs';
import {expectedConfig,assets} from '../prepare-offline.mjs';
import {createServer} from '../serve.mjs';
import http from 'node:http';
import {quiescePreviewWorkers} from '../offline-control.mjs';

const scope='http://127.0.0.1:4182/';
function fixtures({policy='preview',storageFails=false,workersFail=false,cachesFail=false,residual=false,hookFails=false}={}){
 const spec=policies[policy],map=new Map([...spec.keys.map(k=>[k,'synthetic']),['foreign-app','retain']]);
 const registrations=[{scope,active:{scriptURL:scope+spec.worker},async unregister(){registrations.splice(registrations.indexOf(this),1);return true;}},{scope:scope+'foreign/',active:{scriptURL:scope+'foreign/sw.mjs'},async unregister(){throw Error('Must not unregister');}}];
 const keys=new Set([spec.cachePrefix+'old',spec.cachePrefix+'new','foreign-cache']);let before=0,after=0;
 const storage={removeItem(k){if(storageFails)throw Error();if(!residual)map.delete(k);},getItem:k=>map.get(k)??null};
 const serviceWorkers={getRegistrations:async()=>{if(workersFail)throw Error();return registrations;}};
 const cacheStorage={keys:async()=>{if(cachesFail)throw Error();return [...keys];},delete:async key=>{keys.delete(key);return true;}};
 return {args:{policy,scope,storage,serviceWorkers,cacheStorage,beforeErase:async()=>{before++;if(hookFails)throw Error();},afterErase:async()=>{after++;}},map,keys,registrations,calls:()=>({before,after})};
}
for(const mode of modes){
 test(`empty / placeholder operator and privacy cannot approve ${mode}`,()=>{
  for(const references of [{},{operator:'',privacy:''},{operator:'TODO',privacy:'example'},{operator:'a'.repeat(64),privacy:true},{operator:'0123456789abcdef'.repeat(4),privacy:'0123456789abcdef'.repeat(4)}]){
   const state=readiness(mode,references);assert.equal(state.launchApproved,false);assert.equal(state.commercialApproved,false);assert.equal(state.overall,'BLOCKED');assert.ok(state.checks.filter(c=>['operator','privacy'].includes(c.id)).every(c=>c.status!=='PASS'));assert.equal(state.checks.find(c=>c.id==='human-release').status,'BLOCKED');
  }
 });
 test(`mode separation ${mode}`,()=>{const checks=readiness(mode).checks;assert.equal(checks.find(c=>c.id==='affiliate').applicable,mode==='affiliate');assert.equal(checks.find(c=>c.id==='tenant-api-contracts').applicable,mode==='b2b-saas');});
}
test('unknown scope and fake checkout cannot create approval',()=>{for(const mode of ['checkout','production','',null])assert.throws(()=>readiness(mode));});
test('four actual namespaced targets; no external or fake contact links',()=>{assert.equal(new Set(routes.map(r=>r.id)).size,4);for(const r of routes)assert.equal(legalRoute('#'+r.id),r.id);for(const hash of ['#impressum','#legal-impressum<script>','#legal-kontakt?approved=true','https://example.test'])assert.equal(legalRoute(hash),null);});
for(const policy of Object.keys(policies))test(`exact ${policy} deletion keeps other apps and unregisters only own worker`,async()=>{const f=fixtures({policy}),r=await eraseLocal(f.args);assert.equal(r.status,'PASS');assert.equal(r.serverErasure,false);assert.equal(r.downloadsErased,false);for(const key of policies[policy].keys)assert.equal(f.map.has(key),false);assert.equal(f.map.get('foreign-app'),'retain');assert.deepEqual([...f.keys],['foreign-cache']);assert.equal(f.registrations.length,1);assert.deepEqual(f.calls(),{before:1,after:1});});
for(const error of ['storageFails','workersFail','cachesFail','residual','hookFails'])test(`${error} cannot claim complete erasure`,async()=>{const f=fixtures({[error]:true}),r=await eraseLocal(f.args);assert.equal(r.status,'PARTIAL');assert.equal(r.serverErasure,false);if(error==='workersFail'||error==='hookFails')assert.equal(f.keys.size,3);if(error==='hookFails')assert.equal(f.map.size,3);});
test('missing capabilities stay UNKNOWN, not a successful clear',async()=>{const r=await eraseLocal({scope,beforeErase:()=>{},afterErase:()=>{}});assert.equal(r.status,'PARTIAL');assert.equal(r.storage,'UNKNOWN');assert.equal(r.workers,'UNKNOWN');assert.equal(r.caches,'UNKNOWN');});
test('post-erasure hook failure is partial even with empty storage',async()=>{const f=fixtures();f.args.afterErase=()=>{throw Error();};assert.equal((await eraseLocal(f.args)).status,'PARTIAL');});
test('rejects broad arbitrary deletion policies and malformed scopes before mutation',async()=>{for(const value of [{policy:'all'},{scope:'data:text/plain,x'},{scope:'https://example.test/path'},{scope:scope+'?token=x'},{scope:scope+'#x'}]){const f=fixtures();await assert.rejects(eraseLocal({...f.args,...value}));assert.deepEqual(f.calls(),{before:0,after:0});assert.equal(f.keys.size,3);}});
test('waiting/installing own workers match but foreign scope or script does not',()=>{for(const state of ['active','waiting','installing'])assert.equal(matchingWorker({scope,[state]:{scriptURL:scope+'sw.mjs'}},scope,scope+'sw.mjs'),true);assert.equal(matchingWorker({scope:scope+'other/',active:{scriptURL:scope+'sw.mjs'}},scope,scope+'sw.mjs'),false);assert.equal(matchingWorker({scope,active:{scriptURL:scope+'other.mjs'}},scope,scope+'sw.mjs'),false);});
test('quiescence requires exact worker acknowledgment and ignores foreign workers',async()=>{let stopped=0;const own={scriptURL:scope+'sw.mjs',postMessage(message,ports){assert.equal(message.type,'uf-legal-wave7-stop');stopped++;ports[0].postMessage({type:'uf-legal-wave7-stopped'});}};await quiescePreviewWorkers({getRegistrations:async()=>[{scope,active:own},{scope:scope+'foreign/',active:{scriptURL:scope+'foreign/sw.mjs',postMessage(){throw Error('foreign');}}}]},scope);assert.equal(stopped,1);});
test('invalid or unavailable worker acknowledgment cannot pass quiescence',async()=>{for(const response of ['wrong','throw'])await assert.rejects(quiescePreviewWorkers({getRegistrations:async()=>[{scope,active:{scriptURL:scope+'sw.mjs',postMessage(message,ports){if(response==='throw')throw Error();ports[0].postMessage({type:'invalid'});}}}]},scope));});
test('offline fingerprint includes every shipped asset and matches generated bytes',async()=>{assert.equal(await readFile(new URL('../offline-config.mjs',import.meta.url),'utf8'),await expectedConfig());assert.ok(assets.includes('navigation.mjs'));assert.ok(assets.includes('deletion.mjs'));assert.ok(assets.includes('sw.mjs'));});
test('loopback server has allowlisted files, no tooling or private data routes',async t=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));const url=`http://127.0.0.1:${server.address().port}`;
 const res=await fetch(url);assert.equal(res.status,200);assert.match(res.headers.get('content-security-policy'),/connect-src 'none'/);assert.equal(res.headers.get('referrer-policy'),'no-referrer');
 for(const path of ['/README.md','/tests/browser.mjs','/package.json','/operator.local.json','/index.html?email=synthetic','/%2e%2e/package.json','/not-found'])assert.equal((await fetch(url+path)).status,404);
 assert.equal((await fetch(url,{method:'POST'})).status,405);assert.equal((await fetch(url,{headers:{Origin:'https://foreign.invalid'}})).status,403);const forgedHost=await new Promise((resolve,reject)=>{const request=http.get(url,{headers:{Host:'foreign.invalid'}},response=>{response.resume();resolve(response.statusCode);});request.on('error',reject);});assert.equal(forgedHost,403);
});
test('no approval bypass, fake contact, SDK, banner or remote assets in UI',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8'),js=await readFile(new URL('../navigation.mjs',import.meta.url),'utf8'),app=await readFile(new URL('../app.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(html+js,/https?:\/\/|mailto:|service_role|sb_publishable_|cookie-banner/);assert.match(js,/keine vollständige Art.-13-Information/i);assert.match(js,/Downloads/);assert.doesNotMatch(app,/localStorage\.clear|fetch\(/);
});
