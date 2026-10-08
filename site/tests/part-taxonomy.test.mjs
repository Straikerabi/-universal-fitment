import assert from 'node:assert/strict';
import {partType,partPurpose,partTypes,isPhysicalPart,partTypeSummary,groupPartsByType} from '../src/data/part-taxonomy.js';
import {filterParts} from '../src/data/miele-parts.js';

const cases=[
 ['Miele Bodendüse SBD 470','nozzle','accessory'],['Rowenta Saugdüse mit einziehbarer Bürste','nozzle','accessory'],
 ['Hoover Staubsaugerbeutel H92','bag','consumable'],['Vorwerk FP7 Premium Filtertüten','bag','consumable'],
 ['Vorwerk MF7 Motorschutzfilter','filter','consumable'],['Bosch Filterrahmen','mechanical','spare'],
 ['Philips Deckel für Staubbehälter','mechanical','spare'],['Miele Laufrolle für SBD 470','mechanical','spare'],
 ['Dyson Akku','battery','spare'],['Dyson Ladegerät','charger','spare'],['Akkuabdeckung','mechanical','spare'],
 ['Motor für Haardüse','electrical','spare'],['Dyson Digital Motorbar Bodendüse','nozzle','accessory'],
 ['Vorwerk EB400 Rundbürste','roller','spare'],['Vorwerk SP7 Saugwischer','nozzle','accessory'],
 ['AEG Advanced 3in1 Kombidüse für Bodenstaubsauger (36mm Ovalrohr)','nozzle','accessory'],
 ['AEG AZE140 PrecisionFlow Düse AeroPro 36 mm Ovalrohr','nozzle','accessory'],
 ['AEG Abschottdichtung, Filter','mechanical','spare'],['AEG Abluftfilterdichtung','mechanical','spare'],
 ['AEG Staubsauger gebogene Enddichtung','mechanical','spare'],['AEG Akku-Staubsauger-Motorschwamm','filter','consumable'],
 ['AEG Abschottdichtung,Handgriff,Rohr','mechanical','spare'],['Dyson Bodenplatte für Elektrobürste','mechanical','spare'],
 ['Dyson Bürstenleiste für Haardüse','roller','spare'],['AEG AZE148 Ersatzrolle','roller','spare'],
 ['Dyson Zubehörhalterung für das Saugrohr','storage','accessory'],['Philips Rohrclip / Schlauch','mechanical','spare'],
 ['AEG Saugrohradapter für Staubsauger','adapter','accessory'],['Siemens Staubbehaelter Cycle-tech','bin','spare'],
 ['Rowenta Staubabscheider und Dichtung','bin','spare'],['Bosch Staubbehälterfilter incl Dichtung','filter','consumable'],
 ['Bosch Tastatur- und Schubladendüse','nozzle','accessory'],['Dyson V11, V15 Akku','battery','spare'],
 ['Dyson V8 mit sternförmigem Filter Akku','battery','spare'],['Rowenta 18,5-V-LITHIUM-IONEN-AKK','battery','spare'],
 ['Philips Set mit 2 Mikrofaserpads','care','consumable'],['Siemens Aufnahme fuer Austauschfilter','mechanical','spare'],
 ['Philips Staubbehälter der Düse','bin','spare'],['Siemens Dämpfer zw.Geblaese u. Adapter','mechanical','spare'],
 ['Siemens Anschlusskabel Leitung f.Steckdose m.Abdeckung','cable','spare'],['AEG Ladestation,Bodenplatte,anthrazit','mechanical','spare'],
 ['AEG ASRK201S KIT WITH 4 X S-BAG','bag','consumable'],['Siemens Halter Sensor-Traeger','mechanical','spare'],
 ['Siemens Gebrauchsanleitung','document','document'],['Siemens Staubsauger VSZ7A400','device','device'],
 ['Unbenannter Herstellerartikel','other','unknown']
];
const parts=cases.map(([name,id,purpose])=>{
 const part={name,kind:'Original-Ersatzteil / Zubehör'};
 assert.equal(partType(part).id,id,name);assert.equal(partPurpose(part).id,purpose,name);
 return part;
});
assert.equal(new Set(partTypes.map(t=>t.id)).size,partTypes.length);
assert.ok(partTypes.every(t=>/^#[a-f\d]{6}$/i.test(t.color)&&t.icon&&t.label));
for(const brand of ['Miele','Bosch','Dyson','AEG','Rowenta','Philips','Siemens','Vorwerk','Samsung','Hoover']){
 for(const [name,id] of cases.slice(0,4))assert.equal(partType({name:brand+' '+name}).color,partTypes.find(t=>t.id===id).color);
}
const accessories=filterParts(parts,{purpose:'accessory'});
assert.ok(accessories.length);assert.ok(accessories.every(p=>partPurpose(p).id==='accessory'));
assert.equal(filterParts(parts,{purpose:'consumable',category:'Filter'}).length,3);
assert.equal(parts.filter(isPhysicalPart).length,parts.length-3,'documents, complete vacuums and unclassified records do not fill a part target');
assert.equal(partTypeSummary(parts).reduce((n,t)=>n+t.count,0),parts.length);
assert.deepEqual(groupPartsByType([]),[],'no empty category panels');
const scopedGroups=groupPartsByType(accessories);
assert.equal(scopedGroups.reduce((n,g)=>n+g.parts.length,0),accessories.length,'every scoped article appears exactly once');
assert.deepEqual(new Set(scopedGroups.flatMap(g=>g.parts)),new Set(accessories),'grouping cannot import parts excluded by a model filter');
for(const group of scopedGroups){
 assert.ok(group.parts.every(part=>partType(part).id===group.id));
 assert.equal(group.color,partTypes.find(type=>type.id===group.id).color,'accordion headings share the article color');
 assert.deepEqual(group.parts,accessories.filter(part=>partType(part).id===group.id),'incoming sort order survives grouping');
}
assert.equal(partType({name:'Opaque OEM code',partTypeId:'tube'}).id,'tube');
assert.equal(partType({name:'Opaque OEM code',partTypeId:'invalid'}).id,'other');
console.log('Part taxonomy passed: shared brand colors, purpose filters, named component boundaries, documents/devices excluded from the physical-part goal.');
