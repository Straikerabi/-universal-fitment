import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

export const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const digest=value=>createHash('sha256').update(value).digest('hex');
export const canonical=value=>String(value).toUpperCase().replace(/[^A-Z0-9]/g,'');
const pin={baseline:'5dc35ecae101e0e472881418d57bafc4ecd439eba5a6180dc041bf17eff101f5',research:'54e0eefe7f6b92642e6f5f1bc475ba7984f8cb17271cf478da21c857d8610b2b'};
const marker='\n// MODEL-GAP-WAVE3: generated integration\n';
export const readEvidence=()=>JSON.parse(fs.readFileSync(path.join(projectRoot,'integrations/model-gap-wave3-research.json')));
export const readBaseline=()=>JSON.parse(fs.readFileSync(path.join(projectRoot,'integrations/model-gap-wave3-baseline.json')));

export function validateEvidence(evidence,baseline=readBaseline()){
 assert.equal(evidence.issue,37);assert.equal(evidence.schemaVersion,1);
 assert.equal(evidence.branch,'work/catalog-model-gap-wave3');
 assert.equal(evidence.baselineCommit,'d4853c4e5245410630742f58aead661d77f42c32');
 assert.equal(baseline.commit,evidence.baselineCommit);assert.equal(baseline.version,'1.29.0');
 assert.equal(Object.keys(baseline.sourceFiles).length,136);
 const sources=new Map(evidence.sources.map(s=>[s.id,s]));assert.equal(sources.size,evidence.sources.length);
 const official=new Set(['www.vorwerk.com','support-switzerland.vorwerk.com','www1.miele.de','www.dyson.com','www.samsung.com']);
 for(const s of sources.values()){
  const url=new URL(s.url);assert.equal(url.protocol,'https:');assert.ok(official.has(url.hostname));
  assert.equal(s.httpStatus,200);assert.match(s.responseSha256,/^[a-f0-9]{64}$/);assert.ok(s.responseBytes>1000);
  assert.equal(s.checkedAt,evidence.checkedAt);assert.ok(['DE','CH','SK','US','RU'].includes(s.market));
 }
 const ids=new Set(),groups=new Set(),seen={};
 for(const [brand,keys] of Object.entries(baseline.identityKeys))seen[brand]=new Set(keys);
 for(const c of evidence.candidates){
  assert.ok(!ids.has(c.id),'Duplicate decision ID');ids.add(c.id);
  assert.ok(['accepted','rejected','deferred'].includes(c.decision));
  assert.equal(c.checkedAt,evidence.checkedAt);assert.ok(c.sourceIds.length&&c.sourceIds.every(id=>sources.has(id)));
  if(c.decision!=='accepted'){assert.equal(c.addedModelCount,0);assert.ok(c.reason.length>30);continue;}
  assert.ok(seen[c.brand]);assert.equal(c.addedParts,0);assert.equal(c.addedFitment,0);
  assert.equal(c.variantStatus,'execution_open');assert.equal(c.typePlateCode,null);
  assert.equal(c.materialNumber,null);assert.equal(c.ean,null);assert.equal(c.constructionCountContribution,null);
  assert.ok(!groups.has(c.baseDeviceKey),'Duplicate base group');groups.add(c.baseDeviceKey);
  assert.ok(c.independenceBasis.length>40&&c.duplicateDecision.length>40&&c.uncertainties.length>=2);
  const keys=[c.modelCode,c.modelName,...c.aliases,...c.deviceReferences].map(canonical);
  assert.ok(keys.every(k=>k&&!seen[c.brand].has(k)),'Existing model/alias collision: '+c.modelCode);
  keys.forEach(k=>seen[c.brand].add(k));
  if(c.brand==='Miele')assert.match(c.modelCode,/^S [1-9]\d{3}$/);
  if(c.brand==='Dyson')assert.match(c.modelCode,/^DC\d{2}$/);
  if(c.brand==='Samsung'){
   assert.match(c.modelCode,/^VCC?[A-Z0-9]{7,12}$/);assert.equal(c.deviceReferences.length,1);
   assert.match(c.deviceReferences[0],new RegExp('^'+c.modelCode+'/[A-Z0-9]{2,3}$'));
  }
  if(c.brand==='Vorwerk')assert.match(c.modelCode,/^(?:Kobold (?:30|32|33|35|38|52|53|114|116|117|118|119)|VK240|VT250)$/);
  assert.ok(['canister','upright','historical-household'].includes(c.formFactor));
 }
 const models=evidence.candidates.filter(c=>c.decision==='accepted');assert.equal(models.length,22);
 for(const [brand,row] of Object.entries(evidence.result.byBrand)){
  assert.equal(models.filter(c=>c.brand===brand).length,row.added);
  assert.equal(row.before,baseline.coverage.find(r=>r.brand===brand).models);
  assert.equal(row.after,row.before+row.added);assert.equal(row.remaining,100-row.after);
 }
 const bound=evidence.vorwerkBoundary;assert.equal(bound.confirmedNamedProfiles,18+14);
 assert.equal(bound.conditionalArchiveLabelCeiling,32+bound.unresolvedNamedLabels.length+bound.range.unprovedPotentialSlots);
 assert.equal(bound.range.expandedIntoModels,false);assert.equal(bound.absoluteGlobalTechnicalMaximum,null);
 // Whole evidence is reviewed, not an editable source of arbitrary trusted model claims.
 assert.equal(digest(JSON.stringify(baseline)),pin.baseline,'Reviewed baseline changed');
 assert.equal(digest(JSON.stringify(evidence)),pin.research,'Reviewed research changed');
 return {models,sources,baseline};
}

export function rawRow(c,sources){
 const source=sources.get(c.sourceIds[0]),url=source.url+(c.locator.pdfPage?'#page='+c.locator.pdfPage:'');
 const note='Hersteller-Modellreferenz; Ausführung und jede Teilepassung bleiben offen. Quellenmarkt: '+c.market+'. Historische Namen werden nicht um unbelegte VK-/VT-/VB-Präfixe ergänzt. Vorsatzgeräte haben eigene Typkennungen.';
 return {brand:c.brand,code:c.modelCode,model:c.modelName,series:c.series,deviceType:c.deviceType,type:c.formFactor==='historical-household'?'Historischer Haushaltsstaubsauger · Modellname, Typenschild offen':c.formFactor==='upright'?'Bürststaubsauger · US-Modellreferenz':'Bodenstaubsauger · Ausführung offen',identityKind:'model-reference',identityClass:c.identityClass,sourceMarket:c.market,deviceReferences:c.deviceReferences,aliases:c.aliases,bagSystem:'unknown',url,guideUrl:url,partsUrl:url,checkedAt:c.checkedAt,partCount:0,physicalPartCount:0,sourceNote:c.independenceBasis+' '+c.duplicateDecision,variantNote:note,manuals:c.brand==='Dyson'?[{label:'Hersteller-Geräteanleitung · US · Ausführung prüfen',url:sources.get(c.sourceIds[1]).url}]:[{label:'Historischer Hersteller-Modellbeleg (keine Geräteanleitung)',url}],facts:[{label:'Quellenmarkt',value:c.market},{label:'Identitätsgrenze',value:c.uncertainties.join(' ')},{label:'Teileabdeckung',value:'0 gerätespezifisch geprüfte Artikel'}],partListCoverage:{status:'not-reviewed',sourceUrl:url,note:'0 gerätespezifisch geprüfte Teile; keine Familienpassung übernommen.'}};
}
export function mieleProduct(c,sources){
 const r=rawRow(c,sources),id='vac-miele-model-'+canonical(c.modelCode).toLowerCase();
 return {id,recordType:'model',category:'vacuum',icon:'🧹',brand:'Miele',model:c.modelName,type:r.type,aliases:c.aliases,accessoryAliases:[],imageUrl:null,equipment:[],controlType:'',identifiers:[{type:'manufacturer-model',value:c.modelCode}],dataStatus:'manufacturer-verified',identityStatus:'model_reference',variantStatus:'execution_open',deviceReferences:c.deviceReferences,variantNote:r.variantNote,vacuumMeta:{series:c.series,bagSystem:'unknown',deviceType:c.deviceType,formFactor:c.formFactor,filterSystem:null,color:null,materialNumber:null,modelName:c.modelName,currentListing:false},sources:[{name:'Miele · historische Gerätequelle',url:r.url,type:'manufacturer',grade:'A',license:'source-linked',retrievedAt:c.checkedAt,note:r.sourceNote}],manuals:r.manuals,parts:[],candidateParts:[],stockPlans:[],issues:[],jobs:[],partListCoverage:r.partListCoverage,facts:r.facts};
}
function safePath(root,relative,{allowMissing=false}={}){
 assert.ok(!path.isAbsolute(relative)&&!relative.split('/').some(x=>x==='..'||x===''),'Unsafe relative path');
 let current=root;
 const segments=relative.split('/');
 for(let i=0;i<segments.length;i++){
  current=path.join(current,segments[i]);
  try{assert.ok(!fs.lstatSync(current).isSymbolicLink(),'Symlink source: '+relative);}
  catch(error){if(!(error.code==='ENOENT'&&allowMissing&&i===segments.length-1))throw error;}
 }
 return current;
}
const replace=(raw,before,after)=>{assert.equal(raw.split(before).length-1,1,'Changed integration anchor: '+before);return raw.replace(before,after);};

export async function createPlan({target,evidence=readEvidence()}={}){
 const {models,sources,baseline}=validateEvidence(evidence);
 assert.ok(!fs.lstatSync(target).isSymbolicLink(),'Target root may not be a symlink');
 const root=fs.realpathSync(target);assert.equal(root,path.resolve(target),'Target ancestors may not be symlinks');
 const clean=fs.mkdtempSync(path.join(os.tmpdir(),'uf-wave3-baseline-'));
 const originals={};
 try{
  execFileSync('python3',[path.join(projectRoot,'integrations/restore-source-checkpoint.py'),'--target',path.join(clean,'site')],{cwd:projectRoot,stdio:'pipe'});
  for(const [relative,sha] of Object.entries(baseline.sourceFiles)){
   const content=fs.readFileSync(path.join(clean,'site',relative));assert.equal(digest(content),sha,'Checkpoint is not the reviewed v1.29.0 baseline: '+relative);originals[relative]=content;
  }
 }finally{fs.rmSync(clean,{recursive:true,force:true});}
 const raw={},changed=new Map(),add=(relative,text)=>changed.set(relative,Buffer.from(text));
 for(const relative of Object.keys(originals))raw[relative]=fs.readFileSync(safePath(root,relative));
 const counts=evidence.result.byBrand;
 const audit={baseline:{productsSha256:baseline.productsSha256,hydratedProductsSha256:baseline.hydratedProductsSha256,partsSha256:baseline.partsSha256,hydratedPartsSha256:baseline.hydratedPartsSha256,hydratedArticleCount:1940},result:evidence.result,vorwerkBoundary:evidence.vorwerkBoundary,models:models.map(c=>({brand:c.brand,code:c.modelCode,model:c.modelName,identityClass:c.identityClass,market:c.market,id:c.brand==='Miele'?'vac-miele-model-'+canonical(c.modelCode).toLowerCase():'vac-'+c.brand.toLowerCase()+'-model-'+encodeURIComponent(c.modelCode.toLowerCase()).replace(/%/g,'_')}))};
 let module='// Generated by integrations/import-model-gap-wave3-catalog.mjs; no new articles or fitment.\n';
 for(const brand of ['Dyson','Samsung','Vorwerk'])module+='export const '+brand.toLowerCase()+'Wave3Rows='+JSON.stringify(models.filter(c=>c.brand===brand).map(c=>rawRow(c,sources)))+';\n';
 module+='export const mieleWave3Models='+JSON.stringify(models.filter(c=>c.brand==='Miele').map(c=>mieleProduct(c,sources)))+';\nexport const wave3Audit='+JSON.stringify(audit)+';\n';
 add('src/data/model-gap-wave3.js',module);
 const text=relative=>originals[relative].toString();
 let miele=text('src/data/miele-models.js');
 miele=replace(miele,"import { mieleWave2Models } from './miele-models-wave2.js';","import { mieleWave2Models } from './miele-models-wave2.js';\nimport {mieleWave3Models} from './model-gap-wave3.js';");
 miele=replace(miele,'...mieleWave2Models];','...mieleWave2Models,...mieleWave3Models];');add('src/data/miele-models.js',miele);
 for(const brand of ['Dyson','Samsung','Vorwerk']){
  const lower=brand.toLowerCase(),relative='src/data/'+lower+'-pack.js';
  add(relative,text(relative)+marker+`import {${lower}Wave3Rows} from './model-gap-wave3.js';\nbrandPack.models.push(...${lower}Wave3Rows);\n`);
 }
 const require=createRequire(new URL('./auth-sdk/package.json',import.meta.url));
 const esbuild=require('esbuild'),packBytes={};
 for(const brand of ['Dyson','Samsung','Vorwerk']){
  const filename=brand.toLowerCase()+'-pack.js';
  const built=await esbuild.build({stdin:{contents:changed.get('src/data/'+filename).toString(),resolveDir:path.join(root,'src/data'),sourcefile:filename},bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'inline',write:false,plugins:[{name:'wave3-reviewed-module',setup(build){build.onResolve({filter:/^\.\/model-gap-wave3\.js$/},()=>({path:'wave3',namespace:'wave3'}));build.onLoad({filter:/.*/,namespace:'wave3'},()=>({contents:module,loader:'js'}));}}]});
  packBytes[brand]=built.outputFiles[0].contents.length;
 }
 let index=text('src/data/brand-index.js')+marker+"import {dysonWave3Rows,samsungWave3Rows,vorwerkWave3Rows} from './model-gap-wave3.js';\nbrandIndex.push(...dysonWave3Rows,...samsungWave3Rows,...vorwerkWave3Rows);\n";
 for(const brand of ['Dyson','Samsung','Vorwerk']){
  const old=baseline.coverage.find(c=>c.brand===brand),row=counts[brand],manuals=old.manuals;
  index+=`Object.assign(brandManifest.${brand},`+JSON.stringify({recordCount:old.records+row.added,modelCount:row.after,manualCount:manuals,packBytes:packBytes[brand],independentModelCount:null,wave3AddedProfileCount:row.added,note:(brand==='Dyson'?'Katalognamen, nicht belegte unabhängige Grundgeräte. ':'')+row.added+' zusätzliche geprüfte Herstellerprofile; Quellenmarkt und Identitätsgrenzen am Gerät sichtbar. Keine neuen Artikel oder Teilepassungen. '+row.remaining+' Zielplätze offen.'})+');\n';
 }
 add('src/data/brand-index.js',index);
 let plate=text('src/core/typeplate.js');
 plate=replace(plate,"import {products,partsCatalog} from '../data/catalog.js';","import {products,partsCatalog} from '../data/catalog.js';\nimport {vorwerkWave3Rows,mieleWave3Models} from '../data/model-gap-wave3.js';\nconst historicalVorwerkName=value=>vorwerkWave3Rows.find(r=>r.identityClass==='historical-name-reference'&&String(value).trim().toUpperCase().replace(/\\s+/g,' ')===r.model.toUpperCase())?.model||null;\nconst mieleWave3Name=value=>mieleWave3Models.find(r=>[r.model,...r.aliases].some(name=>String(value).trim().toUpperCase().replace(/\\s+/g,' ')===name.toUpperCase()))?.model||null;");
 plate=replace(plate,"else if(['type','model'].includes(kind)&&brands.length===1&&brands[0]==='MIELE'&&mieleHistoricalCode(content))","else if(['type','model'].includes(kind)&&brands.length===1&&brands[0]==='MIELE'&&mieleWave3Name(content))add('model',mieleWave3Name(content),index);\n   else if(['type','model'].includes(kind)&&brands.length===1&&brands[0]==='MIELE'&&mieleHistoricalCode(content))");
 plate=replace(plate,"else if(kind==='model'){const families=","else if(['type','model'].includes(kind)&&brands.length===1&&brands[0]==='VORWERK'&&historicalVorwerkName(content))add('model',historicalVorwerkName(content),index);\n   else if(kind==='model'){const families=");
 plate=replace(plate,'if(!field){\n',"if(!field){\n   if(brands.length===1&&brands[0]==='MIELE'){const name=mieleWave3Name(line.replace(/^MIELE\\s+/i,''));if(name){add('model',name,index);continue;}}\n   if(brands.length===1&&brands[0]==='VORWERK'){const historic=historicalVorwerkName(line.replace(/^VORWERK\\s+/i,''));if(historic){add('model',historic,index);continue;}}\n");
 plate=replace(plate,"add('model',parseVorwerkModel(match[0])?.code||match[0],index);","{const parsedModel=parseVorwerkModel(match[0]);if(['VK240','VT250'].includes(parsedModel?.code)&&parseVorwerkModel(line.replace(/^VORWERK\\s+/i,''))?.code!==parsedModel.code)continue;add('model',parsedModel?.code||match[0],index);}");add('src/core/typeplate.js',plate);
 // Only local test expectation adjustments: prior source records remain byte/object-identical.
 for(const relative of ['tests/catalog-seven-brands.test.mjs','tests/catalog-v126.test.mjs','tests/philips-expansion.test.mjs','tests/bosch-catalog.test.mjs','tests/vorwerk-expansion.test.mjs','tests/miele-models-wave2.test.mjs','tests/dyson-models-wave2.test.mjs','tests/catalog-expansion.test.mjs']){
  let test=text(relative).replace(/catalogStats\.modelCount,\s*1082/g,'catalogStats.modelCount,1104').replace(/catalogStats\.recordCount,\s*1093/g,'catalogStats.recordCount,1115').replace(/,\s*869\)/g,',891)');
  if(relative.includes('catalog-expansion'))test=replace(test,"assert.equal(new URL(p.spareFinderUrl).hostname,brand==='AEG'?'shop.aeg.de':'www.dyson.de');","assert.equal(new URL(p.spareFinderUrl).hostname,brand==='AEG'?'shop.aeg.de':p.facts.some(f=>f.label==='Quellenmarkt'&&f.value==='US')?'www.dyson.com':'www.dyson.de');");
  if(relative.includes('bosch-catalog'))test=replace(test,"filterCatalog({brand:'Miele'}).length,87","filterCatalog({brand:'Miele'}).length,89");
  if(relative.includes('philips-expansion'))test=test.replace("['Miele',82,167]","['Miele',84,167]").replace("['Dyson',92,191]","['Dyson',96,191]");
  if(relative.includes('catalog-v126'))test=test.replace(/brand==='Vorwerk'\)\.models,18/g,"brand==='Vorwerk').models,32").replace(/brand==='Samsung'\)\.models,77/g,"brand==='Samsung').models,79").replace("brand==='Samsung').recordsWithoutParts,57","brand==='Samsung').recordsWithoutParts,59").replace("brand:'Samsung',partCoverage:'missing'}).length,57","brand:'Samsung',partCoverage:'missing'}).length,59");
  if(relative.includes('vorwerk-expansion')){
   test=replace(test,'brandPack.models.map(m=>m.code),codes','brandPack.models.slice(0,18).map(m=>m.code),codes');
   test=replace(test,"const models=filterCatalog({brand:'Vorwerk'}),refs=","const models=filterCatalog({brand:'Vorwerk'}).filter(p=>codes.some(code=>p.id==='vac-vorwerk-model-'+code.toLowerCase())),refs=");
   test=test.replace(/brand==='Vorwerk'\)\.models,18/g,"brand==='Vorwerk').models,32");
  }
  if(relative.includes('miele-models-wave2')){
   test="import {mieleWave3Models} from '../src/data/model-gap-wave3.js';\n"+test;
   test=replace(test,'!newIds.has(m.id))), audit.baseline.modelsSha256','!newIds.has(m.id)&&!mieleWave3Models.some(n=>n.id===m.id))), audit.baseline.modelsSha256');
   test=test.replace(/brand === 'Dyson'\)\.length,98/g,"brand === 'Dyson').length,102").replace(/brand === 'Samsung'\)\.length,77/g,"brand === 'Samsung').length,79");
   test=test.replace(/audit\.result\.finalModelCount\)/g,'audit.result.finalModelCount+2)').replace(/audit\.result\.finalRecordCount\)/g,'audit.result.finalRecordCount+2)');
   test=replace(test,'coverage.recordsWithoutParts, audit.result.addedModelCount','coverage.recordsWithoutParts, audit.result.addedModelCount+2');
   test=replace(test,".map(p => p.id)), newIds);",".map(p => p.id)), new Set([...newIds,...mieleWave3Models.map(p=>p.id)]));");
  }
  if(relative.includes('dyson-models-wave2')){
   test="import {dysonWave3Rows} from '../src/data/model-gap-wave3.js';\n"+test;
   test=replace(test,"p.brand==='Dyson'&&!legacyIds.has(p.id)","p.brand==='Dyson'&&!legacyIds.has(p.id)&&!dysonWave3Rows.some(r=>brandDeviceId('Dyson',r.code)===p.id)");
   test=test.replace(/brand==='Miele'&&p.recordType==='model'\)\.length,87/g,"brand==='Miele'&&p.recordType==='model').length,89").replace(/brand==='Samsung'\)\.length,77/g,"brand==='Samsung').length,79");
   test=test.replace('brandPack.models.length,98','brandPack.models.length,102').replace('brandManifest.Dyson.modelCount,92','brandManifest.Dyson.modelCount,96').replace('brandManifest.Dyson.recordCount,98','brandManifest.Dyson.recordCount,102').replace("partCoverage:'missing'}).length,40","partCoverage:'missing'}).length,44").replace('[92,98,191,185,40]','[96,102,191,185,44]');
  }
  add(relative,test);
 }
 add('tests/model-gap-wave3.test.mjs',fs.readFileSync(path.join(projectRoot,'integrations/model-gap-wave3-app-test.mjs')));
 add('package.json',replace(text('package.json'),'node tests/dyson-models-wave2.test.mjs"','node tests/dyson-models-wave2.test.mjs && node tests/model-gap-wave3.test.mjs"'));
 for(const [relative,content] of Object.entries(raw))assert.ok(content.equals(originals[relative])||changed.get(relative)?.equals(content),'Source conflict; nothing written: '+relative);
 for(const [relative,output] of changed)if(!(relative in raw)){
  const filename=safePath(root,relative,{allowMissing:true});raw[relative]=fs.existsSync(filename)?fs.readFileSync(filename):null;
  assert.ok(raw[relative]===null||raw[relative].equals(output),'New output collision: '+relative);
 }
 const states=[...changed].map(([relative,output])=>raw[relative]?.equals(output)===true);
 assert.ok(states.every(Boolean)||states.every(v=>!v),'Partial Wave3 import rejected');
 return {root,changed,raw,models,audit,packBytes,alreadyImported:states.every(Boolean)};
}

export function commitPlan(plan,{rename=fs.renameSync}={}){
 const lock=path.join(plan.root,'.model-gap-wave3.lock'),fd=fs.openSync(lock,'wx');
 let stage;const mutations=[];
 try{
  fs.closeSync(fd);stage=fs.mkdtempSync(path.join(plan.root,'.model-gap-wave3-stage-'));
  const entries=[...plan.changed].map(([relative,content],i)=>{
   const filename=safePath(plan.root,relative,{allowMissing:true}),staged=path.join(stage,'new-'+i);
   fs.writeFileSync(staged,content,{flag:'wx',mode:fs.existsSync(filename)?fs.statSync(filename).mode&0o777:0o644});
   return {filename,staged,backup:path.join(stage,'old-'+i),oldMoved:false,published:false};
  });
  for(const [relative,expected] of Object.entries(plan.raw)){
   const filename=safePath(plan.root,relative,{allowMissing:expected===null});
   const current=fs.existsSync(filename)?fs.readFileSync(filename):null;
   assert.ok(expected===null?current===null:current?.equals(expected),'Source changed during staging: '+relative);
  }
  for(const entry of entries){mutations.push(entry);if(fs.existsSync(entry.filename)){rename(entry.filename,entry.backup);entry.oldMoved=true;}rename(entry.staged,entry.filename);entry.published=true;}
 }catch(error){for(const entry of mutations.reverse()){if(entry.published)fs.unlinkSync(entry.filename);if(entry.oldMoved)fs.renameSync(entry.backup,entry.filename);}throw error;}
 finally{if(stage)fs.rmSync(stage,{recursive:true,force:true});fs.unlinkSync(lock);}
}
export async function importCatalog({target=path.join(projectRoot,'site'),evidence=readEvidence(),check=false,dryRun=false,transactionOptions}={}){
 const plan=await createPlan({target,evidence});
 if(check)assert.ok(plan.alreadyImported,'Not imported; --check never writes');
 if(!check&&!dryRun&&!plan.alreadyImported)commitPlan(plan,transactionOptions);
 return {issue:37,addedProfiles:check||dryRun||plan.alreadyImported?0:22,plannedProfiles:22,addedParts:0,addedFitment:0,alreadyImported:plan.alreadyImported,check,dryRun,packBytes:plan.packBytes,changedFiles:[...plan.changed.keys()]};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const args=process.argv.slice(2),options={};
  while(args.length){const arg=args.shift();if(arg==='--target'||arg==='--evidence'){assert.ok(args[0]&&!args[0].startsWith('--'),'Missing argument');const value=args.shift();if(arg==='--target')options.target=value;else options.evidence=JSON.parse(fs.readFileSync(value));}else if(arg==='--check')options.check=true;else if(arg==='--dry-run')options.dryRun=true;else throw Error('Unknown option: '+arg);}
  assert.ok(!(options.check&&options.dryRun),'Conflicting modes');console.log(JSON.stringify(await importCatalog(options),null,2));
 }catch(error){console.error(error.message);process.exitCode=1;}
}
