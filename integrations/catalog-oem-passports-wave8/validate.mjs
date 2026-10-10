// Isolated staging validation: not a Consumer import, fitment assertion or licence review.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {catalogSnapshot} from '../consumer-repair-mission-poc/catalog-snapshot.mjs';

export const sourceDocument=JSON.parse(fs.readFileSync(new URL('./observations.json',import.meta.url),'utf8'));
export const snapshot=catalogSnapshot;
const validHosts={Miele:['www.miele.de'],Bosch:['www.bosch-home.com'],Samsung:['www.samsung.com'],Hoover:['www.hoover-home.com'],Dyson:['www.dyson.de']};
const expectedRights={factualUse:'review_pending',pageRedistribution:'not_granted',mediaB2c:'not_granted'};
const unique=(xs,label)=>assert.equal(new Set(xs).size,xs.length,'Duplicate '+label);
const exact=(a,b,label)=>assert.equal(a,b,label);
const sourceHost=(url,brand)=>{const u=new URL(url);exact(u.protocol,'https:','HTTPS only');assert.ok(validHosts[brand]?.includes(u.hostname),'Unapproved OEM host for '+brand);assert.ok(!u.username&&!u.password&&!u.searchParams.has('token'),'Source must not embed credentials');};
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
const allowedUnits=new Set(['mm','kg','W','V','l','m','min']);
export function validateDocuments(doc=sourceDocument,consumer=snapshot){
 assert.equal(doc.schema,'uf-catalog-oem-passports/1');
 assert.equal(consumer.version,doc.baseSnapshotVersion,'Different consumer snapshot: requires manual review');
 assert.ok(Array.isArray(consumer.devices)&&Array.isArray(consumer.parts));
 const actual=consumer.devices.map(d=>({id:d.id,reference:d.reference,market:d.market}));
 assert.deepEqual(actual,doc.baseSnapshotExactVariants,'Device count, reference, market or order changed: block stale projection');
 unique(doc.baseSnapshotExactVariants.map(x=>x.id),'locked device id');
 unique(consumer.parts.map(x=>x.id),'part ID');
 const devices=new Map(consumer.devices.map(d=>[d.id,d])),parts=new Map(consumer.parts.map(p=>[p.id,p]));
 unique(doc.records.map(x=>x.deviceId),'content profile');
 for(const r of doc.records){
   const d=devices.get(r.deviceId);
   assert.ok(d,'Record references nonexistent device');
   exact(r.brand,d.brand,'Brand mismatch');exact(r.deviceReference,d.reference,'Exact model/variant mismatch');exact(r.market,d.market,'Market transfer blocked');
   const s=r.source;assert.ok(s&&s.access==='public_oem_page');sourceHost(s.url,r.brand);
   assert.ok(nonempty(s.observedAt)&&Number.isFinite(Date.parse(s.observedAt)),'Observation date required');
   exact(s.rawSourceSha256,null,'No invented raw source checksum');
   exact(s.independentRawAudit,false,'No independent source audit claimed');
   exact(s.licenceEvidenceId,null,'No undocumented licence evidence');
   assert.deepEqual(s.rights,expectedRights,'Rights may not be silently elevated');
   assert.ok(Array.isArray(r.technicalFacts)&&Array.isArray(r.partListings)&&Array.isArray(r.maintenanceHints),'All content categories explicit');
   unique(r.technicalFacts.map(x=>x.key),'technical key');
   for(const f of r.technicalFacts){
     assert.ok(nonempty(f.key)&&nonempty(f.locator)&&allowedUnits.has(f.unit),'Granular fact locator/unit required');
     assert.ok(typeof f.value==='number'&&Number.isFinite(f.value)&&f.value>=0,'Measured OEM value required');
     if('qualifier'in f)assert.ok(nonempty(f.qualifier));
   }
   for(const p of r.partListings){
     const part=parts.get(p.partId);
     assert.ok(part&&d.candidatePartIds.includes(p.partId),'Cannot create new part or candidate edge by content data');
     exact(part.code,p.partCode,'OEM part code mismatch');
     exact(part.brand,r.brand,'OEM part brand mismatch');
     assert.ok(nonempty(p.locator)&&nonempty(p.designation));
     assert.ok(['oem_included_accessory','oem_device_parts_index'].includes(p.listingType));
     exact(p.fitment,'unconfirmed','Manufacturer listing is not physical fitment proof');
   }
   unique(r.partListings.map(p=>p.partId),'observed part listing');
   assert.ok(r.supportLink&&nonempty(r.supportLink.locator));
   exact(r.supportLink.url,s.url,'Support link requires dedicated source record when URL differs');
   assert.ok(['manufacturer_product_with_document_section','manufacturer_support_parts_index'].includes(r.supportLink.kind));
   for(const m of r.maintenanceHints){
     exact(m.kind,'maintenance_observation_only','No unpublished repair steps');
     assert.ok(nonempty(m.locator)&&nonempty(m.topic)&&nonempty(m.summary));
     exact(m.instructionsProvided,false,'No model-specific repair instructions verified');
     exact(m.toolsVerified,false,'No tool list verified');
   }
   assert.equal(r.repairInstructions?.length??0,0,'Repair procedure must be sourced and reviewed separately');
   assert.equal(r.requiredTools?.length??0,0,'Tool sizes must be sourced and reviewed separately');
   assert.equal(r.safetySteps?.length??0,0,'OEM safety steps must be sourced and reviewed separately');
   assert.equal(r.media?.length??0,0,'Unlicensed media forbidden');
   assert.ok(r.physicalFitApproved!==true&&r.installationApproved!==true&&r.assessment!=='supported','No positive fitment assertions');
   // A Bosch product family without /xx does not prove a particular E-Nr revision.
   if(r.brand==='Bosch')assert.ok(!r.deviceReference.includes('/'),'No silently invented Bosch revision');
 }
 return true;
}
const fraction=(count,of)=>({count,of});
export function measureDocuments(doc=sourceDocument,consumer=snapshot){
 validateDocuments(doc,consumer);
 const all=consumer.devices.length,ids=new Set(doc.records.map(x=>x.deviceId));
 const observedSpecs=doc.records.filter(r=>r.technicalFacts.length>0).length;
 const parts=doc.records.reduce((n,r)=>n+r.partListings.length,0);
 const coveredBrands=[...new Set(doc.records.map(r=>r.brand))].sort();
 return {
  schema:'uf-catalog-oem-passports-coverage/1',
  sourceSnapshotVersion:consumer.version,
  counts:{consumerDevices:all,consumerParts:consumer.parts.length,consumerBrands:new Set(consumer.devices.map(x=>x.brand)).size,profilesWithOemObservations:ids.size,observedTechnicalFacts:doc.records.reduce((n,r)=>n+r.technicalFacts.length,0),observedExactDevicePartListings:parts,brandsWithObservations:coveredBrands},
  coverage:{
   officialPageObserved:fraction(ids.size,all),
   modelSpecificTechnicalSpecs:fraction(observedSpecs,all),
   modelSpecificOemPartListing:fraction(doc.records.filter(r=>r.partListings.length>0).length,all),
   manufacturerSupportDestinations:fraction(doc.records.filter(r=>r.supportLink).length,all),
   maintenanceOnlyHints:fraction(doc.records.filter(r=>r.maintenanceHints.length>0).length,all),
   independentlyRawAudited:fraction(0,all),
   fullyVerifiedRepairProcedures:fraction(0,all),
   modelSpecificRequiredTools:fraction(0,all),
   modelSpecificSafetyInstructions:fraction(0,all),
   rightsClearedB2cMedia:fraction(0,all),
   verifiedPhysicalFitments:fraction(0,parts)
  },
  readiness:{deviceVariantsLockedToSnapshot:true,commercialSourceRights:'unknown',manufacturerRawReplay:'not_performed',ownerSourceAndRightsReviewRequired:true,consumerProjection:'not_integrated',launchApproved:false}
 };
}
export function buildPassports(doc=sourceDocument,consumer=snapshot){
 validateDocuments(doc,consumer);
 const observed=new Map(doc.records.map(x=>[x.deviceId,x]));
 const unknown=(reason)=>({status:'unknown',value:null,reason});
 const show=(value,source,locator)=>({status:'source_observed',value,sourceUrl:source.url,observedAt:source.observedAt,locator,licence:'review_pending'});
 return consumer.devices.map(d=>{
  const p=observed.get(d.id);
  return {
   deviceId:d.id,brand:d.brand,model:d.model,exactReference:d.reference,market:d.market,variantWarning:d.variantHint,
   identity:show(d.reference,{url:d.source.url,observedAt:d.source.checkedAt},'Existing Consumer identity snapshot; raw-source audit separate'),
   technicalSpecifications:p?Object.fromEntries(p.technicalFacts.map(f=>[f.key,show({value:f.value,unit:f.unit,qualifier:f.qualifier??null},p.source,f.locator)])):{},
   technicalStatus:p&&p.technicalFacts.length?{status:'source_observed'}:unknown('No variant-specific OEM technical facts yet'),
   partListingStatus:p&&p.partListings.length?{status:'source_observed'}:unknown('Existing candidate part IDs are not proof of variant-specific listing'),
   observedPartListings:p?p.partListings.map(part=>({...part,status:'source_observed',sourceUrl:p.source.url,observedAt:p.source.observedAt})):[],
   manufacturerSupport:p?show({url:p.supportLink.url,kind:p.supportLink.kind},p.source,p.supportLink.locator):unknown('No independently observed variant-specific support destination'),
   repairInstructions:unknown('No verified device-specific step-by-step repair guide'),
   tools:unknown('No verified device-specific tool sizes'),
   safetyInstructions:unknown('No reviewed model-specific OEM safety instructions'),
   officialManual:unknown('No single verified device-specific manual URL'),
   consumerMedia:unknown('No documented B2C image licence'),
   maintenanceOnly:p?p.maintenanceHints.map(x=>show(x.summary,p.source,x.locator)):[],
   fitmentAssessment:'unconfirmed',commercialUse:'unknown'
  };
 });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(measureDocuments(),null,2));
