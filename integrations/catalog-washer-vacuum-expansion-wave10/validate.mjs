// Research gate only. No import, purchase advice, commercial licence or positive fitment.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {catalogSnapshot} from '../consumer-repair-mission-poc/catalog-snapshot.mjs';
export const input=JSON.parse(readFileSync(new URL('./source-candidates.json',import.meta.url),'utf8'));
const hosts={Bosch:'www.bosch-home.com',AEG:'www.aeg.de',Hoover:'www.hoover-home.com',Dyson:'www.dyson.de'};
const fields=(obj,allowed,label)=>{
 assert.ok(obj&&typeof obj==='object'&&!Array.isArray(obj),label+' object missing');
 for(const key of Object.keys(obj))assert.ok(allowed.includes(key),label+' unexpected field '+key);
};
export function compareVariants(a,b){
 for(const key of ['sector','brand','model','market','primaryCode'])assert.equal(a[key],b[key],'Variant '+key+' mismatch');
 assert.deepEqual(a.secondaryIdentity,b.secondaryIdentity,'PNC/product SKU or leading-zero mismatch');
 return true;
}
export function validate(plan=input,consumer=catalogSnapshot){
 fields(plan,['schema','createdAt','status','sourceOwnerHead','candidates'],'plan');
 assert.equal(plan.schema,'uf-oem-expansion-plan-wave10/1');
 assert.equal(plan.status,'internal_research_only');
 assert.ok(Array.isArray(plan.candidates));
 assert.ok(consumer&&Array.isArray(consumer.devices)&&Array.isArray(consumer.parts));
 const seenId=new Set(),seenCode=new Set(),active=new Set(consumer.devices.map(d=>d.brand+'|'+d.reference));
 for(const c of plan.candidates){
  fields(c,['id','sector','brand','model','market','primaryCode','secondaryIdentity','variantStatus','unresolved','source','mediaRights','commercialRights','consumerImportAllowed','engineApproved','originalParts','fitmentEdges','physicalFitsApproved'],'candidate');
  assert.ok(typeof c.id==='string'&&c.id&&typeof c.model==='string'&&c.model);
  assert.ok(!seenId.has(c.id),'Duplicate candidate ID');seenId.add(c.id);
  assert.ok(['washing-machine','vacuum-cleaner'].includes(c.sector));
  assert.equal(c.market,'DE','No cross-market claims');
  assert.ok(hosts[c.brand]);
  const key=[c.sector,c.brand,c.primaryCode].join('|');
  assert.ok(!seenCode.has(key),'Duplicate exact OEM code');seenCode.add(key);
  assert.ok(!active.has(c.brand+'|'+c.primaryCode),'Already in Consumer snapshot');
  assert.ok(Array.isArray(c.unresolved)&&c.unresolved.length>0,'Serial and revision scope must stay open');
  assert.ok(c.unresolved.every(x=>typeof x==='string'&&x.length>0));
  assert.equal(c.mediaRights,'unknown');assert.equal(c.commercialRights,'unknown');
  assert.equal(c.consumerImportAllowed,false);assert.equal(c.engineApproved,false);
  assert.deepEqual(c.originalParts,[]);assert.deepEqual(c.fitmentEdges,[]);
  assert.equal(c.physicalFitsApproved,0);
  fields(c.source,['url','locator','observedAt','type','rawBytesVerified','rawSha256'],'source');
  assert.ok(typeof c.source.locator==='string'&&c.source.locator.length>10,'Granular OEM location missing');
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(c.source.observedAt));
  assert.equal(c.source.type,'official_manufacturer_page_observed');
  assert.equal(c.source.rawBytesVerified,false);assert.equal(c.source.rawSha256,null);
  const url=new URL(c.source.url);
  assert.equal(url.protocol,'https:');assert.equal(url.hostname,hosts[c.brand]);
  assert.ok(!url.search&&!url.username&&!url.password);
  const path=url.pathname;
  if(c.brand==='Bosch'){
   assert.equal(c.sector,'washing-machine');
   assert.equal(c.primaryCode,c.model);
   assert.equal(path.split('/').filter(Boolean).at(-1),c.primaryCode,'Bosch model URL mismatch');
   assert.equal(c.secondaryIdentity,null,'No invented Bosch E-Nr /xx');
   assert.equal(c.variantStatus,'incomplete_e_number','BSH full E-Nr unknown');
   assert.ok(c.unresolved.includes('E-Nr_/xx_missing'));
  } else if(c.brand==='AEG'){
   assert.equal(c.sector,'washing-machine');assert.equal(c.primaryCode,c.model);
   assert.equal(path.split('/').filter(Boolean).at(-1),c.model.toLowerCase(),'AEG URL mismatch');
   fields(c.secondaryIdentity,['namespace','value'],'AEG PNC');
   assert.equal(c.secondaryIdentity.namespace,'pnc');
   assert.match(c.secondaryIdentity.value,/^\d{9}$/,'Nine-digit manufacturer PNC required');
   assert.ok(c.source.locator.includes(c.secondaryIdentity.value.replace(/(\d{3})(\d{3})(\d{3})/,'$1 $2 $3')),'PNC locator mismatch');
   assert.equal(c.variantStatus,'model_identity_observed_only');
  } else if(c.brand==='Hoover'){
   assert.equal(c.sector,'vacuum-cleaner');assert.equal(c.primaryCode,c.model);
   fields(c.secondaryIdentity,['namespace','value'],'Hoover SKU');
   assert.equal(c.secondaryIdentity.namespace,'product-sku');
   assert.match(c.secondaryIdentity.value,/^\d{8}$/);
   assert.ok(path.includes('/'+c.secondaryIdentity.value+'/'),'Hoover SKU URL mismatch');
   assert.equal(path.split('/').filter(Boolean).at(-1),c.model.toLowerCase().replace(/\s+/g,'-'),'Hoover model slug mismatch');
   assert.equal(c.variantStatus,'model_identity_observed_only');
  } else if(c.brand==='Dyson'){
   assert.equal(c.sector,'vacuum-cleaner');assert.match(c.primaryCode,/^\d{6}-\d{2}$/);
   assert.equal(c.secondaryIdentity,null,'No invented secondary Dyson identities');
   assert.ok(path.endsWith('/search.'+c.primaryCode),'Dyson exact SKU URL mismatch');
   assert.equal(c.variantStatus,'model_identity_observed_only');
  }
 }
 return true;
}
export function summary(plan=input,consumer=catalogSnapshot){
 validate(plan,consumer);
 const washer=plan.candidates.filter(c=>c.sector==='washing-machine').length;
 const vacuum=plan.candidates.length-washer;
 return {
  schema:'uf-oem-expansion-wave10-report/1',
  currentConsumerDevices:consumer.devices.length,currentConsumerParts:consumer.parts.length,
  candidates:plan.candidates.length,washer,vacuum,brands:[...new Set(plan.candidates.map(x=>x.brand))].sort(),
  exactPageObservations:plan.candidates.length,
  aetPncCodes:plan.candidates.filter(x=>x.brand==='AEG').length,
  hooverSkus:plan.candidates.filter(x=>x.brand==='Hoover').length,
  dysonSkus:plan.candidates.filter(x=>x.brand==='Dyson').length,
  unresolvedBoschRevisions:plan.candidates.filter(x=>x.brand==='Bosch').length,
  independentlyRawAudited:0,commerciallyLicensed:0,consumerImports:0,
  newPartIdentities:0,newFitmentEdges:0,positivePhysicalFits:0,launchApproved:false
 };
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===new URL(import.meta.url).pathname){
 const result=summary();
 if(process.argv.includes('--check'))assert.deepEqual(summary(),result);
 console.log(JSON.stringify({status:'PASS',...result},null,2));
}
