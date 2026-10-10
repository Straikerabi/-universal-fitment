import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createPreviewServer} from '../consumer-repair-mission-poc/serve.mjs';
import {BASE_COMMIT,BRANCH,TARGET,PLAYWRIGHT_VERSION,ENGINES,CASE_IDS,summarize} from './policy.mjs';
import {here,scopeProof,git,suiteFingerprint} from './scope.mjs';
import {loadPlaywright} from './runtime.mjs';
import {browserCases} from './cases.mjs';
import {verifyServedSource} from './verify-source.mjs';
const startedAt=new Date().toISOString(),output=path.join(here,'artifacts/latest');
await mkdir(output,{recursive:true});
const report={schema:'uf.consumer-browser-gate/1',baseCommit:BASE_COMMIT,branch:BRANCH,target:TARGET,
 testedCommit:git('rev-parse','HEAD'),workingTreeHadUncommittedQaFiles:git('status','--porcelain')!=='',
 startedAt,playwrightVersion:null,scopeProof:null,suiteProof:suiteFingerprint(),
 engines:{},cases:[],physicalIPhone:false,macOSSafari:false,externalTestPeople:0,
 humanConversionRate:null,humanAbandonmentRate:null,environment:{platform:process.platform,node:process.version},
 simulation:'Linux Playwright WebKit is NOT iOS Safari or a physical iPhone. Viewport/touch/OS-offline-signal simulation only.'};
const requested=(process.env.UF_QA_ENGINES||ENGINES.join(',')).split(',');
assert.ok(requested.every(e=>ENGINES.includes(e))&&new Set(requested).size===requested.length,'Unsupported engine selection');
const selectedCase=process.env.UF_QA_CASE||null;
assert.ok(!selectedCase||CASE_IDS.includes(selectedCase),'Unsupported diagnostic case');
const scrub=value=>String(value).replace(/\u001b\[[0-9;]*m/g,'').slice(0,12000);
let server,browsers={},playwright,startupError;
try{
 report.scopeProof=scopeProof();
 try{
  const runtime=await loadPlaywright();playwright=runtime.playwright;report.playwrightVersion=runtime.version;
 }catch(error){startupError=error;}
 server=createPreviewServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port+'/';
 report.servedSourceProof=await verifyServedSource(base);
 const definitions=browserCases();
 for(const engine of ENGINES){
  if(!requested.includes(engine)){
   report.engines[engine]={started:false,reason:'Diagnostic engine selection; complete gate is not eligible'};
  }else try{
   if(startupError)throw startupError;
   const executablePath=process.env[engine==='chromium'?'UF_CHROMIUM_EXECUTABLE':'UF_WEBKIT_EXECUTABLE'];
   const options={headless:true,...(executablePath?{executablePath}:{}),timeout:30000};
   if(engine==='chromium')options.args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'];
   browsers[engine]=await playwright[engine].launch(options);
   report.engines[engine]={started:true,version:browsers[engine].version(),
    binary:executablePath?'explicit-local-override':'pinned-Playwright-bundle',
    simulation:true,physicalIPhone:false,macOSSafari:false};
  }catch(error){report.engines[engine]={started:false,version:null,reason:scrub(error.message)};}
  for(const definition of definitions){
   const row={engine,id:definition.id,automated:true,realHumanTest:false,status:'blocked',elapsedMs:null,
    runtimeErrors:[],externalRequests:[],requestFailures:[],screenshots:[],artifacts:[]};
   report.cases.push(row);
   if(!browsers[engine]||selectedCase&&selectedCase!==definition.id){
    row.reason=report.engines[engine].reason||'Diagnostic case selection; not executed';continue;
   }
   const timer=performance.now();let context,page;
   try{
    context=await browsers[engine].newContext({viewport:definition.viewport||{width:375,height:812},
     isMobile:true,hasTouch:true,deviceScaleFactor:1,acceptDownloads:true,
     serviceWorkers:definition.serviceWorkers||'block',colorScheme:'light',reducedMotion:'reduce'});
    context.on('request',request=>{
     const url=new URL(request.url());
     if(['http:','https:'].includes(url.protocol)&&url.origin!==new URL(base).origin)row.externalRequests.push(request.url());
    });
    context.on('requestfailed',request=>row.requestFailures.push({url:request.url().replace(base,'LOCAL/'),reason:request.failure()?.errorText}));
    // Route denial is preventive; attempted external requests still fail the report.
    await context.route('**/*',route=>{
     const url=new URL(route.request().url());
     if(['http:','https:'].includes(url.protocol)&&url.origin!==new URL(base).origin)return route.abort();
     return route.continue();
    });
    page=await context.newPage();page.setDefaultTimeout(12000);page.setDefaultNavigationTimeout(12000);
    page.on('pageerror',error=>row.runtimeErrors.push(scrub(error.message)));
    const shot=async suffix=>{
     assert.ok(/^[a-z0-9-]+$/.test(suffix));
     // Do not capture a future app that introduces copyrighted raster/OEM imagery.
     if(await page.locator('img,svg image').count()){row.artifacts.push('Screenshot refused: image element present');return;}
     const file=engine+'-'+definition.id+'-'+suffix+'.png';
     await page.screenshot({path:path.join(output,file),fullPage:true,animations:'disabled'});row.screenshots.push(file);
    };
    const textArtifact=async(name,value)=>{
     assert.ok(/^[a-z0-9.-]+$/.test(name));const file=engine+'-'+definition.id+'-'+name;
     await writeFile(path.join(output,file),value+'\n');row.artifacts.push(file);
    };
    row.phases=[];
    const phase=async(name,run)=>{
     const item={name,status:'running'};row.phases.push(item);
     try{const result=await run();item.status='passed';return result;}
     catch(error){
      item.status='failed';item.reason=scrub(error.message);
      item.state=await page.evaluate(async()=>({
       url:location.pathname,secure:isSecureContext,online:navigator.onLine,
       controller:navigator.serviceWorker?.controller?.scriptURL??null,
       registrationLog:window.__ufQaOffline??null,
       status:document.querySelector('#connectionStatus')?.textContent,
       feedback:document.querySelector('#feedback')?.textContent,
       caches:await caches.keys(),registrations:await navigator.serviceWorker.getRegistrations().then(rs=>rs.map(r=>({scope:r.scope,active:r.active?.state,installing:r.installing?.state,waiting:r.waiting?.state})))
      })).catch(e=>({diagnosticError:String(e)}));
      await textArtifact('offline-phases.json',JSON.stringify(row.phases,null,2));
      throw Error('Offline phase '+name+': '+item.reason+' STATE '+JSON.stringify(item.state));
     }
    };
    row.measurements=await definition.run({context,page,base,shot,textArtifact,phase});
    assert.deepEqual(row.externalRequests,[],'External network attempted');assert.deepEqual(row.runtimeErrors,[],'Browser runtime errors');
    row.status='passed';console.log('PASS '+engine+' '+definition.id);
    if(definition.id==='warm-offline')console.log('OFFLINE-PROOF '+JSON.stringify({engine,phases:row.phases,measurements:row.measurements}));
   }catch(error){
    row.status='failed';row.reason=scrub(error.message);
    console.error('FAIL '+engine+' '+definition.id+': '+row.reason.slice(0,500));
    if(page)try{
     if(!await page.locator('img,svg image').count()){
      const file=engine+'-'+definition.id+'-failure.png';await page.screenshot({path:path.join(output,file),fullPage:true,animations:'disabled'});row.screenshots.push(file);
     }
    }catch{}
   }finally{
    row.elapsedMs=Math.round(performance.now()-timer);if(context)await context.close().catch(()=>{});
   }
  }
 }
}catch(error){report.fatalError=scrub(error.message);}
finally{
 for(const browser of Object.values(browsers))await browser.close().catch(()=>{});
 if(server)await new Promise(resolve=>server.close(resolve));
 try{const after=scopeProof();report.scopeProof={...report.scopeProof,afterUnchanged:true,
  afterProtectedTreeEntriesSha256:after.protectedTreeEntriesSha256,afterSourceBytesDigest:after.sourceBytesDigest};}
 catch(error){report.scopeProof={...report.scopeProof,afterUnchanged:false};report.scopeError=scrub(error.message);}
 report.suiteProof.afterDigest=suiteFingerprint().digest;
 report.finishedAt=new Date().toISOString();report.gate=summarize(report);
 console.log('SOURCE-PROOF '+JSON.stringify({testedCommit:report.testedCommit,suiteProof:report.suiteProof,
  protectedFiles:report.scopeProof?.protectedFiles,ownerDelta:report.scopeProof?.authorizedDelta,
  sourceBytesDigest:report.scopeProof?.sourceBytesDigest,afterSourceBytesDigest:report.scopeProof?.afterSourceBytesDigest,
  servedSourceProof:report.servedSourceProof}));
 await writeFile(path.join(output,'results.json'),JSON.stringify(report,null,2)+'\n');
 console.log('REPORT-PROOF '+JSON.stringify(report));
 console.log(JSON.stringify(report.gate));process.exitCode=report.gate.automatedGatePassed?0:1;
}
