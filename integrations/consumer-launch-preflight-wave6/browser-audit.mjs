// Optional loopback Chromium diagnostics, no images, personal data or files written.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createPreviewServer} from '../consumer-repair-mission-poc/serve.mjs';
import {cacheName,assetPaths} from '../consumer-repair-mission-poc/offline-config.mjs';

const require=createRequire(import.meta.url);
const {chromium}=process.env.UF_PLAYWRIGHT_MODULE?await import(process.env.UF_PLAYWRIGHT_MODULE):require('playwright');
const server=createPreviewServer();
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
let browser;
const observations=[],external=[],errors=[];
try {
 browser=await chromium.launch({headless:true,...(process.env.UF_CHROMIUM?{executablePath:process.env.UF_CHROMIUM}:{}),args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:375,height:812}});
 await context.route('**/*',route=>{
  if(new URL(route.request().url()).origin!==origin){external.push('external request blocked');return route.abort();}
  return route.continue();
 });
 const page=await context.newPage();
 page.on('pageerror',()=>errors.push('runtime error (contents redacted)'));
 await page.goto(origin);
 await page.locator('#deviceQuery').waitFor();
 await page.locator('#demoMode').click();
 await page.locator('[data-scenario="filter-positive"]').click();
 for(const width of [320,375,430]){
  await page.setViewportSize({width,height:812});
  for(let step=1;step<=5;step++){
   if(step===1)await page.locator('#progress [data-step="1"]').click();
   else await page.locator(`main [data-step="${step}"]`).click();
   if(step===2)await page.locator('input[value=known]').check();
   if(step===3)await page.locator('[data-assembly=filter]').click();
   const legal=await page.locator('a').evaluateAll(nodes=>nodes.filter(n=>/impressum|datenschutz|privacy/i.test(n.textContent+' '+n.getAttribute('href'))).length);
   assert.equal(legal,0,'Baseline changed: legal links require fresh review, not automatic PASS');
   assert.equal(await page.locator('#eraseMission').isVisible(),true);
   assert.equal(await page.locator('#eraseOffline').isVisible(),true);
   const size=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
   assert.ok(size.scroll<=size.width+1,'horizontal overflow');
   observations.push({check:'legal-navigation',viewport:width,step,status:'BLOCKED',legalLinks:0,localEraseButtonsVisible:true});
  }
 }
 await page.waitForFunction(async({cacheName,count})=>{
  if(!navigator.serviceWorker.controller||!await caches.has(cacheName))return false;
  return (await (await caches.open(cacheName)).keys()).length===count;
 },{cacheName,count:assetPaths.length});
 await context.setOffline(true);
 await page.reload();
 await page.locator('#workspace .stage').waitFor();
 assert.match(await page.locator('#modeNotice').innerText(),/SYNTHETISCHE DEMO/);
 assert.equal(await page.locator('a').evaluateAll(nodes=>nodes.filter(n=>/impressum|datenschutz|privacy/i.test(n.textContent+' '+n.getAttribute('href'))).length),0);
 observations.push({check:'warm-offline-reload',status:'PASS',legalNavigation:'BLOCKED'});
 await context.setOffline(false);
 // Sentinel is synthetic and contains no user data. Verify exact deletion boundary.
 await page.evaluate(()=>localStorage.setItem('uf-repair-mission-poc-v1-real','{"syntheticSentinel":true}'));
 await page.locator('#eraseMission').click();
 assert.equal(await page.evaluate(()=>localStorage.getItem('uf-repair-mission-poc-v1-synthetic')),null);
 assert.notEqual(await page.evaluate(()=>localStorage.getItem('uf-repair-mission-poc-v1-real')),null);
 observations.push({check:'local-erase-boundary',status:'PASS',otherModeRetained:true,fullErasureApproved:false});
 await page.locator('#eraseOffline').click();
 await page.waitForFunction(async name=>!await caches.has(name),cacheName);
 assert.notEqual(await page.evaluate(()=>localStorage.getItem('uf-repair-mission-poc-v1-real')),null);
 observations.push({check:'offline-erase-boundary',status:'PASS',missionRetained:true,fullErasureApproved:false});
 assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
 console.log(JSON.stringify({sourceBase:'456c8b8936617f5275d8d1ccfc29601d559cac89',engine:'Chromium',version:browser.version(),assertedScenarios:observations.length,externalRequests:0,personalData:0,physicalIPhone:false,safari:false,productionHostingTested:false,launchApproved:false,overall:'BLOCKED',observations},null,2));
 await context.close();
} finally {
 if(browser)await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
