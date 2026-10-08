import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';

// Local browser only. No vendor photo, marketplace, Auth or production request.
const require=createRequire(import.meta.url);
const {chromium}=process.env.UF_PLAYWRIGHT_MODULE?await import(process.env.UF_PLAYWRIGHT_MODULE):require('playwright');
const root=fileURLToPath(new URL('../..',import.meta.url));
const site=path.resolve(process.argv[2]||path.join(root,'site'));
const screenshots=fileURLToPath(new URL('./screenshots/',import.meta.url));
await fs.mkdir(screenshots,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json','.json':'application/json'};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  let file=path.resolve(site,'.'+decodeURIComponent(url.pathname));
  if(file!==site&&!file.startsWith(site+path.sep)){res.writeHead(403).end();return;}
  if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));
 }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}/`;
const {products,registerCatalogPack}=await import(pathToFileURL(path.join(site,'src/data/catalog.js')));
const {modelPartsView,sortModelParts}=await import(pathToFileURL(path.join(site,'src/core/model-parts-view.js')));
const {partType}=await import(pathToFileURL(path.join(site,'src/data/part-taxonomy.js')));
let browser;
const results=[],errors=[];
const check=async(name,run)=>{await run();results.push(name);console.log('PASS '+name);};
const setup=async(context)=>{
 const page=await context.newPage();page.setDefaultTimeout(15000);
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('https://**/*',route=>route.abort());return page;
};
const go=async(page,id)=>{await page.goto(base+'#product/'+id);await page.locator('#modelPartsQuery').waitFor();};
const overflow=async(page)=>{
 const state=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('body *')].filter(element=>{const box=element.getBoundingClientRect();return box.width&&(box.right>innerWidth+1||element.scrollWidth>element.clientWidth+1);}).slice(0,45).map(element=>({tag:element.tagName,class:element.className,text:element.textContent.slice(0,90),right:element.getBoundingClientRect().right,scrollWidth:element.scrollWidth,clientWidth:element.clientWidth}))}));
 if(state.scrollWidth>state.width+1){await page.screenshot({path:path.join(screenshots,'overflow-debug.png')});assert.fail('horizontal clipping: '+JSON.stringify(state));}
};
const shot=async(page,name,target)=>{
 await page.locator(target).evaluate(element=>{const topbar=document.querySelector('.topbar').offsetHeight;window.scrollTo(0,window.scrollY+element.getBoundingClientRect().top-topbar-150);});
 await page.screenshot({path:path.join(screenshots,name),animations:'disabled'});
};
try{
 browser=await chromium.launch({headless:true,...(process.env.UF_CHROMIUM_EXECUTABLE?{executablePath:process.env.UF_CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox','--disable-gpu']});
 const context=await browser.newContext({viewport:{width:375,height:812},serviceWorkers:'block',acceptDownloads:true});
 const page=await setup(context);
 const bosch=products.find(product=>product.id==='vac-bosch-model-bgl75x1prq');
 await check('home retains lazy brand loading',async()=>{
  const packs=[];page.on('request',request=>{if(/catalog-.*-v.*\.js/.test(request.url()))packs.push(request.url());});
  await page.goto(base);await page.locator('#filterBrand').waitFor();assert.equal(packs.length,0);
 });
 await check('375px device context, all articles and one category tree',async()=>{
  await go(page,bosch.id);await overflow(page);
  assert.match(await page.locator('.model-device-context').innerText(),/BGL75X1PRQ.*Passung prüfen/s);
  assert.equal(await page.locator('#modelPartsResults [data-part]').count(),bosch.parts.length);
  assert.equal(await page.locator('[data-model-part-group]').count(),new Set(bosch.parts.map(part=>partType(part).id)).size);
  assert.ok(await page.locator('.model-parts-workspace').evaluate(element=>element.previousElementSibling.classList.contains('product-hero')),'parts immediately follow device');
 });
 await check('native accordion keyboard and global sort preserve open states',async()=>{
  const group=page.locator('[data-model-part-group="nozzle"]');const summary=group.locator('summary');
  await summary.focus();await page.keyboard.press('Enter');assert.equal(await group.evaluate(element=>element.open),true);
  await page.keyboard.press('Space');assert.equal(await group.evaluate(element=>element.open),false);await page.keyboard.press('Enter');
  await page.locator('#modelPartsSort').selectOption('recorded-price-desc');assert.equal(await group.evaluate(element=>element.open),true);
  assert.equal(await page.locator('[data-model-part-group="filter"]').evaluate(element=>element.open),false);
  const expected=modelPartsView(bosch,{sort:'recorded-price-desc'}).parts.filter(part=>partType(part).id==='nozzle').map(part=>part.id);
  assert.deepEqual(await group.locator('[data-part]').evaluateAll(elements=>elements.map(element=>element.dataset.part)),expected);
 });
 await check('category sort is independent, numbered naturally and keeps focus',async()=>{
  await page.locator('#modelGroupSort-nozzle').selectOption('part-number');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'modelGroupSort-nozzle');
  const expected=sortModelParts(bosch.parts.filter(part=>partType(part).id==='nozzle'),'part-number').map(part=>part.id);
  assert.deepEqual(await page.locator('[data-model-part-group="nozzle"] [data-part]').evaluateAll(elements=>elements.map(element=>element.dataset.part)),expected);
  assert.equal(await page.locator('#modelPartsSort').inputValue(),'recorded-price-desc');
  await shot(page,'bosch-375-category.png','[data-model-part-group="nozzle"]');
 });
 await check('search, tier/type/status filters, prices and complete reset',async()=>{
  await page.locator('.model-advanced-filters>summary').click();
  await page.locator('#modelPartsQuery').fill('Filter');assert.equal(await page.evaluate(()=>document.activeElement.id),'modelPartsQuery');
  await page.locator('#modelPartsCategory').selectOption('Filter');
  await page.locator('#modelPartsTier').selectOption('oem');await page.locator('#modelPartsFitment').selectOption('variant_check_required');
  await page.locator('#modelPartsMaxPrice').fill('20,00');
  assert.equal(await page.locator('#modelPartsResults [data-part]').count(),modelPartsView(bosch,{query:'Filter',category:'Filter',tier:'oem',fitment:'variant_check_required',maxPrice:'20,00'}).parts.length);
  await page.locator('#modelPartsMinPrice').fill('30');assert.equal(await page.locator('#modelPartsMinPrice').getAttribute('aria-invalid'),'true');assert.match(await page.locator('#modelPartsPriceError').innerText(),/nicht größer/);
  await page.locator('#modelPartsReset').click();assert.equal(await page.locator('#modelPartsMaxPrice').inputValue(),'');assert.equal(await page.locator('#modelPartsFitment').inputValue(),'all');assert.equal(await page.locator('#modelPartsSort').inputValue(),'name');
  assert.equal(await page.locator('#modelPartsResults [data-part]').count(),bosch.parts.length);
  await page.locator('#modelPartsQuery').fill('zzzz-no-result');assert.match(await page.locator('.model-parts-empty').innerText(),/Keine Artikel für diese Filter/);
  await page.locator('[data-model-parts-reset]').click();assert.equal(await page.locator('#modelPartsResults [data-part]').count(),bosch.parts.length);assert.equal(await page.evaluate(()=>document.activeElement.id),'modelPartsQuery');
 });
 await check('photo button does not navigate, part action works with keyboard',async()=>{
  await page.locator('[data-model-parts-expand="true"]').click();
  const photo=page.locator('#modelPartsResults [data-load-photo]').first();
  if(await photo.count()){const hash=await page.evaluate(()=>location.hash);await photo.focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>location.hash),hash);}
  const open=page.locator('#modelPartsResults [data-part-open]').first();await open.focus();await page.keyboard.press('Enter');await page.locator('#partMarketCondition').waitFor();
  assert.match(await page.evaluate(()=>location.hash),/^#part\//);
 });
 await check('cart search notes and saved-device backup remain usable',async()=>{
  await page.locator('[data-save-market-search]').click();await page.locator('#partMarketCondition').waitFor();
  await page.locator('#quickCart').click();await page.locator('.cart-item').waitFor();assert.match(await page.locator('.cart-item').first().innerText(),/Teilenotiz/);
  await go(page,bosch.id);await page.locator('#save').click();
  await page.goto(base+'#backup');await page.locator('#backupExport').waitFor();
  const downloaded=page.waitForEvent('download');await page.locator('#backupExport').click();const download=await downloaded;
  const backup=JSON.parse(await fs.readFile(await download.path(),'utf8'));assert.ok(backup.saved.includes(bosch.id));assert.equal(backup.cart.length,1);
  await page.locator('#backupFile').setInputFiles({name:'roundtrip.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await page.waitForFunction(()=>!document.querySelector('#backupApply').disabled);
  assert.match(await page.locator('#backupReview').innerText(),/Vorschau/);
 });
 await check('unloaded brand shows exact model before hydration',async()=>{
  let release;const delayed=new Promise(resolve=>release=resolve);
  await page.route('**/catalog-samsung-v*.js',async route=>{await delayed;await route.continue();});
  await page.goto(base+'#product/vac-samsung-model-vs20c95d4tk');await page.locator('.model-loading-device').waitFor();
  assert.match(await page.locator('.model-loading-device').innerText(),/VS20C95D4TK\/WD/);assert.equal(await page.locator('.model-parts-empty').count(),0);
  release();await page.locator('#modelPartsQuery').waitFor();await page.unroute('**/catalog-samsung-v*.js');
 });
 await check('loaded Samsung: exact country code, explicit unknown prices, no fake zero',async()=>{
  const {brandPack}=await import(pathToFileURL(path.join(site,'src/data/samsung-pack.js')));registerCatalogPack(brandPack);
  const samsung=products.find(product=>product.id==='vac-samsung-model-vs20c95d4tk');assert.equal(await page.locator('#modelPartsResults [data-part]').count(),samsung.parts.length);
  await page.locator('[data-model-parts-expand="true"]').click();
  assert.match(await page.locator('#modelPartsResults').innerText(),/Preis nicht verfügbar/);assert.doesNotMatch(await page.locator('#modelPartsResults').innerText(),/\b0,00\s*€/);
  await shot(page,'samsung-375-unknown-price.png','[data-model-part-group="filter"]');
  await page.locator('.model-advanced-filters>summary').click();await page.locator('#modelPartsPriceStatus').selectOption('known');assert.match(await page.locator('.model-parts-empty').innerText(),/Keine Artikel für diese Filter/);
 });
 await check('empty loaded model is a missing list, not a filtered miss',async()=>{
  await go(page,'vac-samsung-model-vcc8460h3b');assert.match(await page.locator('.model-parts-empty').innerText(),/Teileliste noch nicht erfasst/);
  assert.match(await page.locator('.model-device-context').innerText(),/VCC8460H3B\/XEG/);await overflow(page);
  await shot(page,'samsung-375-missing-list.png','.model-parts-empty');
 });
 await check('320px, desktop and 200% text have no horizontal clipping',async()=>{
  await go(page,bosch.id);await page.locator('[data-model-parts-expand="true"]').click();
  for(const width of [320,375,768,1280]){await page.setViewportSize({width,height:900});await overflow(page);}
  await page.setViewportSize({width:375,height:812});await page.evaluate(()=>document.documentElement.style.fontSize='200%');await overflow(page);
  await shot(page,'bosch-375-text-200.png','[data-model-part-group="filter"]');await page.evaluate(()=>document.documentElement.style.fontSize='');
 });
 await check('dark mode keeps variant and price warnings',async()=>{
  await go(page,'vac-samsung-model-vs20c95d4tk');await page.locator('#quickTheme').click();await page.locator('[data-model-parts-expand="true"]').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await overflow(page);await shot(page,'samsung-375-dark.png','[data-model-part-group="filter"]');
 });
 await context.close();
 await check('cold brand import failure keeps model context and is retryable',async()=>{
  const context=await browser.newContext({viewport:{width:375,height:812},serviceWorkers:'block'}),page=await setup(context);
  await page.route('**/catalog-hoover-v*.js',route=>route.abort());await page.goto(base+'#product/vac-hoover-model-hf202p011');await page.locator('#retryCatalog').waitFor();
  assert.match(await page.locator('.model-loading-device').innerText(),/39401035/);assert.equal(await page.locator('.model-parts-empty').count(),0);
  await shot(page,'hoover-375-unloaded.png','.model-loading-device');await page.unroute('**/catalog-hoover-v*.js');await page.locator('#retryCatalog').click();await page.locator('#modelPartsQuery').waitFor();assert.equal(await page.locator('#modelPartsResults [data-part]').count(),10);await context.close();
 });
 await check('PWA warm offline navigation, cached brand and cold-brand fallback',async()=>{
  const context=await browser.newContext({viewport:{width:375,height:812},serviceWorkers:'allow'}),page=await setup(context);
  await page.goto(base);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await go(page,'vac-samsung-model-vs20c95d4tk');
  await page.waitForFunction(async()=>!!await caches.match(new URL('./catalog-samsung-v1.27.1.js',location.href)));
  await context.setOffline(true);await page.reload();await page.locator('#modelPartsQuery').waitFor();assert.equal(await page.locator('#modelPartsResults [data-part]').count(),9);
  await page.evaluate(()=>location.hash='product/vac-hoover-model-hf202p011');await page.locator('#retryCatalog').waitFor();assert.match(await page.locator('.model-loading-device').innerText(),/39401035/);await context.close();
 });
 assert.deepEqual(errors,[],'no page errors in tested UI flows');
 console.log(JSON.stringify({browser:await browser.version(),viewport:'375x812',checks:results.length,results,screenshots,externalRequests:'blocked',limits:'Desktop Chromium emulation; no physical iOS, VoiceOver or on-screen keyboard test.'},null,2));
}finally{
 await browser?.close();await new Promise(resolve=>server.close(resolve));
}
