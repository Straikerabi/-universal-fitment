// Generated evidence-backed additions. Legacy articles/relationships are append-only.
const additions=__ADDITIONS__;
const links=__RELATIONSHIPS__;
const key=r=>JSON.stringify([r.code,r.reference,r.productCode||null,r.sourceMarket||null]);
export function applyPartsFitmentWave3(pack){
 if(!Object.hasOwn(additions,pack.brand))return pack;
 const parts=pack.parts.map(p=>({...p,relationships:[...(p.relationships||[])]}));
 for(const record of additions[pack.brand]){
  const existing=parts.find(p=>p.code===record.code);
  if(existing){
   if(existing.partsFitmentWave3!==true)throw Error('Conflicting Wave 3 article '+record.code);
  }else parts.push(structuredClone(record));
 }
 for(const update of links[pack.brand]){
  const part=parts.find(p=>p.code===update.partCode);
  if(!part)throw Error('Wave 3 article missing: '+update.partCode);
  const known=new Set(part.relationships.map(key));
  for(const r of update.relationships)if(!known.has(key(r))){part.relationships.push({...r,conditions:[...r.conditions]});known.add(key(r));}
  part.sourceCoverage={...part.sourceCoverage,wave3:{checkedAt:'2026-10-09',status:'partial',references:update.relationships.map(r=>r.reference),regions:[...new Set(update.relationships.map(r=>r.sourceMarket))],note:'Explizite Modell-/Produktcodeliste, keine pauschale technische Freigabe; Länderkennung, Revision, Anschluss und Serienbereich bleiben prüfpflichtig.'}};
 }
 const models=pack.models.map(m=>{
  if(!links[pack.brand].some(p=>p.relationships.some(r=>r.code===m.code)))return m;
  const count=parts.filter(p=>p.relationships.some(r=>r.code===m.code)).length;
  return {...m,partCount:count,physicalPartCount:count,partListCoverage:{...m.partListCoverage,status:'partial',note:count+' ausgewählte Originalartikel aus exakten Hersteller-/Service-Modelllisten. Keine vollständige Teileliste oder Freigabe anderer Länder-/Serien-/Revisionsausführungen; keine Preis- oder Verfügbarkeitsannahme.'}};
 });
 return {...pack,models,parts};
}
