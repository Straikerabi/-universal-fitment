import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inspectOnBothSurfaces} from './bridge.mjs';
import {syntheticRequest,realCatalogUnknownRequest} from '../fitment-engine-v1-poc/fixtures.mjs';
import {createAdapter,validateView} from '../business-embed-poc/adapter.mjs';
import {assessFitment,validateResponse} from '../fitment-engine-v1-poc/contract.mjs';

const context={tenantId:'demo-tenant-one',caseId:'demo-case-one'};
const check=(mutate)=>{const r=syntheticRequest();mutate?.(r);return inspectOnBothSurfaces(r,context);};

test('the same v1 evidence gives matching B2C+B2B synthetic positive, never real purchase',()=>{
 const v=check();
 assert.equal(v.engine.status,'evidenced_compatible');
 assert.equal(v.engine.testOnly,true);
 assert.equal(v.engine.canConfirmFitment,false);
 assert.equal(v.engine.canConfirmPurchase,false);
 assert.equal(v.consumer.status,'supported');
 assert.equal(v.business.outcome,'confirmed');
 assert.equal(v.consumer.synthetic,true);
 assert.equal(v.consumer.purchaseAllowed,false);
 assert.equal(v.business.evidence[0].rights,'synthetic-test-only');
 assert.deepEqual(validateView(v.business,context),v.business);
});
test('one exact OEM exclusion becomes negative on both surfaces',()=>{
 const v=check(r=>r.evidence[0].assertion='incompatible');
 assert.equal(v.engine.status,'evidenced_incompatible');
 assert.equal(v.consumer.status,'incompatible');
 assert.equal(v.business.outcome,'excluded');
});
test('one connected-part mismatch becomes negative on both surfaces',()=>{
 const v=check(r=>{r.interfaces.requirements[0].expected='THREAD-A';r.interfaces.requirements[0].actual='THREAD-B';});
 assert.equal(v.engine.status,'evidenced_incompatible');
 assert.equal(v.consumer.status,'incompatible');
 assert.equal(v.business.outcome,'excluded');
 assert.equal(v.consumer.purchaseAllowed,false);
});
for(const [name,change] of [
 ['unknown revision',r=>r.variant.revision=null],
 ['region mismatch',r=>r.variant.market='different-region'],
 ['wrong OEM',r=>r.part.identifiers[0].value='OTHER-OEM'],
 ['missing source',r=>r.evidence[0].sourceIds=['missing']],
 ['source rights denied',r=>r.sources[0].rights.privateTest='denied'],
 ['malformed data',r=>r.part.badUnexpectedField='must be rejected'],
 ['high safety risk',r=>r.policy.risk='review-required'],
 ['synthetic context not production',r=>r.context.usage='b2b']
])test(name+' never becomes a positive consumer or B2B claim',()=>{
 const request=syntheticRequest();change(request);
 if(request.context.usage==='b2b')assert.throws(()=>inspectOnBothSurfaces(request,context),/Synthetic-only/);
 else if(request.part.badUnexpectedField)assert.throws(()=>inspectOnBothSurfaces(request,context),/permissions violated/);
 else {
   const v=inspectOnBothSurfaces(request,context);
   assert.equal(v.engine.status,'unconfirmed');
   assert.equal(v.consumer.status,'unclear');
   assert.equal(v.business.outcome,'unknown');
   assert.equal(v.consumer.purchaseAllowed,false);
 }
});
test('public reuse denial cannot be turned into a real publication',()=>{
 const v=check();
 assert.equal(v.engine.rights.reuseAllowed,false);
 assert.equal(v.consumer.fitmentAuthorized,false);
});
test('hidden/no display rights downgrade even complete synthetic evidence to unknown',()=>{
 const v=check(r=>r.sources[0].rights.link='denied');
 assert.equal(v.engine.status,'evidenced_compatible');
 assert.equal(v.consumer.status,'unclear');
 assert.equal(v.business.outcome,'unknown');
 assert.deepEqual(v.business.evidence,[]);
});
test('B2B already-existing hook boundary can consume the canonical v1 response',async()=>{
 const request=syntheticRequest();
 const adapter=createAdapter({
  invoke:async()=>assessFitment(request),
  validateContract:resp=>validateResponse(resp).length===0&&resp.testOnly===true,
  mapToView:(resp,ctx)=>{
   const v=inspectOnBothSurfaces(request,ctx);
   assert.deepEqual(v.engine,resp);
   return v.business;
  }
 });
 const r=await adapter({caseId:context.caseId},{...context});
 assert.equal(r.ok,true);assert.equal(r.view.outcome,'confirmed');
 const other=await adapter({caseId:context.caseId},{tenantId:'invalid',caseId:'different'});
 assert.equal(other.ok,false);
 assert.equal(other.view,null);
});
test('real Miele recorded catalogue example cannot enter the synthetic integration',()=>{
 const real=realCatalogUnknownRequest();
 assert.equal(assessFitment(real).status,'unconfirmed');
 assert.throws(()=>inspectOnBothSurfaces(real,context),/Synthetic-only/);
});
test('wrong schema and unknown tenant must fail closed',()=>{
 assert.throws(()=>check(r=>r.schemaVersion='2.0.0'),/Shared contract/);
 assert.throws(()=>inspectOnBothSurfaces(syntheticRequest(),{tenantId:'real-tenant',caseId:'demo-case'}),/Synthetic review context/);
});
test('integration does not change the input evidence',()=>{
 const r=syntheticRequest(),before=JSON.stringify(r);
 inspectOnBothSurfaces(r,context);
 assert.equal(JSON.stringify(r),before);
});
