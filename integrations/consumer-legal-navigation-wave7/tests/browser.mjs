import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createServer} from '../serve.mjs';
import {cacheName,assetPaths,fingerprint} from '../offline-config.mjs';
import {policies} from '../deletion.mjs';
import {routes} from '../readiness.mjs';
const require=createRequire(import.meta.url);
const {chromium}=process.env.UF_PLAYWRIGHT_MODULE?await import(process.env.UF_PLAYWRIGHT_MODULE):require('@playwright/test');
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}/`;
let browser;const checks=[],errors=[],external=[];
const check=async(name,run)=>{await run();checks.push(name);console.log('PASS '+name);};
const output=new URL('../qa/',import.meta.url);await mkdir(output,{recursive:true});
try{
 browser=await chromium.launch({headless:true,...(process.env.UF_CHROMIUM?{executablePath:process.env.UF_CHROMIUM}:{}),args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:375,height:812},acceptDownloads:true});
 await context.route('**/*',route=>{if(new URL(route.request().url()).origin!==new URL(base).origin){external.push('redacted external request');return route.abort();}return route.continue();});
 const page=await context.newPage();page.on('pageerror',()=>errors.push('redacted runtime error'));
 await page.goto(base);await page.locator('#steps button').first().waitFor();
 await check('cold preview does not auto-install storage, worker, cache or consent banner',async()=>{
  assert.equal(await page.evaluate(()=>localStorage.length),0);assert.equal(await page.evaluate(async()=> (await navigator.serviceWorker.getRegistrations()).length),0);assert.equal(await page.evaluate(async()=> (await caches.keys()).length),0);assert.equal(await page.locator('[role=dialog]').count(),0);
 });
 for(const width of [320,375,390,430])for(const dark of [false,true]){
  await page.setViewportSize({width,height:900});await page.emulateMedia({colorScheme:dark?'dark':'light'});
  await check(`all four legal targets, keyboard focus and mobile reflow ${width}/${dark?'dark':'light'}`,async()=>{
   for(const route of routes){await page.locator(`#legal-nav a[href="#${route.id}"]`).click();await page.locator('#'+route.id).waitFor({state:'visible'});assert.equal(await page.evaluate(()=>document.activeElement.id),route.id);assert.equal(await page.locator('#legal-nav a[aria-current=page]').count(),1);assert.match(await page.locator('#release-status').innerText(),/BLOCKED/);const size=await page.evaluate(()=>({w:innerWidth,s:document.documentElement.scrollWidth}));assert.ok(size.s<=size.w+1,'horizontal overflow');}
   await page.locator('#legal-nav a[href="#legal-impressum"]').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'legal-impressum');await page.keyboard.press('Tab');assert.notEqual(await page.evaluate(()=>document.activeElement.tagName),'BODY');
  });
  await check(`navigation remains reachable on all five mission steps ${width}/${dark?'dark':'light'}`,async()=>{
   await page.locator('#back-mission').click();await page.waitForFunction(()=>document.activeElement.id==='mission');for(let step=1;step<=5;step++){await page.getByRole('button',{name:new RegExp('^Schritt '+step+':')}).click();for(const route of routes)assert.equal(await page.locator(`#legal-nav a[href="#${route.id}"]`).isVisible(),true);}
  });
 }
 await check('deep link, reload, browser back and unknown hash retain real local destinations',async()=>{
  await page.goto(base+'#legal-datenschutz');assert.equal(await page.locator('#legal-datenschutz').isVisible(),true);await page.reload();assert.equal(await page.locator('#legal-datenschutz').isVisible(),true);await page.locator('#legal-nav a[href="#legal-kontakt"]').click();await page.goBack();assert.equal(await page.locator('#legal-datenschutz').isVisible(),true);await page.goto(base+'#unknown');assert.equal(await page.locator('#mission').isVisible(),true);for(const r of routes)assert.equal(await page.locator('#'+r.id).isVisible(),false);
 });
 await check('operator/privacy missing and three modes never show legal/commercial release',async()=>{
  for(const mode of ['free-readonly','affiliate','b2b-saas']){await page.locator('#mode').selectOption(mode);assert.match(await page.locator('#release-status').innerText(),/BLOCKED/);for(const id of ['legal-impressum','legal-datenschutz','legal-kontakt']){await page.locator(`#legal-nav a[href="#${id}"]`).click();assert.match(await page.locator('#'+id).innerText(),/P0/);}}
  assert.equal(await page.locator('a[href^="mailto:"],form[action],input[type=email]').count(),0);
 });
 await check('200 percent text, dark mode and keyboard confirmation remain accessible',async()=>{
  await page.setViewportSize({width:320,height:900});await page.emulateMedia({colorScheme:'dark'});await page.evaluate(()=>document.documentElement.style.fontSize='200%');await page.locator('#legal-nav a[href="#legal-daten"]').click();await page.locator('#erase-confirm').focus();await page.keyboard.press('Space');assert.equal(await page.locator('#erase-confirm').isChecked(),true);await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'erase-all');const size=await page.evaluate(()=>({w:innerWidth,s:document.documentElement.scrollWidth}));assert.ok(size.s<=size.w+1);await page.evaluate(()=>document.documentElement.style.fontSize='');await page.locator('#erase-confirm').uncheck();
 });
 await check('synthetic mission and downloaded passport stay local and non-authoritative',async()=>{
  await page.locator('#back-mission').click();await page.locator('#variant').fill('DEMO-REV-A');await page.locator('#save-mission').click();assert.match(await page.evaluate(key=>localStorage.getItem(key),policies.preview.keys[1]),/DEMO-REV-A/);const pending=page.waitForEvent('download');await page.locator('#download').click();const download=await pending;const data=JSON.parse(await readFile(await download.path(),'utf8'));assert.equal(data.synthetic,true);assert.equal(data.launchApproved,false);assert.equal(data.fitmentApproved,false);
 });
 await check('explicit offline request creates exactly allowlisted cache and preserves deep-link restart',async()=>{
  await page.locator('#offline-enable').click();await page.waitForFunction(async({name,count})=>navigator.serviceWorker.controller&&await caches.has(name)&&(await (await caches.open(name)).keys()).length===count,{name:cacheName,count:assetPaths.length});await page.waitForFunction(()=>document.querySelector('#offline-status').textContent.includes('vollständig'));await context.setOffline(true);await page.goto(base+'#legal-datenschutz');await page.reload();assert.equal(await page.locator('#legal-datenschutz').isVisible(),true);await page.locator('#legal-nav a[href="#legal-kontakt"]').click();assert.equal(await page.locator('#legal-kontakt').isVisible(),true);await context.setOffline(false);
 });
 await check('confirmation required before any local deletion',async()=>{
  await page.locator('#legal-nav a[href="#legal-daten"]').click();await page.locator('#erase-all').click();assert.notEqual(await page.evaluate(key=>localStorage.getItem(key),policies.preview.keys[1]),null);assert.equal(await page.locator('#erase-status').innerText(),'');
 });
 await check('all-local erasure resets both records and cache, keeps foreign app and another tab from autosaving',async()=>{
  const second=await context.newPage();await second.goto(base);await second.locator('#variant').waitFor();
  await page.evaluate(async({keys,name})=>{localStorage.setItem(keys[0],'{"synthetic":true}');localStorage.setItem('foreign-app','retain');await caches.open('foreign-cache');},{keys:policies.preview.keys,name:cacheName});
  await page.locator('#erase-confirm').check();await page.locator('#erase-all').click();await page.waitForFunction(()=>document.querySelector('#erase-status').textContent.startsWith('Ausgewiesener'));
  for(const key of policies.preview.keys)assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),null);
  assert.equal(await page.evaluate(()=>localStorage.getItem('foreign-app')),'retain');assert.deepEqual(await page.evaluate(()=>caches.keys()),['foreign-cache']);assert.equal(await page.evaluate(async()=> (await navigator.serviceWorker.getRegistrations()).length),0);await second.waitForFunction(()=>document.querySelector('#variant').value==='');assert.match(await page.locator('#erase-status').innerText(),/Downloads und externe Daten bleiben/);await second.close();
  await page.reload();assert.deepEqual(await page.evaluate(()=>caches.keys()),['foreign-cache']);assert.equal(await page.evaluate(async()=> (await navigator.serviceWorker.getRegistrations()).length),0);
 });
 await check('storage failure produces a partial result, not a false erasure confirmation',async()=>{
  await page.evaluate(()=>{Storage.prototype.removeItem=function(){throw Error('synthetic storage failure');};});await page.locator('#legal-nav a[href="#legal-daten"]').click();await page.locator('#erase-confirm').check();await page.locator('#erase-all').click();await page.waitForFunction(()=>document.querySelector('#erase-status').textContent.startsWith('Löschung nur teilweise'));await page.reload();
 });
 await check('no runtime errors or external page requests',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(external,[]);});
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({colorScheme:'light'});await page.locator('#legal-nav a[href="#legal-datenschutz"]').click();await page.screenshot({path:new URL('privacy-390.png',output).pathname,fullPage:true});
 await page.locator('#legal-nav a[href="#legal-daten"]').click();await page.emulateMedia({colorScheme:'dark'});await page.screenshot({path:new URL('erase-dark-390.png',output).pathname,fullPage:true});
 const report={base:'620a4ae8bf49f5c0c212da4acddad249b8b8764b',fingerprint,cacheName,cacheEntries:assetPaths.length,engine:'Chromium',version:browser.version(),viewports:[320,375,390,430],passed:checks.length,checks,externalRequests:external.length,runtimeErrors:errors.length,syntheticOnly:true,launchApproved:false,physicalIPhone:false,productionHostingTested:false};
 await writeFile(new URL('browser-results.json',output),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));await context.close();
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
