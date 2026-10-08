// Model-only intake for issue #23. No network, prices, parts or inferred SKU identities.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const branch='work/model-dyson-wave2';
const stateFile='src/data/dyson-models-wave2-state.json';
export const sha256=value=>createHash('sha256').update(value).digest('hex');
const normalize=value=>String(value).replace(/[™®]/g,'').normalize('NFKC').toUpperCase().replace(/[^A-Z0-9]/g,'');
const date=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&new Date(value).toISOString().slice(0,10)===value;
const namedPages={
 'Big Ball 2':'/support/vacuum-cleaners/cylinders/big-ball-2',
 'Omni-glide':'/support/vacuum-cleaners/multi-directional/omni-glide',
 PencilVac:'/staubsauger/kabellos/pencilvac/fluffycones'
};
function officialUrl(value){
 const url=new URL(value);
 assert.equal(url.protocol,'https:');assert.equal(url.hostname,'www.dyson.de');
 assert.ok(!url.username&&!url.password&&!url.port&&!url.search&&!url.hash,'Unqualified Dyson-DE source');
 return url;
}
function rawPack(text){
 const match=text.match(/export const brandPack=(\{[^\n]*\});/);
 assert.ok(match,'Expected checkpoint Dyson pack JSON');
 return JSON.parse(match[1]);
}
export function validateDysonEvidence(e,baseline){
 assert.equal(e.schemaVersion,1);assert.equal(e.manufacturer,'Dyson');assert.equal(e.issue,23);
 assert.equal(e.branch,branch);assert.equal(e.baseCommit,'d254df54d7bb4d72febdf9f2587efec9a66be336');
 assert.equal(e.appVersion,'1.28.0');assert.ok(date(e.checkedAt));
 assert.equal(e.sourceCheckpointSha256,'5cb8e5b9c155b8493ded22211778cbf224c538f73214cb41590dc95f6f41d0a3');
 assert.equal(baseline.brand,'Dyson');assert.equal(baseline.models.length,60);assert.equal(baseline.parts.length,191);
 assert.deepEqual([...e.baseline.modelCodes].sort(),baseline.models.map(m=>m.code).sort());
 assert.equal(e.baseline.independentModelCount,null,'Legacy names do not establish independent devices');
 assert.equal(e.baseline.modelAudit.length,60);assert.equal(new Set(e.baseline.modelAudit.map(m=>m.code)).size,60);
 assert.equal(e.baseline.partAudit.length,185);assert.equal(new Set(e.baseline.partAudit.map(p=>p.code)).size,185);
 for(const audit of e.baseline.modelAudit){
  const old=baseline.models.find(m=>m.code===audit.code);assert.ok(old);assert.equal(audit.model,old.model);
  assert.equal(audit.status,'existing-preserved');assert.equal(audit.newCountDelta,0);assert.equal(audit.independentBaseIdentity,null);
  assert.equal(audit.sourceObservation.fitmentReapproved,false);officialUrl(audit.sourceObservation.url);
 }
 for(const audit of e.baseline.partAudit){
  assert.ok(baseline.parts.some(p=>p.code===audit.code));assert.equal(audit.fitmentReapproved,false);
  assert.equal(officialUrl(audit.url).pathname,`/support/journey/spare-details.${audit.code}`);
  if(audit.status==='retrieved')assert.equal(audit.observedCode,audit.code);
 }
 assert.ok(Array.isArray(e.candidates)&&e.candidates.length>0);
 const accepted=e.candidates.filter(c=>c.status==='accepted');
 assert.ok(accepted.length>0&&accepted.length<=46,'Issue allows at most 46 additions');
 const known=new Set(baseline.models.flatMap(m=>[m.code,m.model,m.series,...(m.aliases||[]),...(m.deviceReferences||[])]).filter(Boolean).map(normalize));
 const identities=new Set(),codes=new Set(),names=new Set(),candidateIds=new Set();
 for(const c of e.candidates){
  assert.ok(['accepted','deferred','rejected'].includes(c.status));
  assert.ok(c.candidateId&&!candidateIds.has(c.candidateId),'Duplicate candidate');candidateIds.add(c.candidateId);
  assert.ok(Array.isArray(c.sources)&&c.sources.length>0);for(const s of c.sources)officialUrl(s.url);
  if(c.status!=='accepted'){assert.equal(c.countDelta,0);continue;}
  assert.equal(c.manufacturer,'Dyson');assert.equal(c.market,'DE');assert.equal(c.regionalVariant,null);
  assert.equal(c.countDecision,'one-independent-model-reference');assert.equal(c.countDelta,1);
  assert.ok(date(c.checkedAt));assert.equal(c.checkedAt,e.checkedAt);
  assert.ok(typeof c.independenceEvidence==='string'&&c.independenceEvidence.length>30);
  assert.ok(c.duplicateDecision&&Array.isArray(c.uncertainties)&&c.uncertainties.length>0);
  assert.equal(c.newParts,0);assert.deepEqual(c.relationships,[]);
  for(const key of ['price','stock','shipping','ean','deviceSku','productCode','parts','variants','aliases'])assert.ok(!Object.hasOwn(c,key),'Unproven field: '+key);
  const code=c.modelCode||c.canonicalModel;
  assert.equal(c.candidateId,code);assert.equal(c.baseIdentity,'Dyson:'+code.toUpperCase());
  assert.ok(!identities.has(c.baseIdentity)&&!codes.has(normalize(code))&&!names.has(normalize(c.canonicalModel)),'Duplicate model identity');
  assert.ok(!known.has(normalize(code))&&!known.has(normalize(c.canonicalModel)),'Existing model/series alias');
  identities.add(c.baseIdentity);codes.add(normalize(code));names.add(normalize(c.canonicalModel));
  const first=c.sources[0],url=officialUrl(first.url);
  assert.equal(first.status,'retrieved');assert.equal(first.method,'web-retrieval');assert.equal(first.checkedAt,c.checkedAt);
  assert.ok(/^[a-f0-9]{64}$/.test(first.sourceExtractSha256));assert.ok(first.observedTitle);
  if(c.modelCode){
   assert.ok(/^DC\d{2}(?:C|T2|T)?$/.test(code),'Explicit Dyson model identifier required');
   assert.equal(c.identityKind,'manufacturer-model-code');
   assert.equal(c.canonicalModel,code==='DC52'?'DC52 Cinetic':code);
   assert.ok(['cylinder','upright','stick'].includes(c.formFactor));
   assert.equal(c.deviceType,c.formFactor==='stick'?'cordless':'bagless');
   const family={cylinder:'cylinders',upright:'uprights',stick:'cordless'}[c.formFactor];
   assert.equal(url.pathname,`/support/vacuum-cleaners/${family}/${code==='DC52'?'dc52-cinetic':code.toLowerCase()}`);
   assert.ok(normalize(first.observedTitle).includes(normalize(code)),'Source title must identify model');
  }else{
   assert.ok(Object.hasOwn(namedPages,code),'Series, bundle and colour names cannot create models');
   assert.equal(c.identityKind,'official-generation-name');assert.equal(url.pathname,namedPages[code]);
   assert.equal(c.formFactor,code==='Big Ball 2'?'cylinder':'stick');
   assert.equal(c.deviceType,code==='Big Ball 2'?'bagless':'cordless');
   assert.ok(normalize(first.observedTitle).includes(normalize(code)));
  }
  for(const s of c.sources.slice(1)){
   const document=officialUrl(s.url);
   assert.ok(document.pathname.startsWith('/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/')&&document.pathname.endsWith('.pdf'));
   assert.equal(s.linkedFrom,first.url);assert.equal(s.method,'manufacturer-linked-document');assert.equal(s.checkedAt,c.checkedAt);
   assert.ok(['retrieved','linked-unreadable'].includes(s.status));
  }
 }
 const s=e.summary;
 assert.equal(s.acceptedNewModelReferences,accepted.length);
 assert.equal(s.deferredNewIdentities,e.candidates.filter(c=>c.status==='deferred').length);
 assert.equal(s.rejectedCandidates,e.candidates.filter(c=>c.status==='rejected').length);
 for(const [key,base] of [['legacyModelNamesAfter',54],['modelRecordsAfter',60],['globalModelNamesAfter',943],['globalModelRecordsAfter',954],['legacyTargetSlotsAfter',730]])assert.equal(s[key],base+accepted.length);
 assert.equal(s.independentTotal,null);assert.equal(s.newArticles,0);assert.equal(s.newFitmentRelationships,0);
 assert.equal(s.physicalPartsAfter,185);assert.equal(s.articlesAfter,191);
 assert.equal(s.articleReferencesRechecked,185);assert.equal(s.articleCodesConfirmed,e.baseline.partAudit.filter(p=>p.status==='retrieved').length);
 assert.equal(s.articleReferencesInconclusive,185-s.articleCodesConfirmed);
 assert.equal(s.legacyReferencesRechecked,60);assert.equal(s.legacyReferencesRetrieved,e.baseline.modelAudit.filter(m=>m.sourceObservation.status==='retrieved').length);
 return accepted.map(c=>({brand:'Dyson',code:c.modelCode||c.canonicalModel,model:c.canonicalModel,series:c.canonicalModel,
  identityKind:'model-reference',deviceType:c.deviceType,type:c.formFactor==='upright'?'Bürststaubsauger':c.formFactor==='cylinder'?'Bodenstaubsauger ohne Beutel':'Akku-Staubsauger',
  url:c.sources[0].url,partsUrl:c.sources[0].url,guideUrl:c.sources[0].url,checkedAt:c.checkedAt,partCount:0,physicalPartCount:0,
  deviceReferences:c.modelCode?[c.modelCode]:[],sourceNote:c.independenceEvidence,
  manuals:c.sources.slice(1).filter(s=>s.status==='retrieved').map(s=>({label:'Gebrauchsanweisung',url:s.url})),
  variantNote:'Hersteller-Modellreferenz. Vollständige Produktnummer und Geräteausführung am Typenschild prüfen; keine Teilepassung oder Produktnummer abgeleitet.',
  partListCoverage:{status:'not-reviewed',note:'Keine gerätespezifisch geprüfte Teileliste ergänzt.'},
  facts:[{label:'Herstellerkennung',value:c.modelCode||'Offizieller Generationsname; numerischer Typ-/Produktcode offen'}]}));
}
function replaceOnce(text,before,after,label){
 assert.equal(text.split(before).length,2,`Expected exactly one ${label} anchor; preserve conflicting work`);
 return text.replace(before,after);
}
function buildPlan(read,records){
 const outputs=new Map();
 outputs.set('src/data/dyson-models-wave2.js','// Generated by integrations/import-dyson-models-wave2.mjs. Model identity never approves a part.\nexport const dysonWave2Models='+JSON.stringify(records)+';\n');
 outputs.set('tests/dyson-models-wave2.test.mjs',fs.readFileSync(path.join(root,'integrations/dyson-models-wave2.test.template.mjs'),'utf8'));
 outputs.set('src/data/dyson-pack.js',read('src/data/dyson-pack.js')+"\nimport {dysonWave2Models} from './dyson-models-wave2.js';\nbrandPack.models.push(...dysonWave2Models);\n");
 const manualDelta=records.filter(r=>r.manuals.length>0).length;
 outputs.set('src/data/brand-index.js',read('src/data/brand-index.js')+"\nimport {dysonWave2Models} from './dyson-models-wave2.js';\nbrandIndex.push(...dysonWave2Models);\n"+
  `Object.assign(brandManifest.Dyson,{recordCount:${60+records.length},modelCount:${54+records.length},manualCount:${54+manualDelta},packBytes:null,verifiedAdditionalModelCount:${records.length},independentModelCount:null,note:'${records.length} zusätzliche Hersteller-Modell-/Generationsreferenzen. ${54+records.length} zählt Katalognamen, nicht belegte unabhängige Grundgeräte. Bestehende 185 physische Artikel bleiben erhalten; für die neuen Referenzen sind Teilelisten und Ausführungen offen.'});\n`);
 let products=read('src/data/brand-products.js');
 products=replaceOnce(products,'const id=brandDeviceId(r.brand,r.code),support=brandSupport[r.brand];',"const id=brandDeviceId(r.brand,r.code),support=brandSupport[r.brand];\n const dysonModelOnly=r.brand==='Dyson'&&r.identityKind==='model-reference';",'model-only discriminator');
 products=replaceOnce(products,"['Rowenta','Philips','Siemens','Vorwerk','Samsung','Hoover'].includes(r.brand)?","(['Rowenta','Philips','Siemens','Vorwerk','Samsung','Hoover'].includes(r.brand)||dysonModelOnly)?",'manufacturer model identifiers');
 products=replaceOnce(products,"...(r.brand==='Dyson'?[{type:'device-sku',value:r.code}]:[])","...(r.brand==='Dyson'&&!dysonModelOnly?[{type:'device-sku',value:r.code}]:[])",'real SKU identifier');
 products=replaceOnce(products,"deviceSku:r.brand==='Dyson'?r.code:null","deviceSku:r.brand==='Dyson'&&!dysonModelOnly?r.code:null",'real SKU field');
 products=replaceOnce(products,"...(r.brand==='Dyson'?[{label:'Dyson-Produktnummer',value:r.code}]:[])","...(r.brand==='Dyson'&&!dysonModelOnly?[{label:'Dyson-Produktnummer',value:r.code}]:[])",'real SKU fact');
 outputs.set('src/data/brand-products.js',products);
 let typeplate=read('src/core/typeplate.js');
 typeplate=replaceOnce(typeplate,'(?:V\\d+|GEN5|CYCLONE|CINETIC|BIG\\s+BALL)/i.test(line)','(?:DC\\d{2}(?:C|T2|T)?|OMNI-GLIDE|PENCILVAC|V\\d+|GEN5|CYCLONE|CINETIC|BIG\\s+BALL)/i.test(line)','bare Dyson model recognition');
 typeplate=replaceOnce(typeplate,"else add(kind,content.match(/^[A-Z0-9][A-Z0-9._/-]*(?:\\s+[A-Z0-9][A-Z0-9._/-]*){0,4}/i)?.[0]||'',index);", "else if(brands.length===1&&brands[0]==='DYSON')add(kind,content,index);else add(kind,content.match(/^[A-Z0-9][A-Z0-9._/-]*(?:\\s+[A-Z0-9][A-Z0-9._/-]*){0,4}/i)?.[0]||'',index);",'untruncated Dyson model field');
 typeplate=replaceOnce(typeplate,'const same=(a,b)=>compactIdentifier(a)===compactIdentifier(b);',"const same=(a,b)=>compactIdentifier(a)===compactIdentifier(b);\nconst dysonModelKey=value=>String(value).replace(/[™®]/g,'').trim().toUpperCase().replace(/\\s+/g,' ');\nconst sameDysonModel=(a,b)=>dysonModelKey(a)===dysonModelKey(b);",'strict new Dyson reference comparison');
 const oldModelMatch="if(entry.kind==='model')entry.matches=scopedCatalog.filter(p=>same(p.model,entry.value)||same(p.vacuumMeta?.series||'',entry.value)||(['Rowenta','Philips','Siemens','Vorwerk','Samsung','Hoover'].includes(p.brand)&&p.identifiers.some(i=>i.type==='manufacturer-model'&&same(i.value,entry.value)))).map(p=>p.id);";
 const newModelMatch="if(entry.kind==='model')entry.matches=scopedCatalog.filter(p=>p.brand==='Dyson'&&p.deviceSku===null?(sameDysonModel(p.model,entry.value)||p.identifiers.some(i=>i.type==='manufacturer-model'&&sameDysonModel(i.value,entry.value))):same(p.model,entry.value)||same(p.vacuumMeta?.series||'',entry.value)||(['Rowenta','Philips','Siemens','Vorwerk','Samsung','Hoover'].includes(p.brand)&&p.identifiers.some(i=>i.type==='manufacturer-model'&&same(i.value,entry.value)))).map(p=>p.id);";
 typeplate=replaceOnce(typeplate,oldModelMatch,newModelMatch,'exact Dyson model-code recognition');
 outputs.set('src/core/typeplate.js',typeplate);
 for(const file of ['tests/catalog-seven-brands.test.mjs','tests/vorwerk-expansion.test.mjs']){
  let text=read(file);
  for(const [before,after] of [
   ['assert.equal(catalogStats.modelCount,943);',`assert.equal(catalogStats.modelCount,${943+records.length});`],
   ['assert.equal(catalogStats.recordCount,954);',`assert.equal(catalogStats.recordCount,${954+records.length});`],
   ['assert.equal(progress.reduce((n,r)=>n+r.slots,0),730);',`assert.equal(progress.reduce((n,r)=>n+r.slots,0),${730+records.length});`]
  ])text=replaceOnce(text,before,after,file+' count');
  outputs.set(file,text);
 }
 outputs.set('tests/philips-expansion.test.mjs',replaceOnce(read('tests/philips-expansion.test.mjs'),"['Dyson',54,191]",`['Dyson',${54+records.length},191]`,'Dyson legacy names count'));
 const pkg=JSON.parse(read('package.json'));assert.equal(pkg.version,'1.28.0');
 pkg.scripts.test+=' && node tests/dyson-models-wave2.test.mjs';
 pkg.scripts.check+=' && node --check src/data/dyson-models-wave2.js && node --check tests/dyson-models-wave2.test.mjs';
 outputs.set('package.json',JSON.stringify(pkg,null,2)+'\n');
 return outputs;
}
function rejectSymlinks(folder){
 assert.ok(!fs.lstatSync(folder).isSymbolicLink(),'Symlink target refused');
 for(const entry of fs.readdirSync(folder,{withFileTypes:true})){
  assert.ok(!entry.isSymbolicLink(),'Symlink in target refused: '+entry.name);
  if(entry.isDirectory())rejectSymlinks(path.join(folder,entry.name));
 }
}
function safeTarget(target){
 assert.equal(execFileSync('git',['branch','--show-current'],{cwd:root,encoding:'utf8'}).trim(),branch,'Only work/model-dyson-wave2 is authorized');
 assert.ok(target!==root&&!root.startsWith(target+path.sep),'Target cannot contain repository');
 // Check every existing parent, not just the final path, before reading or copying.
 for(let current=target;;current=path.dirname(current)){
  assert.ok(!fs.lstatSync(current).isSymbolicLink(),'Symlink path refused');
  if(path.dirname(current)===current)break;
 }
 assert.ok(fs.statSync(target).isDirectory(),'Restored directory required');rejectSymlinks(target);
 let targetRepository=null;
 try{targetRepository=execFileSync('git',['rev-parse','--show-toplevel'],{cwd:target,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{}
 assert.ok(!targetRepository||targetRepository===root,'Target belongs to a different repository/worktree');
 if(target.startsWith(root+path.sep))assert.equal(execFileSync('git',['ls-files','--',path.relative(root,target)],{cwd:root,encoding:'utf8'}).trim(),'','Tracked target refused');
}
function treeSnapshot(target){
 const entries={};const walk=(folder,prefix='')=>{
  for(const entry of fs.readdirSync(folder,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
   assert.ok(!entry.isSymbolicLink(),'Concurrent symlink refused');const file=path.join(folder,entry.name),key=prefix+entry.name;
   if(entry.isDirectory())walk(file,key+'/');else entries[key]=sha256(fs.readFileSync(file));
  }
 };walk(target);return entries;
}
export function integrateDysonModels({target=path.join(root,'site'),evidenceFile=path.join(root,'integrations/dyson-model-research-wave2.json'),check=false,transactionFs=fs}={}){
 target=path.resolve(target);safeTarget(target);
 const evidenceBytes=fs.readFileSync(evidenceFile),e=JSON.parse(evidenceBytes);
 const oldState=fs.existsSync(path.join(target,stateFile))?JSON.parse(fs.readFileSync(path.join(target,stateFile),'utf8')):null;
 if(oldState){assert.equal(oldState.schemaVersion,1);assert.equal(oldState.evidenceSha256,sha256(evidenceBytes),'Evidence changed since intake');}
 const read=file=>oldState&&Object.hasOwn(oldState.beforeFiles,file)?oldState.beforeFiles[file]:fs.readFileSync(path.join(target,file),'utf8');
 assert.equal(Object.keys(e.baseline.fileSha256).length,131,'Complete checkpoint required');
 for(const [file,hash] of Object.entries(e.baseline.fileSha256)){
  assert.ok(!path.isAbsolute(file)&&!file.split('/').includes('..'),'Unsafe checkpoint path');
  const bytes=oldState&&Object.hasOwn(oldState.beforeFiles,file)?oldState.beforeFiles[file]:fs.readFileSync(path.join(target,file));
  assert.equal(sha256(bytes),hash,'Checkpoint conflict: '+file);
 }
 const records=validateDysonEvidence(e,rawPack(read('src/data/dyson-pack.js')));
 const outputs=buildPlan(read,records);
 const beforeFiles=Object.fromEntries([...outputs.keys()].filter(file=>Object.hasOwn(e.baseline.fileSha256,file)).map(file=>[file,read(file)]));
 const state={schemaVersion:1,evidenceSha256:sha256(evidenceBytes),beforeFiles,outputSha256:Object.fromEntries([...outputs].map(([file,content])=>[file,sha256(content)]))};
 outputs.set(stateFile,JSON.stringify(state,null,2)+'\n');
 if(oldState){
  for(const [file,content] of outputs)assert.equal(fs.readFileSync(path.join(target,file),'utf8'),content,'Integrated output conflict: '+file);
  return {state:'already-integrated',addedModels:records.length,newParts:0,changedFiles:[]};
 }
 for(const file of outputs.keys())if(!Object.hasOwn(e.baseline.fileSha256,file))assert.ok(!fs.existsSync(path.join(target,file)),'Generated-file collision: '+file);
 assert.ok(!check,'Dyson intake has not been applied');
 // All preconditions and patch anchors are checked before touching the target.
 const stage=target+'.dyson-stage-'+randomUUID(),backup=target+'.dyson-backup-'+randomUUID();
 let moved=false,committed=false;
 const beforeTree=treeSnapshot(target);
 try{
  transactionFs.cpSync(target,stage,{recursive:true,errorOnExist:true,force:false});
  for(const [file,content] of outputs){transactionFs.mkdirSync(path.dirname(path.join(stage,file)),{recursive:true});transactionFs.writeFileSync(path.join(stage,file),content);}
  // Detect concurrent changes, including generated-file collisions and build assets.
  assert.deepEqual(treeSnapshot(target),beforeTree,'Concurrent target conflict');
  transactionFs.renameSync(target,backup);moved=true;
  transactionFs.renameSync(stage,target);committed=true;
 }catch(error){
  if(moved&&!committed)fs.renameSync(backup,target);
  throw error;
 }finally{
  if(fs.existsSync(stage))fs.rmSync(stage,{recursive:true,force:true});
  if(committed&&fs.existsSync(backup))fs.rmSync(backup,{recursive:true,force:true});
 }
 return {state:'integrated',addedModels:records.length,modelNames:54+records.length,modelRecords:60+records.length,independentTotal:null,physicalParts:185,newParts:0,changedFiles:[...outputs.keys()]};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const {values}=parseArgs({options:{target:{type:'string'},evidence:{type:'string'},check:{type:'boolean',default:false}}});
 console.log(JSON.stringify(integrateDysonModels({target:values.target,evidenceFile:values.evidence,check:values.check})));
}
