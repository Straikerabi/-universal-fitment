import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeWave4,loadRealReviewRecords,reviewReport} from './review.mjs';
import {validateRequest,validateResponse,assessFitment} from '../fitment-engine-v1-poc/contract.mjs';

const files={
 cases:JSON.parse(readFileSync(new URL('../verified-repair-cases-wave4/cases.json',import.meta.url))),
 sources:JSON.parse(readFileSync(new URL('../verified-repair-cases-wave4/sources.json',import.meta.url))),
 observations:JSON.parse(readFileSync(new URL('../verified-repair-cases-wave4/observations.json',import.meta.url)))
};
const copy = () => structuredClone(files);
test('all ten genuine research cases generate eighteen schema-valid unconfirmed shared-v1 decisions',()=>{
 const rows=loadRealReviewRecords();
 assert.equal(rows.length,18);
 assert.equal(new Set(rows.map(x=>x.report.caseId)).size,10);
 for(const r of rows){
  assert.deepEqual(validateRequest(r.request),[]);
  assert.deepEqual(validateResponse(r.response),[]);
  assert.equal(r.request.datasetKind,'catalog');
  assert.equal(r.response.status,'unconfirmed');
  assert.equal(r.response.testOnly,false);
  assert.equal(r.response.canConfirmFitment,false);
  assert.equal(r.response.canConfirmPurchase,false);
  assert.equal(r.report.installationApproved,false);
  assert.equal(r.report.engine.status,r.response.status);
  assert.ok(r.report.sourceUrls.every(url=>url.startsWith('https://')));
  assert.ok(r.report.gaps.some(g=>g.code==='RIGHTS_UNCLEARED'));
  assert.ok(r.request.sources.every(s=>s.status==='unverified'&&s.rights.reuse==='unknown'));
 }
});
test('keeps leading zeros and exact regional/model identifiers',()=>{
 const rows=loadRealReviewRecords();
 const s=rows.find(r=>r.report.caseId==='siemens-vs06');
 assert.equal(s.request.part.identifiers[0].value,'00027606');
 assert.equal(s.request.variant.identifiers[0].value,'VS06A110/03');
 const samsung=rows.find(r=>r.report.caseId==='samsung-ultra');
 assert.equal(samsung.request.variant.identifiers[0].value,'VS90F40EEK/WD');
 assert.equal(samsung.request.variant.market,'DE');
 const bosch=rows.find(r=>r.report.caseId==='bosch-bgl75');
 assert.ok(bosch.report.gaps.some(g=>g.code==='BSH_E_NR_INDEX_MISSING'));
});
test('Dyson battery exclusion is recorded as conditional, not a blanket false-negative',()=>{
 const rows=loadRealReviewRecords();
 const v8=rows.find(r=>r.report.caseId==='dyson-v8'&&r.report.assembly==='battery');
 assert.match(v8.report.conditionalExclusions[0].when,/YH5/);
 assert.equal(v8.response.status,'unconfirmed');
 assert.ok(v8.report.gaps.some(g=>g.code==='ELECTRICAL_VARIANT_CHECK'));
 const v11=rows.find(r=>r.report.caseId==='dyson-v11'&&r.report.assembly==='battery');
 assert.ok(v11.report.conditionalExclusions.length===1);
});
test('unknown revision, serial and connector are never silently upgraded to any or matching',()=>{
 for(const r of loadRealReviewRecords()){
  assert.equal(r.request.variant.serial,null);
  assert.equal(r.request.variant.revision,null);
  assert.equal(r.request.evidence[0].variant.serial.mode,'unknown');
  assert.equal(r.request.evidence[0].variant.revision.mode,'unknown');
  assert.deepEqual(r.request.interfaces.reviewSourceIds,[]);
  assert.deepEqual(r.request.interfaces.requirements,[]);
 }
});
test('tampered listing without exact code is rejected before core assessment',()=>{
 const x=copy();x.observations.find(o=>o.id==='boost-list').observed.articles=
   x.observations.find(o=>o.id==='boost-list').observed.articles.filter(code=>code!=='11639210');
 assert.throws(()=>normalizeWave4(x),/Part not in device listing/);
});
test('missing/renamed sources, rights status and scope pollution fail closed',()=>{
 for(const mutation of [
   x=>{x.sources.sources=x.sources.sources.filter(s=>s.id!=='miele-boost');},
   x=>{x.sources.sources.find(s=>s.id==='miele-boost').reusePermission='granted';},
   x=>{x.cases.cases[0].edges[0].scope='12031660';},
   x=>{x.cases.cases[0].edges[0].release='compatible';},
   x=>{x.cases.cases[0].observedDevice.revision='A';}
 ]){const x=copy();mutation(x);assert.throws(()=>normalizeWave4(x));}
});
test('changing a real normalized request into apparent positive still lacks permission/verified installation review',()=>{
 const real=loadRealReviewRecords()[0].request;
 const mutated=structuredClone(real);
 mutated.evidence[0].variant.revision={mode:'any',value:null};
 mutated.evidence[0].variant.serial={mode:'any',min:null,max:null};
 mutated.variant.revision='A';
 const r=assessFitment(mutated);
 assert.equal(r.status,'unconfirmed');assert.equal(r.canConfirmFitment,false);
});
test('review report is deterministic, sortable and does not claim solved fits',()=>{
 const a=reviewReport(),b=reviewReport();
 assert.deepEqual(a,b);
 assert.equal(a.counts.researchCases,10);
 assert.equal(a.counts.manufacturerListedPartAssociations,18);
 assert.equal(a.counts.positivelyInstallationApproved,0);
 assert.equal(a.counts.needsManualReview,18);
 assert.ok(a.rows.every((r,i)=>i===0||r.gaps.length>=a.rows[i-1].gaps.length));
 assert.ok(a.rows.some(r=>r.conditionalExclusions.length));
});
