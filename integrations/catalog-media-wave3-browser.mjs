import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
import {root} from './catalog-media-wave3-audit.mjs';
const require=createRequire(import.meta.url);
const {chromium}=process.env.UF_PLAYWRIGHT_MODULE?await import(process.env.UF_PLAYWRIGHT_MODULE):require('playwright');
const target=path.resolve(process.argv[2]||path.join(root,'site'));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer(async(req,res)=>{
 try{const url=new URL(req.url,'http://localhost'),relative=decodeURIComponent(url.pathname),file=path.resolve(target,'.'+relative);if(file!==target&&!file.startsWith(target+path.sep))throw Error('Out of target');const actual=relative==='/'?path.join(target,'index.html'):file;res.setHeader('Content-Type',types[path.extname(actual)]||'application/octet-stream');res.end(await fs.readFile(actual));}catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port+'/',results=[],errors=[],externalImages=[];
const check=async(name,fn)=>{await fn();results.push(name);console.log('PASS '+name);};
const overflow=page=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);
const setup=async context=>{const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.resourceType()==='image'&&r.url().startsWith('https://'))externalImages.push(r.url());});await page.route('https://**/*',r=>r.abort());return page;};
const go=async(page,id='vac-dyson-model-dc19')=>{await page.goto(base);await page.locator('#filterBrand').waitFor();await page.evaluate(id=>location.hash='product/'+id,id);try{await page.locator('#modelPartsQuery').waitFor();}catch(error){console.error('UI diagnostics:',errors,await page.locator('body').innerText());throw error;}};
const shot=async(page,name)=>{await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(root,'integrations/catalog-media-wave3-'+name+'.png'),animations:'disabled'});};
let browser;
try {
 browser=await chromium.launch({headless:true,...(process.env.UF_CHROMIUM_EXECUTABLE?{executablePath:process.env.UF_CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox','--disable-gpu']});
 const context=await browser.newContext({viewport:{width:375,height:812},serviceWorkers:'block'}),page=await setup(context);
 await check('375px licensed photo loads, credit/alt/responsive sizes and stable controls',async()=>{
  await go(page);await page.waitForFunction(()=>document.querySelector('[data-catalog-media-photo]')?.naturalWidth>0);
  assert.match(await page.locator('.media-credit').innerText(),/Alexx.net.*CC0/s);
  const img=page.locator('[data-catalog-media-photo]');assert.match(await img.getAttribute('alt'),/DC19.*Modellreferenz/);assert.match(await img.getAttribute('srcset'),/320w.*640w/);
  assert.equal(await img.getAttribute('loading'),'lazy');assert.equal(await img.getAttribute('decoding'),'async');assert.ok(await overflow(page));
  await shot(page,'mobile-licensed');
 });
 await check('320/375/768/1280px and 200% text do not overflow',async()=>{
  for(const width of [320,375,768,1280]){await page.setViewportSize({width,height:900});assert.ok(await overflow(page),'overflow at '+width);}
  await page.setViewportSize({width:375,height:812});await page.evaluate(()=>document.documentElement.style.fontSize='200%');assert.ok(await overflow(page));await page.evaluate(()=>document.documentElement.style.fontSize='');
 });
 await check('missing model asset restores local vacuum fallback; search remains usable',async()=>{
  await page.route('**/media/catalog-media-wave3-*.jpg',r=>r.fulfill({status:404,body:''}));await go(page);
  await page.waitForFunction(()=>document.querySelector('.product-photo')?.dataset.mediaState==='fallback');
  assert.equal(await page.locator('[data-catalog-media-photo]').count(),0);assert.equal(await page.locator('.product-photo [data-media-fallback]').isVisible(),true);
  await page.locator('#modelPartsQuery').fill('Filter');assert.ok(await page.locator('#modelPartsReset').isEnabled());await shot(page,'mobile-fallback');await page.unroute('**/media/catalog-media-wave3-*.jpg');
 });
 await check('unapproved legacy model/part images are never requested',async()=>{
  await go(page,'vac-bosch-model-bgl75x1prq');await page.locator('[data-model-parts-expand="true"]').click();
  assert.equal(await page.locator('[data-catalog-media-photo]').count(),0);assert.equal(await page.locator('[data-load-photo]').count(),0);
  assert.ok(await page.locator('.part-symbol').count()>0);assert.ok(await overflow(page));
 });
 await check('part image error keeps persistent SVG and working filters (synthetic event)',async()=>{
  await page.evaluate(()=>{const box=document.querySelector('.part-photo'),img=document.createElement('img');img.dataset.catalogMediaPhoto='';box.append(img);img.dispatchEvent(new Event('error'));});
  assert.equal(await page.locator('.part-photo').first().locator('.part-symbol').isVisible(),true);
  await page.locator('#modelPartsQuery').fill('Filter');assert.ok(await page.locator('#modelPartsResults [data-part]').count()>0);await shot(page,'mobile-parts');
 });
 await check('on-demand keyboard photo load does not navigate or bypass review',async()=>{
  await page.goto(base+'#settings');await page.locator('#photoMode').selectOption('on-demand');await go(page);
  assert.equal(await page.locator('[data-catalog-media-photo]').count(),0);const hash=await page.evaluate(()=>location.hash);
  const button=page.locator('[data-load-photo]');await button.focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.querySelector('[data-catalog-media-photo]')?.naturalWidth>0);assert.equal(await page.evaluate(()=>location.hash),hash);
 });
 await check('successful part image load hides SVG; error restores it (synthetic lifecycle)',async()=>{
  await go(page,'vac-bosch-model-bgl75x1prq');await page.locator('[data-model-parts-expand="true"]').click();
  const state=await page.evaluate(()=>{const box=document.querySelector('.part-photo'),img=document.createElement('img');img.dataset.catalogMediaPhoto='';box.append(img);img.dispatchEvent(new Event('load'));const hidden=box.querySelector('[data-media-fallback]').hidden;img.dispatchEvent(new Event('error'));return {hidden,restored:!box.querySelector('[data-media-fallback]').hidden};});assert.deepEqual(state,{hidden:true,restored:true});
 });
 await context.close();
 await check('warm PWA offline reload has usable model/filters and SVG; media not cached',async()=>{
  const offline=await browser.newContext({viewport:{width:375,height:812},serviceWorkers:'allow'}),p=await setup(offline);
  await p.goto(base);await p.waitForFunction(()=>!!navigator.serviceWorker.controller);await go(p);
  await p.waitForFunction(async()=>!!await caches.match(new URL('./catalog-dyson-v1.29.0.js',location.href)));
  assert.equal(await p.evaluate(async()=>{for(const n of await caches.keys()){const c=await caches.open(n);if((await c.keys()).some(r=>r.url.includes('/media/')))return true;}return false;}),false);
  await offline.setOffline(true);await p.reload();await p.locator('#modelPartsQuery').waitFor();await p.waitForFunction(()=>document.querySelector('.product-photo')?.dataset.mediaState==='fallback');
  assert.equal(await p.locator('.product-photo [data-media-fallback]').isVisible(),true);await p.locator('#modelPartsQuery').fill('Filter');assert.ok(await p.locator('#modelPartsReset').isEnabled());await offline.close();
 });
 assert.deepEqual(errors,[]);assert.deepEqual(externalImages,[]);
 const report={schemaVersion:1,checkedAt:new Date().toISOString(),browser:await browser.version(),checks:results.length,results,pageErrors:errors,externalImageRequests:externalImages,limits:['Chromium emulation; no physical iPhone/VoiceOver test.','Part photo lifecycle uses synthetic events; no real spare image was approved.']};
 await fs.writeFile(path.join(root,'integrations/catalog-media-wave3-browser-evidence.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
