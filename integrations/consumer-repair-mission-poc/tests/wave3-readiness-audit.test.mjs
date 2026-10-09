import test from 'node:test';
import assert from 'node:assert/strict';
import {auditWave3Readiness,wave3Sources} from '../wave3-readiness-audit.mjs';

const device={id:'d1',brand:'Samsung',recordType:'model',identifiers:[{type:'manufacturer-model',value:'TEST/WD'}]};
const article={id:'a1',brand:'Samsung',identifiers:[{type:'manufacturer-article',value:'PART-1'}]};
const legacy={baseCommit:wave3Sources.base,checkpointSha256:wave3Sources.checkpointSha256,
  devices:Array.from({length:11},(_,i)=>({id:'d'+(i+1),brand:'Samsung',reference:'TEST/WD'})),
  parts:Array.from({length:11},(_,i)=>({id:'a'+(i+1),brand:'Samsung',code:'PART-'+(i+1)}))};
const fixture=()=>({products:Array.from({length:11},(_,i)=>({...device,id:'d'+(i+1),
    identifiers:[{type:'manufacturer-model',value:i?'OTHER-'+i:'TEST/WD'}]})),
  parts:Array.from({length:11},(_,i)=>({...article,id:'a'+(i+1),
    identifiers:[{type:'manufacturer-article',value:'PART-'+(i+1)}]})),
  legacySnapshot:legacy,evidence:{fitments:Array.from({length:36},(_,i)=>({
    brand:'Samsung',partCode:'PART-'+(i+1),reference:'TEST/WD',sourceId:'source1',
    region:'DE',conditions:['Revision offen'],serialScope:'unresolved',revisionScope:'unknown',productCode:null
  }))}});
test('retains 11 identities without granting a physical fit',()=>{
 const x=fixture(),r=auditWave3Readiness(x);
 assert.equal(r.measured.retainedPilotDevices,11);assert.equal(r.measured.retainedPilotParts,11);
 assert.equal(r.measured.conditionalAssociations,36);assert.equal(r.measured.realInstallationApproved,0);
 assert.equal(r.associations[0].identityResolution,'matched-for-review');
 assert.equal(r.associations[0].installationApproved,false);
 assert.equal(r.consumerSnapshotMigrated,false);assert.equal(r.canDeclareFullySynchronizedConsumer,false);
 assert.deepEqual(r.errors,[]);
});
test('does not infer regional/family alias matches or install approval',()=>{
 const x=fixture();x.evidence.fitments[0].reference='TEST/WA';
 const r=auditWave3Readiness(x);
 assert.equal(r.associations[0].identityResolution,'needs-identity-review');
 assert.equal(r.associations[0].deviceId,null);
 assert.equal(r.associations[0].fitmentDecision,'unconfirmed');
});
test('flags missing legacy article and duplicate manufacturer association',()=>{
 const x=fixture();x.parts=x.parts.filter(p=>p.id!=='a11');x.evidence.fitments[1]={...x.evidence.fitments[0]};
 const r=auditWave3Readiness(x);
 assert.ok(r.errors.some(s=>s.includes('Original OEM item missing')));
 assert.ok(r.errors.some(s=>s.includes('Duplicate manufacturer')));
});
test('fails closed if source locks or measured full-catalog counts differ',()=>{
 const x=fixture();x.legacySnapshot={...x.legacySnapshot,baseCommit:'other'};
 const r=auditWave3Readiness({...x,strictCounts:true});
 assert.ok(r.errors.some(s=>s.includes('source lock')));
 assert.ok(r.errors.some(s=>s.includes('Combined source count differs')));
});
test('never resolves same-brand candidate from model name alone',()=>{
 const x=fixture();x.products[0]={...x.products[0],identifiers:[{type:'manufacturer-model',value:'TEST'}],model:'TEST/WD'};
 const r=auditWave3Readiness(x);assert.equal(r.associations[0].deviceId,null);
});
