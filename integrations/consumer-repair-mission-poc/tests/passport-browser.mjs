// Real mobile browser check: newly exported JSON is not a compatibility certificate.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createPreviewServer} from '../serve.mjs';
import {verifyRepairPassportJson} from '../mission-state.mjs';
import {catalogSnapshot} from '../catalog-snapshot.mjs';

const chromiumModule=process.env.UF_PLAYWRIGHT_MODULE;
if(!chromiumModule)throw Error('UF_PLAYWRIGHT_MODULE must point to the pinned Playwright package');
const {chromium}=await import(chromiumModule);
const server=createPreviewServer();
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 for(const width of [320,375,390,430]){
  const context=await browser.newContext({viewport:{width,height:812},isMobile:true,hasTouch:true,
   acceptDownloads:true,serviceWorkers:'block'});
  try{
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:'+server.address().port+'/');
   await page.locator('[data-device="'+catalogSnapshot.devices[0].id+'"]').click();
   await page.locator('main [data-step="2"]').click();
   await page.locator('main [data-step="3"]').click();
   const filter=page.locator('[data-group="filter"]');
   if(!await filter.evaluate(e=>e.open))await filter.locator(':scope > summary').click();
   await page.locator('[data-assembly="filter"]').click();
   await page.locator('main [data-step="4"]').click();
   await page.locator('main [data-step="5"]').click();
   await page.locator('#downloadPassport').waitFor();
   const downloadPromise=page.waitForEvent('download');
   await page.locator('#downloadPassport').click();
   const download=await downloadPromise;
   assert.equal(download.suggestedFilename(),'Universal-Fitment-Pruefpass.json');
   const json=await readFile(await download.path(),'utf8');
   const passport=JSON.parse(json);
   assert.equal(passport.payload.recordType,'real-catalog-research');
   assert.equal(passport.payload.verdict.status,'unconfirmed');
   assert.equal(passport.payload.verdict.realInstallationApproved,false);
   assert.equal(passport.payload.verdict.purchaseAllowed,false);
   assert.equal(await verifyRepairPassportJson(json),true);
   assert.deepEqual(errors,[]);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow at '+width);
   console.log('PASS actual Chromium passport download '+width+'px');
  }finally{await context.close();}
 }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
