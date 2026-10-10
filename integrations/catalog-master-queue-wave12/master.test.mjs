import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TAXONOMY_VERSION,groups,categories,identificationProfiles,categorySummary} from '../universal-category-foundation/registry.mjs';
import {deriveMaster,validateEvidence,deriveStates,nextWork,appendEvent,deriveReport,markdownReport,batchId} from './master.mjs';
import {generated} from './cli.mjs';
const master=deriveMaster(),journal={schema:'uf-journal-wave12/1',taxonomyVersion:master.taxonomyVersion,events:[]};
const evidence={schema:'uf-evidence-wave12/1',taxonomyVersion:master.taxonomyVersion,observations:[]};
const copy=x=>structuredClone(x);
const event=(id,action,extra={})=>({eventId:'test-'+id+'-'+action,categoryId:id,batchId:batchId(id),action,
 receiptRef:['start'].includes(action)?null:'SYNTHETIC-WORK-RECEIPT-NOT-OEM-PROOF',
 reviewer:'test-researcher',recordedAt:'2026-10-11T00:00:00Z',...extra});
test('exactly derive taxonomy version, 13 parents and 200 leaves from registry',()=>{
 assert.equal(master.taxonomyVersion,TAXONOMY_VERSION);assert.equal(master.leafCount,categories.length);
 assert.equal(master.groups.length,groups.length);assert.deepEqual(master.categoryIds,categories.map(x=>x.id));
 assert.deepEqual(master.groups.map(x=>x.id),groups.map(x=>x.id));
 assert.equal(master.leafCount,200);assert.equal(master.groups.length,13);
 assert.equal(categorySummary().categories,master.leafCount);
});
test('no invented ids or missing registry aliases and profile fields',()=>{
 for(let i=0;i<categories.length;i++){
  const c=categories[i],m=master.categories[i];
  assert.equal(m.id,c.id);assert.equal(m.parentId,c.group);assert.equal(m.label,c.label);
  assert.deepEqual(m.aliases,c.aliases||[]);assert.deepEqual(m.identificationProfile.requiredForCatalog,identificationProfiles[c.profile].requiredForCatalog);
  assert.deepEqual(m.identificationProfile.variantChecks,identificationProfiles[c.profile].variantChecks);
  assert.ok(m.identificationProfile.safety.length>=identificationProfiles[c.profile].safety.length);
 }
 assert.equal(master.categoryIds.filter(x=>x==='vacuum-cleaner').length,1);
});
test('199 categories planned, only vacuum private pilot; all legal and fitment gates fail closed',()=>{
 const s=deriveReport(master,journal,evidence);
 assert.equal(s.plannedCount,199);assert.deepEqual(s.privatePilotIds,['vacuum-cleaner']);
 assert.ok(master.categories.every(c=>c.evidenceGates.fitmentConfirmed===false&&c.evidenceGates.rightsApproved===false&&c.evidenceGates.consumerPublished===false));
 assert.equal(s.gates.launchApproved,false);
 assert.ok(master.categories.filter(x=>x.id!=='vacuum-cleaner').every(x=>x.registryPolicy.fitmentEngineCategory===null));
});
test('first priorities are vacuum washer specialized car dishwasher dryer coffee and tools',()=>{
 assert.deepEqual(nextWork(master,journal,evidence,7).map(x=>x.categoryId),[
  'vacuum-cleaner','washing-machine','car','dishwasher','tumble-dryer','coffee-machine','cordless-drill']);
 const vehicle=master.categories.find(x=>x.id==='car');
 assert.ok(vehicle.dependencies.includes('licensed-specialist-HSN-TSN-VIN-KBA-data'));
 assert.equal(vehicle.research.specializedSource,'HSN-TSN-FIN-KBA-separate-license');
});
test('restricted categories are present in master but withheld from unapproved queue',()=>{
 const restricted=master.categories.filter(x=>x.priority.ownerScopeRequired);
 assert.ok(restricted.length>0);assert.equal(restricted.length,18);
 const suggestions=nextWork(master,journal,evidence,100);
 assert.ok(suggestions.every(x=>!restricted.some(r=>r.id===x.categoryId)));
 assert.ok(master.categories.some(x=>x.identificationProfile.id==='spaceReference'));
 assert.ok(master.categories.some(x=>x.identificationProfile.id==='defenceReference'));
});
test('default durable journal and separate evidence index both empty and deterministic',()=>{
 assert.deepEqual(deriveStates(master,journal).get('vacuum-cleaner'),{batch:1,status:'ready',completed:[],blocker:null});
 assert.equal(validateEvidence(evidence,master),true);
 assert.deepEqual(deriveReport(master,journal,evidence),deriveReport(master,journal,evidence));
});
test('start -> complete does not repeat completed category/batch',()=>{
 const id='vacuum-cleaner',a=appendEvent(journal,event(id,'start'),master,evidence);
 assert.equal(deriveStates(master,a).get(id).status,'in_progress');
 const b=appendEvent(a,event(id,'complete'),master,evidence);
 assert.equal(deriveStates(master,b).get(id).status,'completed');
 assert.ok(!nextWork(master,b,evidence,12).some(x=>x.categoryId===id));
 assert.equal(deriveReport(master,b,evidence).gates.fitmentConfirmed,false);
});
test('identical replay is idempotent and conflicting event id is blocked',()=>{
 const once=appendEvent(journal,event('washing-machine','start'),master,evidence);
 const twice=appendEvent(once,event('washing-machine','start'),master,evidence);
 assert.deepEqual(once,twice);assert.equal(twice.events.length,1);
 assert.throws(()=>appendEvent(once,event('washing-machine','start',{recordedAt:'2026-10-12T00:00:00Z'}),master,evidence),/Conflicting event/);
});
test('new batch requires completed prior work and explicit fresh receipt; never reuse first batch',()=>{
 const id='vacuum-cleaner',started=appendEvent(journal,event(id,'start'),master,evidence);
 const done=appendEvent(started,event(id,'complete'),master,evidence);
 assert.throws(()=>appendEvent(journal,event(id,'next-batch'),master,evidence));
 const active=appendEvent(done,event(id,'next-batch'),master,evidence);
 const st=deriveStates(master,active).get(id);
 assert.equal(st.batch,2);assert.deepEqual(st.completed,[batchId(id,1)]);
 assert.equal(st.status,'ready');assert.equal(nextWork(master,active,evidence,1)[0].batchId,batchId(id,2));
});
test('reject arbitrary completed work without start and missing completion receipt',()=>{
 assert.throws(()=>appendEvent(journal,event('vacuum-cleaner','complete'),master,evidence));
 const x=appendEvent(journal,event('vacuum-cleaner','start'),master,evidence);
 assert.throws(()=>appendEvent(x,event('vacuum-cleaner','complete',{receiptRef:null}),master,evidence));
});
test('blocked work is not suggested; resume requires explicit blocker review',()=>{
 const a=appendEvent(journal,event('washing-machine','block'),master,evidence);
 assert.equal(deriveStates(master,a).get('washing-machine').status,'blocked');
 assert.ok(!nextWork(master,a,evidence,12).some(x=>x.categoryId==='washing-machine'));
 assert.throws(()=>appendEvent(a,event('washing-machine','resume',{receiptRef:null}),master,evidence));
 const b=appendEvent(a,event('washing-machine','resume'),master,evidence);
 assert.equal(deriveStates(master,b).get('washing-machine').status,'ready');
});
test('reject wrong category, wrong batch and arbitrary work action',()=>{
 assert.throws(()=>appendEvent(journal,event('invented-category','start'),master,evidence),/Unknown registry/);
 assert.throws(()=>appendEvent(journal,event('vacuum-cleaner','start',{batchId:'vacuum-cleaner::research-0007'}),master,evidence),/Batch ID/);
 assert.throws(()=>appendEvent(journal,event('vacuum-cleaner','approve-fitment'),master,evidence),/Unsupported journal action/);
});
test('prevent fabricated evidence rights and physical fits through separated index',()=>{
 const source={id:'test-source',categoryId:'washing-machine',batchId:batchId('washing-machine'),reference:'SYNTHETIC-REFERENCE',
  sourceStatus:'reference_unverified',rightsStatus:'unknown',fitmentStatus:'not_authorized',published:false};
 const e={...evidence,observations:[source]};
 assert.equal(validateEvidence(e,master),true);
 for(const mutate of [
  x=>x.sourceStatus='independently_verified',x=>x.rightsStatus='granted',x=>x.fitmentStatus='approved',
  x=>x.published=true,x=>x.categoryId='invented-category',x=>x.reference=''
 ]){const v=copy(e);mutate(v.observations[0]);assert.throws(()=>validateEvidence(v,master))}
});
test('market research target does not imply market coverage or OEM licence',()=>{
 assert.ok(master.categories.every(x=>x.market.researchTarget==='DE'&&x.market.verifiedMarkets.length===0&&x.market.sourceMarketVerified===false));
 assert.ok(master.categories.every(x=>x.registryPolicy.publicCommercialUse==='not-reviewed'));
});
test('invalid limits and unapproved unknown statuses rejected',()=>{
 assert.throws(()=>nextWork(master,journal,evidence,0));assert.throws(()=>nextWork(master,journal,evidence,201));
 assert.throws(()=>deriveStates(master,{...journal,taxonomyVersion:'0.5.0'}));
 const q=copy(journal);q.extraField='release';assert.throws(()=>deriveStates(master,q));
});
test('queue-only work receipt cannot become source or product approval',()=>{
 const id='vacuum-cleaner',a=appendEvent(journal,event(id,'start'),master,evidence);
 const done=appendEvent(a,event(id,'complete'),master,evidence);
 const r=deriveReport(master,done,evidence);
 assert.equal(r.gates.commercialRightsApproved,false);assert.equal(r.gates.consumerPublished,false);
 assert.equal(r.gates.fitmentConfirmed,false);assert.equal(r.nextSuggested.some(x=>x.categoryId===id),false);
});
test('all generated master and reports identical to checked-in files',()=>{
 const out=generated(master,journal,evidence);
 for(const [name,body] of out.files)assert.equal(readFileSync(new URL(name,import.meta.url),'utf8'),body,name+' drift');
 assert.ok(markdownReport(out.report).includes('200'));
});
