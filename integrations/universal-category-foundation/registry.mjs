/**
 * Internal future device taxonomy. No model records, fitments, licence grants,
 * checkout, release authorization or changes to the vacuum-only v1 engine.
 */
export const TAXONOMY_VERSION='0.3.0';
export const groups=Object.freeze([
  {id:'home-kitchen',label:'Haushalt & Küche'},
  {id:'tools-garden',label:'Elektro- & Gartengeräte'},
  {id:'electronics-it',label:'Elektronik & IT'},
  {id:'robotics-smart-home',label:'Robotik & Smart Home'},
  {id:'machines-industry',label:'Maschinen & Industrie'},
  {id:'vehicles-mobility',label:'Fahrzeuge & Mobilität'},
  {id:'drones-aviation',label:'Drohnen & Flugtechnik'},
  {id:'energy-climate',label:'Energie & Gebäudetechnik'},
  {id:'marine-outdoor',label:'Wasserfahrzeuge & Outdoor'}
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
  humanoidRobot:{
    requiredForCatalog:['manufacturer','model','robotSerialOrSku','hardwareRevision','market','evidence'],
    variantChecks:['joint-generation','actuator-part-no','control-board-revision','sensor-calibration','firmware','serial-range','region','safety-interlocks'],
    safety:['lithium-battery','powered-joints','pinch-crush','autonomous-motion','emergency-stop','qualified-personnel']
  },
  assistantRobot:{
    requiredForCatalog:['manufacturer','model','hardwareRevision','market','evidence'],
    variantChecks:['voice-module','sensor-assembly','camera-microphone','connectivity','firmware','cloud-service-dependency','software-pairing'],
    safety:['lithium-battery','microphone-camera-privacy','autonomous-motion','software-pairing']
  },
  robotCompetition:{
    requiredForCatalog:['manufacturerOrBuilder','chassisId','hardwareRevision','competitionClass','market','evidence'],
    variantChecks:['chassis-revision','controller','drive-platform','battery','safety-interlocks','competition-ruleset'],
    safety:['high-energy-moving-parts','impact-risk','pinch-crush','lithium-battery','lockout-emergency-stop','qualified-personnel']
  },
  roboticsKit:{
    requiredForCatalog:['manufacturer','kitModel','boardRevision','market','evidence'],
    variantChecks:['controller-board','sensor-module','servo-motor','power-supply','firmware','connector-interface'],
    safety:['lithium-battery','pinch-crush','software-pairing']
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
  twoWheeler:{
    requiredForCatalog:['manufacturer','model','modelYearOrTypeNo','market','evidence'],
    variantChecks:['frame-or-type-no','engine-code','market','model-year','brake-type','manufacturer-part-no'],
    safety:['road-safety','braking-system','qualified-personnel']
  },
  micromobility:{
    requiredForCatalog:['manufacturer','model','productOrFrameCode','market','evidence'],
    variantChecks:['frame-revision','motor-controller','brake-system','battery-platform','tyre-size','regional-homologation'],
    safety:['road-safety','braking-system','lithium-battery','qualified-personnel']
  },
  electricVehicle:{
    requiredForCatalog:['manufacturer','model','vehicleOrTypeId','market','evidence'],
    variantChecks:['vin-or-type-id','model-year','drivetrain','battery-pack-generation','bms-hardware','charger-standard','software-version','regional-homologation'],
    safety:['road-safety','high-voltage','lithium-battery','battery-thermal-runaway','qualified-personnel']
  },
  aerialDrone:{
    requiredForCatalog:['manufacturer','airframeModel','hardwareRevision','market','evidence'],
    variantChecks:['airframe-revision','flight-controller-firmware','propeller-spec','battery-part-no','camera-gimbal-revision','radio-region','remote-controller'],
    safety:['flight-critical','rotating-propellers','lithium-battery','flight-regulatory-review','qualified-personnel']
  },
  imaging:{
    requiredForCatalog:['manufacturer','model','hardwareRevisionOrSerial','market','evidence'],
    variantChecks:['camera-body-generation','lens-mount','sensor-revision','firmware','regional-sku','battery-type','interface-spec'],
    safety:['lithium-battery','electricity-esd','optical-laser-safety']
  },
  energySystem:{
    requiredForCatalog:['manufacturer','model','electricalConfiguration','market','evidence'],
    variantChecks:['power-rating','voltage-class','grid-standard','inverter-or-controller-revision','firmware','connector-standard','installation-context'],
    safety:['high-voltage','grid-connected','fire-thermal','qualified-electrician']
  },
  marine:{
    requiredForCatalog:['manufacturer','model','hullOrEngineSerial','market','evidence'],
    variantChecks:['hull-or-engine-series','propulsion','drive-ratio','battery-pack','water-sealing','market'],
    safety:['water-electricity','propeller','water-ingress','marine-safety','qualified-personnel']
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
  c('digital-camera','electronics-it','Digitalkameras','imaging',3,{aliases:['digitalkamera']}),
  c('mirrorless-camera','electronics-it','Systemkameras (spiegellos)','imaging',3,{aliases:['systemkamera','spiegellose-kamera']}),
  c('dslr-camera','electronics-it','Spiegelreflexkameras','imaging',3,{aliases:['spiegelreflexkamera','dslr']}),
  c('action-camera','electronics-it','Actioncams','imaging',3,{aliases:['actioncam','action-cam']}),
  c('video-camera','electronics-it','Videokameras & Camcorder','imaging',3,{aliases:['camcorder','videokamera']}),
  c('camera-360','electronics-it','360-Grad-Kameras','imaging',3,{aliases:['360-grad-kamera']}),
  c('security-camera','electronics-it','Sicherheits- & Überwachungskameras','imaging',3,{aliases:['ueberwachungskamera']}),
  c('thermal-camera','electronics-it','Wärmebildkameras','imaging',3,{aliases:['waermebildkamera']}),
  c('camera-lens','electronics-it','Kameraobjektive','imaging',3,{aliases:['kameraobjektiv']}),
  c('camera-gimbal','electronics-it','Kamera-Gimbals','imaging',3,{aliases:['kamera-stabilisator']}),
  c('webcam','electronics-it','Webcams','imaging',3),
  c('instant-camera','electronics-it','Sofortbildkameras','imaging',3,{aliases:['sofortbildkamera']}),
  c('camera-flash','electronics-it','Blitzgeräte','imaging',3,{aliases:['blitzgeraet']}),
  c('pro-audio','electronics-it','Audio- & Studiotechnik','electronics',3,{aliases:['audioequipment','studiotechnik']}),

  c('smart-speaker','electronics-it','Smarte Lautsprecher & Sprachassistent-Geräte','assistantRobot',3,{aliases:['sprachassistent','smarter-lautsprecher']}),
  c('smart-display','electronics-it','Smarte Displays & Assistenzterminals','assistantRobot',3,{aliases:['smarter-bildschirm']}),

  // Robotics: distinct from ordinary appliance models, even if some parts are similar.
  c('robot-vacuum','robotics-smart-home','Saugroboter','robotic',1,{aliases:['staubsaugerroboter']}),
  c('robot-lawnmower','robotics-smart-home','Mähroboter','robotic',3,{aliases:['maehroboter'],safetyExtra:['rotating-blades']}),
  c('pool-robot','robotics-smart-home','Poolroboter','robotic',3,{safetyExtra:['water-electricity']}),
  c('service-robot','robotics-smart-home','Serviceroboter','robotic',4),
  c('humanoid-robot','robotics-smart-home','Humanoide Roboter','humanoidRobot',4,{aliases:['humanoid','humanoider-roboter','zweibeiniger-roboter']}),
  c('companion-robot','robotics-smart-home','Begleit- & Haushaltsroboter','assistantRobot',3,{aliases:['begleitroboter','haushaltsroboter']}),
  c('ai-assistant-robot','robotics-smart-home','KI-Assistentenroboter','assistantRobot',3,{aliases:['smarter-assistentenroboter','ai-companion-robot']}),
  c('telepresence-robot','robotics-smart-home','Telepräsenzroboter','assistantRobot',3,{aliases:['telepraesenzroboter']}),
  c('educational-robot','robotics-smart-home','Lern- & Bildungsroboter','roboticsKit',3,{aliases:['lernroboter','bildungsroboter']}),
  c('hobby-robot','robotics-smart-home','Hobby- & programmierbare Roboter','roboticsKit',3,{aliases:['hobbyroboter','programmierbarer-roboter']}),
  c('research-robot','robotics-smart-home','Forschungsroboter','humanoidRobot',4,{aliases:['forschungsroboter']}),
  c('mobile-robot','robotics-smart-home','Mobile Universalroboter','robotic',3,{aliases:['mobiler-roboter']}),
  c('combat-sport-robot','robotics-smart-home','Wettkampf- & Kampfroboter (Roboter-Sport)','robotCompetition',4,{
    aliases:['kampfroboter','roboterkampf','battlebot','wettkampfroboter'],
    safetyExtra:['controlled-arena-only','no-weapon-or-harmful-payload-guidance']
  }),
  c('robotics-kit','robotics-smart-home','Robotik-Bausätze & Module','roboticsKit',3,{aliases:['robotik-bausatz']}),

  c('industrial-robot','machines-industry','Industrieroboter','industrial',4),
  // Professional and industrial machinery: never offered as general DIY repair.
  c('workshop-machine','machines-industry','Werkstattmaschinen','industrial',4),
  c('cnc-machine','machines-industry','CNC-Maschinen','industrial',4),
  c('industrial-machine','machines-industry','Industriemaschinen','industrial',4),
  c('compressor','machines-industry','Kompressoren','industrial',4,{safetyExtra:['compressed-air']}),
  c('pump','machines-industry','Pumpen','industrial',4,{safetyExtra:['pressurized-fluid']}),
  c('3d-printer','machines-industry','3D-Drucker','industrial',4,{safetyExtra:['heat-fire']}),
  // Road vehicles and mobility: drivetrain, approvals and exact full variant are always category-specific.
  c('car','vehicles-mobility','PKW','automotive',3,{aliases:['auto','pkw']}),
  c('electric-car','vehicles-mobility','Elektroautos','electricVehicle',3,{aliases:['e-auto','elektroauto']}),
  c('hybrid-car','vehicles-mobility','Hybrid- & Plug-in-Hybrid-PKW','electricVehicle',3,{aliases:['hybridauto','plug-in-hybrid']}),
  c('truck','vehicles-mobility','LKW','automotive',3,{aliases:['lastkraftwagen']}),
  c('electric-truck','vehicles-mobility','Elektro-LKW','electricVehicle',3,{aliases:['e-lkw']}),
  c('light-commercial-vehicle','vehicles-mobility','Transporter & Lieferwagen','automotive',3,{aliases:['transporter','lieferwagen']}),
  c('electric-van','vehicles-mobility','Elektro-Transporter','electricVehicle',3,{aliases:['e-transporter']}),
  c('bus','vehicles-mobility','Busse','automotive',4,{aliases:['linienbus']}),
  c('electric-bus','vehicles-mobility','Elektrobusse','electricVehicle',4,{aliases:['e-bus']}),
  c('motorcycle','vehicles-mobility','Motorräder','twoWheeler',3,{aliases:['motorrad']}),
  c('electric-motorcycle','vehicles-mobility','Elektromotorräder','electricVehicle',3,{aliases:['e-motorrad','elektromotorrad']}),
  c('moped','vehicles-mobility','Mopeds & Mofas','twoWheeler',3,{aliases:['mofa','kleinkraftrad']}),
  c('electric-moped','vehicles-mobility','Elektromopeds','micromobility',3,{aliases:['e-moped']}),
  c('motor-scooter','vehicles-mobility','Motorroller','twoWheeler',3,{aliases:['motorroller','vespa-roller']}),
  c('electric-motor-scooter','vehicles-mobility','Elektromotorroller (mit Sitz)','micromobility',3,{aliases:['e-roller','elektroroller']}),
  c('electric-kick-scooter','vehicles-mobility','Elektrotretroller (E-Scooter)','micromobility',3,{aliases:['e-scooter','elektrotretroller']}),
  c('kick-scooter','vehicles-mobility','Tretroller','micromobility',3,{aliases:['tretroller']}),
  c('bicycle','vehicles-mobility','Fahrräder','micromobility',3,{aliases:['fahrrad']}),
  c('e-bike','vehicles-mobility','E-Bikes & Pedelecs','micromobility',3,{aliases:['pedelec']}),
  c('cargo-bike','vehicles-mobility','Lastenfahrräder','micromobility',3,{aliases:['lastenrad','lastenfahrrad']}),
  c('electric-cargo-bike','vehicles-mobility','E-Lastenräder','micromobility',3,{aliases:['e-lastenrad']}),
  c('electric-unicycle','vehicles-mobility','Elektrische Einräder','micromobility',4,{aliases:['elektrisches-einrad']}),
  c('atv-quad','vehicles-mobility','Quads & ATVs','twoWheeler',4,{aliases:['quad','atv']}),
  c('utility-vehicle','vehicles-mobility','Gelände-Nutzfahrzeuge & UTVs','automotive',4,{aliases:['utv']}),
  c('camper','vehicles-mobility','Wohnmobile','automotive',3,{aliases:['wohnmobil']}),
  c('caravan','vehicles-mobility','Wohnwagen','automotive',3,{aliases:['wohnwagen']}),
  c('trailer','vehicles-mobility','Anhänger','automotive',3,{aliases:['anhaenger']}),
  c('forklift','vehicles-mobility','Gabelstapler','industrial',4,{aliases:['gabelstapler']}),
  c('electric-forklift','vehicles-mobility','Elektrostapler','industrial',4,{aliases:['e-stapler']}),
  c('agricultural-tractor','vehicles-mobility','Traktoren & Landmaschinen','industrial',4,{aliases:['traktor','landmaschine']}),
  c('electric-tractor','vehicles-mobility','Elektrotraktoren','electricVehicle',4,{aliases:['e-traktor']}),
  // Drone families remain grounded to an exact airframe and permitted manufacturer-specified variant.
  c('camera-drone','drones-aviation','Kameradrohnen','aerialDrone',3,{aliases:['kameradrohne','fotodrohne']}),
  c('fpv-drone','drones-aviation','FPV-Drohnen','aerialDrone',3,{aliases:['fpv-drohne']}),
  c('inspection-drone','drones-aviation','Inspektionsdrohnen','aerialDrone',4,{aliases:['inspektionsdrohne']}),
  c('agricultural-drone','drones-aviation','Agrardrohnen','aerialDrone',4,{aliases:['agrardrohne']}),
  c('survey-drone','drones-aviation','Vermessungsdrohnen','aerialDrone',4,{aliases:['vermessungsdrohne']}),
  c('fixed-wing-drone','drones-aviation','Flächenflugzeug-Drohnen','aerialDrone',4),
  c('delivery-drone','drones-aviation','Lieferdrohnen','aerialDrone',4,{aliases:['lieferdrohne']}),
  c('model-aircraft','drones-aviation','Modellflugzeuge','aerialDrone',4,{aliases:['modellflugzeug']}),
  c('drone-controller','drones-aviation','Drohnen-Fernsteuerungen','electronics',3,{aliases:['drohnen-fernsteuerung']}),
  // Independent, qualified-installation energy and building systems.
  c('ev-wallbox','energy-climate','Wallboxen & Ladegeräte für Fahrzeuge','energySystem',3,{aliases:['wallbox','ev-ladestation']}),
  c('charging-station','energy-climate','Öffentliche Ladeeinrichtungen','energySystem',4,{aliases:['schnellladestation']}),
  c('solar-inverter','energy-climate','Solar-Wechselrichter','energySystem',3,{aliases:['wechselrichter']}),
  c('solar-panel','energy-climate','Photovoltaikmodule','energySystem',3,{aliases:['solarmodul']}),
  c('home-battery','energy-climate','Heimspeicher & Batteriesysteme','energySystem',3,{aliases:['heimspeicher']}),
  c('portable-power-station','energy-climate','Tragbare Powerstations','energySystem',3,{aliases:['powerstation']}),
  c('heat-pump','energy-climate','Wärmepumpen','energySystem',3,{aliases:['waermepumpe'],safetyExtra:['refrigerant']}),
  c('air-conditioner','energy-climate','Klimaanlagen','energySystem',3,{aliases:['klimaanlage'],safetyExtra:['refrigerant']}),
  c('heating-boiler','energy-climate','Heizungsanlagen','energySystem',3,{aliases:['heizung'],safetyExtra:['gas-connection']}),
  c('generator','energy-climate','Stromerzeuger','energySystem',4,{aliases:['stromgenerator']}),
  c('ups-power','energy-climate','USV-Anlagen','energySystem',4,{aliases:['usv']}),
  // Watercraft, marine propulsion and related electro-mechanical equipment.
  c('motorboat','marine-outdoor','Motorboote','marine',4,{aliases:['motorboot']}),
  c('electric-boat','marine-outdoor','Elektroboote','marine',4,{aliases:['e-boot']}),
  c('sailboat','marine-outdoor','Segelboote','marine',4,{aliases:['segelboot']}),
  c('outboard-motor','marine-outdoor','Außenbordmotoren','marine',4,{aliases:['aussenbordmotor']}),
  c('electric-outboard','marine-outdoor','Elektrische Außenborder','marine',4,{aliases:['elektro-aussenborder']}),
  c('personal-watercraft','marine-outdoor','Jetskis & Wasserscooter','marine',4,{aliases:['jetski']}),
  c('underwater-rov','marine-outdoor','Unterwasserdrohnen & ROVs','marine',4,{aliases:['unterwasserdrohne','unterwasserroboter']})
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
    schema:'uf-multicategory-foundation/0.3',
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
