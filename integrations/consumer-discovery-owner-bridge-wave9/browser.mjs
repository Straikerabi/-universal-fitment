// Real combined Consumer flow. Test inputs are synthetic where explicitly labelled.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {createPreviewServer} from '../consumer-repair-mission-poc/serve.mjs';
import {loadPlaywright} from '../consumer-webkit-qa-wave6/runtime.mjs';
import {catalogSnapshot} from '../consumer-repair-mission-poc/catalog-snapshot.mjs';
import {scopeProof,root,own} from './scope.mjs';
const dir=path.join(root,own,'artifacts');await mkdir(dir,{recursive:true});
const proof=scopeProof();const {playwright}=await loadPlaywright();const server=createPreviewServer();
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const report={schema:'uf.discovery-bridge-browser/1',testedCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),startedAt:new Date().toISOString(),physicalIPhone:false,humanPilot:false,launchApproved:false,cases:[],errors:[]};
async function reflow(page){const m=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('main button,main label,main summary,main dd,main p,main a')].filter(e=>{const r=e.getBoundingClientRect();return e.checkVisibility()&&r.width>0&&(r.left< -1||r.right>innerWidth+1||e.scrollWidth>e.clientWidth+2);}).map(e=>({tag:e.tagName,id:e.id,className:e.className,client:e.clientWidth,scroll:e.scrollWidth}))}));assert.ok(m.scroll<=m.width+1,JSON.stringify(m));assert.deepEqual(m.overflow,[],JSON.stringify(m));return m;}
try{
 for(const engine of ['chromium','webkit']){
  const browser=await playwright[engine].launch({headless:true,...(engine==='chromium'?{args:['--no-sandbox','--disable-dev-shm-usage']}:{})});
  try{
   for(const width of [320,375,390,430])for(const font of [100,200])for(const colorScheme of ['light','dark']){
    const id=`${engine}-${width}-${font}-${colorScheme}`;const row={id,status:'failed',browserVersion:browser.version(),syntheticNegativeInput:true};report.cases.push(row);
    const context=await browser.newContext({viewport:{width,height:812},isMobile:true,hasTouch:true,colorScheme,serviceWorkers:'block',reducedMotion:'reduce'});const external=[],errors=[];
    context.on('request',r=>{if(/^https?:/.test(r.url())&&new URL(r.url()).origin!==base)external.push(r.url());});
    await context.route('**/*',route=>/^https?:/.test(route.request().url())&&new URL(route.request().url()).origin!==base?route.abort():route.continue());
    const page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));
    try{
     await page.goto(base);await page.locator('#deviceQuery').waitFor();await page.evaluate(f=>document.documentElement.style.fontSize=f+'%',font);
     assert.match(await page.locator('.catalog-note').first().innerText(),/11 Pilotgeräte.*5 Marken/);
     await page.locator('#deviceQuery').fill('VS20C95D4TK/WA');assert.equal(await page.locator('[data-device]').count(),0);assert.match(await page.locator('#deviceResults').innerText(),/nicht erfasst/);
     await page.locator('#resetDeviceFilters').click();assert.equal(await page.locator('#deviceQuery').evaluate(e=>e===document.activeElement),true);
     await page.locator('#brandFilter').selectOption('Samsung');await page.locator('#deviceTypeFilter').selectOption('bagged');assert.equal(await page.locator('[data-device]').count(),0);
     await page.locator('#resetDeviceFilters').click();await page.locator('#deviceSort').selectOption('brand');
     const d=catalogSnapshot.devices[0];await page.locator('#deviceQuery').fill(d.reference);await page.locator(`[data-device="${d.id}"]`).click();
     assert.match(await page.locator('#deviceProfile').innerText(),/nicht unabhängig verifiziert/);assert.match(await page.locator('#deviceProfile').innerText(),/nicht im integrierten Snapshot dokumentiert/);
     assert.ok((await page.locator('#deviceProfile').innerText()).includes(d.reference));await page.locator('.discovery-candidates > summary').click();row.profileLayout=await reflow(page);
     assert.equal(await page.locator('img,svg image').count(),0);
     row.screenshot=id+'-profile.png';const shot=await page.screenshot({path:path.join(dir,row.screenshot),fullPage:true,animations:'disabled'});
     // Two own-UI previews for direct visual review, in addition to the ZIP.
     if(engine==='chromium'&&width===375&&font===100)console.log('UI-SCREENSHOT-PROOF '+JSON.stringify({filename:row.screenshot,base64:shot.toString('base64')}));
     // Search is local UI state, not an automatic Mission transition.
     await page.locator('#deviceQuery').fill('QA-SYNTHETIC-UNKNOWN');assert.equal(await page.locator('[data-device]').count(),0);
     assert.ok((await page.locator('#deviceProfile').innerText()).includes(d.reference));
     await page.locator('main [data-step="2"]').click();assert.ok((await page.locator('.device-pass').innerText()).includes(d.reference));
     await page.locator('input[value=known]').check();await page.locator('#observedCode').fill(d.reference);
     await page.locator('main [data-step="3"]').click();await page.locator('[data-assembly=filter]').click();
     await page.locator('main [data-step="4"]').click();assert.equal(await page.locator('.assessment-card').getAttribute('data-status'),'unclear');
     if(await page.locator('[data-part]').count())await page.locator('[data-part]').first().check();
     await page.locator('main [data-step="5"]').click();await page.locator('[data-done]').first().check();row.missionLayout=await reflow(page);
     const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('uf-repair-mission-poc-v1-real')));assert.equal(saved.deviceId,d.id);assert.ok(saved.done.length>0);
     await page.locator('nav [data-step="1"]').click();assert.ok((await page.locator('#deviceProfile').innerText()).includes(d.reference));
     assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('uf-repair-mission-poc-v1-real')).done),saved.done);
     await page.locator('#demoMode').click();assert.equal(await page.locator('#deviceQuery,#deviceProfile').count(),0);assert.match(await page.locator('#modeNotice').innerText(),/SYNTHETISCHE DEMO/);
     await page.locator('#realMode').click();assert.ok((await page.locator('#deviceProfile').innerText()).includes(d.reference));
     assert.deepEqual(external,[]);assert.deepEqual(errors,[]);row.status='passed';console.log('DISCOVERY PASS '+id);
    }catch(e){row.error=String(e.message);report.errors.push(id+': '+row.error);console.error('DISCOVERY FAIL '+id+' '+row.error);}
    finally{await context.close();}
   }
  }finally{await browser.close();}
 }
}finally{
 await new Promise(r=>server.close(r));report.finishedAt=new Date().toISOString();report.scopeUnchanged=JSON.stringify(scopeProof())===JSON.stringify(proof);
 report.expected=32;report.passed=report.cases.filter(c=>c.status==='passed').length;
 await writeFile(path.join(dir,'discovery-results.json'),JSON.stringify(report,null,2)+'\n');console.log('DISCOVERY-REPORT-PROOF '+JSON.stringify(report));
}
assert.equal(report.cases.length,32);assert.equal(report.passed,32,report.errors.join('\n'));assert.ok(report.scopeUnchanged);
