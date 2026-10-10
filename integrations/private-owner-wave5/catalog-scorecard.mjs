// Owner reporting, not fitment proof, manufacturer's authorization, or a launch decision.
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {catalogSnapshot} from '../consumer-repair-mission-poc/catalog-snapshot.mjs';

export const catalogGoal=Object.freeze({brands:10,modelsPerBrand:50,models:500});
export const scoreWeights=Object.freeze({
  modelIdentityAndSources:10,
  originalPartIdentityAndSources:10,
  deviceWithAtLeastOneListedCandidate:15,
  modelSpecificTechnicalSpecs:10,
  modelSpecificRepairInstructions:15,
  modelSpecificTools:10,
  modelSpecificSafety:10,
  rightsClearedModelMedia:10,
  realInstallationProof:10
});

const present=x=>typeof x==='string'&&x.trim().length>0;
const sourceDoc=s=>s&&present(s.url)&&/^https:\/\//i.test(s.url)&&present(s.checkedAt)&&Number.isFinite(Date.parse(s.checkedAt));
const ratio=(n,total)=>total>0?n/total:0;
const percent=(n,total)=>Number((ratio(n,total)*100).toFixed(1));
const unique=(items,key,msg)=>assert.equal(new Set(items.map(key)).size,items.length,msg);
const anyList=x=>Array.isArray(x)&&x.length>0;
const nonemptySpec=x=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.values(x).filter(v=>typeof v==='number'||present(v)).length>=2;
const approvedPhoto=d=>Array.isArray(d.media)&&d.media.some(m=>present(m.url)&&m.rights?.b2cUse==='granted');
export function measureCatalog(snapshot=catalogSnapshot,goal=catalogGoal){
 assert.ok(snapshot&&Array.isArray(snapshot.devices)&&Array.isArray(snapshot.parts),'Snapshot must have device/part arrays');
 assert.ok(goal.models>0&&goal.brands>0);
 const devices=snapshot.devices,parts=snapshot.parts,partIDs=new Set(parts.map(p=>p.id));
 unique(devices,d=>d.id,'Duplicate device ID');unique(parts,p=>p.id,'Duplicate part ID');
 const links=[];
 for(const d of devices){
  assert.ok(Array.isArray(d.candidatePartIds),'Device candidates must be explicit');
  unique(d.candidatePartIds,x=>x,'Duplicate device-to-part candidate ID');
  for(const id of d.candidatePartIds){assert.ok(partIDs.has(id),'Unknown device part candidate: '+id);links.push({deviceId:d.id,partId:id});}
 }
 // A source URL and date mean a *documented reference*, not an audited response or a redistribution licence.
 const docs={
  modelIdentityAndSources:devices.filter(d=>present(d.brand)&&present(d.model)&&present(d.reference)&&present(d.market)&&sourceDoc(d.source)&&
    d.identifiers?.some(i=>i.value===d.reference)).length,
  originalPartIdentityAndSources:parts.filter(p=>present(p.brand)&&present(p.name)&&present(p.code)&&present(p.assembly)&&sourceDoc(p.source)&&
    p.identifiers?.some(i=>i.value===p.code)).length,
  devicesWithCandidate:devices.filter(d=>d.candidatePartIds.length>0).length,
  variantWarnings:devices.filter(d=>present(d.variantHint)).length,
  modelSpecificTechnicalSpecs:devices.filter(d=>nonemptySpec(d.technicalSpecifications)).length,
  modelSpecificRepairInstructions:devices.filter(d=>anyList(d.repairSteps)).length,
  modelSpecificTools:devices.filter(d=>anyList(d.requiredTools)).length,
  modelSpecificSafety:devices.filter(d=>anyList(d.safetyWarnings)).length,
  rightsClearedModelMedia:devices.filter(approvedPhoto).length,
  modelSpecificManualLinks:devices.filter(d=>present(d.manualUrl)&&/^https:\/\//.test(d.manualUrl)).length,
  modelSpecificMeasurements:devices.filter(d=>nonemptySpec(d.dimensions)).length,
  partsWithKnownSource:parts.filter(p=>sourceDoc(p.source)).length,
  consumerDevicesWithMarketDE:devices.filter(d=>d.market==='DE').length
 };
 const unsafeClaims=[...devices,...parts].filter(x=>x.physicalFitApproved===true||x.installationApproved===true||x.assessment==='supported');
 assert.equal(unsafeClaims.length,0,'No real installation approval may be derived from catalogue-only records');
 const grades=[
  ['modelIdentityAndSources',docs.modelIdentityAndSources,devices.length],
  ['originalPartIdentityAndSources',docs.originalPartIdentityAndSources,parts.length],
  ['deviceWithAtLeastOneListedCandidate',docs.devicesWithCandidate,devices.length],
  ['modelSpecificTechnicalSpecs',docs.modelSpecificTechnicalSpecs,devices.length],
  ['modelSpecificRepairInstructions',docs.modelSpecificRepairInstructions,devices.length],
  ['modelSpecificTools',docs.modelSpecificTools,devices.length],
  ['modelSpecificSafety',docs.modelSpecificSafety,devices.length],
  ['rightsClearedModelMedia',docs.rightsClearedModelMedia,devices.length],
  // A positive fitment is never inferred from a catalogue claim; shared v1 evidence review is separate.
  ['realInstallationProof',0,links.length]
 ];
 assert.equal(Object.values(scoreWeights).reduce((a,b)=>a+b,0),100);
 const components=grades.map(([id,count,total])=>({id,weight:scoreWeights[id],documented:count,total,coveragePercent:percent(count,total),weightedPoints:Number((scoreWeights[id]*ratio(count,total)).toFixed(3))}));
 const result={
  schema:'uf-owner-catalog-scorecard/1',
  projectScope:'current-branch Consumer catalog-snapshot.mjs; not the public app or Wave3 scratch',
  snapshotVersion:snapshot.version,
  counts:{devices:devices.length,brands:new Set(devices.map(d=>d.brand)).size,originalPartIdentities:parts.length,devicePartCandidates:links.length,devicesWithCandidate:docs.devicesWithCandidate,devicesWithNoCandidate:devices.length-docs.devicesWithCandidate,marketDE:docs.consumerDevicesWithMarketDE},
  target:{...goal,modelGoalPercent:percent(devices.length,goal.models)},
  fieldCoverage:{
   modelSourceAndExactIdentity:{count:docs.modelIdentityAndSources,of:devices.length},
   originalPartIdentityAndSource:{count:docs.originalPartIdentityAndSources,of:parts.length},
   modelSpecificVariantWarnings:{count:docs.variantWarnings,of:devices.length},
   modelsWithCandidate:{count:docs.devicesWithCandidate,of:devices.length},
   technicalSpecs:{count:docs.modelSpecificTechnicalSpecs,of:devices.length},
   repairInstructions:{count:docs.modelSpecificRepairInstructions,of:devices.length},
   requiredTools:{count:docs.modelSpecificTools,of:devices.length},
   safetyWarnings:{count:docs.modelSpecificSafety,of:devices.length},
   modelManualLinks:{count:docs.modelSpecificManualLinks,of:devices.length},
   dimensions:{count:docs.modelSpecificMeasurements,of:devices.length},
   rightsClearedMedia:{count:docs.rightsClearedModelMedia,of:devices.length}
  },
  contentIndex:{estimatePercent:Number(components.reduce((s,c)=>s+c.weightedPoints,0).toFixed(1)),components,interpretation:'Internal weighted field-presence index, not validated content quality, legal clearance, or real-fitment coverage'},
  fitment:{approvedRealInstallationCases:0,installationProofSource:'shared fitment-v1 evidence review, not catalog listing',manufacturerListedCandidateIsNotApproval:true},
  legal:{sourceUrlsAreNotLicences:true,hostingOrCommercialReadinessNotInferred:true}
 };
 return result;
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===fileURLToPath(new URL('file://'+process.argv[1])))console.log(JSON.stringify(measureCatalog(),null,2));
