/**
 * Owner-side review gateway for the 10 real Wave4 research cases (18 parts).
 * Converts manufacturer LISTINGS into valid FitmentRequest v1 records, never into
 * positive installation claims. No second fitment engine and no network activity.
 * No bundled OEM documents, images, prices, account data or private serials.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {assessFitment,validateRequest,validateResponse} from '../fitment-engine-v1-poc/contract.mjs';

const read = name => JSON.parse(readFileSync(new URL('../verified-repair-cases-wave4/'+name, import.meta.url)));
const idKinds=Object.freeze({
 material:'material-number',type:'product-type',model:'manufacturer-model',
 eNr:'e-number',pnc:'pnc',productSku:'device-sku',
 modelCode:'manufacturer-model',system:'manufacturer-model'
});
const partKinds=Object.freeze({
 material:'material-number',article:'manufacturer-article',
 designation:'manufacturer-designation'
});
const articleCodes = obs => (obs.observed?.articles||[]).map(x=>typeof x==='string'?x:x.code);
const hasExactCode = (obs, code) =>
 articleCodes(obs).includes(code) ||
 (obs.observed?.assertions||[]).includes(code) ||
 (obs.recipe?.requires||[]).includes(code);

function requireSource(proofId,sourceById,observationById,expectedBrand) {
 const proof=observationById.get(proofId);
 assert.ok(proof,'Missing historical manufacturer observation: '+proofId);
 const s=sourceById.get(proof.source);
 assert.ok(s,'Missing manufacturer source for observation '+proofId);
 assert.equal(s.brand,expectedBrand,'Cross-brand source rejected');
 assert.equal(s.authority,'manufacturer','Unapproved provenance');
 assert.equal(s.httpStatus,200,'Unsuccessful source observation');
 assert.match(s.sha256,/^[a-f0-9]{64}$/,'Invalid recorded historical hash');
 assert.match(s.finalUrl||s.url,/^https:\/\//,'Invalid manufacturer source URL');
 assert.equal(s.reusePermission,'unknown','Rights status must remain unresolved until manually reviewed');
 return {proof,source:s};
}

function validVariantIds(c){
 const ids=Object.entries(c.identifiers).filter(([key,value])=>idKinds[key]&&typeof value==='string'&&value.trim())
  .map(([key,value])=>({namespace:idKinds[key],issuer:c.brand,value}));
 assert.ok(ids.length,'No exact device identity: '+c.id);
 assert.ok(ids.some(i=>i.value===c.scope),
  'Research scope not bound to actual manufacturer identifier: '+c.id);
 return ids;
}
function makeSource(proofId,sourceById,observationById,brand) {
 const {source:s,proof}=requireSource(proofId,sourceById,observationById,brand);
 return {
  id:'wave4:'+proofId,url:s.finalUrl||s.url,publisher:brand,
  kind:'manufacturer',authoritySourceId:null,
  checkedAt:s.checkedAt.slice(0,10),digest:s.sha256,
  locator:'Original observation '+proof.id+' / '+proof.recipe.kind+'; source hash from Wave4 (recheck required)',
  // Historical source was checked in Wave4, but raw bytes and permission are
  // NOT re-audited by this bridge. Never call this v1-verified automatically.
  status:'unverified',
  rights:{privateTest:'unknown',link:'granted',reuse:'unknown',reference:null}
 };
}

export function normalizeWave4({cases,sources,observations}) {
 assert.equal(cases.schemaVersion,'repair-case-evidence/1.0.0');
 assert.equal(cases.cases.length,10,'Expected ten human-reviewed research cases');
 const sourceById=new Map(sources.sources.map(x=>[x.id,x]));
 const observationById=new Map(observations.map(x=>[x.id,x]));
 assert.equal(sourceById.size,sources.sources.length,'Duplicate original source ID');
 assert.equal(observationById.size,observations.length,'Duplicate observation ID');
 const records=[];
 for(const c of cases.cases) {
  const variantIds=validVariantIds(c);
  assert.equal(c.observedDevice.serial,null,'Do not ingest personal/private device serials');
  assert.equal(c.observedDevice.revision,null,'Unexpected claim of examined revision');
  assert.equal(c.observedDevice.connectorInspection,null,'Unexpected claim of physical connector inspection');
  for(const edge of c.edges) {
   assert.equal(edge.status,'manufacturer_listing','Source edge is not a manufacturer listing');
   assert.equal(edge.release,'unconfirmed','Never import a positive real fitment');
   assert.equal(edge.connection,'unknown','Installation inspection was not performed');
   assert.equal(edge.deviceInspection,'unknown','Device inspection was not performed');
   assert.equal(edge.reusePermission,'unknown','No commercial rights were granted');
   assert.equal(edge.scope,c.scope,'Cross-device scope mismatch');
   assert.equal(edge.part.issuer,c.brand,'Mixed OEM brands');
   const namespace=partKinds[edge.part.namespace];
   assert.ok(namespace,'Unrecognized OEM code namespace');
   assert.ok(edge.part.code&&typeof edge.part.code==='string','OEM code must remain a string');
   const listing=requireSource(edge.listingProof,sourceById,observationById,c.brand);
   const identity=requireSource(edge.identityProof,sourceById,observationById,c.brand);
   assert.ok(hasExactCode(listing.proof,edge.part.code),
    'Part not in device listing: '+c.id+' / '+edge.part.code);
   assert.ok(hasExactCode(identity.proof,edge.part.code)||
    (identity.source.finalUrl||identity.source.url).includes(edge.part.code),
    'No exact manufacturer article identity: '+c.id+' / '+edge.part.code);
   const proofIds=[...new Set([edge.listingProof,edge.identityProof])];
   const manufacturerSources=proofIds.map(id=>makeSource(id,sourceById,observationById,c.brand));
   const code={namespace,issuer:c.brand,value:edge.part.code};
   const partId='wave4:'+c.id+':'+edge.part.code;
   const req={
    schemaVersion:'1.0.0',dataVersion:'wave4-research/1.0.0',
    datasetKind:'catalog',context:{usage:'private-test'},
    asset:{id:c.catalogId,category:'vacuum',manufacturer:c.brand,model:c.name},
    variant:{identifiers:variantIds,revision:null,market:c.market,serial:null},
    assembly:{id:edge.assembly},
    part:{id:partId,manufacturer:c.brand,identifiers:[code],kind:'physical'},
    sources:manufacturerSources,
    evidence:[{
      id:'wave4-evidence:'+c.id+':'+edge.part.code,assetId:c.catalogId,
      partId,partIdentifier:code,assemblyId:edge.assembly,
      assertion:'compatible',
      variant:{identifiers:variantIds,market:c.market,
        revision:{mode:'unknown',value:null},
        serial:{mode:'unknown',min:null,max:null}},
      sourceIds:manufacturerSources.map(s=>s.id)
    }],
    interfaces:{reviewSourceIds:[],requirements:[]},
    policy:{risk:['battery','charger','motor','wheel'].includes(edge.assembly)?'review-required':'low'}
   };
   const errors=validateRequest(req);
   assert.deepEqual(errors,[],'FitmentRequest v1 contract invalid: '+c.id+' '+edge.part.code);
   const response=assessFitment(req);
   assert.deepEqual(validateResponse(response),[],'Invalid FitmentResponse v1');
   assert.equal(response.status,'unconfirmed','Unreviewed source promoted to a fit!');
   assert.equal(response.canConfirmFitment,false);
   assert.equal(response.canConfirmPurchase,false);
   const gaps=[
     {code:'REVISION_UNVERIFIED',text:'Geräte-/Herstellerrevision oder explizite Gültigkeit über Revisionen nachweisen'},
     {code:'SERIAL_SCOPE_UNVERIFIED',text:'Seriengrenzen belegen; Seriennummern nur lokal und datensparsam abgleichen'},
     {code:'INSTALLATION_NOT_INSPECTED',text:'Anschluss, Montageposition und relevante Gegenstücke am Gerät prüfen'},
     {code:'SOURCE_REVALIDATION_REQUIRED',text:'Herstellerbelege erneut im geprüften Kontext gegen Originalantworten abnehmen'},
     {code:'RIGHTS_UNCLEARED',text:'Nutzungsrechte für private Prüfung bzw. B2C/B2B-Evidenzaussagen ausdrücklich klären'}
   ];
   if(c.brand==='Bosch' && c.identifiers.eNrIndex===null)
     gaps.unshift({code:'BSH_E_NR_INDEX_MISSING',text:'Vollständigen BSH-E-Nr.-Index /xx vom Typenschild abgleichen'});
   if(c.negativeCases.length)
     gaps.push({code:'CONDITIONAL_EXCLUSIONS',text:'Bedingte Hersteller-Ausschlüsse vor jeglicher Freigabe prüfen'});
   if(['battery','charger'].includes(edge.assembly))
     gaps.push({code:'ELECTRICAL_VARIANT_CHECK',text:'Akku-/Ladegerät-Ausführung, Befestigung und elektrische Daten herstellerbelegt vergleichen'});
   const report={
    caseId:c.id,assetId:c.catalogId,device:c.name,brand:c.brand,
    deviceReference:c.scope,sourceMarket:c.market,assembly:edge.assembly,
    oemArticle:{code:edge.part.code,namespace,issuer:c.brand,name:edge.part.name},
    originalListingProof:edge.listingProof,originalIdentityProof:edge.identityProof,
    sourceUrls:manufacturerSources.map(s=>s.url),
    conditionalExclusions:c.negativeCases.filter(n=>n.assembly===edge.assembly)
      .map(n=>({when:n.when,target:n.target,proof:n.proof,text:n.text,
        status:'conditional-only; device not physically examined'})),
    engine:{schemaVersion:response.schemaVersion,version:response.engineVersion,status:response.status,
      canConfirmFitment:response.canConfirmFitment,canConfirmPurchase:response.canConfirmPurchase,
      reasons:response.reasons},
    gaps,reviewStatus:'manual_review_required',installationApproved:false
   };
   records.push({request:req,response,report});
  }
 }
 assert.equal(records.length,18,'Unexpected number of real research edges');
 assert.equal(new Set(records.map(r=>r.request.part.id)).size,records.length,'Duplicate OEM claim');
 return records;
}
export function loadRealReviewRecords(){
 return normalizeWave4({cases:read('cases.json'),sources:read('sources.json'),observations:read('observations.json')});
}
export function reviewReport(records=loadRealReviewRecords()){
 const rows=records.map(r=>r.report).sort((a,b)=>
  a.gaps.length-b.gaps.length||a.caseId.localeCompare(b.caseId)||a.oemArticle.code.localeCompare(b.oemArticle.code));
 return {
  schema:'uf-real-fitment-review/1',source:'manufacturer-research-wave4 (recorded, not newly live validated)',
  scope:'private-review; no public fitment and no rights grant',
  counts:{researchCases:10,manufacturerListedPartAssociations:rows.length,
    positivelyInstallationApproved:rows.filter(r=>r.installationApproved).length,
    needsManualReview:rows.filter(r=>r.reviewStatus==='manual_review_required').length,
    withConditionalExclusions:rows.filter(r=>r.conditionalExclusions.length).length},
  engineVersion:'1.0.0',rows
 };
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 const result=reviewReport();
 if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(result,null,2)+'\n');
 else{
  console.log('Real research cases:',result.counts.researchCases);
  console.log('Manufacturer-listed parts:',result.counts.manufacturerListedPartAssociations);
  console.log('Approved installation fitments:',result.counts.positivelyInstallationApproved);
  console.log('Manual reviews:',result.counts.needsManualReview);
  console.log('Top review case:',result.rows[0].caseId,result.rows[0].oemArticle.code);
 }
}
