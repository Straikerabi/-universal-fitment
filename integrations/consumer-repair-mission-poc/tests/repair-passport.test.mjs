import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogSnapshot} from '../catalog-snapshot.mjs';
import {freshMission,transition,buildRepairPassport,exportRepairPassport,verifyRepairPassportJson} from '../mission-state.mjs';

const choose=()=> {
 let s=transition(freshMission(),{type:'device',value:catalogSnapshot.devices[0].id});
 s=transition(s,{type:'assembly',value:'filter'});
 return s;
};
const fixed={issuedAt:'2026-10-10T00:00:00.000Z'};
test('repair passport refuses to invent an unknown device',()=>{
 assert.throws(()=>buildRepairPassport(freshMission(),fixed),/Gerät/);
});
test('real passport keeps source identity, market, version and missing checks',()=>{
 const s=choose(),p=buildRepairPassport(s,fixed);
 assert.equal(p.recordType,'real-catalog-research');
 assert.equal(p.device.catalogId,catalogSnapshot.devices[0].id);
 assert.equal(p.provenance.checkpointSha256,catalogSnapshot.checkpointSha256);
 assert.equal(p.device.sourceMarket,catalogSnapshot.devices[0].market);
 assert.ok(p.device.manufacturerIdentitySource.url.startsWith('https://'));
 assert.ok(p.repair.openChecks.length);
 assert.equal(p.verdict.status,'unconfirmed');
 assert.equal(p.verdict.realInstallationApproved,false);
 assert.equal(p.verdict.purchaseAllowed,false);
 assert.equal(p.verdict.completeRepairKit,false);
 assert.equal(p.provenance.consumerWave3Integrated,false);
});
test('selected part stays an unconfirmed candidate after all available checks are ticked',()=>{
 let s=choose();const id=catalogSnapshot.devices[0].candidatePartIds[0];
 s=transition(s,{type:'part',value:id});
 const original=buildRepairPassport(s,fixed);
 assert.equal(original.repair.candidateParts.length,1);
 assert.equal(original.repair.candidateParts[0].physicalFitApproved,false);
 assert.ok(original.repair.candidateParts[0].articleIdentitySource.url);
 s=transition(s,{type:'done',value:'identity'});
 const done=buildRepairPassport(s,fixed);
 assert.equal(done.repair.markedNotes.length,1);
 assert.equal(done.verdict.status,'unconfirmed');
 assert.equal(done.verdict.realInstallationApproved,false);
});
test('user-entered variant mismatch remains a warning, never elevated to manufacturer claim',()=>{
 let s=transition(choose(),{type:'variant',known:true,code:'OTHER-REVISION'});
 const p=buildRepairPassport(s,fixed);
 assert.equal(p.device.referenceEnteredByUser,'OTHER-REVISION');
 assert.equal(p.device.variantIndependentlyVerified,false);
 assert.ok(p.verdict.missingInformation.some(x=>x.includes('weicht')));
});
test('synthetic demo cannot masquerade as real OEM compatibility',()=>{
 let s=transition(freshMission('synthetic'),{type:'scenario',value:'filter-positive'});
 s=transition(s,{type:'variant',known:true});
 s=transition(s,{type:'assembly',value:'filter'});
 const p=buildRepairPassport(s,fixed);
 assert.equal(p.recordType,'synthetic-test-only');
 assert.equal(p.verdict.status,'synthetic-demo-only');
 assert.equal(p.verdict.syntheticEngineOutcome,'supported');
 assert.equal(p.device.manufacturerIdentitySource,null);
 assert.deepEqual(p.repair.candidateParts,[]);
 assert.equal(p.verdict.realInstallationApproved,false);
});
test('local JSON export has deterministic SHA256 integrity check but not an OEM signature',async()=>{
 const s=choose();
 const a=await exportRepairPassport(s,fixed),b=await exportRepairPassport(s,fixed);
 assert.equal(a,b);
 assert.equal(await verifyRepairPassportJson(a),true);
 assert.match(a,/keine Signatur, keine OEM-Freigabe/);
 const modified=JSON.parse(a);modified.payload.verdict.realInstallationApproved=true;
 assert.equal(await verifyRepairPassportJson(modified),false);
});
test('revision or selected assembly changes invalidate report payload and its digest',async()=>{
 const s=choose(),r=JSON.parse(await exportRepairPassport(s,fixed));
 const changed=transition(s,{type:'assembly',value:'brush'});
 const r2=JSON.parse(await exportRepairPassport(changed,fixed));
 assert.notEqual(r.integrity.sha256,r2.integrity.sha256);
 assert.equal(r2.verdict.realInstallationApproved,false);
});
