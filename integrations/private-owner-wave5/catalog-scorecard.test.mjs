import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogGoal,scoreWeights,measureCatalog} from './catalog-scorecard.mjs';
import {catalogSnapshot} from '../consumer-repair-mission-poc/catalog-snapshot.mjs';

const specimen=()=>({
 version:123,
 devices:[{
  id:'synthetic-device',brand:'SYNTHETIC',model:'QA-only device',
  reference:'QA/01',identifiers:[{value:'QA/01'}],
  market:'DE',type:'floor',candidatePartIds:['synthetic-part'],
  source:{url:'https://example.invalid/qa-device',checkedAt:'2026-10-10'},
  variantHint:'Do not transfer a sibling variant'
 }],
 parts:[{
  id:'synthetic-part',brand:'SYNTHETIC',name:'QA-only filter',code:'QA-99',
  identifiers:[{value:'QA-99'}],assembly:'filter',
  source:{url:'https://example.invalid/qa-part',checkedAt:'2026-10-10'}
 }]
});
test('owner catalogue scorecard measures actual loaded, not historical project scratch',()=>{
 const r=measureCatalog();
 assert.equal(r.counts.devices,catalogSnapshot.devices.length);
 assert.equal(r.counts.originalPartIdentities,catalogSnapshot.parts.length);
 assert.equal(r.counts.brands,new Set(catalogSnapshot.devices.map(d=>d.brand)).size);
 assert.equal(r.counts.devicePartCandidates,catalogSnapshot.devices.reduce((n,d)=>n+d.candidatePartIds.length,0));
 assert.equal(r.target.models,500);
 assert.equal(r.target.modelGoalPercent,Number((catalogSnapshot.devices.length/500*100).toFixed(1)));
 assert.equal(r.fitment.approvedRealInstallationCases,0);
 assert.equal(r.legal.sourceUrlsAreNotLicences,true);
 if(catalogSnapshot.version===1){
  assert.deepEqual([r.counts.devices,r.counts.brands,r.counts.originalPartIdentities,r.counts.devicePartCandidates,r.counts.devicesWithCandidate],[11,5,11,11,6]);
  assert.equal(r.contentIndex.estimatePercent,28.2);
 }
});
test('content score has explicit stable 100-point rubric, is not a percentage of verified fitments',()=>{
 const w=Object.values(scoreWeights).reduce((x,y)=>x+y,0);
 assert.equal(w,100);
 const r=measureCatalog(specimen());
 assert.equal(r.contentIndex.estimatePercent,35);
 assert.equal(r.fieldCoverage.repairInstructions.count,0);
 assert.equal(r.fieldCoverage.rightsClearedMedia.count,0);
 assert.equal(r.counts.devicePartCandidates,1);
 assert.equal(r.fitment.approvedRealInstallationCases,0);
});
test('generic or invented unsourced information is never rewarded',()=>{
 const s=specimen(),d=s.devices[0];
 d.repairSteps=['replace filter'];d.requiredTools=['screwdriver'];d.safetyWarnings=['unplug'];
 d.technicalSpecifications={watts:800,weightKg:2};
 d.media=[{url:'https://example.invalid/photo',rights:{b2cUse:'unknown'}}];
 const r=measureCatalog(s);
 assert.equal(r.contentIndex.estimatePercent,35);
 assert.deepEqual([r.fieldCoverage.repairInstructions.count,r.fieldCoverage.requiredTools.count,
 r.fieldCoverage.safetyWarnings.count,r.fieldCoverage.technicalSpecs.count,r.fieldCoverage.rightsClearedMedia.count],[0,0,0,0,0]);
});
test('source-documented model-specific guides, tooling and safety are counted as coverage, not legal or installation approval',()=>{
 const s=specimen(),d=s.devices[0],source={url:'https://example.invalid/repair-manual',checkedAt:'2026-10-10'};
 d.repairSteps=['documented repair'];d.repairDocumentation={source};
 d.requiredTools=['required tool'];d.toolEvidence={source};
 d.safetyWarnings=['safety instruction'];d.safetyEvidence={source};
 d.technicalSpecifications={watts:800,weightKg:2};d.technicalSource=source;
 d.media=[{url:'https://example.invalid/photo',rights:{b2cUse:'granted'},licenceEvidenceId:'QA-source-only'}];
 const r=measureCatalog(s);
 assert.equal(r.contentIndex.estimatePercent,90);
 assert.equal(r.fitment.approvedRealInstallationCases,0);
 assert.equal(r.legal.hostingOrCommercialReadinessNotInferred,true);
});
test('fail closed on invalid references, duplicates and invented real fitment',()=>{
 const s=specimen();s.devices[0].candidatePartIds=['missing'];assert.throws(()=>measureCatalog(s),/Unknown device part candidate/);
 const d=specimen();d.parts.push(structuredClone(d.parts[0]));assert.throws(()=>measureCatalog(d),/Duplicate part ID/);
 const x=specimen();x.devices[0].physicalFitApproved=true;assert.throws(()=>measureCatalog(x),/No real installation approval/);
 const y=specimen();y.devices[0].candidatePartIds.push('synthetic-part');assert.throws(()=>measureCatalog(y),/Duplicate device-to-part candidate ID/);
});
test('no source URL/date means no original-part or model-documentation coverage',()=>{
 const s=specimen();delete s.devices[0].source.checkedAt;delete s.parts[0].source.url;
 const r=measureCatalog(s);assert.equal(r.fieldCoverage.modelSourceAndExactIdentity.count,0);assert.equal(r.fieldCoverage.originalPartIdentityAndSource.count,0);
 assert.equal(r.contentIndex.estimatePercent,15);
 assert.equal(r.target.models,catalogGoal.models);
});
