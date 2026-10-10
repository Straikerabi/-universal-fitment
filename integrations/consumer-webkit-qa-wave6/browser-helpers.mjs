import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {catalogSnapshot} from '../consumer-repair-mission-poc/catalog-snapshot.mjs';
export {catalogSnapshot};
export const realId=catalogSnapshot.devices[0].id;
export async function fresh(page,base){
 await page.goto(base);await page.evaluate(()=>localStorage.clear());await page.reload();
 await page.locator('#deviceQuery').waitFor();
}
export async function real(page,base,id=realId){
 await fresh(page,base);await page.locator('[data-device="'+id+'"]').click();
 await page.locator('main [data-step="2"]').click();
}
export async function assembly(page,id='filter'){
 const group=page.locator('[data-group="'+id+'"]');
 if(!await group.evaluate(e=>e.open))await group.locator(':scope > summary').click();
 await page.locator('[data-assembly="'+id+'"]').click();
}
export async function review(page,id='filter'){
 await page.locator('main [data-step="3"]').click();await assembly(page,id);
 await page.locator('main [data-step="4"]').click();await page.locator('#assessmentTitle').waitFor();
}
export async function demo(page,base,id,{known=true}={}){
 await fresh(page,base);await page.locator('#demoMode').click();
 await page.locator('[data-scenario="'+id+'"]').click();await page.locator('main [data-step="2"]').click();
 if(known&&!await page.locator('input[value=known]').isDisabled())await page.locator('input[value=known]').check();
 await review(page,id==='connector-negative'?'battery':'filter');
}
export async function noPurchase(page){
 assert.equal(await page.locator('button').filter({hasText:/Kaufen|Bestellen|Warenkorb/}).count(),0);
 assert.equal(await page.locator('main img,main svg image').count(),0,'No copied manufacturer images');
}
export async function reflow(page){
 const r=await page.evaluate(()=>{
  const visible=e=>{
   const r=e.getBoundingClientRect();if(!r.width||!r.height||getComputedStyle(e).visibility==='hidden')return false;
   for(let p=e.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS'&&!p.open&&!p.querySelector(':scope > summary')?.contains(e))return false;
   return true;
  };
  const clipped=[...document.querySelectorAll('header button,nav button,main button,main summary,main label,main input,main select,main .source-box,main .device-pass,main .missing-list')].filter(e=>{
   if(!visible(e))return false;const r=e.getBoundingClientRect();
   return r.left< -1||r.right>innerWidth+1||(!['INPUT','SELECT'].includes(e.tagName)&&e.scrollWidth>e.clientWidth+2);
  }).map(e=>({tag:e.tagName,id:e.id,text:e.textContent.trim().slice(0,100),client:e.clientWidth,scroll:e.scrollWidth}));
  return {viewport:innerWidth,document:document.documentElement.scrollWidth,clipped};
 });
 assert.ok(r.document<=r.viewport+1,'Document overflow '+JSON.stringify(r));
 assert.deepEqual(r.clipped,[],'Clipped responsive content '+JSON.stringify(r));
}
export async function fiveSteps(page,{base,zoom=false,dark=false,onStage=async()=>{}}){
 await real(page,base);
 if(zoom)await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 if(dark)await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});
 for(const stage of [1,2,3]){
  await page.locator('#progress [data-step="'+stage+'"]').click();
  if(stage===3)await page.locator('#partFilterOptions > summary').click();
  await reflow(page);await noPurchase(page);await onStage(stage);
 }
 await assembly(page);
 for(const stage of [4,5]){
  await page.locator('#progress [data-step="'+stage+'"]').click();
  if(stage===4){assert.equal(await page.locator('.assessment-card').getAttribute('data-status'),'unclear');await page.locator('[data-part]').first().check();}
  await reflow(page);await noPurchase(page);await onStage(stage);
 }
}
export async function passport(page){
 const waiting=page.waitForEvent('download');await page.locator('#downloadPassport').click();
 const download=await waiting;assert.equal(await download.failure(),null);
 const json=await readFile(await download.path(),'utf8'),record=JSON.parse(json);
 const independent=createHash('sha256').update(JSON.stringify(record.payload)).digest('hex');
 assert.equal(record.integrity.algorithm,'SHA-256');assert.equal(record.integrity.sha256,independent);
 const verification=await page.evaluate(async json=>{
  const {verifyRepairPassportJson}=await import('/mission-state.mjs');
  const changed=JSON.parse(json);changed.payload.verdict.realInstallationApproved=true;
  return {original:await verifyRepairPassportJson(json),modified:await verifyRepairPassportJson(changed),
   malformed:await verifyRepairPassportJson('{synthetic-broken-json'),missingDigest:await verifyRepairPassportJson({payload:changed.payload})};
 },json);
 assert.deepEqual(verification,{original:true,modified:false,malformed:false,missingDigest:false});
 assert.equal(record.payload.verdict.realInstallationApproved,false);
 assert.equal(record.payload.verdict.purchaseAllowed,false);
 assert.equal(record.payload.verdict.completeRepairKit,false);
 return {record,json,filename:download.suggestedFilename(),sha256:independent,verification};
}
export async function offline(context,page){
 // Actual transport denial AND an explicit OS-signal simulation. Not an airplane-mode hardware claim.
 const nativeBefore=await page.evaluate(()=>navigator.onLine);
 await page.addInitScript(()=>Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>false}));
 await context.setOffline(true);
 const nativeAfter=await page.evaluate(()=>navigator.onLine);
 await page.evaluate(()=>{Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>false});window.dispatchEvent(new Event('offline'));});
 return {transportOffline:true,osSignalSimulated:true,nativeBefore,nativeAfter};
}
