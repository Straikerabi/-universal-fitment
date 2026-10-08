import {products} from '../data/catalog.js';
const factLabels=['Wattleistung','Gewicht in kg','Gewicht ohne Saugzubehör in kg','Gewicht betriebsbereit in kg','Aktionsradius in m','Kabellänge in m','Kabellänge in cm','Lautstärke in dB','Staubbeutelvolumen in l','Staubbehältervolumen in l','Akkutyp','Nennkapazität Akku in mAh','Ladezeit in min','Laufzeit maximal in min','Laufzeit LOW-Stufe PowerUnit solo','Laufzeit LOW-Stufe mit Elektrozubehör','Laufzeit HIGH-Stufe mit Elektrozubehör'];
export function compareDevices(ids,{catalog=products}={}){
 const list=[...new Set(Array.isArray(ids)?ids.filter(id=>typeof id==='string'):[])];
 if(list.length<2||list.length>4)return null;
 const selected=list.map(id=>catalog.find(p=>p.id===id&&p.recordType==='model'));
 if(selected.some(p=>!p))return null;
 const fact=(p,label)=>p.facts?.find(f=>f.label===label)?.value||'Nicht belegt';
 const rows=[
  {label:'Marke',values:selected.map(p=>p.brand)},
  {label:'Modellreferenz',values:selected.map(p=>p.model)},
  {label:'Geräte-Materialnummer',values:selected.map(p=>p.vacuumMeta.materialNumber||'Nicht belegt')},
  {label:'Geräte-EAN',values:selected.map(p=>p.identifiers.find(i=>i.type==='ean')?.value||'Nicht belegt')},
  {label:'Gerätetyp',values:selected.map(p=>p.identifiers.find(i=>i.type==='product-type')?.value||'Nicht belegt')},
  {label:'Serie',values:selected.map(p=>p.vacuumMeta.series)},
  {label:'Farbe',values:selected.map(p=>p.vacuumMeta.color||'Nicht belegt')},
  {label:'Beutelsystem',values:selected.map(p=>p.vacuumMeta.bagSystem==='none'?'Kein Beutel':p.vacuumMeta.bagSystem)},
  {label:'Saugkraftregulierung',values:selected.map(p=>p.controlType||'Nicht belegt')},
  ...factLabels.filter(label=>selected.some(p=>p.facts?.some(f=>f.label===label))).map(label=>({label,values:selected.map(p=>fact(p,label))})),
  {label:'Hersteller-Ausstattung',values:selected.map(p=>p.equipment?.length?p.equipment.join(' · '):'Nicht belegt')}
 ];
 return {products:selected,rows:rows.map(row=>({...row,different:new Set(row.values).size>1}))};
}
