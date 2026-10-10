import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogSnapshot} from '../consumer-repair-mission-poc/catalog-snapshot.mjs';
import {sourceDocument,validateDocuments,measureDocuments,buildPassports} from './validate.mjs';
const sample=()=>structuredClone(sourceDocument);
test('current 11-device snapshot and 5 OEM records validate without altering Consumer',()=>{
 assert.equal(validateDocuments(),true);
 const m=measureDocuments();
 assert.deepEqual([m.counts.consumerDevices,m.counts.consumerParts,m.counts.consumerBrands],[11,11,5]);
 assert.deepEqual([m.counts.profilesWithOemObservations,m.counts.brandsWithObservations.length],[5,5]);
 assert.equal(m.coverage.independentlyRawAudited.count,0);
 assert.equal(m.coverage.fullyVerifiedRepairProcedures.count,0);
 assert.equal(m.coverage.modelSpecificRequiredTools.count,0);
 assert.equal(m.coverage.rightsClearedB2cMedia.count,0);
 assert.equal(m.coverage.verifiedPhysicalFitments.count,0);
 assert.equal(m.readiness.launchApproved,false);
});
test('coverage denominator is actual consumer device count',()=>{
 const m=measureDocuments(),p=buildPassports();
 assert.equal(p.length,catalogSnapshot.devices.length);
 assert.equal(m.coverage.modelSpecificTechnicalSpecs.of,p.length);
 assert.equal(m.coverage.modelSpecificTechnicalSpecs.count,4);
 assert.equal(m.counts.observedTechnicalFacts,21);
 assert.equal(m.counts.observedExactDevicePartListings,3);
 assert.equal(m.coverage.modelSpecificOemPartListing.count,2);
 assert.equal(m.coverage.maintenanceOnlyHints.count,1);
 assert.ok(p.every(d=>d.fitmentAssessment==='unconfirmed'&&d.commercialUse==='unknown'));
 assert.equal(p.filter(d=>d.technicalStatus.status==='unknown').length,7);
});
test('manufacturer part designation is never a positive fit or an invented part',()=>{
 const p=buildPassports().find(x=>x.brand==='Dyson'&&x.exactReference==='369535-01');
 assert.equal(p.observedPartListings.length,2);
 assert.ok(p.observedPartListings.every(x=>x.fitment==='unconfirmed'));
 const bad=sample();bad.records.find(x=>x.brand==='Dyson').partListings[0].partCode='971634-02';
 assert.throws(()=>validateDocuments(bad),/OEM part code mismatch/);
});
test('foreign, sibling and regional variants cannot inherit observations',()=>{
 for(const alter of [
  d=>{d.records.find(x=>x.brand==='Samsung').deviceReference='VS20C95D4TK';},
  d=>{d.records.find(x=>x.brand==='Samsung').deviceReference='VS20C95D4TK/WE';},
  d=>{d.records.find(x=>x.brand==='Hoover').market='GB';},
  d=>{d.baseSnapshotExactVariants[0].reference='11806001';},
  d=>{d.records.find(x=>x.brand==='Bosch').deviceReference='BGL75X1PRQ/23';}
 ]){const d=sample();alter(d);assert.throws(()=>validateDocuments(d));}
});
test('new owner snapshot requires explicit migration rather than silent coverage inflation',()=>{
 const c=structuredClone(catalogSnapshot);c.devices.push({...c.devices[0],id:'synthetic-other-variant',reference:'DIFFERENT'});
 assert.throws(()=>validateDocuments(sample(),c),/block stale projection/);
});
test('unapproved OEM hosts and unsourced observations are rejected',()=>{
 for(const alter of [
  d=>{d.records[0].source.url='https://shop.fake.invalid/fake';d.records[0].supportLink.url='https://shop.fake.invalid/fake';},
  d=>{d.records[0].technicalFacts[0].locator='';},
  d=>{d.records[0].technicalFacts[0].value='890';},
  d=>{d.records[0].source.observedAt='invalid';},
  d=>{d.records[0].source.rawSourceSha256='invented';},
  d=>{d.records[0].source.independentRawAudit=true;}
 ]){const d=sample();alter(d);assert.throws(()=>validateDocuments(d));}
});
test('no media, rights or launch approval may be inferred from publicly accessible page',()=>{
 for(const alter of [
  d=>{d.records[0].source.rights.mediaB2c='granted';},
  d=>{d.records[0].source.rights.factualUse='approved';},
  d=>{d.records[0].source.licenceEvidenceId='fake-id';},
  d=>{d.records[0].media=[{url:'https://www.miele.de/photo.jpg'}];},
  d=>{d.records[0].physicalFitApproved=true;},
  d=>{d.records[0].assessment='supported';}
 ]){const d=sample();alter(d);assert.throws(()=>validateDocuments(d));}
});
test('missing OEM repair steps, safety and tool specifications cannot be invented',()=>{
 for(const alter of [
  d=>{d.records[0].repairInstructions=['replace motor'];},
  d=>{d.records[0].requiredTools=['Torx T9'];},
  d=>{d.records[0].safetySteps=['open mains housing'];},
  d=>{d.records.find(x=>x.brand==='Hoover').maintenanceHints[0].instructionsProvided=true;}
 ]){const d=sample();alter(d);assert.throws(()=>validateDocuments(d));}
});
test('part listing must already be an exact known candidate, never a sibling or fabricated article',()=>{
 for(const alter of [
  d=>{d.records.find(x=>x.brand==='Dyson').partListings[0].partId='dyson-part-not-listed';},
  d=>{d.records.find(x=>x.brand==='Miele').partListings[0].partId='miele-part-13070280';},
  d=>{d.records.find(x=>x.brand==='Dyson').partListings[0].fitment='confirmed';},
  d=>{d.records.find(x=>x.brand==='Dyson').partListings.push(structuredClone(d.records.find(x=>x.brand==='Dyson').partListings[0]));}
 ]){const d=sample();alter(d);assert.throws(()=>validateDocuments(d));}
});

test('unknown metadata keys and asserted serial coverage are rejected, not silently ignored',()=>{
 for(const alter of [
  d=>{d.records[0].verifiedSerialRange='all';},
  d=>{d.records[0].technicalFacts[0].status='independently_verified';},
  d=>{d.records[0].source.rights.usageLicence='granted';},
  d=>{d.records[0].partListings[0].installationApproved=true;},
  d=>{d.records.find(x=>x.brand==='Hoover').maintenanceHints[0].tools=['Torx T8'];},
  d=>{d.records.find(x=>x.brand==='Dyson').supportLink.requiresNoTraining=true;}
 ]){const d=sample();alter(d);assert.throws(()=>validateDocuments(d),/unreviewed field/);}
});
