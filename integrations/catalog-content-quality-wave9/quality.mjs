// Wave9 read-only catalog gap audit; no source file writes.
import {readFileSync,writeFileSync} from 'node:fs';
import {catalogSnapshot} from '../consumer-repair-mission-poc/catalog-snapshot.mjs';
const observations=JSON.parse(readFileSync('integrations/catalog-oem-passports-wave8/observations.json','utf8'));
export const compareVariant=function compareVariant(a,b){
 for(const k of ['id','brand','reference','market','productCode'])if((a[k]??null)!==(b[k]??null))throw Error('different '+k);
 for(const key of ['e-number','pnc','manufacturer-model','material-number','product-type','device-sku']){
  const v=x=>(x.identifiers||[]).filter(y=>y.type===key).map(y=>y.value);
  if(JSON.stringify(v(a))!==JSON.stringify(v(b)))throw Error('different '+key);
 }
 return true;
};
export const audit=function audit(snapshot,docs){
 const req=(x,m)=>{if(!x)throw Error(m)};
 const equals=(a,b,m)=>req(JSON.stringify(a)===JSON.stringify(b),m);
 const keys=(x,valid,m)=>{req(x&&typeof x==='object'&&!Array.isArray(x),m+' object');for(const key of Object.keys(x))req(valid.includes(key),m+' unexpected '+key)};
 const uniq=(a,m)=>req(new Set(a).size===a.length,'duplicate '+m);
 const dom={Miele:['www.miele.de'],Bosch:['www.bosch-home.com'],Samsung:['www.samsung.com'],Hoover:['www.hoover-home.com','service.hoover.co.uk'],Dyson:['www.dyson.de']};
 const source=(x,brand,date)=>{
  req(x&&typeof x[date]==='string'&&/^\d{4}-\d\d-\d\d/.test(x[date])&&Number.isFinite(Date.parse(x[date])),'bad source date');
  req(x.url.startsWith('https://')&&dom[brand]?.includes(x.url.slice(8).split('/')[0]),'bad OEM host');
 };
 const id=(d,type)=>(d.identifiers||[]).filter(x=>x.type===type).map(x=>x.value);
 req(snapshot&&Array.isArray(snapshot.devices)&&Array.isArray(snapshot.parts),'missing snapshot');
 req(docs.schema==='uf-catalog-oem-passports/1'&&docs.provenanceStatus==='source_observed_not_independently_verified','invalid research class');
 req(docs.baseSnapshotVersion===snapshot.version,'snapshot version changed');
 equals(docs.baseSnapshotExactVariants,snapshot.devices.map(d=>({id:d.id,reference:d.reference,market:d.market})),'Consumer device/variant/market drift');
 uniq(snapshot.devices.map(x=>x.id),'device');uniq(snapshot.parts.map(x=>x.id),'part');uniq(docs.records.map(x=>x.deviceId),'research id');
 const parts=new Map(snapshot.parts.map(x=>[x.id,x])),devices=new Map(snapshot.devices.map(x=>[x.id,x])),obs=new Map();
 for(const p of snapshot.parts){req(p.code&&p.id,'missing part code');source(p.source,p.brand,'checkedAt');req(p.assessment!=='supported'&&p.physicalFitApproved!==true,'positive part fit');}
 for(const d of snapshot.devices){
  req(d.reference&&d.model&&d.market&&d.id,'missing device identity');
  req(Array.isArray(d.identifiers)&&d.identifiers.some(x=>x.value===d.reference),'device exact identifier missing');
  req(Array.isArray(d.candidatePartIds),'candidate list missing');uniq(d.candidatePartIds,'candidate');
  source(d.source,d.brand,'checkedAt');req(d.assessment!=='supported'&&d.physicalFitApproved!==true,'positive device fit');
  for(const i of d.candidatePartIds)req(parts.has(i)&&parts.get(i).brand===d.brand,'orphan/cross-brand candidate');
 }
 for(const r of docs.records){
  keys(r,['deviceId','deviceReference','market','brand','source','technicalFacts','partListings','supportLink','maintenanceHints'],'record');
  const d=devices.get(r.deviceId);req(d&&d.reference===r.deviceReference&&d.market===r.market&&d.brand===r.brand,'sibling/market/brand transfer');
  keys(r.source,['url','observedAt','access','rawSourceSha256','independentRawAudit','licenceEvidenceId','rights'],'source');
  source(r.source,r.brand,'observedAt');
  req(r.source.access==='public_oem_page'&&r.source.rawSourceSha256===null&&r.source.independentRawAudit===false&&r.source.licenceEvidenceId===null,'false source verification');
  equals(r.source.rights,{factualUse:'review_pending',pageRedistribution:'not_granted',mediaB2c:'not_granted'},'false media/commercial licence');
  req(Array.isArray(r.technicalFacts)&&Array.isArray(r.partListings)&&Array.isArray(r.maintenanceHints),'observations missing');uniq(r.technicalFacts.map(x=>x.key),'tech field');uniq(r.partListings.map(x=>x.partId),'part listing');
  for(const f of r.technicalFacts){keys(f,['key','value','unit','locator','qualifier'],'fact');req(f.key&&f.locator&&f.unit&&Number.isFinite(f.value),'no exact technical source');}
  for(const p of r.partListings){
   keys(p,['partId','partCode','designation','locator','listingType','fitment'],'part claim');
   req(parts.has(p.partId)&&d.candidatePartIds.includes(p.partId),'part not an exact candidate');
   req(parts.get(p.partId).code===p.partCode&&parts.get(p.partId).brand===r.brand,'part identity mismatch');
   req(p.locator&&p.designation&&['oem_included_accessory','oem_device_parts_index'].includes(p.listingType),'part source missing');
   req(p.fitment==='unconfirmed','physical fit unsupported');
  }
  keys(r.supportLink,['url','kind','locator'],'support');
  req(r.supportLink.url===r.source.url&&r.supportLink.locator,'external manual link not observed');
  for(const h of r.maintenanceHints){keys(h,['kind','topic','locator','summary','instructionsProvided','toolsVerified'],'maintenance');req(h.kind==='maintenance_observation_only'&&h.instructionsProvided===false&&h.toolsVerified===false,'unsupported repair step or tool');}
  obs.set(r.deviceId,r);
 }
 const status=(value,reason)=>({status:value,reason});
 const models=snapshot.devices.map(d=>{
  const r=obs.get(d.id),warnings=[];
  if(d.brand==='Bosch'&&(!/\/\d{2}$/.test(d.reference)||!id(d,'e-number').includes(d.reference)))warnings.push('E-Nr /xx missing');
  if(d.brand==='Samsung'&&(!/\/[A-Z]{2}$/.test(d.reference)||!id(d,'manufacturer-model').includes(d.reference)))warnings.push('regional suffix missing');
  if(d.brand==='Miele'&&(!id(d,'material-number').includes(d.reference)||id(d,'product-type').length!==1))warnings.push('material/type incomplete');
  if(d.brand==='Hoover'&&(!/^\d{8}$/.test(d.productCode||'')||!id(d,'device-sku').includes(d.productCode)))warnings.push('product SKU missing');
  if(d.brand==='Dyson'&&!id(d,'device-sku').includes(d.reference))warnings.push('SKU missing');
  const tf=r?.technicalFacts.length||0,edges=r?.partListings.length||0;
  return {
   id:d.id,brand:d.brand,model:d.model,reference:d.reference,market:d.market,productCode:d.productCode??null,identifiers:d.identifiers,
   variant:{status:warnings.length?'incomplete':'catalog_reference_observed',warnings,eNumberIndex:d.brand==='Bosch'?status('unknown','BSH /xx not documented'):status('not_applicable','Non BSH'),pnc:status('not_applicable','No AEG model in baseline'),serialOrRevision:status('unknown','Raw OEM/serial scope not independently checked')},
   consumerSource:{url:d.source.url,checkedAt:d.source.checkedAt,status:'catalog_reference'},
   observedSource:r?{url:r.source.url,observedAt:r.source.observedAt,status:'source_observed',rawAudit:false,rights:'unknown'}:null,
   technicalFacts:tf,candidatePartIds:d.candidatePartIds,observedPartEdges:edges,
   info:{
    specs:status(tf?'source_observed':'unknown',tf?'Research only; raw OEM bytes unaudited':'No exact model specs'),
    exactOemParts:status(edges?'source_observed':'unknown',edges?'Part listing, no physical fit':'Only candidate links available'),
    repair:status('unknown','No reviewed model-specific procedure'),tools:status('unknown','No sourced tool sizes'),safety:status('unknown','No model-specific safety review'),manual:status('unknown','No verified exact manual'),mediaRights:status('unknown','No documented B2C licence'),commercialRights:status('unknown','Public OEM page not a reuse licence'),rawSource:status('unknown','No independent original source replay'),physicalFit:status('unconfirmed','No real fitment test')},
   realFits:0};
 });
 const brands=[...new Set(models.map(x=>x.brand))].sort().map(brand=>{
  const a=models.filter(x=>x.brand===brand);
  return {brand,deviceIds:a.map(x=>x.id),devices:a.length,sourceObserved:a.filter(x=>x.observedSource).length,specModels:a.filter(x=>x.technicalFacts).length,technicalFacts:a.reduce((n,x)=>n+x.technicalFacts,0),candidateEdges:a.reduce((n,x)=>n+x.candidatePartIds.length,0),observedPartEdges:a.reduce((n,x)=>n+x.observedPartEdges,0),incompleteVariants:a.filter(x=>x.variant.warnings.length).length,verifiedRepairs:0,verifiedTools:0,reviewedSafety:0,licensedPhotos:0,realFits:0};
 });
 const n=models.length,pc=models.reduce((v,x)=>v+x.candidatePartIds.length,0),pe=models.reduce((v,x)=>v+x.observedPartEdges,0);
 const cov=f=>({count:models.filter(f).length,of:n}),zero={count:0,of:n};
 return {schema:'uf-catalog-content-quality-wave9/1',snapshotVersion:snapshot.version,
  counts:{devices:n,brands:brands.length,partIdentities:snapshot.parts.length,candidateEdges:pc,observedPartEdges:pe,technicalFacts:models.reduce((v,x)=>v+x.technicalFacts,0),positiveFits:0},
  coverage:{baseIdentityWithSource:{count:n,of:n},completeKnownVariantDiscriminator:cov(x=>!x.variant.warnings.length),independentlyVerifiedDevices:zero,observedOemPages:cov(x=>x.observedSource),devicesWithTechnicalFacts:cov(x=>x.technicalFacts>0),devicesWithOemPartEdges:cov(x=>x.observedPartEdges>0),observedCandidateEdges:{count:pe,of:pc},repairInstructions:zero,toolSizes:zero,safety:zero,manual:zero,b2cMediaRights:zero,rawSourcesAudited:zero,realFits:{count:0,of:pc}},
  brands,devices:models,releaseGates:{rawOEM:'BLOCKED',reuseLicence:'UNKNOWN',physicalFit:'UNCONFIRMED',launchApproved:false,consumerImported:false}};
};
export const markdown=function markdown(r){
 const lines=[
 '# OEM-Content-Lücken Wave9','',
 '> Read-only Consumer-Vergleich; keine positiv belegte Montagepassung, Rechte-, Sicherheits- oder Launchfreigabe.','',
 '## Gesamt',
 '- '+r.counts.devices+' Geräte / '+r.counts.brands+' Marken / '+r.counts.partIdentities+' Teilidentitäten / '+r.counts.candidateEdges+' Kandidaten.',
 '- '+r.coverage.observedOemPages.count+'/'+r.counts.devices+' zusätzliche OEM-Beobachtungen, '+r.coverage.devicesWithTechnicalFacts.count+'/'+r.counts.devices+' Geräte mit '+r.counts.technicalFacts+' technischen Einzelangaben.',
 '- '+r.coverage.observedCandidateEdges.count+'/'+r.counts.candidateEdges+' exakt beobachtete OEM-Teilelistungen, 0 real geprüfte Einbaupassungen.',
 '- '+r.coverage.completeKnownVariantDiscriminator.count+'/'+r.counts.devices+' bekannte Herstellerdiscriminator, 2/2 Bosch /xx E-Nr. ungeklärt.',
 '- Reparatur, Werkzeuge, Safety, einzelne Handbücher, B2C-Lizenzen, unabhängige Rohquellen: je 0/'+r.counts.devices+'.','',
 '## Marken','',
 '| Marke | Geräte | OEM-Quellen | Technikgeräte / Fakten | OEM-Kanten / Kandidaten | Varianten offen |','|---|---:|---:|---:|---:|---:|',
 ...r.brands.map(x=>'| '+x.brand+' | '+x.devices+' | '+x.sourceObserved+'/'+x.devices+' | '+x.specModels+'/'+x.devices+' / '+x.technicalFacts+' | '+x.observedPartEdges+'/'+x.candidateEdges+' | '+x.incompleteVariants+' |'),
 '', '## Geräte','',
 '| Consumer ID | Referenz | Markt | Variante | OEM-Status | Technikfelder | OEM-Kanten / Kandidaten | Reparatur / Tool / Safety / Media |','|---|---|---|---|---|---:|---:|---|',
 ...r.devices.map(x=>'| '+x.id+' | '+x.reference+' | '+x.market+' | '+x.variant.status+' | '+(x.observedSource?'source_observed':'unknown')+' | '+x.technicalFacts+' | '+x.observedPartEdges+'/'+x.candidatePartIds.length+' | unknown / unknown / unknown / unknown |'),
 '', '## Negativ-Gates','',
 '- Bosch ohne E-Nr. /xx ist keine genaue Revision. Samsung /WD und /WE, Hoover achtstelliger Produktcode/Markt, Miele Material- und Produkttyp sowie Dyson SKU sind keine austauschbaren Geschwister.',
 '- PNC-Lücken einschließlich führender Nullen werden **synthetisch** getestet; die elf realen Consumer-Geräte enthalten keine AEG-PNC.',
 '- Die 29 Geräte von Wave7/PR #84 und 200 geplante Kategorien sind nicht integriert und werden nicht gezählt.',
 '- Ein öffentliches OEM-Geräte- oder Teilelisting ist weder Nachweis der sicheren Einbaupassung noch Bild-/B2C-/Textlizenz.',
 '- Work A #96 beschafft Rohquellen. Owner #85/#99 prüft integrierten Snapshot, Source-Lock/Offline/Rechte/Launch. Keine Main-Merges oder Deployments.','',
 '## Tests','',
 'node integrations/catalog-content-quality-wave9/quality.mjs --check',
 'node --test integrations/catalog-content-quality-wave9/quality.test.mjs',''
 ];
 return lines.join('\n');
};
if(process.argv[1]?.endsWith('/quality.mjs')){
 const r=audit(catalogSnapshot,observations);const root='integrations/catalog-content-quality-wave9/';
 const json=JSON.stringify(r,null,2)+String.fromCharCode(10),md=markdown(r);
 if(process.argv.includes('--check')){
  if(readFileSync(root+'gap-report.json','utf8')!==json||readFileSync(root+'gap-report.md','utf8')!==md)throw Error('Owner data changed or report stale');
  console.log(JSON.stringify({state:'PASS',counts:r.counts,coverage:r.coverage}));
 }else if(process.argv.includes('--write')){
  writeFileSync(root+'gap-report.json',json);writeFileSync(root+'gap-report.md',md);
 }else console.log(JSON.stringify(r,null,2));
}
