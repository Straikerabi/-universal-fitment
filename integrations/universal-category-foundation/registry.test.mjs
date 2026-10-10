import test from 'node:test';
import assert from 'node:assert/strict';
import {groups,categories,identificationProfiles,validateTaxonomy,resolveCategory,safetyProfile,categorySummary} from './registry.mjs';
import {assessFitment} from '../fitment-engine-v1-poc/contract.mjs';
import {realCatalogUnknownRequest} from '../fitment-engine-v1-poc/fixtures.mjs';

test('the registry covers all requested sectors and real leaf-category groups',()=>{
 assert.equal(groups.length,9);
 assert.ok(categories.length>=100);
 for(const id of ['vacuum-cleaner','washing-machine','tumble-dryer','oven','cooktop','coffee-machine',
   'cordless-drill','game-console','television','desktop-pc','laptop','smartphone','robot-vacuum',
   'robot-lawnmower','humanoid-robot','companion-robot','ai-assistant-robot','smart-speaker','smart-display','combat-sport-robot','educational-robot','hobby-robot','telepresence-robot','research-robot','robotics-kit','mobile-robot','industrial-machine','cnc-machine','industrial-robot','3d-printer','car','electric-car','hybrid-car','truck','electric-truck','motorcycle','electric-motorcycle','moped','electric-moped','motor-scooter','electric-motor-scooter','electric-kick-scooter','e-bike','electric-cargo-bike','camper','forklift','agricultural-tractor','camera-drone','fpv-drone','inspection-drone','agricultural-drone','drone-controller','digital-camera','mirrorless-camera','dslr-camera','action-camera','security-camera','thermal-camera','camera-lens','ev-wallbox','home-battery','solar-inverter','heat-pump','motorboat','electric-boat','underwater-rov']){
  assert.ok(resolveCategory(id),id);
 }
 for(const group of groups)assert.ok(categories.some(c=>c.group===group.id));
});
test('only vacuum is a private pilot; no future category claims it is published or engine-approved',()=>{
 assert.equal(validateTaxonomy(),true);
 const summary=categorySummary();
 assert.deepEqual(summary.privatePilotCategories,['vacuum-cleaner']);
 assert.equal(summary.plannedCategories,categories.length-1);
 assert.equal(summary.livePublishedCategoriesClaimed,0);
 assert.equal(summary.fitmentDomainGuard,'all non-vacuum domain policies not authorized');
 for(const x of categories.filter(c=>c.id!=='vacuum-cleaner')){
  assert.equal(x.availability,'planned');
  assert.equal(x.fitmentEngineCategory,null);
  assert.equal(x.fitmentPolicy,'not-authorized');
 }
});
test('spelling aliases resolve to one canonical category, not a guessed sibling device',()=>{
 for(const [a,b] of [['Trockner','tumble-dryer'],['Waschmaschine','washing-machine'],['Geschirrspüler','dishwasher'],['Spuelmaschine','dishwasher'],['Mähroboter','robot-lawnmower'],['Handy','smartphone'],['TV','television'],['Akkuschrauber','cordless-drill'],['Humanoid','humanoid-robot'],['Kampfroboter','combat-sport-robot'],['Sprachassistent','smart-speaker'],['Begleitroboter','companion-robot'],['Lernroboter','educational-robot'],['Telepräsenzroboter','telepresence-robot'],['KFZ','car'],['LKW','truck'],['E-LKW','electric-truck'],['Moped','moped'],['Mofa','moped'],['Motorroller','motor-scooter'],['E-Roller','electric-motor-scooter'],['E-Scooter','electric-kick-scooter'],['E-Bike','e-bike'],['Pedelec','e-bike'],['Motorrad','motorcycle'],['E-Motorrad','electric-motorcycle'],['Kameradrohne','camera-drone'],['FPV-Drohne','fpv-drone'],['Spiegelreflexkamera','dslr-camera'],['Wärmebildkamera','thermal-camera'],['Wallbox','ev-wallbox'],['Elektroboot','electric-boat']]){
  assert.equal(resolveCategory(a).id,b);
 }
 assert.equal(resolveCategory('absolutely unknown device'),null);
 assert.equal(resolveCategory('IndustrieStaubsauger/99'),null);
});
test('domain-specific identifier and hazard profiles are not default low-risk fitment approvals',()=>{
 assert.ok(identificationProfiles.automotive.variantChecks.includes('vin'));
 assert.ok(identificationProfiles.automotive.variantChecks.includes('kba'));
 assert.ok(identificationProfiles.electricVehicle.variantChecks.includes('bms-hardware'));
 assert.ok(identificationProfiles.micromobility.variantChecks.includes('regional-homologation'));
 assert.ok(identificationProfiles.aerialDrone.variantChecks.includes('flight-controller-firmware'));
 assert.ok(identificationProfiles.imaging.variantChecks.includes('lens-mount'));
 assert.ok(identificationProfiles.energySystem.variantChecks.includes('grid-standard'));
 assert.ok(identificationProfiles.marine.variantChecks.includes('hull-or-engine-series'));
 assert.ok(safetyProfile('e-lkw').includes('high-voltage'));
 assert.ok(safetyProfile('kameradrohne').includes('flight-critical'));
 assert.ok(safetyProfile('fpv-drohne').includes('rotating-propellers'));
 assert.ok(safetyProfile('waermepumpe').includes('refrigerant'));
 assert.ok(safetyProfile('wallbox').includes('qualified-electrician'));
 assert.ok(safetyProfile('motorboot').includes('marine-safety'));
 assert.ok(safetyProfile('moped').includes('braking-system'));
 assert.ok(safetyProfile('microwave').includes('high-voltage-capacitor'));
 assert.ok(safetyProfile('cooktop').includes('gas-connection'));
 assert.ok(safetyProfile('refrigerator').includes('refrigerant'));
 assert.ok(safetyProfile('pool-robot').includes('water-electricity'));
 assert.ok(safetyProfile('industrial-machine').includes('qualified-personnel'));
 assert.ok(safetyProfile('smartphone').includes('software-pairing'));
 assert.ok(safetyProfile('humanoid').includes('emergency-stop'));
 assert.ok(safetyProfile('kampfroboter').includes('controlled-arena-only'));
 assert.ok(safetyProfile('sprachassistent').includes('microphone-camera-privacy'));
 assert.ok(identificationProfiles.humanoidRobot.variantChecks.includes('joint-generation'));
 assert.ok(identificationProfiles.robotCompetition.variantChecks.includes('competition-ruleset'));
 assert.ok(identificationProfiles.assistantRobot.variantChecks.includes('cloud-service-dependency'));
 assert.ok(identificationProfiles.roboticsKit.variantChecks.includes('servo-motor'));
 assert.equal(safetyProfile('unlisted-device'),null);
});
test('schema rejects alias collision, duplicate leaf, fabricated launch and unauthorized non-vacuum policy',()=>{
 const copy=()=>categories.map(x=>({...x,aliases:[...(x.aliases||[])]}));
 const dup=copy();dup.push({...dup[0]});assert.throws(()=>validateTaxonomy(groups,dup),/collision/);
 const ambiguous=copy();ambiguous[1].aliases.push('Trockner');assert.throws(()=>validateTaxonomy(groups,ambiguous),/alias collision/);
 const fake=copy();fake[2].availability='private-consumer-pilot';assert.throws(()=>validateTaxonomy(groups,fake),/unauthorized/);
 const unsafe=copy();unsafe[3].fitmentEngineCategory='vacuum';assert.throws(()=>validateTaxonomy(groups,unsafe),/unauthorized/);
 const orphan=copy();orphan[4].group='invented';assert.throws(()=>validateTaxonomy(groups,orphan),/orphan/);
});
test('the existing shared fitment v1 engine remains fail-closed on real future categories',()=>{
 for(const category of ['washing-machine','robot-vacuum','laptop','smartphone','humanoid-robot','combat-sport-robot','smart-speaker','industrial-machine','car','truck','electric-motorcycle','electric-kick-scooter','camera-drone','fpv-drone','digital-camera','ev-wallbox','electric-boat']){
  const req=realCatalogUnknownRequest();
  req.asset.category=category;
  const out=assessFitment(req);
  assert.equal(out.status,'unconfirmed');
  assert.equal(out.canConfirmFitment,false);
  assert.equal(out.canConfirmPurchase,false);
  assert.ok(out.reasons.includes('POLICY_BLOCKED'),category);
 }
 const unchanged=assessFitment(realCatalogUnknownRequest());
 assert.equal(unchanged.status,'unconfirmed');
 assert.equal(unchanged.canConfirmFitment,false);
});
