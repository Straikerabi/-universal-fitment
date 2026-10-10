import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {catalogSnapshot as snapshot} from '../consumer-repair-mission-poc/catalog-snapshot.mjs';
import {freshDiscovery,discoveryControls,discoveryResults,consumerProfile} from '../consumer-repair-mission-poc/discovery-ui.mjs';
import {findDevices,deviceProfile,facets} from '../consumer-discovery-wave8/discovery.mjs';
import {freshMission,transition,currentDevice,assessment,saveMission,loadMission,buildRepairPassport,restoreMission} from '../consumer-repair-mission-poc/mission-state.mjs';
import {assetPaths,catalogFingerprint} from '../consumer-repair-mission-poc/offline-config.mjs';
import {configSource,workerSource,offlineConfig} from '../consumer-repair-mission-poc/prepare-offline.mjs';
import {createPreviewServer} from '../consumer-repair-mission-poc/serve.mjs';
test('actual 11/5 snapshot drives filters, counts, exact ranking and current Mission identity',()=>{
 assert.equal(facets(snapshot).total,11);assert.equal(facets(snapshot).brands.length,5);
 for(const d of snapshot.devices){
  const result=discoveryResults(snapshot,{...freshDiscovery(),query:d.reference},null);
  assert.ok(result.ids.includes(d.id));assert.match(result.markup,/Exakte Katalogkennung/);
  const state=transition(freshMission(),{type:'device',value:d.id});
  assert.equal(currentDevice(state),d);assert.equal(deviceProfile(snapshot,d.id).reference,d.reference);
  for(const i of d.identifiers)assert.ok(consumerProfile(snapshot,d.id).includes(i.value));
  assert.equal(assessment(state).status,'unclear');assert.equal(assessment(state).purchaseAllowed,false);
 }
});
test('explicit exact identifiers beat name matches; sibling suffixes and revisions never substitute',()=>{
 for(const query of ['VS20C95D4TK/WA','VS90F40EEM/WD','QA-SYNTHETIC-UNKNOWN'])assert.deepEqual(discoveryResults(snapshot,{...freshDiscovery(),query},null).ids,[]);
 const synthetic={devices:[{id:'fixture:01',brand:'TEST ONLY',model:'Unit',reference:'UNIT/01',identifiers:[]},{id:'fixture:02',brand:'TEST ONLY',model:'UNIT/01 display name',reference:'UNIT/02',identifiers:[]}],parts:[]};
 assert.equal(findDevices(synthetic,{query:'UNIT/01'}).items[0].device.id,'fixture:01');
 assert.equal(findDevices(synthetic,{query:'UNIT/03'}).visibleCount,0);
 assert.equal(transition(freshMission(),{type:'device',value:'fixture:01'}).deviceId,null);
});
test('brand/type intersection and explanatory misses do not claim unavailable inventory',()=>{
 const f={...freshDiscovery(),brand:'Samsung',type:'bagged'};
 const r=discoveryResults(snapshot,f,null);assert.equal(r.ids.length,0);
 assert.match(r.markup,/nicht erfasst/);assert.match(r.markup,/ähnliche Variante/);assert.doesNotMatch(r.markup,/ausverkauft|nicht lieferbar/);
});
test('selection uses unchanged transition; searching does not replace state or clear carried notes',()=>{
 let s=transition(freshMission(),{type:'problem',value:'suction'});
 s=transition(s,{type:'device',value:snapshot.devices[0].id});
 s=transition(s,{type:'assembly',value:'filter'});s=transition(s,{type:'step',value:5});s=transition(s,{type:'done',value:'identity'});
 const before=JSON.stringify(s);discoveryResults(snapshot,{...freshDiscovery(),query:'unknown'},s.deviceId);consumerProfile(snapshot,s.deviceId);
 assert.equal(JSON.stringify(s),before);assert.equal(s.problemId,'suction');
 const storage=new Map();const api={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)};
 assert.ok(saveMission(api,s));assert.deepEqual(loadMission(api),s);
 assert.equal(buildRepairPassport(s).device.catalogId,s.deviceId);
 const next=transition(s,{type:'device',value:snapshot.devices[1].id});assert.deepEqual(next.done,[]);assert.equal(next.assemblyId,null);
});
test('HTML composition escapes all catalogue fields and refuses unsafe source links',()=>{
 const d={...snapshot.devices[0],id:'fixture:" onclick="boom',brand:'<svg onload=boom>',reference:'<img src=x>',model:'<script>boom</script>',source:{name:'<img>',url:'javascript:boom()',checkedAt:'<script>'}};
 const poisoned={...snapshot,devices:[d]};
 const html=discoveryControls(poisoned,{...freshDiscovery(),query:'"><img src=x>'})+discoveryResults(poisoned,freshDiscovery(),null).markup+consumerProfile(poisoned,d.id);
 assert.doesNotMatch(html,/<script>|<img|<svg|href="javascript|onclick="boom/);assert.match(html,/&lt;script&gt;/);
});
test('research-only OEM numbers and details cannot enter the Consumer projection',()=>{
 const contaminated={...snapshot,observations:{power:'SYNTHETIC-RESEARCH-9999'},devices:snapshot.devices.map(d=>({...d,technicalSpecs:{power:'SYNTHETIC-RESEARCH-9999'},repairInstructions:'SYNTHETIC-UNREVIEWED-GUIDE',rights:'licensed'}))};
 for(const d of contaminated.devices){const html=consumerProfile(contaminated,d.id);assert.doesNotMatch(html,/SYNTHETIC-RESEARCH|SYNTHETIC-UNREVIEWED|licensed/);assert.match(html,/nicht unabhängig verifiziert/);assert.match(html,/Datennutzungsrechte.*nicht bestätigt/);}
 const source=fs.readFileSync(new URL('../consumer-repair-mission-poc/discovery-ui.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(source,/from\s+['"].*(?:catalog-oem|observations)/);
});
test('source date/version and real identity URLs survive without claiming live validity or rights',()=>{
 for(const d of snapshot.devices){const html=consumerProfile(snapshot,d.id);assert.ok(html.includes(d.source.checkedAt));assert.ok(html.includes(String(snapshot.version)));assert.match(html,/nicht live geprüft/);assert.match(html,/Keine OEM-Partnerschaft/);assert.equal(deviceProfile(snapshot,d.id).fitmentConfirmed,false);}
 assert.equal(consumerProfile(snapshot,'missing'), '');
});
test('missing source-backed fields remain unknown, even if unreviewed numeric research exists',()=>{
 const s={version:99,appVersion:'SYNTHETIC-FIXTURE',devices:[{id:'fixture:blank',candidatePartIds:[],identifiers:[]}],parts:[]};
 const html=consumerProfile(s,'fixture:blank');assert.match(html,/Nicht dokumentiert/);assert.match(html,/Kein sicherer Quellenlink/);assert.match(html,/Technische Maße.*nicht im integrierten Snapshot/s);
});
test('11→29 scalability is a clearly synthetic fixture, never an import of PR84',()=>{
 const fixture={...snapshot,devices:Array.from({length:29},(_,i)=>({...snapshot.devices[i%snapshot.devices.length],id:'fixture:synthetic-'+i,brand:'SYNTHETIC-'+(i%8),reference:'SYNTHETIC-'+i,identifiers:[]}))};
 const r=discoveryResults(fixture,freshDiscovery(),null);assert.equal(r.ids.length,29);assert.match(r.summary,/29 von 29/);assert.equal(facets(fixture).brands.length,8);
 assert.equal(snapshot.devices.length,11);assert.equal(transition(freshMission(),{type:'device',value:fixture.devices[0].id}).deviceId,null);
});
test('synthetic demo isolation and the existing core statuses remain intact',()=>{
 for(const scenario of ['filter-positive','filter-negative','revision-missing']){
  let s=transition(freshMission('synthetic'),{type:'scenario',value:scenario});s=transition(s,{type:'assembly',value:'filter'});s=transition(s,{type:'variant',known:true,code:''});
  assert.equal(consumerProfile(snapshot,s.deviceId),'');assert.equal(assessment(s).synthetic,true);assert.equal(assessment(s).purchaseAllowed,false);
  assert.equal(buildRepairPassport(s).device.manufacturerIdentitySource,null);
 }
});
test('whole generated config and classic worker are deterministic; stale pre-bridge Mission resets',()=>{
 assert.equal(fs.readFileSync(new URL('../consumer-repair-mission-poc/offline-config.mjs',import.meta.url),'utf8'),configSource());
 assert.equal(fs.readFileSync(new URL('../consumer-repair-mission-poc/offline-worker.mjs',import.meta.url),'utf8'),workerSource());
 assert.deepEqual(offlineConfig(),offlineConfig());assert.ok(assetPaths.includes('/consumer-discovery-wave8/discovery.mjs'));assert.ok(assetPaths.includes('/discovery-ui.mjs'));
 assert.ok(assetPaths.every(p=>!p.includes('observations')&&!p.includes('catalog-oem')));
 const previousConfig=execFileSync('git',['show','3bafbc7fd8c8da5ed6fe3bddc70eacbc0be1e035:integrations/consumer-repair-mission-poc/offline-config.mjs'],{encoding:'utf8'});
 const previousFingerprint=JSON.parse(previousConfig.match(/export const catalogFingerprint=(.*);/)[1]);
 assert.notEqual(catalogFingerprint,previousFingerprint);
 assert.equal(restoreMission({...transition(freshMission(),{type:'device',value:snapshot.devices[0].id}),fingerprint:previousFingerprint}).deviceId,null);
});
test('local server exposes only the pure shared helper, never OEM research or adjacent tooling',async()=>{
 const server=createPreviewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 try{const r=await fetch(base+'/consumer-discovery-wave8/discovery.mjs');assert.equal(r.status,200);assert.equal(await r.text(),fs.readFileSync(new URL('../consumer-discovery-wave8/discovery.mjs',import.meta.url),'utf8'));
  for(const p of ['/consumer-discovery-wave8/discovery.test.mjs','/catalog-oem-passports-wave8/observations.json','/consumer-discovery-wave8/app.mjs'])assert.equal((await fetch(base+p)).status,404);
 }finally{await new Promise(r=>server.close(r));}
});
