import { mieleModelRecords } from './miele-model-records.js';
import { mieleVacuumProducts as families } from './miele-vacuum.js';
import { extendMieleProduct } from './miele-parts.js';

const retrievedAt='2026-10-06';
const source=(name,url,note)=>({name,url,note,retrievedAt,type:'manufacturer',grade:'A',license:'source-linked'});
const bagCodes={GN:'12421170',FJM:'12421180',TU:'12557060',CO:'12557080'};
const factLabels=['Produkttyp','Gerätefarbe','Staubsaugerbeuteltyp','Staubbeutelvolumen in l','Abluftfilter','Wattleistung','Gewicht in kg','Aktionsradius in m','Kabellänge in m','Lautstärke in dB','Staubbehältervolumen in l','Akkutyp','Nennkapazität Akku in mAh','Ladezeit in min','Laufzeit LOW-Stufe PowerUnit solo','Laufzeit LOW-Stufe mit Elektrozubehör','Laufzeit HIGH-Stufe mit Elektrozubehör'];
const units={'Wattleistung':'W','Gewicht in kg':'kg','Aktionsradius in m':'m','Kabellänge in m':'m','Lautstärke in dB':'dB','Staubbeutelvolumen in l':'l','Staubbehältervolumen in l':'l','Ladezeit in min':'min','Nennkapazität Akku in mAh':'mAh','Laufzeit LOW-Stufe PowerUnit solo':'min','Laufzeit LOW-Stufe mit Elektrozubehör':'min','Laufzeit HIGH-Stufe mit Elektrozubehör':'min'};

function buildModel(record){
  const s=record.specs;
  const series=s['Produktmarke'];
  const family=families.find(p=>p.model===series);
  const bagSystem=s['Staubsaugerbeuteltyp']?.match(/\b(GN|FJM|TU|CO)\b/)?.[1]||'none';
  const deviceType=bagSystem!=='none'?'bagged':s['Akku-Staubsauger']==='TRUE'?'cordless':'bagless';
  const labels={bagged:'Bodenstaubsauger mit Beutel',bagless:'Bodenstaubsauger ohne Beutel',cordless:'Akku-Staubsauger'};
  const productSource=source(`Miele · ${record.model} · ${record.material}`,record.url,'Geräteidentität, technische Daten, Downloads und die modellbezogene Liste optionalen Zubehörs des Herstellers.');
  const id=`vac-miele-model-${record.material}`;
  const parts=record.accessories.map(a=>({
    id:`miele-part-${a.material}`,name:`Miele ${a.model}`,kind:a.kind,tier:'oem',
    identifiers:[{type:'material-number',value:a.material},...(a.ean?[{type:'ean',value:a.ean}]:[])],
    fitment:{status:'manufacturer_listed',confidence:.98,evidence:[productSource,source(`Miele · ${a.model}`,a.url,'Als optionales Zubehör auf der Produktseite dieses konkreten Geräts aufgeführt.')]},
    offers:[]
  }));
  // If the page lists only an XXL pack, the official family mapping still proves the four-pack.
  const bagPart=parts.find(p=>p.identifiers.some(i=>i.type==='material-number'&&i.value===bagCodes[bagSystem]))||family?.parts.find(p=>p.id===`miele-bag-${bagSystem.toLowerCase()}`);
  if(bagPart&&!parts.some(p=>p.id===bagPart.id)) parts.unshift(bagPart);
  const filters=parts.filter(p=>/filter/i.test(p.kind));
  const stockId=`miele-${record.material}-bags`;
  const jobs=[];
  if(bagPart){
    jobs.push({id:`${id}-bag-change`,label:'Staubsaugerbeutel wechseln',summary:`Das Gerät verwendet ${bagSystem}-Beutel.`,mainPartId:bagPart.id,dataStatus:'verified',evidenceNote:`Beutelsystem auf dem Miele-Produktdatenblatt: ${s['Staubsaugerbeuteltyp']}.`,items:[{id:`${id}-bag-main`,label:bagPart.name,role:'required',required:true,includedWithMain:true,dataStatus:'verified',partId:bagPart.id,stockPlanId:stockId,reason:'Beutelsystem auf der Produktseite und Hersteller-Familienzuordnung belegt.'}]});
  }
  if(filters.length){
    jobs.push({id:`${id}-filter-care`,label:'Filter prüfen / pflegen',summary:'Die Gebrauchsanweisung beschreibt, welche Filter gereinigt oder gewechselt werden dürfen.',mainPartId:filters[0].id,dataStatus:'verified',evidenceNote:'Diese Filter stehen in der modellbezogenen Zubehörliste. Wechsel- und Reinigungsschritte in der verlinkten Gebrauchsanweisung prüfen.',items:filters.map((p,i)=>({id:`${id}-filter-${i}`,label:p.name,role:'optional',required:false,includedWithMain:false,dataStatus:'verified',partId:p.id,reason:'Hersteller-Zubehörliste für dieses Modell. Filter nicht ohne Anleitung waschen.'}))});
  }
  if(deviceType!=='bagged'){
    jobs.push({id:`${id}-bin-care`,label:'Staubbehälter und Luftweg prüfen',summary:'Behälter, Düse und Luftweg nach der Gebrauchsanweisung kontrollieren.',mainPartId:null,dataStatus:'guidance',evidenceNote:'Allgemeine Pflegehilfe; konkrete Reinigungsschritte und Trocknungszeiten stehen in der Geräteanleitung.',items:[{id:`${id}-manual`,label:'Geräteanleitung öffnen',role:'recommended',required:false,includedWithMain:false,dataStatus:'guidance',reason:'Waschbare Teile und Lifetime-Filter unterscheiden sich je nach Modell.'}]});
  }
  const steps=[deviceType==='cordless'?'Gerät ausschalten und nach Anleitung gegen unbeabsichtigtes Einschalten sichern.':'Gerät ausschalten und Netzstecker ziehen.',bagPart?'Beutelstand und richtigen Beutelsitz prüfen.':'Staubbehälter nach Gebrauchsanweisung leeren.','Düse, Rohr und Luftweg auf Blockaden kontrollieren.','Filter ausschließlich nach der verlinkten Geräteanleitung reinigen oder wechseln.'];
  return {
    id,recordType:'model',category:'vacuum',icon:'🧹',brand:'Miele',model:record.model,
    imageUrl:record.imageUrl,equipment:record.equipment||[],controlType:s['Elektronische Saugkraftregulierung']||'',
    type:`${labels[deviceType]} · ${s['Gerätefarbe']||''} · Nr. ${record.material}`,
    aliases:[record.alternativeName,series,s['Produkttyp']].filter(Boolean),
    accessoryAliases:parts.flatMap(p=>[p.name,...p.identifiers.map(i=>i.value)]),
    identifiers:[{type:'material-number',value:record.material},{type:'ean',value:record.ean},{type:'product-type',value:s['Produkttyp']}],
    dataStatus:'manufacturer-verified',
    vacuumMeta:{series,bagSystem,deviceType,filterSystem:family?.vacuumMeta.filterSystem||null,color:s['Gerätefarbe'],materialNumber:record.material,modelName:record.model,currentListing:record.currentListing},
    sources:[productSource],manuals:[...record.manuals,...(record.manuals.some(d=>d.label==='Gebrauchsanweisung')?[]:[{label:'Vollständige Gebrauchsanweisung bei Miele suchen',url:'https://www.miele.de/e/manual-finder'}])],
    stockPlans:bagPart?[{id:stockId,label:bagPart.name,unit:'Beutel',defaultStock:2,avgDaysPerUnit:90,leadTimeMinDays:2,leadTimeMaxDays:5,safetyDays:7,supplyRisk:'normal',dataStatus:'guidance',sourceLabel:'Verbrauchsplanung mit Startwert; tatsächlicher Verbrauch wird nach Nutzerbestätigung gelernt. Lieferzeit beim Händler prüfen.'}]:[],
    issues:[{id:`${id}-weak-suction`,label:'Saugkraft ist schwach',summary:'Behälter bzw. Beutel, Filter und Luftweg systematisch prüfen.',steps,linkedPartIds:bagPart?[bagPart.id]:[],confidence:.78,dataStatus:'guidance'}],
    jobs,parts,
    facts:[{label:'Modell',value:record.model},{label:'Material-Nr. Gerät',value:record.material},{label:'EAN Gerät',value:record.ean},...factLabels.filter(label=>s[label]).map(label=>({label,value:`${s[label]}${units[label]?` ${units[label]}`:''}`})),{label:'Datenstand',value:retrievedAt}]
  };
}

export const mieleConcreteModels=mieleModelRecords.map(record=>extendMieleProduct(buildModel(record)));
export const mieleFamilyFallbacks=families.map(p=>extendMieleProduct({...p,recordType:'family',type:`Familienzuordnung · ${p.type}`,vacuumMeta:{...p.vacuumMeta,series:p.model},accessoryAliases:p.parts.flatMap(part=>part.identifiers.map(i=>i.value))}));
export const mieleCatalogStats={
  modelCount:new Set(mieleConcreteModels.map(p=>p.model)).size,
  variantCount:mieleConcreteModels.length,
  familyCount:mieleFamilyFallbacks.length,
  seriesCount:new Set(mieleConcreteModels.map(p=>p.vacuumMeta.series)).size,
  retrievedAt
};
export const mieleSeries=[...new Set(mieleConcreteModels.map(p=>p.vacuumMeta.series))].sort((a,b)=>a.localeCompare(b,'de'));

export function filterMieleCatalog({series='all',bagSystem='all',deviceType='all',sort='relevance'}={}){
  let list=mieleConcreteModels.filter(p=>(series==='all'||p.vacuumMeta.series===series)&&(bagSystem==='all'||p.vacuumMeta.bagSystem===bagSystem)&&(deviceType==='all'||p.vacuumMeta.deviceType===deviceType));
  if(sort==='series') list.sort((a,b)=>a.model.localeCompare(b.model,'de')||a.type.localeCompare(b.type,'de'));
  if(sort==='parts') list.sort((a,b)=>b.parts.length-a.parts.length);
  return list;
}
