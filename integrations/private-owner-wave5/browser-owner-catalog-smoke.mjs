// Separate Owner integration re-run of all existing W6/W7 browser cases.
// DOES NOT bypass or change the original Work-B branch-specific QA gate.
// Actual UI, no mocked source, never a hardware iPhone or release approval.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createPreviewServer} from '../consumer-repair-mission-poc/serve.mjs';
import {browserCases} from '../consumer-webkit-qa-wave6/cases.mjs';
import {verifyServedSource} from '../consumer-webkit-qa-wave6/verify-source.mjs';
import {ENGINES,CASE_IDS} from '../consumer-webkit-qa-wave6/policy.mjs';
import {loadPlaywright} from '../consumer-webkit-qa-wave6/runtime.mjs';
import path from 'node:path';
const dir=path.resolve('integrations/private-owner-wave5/artifacts/owner-integration-browser');
await mkdir(dir,{recursive:true});
const startedAt=new Date().toISOString();
const results={schema:'uf.owner-browser-independent/1',startedAt,
  details:'Independent Owner CI against actual combined Consumer bytes. Work-B #81 sealed branch remains unchanged.',
  physicalIPhone:false,realHumanTest:false,mainMerge:false,launchApproval:false,
  assets:null,browsers:[],cases:[],errors:[],passed:0,failed:0};
const cases=browserCases();assert.deepEqual(cases.map(x=>x.id),CASE_IDS);
assert.equal(cases.length,33);assert.deepEqual(ENGINES,['chromium','webkit']);
const runtime=await loadPlaywright();let server;
try{
 server=createPreviewServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port+'/';
 results.assets=await verifyServedSource(base);assert.equal(results.assets.manifestByteIdentical,true);
 for(const engine of ENGINES){
  const browser=await runtime.playwright[engine].launch({
   headless:true,timeout:30000,
   ...(engine==='chromium'?{args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']}:{})
  });
  results.browsers.push({engine,version:browser.version(),testedAs:'Linux Playwright; not physical iPhone/Safari'});
  try{
   for(const test of cases){
    let context,page;
    const row={engine,id:test.id,status:'failed',error:null,phases:[],externalRequests:[],runtimeErrors:[],snapshots:[]};
    results.cases.push(row);
    try{
     context=await browser.newContext({viewport:test.viewport||{width:375,height:812},
      isMobile:true,hasTouch:true,deviceScaleFactor:1,acceptDownloads:true,
      serviceWorkers:test.serviceWorkers||'block',colorScheme:'light',reducedMotion:'reduce'});
     const root=new URL(base).origin;
     context.on('request',request=>{const u=new URL(request.url());if(['http:','https:'].includes(u.protocol)&&u.origin!==root)row.externalRequests.push(u.hostname);});
     await context.route('**/*',route=>{const u=new URL(route.request().url());return ['http:','https:'].includes(u.protocol)&&u.origin!==root?route.abort():route.continue();});
     page=await context.newPage();page.setDefaultTimeout(12000);page.setDefaultNavigationTimeout(12000);
     page.on('pageerror',e=>row.runtimeErrors.push(String(e.message).slice(0,500)));
     const shot=async suffix=>{
      assert.match(suffix,/^[a-z0-9-]+$/);
      // No screenshots if third-party images ever appear in the UI.
      if(await page.locator('img,svg image').count())return;
      const dest=path.join(dir,engine+'-'+test.id+'-'+suffix+'.png');
      await page.screenshot({path:dest,fullPage:true,animations:'disabled'});
      row.snapshots.push(path.basename(dest));
     };
     const textArtifact=async(name,value)=>{
      assert.match(name,/^[a-z0-9.-]+$/);
      await writeFile(path.join(dir,engine+'-'+test.id+'-'+name),String(value)+'\n');
     };
     const phase=async(name,fn)=>{const stage={name,status:'running'};row.phases.push(stage);
      try{const v=await fn();stage.status='passed';return v;}catch(e){stage.status='failed';stage.reason=String(e.message).slice(0,600);throw Error('Phase '+name+': '+stage.reason);}
     };
     row.measurements=await test.run({context,page,base,shot,textArtifact,phase});
     assert.deepEqual(row.externalRequests,[],'External requests blocked');
     assert.deepEqual(row.runtimeErrors,[],'Browser errors detected');
     row.status='passed';results.passed++;
     console.log('PASS '+engine+'/'+test.id);
    }catch(e){row.error=String(e?.message||e).slice(0,1800);results.failed++;results.errors.push(engine+'/'+test.id+': '+row.error);console.error('FAIL '+engine+'/'+test.id+' '+row.error.slice(0,500));}
    finally{await context?.close().catch(()=>{});}
   }
  }finally{await browser.close();}
 }
}finally{
 if(server)await new Promise(resolve=>server.close(resolve));
 results.finishedAt=new Date().toISOString();
 results.expected=ENGINES.length*CASE_IDS.length;
 results.complete=results.cases.length===results.expected;
 await writeFile(path.join(dir,'results.json'),JSON.stringify(results,null,2)+'\n');
 console.log(JSON.stringify({expected:results.expected,run:results.cases.length,passed:results.passed,failed:results.failed,
  complete:results.complete,noExternalNetwork:results.cases.every(x=>x.externalRequests.length===0),
  physicallyTestedOnIPhone:false,launchApproved:false},null,2));
}
assert.equal(results.expected,66);assert.ok(results.complete);assert.equal(results.failed,0,results.errors.join('\n'));
