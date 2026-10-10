import test from 'node:test';
import assert from 'node:assert/strict';
import {BASE_COMMIT,PLAYWRIGHT_VERSION,ENGINES,CASE_IDS,summarize,allowedPath} from '../policy.mjs';
const good=()=>({schema:'uf.consumer-browser-gate/1',baseCommit:BASE_COMMIT,playwrightVersion:PLAYWRIGHT_VERSION,
 scopeProof:{unchanged:true,afterUnchanged:true,protectedFiles:1,protectedTreeEntriesSha256:'0'.repeat(64),afterProtectedTreeEntriesSha256:'0'.repeat(64)},physicalIPhone:false,macOSSafari:false,externalTestPeople:0,
 suiteProof:{digest:'0'.repeat(64),afterDigest:'0'.repeat(64)},
 engines:Object.fromEntries(ENGINES.map(e=>[e,{started:true,version:'SYNTHETIC-TEST-VERSION'}])),
 cases:ENGINES.flatMap(engine=>CASE_IDS.map(id=>({engine,id,status:'passed',elapsedMs:1,
  automated:true,realHumanTest:false,externalRequests:[],runtimeErrors:[]})))});
test('complete synthetic reporter fixture can satisfy automation, never beta/launch approval',()=>{
 const r=summarize(good());assert.equal(r.automatedGatePassed,true);assert.equal(r.betaOrLaunchApproved,false);
 assert.equal(r.counts.planned,66);
});
test('empty or malformed evidence never passes',()=>{for(const r of [null,{}, {...good(),cases:[]}])assert.equal(summarize(r).automatedGatePassed,false);});
test('missing browser or missing exact case blocks the complete gate',()=>{
 const r=good();r.engines.webkit.started=false;assert.equal(summarize(r).automatedGatePassed,false);
 const s=good();s.cases.pop();assert.equal(summarize(s).automatedGatePassed,false);
});
test('duplicate case cannot substitute for a missing case',()=>{const r=good();r.cases[1]=r.cases[0];assert.equal(summarize(r).automatedGatePassed,false);});
test('failed, blocked, skipped and unknown statuses remain non-passing',()=>{
 for(const status of ['failed','blocked','skipped','unknown']){const r=good();r.cases[0].status=status;assert.equal(summarize(r).automatedGatePassed,false);}
});
test('external network attempts and runtime errors are blocking even if assertions passed',()=>{
 for(const field of ['externalRequests','runtimeErrors']){const r=good();r.cases[0][field]=['SYNTHETIC-REPORTER-ERROR'];assert.equal(summarize(r).automatedGatePassed,false);}
});
test('wrong base, missing scope evidence and unpinned framework block the gate',()=>{
 for(const patch of [{baseCommit:'old'},{scopeProof:{unchanged:true}},{playwrightVersion:'latest'}])assert.equal(summarize({...good(),...patch}).automatedGatePassed,false);
});
test('unmeasured success and unsupported human/hardware claims are rejected',()=>{
 const r=good();r.cases[0].elapsedMs=null;assert.equal(summarize(r).automatedGatePassed,false);
 for(const patch of [{physicalIPhone:true},{macOSSafari:true},{externalTestPeople:1}])assert.equal(summarize({...good(),...patch}).automatedGatePassed,false);
});
test('scope allows only new suite and the one named workflow',()=>{
 assert.equal(allowedPath('integrations/consumer-webkit-qa-wave6/run.mjs'),true);
 assert.equal(allowedPath('.github/workflows/consumer-webkit-qa-wave6.yml'),true);
 for(const p of ['main','integrations/consumer-repair-mission-poc/app.mjs','integrations/fitment-engine-v1-poc/contract.mjs','.github/workflows/pages.yml'])assert.equal(allowedPath(p),false);
});
test('missing or divergent byte-proof digest and late fatal errors cannot pass',()=>{
 const r=good();r.scopeProof.afterProtectedTreeEntriesSha256='1'.repeat(64);assert.equal(summarize(r).automatedGatePassed,false);
 const s=good();s.fatalError='SYNTHETIC-REPORTER-FAILURE';assert.equal(summarize(s).automatedGatePassed,false);
 const t=good();t.suiteProof.afterDigest='1'.repeat(64);assert.equal(summarize(t).automatedGatePassed,false);
});
