import assert from 'node:assert/strict';
import {VIEWPORTS,WIDTHS,CASE_IDS} from './policy.mjs';
import {fresh,real,assembly,review,demo,noPurchase,reflow,fiveSteps,passport,offline,catalogSnapshot,realId} from './browser-helpers.mjs';
import {cacheName,assetPaths} from '../consumer-repair-mission-poc/offline-config.mjs';
import {expectedAssetHashes} from './verify-source.mjs';
export function browserCases(){
 const cases=[];
 for(const viewport of VIEWPORTS)cases.push({id:'viewport-'+viewport.id,viewport,run:async t=>{
  await fiveSteps(t.page,{base:t.base,onStage:async stage=>{
   if((viewport.id==='375-portrait'&&stage===3)||(viewport.id==='430-portrait'&&stage===5))await t.shot('stage-'+stage);
  }});return {viewport,stages:5};
 }});
 for(const width of WIDTHS)cases.push({id:'text-200-'+width,viewport:{width,height:812},run:async t=>{
  await fiveSteps(t.page,{base:t.base,zoom:true,onStage:async stage=>{if(width===320&&stage===3)await t.shot('expanded');}});
  return {cssRootFontPercent:200,physicalPinchZoom:false,stages:5};
 }});
 for(const width of WIDTHS)cases.push({id:'dark-'+width,viewport:{width,height:812},run:async t=>{
  await fiveSteps(t.page,{base:t.base,dark:true,onStage:async stage=>{if(width===375&&stage===3)await t.shot('expanded');}});
  return {colorScheme:'dark',stages:5};
 }});
 const add=(id,run,options={})=>cases.push({id,run,...options});
 add('real-passport',async t=>{
  await real(t.page,t.base);await review(t.page);assert.equal(await t.page.locator('.assessment-card').getAttribute('data-status'),'unclear');
  await t.page.locator('[data-part]').first().check();await t.page.locator('main [data-step="5"]').click();
  for(const item of await t.page.locator('[data-done]').all())await item.check();
  const p=await passport(t.page),device=catalogSnapshot.devices[0];
  assert.equal(p.filename,'Universal-Fitment-Pruefpass.json');assert.equal(p.record.payload.recordType,'real-catalog-research');
  assert.equal(p.record.payload.device.catalogId,device.id);assert.equal(p.record.payload.device.sourceReference,device.reference);
  assert.equal(p.record.payload.device.sourceMarket,device.market);assert.equal(p.record.payload.device.variantIndependentlyVerified,false);
  assert.equal(p.record.payload.verdict.status,'unconfirmed');assert.equal(p.record.payload.repair.candidateParts.length,1);
  assert.equal(p.record.payload.repair.candidateParts[0].physicalFitApproved,false);await noPurchase(t.page);await t.shot('notes');
  return {filename:p.filename,sha256:p.sha256,tamperRefused:true,realInstallationApproved:false};
 });
 add('identity-boundaries',async t=>{
  const device=catalogSnapshot.devices.find(d=>d.id==='vac-hoover-model-hf202p011');assert.ok(device);
  await real(t.page,t.base,device.id);await t.page.locator('input[value=known]').check();
  await t.page.locator('#observedCode').fill('QA-SYNTHETIC-UNVERIFIED-REVISION');await review(t.page);
  const text=await t.page.locator('.device-pass').innerText();assert.ok(text.includes(device.reference));assert.ok(text.includes(device.productCode));
  assert.match(text,/Quellenmarkt DE.*QA-SYNTHETIC-UNVERIFIED-REVISION/s);assert.match(await t.page.locator('.missing-list').innerText(),/weicht/);
  await t.page.locator('.candidate summary').click();assert.match(await t.page.locator('.candidate .source-box').innerText(),/Quellenwebsite GB \(en_GB\)/);
  await t.shot('regional-source');await t.page.locator('[data-part]').first().check();await t.page.locator('main [data-step="5"]').click();
  const p=await passport(t.page);assert.equal(p.record.payload.device.productCode,device.productCode);
  assert.equal(p.record.payload.device.referenceEnteredByUser,'QA-SYNTHETIC-UNVERIFIED-REVISION');assert.equal(p.record.payload.verdict.status,'unconfirmed');
  return {syntheticUserInput:true,deviceReference:device.reference,productCode:device.productCode,sourceMarket:device.market};
 });
 add('unknown-identifiers',async t=>{
  await fresh(t.page,t.base);
  for(const code of ['QA-SYNTHETIC-UNKNOWN','VS20C95D4TK/WA','VS90F40EEM/WD']){
   await t.page.locator('#deviceQuery').fill(code);assert.equal(await t.page.locator('[data-device]').count(),0);
   assert.equal(await t.page.locator('main [data-step="2"]').isDisabled(),true);assert.match(await t.page.locator('#deviceResults').innerText(),/nicht erfasst/);
  }
  await noPurchase(t.page);return {rejectedInputs:3,similarVariantSubstituted:false};
 });
 add('demo-positive',async t=>{
  await demo(t.page,t.base,'filter-positive');assert.equal(await t.page.locator('.assessment-card').getAttribute('data-status'),'supported');
  assert.match(await t.page.locator('#modeNotice').innerText(),/SYNTHETISCHE DEMO.*KEINE REALEN OEM-PASSUNGEN/s);
  assert.equal(await t.page.locator('[data-part]').count(),0);assert.equal(await t.page.locator('main a').count(),0);await t.shot('synthetic-only');
  await t.page.locator('main [data-step="5"]').click();const p=await passport(t.page);
  assert.equal(p.filename,'SYNTHETISCHE-DEMO-Pruefpass.json');assert.equal(p.record.payload.recordType,'synthetic-test-only');
  assert.equal(p.record.payload.verdict.syntheticEngineOutcome,'supported');assert.equal(p.record.payload.device.manufacturerIdentitySource,null);
  await noPurchase(t.page);return {synthetic:true,outcome:'supported',realInstallationApproved:false};
 });
 add('demo-negative',async t=>{
  await demo(t.page,t.base,'filter-negative');assert.equal(await t.page.locator('.assessment-card').getAttribute('data-status'),'incompatible');await t.shot('synthetic-only');
  await t.page.locator('main [data-step="5"]').click();assert.equal(await t.page.locator('#section-parts').locator('..').locator('li').count(),0);
  const p=await passport(t.page);assert.equal(p.record.payload.verdict.syntheticEngineOutcome,'incompatible');await noPurchase(t.page);
  return {synthetic:true,outcome:'incompatible',excludedFromNotes:true};
 });
 add('demo-unknown',async t=>{
  await demo(t.page,t.base,'revision-missing');assert.equal(await t.page.locator('.assessment-card').getAttribute('data-status'),'unclear');
  assert.match(await t.page.locator('.missing-list').innerText(),/Revision/);
  await demo(t.page,t.base,'filter-positive',{known:false});assert.equal(await t.page.locator('.assessment-card').getAttribute('data-status'),'unclear');
  await noPurchase(t.page);return {synthetic:true,missingRevision:'unclear',unselectedVariant:'unclear'};
 });
 add('demo-connector',async t=>{
  await demo(t.page,t.base,'connector-negative');assert.equal(await t.page.locator('.assessment-card').getAttribute('data-status'),'incompatible');
  await t.page.locator('main [data-step="5"]').click();assert.equal(await t.page.locator('#section-parts').locator('..').locator('li').count(),0);
  await noPurchase(t.page);return {synthetic:true,connectorExcluded:true};
 });
 add('demo-incomplete',async t=>{
  await demo(t.page,t.base,'kit-incomplete');assert.match(await t.page.locator('.missing-list').innerText(),/DEMO-DICHTUNG/);
  await t.page.locator('main [data-step="5"]').click();for(const item of await t.page.locator('[data-done]').all())await item.check();
  const p=await passport(t.page);assert.equal(p.record.payload.verdict.completeRepairKit,false);await noPurchase(t.page);
  return {synthetic:true,allNotesTicked:true,completeKit:false};
 });
 add('mode-isolation',async t=>{
  await demo(t.page,t.base,'filter-positive');await t.page.locator('main [data-step="5"]').click();await t.page.locator('#realMode').click();
  assert.equal(await t.page.locator('[data-device][aria-pressed=true]').count(),0);assert.doesNotMatch(await t.page.locator('main').innerText(),/DEMO-FILTER/);
  await t.page.locator('[data-device="'+realId+'"]').click();await t.page.locator('main [data-step="2"]').click();await review(t.page);
  assert.equal(await t.page.locator('.assessment-card').getAttribute('data-status'),'unclear');
  const keys=await t.page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('uf-repair-mission-poc-v1-')).sort());
  assert.deepEqual(keys,['uf-repair-mission-poc-v1-real','uf-repair-mission-poc-v1-synthetic']);return {separateMissionKeys:keys};
 });
 add('stale-and-tampered-state',async t=>{
  for(const kind of ['stale-fingerprint','injected-response','old-schema']){
   await real(t.page,t.base);await review(t.page);await t.page.locator('[data-part]').first().check();
   await t.page.evaluate(kind=>{const key='uf-repair-mission-poc-v1-real',s=JSON.parse(localStorage.getItem(key));
    if(kind==='stale-fingerprint')s.fingerprint='QA-SYNTHETIC-OLD-FINGERPRINT';
    if(kind==='injected-response')s.assessment={status:'supported'};
    if(kind==='old-schema')s.version=1;localStorage.setItem(key,JSON.stringify(s));},kind);
   await t.page.reload();await t.page.locator('#deviceQuery').waitFor();assert.equal(await t.page.locator('[data-device][aria-pressed=true]').count(),0);
  }return {syntheticTampering:true,rejectedStates:3};
 });
 add('filters-and-checklist',async t=>{
  await real(t.page,t.base);await review(t.page);await t.page.locator('[data-part]').first().check();
  await t.page.locator('#partFilterOptions > summary').click();await t.page.locator('#evidenceFilter').selectOption('alternative');
  assert.equal(await t.page.locator('[data-part]').count(),0);assert.match(await t.page.locator('.empty').first().innerText(),/Kein Treffer/);
  assert.equal(await t.page.locator('#partSort option[value=price]').evaluate(e=>e.disabled),true);
  await t.page.locator('main [data-step="5"]').click();assert.equal(await t.page.locator('.checklist-section').count(),3);
  assert.equal(await t.page.locator('[data-remove-part]').count(),1);await t.page.locator('[data-remove-part]').click();
  assert.equal(await t.page.locator('[data-remove-part]').count(),0);assert.match(await t.page.locator('.check-summary').innerText(),/Passung bleibt unbestätigt/);
  return {hiddenSelectionPreserved:true,explicitRemoval:true,priceSortDisabled:true};
 });
 add('keyboard-and-semantics',async t=>{
  await fresh(t.page,t.base);await t.page.keyboard.press('Tab');assert.equal(await t.page.evaluate(()=>document.activeElement.className),'skip');
  await t.page.keyboard.press('Enter');assert.equal(await t.page.evaluate(()=>document.activeElement.id),'workspace');
  await t.page.locator('[data-device="'+realId+'"]').focus();await t.page.keyboard.press('Enter');await t.page.locator('main [data-step="2"]').click();
  const errors=await t.page.evaluate(()=>{
   const unnamed=[...document.querySelectorAll('input,select')].filter(e=>!e.labels?.length&&!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')).map(e=>e.id);
   const legends=[...document.querySelectorAll('fieldset')].filter(e=>!e.querySelector('legend')).length;
   return {unnamed,legends,currentSteps:document.querySelectorAll('#progress [aria-current=step]').length,main:document.querySelectorAll('main').length};
  });assert.deepEqual(errors,{unnamed:[],legends:0,currentSteps:1,main:1});
  await t.page.locator('input[value=known]').focus();await t.page.keyboard.press('Space');await t.page.locator('main [data-step="3"]').click();
  const summary=t.page.locator('[data-group=hose] > summary');await summary.focus();await t.page.keyboard.press('Enter');
  assert.equal(await t.page.locator('[data-group=hose]').evaluate(e=>e.open),true);
  await t.page.locator('#partQuery').fill('Filter');assert.equal(await t.page.locator('#partQuery').evaluate(e=>e===document.activeElement),true);
  assert.equal(await t.page.locator('#browseSummary').getAttribute('aria-live'),'polite');
  const aria=await t.page.locator('main').ariaSnapshot();assert.match(aria,/Filter/);
  await t.textArtifact('aria-snapshot.txt',aria);return {nativeLabels:true,fieldsetLegend:true,liveFilterStatus:true,voiceOverHardwareTest:false};
 });
 add('touch-targets',async t=>{
  const violations=[],stageCounts=[];await real(t.page,t.base);
  const inspect=async stage=>{
   const result=await t.page.evaluate(()=>{
    const visible=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&(e.checkVisibility?e.checkVisibility():getComputedStyle(e).visibility!=='hidden');};
    const elements=[...document.querySelectorAll('button,summary,input,select')].filter(visible).map(e=>{
     const target=['checkbox','radio'].includes(e.type)?e.closest('label')||e:e;
     const r=target.getBoundingClientRect();return {tag:e.tagName,id:e.id,text:(e.getAttribute('aria-label')||target.textContent||'').trim().slice(0,90),width:r.width,height:r.height};
    });return {count:elements.length,violations:elements.filter(e=>e.width<43.5||e.height<43.5)};
   });stageCounts.push({stage,targets:result.count});violations.push(...result.violations.map(x=>({stage,...x})));
  };
  for(const stage of [1,2,3]){await t.page.locator('#progress [data-step="'+stage+'"]').click();await inspect(stage);}
  await assembly(t.page);
  for(const stage of [4,5]){await t.page.locator('#progress [data-step="'+stage+'"]').click();await inspect(stage);}
  await t.textArtifact('touch-targets.json',JSON.stringify({policy:'44 CSS px design target, not a WCAG certification',stageCounts,violations},null,2));
  assert.deepEqual(violations,[],'Actionable targets below the 44 CSS px design policy');return {stageCounts,minimumDesignTarget:44};
 });
 add('cold-offline',async t=>{
  assert.deepEqual(await t.context.cookies(),[]);await t.context.setOffline(true);
  let failure;try{await t.page.goto(t.base,{waitUntil:'domcontentloaded',timeout:10000});}catch(e){failure=e.message;}
  assert.ok(failure,'Uncached offline navigation must not fabricate the app');assert.equal(await t.page.locator('#workspace').count(),0);
  return {expectedAbort:true,reason:failure.slice(0,400),warmCache:false};
 },{serviceWorkers:'allow'});
 add('warm-offline',async t=>{
  await t.page.addInitScript(()=>{
   window.__ufQaOffline={registrations:[],violations:[]};
   document.addEventListener('securitypolicyviolation',e=>window.__ufQaOffline.violations.push({directive:e.violatedDirective,blocked:e.blockedURI}));
   if('serviceWorker' in navigator){
    const original=navigator.serviceWorker.register.bind(navigator.serviceWorker);
    navigator.serviceWorker.register=async(...args)=>{
     const record={url:args[0],options:args[1]};window.__ufQaOffline.registrations.push(record);
     try{const registration=await original(...args);record.success=true;return registration;}
     catch(error){record.error=String(error);throw error;}
    };
   }
  });
  await fresh(t.page,t.base);
  await t.phase('controller',()=>t.page.waitForFunction(()=>!!navigator.serviceWorker.controller));
  await t.phase('cache-ready',()=>t.page.waitForFunction(()=>document.querySelector('#connectionStatus').textContent.includes('gespeichert')));
  const before=await t.page.evaluate(async cacheName=>(await (await caches.open(cacheName)).keys()).map(r=>new URL(r.url).pathname),cacheName);
  assert.deepEqual(before.sort(),[...assetPaths].sort());
  const cacheHashes=await t.phase('cache-source-bytes',()=>t.page.evaluate(async name=>{
   const cache=await caches.open(name),rows=await Promise.all((await cache.keys()).map(async request=>{
    const bytes=await (await cache.match(request)).arrayBuffer();
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    return [new URL(request.url).pathname,[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')];
   }));return Object.fromEntries(rows);
  },cacheName));
  assert.deepEqual(cacheHashes,expectedAssetHashes(),'Cached bytes must be the actual regenerated source assets');
  await real(t.page,t.base);await review(t.page);await t.page.locator('[data-part]').first().check();await t.page.locator('main [data-step="5"]').click();
  const signals=await offline(t.context,t.page);await t.phase('offline-reload',async()=>{await t.page.reload({waitUntil:'domcontentloaded'});await t.page.locator('[data-done]').first().waitFor();});
  assert.match(await t.page.locator('#connectionStatus').innerText(),/Offline.*gespeicherte Vorschau/);
  assert.match(await t.page.locator('.check-summary').innerText(),/Passung bleibt unbestätigt/);await reflow(t.page);await t.shot('cached-notes');
  const p=await t.phase('offline-json-sha256',()=>passport(t.page));assert.equal(p.record.payload.verdict.status,'unconfirmed');
  await t.page.locator('.checklist-source summary').click();await t.page.locator('.checklist-source a').click();
  assert.match(await t.page.locator('#feedback').innerText(),/Offline.*nicht neu geöffnet/);
  // Inspect a stale mission under the actual warm worker, not just an uncached document.
  await t.page.evaluate(()=>{const key='uf-repair-mission-poc-v1-real',s=JSON.parse(localStorage.getItem(key));s.fingerprint='QA-SYNTHETIC-STALE';localStorage.setItem(key,JSON.stringify(s));});
  await t.page.reload();await t.page.locator('#deviceQuery').waitFor();assert.equal(await t.page.locator('[data-device][aria-pressed=true]').count(),0);
  await t.page.locator('[data-device="'+realId+'"]').click();await t.page.locator('main [data-step="2"]').click();await review(t.page);await t.page.locator('main [data-step="5"]').click();
  await t.phase('cache-delete',async()=>{await t.page.locator('#eraseOffline').click();await t.page.waitForFunction(()=>document.querySelector('#feedback').textContent.includes('Offline-Vorschau entfernt'));});
  const remaining=await t.page.evaluate(()=>caches.keys());assert.equal(remaining.filter(k=>k.startsWith('uf-consumer-mobile-wave4-')).length,0);
  assert.match(await t.page.locator('.check-summary').innerText(),/Passung bleibt unbestätigt/);
  return {cacheName,cachePaths:before.length,cacheSourceBytesMatched:true,cacheSourceHashCount:Object.keys(cacheHashes).length,
   staleWarmMissionRefused:true,offlinePassportChecksumVerified:true,notesSurviveCacheDeletion:true,...signals};
 },{serviceWorkers:'allow',viewport:{width:390,height:844}});
 add('blocked-offline',async t=>{
  await real(t.page,t.base);const signals=await offline(t.context,t.page);
  assert.match(await t.page.locator('#connectionStatus').innerText(),/laufende Sitzung.*nicht.*gespeichert/);
  return {workerBlockedByTest:true,savedOfflineVersionClaimed:false,...signals};
 });
 add('storage-and-export-failures',async t=>{
  await t.page.addInitScript(()=>{Storage.prototype.setItem=()=>{throw Error('QA-SYNTHETIC-STORAGE-DENIED');};});
  await real(t.page,t.base);assert.match(await t.page.locator('#feedback').innerText(),/Speichern nicht möglich/);await review(t.page);
  await t.page.locator('main [data-step="5"]').click();
  await t.page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(Error('QA-SYNTHETIC-CLIPBOARD-DENIED'))}}));
  await t.page.locator('#copyMission').click();await t.page.waitForFunction(()=>document.querySelector('#feedback').textContent.includes('Textdatei sichern'));
  await t.page.evaluate(()=>Object.defineProperty(crypto,'subtle',{configurable:true,value:undefined}));
  await t.page.locator('#downloadPassport').click();await t.page.waitForFunction(()=>document.querySelector('#feedback').textContent.includes('Prüfpass derzeit nicht verfügbar'));
  const waiting=t.page.waitForEvent('download');await t.page.locator('#downloadMission').click();const download=await waiting;assert.equal(await download.failure(),null);
  await t.page.locator('#eraseMission').click();assert.equal(await t.page.locator('[data-device][aria-pressed=true]').count(),0);
  return {syntheticFailureInjection:true,storageDeniedNonfatal:true,clipboardFallback:true,missingChecksumRefusesJsonExport:true,textFallbackWorks:true};
 });
 assert.deepEqual(cases.map(c=>c.id),CASE_IDS,'Runner matrix must match fail-closed policy');return cases;
}
