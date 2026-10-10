// Diagnostic ONLY: prove the baseline bug and evaluate one temporary CSS property.
// No product file, catalog or persisted app state is edited.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createPreviewServer} from '../consumer-repair-mission-poc/serve.mjs';
import {loadPlaywright} from './runtime.mjs';
import {here,scopeProof} from './scope.mjs';
const protectedBefore=scopeProof();
const {playwright}=await loadPlaywright(),server=createPreviewServer();
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const options={headless:true,args:['--no-sandbox','--disable-dev-shm-usage'],
 ...(process.env.UF_CHROMIUM_EXECUTABLE?{executablePath:process.env.UF_CHROMIUM_EXECUTABLE}:{})};
let browser;
try{
 browser=await playwright.chromium.launch(options);
 const page=await browser.newPage({viewport:{width:375,height:812},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 const base='http://127.0.0.1:'+server.address().port+'/';const externalRequests=[];
 await page.route('**/*',route=>{if(new URL(route.request().url()).origin!==new URL(base).origin){externalRequests.push(route.request().url());return route.abort();}return route.continue();});
 await page.goto(base);await page.locator('#deviceQuery').waitFor();
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 const measure=()=>page.locator('.search-row label').first().evaluate(e=>({
  labelClientWidth:e.clientWidth,labelScrollWidth:e.scrollWidth,text:e.textContent.trim(),
  fontSize:getComputedStyle(e.querySelector('.field-label')).fontSize,
  fontFamily:getComputedStyle(e.querySelector('.field-label')).fontFamily,
  fontWeight:getComputedStyle(e.querySelector('.field-label')).fontWeight,
  overflowWrap:getComputedStyle(e.querySelector('.field-label')).overflowWrap
 }));
 const before=await measure();assert.ok(before.labelScrollWidth>before.labelClientWidth+2,'Baseline bug not reproduced on this browser/font environment');
 await page.locator('.search-row .field-label').first().evaluate(e=>e.style.overflowWrap='anywhere');
 const proposalOnly=await measure();assert.ok(proposalOnly.labelScrollWidth<=proposalOnly.labelClientWidth+2);
 assert.deepEqual(externalRequests,[]);
 const after=scopeProof();assert.equal(after.protectedTreeEntriesSha256,protectedBefore.protectedTreeEntriesSha256);
 const report={issue:75,bug:'W6-B1',checkedAt:new Date().toISOString(),engine:'chromium',version:browser.version(),
  viewport:{width:375,height:812},cssRootFontPercent:200,before,proposalOnly,
  temporaryBrowserStyleOnly:true,productFilesChanged:false,externalRequests,physicalIPhone:false,
  proposedRule:'.search-row .field-label { overflow-wrap: anywhere; }',protectedFiles:after.protectedFiles};
 await mkdir(path.join(here,'artifacts/latest'),{recursive:true});
 await writeFile(path.join(here,'artifacts/latest/label-proposal.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
