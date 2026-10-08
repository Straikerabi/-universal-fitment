import assert from 'node:assert/strict';
import {createPilotClient,pilotConfig} from '../src/core/pilot-client.js';
import {checkPilotHealth,normalizeHealth,readinessReport} from '../src/core/pilot-readiness.js';
const sample={status:'ready',backendVersion:4,partCount:167,liveOffersEnabled:false,pilotBackendVerifiedAtStartup:true,quotaBackendVerifiedAtStartup:true,providers:{ebay:'access_required',amazon:'access_required'}};
let calls=0,code=200,payload=sample;
const fetchHealth=async(url,options)=>{calls++;assert.equal(url,pilotConfig.url+'/functions/v1/marketplace-search/health');assert.equal(options.method,'GET');assert.equal(options.cache,'no-store');assert.equal(options.headers,undefined);return Response.json(payload,{status:code});};
let health=await checkPilotHealth({fetchImpl:fetchHealth});assert.equal(health.status,'checked');assert.equal(health.health.partCount,167);
for(const extra of [{backendVersion:3},{providers:{ebay:'live',amazon:'access_required'}},{liveOffersEnabled:'true'},{pilotBackendVerifiedAtStartup:null},{partCount:-1}]){
  payload={...sample,...extra};assert.equal((await checkPilotHealth({fetchImpl:fetchHealth})).status,'unsupported');
}
payload=sample;code=503;assert.equal((await checkPilotHealth({fetchImpl:fetchHealth})).status,'unavailable');code=200;
const abort=new AbortController();abort.abort();assert.equal((await checkPilotHealth({fetchImpl:fetchHealth,signal:abort.signal})).status,'cancelled');
assert.equal(normalizeHealth(null),null);
const report=readinessReport({appVersion:'1.24.0',healthResult:health,accessResult:{status:'pilot_allowed',email:'PRIVATE-EMAIL',token:'PRIVATE-TOKEN'},loggedIn:true,serial:'PRIVATE-SERIAL'});
assert.ok(report.includes('Server: 4'));assert.ok(report.includes('Katalogteile: 167'));assert.ok(!report.includes('PRIVATE'));
assert.ok(readinessReport({appVersion:'1.24.0',healthResult:{status:'checked',health:{...sample,providers:{ebay:'PRIVATE-TOKEN',amazon:'access_required'}}},accessResult:{status:'PRIVATE-TOKEN'}}).includes('eBay: offen'));

let event,session={access_token:'synthetic-user-token'},responseCode=200,accessPayload={status:'pilot_allowed',pilotAllowed:true,backendVersion:4,providers:sample.providers};
const auth={signOut:async()=>{session=null;event?.('SIGNED_OUT');},signInWithPassword:async()=>{session={access_token:'synthetic-user-token'};return {};},getUser:async()=>({data:{user:{id:'verified-pilot',email:'private@example.test',role:'authenticated',is_anonymous:false}}}),getSession:async()=>({data:{session}}),onAuthStateChange:fn=>{event=fn;}};
let accessCalls=0;
const client=createPilotClient({auth,fetchImpl:async(url,options)=>{accessCalls++;assert.equal(url,pilotConfig.url+'/functions/v1/marketplace-search/access');assert.equal(options.method,'GET');assert.equal(options.body,undefined);assert.equal(options.headers.Authorization,'Bearer synthetic-user-token');assert.equal(options.cache,'no-store');return Response.json(accessPayload,{status:responseCode});}});
assert.equal((await client.checkAccess()).status,'auth_required');assert.equal(accessCalls,0);
assert.equal(await client.signIn('private@example.test','synthetic'),true);assert.equal((await client.checkAccess()).status,'pilot_allowed');
responseCode=403;accessPayload={status:'pilot_access_required',pilotAllowed:false};assert.equal((await client.checkAccess()).status,'pilot_access_required');
accessPayload={status:'pilot_allowed',pilotAllowed:true};assert.equal((await client.checkAccess()).status,'unavailable','a forged success on 403 cannot enable access');
responseCode=503;accessPayload={status:'pilot_unavailable'};assert.equal((await client.checkAccess()).status,'pilot_unavailable');
responseCode=200;accessPayload={status:'pilot_allowed',pilotAllowed:'true',backendVersion:4,providers:sample.providers};assert.equal((await client.checkAccess()).status,'unsupported');
responseCode=401;assert.equal((await client.checkAccess()).status,'auth_required');assert.equal(client.user,null);
await client.signIn('private@example.test','synthetic');session=null;assert.equal((await client.checkAccess()).status,'auth_required');assert.equal(client.user,null);
await client.signIn('private@example.test','synthetic');event('SIGNED_OUT');const previousCalls=accessCalls;assert.equal((await client.checkAccess()).status,'auth_required');assert.equal(accessCalls,previousCalls);

let finishLogin,sdkSession=null,verifiedCalls=0;
const slowAuth={signOut:async()=>{sdkSession=null;},signInWithPassword:async()=>{await new Promise(resolve=>finishLogin=resolve);sdkSession={access_token:'late-token'};return {};},getUser:async()=>{verifiedCalls++;return {data:{user:{id:'pilot',role:'authenticated'}}};},getSession:async()=>({data:{session:sdkSession}})};
const slow=createPilotClient({auth:slowAuth,fetchImpl:async()=>{throw Error('must never call');}});
const signing=slow.signIn('a','synthetic');while(!finishLogin)await new Promise(resolve=>setTimeout(resolve,0));const signingOut=slow.signOut();finishLogin();assert.equal(await signing,false);await signingOut;assert.equal(slow.user,null);assert.equal(sdkSession,null,'late login cannot leave an SDK session after logout');assert.equal(verifiedCalls,0);
console.log('Pilot-readiness checks passed: guest health, typed access gates, expiry/logout, late-login SDK cleanup, unsupported responses and non-personal diagnostic report. Synthetic Auth only.');
