import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {categorySummary,categories,groups,safetyProfile,identificationProfiles,validateTaxonomy} from './registry.mjs';
import assert from 'node:assert/strict';

export function report(){
 validateTaxonomy();
 const s=categorySummary();
 assert.equal(s.privatePilotCategories.length,1);
 assert.equal(s.privatePilotCategories[0],'vacuum-cleaner');
 const matrix=groups.map(g=>{
  const items=categories.filter(c=>c.group===g.id);
  return {sector:g.id,label:g.label,privatePilot:items.filter(c=>c.availability==='private-consumer-pilot').length,
    planned:items.filter(c=>c.availability==='planned').length,
    categoryIds:items.map(c=>c.id)};
 });
 return {schema:s.schema,taxonomyVersion:s.taxonomyVersion,
  reportingScope:'PLANNED ARCHITECTURE only, not public or current Consumer data',
  sectors:s.groups,registeredCategoryDefinitions:s.categories,
  currentlyPublishedThroughThisFoundation:0,
  privatePilots:s.privatePilotCategories,
  additionalCategoryDefinitionsOnly:s.plannedCategories,
  actualConsumerDeviceCountsNotChanged:true,
  realFitmentApprovalClaimed:0,
  licenseOrLegalApprovalClaimed:false,
  categoryPolicyRule:'Only vacuum has existing private pilot; future domains remain POLICY_BLOCKED in v1',
  profileCount:Object.keys(identificationProfiles).length,
  representativeHazards:{microwave:safetyProfile('microwave'),industrial:safetyProfile('industrial-machine')},
  matrix
 };
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 console.log(JSON.stringify(report(),null,2));
}
