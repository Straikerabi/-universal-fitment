import {boschObservedParts} from './bosch-extra.js';
import {makeBrandPart} from './brand-products.js';
import {boschModelRecords,boschPartRecords} from './bosch-records.js';
import {partCategory} from './miele-parts.js';
import {boschSupportUrls} from '../core/bosch-identity.js';

const stamp='2026-10-06';
const source=(name,url,note)=>({name,url,note,retrievedAt:stamp,type:'manufacturer',grade:'A',license:'source-linked'});
const byMaterial=new Map();
for(const record of boschPartRecords){
 const key=record.material||record.code,existing=byMaterial.get(key);
 if(existing){existing.codes.push(record.code);existing.modelCodes=[...new Set([...existing.modelCodes,...record.modelCodes])];continue;}
 byMaterial.set(key,{...record,codes:[record.code],modelCodes:[...record.modelCodes]});
}
export const boschPartsCatalog=[...byMaterial.values()].map(r=>{
 const part={id:`bosch-part-${r.material||r.code.toLowerCase()}`,brand:'Bosch',targetBrands:['Bosch'],catalogOrigin:'bosch-accessories',name:`Bosch ${r.name}`,kind:'Original-Zubehör / Ersatz',tier:'oem',sourceUrl:r.url,imageUrl:r.imageUrl,manuals:r.manuals,
  identifiers:[...(r.material?[{type:'material-number',value:r.material}]:[]),...r.codes.map(value=>({type:'manufacturer-article',value})),...(r.ean?[{type:'ean',value:r.ean}]:[])],
  modelIds:r.modelCodes.map(code=>`vac-bosch-model-${code.toLowerCase()}`),candidateModelIds:[],scope:{models:r.modelCodes},
  fitment:{status:'catalog_only',confidence:0,evidence:[source(`Bosch · ${r.code}`,r.url,'Originalartikel im Bosch-Katalog. Den vollständigen E-Nr.-Index und die Eignungsprüfung beim Hersteller vor Bestellung prüfen.')]},offers:[],
  sourceQuote:{partKey:`oem:Bosch:${r.material||r.code}`,merchantId:'bosch-de',merchant:'Bosch',sourceUrl:r.url,price:typeof r.price==='number'?r.price:null,currency:r.currency||'EUR',vatIncluded:typeof r.price==='number'?true:null,priceBasis:'unit',market:'DE',unitLabel:'Eine Verkaufseinheit laut Bosch-Shop',shippingRuleId:'bosch-de',checkedAt:r.checkedAt,stock:r.availability==='https://schema.org/InStock'?'available':r.availability==='https://schema.org/OutOfStock'?'unavailable':'unknown',availabilityText:r.availability==='https://schema.org/InStock'?'Im erfassten Bosch-Shop-Stand bestellbar':r.availability==='https://schema.org/OutOfStock'?'Im erfassten Bosch-Shop-Stand nicht bestellbar':'Bestellbarkeit im Bosch-Shop prüfen',priceNote:'Erfasster Preis der verlinkten Verkaufseinheit; den aktuellen Lieferumfang und Shoppreis vor Bestellung prüfen.',delivery:null}
 };
 return {...part,partCategory:partCategory(part)};
});

// Swirl lists S67 examples and the BGL8SIL family for S73. No broader G-ALL substitution is inferred.
for(const [code,modelPrefix,note] of [
 ['S 67',null,'Swirl nennt u. a. BGL3B110, BGL35MOVE und BSGL32200. Diese Angaben werden nicht auf alle Bosch-G-ALL-Geräte übertragen; zum eigenen Modell im Swirl-Finder prüfen.'],
 ['S 73','BGL8SIL','Swirl nennt Bosch BGL8SIL. Der Suffix und die Halterung am eigenen Gerät müssen geprüft werden; keine pauschale Zuordnung zu allen Bosch-Serie-8-Geräten.']
]){
 const part={id:`bosch-aftermarket-swirl-${code.replace(' ','').toLowerCase()}-anti-geruch`,brand:'Swirl',targetBrands:['Bosch'],name:`Swirl ${code} MicroPor Plus Anti-Geruch · 4 Beutel`,kind:'Staubsaugerbeutel',tier:'aftermarket',catalogOrigin:'aftermarket',sourceUrl:'https://www.swirl.de/de/staubsaugen/staubsaugerbeutel/micropor-plus-anti-geruch-staubsaugerbeutel',
  identifiers:[{type:'supplier-article',value:code}],modelIds:[],candidateModelIds:boschModelRecords.filter(r=>modelPrefix&&r.code.startsWith(modelPrefix)).map(r=>`vac-bosch-model-${r.code.toLowerCase()}`),scope:{models:code==='S 67'?['BGL3B110','BGL35MOVE','BSGL32200']:['BGL8SIL']},
  manuals:[{label:'Swirl · Beutelwechsel mit Bildern',kind:'installation-guide',url:'https://www.swirl.de/de/haushaltstipps/staubsaugerbeutel-wechseln'}],fitment:{status:'catalog_only',confidence:0,evidence:[{...source(`Swirl · ${code}`, 'https://www.swirl.de/de/staubsaugen/staubsaugerbeutel/micropor-plus-anti-geruch-staubsaugerbeutel',note),type:'aftermarket-manufacturer',grade:'B'}]},offers:[]};
 boschPartsCatalog.push({...part,partCategory:partCategory(part)});
}

// Source-linked internal spares remain unassigned until the exact Bosch E-Nr. is observed.
boschPartsCatalog.push(...boschObservedParts.map(r=>({...makeBrandPart(r),partCategory:partCategory(r)})));

export const boschConcreteModels=boschModelRecords.map(r=>{
 const id=`vac-bosch-model-${r.code.toLowerCase()}`;
 const deviceType=r.deviceType,bagSystem=deviceType==='bagged'?(r.accessoryCodes.includes('BBZ41FGALL')?'G ALL':'unbestätigt'):'none';
 const evidence=source(`Bosch · ${r.code}`,r.url,'Modellreferenz, technische Daten, Produktfoto, Geräteanleitungen und modellbezogen gelistetes Zubehör. Der /xx-Geräteindex ist separat zu prüfen.');
 const parts=boschPartsCatalog.filter(p=>p.modelIds.includes(id)).map(part=>({...part,fitment:{status:'variant_check_required',confidence:.8,condition:'Bosch listet dieses Zubehör zur Modellreferenz. Vollständige E-Nr. mit /xx am eigenen Gerät und Eignung im Bosch-Shop prüfen; der Geräteindex wurde hier nicht als passende Variante bestätigt.',evidence:[evidence,...part.fitment.evidence]}}));
 return {id,recordType:'model',category:'vacuum',brand:'Bosch',icon:'🧹',model:r.code,type:r.name,imageUrl:r.imageUrl,
  aliases:[r.name,r.series],identifiers:[{type:'manufacturer-model',value:r.code},...(r.ean?[{type:'ean',value:r.ean}]:[])],accessoryAliases:parts.flatMap(p=>[p.name,...p.identifiers.map(i=>i.value)]),
  dataStatus:'manufacturer-verified',identityScope:'model-reference',vacuumMeta:{series:r.series,color:r.color,deviceType,bagSystem,materialNumber:null,modelName:r.code},
  sources:[evidence],manuals:[...r.manuals,{label:'Bosch Ersatzteilsuche · vollständige E-Nr. nötig',url:boschSupportUrls.parts}],facts:[{label:'Modellreferenz',value:r.code},...r.facts,{label:'E-Nr.-Index /xx',value:'Am Typenschild prüfen; nicht aus der Modellreferenz abgeleitet'},{label:'Datenstand',value:stamp}],equipment:r.equipment||[],controlType:r.controlType||'',
  parts,candidateParts:boschPartsCatalog.filter(p=>p.candidateModelIds.includes(id)).map(p=>({...p,fitment:{...p.fitment,status:'variant_check_required',confidence:.7,condition:'Anbieter nennt die Gerätefamilie. Genaue E-Nr., Halterung und Beutelvariante vor Auswahl prüfen.'}})),stockPlans:[],
  jobs:[{id:`${id}-care`,label:'Gerätepflege nach Anleitung',summary:'Beutel bzw. Behälter, zugängliche Filter und den Luftweg anhand der Geräteanleitung prüfen.',mainPartId:null,dataStatus:'guidance',evidenceNote:'Pflegehilfe; kein bestätigtes Ersatzteil-Kit und keine Anleitung zur Gerätezerlegung.',items:[{id:`${id}-manual`,label:'Offizielle Geräteanleitung öffnen',role:'recommended',required:false,includedWithMain:false,dataStatus:'guidance',reason:'Die Anleitung bestimmt, welche Teile gewechselt oder gewaschen werden dürfen.'}]}],
  issues:[{id:`${id}-suction`,label:'Saugkraft ist schwach',summary:'Beutel oder Behälter, Filter und Luftweg nach Anleitung prüfen.',dataStatus:'guidance',confidence:.7,linkedPartIds:[],steps:[deviceType==='cordless'?'Gerät ausschalten und nach Geräteanleitung sichern.':'Gerät ausschalten und Netzstecker ziehen.','Beutel bzw. Behälterfüllung und zugängliche Luftwege nach Anleitung prüfen.','Filter nur nach den Vorgaben der Geräteanleitung reinigen oder wechseln.']}]};
});
export const boschCatalogStats={modelCount:boschConcreteModels.length,variantCount:0,seriesCount:new Set(boschConcreteModels.map(p=>p.vacuumMeta.series)).size,partCount:boschPartsCatalog.length,retrievedAt:stamp};
