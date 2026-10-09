import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {tenants,listScenarios,fixtureProvider} from './fixtures.mjs';
import {createAdapter,validateView,viewVersion} from './adapter.mjs';
import {createServer,root} from './serve.mjs';
const context={tenantId:'atelier',caseId:'exact'},scenario=listScenarios('atelier')[0];
const request={caseId:scenario.id,asset:scenario.asset,part:scenario.part};
const response=()=>structuredClone(scenario.response);
const hooks={invoke:fixtureProvider,validateContract:r=>r?.presentationVersion===viewVersion,mapToView:r=>r};
for(const tenantId of Object.keys(tenants))for(const c of listScenarios(tenantId))test(`${tenantId}/${c.id}: exact prerecorded response`,async()=>{
 const result=await createAdapter(hooks)({caseId:c.id,asset:c.asset,part:c.part},{tenantId,caseId:c.id});
 assert.equal(result.ok,true);assert.deepEqual(result.view,c.response);assert.ok(c.part.startsWith('SYN-'));assert.ok(c.asset.startsWith('DEMO-'));
});
test('foreign tenant response is denied',async()=>{const r=await createAdapter({...hooks,invoke:()=>({...response(),tenantId:'nordlicht'})})(request,context);assert.equal(r.ok,false);assert.equal(r.view,null);});
test('foreign private evidence cannot cross tenants',()=>{const r=response();r.evidence[0]={...r.evidence[0],scope:'tenant',tenantId:'nordlicht'};assert.throws(()=>validateView(r,context));});
test('public evidence cannot carry a tenant identity',()=>{const r=response();r.evidence[0].tenantId='atelier';assert.throws(()=>validateView(r,context));});
test('extra secret/raw fields are never projected',async()=>{const r=await createAdapter({...hooks,invoke:()=>({...response(),secret:'NEVER_RENDER'})})(request,context);assert.equal(r.ok,false);assert.ok(!JSON.stringify(r).includes('NEVER_RENDER'));});
for(const [name,edit] of [
 ['unknown contract version',r=>{r.presentationVersion='future/999';}],
 ['unknown outcome',r=>{r.outcome='probably';}],
 ['missing positive evidence',r=>{r.evidence=[];}],
 ['unlicensed evidence',r=>{r.evidence[0].rights='not-granted';}],
 ['duplicate evidence',r=>{r.evidence.push(structuredClone(r.evidence[0]));}],
 ['response for different case',r=>{r.caseId='excluded';}],
 ['unmapped evidence data',r=>{r.evidence[0].customerEmail='NEVER';}],
 ['oversized display text',r=>{r.reason='x'.repeat(601);}],
])test(name,()=>{const r=response();edit(r);assert.throws(()=>validateView(r,context));});
test('provider rejects unknown model/code without computing a fitment',async()=>{assert.equal((await createAdapter(hooks)({...request,part:'SYN-OTHER'},context)).ok,false);assert.equal((await createAdapter(hooks)({...request,asset:'DEMO-OTHER'},context)).ok,false);});
test('unknown tenant and case do not fall back to another tenant',async()=>{assert.throws(()=>listScenarios('missing'));assert.equal((await createAdapter(hooks)(request,{...context,tenantId:'missing'})).ok,false);assert.equal((await createAdapter(hooks)({...request,caseId:'missing'},{...context,caseId:'missing'})).ok,false);});
test('contract hooks required; no assumed #48 compatibility',()=>{assert.throws(()=>createAdapter({invoke:fixtureProvider}));assert.throws(()=>createAdapter({...hooks,timeoutMs:NaN}));});
test('injected contract validator and mapper are both invoked',async()=>{let validated=0,mapped=0;const r=await createAdapter({invoke:()=>({opaqueSharedResponse:true}),validateContract:r=>{validated++;return r.opaqueSharedResponse;},mapToView:()=>{mapped++;return response();}})(request,context);assert.equal(r.ok,true);assert.equal(validated,1);assert.equal(mapped,1);});
test('rejected contract is not mapped or rendered',async()=>{let mapped=false;const r=await createAdapter({...hooks,validateContract:()=>false,mapToView:()=>{mapped=true;return response();}})(request,context);assert.equal(r.ok,false);assert.equal(mapped,false);});
test('provider error fails closed and redacts message',async()=>{const r=await createAdapter({...hooks,invoke:()=>{throw Error('TENANT_SECRET');}})(request,context);assert.equal(r.ok,false);assert.ok(!JSON.stringify(r).includes('TENANT_SECRET'));});
test('timeout aborts provider and cannot produce a delayed positive',async()=>{let signal;const r=await createAdapter({...hooks,timeoutMs:10,invoke:(_,ctx)=>{signal=ctx.signal;return new Promise(()=>{});}})(request,context);assert.equal(r.ok,false);assert.equal(signal.aborted,true);});
test('case/context mismatch denied before invoking provider',async()=>{let called=false;const r=await createAdapter({...hooks,invoke:()=>{called=true;return response();}})(request,{...context,caseId:'excluded'});assert.equal(r.ok,false);assert.equal(called,false);});
test('mutating view cannot change reusable source fixtures',async()=>{const r=await createAdapter(hooks)(request,context);r.view.evidence[0].text='changed';assert.notEqual(listScenarios('atelier')[0].response.evidence[0].text,'changed');});
test('private case is separately owned for both demo tenants',()=>{const a=listScenarios('atelier').find(c=>c.id==='private'),b=listScenarios('nordlicht').find(c=>c.id==='private');assert.notEqual(a.sku,b.sku);assert.notEqual(a.response.evidence[0].id,b.response.evidence[0].id);assert.throws(()=>validateView(a.response,{tenantId:'nordlicht',caseId:'private'}));});
test('local server: exact file allowlist, methods, host, security headers',async()=>{
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=server.address().port,base=`http://127.0.0.1:${port}`;
 try{
  const r=await fetch(base);assert.equal(r.status,200);assert.match(r.headers.get('content-security-policy'),/connect-src 'none'/);assert.equal(r.headers.get('set-cookie'),null);assert.equal(r.headers.get('cache-control'),'no-store');
  for(const uri of ['/README.md','/tests.mjs','/../../.git/config','/api/fitment','/missing.js'])assert.equal((await fetch(base+uri)).status,404);
  assert.equal((await fetch(base,{method:'POST'})).status,405);assert.equal((await fetch(base+'/embed.html',{method:'HEAD'})).status,200);
  const code=await new Promise(resolve=>{const q=http.get({hostname:'127.0.0.1',port,path:'/',headers:{Host:'evil.example'}},r=>{r.resume();r.on('end',()=>resolve(r.statusCode));});q.on('error',e=>{throw e;});});assert.equal(code,403);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
test('browser sources have no external transport, storage or HTML injection sinks',()=>{
 for(const file of ['host.mjs','widget.mjs','fixtures.mjs','adapter.mjs'])assert.doesNotMatch(fs.readFileSync(path.join(root,file),'utf8'),/\b(?:fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB|innerHTML|eval)\b/);
});
