/**
 * Internal future device taxonomy. No model records, fitments, licence grants,
 * checkout, release authorization or changes to the vacuum-only v1 engine.
 */
export const TAXONOMY_VERSION='0.1.0';
export const groups=Object.freeze([
  {id:'home-kitchen',label:'Haushalt & Küche'},
  {id:'tools-garden',label:'Elektro- & Gartengeräte'},
  {id:'electronics-it',label:'Elektronik & IT'},
  {id:'robotics-smart-home',label:'Robotik & Smart Home'},
  {id:'machines-industry',label:'Maschinen & Industrie'},
  {id:'vehicles-mobility',label:'Fahrzeuge & Mobilität'}
]);
export const identificationProfiles=Object.freeze({
  household:{
    requiredForCatalog:['manufacturer','model','manufacturerModelIdentifier','market','evidence'],
    variantChecks:['model-suffix','manufacturer-part-no','serial-range','region'],
    safety:['mains-voltage']
  },
  applianceHeat:{
    requiredForCatalog:['manufacturer','model','manufacturerModelIdentifier','market','evidence'],
    variantChecks:['production-index','model-suffix','electrical-connection','fuel'],
    safety:['mains-voltage','heat-fire']
  },
  robotic:{
    requiredForCatalog:['manufacturer','model','hardwareRevision','market','evidence'],
    variantChecks:['hardware-revision','battery-platform','region','firmware'],
    safety:['lithium-battery','automated-motion']
  },
  powerTool:{
    requiredForCatalog:['manufacturer','model','typeNo','market','evidence'],
    variantChecks:['type-no','battery-platform','generation','attachment-interface'],
    safety:['rotating-blades','high-torque','lithium-battery']
  },
  electronics:{
    requiredForCatalog:['manufacturer','model','hardwareRevision','market','evidence'],
    variantChecks:['board-revision','model-generation','regional-sku','software-pairing'],
    safety:['electricity-esd','lithium-battery','software-pairing']
  },
  industrial:{
    requiredForCatalog:['manufacturer','model','machineTypeNo','market','evidence'],
    variantChecks:['serial-range','machine-revision','motor-voltage','safety-system'],
    safety:['industrial-energy','moving-machinery','qualified-personnel']
  },
  automotive:{
    requiredForCatalog:['manufacturer','model','vehicleVariant','market','evidence'],
    variantChecks:['vin','kba','pr-code','engine-code','model-year'],
    safety:['road-safety','qualified-personnel']
  }
});
const c=(id,group,label,profile,phase,extra={})=>({
  id,group,label,profile,phase,
  availability:'planned',
  fitmentPolicy:'not-authorized',
  fitmentEngineCategory:null,
  ...extra
});
export const categories=Object.freeze([
  // Stage zero: this is the ONLY category that currently has a working private Consumer snapshot.
  c('vacuum-cleaner','home-kitchen','Staubsauger','household',0,{
    availability:'private-consumer-pilot',
    fitmentPolicy:'vacuum-v1-review-only',
    fitmentEngineCategory:'vacuum',
    aliases:['bodenstaubsauger','akkustaubsauger','staubsauger']
  }),
  // Home / kitchen: first cross-domain device pilots.
  c('washing-machine','home-kitchen','Waschmaschinen','household',1,{aliases:['waschmaschine']}),
  c('tumble-dryer','home-kitchen','Wäschetrockner','household',1,{aliases:['trockner','waeschetrockner']}),
  c('washer-dryer','home-kitchen','Waschtrockner','household',1),
  c('dishwasher','home-kitchen','Geschirrspüler','household',1,{aliases:['spuelmaschine','geschirrspueler']}),
  c('coffee-machine','home-kitchen','Kaffeemaschinen','household',2,{aliases:['kaffeevollautomat']}),
  c('refrigerator','home-kitchen','Kühlschränke','household',2,{aliases:['kuehlschrank'],safetyExtra:['refrigerant']}),
  c('freezer','home-kitchen','Gefriergeräte','household',2,{safetyExtra:['refrigerant']}),
  c('oven','home-kitchen','Backöfen','applianceHeat',2,{aliases:['backofen']}),
  c('cooktop','home-kitchen','Kochfelder & Herde','applianceHeat',2,{aliases:['herd','induktionskochfeld'],safetyExtra:['gas-connection']}),
  c('range-hood','home-kitchen','Dunstabzugshauben','household',2),
  c('microwave','home-kitchen','Mikrowellen','applianceHeat',2,{safetyExtra:['high-voltage-capacitor']}),
  c('air-fryer','home-kitchen','Heißluftfritteusen','applianceHeat',2,{aliases:['airfryer']}),
  c('food-processor','home-kitchen','Küchenmaschinen & Mixer','household',2,{safetyExtra:['rotating-blades']}),
  // Power tools and gardens.
  c('cordless-drill','tools-garden','Bohrmaschinen & Akkuschrauber','powerTool',2,{aliases:['akkuschrauber','bohrmaschine']}),
  c('electric-saw','tools-garden','Elektrische Sägen','powerTool',2),
  c('angle-grinder','tools-garden','Winkelschleifer','powerTool',2),
  c('sander','tools-garden','Schleifer','powerTool',2),
  c('rotary-hammer','tools-garden','Bohrhämmer','powerTool',2),
  c('pressure-washer','tools-garden','Hochdruckreiniger','powerTool',2,{safetyExtra:['pressurized-water']}),
  c('lawn-mower','tools-garden','Rasenmäher','powerTool',3),
  // Consumer electronics and IT.
  c('game-console','electronics-it','Spielkonsolen','electronics',3,{aliases:['konsole','gaming-console']}),
  c('desktop-pc','electronics-it','Desktop-PCs','electronics',3,{aliases:['pc','computer']}),
  c('laptop','electronics-it','Laptops & Notebooks','electronics',3,{aliases:['notebook']}),
  c('smartphone','electronics-it','Smartphones & Handys','electronics',3,{aliases:['handy','mobiltelefon']}),
  c('tablet','electronics-it','Tablets','electronics',3),
  c('television','electronics-it','Fernseher & TVs','electronics',3,{aliases:['tv','fernseher'],safetyExtra:['high-voltage-capacitor']}),
  c('monitor','electronics-it','Monitore','electronics',3),
  c('printer','electronics-it','Drucker','electronics',3),
  c('network-device','electronics-it','Router & Netzwerkgeräte','electronics',3),
  // Robotics: distinct from ordinary appliance models, even if some parts are similar.
  c('robot-vacuum','robotics-smart-home','Saugroboter','robotic',1,{aliases:['staubsaugerroboter']}),
  c('robot-lawnmower','robotics-smart-home','Mähroboter','robotic',3,{aliases:['maehroboter'],safetyExtra:['rotating-blades']}),
  c('pool-robot','robotics-smart-home','Poolroboter','robotic',3,{safetyExtra:['water-electricity']}),
  c('service-robot','robotics-smart-home','Serviceroboter','robotic',4),
  c('industrial-robot','machines-industry','Industrieroboter','industrial',4),
  // Professional and industrial machinery: never offered as general DIY repair.
  c('workshop-machine','machines-industry','Werkstattmaschinen','industrial',4),
  c('cnc-machine','machines-industry','CNC-Maschinen','industrial',4),
  c('industrial-machine','machines-industry','Industriemaschinen','industrial',4),
  c('compressor','machines-industry','Kompressoren','industrial',4,{safetyExtra:['compressed-air']}),
  c('pump','machines-industry','Pumpen','industrial',4,{safetyExtra:['pressurized-fluid']}),
  c('3d-printer','machines-industry','3D-Drucker','industrial',4,{safetyExtra:['heat-fire']}),
  // Additional expansion domain, explicitly planned only.
  c('car','vehicles-mobility','PKW','automotive',4,{aliases:['auto']}),
  c('motorcycle','vehicles-mobility','Motorräder','automotive',4),
  c('e-bike','vehicles-mobility','E-Bikes','automotive',4,{safetyExtra:['lithium-battery']})
]);

export const index=Object.freeze(Object.fromEntries(categories.map(x=>[x.id,x])));
export const normalizeTerm=s=>typeof s==='string'
  ? s.trim().toLocaleLowerCase('de-DE').replaceAll('ä','ae').replaceAll('ö','oe').replaceAll('ü','ue').replaceAll('ß','ss').replace(/[\s_]+/g,'-')
  : '';
const aliases=new Map();
export function validateTaxonomy(groupsArg=groups,categoriesArg=categories){
  const fail=reason=>{throw new Error('TAXONOMY_INVALID:'+reason);};
  const g=new Set();
  for(const v of groupsArg){if(!v.id||!v.label||g.has(v.id))fail('duplicate/empty group');g.add(v.id);}
  const ids=new Set(),keys=new Set(),profileIds=new Set(Object.keys(identificationProfiles));
  for(const v of categoriesArg){
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.id)||ids.has(v.id))fail('category id collision');
    ids.add(v.id);
    if(!g.has(v.group)||!v.label||!profileIds.has(v.profile))fail('orphan/missing category data');
    if(!Number.isInteger(v.phase)||v.phase<0||v.phase>4)fail('phase');
    if(!['planned','private-consumer-pilot'].includes(v.availability))fail('availability');
    if(v.id==='vacuum-cleaner'){
      if(v.availability!=='private-consumer-pilot'||v.fitmentEngineCategory!=='vacuum'||v.fitmentPolicy!=='vacuum-v1-review-only')fail('vacuum guard');
    } else if(v.availability!=='planned'||v.fitmentEngineCategory!==null||v.fitmentPolicy!=='not-authorized')fail('new-domain unauthorized');
    for(const term of [v.id,...(v.aliases||[])]){
      const key=normalizeTerm(term);
      if(!key||keys.has(key))fail('alias collision '+key);
      keys.add(key);
    }
  }
  if(ids.size<35)fail('category regression');
  return true;
}
validateTaxonomy();
for(const row of categories)for(const s of [row.id,...(row.aliases||[])])aliases.set(normalizeTerm(s),row.id);
export function resolveCategory(term){
  const id=aliases.get(normalizeTerm(term));
  return id?index[id]:null;  // Unknown != guess nearest sibling.
}
export function safetyProfile(categoryOrAlias){
  const cat=resolveCategory(categoryOrAlias);
  if(!cat)return null;
  return Object.freeze([...new Set([...identificationProfiles[cat.profile].safety,...(cat.safetyExtra||[])])]);
}
export function categorySummary(){
  const byGroup=Object.fromEntries(groups.map(g=>[g.id,{planned:0,privatePilot:0}]));
  for(const cat of categories)byGroup[cat.group][cat.availability==='planned'?'planned':'privatePilot']++;
  return {
    schema:'uf-multicategory-foundation/0.1',
    taxonomyVersion:TAXONOMY_VERSION,
    groups:groups.length,
    categories:categories.length,
    privatePilotCategories:categories.filter(c=>c.availability==='private-consumer-pilot').map(c=>c.id),
    plannedCategories:categories.filter(c=>c.availability==='planned').length,
    livePublishedCategoriesClaimed:0,
    fitmentDomainGuard:'all non-vacuum domain policies not authorized',
    byGroup
  };
}
