// Separate fresh data projection; no historical archive recovery or engine verdict.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {configSource,offlineConfig} from '../consumer-repair-mission-poc/prepare-offline.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),repo=path.resolve(here,'../..'),consumer=path.resolve(here,'../consumer-repair-mission-poc');
export const base='620a4ae8bf49f5c0c212da4acddad249b8b8764b',branch='work/wave7-fresh-oem-consumer-pilot';
export const sha=x=>createHash('sha256').update(x).digest('hex');const read=n=>fs.readFileSync(path.join(here,n));
export const loadPilot=()=>JSON.parse(read('pilot.json'));
export const loadBaseline=()=>{assert.equal(sha(read('baseline.json')),'25db18139643e770ce37b1f7a9b8f5f89fd8d2e20c0b4a749f67c40f1e233b76');return JSON.parse(read('baseline.json'));};
const hosts={AEG:'shop.aeg.de',Bosch:'www.bosch-home.com',Dyson:'www.dyson.de',Miele:'www.miele.de',Samsung:'www.samsung.com',Siemens:'www.siemens-home.bsh-group.com',Vorwerk:'www.vorwerk.com'};
const unique=(xs,key)=>assert.equal(new Set(xs.map(key)).size,xs.length,'duplicate identity');
const factual=x=>{for(const k of ['price','stock','offers','shipping','image','imageUrl','confirmedFitment'])assert.ok(!Object.hasOwn(x,k),'commercial/media field forbidden');};
export function project(p=loadPilot(),b=loadBaseline()){
 assert.equal(p.schema,'uf.fresh-oem-pilot/1');assert.equal(p.branchBase,base);
 assert.equal(b.snapshot.devices.length,11);assert.equal(b.snapshot.parts.length,11);
 unique(p.sources,x=>x.id);const sources=new Map(p.sources.map(s=>[s.id,s]));
 for(const s of p.sources){factual(s);assert.equal(s.status,200);assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.ok(s.bytes>0&&s.bytes<2000000);assert.ok(Number.isFinite(Date.parse(s.retrievedAt)));assert.equal(s.rights.b2cCommercial,'unknown');for(const key of ['url','finalUrl']){const u=new URL(s[key]);assert.equal(u.protocol,'https:');assert.equal(u.hostname,hosts[s.brand]);}}
 const proof=(e,brand)=>{const s=sources.get(e?.sourceId);assert.ok(s,'proof absent');assert.equal(s.brand,brand);assert.equal(e.url,s.url);assert.equal(e.sha256,s.sha256);assert.equal(e.retrievedAt,s.retrievedAt);assert.ok(e.locator);return s;};
 const source=s=>({name:s.brand+' · frischer OEM-Pilot',url:s.url,checkedAt:s.retrievedAt.slice(0,10),scope:'catalog-identity-observation',rights:'factual identity only; B2C commercial rights unknown; no media copied',auditSourceId:s.id,auditSha256:s.sha256,usageRights:s.rights});
 const devices=p.devices.map(d=>{factual(d);assert.equal(d.market,'DE');const s=proof(d.identityEvidence,d.brand);assert.ok(d.identifiers.some(i=>i.value===d.reference&&i.issuer===d.brand));assert.ok(d.unresolved.length);
  if(['Siemens','Bosch'].includes(d.brand))assert.match(d.reference,/^[A-Z0-9]+\/\d{2}$/);if(d.brand==='AEG')assert.match(d.reference,/^\d{11}$/);if(d.brand==='Samsung')assert.match(d.reference,/^[A-Z0-9]+\/WD$/);if(d.brand==='Dyson')assert.match(d.reference,/^\d{6}-\d{2}$/);
  return {...d,source:source(s),assessment:'unavailable',legacyListedPartCount:0,provenance:p.release};});
 const parts=p.parts.map(a=>{factual(a);const s=proof(a.identityEvidence,a.brand);assert.ok(a.identifiers.some(i=>i.value===a.code&&i.issuer===a.brand));
  if(a.brand==='Miele')assert.match(a.code,/^\d{7,8}$/);if(a.brand==='AEG')assert.match(a.code,/^\d{10,12}$/);if(a.brand==='Siemens')assert.match(a.code,/^\d{8}$/);if(a.brand==='Dyson')assert.match(a.code,/^\d{6}-\d{2}$/);if(a.brand==='Vorwerk'){assert.ok(['FP7','MF7'].includes(a.code));assert.equal(a.identifiers[0].type,'manufacturer-part-designation');}
  assert.ok(['filter','bag','battery','mechanical'].includes(a.assembly));return {...a,source:source(s),assessment:'unavailable',legacyStatus:'unconfirmed',provenance:p.release};});
 const dm=new Map(devices.map(d=>[d.id,d])),pm=new Map(parts.map(a=>[a.id,a]));unique(p.listings,l=>l.deviceId+'|'+l.partId);
 for(const l of p.listings){const d=dm.get(l.deviceId),a=pm.get(l.partId);assert.ok(d&&a);assert.equal(d.brand,a.brand);assert.equal(l.deviceReference,d.reference);assert.equal(l.partCode,a.code);assert.equal(l.assembly,a.assembly);proof(l.evidence,d.brand);assert.equal(l.status,'unconfirmed');assert.equal(l.purchaseAllowed,false);assert.equal(l.physicalFitApproved,false);assert.ok(l.missing.length);}
 for(const d of devices){unique(d.candidatePartIds,x=>x);assert.deepEqual([...d.candidatePartIds].sort(),p.listings.filter(l=>l.deviceId===d.id).map(l=>l.partId).sort(),'candidate needs independent scoped listing');}
 const allDevices=[...b.snapshot.devices,...devices],allParts=[...b.snapshot.parts,...parts];unique(allDevices,d=>d.id);unique(allDevices,d=>d.brand+'|'+d.reference);unique(allParts,a=>a.id);unique(allParts,a=>a.brand+'|'+a.code);
 const snapshot={...b.snapshot,version:2,freshPilotIntegrated:true,freshPilot:{release:p.release,branchBase:base,manifestSha256:sha(read('pilot.json')),sourceResponseCount:p.sources.length,baselineSnapshotSha256:b.lock.snapshotSha256},devices:allDevices,parts:allParts};
 const counts={baselineDevices:11,retainedBaselineDevices:allDevices.filter(d=>b.lock.deviceIds.includes(d.id)).length,additionalDevices:devices.length,consumerDevices:allDevices.length,additionalBrands:new Set(devices.map(d=>d.brand)).size,consumerBrands:new Set(allDevices.map(d=>d.brand)).size,baselineParts:11,additionalParts:parts.length,consumerParts:allParts.length,freshSourceResponses:p.sources.length,newDevicePartListings:p.listings.length,newDevicesWithNoSelectedParts:devices.filter(d=>!d.candidatePartIds.length).length,newPhysicalFitApprovals:0,newPurchaseApprovals:0,wave3EdgesUpgraded:0};
 return {snapshot,counts};
}
export function outputs(){const {snapshot,counts}=project(),b=loadBaseline();const text='// Factual identity snapshot only. No new fitment decisions, prices or images.\nexport const catalogSnapshot='+JSON.stringify(snapshot,null,2)+';\n';
 const lock={...b.lock,version:2,baselineSnapshotSha256:b.lock.snapshotSha256,baselineManifestSha256:sha(read('baseline.json')),freshPilotRelease:snapshot.freshPilot.release,freshManifestSha256:sha(read('pilot.json')),freshSourcePins:Object.fromEntries(loadPilot().sources.map(s=>[s.id,s.sha256])),counts,deviceIds:snapshot.devices.map(d=>d.id),partIds:snapshot.parts.map(a=>a.id),snapshotSha256:sha(text)};
 return {'catalog-snapshot.mjs':text,'catalog-lock.json':JSON.stringify(lock,null,2)+'\n','coverage-wave7.json':JSON.stringify({schema:'uf.consumer-coverage/2',release:snapshot.freshPilot.release,scope:'Actually used Consumer snapshot; full manufacturer variants, not historical Wave3 rows',counts,brands:[...new Set(snapshot.devices.map(d=>d.brand))].sort().map(brand=>({brand,baseline:b.snapshot.devices.filter(d=>d.brand===brand).length,added:snapshot.devices.filter(d=>d.brand===brand&&d.provenance===snapshot.freshPilot.release).length,consumer:snapshot.devices.filter(d=>d.brand===brand).length}))},null,2)+'\n'};}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const write=process.argv.includes('--write'),ci=process.argv.indexOf('--cache');assert.equal(execFileSync('git',['branch','--show-current'],{cwd:repo,encoding:'utf8'}).trim(),branch);
 if(write||ci>=0){assert.ok(ci>=0&&process.argv[ci+1],'private cache required before writing');console.log(execFileSync('python',['-B',path.join(here,'import_sources.py'),'--cache',process.argv[ci+1]],{encoding:'utf8'}).trim());}
 for(const [name,text] of Object.entries(outputs())){const target=name==='coverage-wave7.json'?path.join(here,name):path.join(consumer,name);if(write)fs.writeFileSync(target,text);else assert.equal(fs.readFileSync(target,'utf8'),text,name+' differs');}
 if(write)fs.writeFileSync(path.join(consumer,'offline-config.mjs'),configSource());else assert.equal(fs.readFileSync(path.join(consumer,'offline-config.mjs'),'utf8'),configSource());
 console.log(JSON.stringify({state:write?'generated-after-source-replay':'byte-identical',...project().counts,...offlineConfig()}));
}
