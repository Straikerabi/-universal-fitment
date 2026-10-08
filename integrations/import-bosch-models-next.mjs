import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {parseArgs} from 'node:util';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const digest=value=>createHash('sha256').update(value).digest('hex');
const basePattern=/^B(?:G[BCDLS]|CH|HH|BS|CS|SS|KS|TS|DS)[A-Z0-9]{2,12}$/;
const date=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(value)&&Number.isFinite(Date.parse(value));
function gtin(value){
 if(!/^\d{13}$/.test(value||''))return false;
 const sum=[...value.slice(0,-1)].reduce((n,c,i)=>n+Number(c)*(i%2?3:1),0);
 return (10-sum%10)%10===Number(value.at(-1));
}
function manufacturerUrl(value,code,reference=null){
 const url=new URL(value);
 assert.equal(url.protocol,'https:');assert.equal(url.hostname,'www.bosch-home.com');
 assert.ok(!url.username&&!url.password&&!url.port&&!url.search&&!url.hash,'Unqualified manufacturer URL');
 if(reference)assert.equal(url.pathname,`/de/de/productservice/${reference.replace('/','-')}`);
 else assert.ok(url.pathname.startsWith('/de/de/product/')&&url.pathname.endsWith('/'+code),'Exact German product page required');
}
function documentUrl(value){
 const url=new URL(value);
 assert.equal(url.protocol,'https:');
 assert.ok(!url.username&&!url.password&&!url.port&&!url.hash);
 assert.ok(url.hostname==='media3.bsh-group.com'&&url.pathname.startsWith('/Documents/')||url.hostname==='www.bosch-home.com'&&url.pathname.startsWith('/de/manual/'),'Manufacturer document required');
}

export function validateBoschEvidence(evidence,baseline){
 assert.equal(evidence.schemaVersion,1);assert.equal(evidence.manufacturer,'Bosch');
 assert.equal(evidence.baseCommit,'6545d9affb6b3c6c04b8d585084f2094a09e77b1');
 assert.equal(baseline.length,60);assert.equal(new Set(baseline.map(r=>r.code)).size,60);
 assert.deepEqual([...evidence.baseline.modelCodes].sort(),baseline.map(r=>r.code).sort());
 assert.ok(Array.isArray(evidence.models)&&evidence.models.length>0&&evidence.models.length<=40);
 const knownCodes=new Set(baseline.map(r=>r.code)),knownGtins=new Set(baseline.map(r=>r.ean).filter(Boolean));
 const knownMaterials=new Set(evidence.baseline.sourceIdentities.filter(r=>r.status==='verified').map(r=>r.deviceMaterial));
 assert.equal(new Set(evidence.baseline.sourceIdentities.map(r=>r.code)).size,evidence.baseline.sourceIdentities.length);
 for(const identity of evidence.baseline.sourceIdentities){
  assert.ok(knownCodes.has(identity.code));assert.equal(identity.status,'verified');
  assert.equal(identity.observedModel,identity.code);assert.ok(/^\d{8}$/.test(identity.deviceMaterial));
  assert.equal(identity.httpStatus,200);assert.ok(date(identity.checkedAt));
  manufacturerUrl(identity.url,identity.code);
 }
 const codes=new Set(),materials=new Set(),gtins=new Set();let variants=0;
 for(const model of evidence.models){
  const code=model.baseModel,source=model.sourceObservation;
  assert.equal(model.manufacturer,'Bosch');assert.equal(model.status,'verified-model-reference');
  assert.ok(basePattern.test(code),'Unsupported Bosch base model');
  assert.ok(!knownCodes.has(code)&&!codes.has(code),'Duplicate base model: '+code);codes.add(code);
  assert.equal(source.observedModel,code);assert.equal(source.canonicalModel,code,'Shop alias is not an additional base model');
  assert.equal(source.brand,'BOSCH');assert.equal(source.productType,'VIB','Sales sets cannot create base models');
  assert.ok(['VaClCanister','VaClRechargeable'].includes(source.productFamily),'Only floor and upright vacuum models');
  assert.equal(source.httpStatus,200);assert.ok(/^[a-f0-9]{64}$/.test(source.sha256));
  assert.ok(/^\d{8}$/.test(source.deviceMaterial));
  assert.ok(!knownMaterials.has(source.deviceMaterial)&&!materials.has(source.deviceMaterial),'Duplicate manufacturer device identity');materials.add(source.deviceMaterial);
  assert.ok(gtin(source.ean),'Observed model GTIN required');
  assert.ok(!knownGtins.has(source.ean)&&!gtins.has(source.ean),'Duplicate model GTIN');gtins.add(source.ean);
  assert.ok(typeof model.name==='string'&&model.name.trim());assert.equal(model.name,source.name);
  assert.ok(model.series.startsWith('Bosch '));assert.ok(['bagged','bagless','cordless'].includes(model.deviceType));
  assert.ok(date(model.checkedAt));assert.equal(model.checkedAt,source.checkedAt);
  manufacturerUrl(model.manufacturerUrl,code);assert.equal(source.url,model.manufacturerUrl);
  assert.equal(model.partCount,0);assert.deepEqual(model.relationships,[],'No inferred parts relationships');
  assert.ok(!Object.hasOwn(model,'price')&&!Object.hasOwn(model,'stock')&&!Object.hasOwn(model,'shipping'));
  assert.deepEqual(model.duplicateCheck,{baseAbsent:true,canonicalMatchesBase:true,gtinAbsent:true,deviceMaterialAbsentInObservedBaseline:true});
  assert.ok(Array.isArray(model.variants));const references=new Set();
  for(const variant of model.variants){
   assert.ok(new RegExp(`^${code}/\\d{2}$`).test(variant.eNumber),'Invalid or foreign E-Nr.');
   assert.ok(!references.has(variant.eNumber));references.add(variant.eNumber);
   assert.equal(variant.observedENumber,variant.eNumber,'Index must have been read from source content');
   assert.equal(variant.productId,variant.eNumber);assert.equal(variant.brand,'BOSCH');assert.equal(variant.httpStatus,200);
   assert.ok(date(variant.checkedAt));assert.ok(/^[a-f0-9]{64}$/.test(variant.sha256));
   manufacturerUrl(variant.url,code,variant.eNumber);variants++;
  }
  assert.ok(Array.isArray(model.manuals));
  for(const manual of model.manuals){assert.ok(manual.label);documentUrl(manual.url);assert.ok(source.manualUrls.includes(manual.url),'Document must be listed on the exact model page');}
  if(model.imageUrl){const image=new URL(model.imageUrl);assert.equal(image.protocol,'https:');assert.equal(image.hostname,'media3.bsh-group.com');assert.ok(image.pathname.startsWith('/Product_Shots/'));}
 }
 assert.equal(evidence.summary.addedModels,codes.size);assert.equal(evidence.summary.totalBoschModels,60+codes.size);
 assert.equal(evidence.summary.verifiedProductPages,codes.size);assert.equal(evidence.summary.verifiedENumberReferences,variants);
 assert.equal(evidence.summary.newParts,0);assert.equal(evidence.summary.physicalBoschParts,102);
 return evidence.models.map(m=>({code:m.baseModel,name:m.name,series:m.series,deviceType:m.deviceType,color:m.color||'',ean:m.sourceObservation.ean,imageUrl:m.imageUrl||null,url:m.manufacturerUrl,checkedAt:m.checkedAt,manuals:m.manuals,variants:m.variants.map(v=>({eNumber:v.eNumber,url:v.url,checkedAt:v.checkedAt}))}));
}

function replaceOnce(text,before,after,label){
 assert.equal(text.split(before).length,2,`Expected exactly one ${label} anchor; preserve newer work`);
 return text.replace(before,after);
}

export async function integrateBoschModels({target=path.join(root,'site'),evidenceFile=path.join(root,'integrations/bosch-model-research-next.json'),check=false}={}){
 target=path.resolve(target);
 const evidence=JSON.parse(fs.readFileSync(evidenceFile,'utf8'));
 for(const [file,sha] of Object.entries(evidence.baseline.fileSha256))assert.equal(digest(fs.readFileSync(path.join(target,file))),sha,`Bosch baseline changed: ${file}`);
 const {boschModelRecords}=await import(pathToFileURL(path.join(target,'src/data/bosch-records.js')));
 const records=validateBoschEvidence(evidence,boschModelRecords);
 const generated=fs.readFileSync(path.join(root,'integrations/bosch-models-next.template.js'),'utf8').replace('/* BOSCH_NEXT_RECORDS */',JSON.stringify(records));
 const test=fs.readFileSync(path.join(root,'integrations/bosch-models-next.test.template.mjs'),'utf8');
 const read=file=>fs.readFileSync(path.join(target,file),'utf8');
 const outputs=new Map([['src/data/bosch-models-next.js',generated],['tests/bosch-models-next.test.mjs',test]]);
 const existing=path.join(target,'src/data/bosch-models-next.js');
 const pkg=JSON.parse(read('package.json'));
 const nextImport="import {boschNextModels} from './bosch-models-next.js';";
 if(fs.existsSync(existing)){
  assert.equal(read('src/data/bosch-models-next.js'),generated,'Existing Bosch intake differs; refusing overwrite');
  assert.equal(read('tests/bosch-models-next.test.mjs'),test);
  assert.ok(read('src/data/bosch-vacuum.js').includes(nextImport));
  assert.ok(read('src/data/bosch-vacuum.js').includes('export const boschConcreteModels=[...boschExistingModels,...boschNextModels];'));
  assert.ok(pkg.scripts.test.endsWith(' && node tests/bosch-models-next.test.mjs'));
  assert.ok(pkg.scripts.check.endsWith(' && node --check src/data/bosch-models-next.js'));
  assert.ok(read('tests/bosch-catalog.test.mjs').includes('60+boschNextModels.length'));
  assert.ok(read('tests/catalog-seven-brands.test.mjs').includes('/* Bosch next: model-count delta */'));
  assert.ok(read('src/core/typeplate.js').includes('/^(?:B|VS)[A-Z0-9]+(?:\\s*\\/\\s*[A-Z0-9]*)*/i'),'Repeated E-Nr. suffixes must not be silently truncated');
  return {addedModels:records.length,boschModels:60+records.length,state:'already-integrated',changedFiles:[]};
 }
 assert.ok(!check,'Bosch models have not been integrated');
 let vacuum=read('src/data/bosch-vacuum.js');
 vacuum=replaceOnce(vacuum,"import {boschModelRecords,boschPartRecords} from './bosch-records.js';", "import {boschModelRecords,boschPartRecords} from './bosch-records.js';\n"+nextImport,'Bosch records import');
 vacuum=replaceOnce(vacuum,'export const boschConcreteModels=boschModelRecords.map(r=>{','const boschExistingModels=boschModelRecords.map(r=>{','Bosch model mapper');
 vacuum=replaceOnce(vacuum,'export const boschCatalogStats={','export const boschConcreteModels=[...boschExistingModels,...boschNextModels];\nexport const boschCatalogStats={documentedENumberCount:boschNextModels.reduce((n,p)=>n+p.deviceReferences.length,0),','Bosch stats');
 outputs.set('src/data/bosch-vacuum.js',vacuum);

 let catalog=read('tests/bosch-catalog.test.mjs');
 catalog=replaceOnce(catalog,"const models=products.filter(p=>p.brand==='Bosch');", "import {boschNextModels} from '../src/data/bosch-models-next.js';\n// Preserve all original accessory, GTIN, manual and fitment assertions for the baseline.\nconst models=products.filter(p=>p.brand==='Bosch'&&boschModelRecords.some(r=>r.code===p.model));",'original Bosch test scope');
 catalog=replaceOnce(catalog,'assert.equal(boschCatalogStats.modelCount,60);','assert.equal(boschCatalogStats.modelCount,60+boschNextModels.length);','Bosch count');
 for(const [type,count] of [['bagged',22],['bagless',18],['cordless',20]])catalog=replaceOnce(catalog,`assert.equal(filterCatalog({brand:'Bosch',deviceType:'${type}'}).length,${count});`,`assert.equal(filterCatalog({brand:'Bosch',deviceType:'${type}'}).length,${count}+boschNextModels.filter(p=>p.vacuumMeta.deviceType==='${type}').length);`,'Bosch '+type+' filter count');
 outputs.set('tests/bosch-catalog.test.mjs',catalog);

 let boundaries=read('tests/bosch-boundaries.test.mjs');
 boundaries=replaceOnce(boundaries,"ean=p=>p.identifiers.find(i=>i.type==='ean').value;","ean=p=>p.identifiers.find(i=>i.type==='ean')?.value;",'optional manufacturer GTIN');
 boundaries=replaceOnce(boundaries,'${p.model} / 02\\nEAN: ${ean(p)}\\nFD:', '${p.model} / 02${ean(p)?`\\nEAN: ${ean(p)}`:""}\\nFD:', 'typeplate optional GTIN');
 outputs.set('tests/bosch-boundaries.test.mjs',boundaries);

 // Retain extra /xx tokens so the strict parser rejects malformed typed or bare E-Nr. input.
 let typeplate=read('src/core/typeplate.js');
 typeplate=replaceOnce(typeplate,'/^(?:B|VS)[A-Z0-9]+(?:\\s*\\/\\s*[A-Z0-9]*)?/i','/^(?:B|VS)[A-Z0-9]+(?:\\s*\\/\\s*[A-Z0-9]*)*/i','labelled E-Nr. token boundary');
 typeplate=replaceOnce(typeplate,'/\\bB(?:G[BCDLS]|CH|HH|BS|CS|SS|KS|TS|DS)[A-Z0-9]{2,12}(?:\\s*\\/\\s*[A-Z0-9]*)?/gi','/\\bB(?:G[BCDLS]|CH|HH|BS|CS|SS|KS|TS|DS)[A-Z0-9]{2,12}(?:\\s*\\/\\s*[A-Z0-9]*)*/gi','bare Bosch E-Nr. token boundary');
 outputs.set('src/core/typeplate.js',typeplate);

 let counts=read('tests/catalog-seven-brands.test.mjs');
 const modelCount=counts.match(/assert\.equal\(catalogStats\.modelCount,(\d+)\);/);
 const recordCount=counts.match(/assert\.equal\(catalogStats\.recordCount,(\d+)\);/);
 const goalSlots=counts.match(/assert\.equal\(progress\.reduce\(\(n,r\)=>n\+r\.slots,0\),(\d+)\);/);
 assert.ok(modelCount&&recordCount&&goalSlots,'Shared total-count assertions must be reviewed');
 counts=replaceOnce(counts,modelCount[0],`/* Bosch next: model-count delta */\nassert.equal(catalogStats.modelCount,${Number(modelCount[1])+records.length});`,'shared model total');
 counts=replaceOnce(counts,recordCount[0],`assert.equal(catalogStats.recordCount,${Number(recordCount[1])+records.length});`,'shared record total');
 counts=replaceOnce(counts,goalSlots[0],`assert.equal(progress.reduce((n,r)=>n+r.slots,0),${Number(goalSlots[1])+records.length});`,'shared model-goal total');
 outputs.set('tests/catalog-seven-brands.test.mjs',counts);

 let philips=read('tests/philips-expansion.test.mjs');
 philips=replaceOnce(philips,"['Bosch',60,103]",`['Bosch',${60+records.length},103]`,'shared Philips-test Bosch coverage count');
 outputs.set('tests/philips-expansion.test.mjs',philips);
 let vorwerk=read('tests/vorwerk-expansion.test.mjs');
 const vorwerkModels=vorwerk.match(/assert\.equal\(catalogStats\.modelCount,(\d+)\);/);
 const vorwerkRecords=vorwerk.match(/assert\.equal\(catalogStats\.recordCount,(\d+)\);/);
 const vorwerkSlots=vorwerk.match(/assert\.equal\(progress\.reduce\(\(n,r\)=>n\+r\.slots,0\),(\d+)\);/);
 assert.ok(vorwerkModels&&vorwerkRecords&&vorwerkSlots,'Shared Vorwerk-test totals must be reviewed');
 for(const [match,label] of [[vorwerkModels,'model'],[vorwerkRecords,'record'],[vorwerkSlots,'goal']])vorwerk=replaceOnce(vorwerk,match[0],match[0].replace(','+match[1]+');',','+(Number(match[1])+records.length)+');'),'shared Vorwerk-test '+label+' count');
 outputs.set('tests/vorwerk-expansion.test.mjs',vorwerk);

 let workflow=read('tests/bosch-workflow.test.mjs');
 workflow=replaceOnce(workflow,'all 60 reviewed indices','all Bosch model-reference indices','Bosch workflow test log');
 outputs.set('tests/bosch-workflow.test.mjs',workflow);
 pkg.scripts.test+=' && node tests/bosch-models-next.test.mjs';
 pkg.scripts.check+=' && node --check src/data/bosch-models-next.js';
 outputs.set('package.json',JSON.stringify(pkg,null,2)+'\n');
 // All source data and patch anchors were validated before the first mutation.
 for(const [file,content] of outputs){fs.mkdirSync(path.dirname(path.join(target,file)),{recursive:true});fs.writeFileSync(path.join(target,file),content);}
 return {addedModels:records.length,boschModels:60+records.length,physicalBoschParts:102,newParts:0,state:'integrated',changedFiles:[...outputs.keys()]};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const {values}=parseArgs({options:{target:{type:'string'},evidence:{type:'string'},check:{type:'boolean',default:false}}});
 console.log(JSON.stringify(await integrateBoschModels({target:values.target,evidenceFile:values.evidence,check:values.check})));
}
