// Research pipeline restricted to independent Wave11 folder; no network, no import.
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
import {createHash} from 'node:crypto';
import {catalogSnapshot} from '../consumer-repair-mission-poc/catalog-snapshot.mjs';
import {generateSyntheticFixtures} from './fixtures.mjs';
export const manifest=JSON.parse(readFileSync(new URL('./source-candidates.json',import.meta.url),'utf8'));
export function req(c,m){if(!c)throw Error(m||"assertion failed");}

export function exact(o,keys,label){
 req(o&&typeof o==="object"&&!Array.isArray(o),label+" not object");
 const found=Object.keys(o);
 for(const x of found)req(keys.includes(x),label+" unexpected "+x);
 for(const x of keys)req(Object.hasOwn(o,x),label+" missing "+x);
}

export function keyOf(r){
 return [r.domain,r.brand,r.market,r.primary.namespace,r.primary.value,r.variant.eNumber??"",r.variant.pnc??"",r.variant.manufacturerProductCode??""].map(x=>String(x).length+":"+x).join("|");
}

export function exactSource(url,brand){
 const match=/^https:\/\/([a-z0-9.-]+)(\/[^\s?#]*)$/.exec(url||"");
 req(match,"OEM URL must be HTTPS without credentials/query/hash");
 const hosts={Miele:"www.miele.de",Dyson:"www.dyson.de",Bosch:"www.bosch-home.com",AEG:"www.aeg.de",Hoover:"www.hoover-home.com"};
 req(match[1]===hosts[brand],"wrong exact OEM host");
 return match[2];
}

export function stageFromEvidence(r){
 const e=r.source;
 if(!e.originalBytesArchive){
  req(e.independentIdentityReview===null&&e.rightsReview===null&&e.fitmentReview===null,"Cannot skip raw-source stage");
  return "candidate_observed";
 }
 throw Error("Original-byte replay and Owner review unavailable in private research pilot");
}
// Educational synthetic-only proof-chain exercise: never promotes real OEM entries.
export function simulateEvidenceStages(r,proof){
 if(proof===null)return {stage:"candidate_observed",simulationOnly:true,consumerApproved:false};
 req(proof&&proof.simulationOnly===true,"Only synthetic proof simulation permitted");
 const a=proof.archive;
 req(a&&a.syntheticBytes instanceof Uint8Array&&a.syntheticBytes.byteLength>0,"No synthetic archived bytes");
 req(a.declaredSha256===createHash("sha256").update(a.syntheticBytes).digest("hex"),"Archived-byte SHA mismatch");
 req(a.exactSourceUrl===r.source.url&&a.capturedBy,"Exact OEM-reference binding missing");
 let stage="original_bytes_archived";
 const i=proof.independentReview;
 if(!i){req(!proof.rightsReview&&!proof.fitmentReview,"No stage skip before independent audit");return {stage,simulationOnly:true,consumerApproved:false};}
 req(i.auditor&&i.auditor!==a.capturedBy&&i.sha256===a.declaredSha256&&i.exactVariantKey===keyOf(r)&&i.identityResult==="verified","Independent identity witness missing");
 stage="identity_independently_verified";
 const rights=proof.rightsReview;
 if(!rights){req(!proof.fitmentReview,"No fitment without independent rights review");return {stage,simulationOnly:true,consumerApproved:false};}
 req(rights.contractId&&rights.reviewedBy&&rights.reviewedBy!==a.capturedBy&&rights.commercialUse==="approved"&&rights.mediaUse==="approved","Independent rights review or contract missing");
 stage="rights_reviewed";
 const fit=proof.fitmentReview;
 if(fit){
  req(fit.physicalTest==="verified"&&fit.partCode&&fit.serialOrRevisionScope&&fit.safetyReviewer&&fit.technicalEvidenceId,"Physical test or safety evidence missing");
  stage="fitment_verified";
 }
 return {stage,simulationOnly:true,consumerApproved:false};
}

export function checkCandidate(r){
 exact(r,["recordType","id","domain","brand","model","market","primary","variant","identityStatus","evidenceStage","source","consumerPublished","fitmentConfirmed","licenseApproved","originalParts","fitmentEdges"],"candidate");
 req(r.recordType==="oem_research_candidate","Synthetic fixture cannot enter real candidates");
 req(typeof r.id==="string"&&/^W11-\d{3}$/.test(r.id),"research ID missing");
 req(typeof r.model==="string"&&r.model.length>0,"model title missing");
 req(["washing-machine","vacuum-cleaner"].includes(r.domain),"unapproved domain");
 req(r.market==="DE","wrong research region");
 exact(r.primary,["namespace","value"],"primary code");
 req(typeof r.primary.value==="string"&&r.primary.value.trim()===r.primary.value&&r.primary.value,"primary code must be exact string");
 exact(r.variant,["eNumber","pnc","manufacturerProductCode","serialRange","revisionRange"],"variant");
 for(const field of Object.values(r.variant))req(field===null||(typeof field==="string"&&field.trim()===field&&field.length>0),"invalid variant field");
 req(r.variant.serialRange===null&&r.variant.revisionRange===null,"independently verified serial or revision not provided");
 req(r.identityStatus==="pending_revision_or_serial","identity cannot be approved");
 exact(r.source,["authority","url","locator","observedAt","trace","originalBytesArchive","independentIdentityReview","rightsReview","fitmentReview"],"source");
 req(r.source.authority==="official_manufacturer","only original OEM references");
 req(typeof r.source.locator==="string"&&r.source.locator.length>10,"missing exact source locator");
 req(/^\d{4}-\d{2}-\d{2}$/.test(r.source.observedAt)&&Number.isFinite(Date.parse(r.source.observedAt)),"invalid observation date");
 req(["prior_wave10_owner_research","direct_oem_page_lookup","direct_oem_support_page_lookup"].includes(r.source.trace),"no unknown provenance");
 const path=exactSource(r.source.url,r.brand);
 if(r.brand==="Miele"){
  req(r.primary.namespace==="material-number"&&/^\d{8}$/.test(r.primary.value),"Miele material ID");
  req(path.startsWith("/product/"+r.primary.value+"/"),"incorrect Miele material URL");
  req(r.source.locator.includes(r.primary.value)&&r.source.locator.includes(r.model),"Miele page model and material locator incomplete");
  req(r.variant.eNumber===null&&r.variant.pnc===null,"wrong Miele identity namespace");
 }else if(r.brand==="Bosch"){
  req(r.primary.namespace==="manufacturer-model"&&path.endsWith("/"+r.primary.value),"Bosch exact model URL");
  req(r.variant.eNumber===null,"Bosch full /xx E-Nr not proved");
 }else if(r.brand==="AEG"){
  req(r.primary.namespace==="manufacturer-model"&&path.endsWith("/"+r.primary.value.toLowerCase()+"/"),"AEG exact model URL");
  req(typeof r.variant.pnc==="string"&&/^\d{9}$/.test(r.variant.pnc),"AEG PNC as 9-digit string with leading zeros");
  const display=r.variant.pnc.replace(/(\d{3})(\d{3})(\d{3})/,"$1 $2 $3");
  req(r.source.locator.includes(display),"AEG PNC not in source locator");
 }else if(r.brand==="Hoover"){
  req(r.primary.namespace==="manufacturer-model","Hoover model namespace");
  req(typeof r.variant.manufacturerProductCode==="string"&&/^\d{8}$/.test(r.variant.manufacturerProductCode),"8-digit Hoover product code");
  req(path.includes("/"+r.variant.manufacturerProductCode+"/"),"Hoover official product code URL");
  req(path.endsWith("/"+r.primary.value.toLowerCase().replace(/\s+/g,"-")+"/"),"Hoover sibling model incorrect");
 }else if(r.brand==="Dyson"){
  req(r.primary.namespace==="device-sku"&&/^\d{6}-\d{2}$/.test(r.primary.value),"Dyson SKU complete");
  req(path.endsWith("/search."+r.primary.value),"Dyson exact SKU not in support URL");
 }
 req(r.source.originalBytesArchive===null,"Raw byte archives never inherited from research URLs");
 req(r.source.independentIdentityReview===null&&r.source.rightsReview===null&&r.source.fitmentReview===null,"unreviewed OEM/rights/fitment approval");
 req(r.evidenceStage===stageFromEvidence(r),"fake evidence stage escalation");
 req(r.evidenceStage==="candidate_observed","Pilot stage only observed");
 req(r.consumerPublished===false&&r.fitmentConfirmed===false&&r.licenseApproved===false,"Consumer/fitment/license approval forbidden");
 req(JSON.stringify(r.originalParts)==="[]"&&JSON.stringify(r.fitmentEdges)==="[]","Unsourced original parts and fitment edges forbidden");
 return true;
}

export function validateBatch(batch,consumer){
 exact(batch,["schema","baselineOwnerSha","intendedUse","productionImportEnabled","realRecords"],"batch");
 req(batch.schema==="uf-wave11-oem-batch/1"&&batch.intendedUse==="private_research_only"&&batch.productionImportEnabled===false,"research-only mode locked");
 req(batch.baselineOwnerSha==="45e1c687d122b837364aeb4dd5c86e2c34f502cb","wrong prepared Owner SHA");
 req(Array.isArray(batch.realRecords)&&batch.realRecords.length<=50,"50-item research pilot capacity");
 req(consumer&&Array.isArray(consumer.devices),"read-only consumer baseline missing");
 const active=new Set(consumer.devices.map(x=>x.brand+"|"+x.reference)),ids=new Set(),keys=new Set();
 for(const r of batch.realRecords){
  checkCandidate(r);
  req(!ids.has(r.id),"duplicate record ID");ids.add(r.id);
  const k=keyOf(r);req(!keys.has(k),"duplicate exact variant and market");keys.add(k);
  req(!active.has(r.brand+"|"+r.primary.value),"research duplicates active Consumer device");
 }
 return batch.realRecords;
}

export function ingestSynthetic(rows){
 req(Array.isArray(rows)&&rows.length>=100,"at least 100 synthetic fixtures required");
 const ids=new Set(),keys=new Set();
 for(const r of rows){
  req(r.recordType==="synthetic_load_fixture"&&r.fixtureOnly===true,"real candidate mixed into synthetic batch");
  req(r.brand==="SYNTHETIC-TEST-MANUFACTURER"&&/^SYNTHETIC-ONLY-\d{6}$/.test(r.id),"unsafely tagged fixture");
  req(r.source?.url===null&&r.source?.authority==="none","synthetic OEM URL must be absent");
  req(r.consumerPublished===false&&r.fitmentConfirmed===false&&r.licenseApproved===false,"synthetic release flags");
  req(!ids.has(r.id),"duplicate synthetic ID");ids.add(r.id);
  const key=keyOf(r);req(!keys.has(key),"duplicate synthetic identity");keys.add(key);
 }
 return {processed:rows.length,realCandidatesAdded:0,consumerImports:0};
}

export function batchReport(batch,consumer){
 const rows=validateBatch(batch,consumer);
 const statuses=["candidate_observed","original_bytes_archived","identity_independently_verified","rights_reviewed","fitment_verified"];
 const stages={};for(const s of statuses)stages[s]=rows.filter(r=>r.evidenceStage===s).length;
 const groups={};for(const r of rows){const k=r.domain+"/"+r.brand;groups[k]=(groups[k]||0)+1;}
 const perBrand=Object.entries(groups).sort(([a],[b])=>a.localeCompare(b)).map(([name,count])=>({name,count}));
 return {
  schema:"uf-wave11-batch-report/1",
  consumerBaseline:{devices:consumer.devices.length,partIdentities:consumer.parts.length,changed:false},
  research:{researched:rows.length,validated:rows.length,independentlySourceVerified:0,rightsReviewed:0,consumerIntegrated:0,realPhysicalFits:0,
   unresolvedSerialOrRevision:rows.length,boschWithoutFullENumber:rows.filter(x=>x.brand==="Bosch"&&x.variant.eNumber===null).length,stages,byDomainBrand:perBrand},
  synthetic:{generatedPerRun:250,label:"synthetic_load_fixture",countedAsReal:false},
  gates:{licenseApproved:false,fitmentConfirmed:false,consumerPublished:false,launchApproved:false}
 };
}

export function markdown(r){
 return [
  "# Wave11 · OEM Batch-Research / synthetischer Lasttest","",
  "> Hersteller-Modellseiten bilden ausschließlich Research-Kandidaten; kein Raw-Replay, Lizenznachweis oder bestätigte Einbaupassung.","",
  "## Echte und synthetische Counts","",
  "| Prüfung | Ergebnis |","|---|---:|",
  "| Echte OEM-Recherchekandidaten mit URL/Fundstelle | "+r.research.researched+" |",
  "| Strukturell validiert | "+r.research.validated+" |",
  "| Unabhängig durch Originalbytes verifiziert | "+r.research.independentlySourceVerified+" |",
  "| Rechtlich geprüfte Lizenzfreigaben | "+r.research.rightsReviewed+" |",
  "| Consumer-Integration | "+r.research.consumerIntegrated+" |",
  "| Bestätigte reale Teilepassungen | "+r.research.realPhysicalFits+" |",
  "| Synthetische Leistungstest-Fixtures (nicht echt) | "+r.synthetic.generatedPerRun+" |","",
  "## Verteilung der 37 Modellquellen", "",
  "| Domäne / Hersteller | Nur beobachtet |","|---|---:|",
  ...r.research.byDomainBrand.map(x=>"| "+x.name+" | "+x.count+" |"),
  "","## Geschlossene Evidenzstufen","",
  ...Object.entries(r.research.stages).map(([k,v])=>"- "+k+": **"+v+"**"),
  "",
  "Beide Bosch-Modelle ohne belegte vollständige E-Nr. /xx: "+r.research.boschWithoutFullENumber+". Serien-/Revisions-Audit unbekannt bei "+r.research.unresolvedSerialOrRevision+" Forschungsgeräten.",
  "",
  "## Nächste Skalierungsschritte","",
  "1. Schriftlich genehmigte Herstellerfeeds und kommerzielle Datenverträge statt unautorisiertem Massenscraping.",
  "2. Reproduzierbare Byte-/SHA-Archiv-Queue mit getrenntem unabhängigen Identitätsaudit einschließlich Markt-/E-Nr.-/PNC-/SKU-Grenzen.",
  "3. Eigener Lizenz-/Medien-/Textreview; keine automatischen Rechteannahmen aus öffentlichen Herstellerlinks.",
  "4. Teilnummern, Modell-BOMs und physische sicherheitsbezogene Fits durch separate Fachreviews vor der Consumer-Projektion.",
  "5. Stichprobenstrategie, Delta-Batches, Format- und Dubletten-Reporting; alle synthetischen Lasttests bleiben separat.","",
  "Kein Consumer-Edit, kein Workflow-Scraping, kein main-Merge, kein Release/Deployment.","",
  "## Ausführen","",
  "`node integrations/catalog-batch-ingestion-wave11/ingest.mjs --check`",
  "`node --test integrations/catalog-batch-ingestion-wave11/ingest.test.mjs`",""
 ].join("\n");
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const r=batchReport(manifest,catalogSnapshot),j=JSON.stringify(r,null,2)+'\n',md=markdown(r);
 if(process.argv.includes('--check')){
  if(readFileSync(new URL('./report.json',import.meta.url),'utf8')!==j||readFileSync(new URL('./report.md',import.meta.url),'utf8')!==md)throw Error('Report stale or Owner data changed');
  const t0=performance.now();const syn=ingestSynthetic(generateSyntheticFixtures(250)),t1=performance.now();
  console.log(JSON.stringify({result:'PASS',researched:r.research.researched,validated:r.research.validated,independent:0,synthetic:syn.processed,ms:Number((t1-t0).toFixed(3)),throughputPerSec:Math.round(syn.processed*1000/Math.max(1,t1-t0)),consumerChanged:false}));
 }else if(process.argv.includes('--write')){writeFileSync(new URL('./report.json',import.meta.url),j);writeFileSync(new URL('./report.md',import.meta.url),md);}
 else console.log(j);
}
