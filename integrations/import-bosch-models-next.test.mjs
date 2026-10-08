import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {integrateBoschModels,validateBoschEvidence} from './import-bosch-models-next.mjs';
import {boschModelRecords} from '../site/src/data/bosch-records.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const evidence=JSON.parse(fs.readFileSync(path.join(root,'integrations/bosch-model-research-next.json'),'utf8'));
assert.equal(validateBoschEvidence(evidence,boschModelRecords).length,40);
let rejected=0;
const bad=(label,mutate)=>{
 const next=structuredClone(evidence);mutate(next);
 assert.throws(()=>validateBoschEvidence(next,boschModelRecords),undefined,label);rejected++;
};
bad('Same base cannot consume two goal slots',e=>{e.models[1]=structuredClone(e.models[0]);});
bad('Existing base cannot re-enter under a new label',e=>{e.models[0].baseModel=boschModelRecords[0].code;});
bad('Shop aliases cannot become models',e=>{e.models[0].sourceObservation.canonicalModel=boschModelRecords[0].code;});
bad('Cross-brand model source',e=>{e.models[0].sourceObservation.brand='SIEMENS';});
bad('Sales bundle cannot become a base model',e=>{e.models[0].sourceObservation.productType='SET';});
bad('Robots cannot fill the vacuum goal',e=>{e.models[0].sourceObservation.productFamily='VaClRobot';});
bad('An old GTIN cannot become a new device',e=>{e.models[0].sourceObservation.ean=boschModelRecords[0].ean;});
bad('Repeated new GTIN',e=>{e.models[1].sourceObservation.ean=e.models[0].sourceObservation.ean;});
bad('Invalid GTIN checksum',e=>{e.models[0].sourceObservation.ean='4242000000001';});
bad('Repeated existing Bosch device material',e=>{e.models[0].sourceObservation.deviceMaterial=e.baseline.sourceIdentities[0].deviceMaterial;});
bad('Colour label cannot create an extra device-material identity',e=>{e.models[1].sourceObservation.deviceMaterial=e.models[0].sourceObservation.deviceMaterial;});
bad('Material is not a model name',e=>{e.models[0].baseModel=e.models[0].sourceObservation.deviceMaterial;});
bad('Unofficial host',e=>{e.models[0].manufacturerUrl='https://www.bosch-home.com.evil.example/de/de/product/'+e.models[0].baseModel;});
bad('Foreign market cannot be silently marked DE',e=>{e.models[0].manufacturerUrl=e.models[0].manufacturerUrl.replace('/de/de/','/uk/en/');});
bad('HTTP source',e=>{e.models[0].manufacturerUrl=e.models[0].manufacturerUrl.replace('https:','http:');});
bad('Wrong model landing page',e=>{e.models[0].manufacturerUrl=e.models[1].manufacturerUrl;});
bad('Generic HTTP success does not prove an exact model',e=>{e.models[0].sourceObservation.observedModel='UNKNOWN';});
bad('Failed retrieval is not evidence',e=>{e.models[0].sourceObservation.httpStatus=404;});
bad('Bad timestamp',e=>{e.models[0].checkedAt='yesterday';});
bad('Unobserved document URL',e=>{e.models[0].manuals[0].url='https://media3.bsh-group.com/Documents/invented.pdf';});
bad('Part relationships are outside model-only intake',e=>{e.models[0].relationships=[{code:'BBZ41FGALL'}];});
bad('No default part count',e=>{e.models[0].partCount=1;});
for(const key of ['price','stock','shipping'])bad('No commercial inference: '+key,e=>{e.models[0][key]=1;});
for(const suffix of ['/1','/001','/XX','/01/02'])bad('Strict E-Nr. index: '+suffix,e=>{const m=e.models.find(m=>m.variants.length);m.variants[0].eNumber=m.baseModel+suffix;});
bad('Requested URL index cannot substitute for observed index',e=>{const v=e.models.find(m=>m.variants.length).variants[0];v.observedENumber=v.eNumber.replace(/\d\d$/,'98');});
bad('Source product identity must match full E-Nr.',e=>{e.models.find(m=>m.variants.length).variants[0].productId='BBS99999/01';});
bad('Repeated indices are not separate observations',e=>{const m=e.models.find(m=>m.variants.length);m.variants.push(structuredClone(m.variants[0]));});
bad('Service link must preserve observed /xx',e=>{const v=e.models.find(m=>m.variants.length).variants[0];v.url=v.url.replace(/-\d\d$/,'-98');});
bad('Summary must report observed source count',e=>{e.summary.verifiedENumberReferences++;});

const temp=fs.mkdtempSync(path.join(os.tmpdir(),'bosch-next-regression-'));
const site=path.join(temp,'site');
const sha=body=>createHash('sha256').update(body).digest('hex');
function tree(dir){
 const out={};
 for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
  const absolute=path.join(dir,entry.name);
  if(entry.isDirectory())for(const [name,digest] of Object.entries(tree(absolute)))out[entry.name+'/'+name]=digest;
  else out[entry.name]=sha(fs.readFileSync(absolute));
 }
 return out;
}
try{
 execFileSync('python3',[path.join(root,'integrations/restore-source-checkpoint.py'),'--target',site],{cwd:root,stdio:'pipe'});
 const before=tree(site);
 const baselineVersion=JSON.parse(fs.readFileSync(path.join(site,'package.json'))).version;
 const counts=path.join(site,'tests/catalog-seven-brands.test.mjs');
 const original=fs.readFileSync(counts,'utf8');
 fs.writeFileSync(counts,original.replace(/assert\.equal\(catalogStats\.modelCount,\d+\);/,'assert.ok(catalogStats.modelCount>0);'));
 const mismatch=tree(site);
 await assert.rejects(integrateBoschModels({target:site}),/Shared total-count assertions/);
 assert.deepEqual(tree(site),mismatch,'Failed patch anchor must not partly mutate source');
 fs.writeFileSync(counts,original);
 const result=await integrateBoschModels({target:site});
 assert.equal(result.addedModels,40);assert.equal(result.physicalBoschParts,102);assert.equal(result.newParts,0);
 const changed=tree(site);
 const delta=Object.keys(changed).filter(file=>changed[file]!==before[file]).sort();
 assert.deepEqual(delta,[...result.changedFiles].sort(),'Only declared Bosch/shared integration files change');
 for(const file of ['src/data/bosch-records.js','src/data/bosch-extra.js','src/data/brand-index.js','src/data/new-brands-index.js','src/data/samsung-pack.js','src/app.js','styles.css','sw.js','index.html'])assert.equal(changed[file],before[file],file+' remains byte-identical');
 assert.equal(JSON.parse(fs.readFileSync(path.join(site,'package.json'))).version,baselineVersion);
 const twice=await integrateBoschModels({target:site});assert.equal(twice.state,'already-integrated');
 assert.deepEqual(tree(site),changed,'Repeated import is byte-identical and adds no models');
 assert.equal((await integrateBoschModels({target:site,check:true})).state,'already-integrated');
 execFileSync(process.execPath,[path.join(site,'tests/bosch-models-next.test.mjs')],{cwd:site,stdio:'pipe'});
 for(const file of result.changedFiles)assert.equal(fs.readFileSync(path.join(site,file),'utf8'),fs.readFileSync(path.join(root,'site',file),'utf8'),'Fresh checkpoint replay differs: '+file);
 console.log(`Bosch importer passed: ${rejected} invalid-evidence cases rejected; atomic anchor failure, exact eleven-file scope, untouched parts/Samsung/UX, stable version, repeat import, --check and fresh-checkpoint App replay.`);
}finally{fs.rmSync(temp,{recursive:true,force:true});}
