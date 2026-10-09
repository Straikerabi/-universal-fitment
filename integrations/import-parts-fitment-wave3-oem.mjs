// Issue #38: offline, checksum-locked, append-only intake on its exclusive Work branch.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const branch='work/parts-fitment-wave3';
export const checkpoint='c600a5c5a83a6f096ff5999e5ce5582c37ec424155919d487dfd6ca2221bd42b';
const base='d4853c4e5245410630742f58aead661d77f42c32';
const approvedBaseline='509655bcd5567d434a95ee98d22206a4322923eae17814d42a3567559f641c37';
const approvedEvidence='9b610d64d2edcf1485c7e05ca5295db79253995a799e5218ee37c5ef4858d1d3';
const stateFile='src/data/parts-fitment-wave3-state.json';
export const sha256=x=>createHash('sha256').update(x).digest('hex');
const normal=x=>String(x).toUpperCase().replace(/[^A-Z0-9]/g,'');
const date=x=>typeof x==='string'&&/^2026-10-0[89]$/.test(x);
const forbid=(x,keys)=>{for(const k of keys)assert.ok(!Object.hasOwn(x,k),'Unproven field: '+k);};
const forbidden=['price','stock','shipping','delivery','availability','offers','sourceQuote','deviceQuote'];
export function qualifiedUrl(value,brand,kind){
 const u=new URL(value);assert.equal(u.protocol,'https:');
 assert.ok(!u.username&&!u.password&&!u.port&&!u.hash,'Unqualified source URL');
 if(brand==='Samsung'){
  assert.equal(u.hostname,'www.samsung.com');assert.ok(u.pathname.startsWith('/de/'),'Samsung-DE source required');assert.equal(u.search,'');
  if(kind==='samsung-model-options')assert.ok(/^\/de\/(?:business\/)?vacuum-cleaners\/stick\//.test(u.pathname));
  if(kind==='samsung-article')assert.ok(/^\/de\/(?:business\/)?home-appliance-accessories\//.test(u.pathname));
 }else{
  assert.equal(brand,'Hoover');assert.equal(u.hostname,'www.hooverspares.co.uk');
  if(kind==='hoover-article')assert.ok(u.pathname.endsWith('/product.pl'));
  if(kind==='hoover-product-code-list')assert.ok(u.pathname.endsWith('/catalogue.pl'));
 }
 return u;
}
function ean(value){
 if(value===null)return;
 assert.ok(typeof value==='string'&&/^\d{13}$/.test(value),'Observed 13-digit EAN or explicit null required');
 const a=[...value].map(Number);assert.equal(a.slice(0,12).reduce((n,d,i)=>n+d*(i%2?3:1),0)%10,(10-a[12])%10,'Invalid EAN check digit');
}
export function validatePartsEvidence(e,packs){
 assert.equal(e.schemaVersion,1);assert.equal(e.issue,38);assert.equal(e.branch,branch);assert.equal(e.baseCommit,base);
 assert.equal(e.appVersion,'1.29.0');assert.equal(e.sourceCheckpointSha256,checkpoint);assert.ok(date(e.checkedAt));
 assert.ok(e.sources.length&&e.articles.length&&e.fitments.length);
 const sources=new Map(),ids=new Set();
 for(const s of e.sources){
  assert.ok(s.id&&!sources.has(s.id),'Duplicate source');sources.set(s.id,s);
  assert.equal(s.status,'retrieved');assert.ok(date(s.checkedAt));assert.equal(s.httpStatus,200);
  assert.match(s.bodySha256,/^[a-f0-9]{64}$/);const {observationSha256,...facts}=s;
  assert.equal(sha256(JSON.stringify(facts)),observationSha256,'Observation facts were changed');
  if(s.kind==='manufacturer-linked-drawing'){
   const u=new URL(s.url);assert.equal(u.protocol,'https:');assert.equal(u.hostname,'res.cloudinary.com');assert.ok(u.pathname.endsWith('.pdf'));
   qualifiedUrl(s.linkedFrom,'Hoover','hoover-product-code-list');assert.deepEqual(s.oemCodes,[],'Drawing positions are not OEM codes');continue;
  }
  qualifiedUrl(s.url,s.brand,s.kind);assert.equal(s.market,s.brand==='Samsung'?'DE':'GB');
  if(s.kind==='samsung-model-options'){
   assert.match(s.reference,/^[A-Z0-9]+\/(?:WD|WA)$/);assert.equal(s.modelCode,s.reference.split('/')[0]);
   assert.ok(s.url.endsWith(s.reference.toLowerCase().replace('/','-')+'/'),'Full source variant in URL');
   assert.equal(new Set(s.partCodes).size,s.partCodes.length);assert.ok(s.partCodes.every(c=>/^VCA-[A-Z0-9]+(?:\/[A-Z0-9]+)?$/.test(c)));
  }else if(s.kind==='hoover-product-code-list'){
   assert.match(s.productCode,/^\d{8}$/);assert.ok(s.reference.endsWith('('+s.productCode+')'));
   assert.ok(s.title.startsWith('Hoover '+s.reference+' : '),'Actual exact catalogue heading is required');
   assert.ok(s.url.includes(s.productCode),'Product code in source path');
   if(s.serialWarning){assert.equal(s.serialWarningBasis?.method,'indexed-primary-page-observation');qualifiedUrl(s.serialWarningBasis.url,'Hoover','hoover-product-code-list');assert.ok(date(s.serialWarningBasis.checkedAt));}
   assert.equal(new Set(s.partListings.map(p=>p.pid)).size,s.partListings.length);
   for(const p of s.partListings){const u=qualifiedUrl(p.url,'Hoover','hoover-article');assert.equal(u.searchParams.get('pid'),p.pid);assert.equal(p.catalogueUrl,s.url);}
  }else if(s.kind==='hoover-article'){
   assert.match(s.oemCode,/^\d{8}$/);assert.equal(new URL(s.url).searchParams.get('pid'),s.pid);assert.equal(s.genuine,true);ean(s.ean);
  }else if(s.kind==='samsung-article'){
   assert.match(s.oemCode,/^VCA-[A-Z0-9]+(?:\/[A-Z0-9]+)?$/);assert.ok(s.title.includes(s.oemCode));assert.ok(s.modelCodeFields.includes(s.oemCode),'OEM code must be observed even if Samsung mislabels a spec column');ean(s.ean);
  }else assert.fail('Unknown evidence kind');
 }
 const articles=new Map();
 for(const a of e.articles){
  forbid(a,forbidden);assert.ok(packs[a.brand]);assert.equal(a.region,a.brand==='Samsung'?'DE':'GB');
  const key=a.brand+':'+a.code;assert.ok(!articles.has(key),'Duplicate OEM/region article');articles.set(key,a);
  assert.ok(!packs[a.brand].parts.some(p=>p.code===a.code),'Already existing OEM article cannot count again');
  const s=sources.get(a.identitySourceId);assert.ok(s,'Article identity source required');assert.equal(s.brand,a.brand);assert.equal(s.oemCode,a.code);assert.equal(s.market,a.region);assert.equal(s.ean,a.ean);ean(a.ean);
  assert.ok(['filter','nozzle','roller','charger','bin','storage','battery'].includes(a.partTypeId));
  assert.ok(typeof a.name==='string'&&a.name.trim());assert.equal(a.materialNumber,null,'No unobserved independent material number');
  assert.ok(a.restrictions.length);assert.ok(Array.isArray(a.attachmentReferences));
  if(a.partTypeId==='charger')assert.ok(a.restrictions.some(x=>x.includes('UK-Netzstecker')));
 }
 for(const f of e.fitments){
  forbid(f,forbidden);assert.ok(packs[f.brand]);const model=packs[f.brand].models.find(m=>m.code===f.modelCode);assert.ok(model,'Target model exists');
  const s=sources.get(f.sourceId);assert.ok(s,'Fitment source required');assert.equal(s.brand,f.brand);assert.equal(s.market,f.region);
  assert.equal(f.region,f.brand==='Samsung'?'DE':'GB');assert.equal(s.modelCode,f.modelCode,'Different model in the same family is not a fitment');assert.equal(s.reference,f.reference);
  assert.ok(f.conditions.length&&f.conditions.every(x=>typeof x==='string'&&x.length>20),'Explicit conditions required');
  const old=packs[f.brand].parts.find(p=>p.code===f.partCode),a=articles.get(f.brand+':'+f.partCode);assert.ok(old||a,'Known OEM article required');
  const key=JSON.stringify([f.brand,f.partCode,f.modelCode,f.reference,f.productCode,f.region]);assert.ok(!ids.has(key),'Duplicate fitment');ids.add(key);
  assert.ok(!old?.relationships?.some(r=>r.code===f.modelCode&&r.reference===f.reference),'Existing fitment cannot count as new');
  if(f.brand==='Samsung'){
   assert.equal(s.kind,'samsung-model-options');assert.equal(f.productCode,null);assert.equal(f.basis,'exact-model-optional-accessory-list');
   assert.equal(f.reference.split('/')[0],f.modelCode,'Aliases/colours cannot transfer fitment between exact model stems');assert.ok(model.deviceReferences.includes(f.reference));
   assert.ok(s.partCodes.includes(f.partCode),'Exact accessory SKU, not a related family or unsuffixed alias');assert.equal(f.revisionScope,'full-model-code');assert.equal(f.serialScope,'not-published');
   if(/VCA-SBT|VCA-SAP/.test(f.partCode))assert.ok(f.conditions.some(x=>x.includes('Akku-SKU')));
   if(f.partCode.startsWith('VCA-ADB'))assert.ok(f.conditions.some(x=>x.includes('Clean Station')));
   if(/VCA-SP[AW]/.test(f.partCode))assert.ok(f.conditions.some(x=>x.includes('Sweeper')));
  }else{
   assert.equal(s.kind,'hoover-product-code-list');assert.equal(model.sourceMarket,'GB','No GB relationship at a DE/FR target');
   assert.equal(f.basis,'exact-product-code-service-list');assert.equal(f.productCode,model.productCode);assert.equal(s.productCode,model.productCode);
   const identity=sources.get(f.identitySourceId);assert.ok(identity&&identity.kind==='hoover-article');assert.equal(identity.oemCode,f.partCode);
   assert.ok(s.partListings.some(p=>p.pid===identity.pid&&p.genuine===true),'Genuine exact catalogue membership is required');
   assert.equal(f.serialScope,'unresolved');assert.equal(f.revisionScope,'product-code-only');assert.ok(f.conditions.some(x=>x.includes('Serien-')));
   if(s.serialWarning)assert.ok(f.conditions.some(x=>x.includes('seriennummernspezifische')),'Unknown serial applicability must stay conditional');
   if(identity.title.includes('UK'))assert.ok(f.conditions.some(x=>x.includes('UK-Netzstecker')));
  }
 }
 const deferred=new Set();for(const d of e.deferred){assert.equal(d.status,'deferred');assert.ok(d.reason&&d.id&&!deferred.has(d.id));deferred.add(d.id);}
 return {sources,articles};
}
function rawPack(text){const m=text.match(/export const brandPack=(\{[^\n]*\});/);assert.ok(m,'Checkpoint JSON pack expected');return JSON.parse(m[1]);}
// Do not execute a changed target module: its source is checked before using this fixed helper.
export function effectiveHoover(raw){
 const shared=['35602846','35602822','35602893','35602897','35602894','35602895','35602896','48700995','70049123','35603235'];
 const modelCodes={HF202P011:shared,HF201H011:[...shared,'48700997','48700984']};
 const rel=code=>Object.entries(modelCodes).filter(([,codes])=>codes.includes(code)).map(([c])=>{
  const m=raw.models.find(m=>m.code===c);return {code:c,model:c==='HF202P011'?'HF202P 011':'HF201H 011',reference:(c==='HF202P011'?'HF202P 011':'HF201H 011')+' · '+m.productCode,productCode:m.productCode,url:'https://www.premiumservicesforhoover.eu/de/Search/KeyW_'+m.productCode,checkedAt:'2026-10-08',basis:'manufacturer-linked-product-code-search'};
 });
 const p=structuredClone(raw);for(const part of p.parts)if(rel(part.code).length)part.relationships=rel(part.code);
 for(const code of ['48700995','70049123','35603235','48700997','48700984'])p.parts.push({brand:'Hoover',code,relationships:rel(code),partTypeId:{'48700995':'nozzle','70049123':'electrical','35603235':'roller','48700997':'tube','48700984':'mechanical'}[code]});return p;
}
function replaceOnce(text,before,after,label){assert.equal(text.split(before).length,2,'Conflicting anchor: '+label);return text.replace(before,after);}
function counts(pack){
 const byModel=Object.fromEntries(pack.models.map(m=>[m.code,pack.parts.filter(p=>p.relationships?.some(r=>r.code===m.code)).length]));
 return {parts:pack.parts.length,byModel,withParts:Object.values(byModel).filter(n=>n>0).length};
}
function buildPlan(read,e,packs,validated){
 const additions={},updates={},after={};
 for(const brand of ['Samsung','Hoover']){
  additions[brand]=e.articles.filter(a=>a.brand===brand).map(a=>{
   const s=validated.sources.get(a.identitySourceId);
   return {brand,code:a.code,name:a.name,partTypeId:a.partTypeId,ean:a.ean,partsFitmentWave3:true,url:s.url,checkedAt:s.checkedAt,sourceMarket:a.region,sourcePageType:'manufacturer-linked-exact-oem-article',relationships:[],restrictions:a.restrictions,attachmentReferences:a.attachmentReferences,sourceCoverage:{status:'partial',ean:a.ean,note:'Originalnummer aus direkter Hersteller-/herstellerverlinkter Servicequelle; kein Preis oder Lagerbestand übernommen. Geräteausführung und Bedingungen getrennt prüfen.'}};
  });
  const map=new Map();for(const f of e.fitments.filter(f=>f.brand===brand)){
   if(!map.has(f.partCode))map.set(f.partCode,[]);const s=validated.sources.get(f.sourceId);
   map.get(f.partCode).push({code:f.modelCode,model:packs[brand].models.find(m=>m.code===f.modelCode).model,reference:f.reference,...(f.productCode?{productCode:f.productCode}:{}),url:s.url,checkedAt:s.checkedAt,sourceMarket:f.region,basis:f.basis,conditions:f.conditions,serialScope:f.serialScope,revisionScope:f.revisionScope,partsFitmentWave3:true});
  }
  updates[brand]=[...map].map(([partCode,relationships])=>({partCode,relationships}));
  const p=structuredClone(packs[brand]);p.parts.push(...structuredClone(additions[brand]));
  for(const u of updates[brand])p.parts.find(p=>p.code===u.partCode).relationships.push(...u.relationships);
  after[brand]=counts(p);
 }
 const outputs=new Map();
 const template=fs.readFileSync(path.join(root,'integrations/parts-fitment-wave3-pack.template.js'),'utf8');
 outputs.set('src/data/parts-fitment-wave3.js',template.replace('__ADDITIONS__',JSON.stringify(additions)).replace('__RELATIONSHIPS__',JSON.stringify(updates)));
 const modelUpdates={},manifestUpdates={};
 for(const brand of ['Samsung','Hoover']){
  modelUpdates[brand]=Object.fromEntries(Object.entries(after[brand].byModel).filter(([code,n])=>n!==counts(packs[brand]).byModel[code]));
  manifestUpdates[brand]={partCount:after[brand].parts,physicalPartCount:after[brand].parts,packBytes:null,note:`${packs[brand].models.length} Geräteeinträge; ${after[brand].parts} eindeutige physische Originalartikel. Welle 3 ergänzt ${additions[brand].length} Artikel und ${e.fitments.filter(f=>f.brand===brand).length} exakt quellenbelegte, weiterhin prüfpflichtige Beziehungen. ${packs[brand].models.length-after[brand].withParts} Records ohne Teileliste. Quellenmarkt ${brand==='Hoover'?'GB (Altbestand zusätzlich EU-Service)':'DE'}; keine erfundenen Preise, Verfügbarkeit oder Länder-/Revisionsfreigaben.`};
  // Preserve taxonomy counts already computed by the checkpoint for legacy rows.
  const indexText=read('src/data/new-brands-index.js');const m=indexText.match(/export const newBrandsManifest=(\{[^\n]*\});/);assert.ok(m,'Manifest JSON required');const old=JSON.parse(m[1])[brand];
  manifestUpdates[brand].partTypes=structuredClone(old.partTypes);
  for(const a of additions[brand]){let t=manifestUpdates[brand].partTypes.find(t=>t.id===a.partTypeId);if(!t){t={id:a.partTypeId,count:0};manifestUpdates[brand].partTypes.push(t);}t.count++;}
 }
 outputs.set('src/data/parts-fitment-wave3-index.js','// Lightweight counts only; article records remain in optional packs.\nconst updates='+JSON.stringify(modelUpdates)+';\nconst manifests='+JSON.stringify(manifestUpdates)+';\nexport function applyPartsFitmentWave3Index(records,manifest){for(const r of records){const n=updates[r.brand]?.[r.code];if(n!==undefined){r.partCount=n;r.physicalPartCount=n;r.partListCoverage={...r.partListCoverage,status:"partial",note:n+" ausgewählte Originalartikel aus exakten Hersteller-/Service-Modelllisten; Länderkennung, Revision und Serienbereich separat prüfen."};}}for(const [brand,value] of Object.entries(manifests))Object.assign(manifest[brand],value);return records;}\n');
 for(const brand of ['samsung','hoover'])outputs.set('src/data/'+brand+'-pack.js',read('src/data/'+brand+'-pack.js')+"\nimport {applyPartsFitmentWave3} from './parts-fitment-wave3.js';\nObject.assign(brandPack,applyPartsFitmentWave3(brandPack));\n");
 outputs.set('src/data/brand-index.js',read('src/data/brand-index.js')+"\nimport {applyPartsFitmentWave3Index} from './parts-fitment-wave3-index.js';\napplyPartsFitmentWave3Index(brandIndex,brandManifest);\n");
 let products=read('src/data/brand-products.js');
 products=replaceOnce(products,"value:code},...(r.articleAliases||[])","value:code},...(r.partsFitmentWave3&&r.ean?[{type:'ean',value:r.ean}]:[]),...(r.articleAliases||[])",'observed new EAN only');
 products=replaceOnce(products,' device.partCount=device.parts.length;'," for(const part of device.parts){const exact=part.relationships.filter(r=>r.partsFitmentWave3&&brandDeviceId(device.brand,r.code)===device.id);if(exact.length)part.fitment.condition+=' '+exact.map(r=>r.reference+' ['+r.sourceMarket+']: '+r.conditions.join(' ')).join(' ');}\n device.partCount=device.parts.length;",'exact regional fitment conditions');
 outputs.set('src/data/brand-products.js',products);
 let test=read('tests/catalog-v126.test.mjs');
 for(const [a,b] of [
  ["progress.find(r=>r.brand==='Samsung').partsMissing,54","progress.find(r=>r.brand==='Samsung').partsMissing,49"],
  ["progress.find(r=>r.brand==='Hoover').partsMissing,40","progress.find(r=>r.brand==='Hoover').partsMissing,24"],
  ['hooverParts.length,60','hooverParts.length,76'],['hooverParts.filter(p=>p.modelIds.length).length,12','hooverParts.filter(p=>p.modelIds.length).length,30'],
  ["r.brand==='Hoover').recordsWithoutParts,98","r.brand==='Hoover').recordsWithoutParts,95"],
  ['samsungParts.length,46','samsungParts.length,51'],['samsungParts.filter(p=>p.modelIds.length).length,29','samsungParts.filter(p=>p.modelIds.length).length,32'],
  ["r.brand==='Samsung').recordsWithoutParts,57","r.brand==='Samsung').recordsWithoutParts,54"],
  ["partCoverage:'missing'}).length,57","partCoverage:'missing'}).length,54"],
  ["assert.equal(device.parts.length,0,'Model-first: do not infer technical parts from optional lists');","assert.equal(device.parts.length,code==='VS70H28HEK'?5:8,'Only source-listed exact /WD accessories');"],
  ['assert.equal(device.partCount,0);',"assert.equal(device.partCount,code==='VS70H28HEK'?5:8);"],
  ['assert.equal(device.physicalPartCount,0);',"assert.equal(device.physicalPartCount,code==='VS70H28HEK'?5:8);"]
 ]){
  assert.ok(test.includes(a),'Regression anchor missing: '+a);test=test.split(a).join(b);
 }
 outputs.set('tests/catalog-v126.test.mjs',test);
 for(const file of ['tests/vorwerk-expansion.test.mjs'])outputs.set(file,read(file).replaceAll('size,1940','size,1961').replaceAll('length,1940','length,1961').replace('1,921 distinct articles','1,961 distinct articles'));
 outputs.set('tests/parts-fitment-wave3.test.mjs',fs.readFileSync(path.join(root,'integrations/parts-fitment-wave3-app.test.template.mjs'),'utf8'));
 const pkg=JSON.parse(read('package.json'));assert.equal(pkg.version,'1.29.0');pkg.scripts.test+=' && node tests/parts-fitment-wave3.test.mjs';pkg.scripts.check+=' && node --check src/data/parts-fitment-wave3.js && node --check src/data/parts-fitment-wave3-index.js && node --check tests/parts-fitment-wave3.test.mjs';outputs.set('package.json',JSON.stringify(pkg,null,2)+'\n');
 return {outputs,summary:{Samsung:{parts:after.Samsung.parts,withParts:after.Samsung.withParts,withoutParts:77-after.Samsung.withParts},Hoover:{parts:after.Hoover.parts,withParts:after.Hoover.withParts,withoutParts:100-after.Hoover.withParts},newArticles:e.articles.length,newRelationships:e.fitments.length}};
}
function rejectSymlinks(folder){assert.ok(!fs.lstatSync(folder).isSymbolicLink(),'Symlink target refused');for(const e of fs.readdirSync(folder,{withFileTypes:true})){assert.ok(!e.isSymbolicLink(),'Symlink in target refused');if(e.isDirectory())rejectSymlinks(path.join(folder,e.name));}}
function safeTarget(target){
 assert.equal(execFileSync('git',['branch','--show-current'],{cwd:root,encoding:'utf8'}).trim(),branch,'Only work/parts-fitment-wave3 is authorized');
 assert.notEqual(target,path.parse(target).root,'Filesystem root target refused');
 assert.ok(target!==root&&!root.startsWith(target+path.sep),'Target cannot contain repository');
 for(let p=target;;p=path.dirname(p)){assert.ok(!fs.lstatSync(p).isSymbolicLink(),'Symlink path refused');if(path.dirname(p)===p)break;}
 assert.ok(fs.statSync(target).isDirectory());rejectSymlinks(target);
 let repo=null;try{repo=execFileSync('git',['rev-parse','--show-toplevel'],{cwd:target,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{}
 assert.ok(!repo||repo===root,'Target belongs to different repository/worktree');
 if(target.startsWith(root+path.sep))assert.equal(execFileSync('git',['ls-files','--',path.relative(root,target)],{cwd:root,encoding:'utf8'}).trim(),'','Tracked target refused');
}
export function snapshot(folder){const out={};const walk=(dir,prefix='')=>{for(const e of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const file=path.join(dir,e.name),key=prefix+e.name;assert.ok(!e.isSymbolicLink(),'Concurrent symlink refused');if(e.isDirectory())walk(file,key+'/');else{assert.ok(e.isFile(),'Special file refused');out[key]=sha256(fs.readFileSync(file));}}};walk(folder);return out;}
export function integrateParts({target=path.join(root,'site'),evidenceFile=path.join(root,'integrations/parts-fitment-wave3-evidence.json'),baselineFile=path.join(root,'integrations/parts-fitment-wave3-baseline.json'),check=false,transactionFs=fs}={}){
 target=path.resolve(target);safeTarget(target);const evidenceBytes=fs.readFileSync(evidenceFile),baselineBytes=fs.readFileSync(baselineFile),e=JSON.parse(evidenceBytes),lock=JSON.parse(baselineBytes);
 assert.equal(sha256(baselineBytes),approvedBaseline,'Unapproved baseline: cannot relabel modified files as the checkpoint');
 assert.equal(sha256(evidenceBytes),approvedEvidence,'Unapproved evidence: requires explicit source review and a new approved digest');
 assert.equal(lock.baseCommit,base);assert.equal(lock.appVersion,'1.29.0');assert.equal(lock.sourceCheckpointSha256,checkpoint);assert.equal(Object.keys(lock.fileSha256).length,136);
 const state=fs.existsSync(path.join(target,stateFile))?JSON.parse(fs.readFileSync(path.join(target,stateFile))):null;
 if(state){assert.equal(state.evidenceSha256,sha256(evidenceBytes),'Evidence changed since intake');assert.equal(state.baselineSha256,sha256(baselineBytes),'Baseline changed since intake');}
 const read=file=>state&&Object.hasOwn(state.beforeFiles,file)?state.beforeFiles[file]:fs.readFileSync(path.join(target,file),'utf8');
 for(const [file,hash] of Object.entries(lock.fileSha256)){assert.ok(!path.isAbsolute(file)&&!file.split('/').includes('..')&&!file.includes('\\'),'Unsafe checkpoint path');const bytes=state&&Object.hasOwn(state.beforeFiles,file)?state.beforeFiles[file]:fs.readFileSync(path.join(target,file));assert.equal(sha256(bytes),hash,'Checkpoint conflict: '+file);}
 const packs={Samsung:rawPack(read('src/data/samsung-pack.js')),Hoover:effectiveHoover(rawPack(read('src/data/hoover-pack.js')))};
 const validated=validatePartsEvidence(e,packs),{outputs,summary}=buildPlan(read,e,packs,validated);
 const beforeFiles=Object.fromEntries([...outputs.keys()].filter(f=>Object.hasOwn(lock.fileSha256,f)).map(f=>[f,read(f)]));
 const nextState={schemaVersion:1,evidenceSha256:sha256(evidenceBytes),baselineSha256:sha256(baselineBytes),beforeFiles,outputSha256:Object.fromEntries([...outputs].map(([f,c])=>[f,sha256(c)]))};outputs.set(stateFile,JSON.stringify(nextState,null,2)+'\n');
 if(state){for(const [file,content] of outputs)assert.equal(fs.readFileSync(path.join(target,file),'utf8'),content,'Integrated output conflict: '+file);return {state:'already-integrated',...summary,changedFiles:[]};}
 for(const f of outputs.keys())if(!Object.hasOwn(lock.fileSha256,f))assert.ok(!fs.existsSync(path.join(target,f)),'Generated-file collision: '+f);
 if(check)return {state:'validated-not-integrated',...summary,changedFiles:[]};
 const before=snapshot(target),stage=target+'.parts-wave3-stage-'+randomUUID(),backup=target+'.parts-wave3-backup-'+randomUUID();let moved=false,committed=false;
 try{
  transactionFs.cpSync(target,stage,{recursive:true,errorOnExist:true,force:false});for(const [f,c] of outputs){transactionFs.mkdirSync(path.dirname(path.join(stage,f)),{recursive:true});transactionFs.writeFileSync(path.join(stage,f),c);}
  assert.deepEqual(snapshot(target),before,'Concurrent target conflict');transactionFs.renameSync(target,backup);moved=true;transactionFs.renameSync(stage,target);committed=true;
 }catch(error){if(moved&&!committed)fs.renameSync(backup,target);throw error;}
 finally{if(fs.existsSync(stage))fs.rmSync(stage,{recursive:true,force:true});if(committed&&fs.existsSync(backup))fs.rmSync(backup,{recursive:true,force:true});}
 return {state:'integrated',...summary,changedFiles:[...outputs.keys()]};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const {values}=parseArgs({options:{target:{type:'string'},evidence:{type:'string'},baseline:{type:'string'},check:{type:'boolean',default:false}}});console.log(JSON.stringify(integrateParts({target:values.target,evidenceFile:values.evidence,baselineFile:values.baseline,check:values.check})));
}
