import { mieleVacuumCategory, mieleVacuumScenarios } from './miele-vacuum.js';
import { mieleConcreteModels, mieleFamilyFallbacks } from './miele-models.js';
import { collectMieleParts } from './miele-parts.js';
import {boschConcreteModels,boschPartsCatalog,boschCatalogStats} from './bosch-vacuum.js';
import {brandIndex,brandManifest} from './brand-index.js';
import {makeBrandDevice,makeBrandPart,attachBrandParts} from './brand-products.js';
import {deviceBudgetBand} from './catalog-plan.js';
import {partCategory} from './miele-parts.js';
import {isPhysicalPart} from './part-taxonomy.js';
import {applyHooverFitment} from './hoover-fitment.js';
export { mieleCatalogStats, mieleSeries, filterMieleCatalog } from './miele-models.js';
export {boschCatalogStats,boschPartsCatalog};

export const categories=[mieleVacuumCategory];
export const products=[...mieleConcreteModels,...mieleFamilyFallbacks,...boschConcreteModels,...brandIndex.map(r=>makeBrandDevice(r,{index:true}))];
export const mielePartsCatalog=collectMieleParts([...mieleConcreteModels,...mieleFamilyFallbacks]);
export const partsCatalog=[...mielePartsCatalog,...boschPartsCatalog];
export const catalogBrands=['Miele','Bosch','Dyson','AEG','Rowenta','Philips','Siemens','Samsung','Hoover','Vorwerk'];
export const optionalCatalogBrands=[...new Set(brandIndex.map(r=>r.brand))];
export {brandManifest};
export function registerCatalogPack(pack){
 pack=applyHooverFitment(pack);
 const expected=products.filter(p=>p.catalogPack===pack.brand),byId=new Map(expected.map(p=>[p.id,p]));
 if(!expected.length||!Array.isArray(pack.models)||!Array.isArray(pack.parts))throw Error('Ungültiger Markenkatalog.');
 if(expected.every(p=>p.catalogLoaded))return;
 const next=pack.models.map(r=>makeBrandDevice(r));
 if(next.length!==expected.length||new Set(next.map(p=>p.id)).size!==expected.length||next.some(p=>!byId.has(p.id)||byId.get(p.id).brand!==p.brand||byId.get(p.id).model!==p.model))throw Error('Der Markenkatalog stimmt nicht mit dem Modellverzeichnis überein.');
 const nextParts=pack.parts.map(r=>({...makeBrandPart(r),partCategory:partCategory(r)}));
 if(new Set(nextParts.map(p=>p.id)).size!==nextParts.length||nextParts.some(p=>p.brand!==pack.brand||p.modelIds.some(id=>!byId.has(id))))throw Error('Ungültige Teilezuordnung im Markenkatalog.');
 for(const p of next)attachBrandParts(p,nextParts);
 // Mutate existing device objects so saved-device and backup references remain valid.
 for(const p of next)Object.assign(byId.get(p.id),p);
 partsCatalog.push(...nextParts);
}
export function catalogCoverage(){
 return catalogBrands.map(brand=>{
  const devices=products.filter(p=>p.brand===brand&&p.recordType==='model');
  const manifest=brandManifest[brand];
  const hasPhysicalParts=p=>(p.catalogLoaded===false?p.physicalPartCount:p.parts.filter(isPhysicalPart).length)>0;
  const articleParts=partsCatalog.filter(p=>(p.targetBrands||[p.brand||'Miele']).includes(brand));
  return {brand,models:new Set(devices.map(p=>p.model)).size,records:devices.length,recordsWithParts:devices.filter(hasPhysicalParts).length,recordsWithoutParts:devices.filter(p=>!hasPhysicalParts(p)).length,physicalParts:manifest?.physicalPartCount??articleParts.filter(isPhysicalPart).length,parts:manifest?.partCount??articleParts.length,loaded:devices.every(p=>p.catalogLoaded!==false),manuals:manifest?.manualCount??devices.filter(p=>p.manuals?.some(m=>m.label==='Gebrauchsanweisung')).length,identity:brand==='Miele'?'Materialnummer / Gerätetyp':['Bosch','Siemens'].includes(brand)?'E-Nr. mit /xx':brand==='AEG'?'Vollständige PNC':brand==='Rowenta'?'Ref. Nr. mit /xxx':brand==='Philips'?'Modellnummer mit /xx':brand==='Vorwerk'?'VK / VT / VB · Vorsatztyp separat':brand==='Samsung'?'Vollständiger Modellcode mit /Länderkennung':brand==='Hoover'?'Modell + 8-stelliger Produktcode':'Dyson-Produktnummer und Generation',note:manifest?.note||'Katalog erweitert; weitere Baugruppen und Ausführungen offen.'};
 });
}
export const catalogSeries=[...new Set(products.map(p=>p.vacuumMeta?.series).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));
export const catalogStats={modelCount:new Set(products.filter(p=>p.recordType==='model').map(p=>`${p.brand}:${p.model}`)).size,recordCount:products.filter(p=>p.recordType==='model').length,retrievedAt:'2026-10-07'};
export function filterCatalog({brand='all',series='all',bagSystem='all',deviceType='all',budget='all',partCoverage='all',sort='relevance'}={}){
 const list=products.filter(p=>p.recordType==='model'&&(brand==='all'||p.brand===brand)&&(series==='all'||p.vacuumMeta.series===series)&&(bagSystem==='all'||p.vacuumMeta.bagSystem===bagSystem)&&(deviceType==='all'||p.vacuumMeta.deviceType===deviceType)&&(budget==='all'||deviceBudgetBand(p)===budget)&&(partCoverage==='all'||(partCoverage==='missing'?!(p.catalogLoaded===false?p.physicalPartCount:p.parts.filter(isPhysicalPart).length):(p.catalogLoaded===false?p.physicalPartCount:p.parts.filter(isPhysicalPart).length)>0)));
 if(sort==='price')list.sort((a,b)=>(a.deviceQuote?.price??Infinity)-(b.deviceQuote?.price??Infinity));
 if(sort==='series')list.sort((a,b)=>`${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`,'de'));
 if(sort==='parts')list.sort((a,b)=>(b.catalogLoaded===false?b.partCount:b.parts.length)-(a.catalogLoaded===false?a.partCount:a.parts.length));
 return list;
}
export const scenarios=[{label:'Vorwerk Kobold VK7',query:'VK7',productId:'vac-vorwerk-model-vk7'},{label:'Rowenta RO2913 · günstig',query:'RO2913',productId:'vac-rowenta-model-ro2913'},{label:'Dyson V15 Detect',query:'369535-01',productId:'vac-dyson-model-369535-01'},{label:'AEG AL61A4UG',query:'AL61A4UG',productId:'vac-aeg-model-al61a4ug'},{label:'Bosch BGB6MPOW',query:'BGB6MPOW',productId:'vac-bosch-model-bgb6mpow'},{label:'Bosch Unlimited 6',query:'BBS611BSC',productId:'vac-bosch-model-bbs611bsc'},{label:'Guard M1 Cat & Dog',query:'12560300',productId:'vac-miele-model-12560300'},{label:'Triflex HX3',query:'12887840',productId:'vac-miele-model-12887840'},{label:'Boost CX1',query:'11602450',productId:'vac-miele-model-11602450'},...mieleVacuumScenarios.slice(0,3)];
