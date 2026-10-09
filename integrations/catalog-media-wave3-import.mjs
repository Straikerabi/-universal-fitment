import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {root,hash,baseCommit} from './catalog-media-wave3-audit.mjs';

const readJSON=name=>JSON.parse(fs.readFileSync(path.join(root,'integrations',name)));
function safePath(target,relative='') {
 assert.ok(!path.isAbsolute(relative)&&!relative.split('/').includes('..'));
 const file=path.join(target,relative);let cursor=path.parse(file).root;
 for(const segment of file.slice(cursor.length).split(path.sep)) {
  cursor=path.join(cursor,segment);
  try{assert.ok(!fs.lstatSync(cursor).isSymbolicLink(),'Symlink: '+cursor);}catch(error){if(error.code==='ENOENT')break;throw error;}
 }
 return file;
}
const bytesAt=(target,relative)=>{const file=safePath(target,relative);assert.ok(fs.statSync(file).isFile());return fs.readFileSync(file);};
function replaceOnce(text,anchor,replacement) {
 assert.equal(text.split(anchor).length,2,'Source anchor conflict');return text.replace(anchor,replacement);
}
function replaceBlock(text,start,end,replacement) {
 const first=text.indexOf(start),last=text.indexOf(end,first+start.length);
 assert.ok(first>=0&&last>first&&text.lastIndexOf(start)===first,'Ambiguous source block');
 return text.slice(0,first)+replacement+'\n'+text.slice(last);
}
export function jpegSize(bytes) {
 assert.ok(bytes.length>10&&bytes.length<=512_000&&bytes[0]===255&&bytes[1]===216&&bytes.at(-2)===255&&bytes.at(-1)===217,'Invalid/oversized JPEG');
 let offset=2;
 while(offset<bytes.length-2) {
  assert.equal(bytes[offset++],255,'JPEG marker expected');
  while(bytes[offset]===255)offset++;
  const marker=bytes[offset++];if(marker===217||marker===218)break;
  const length=bytes.readUInt16BE(offset);assert.ok(length>=2&&offset+length<=bytes.length,'Truncated JPEG');
  if([192,193,194].includes(marker)){
   const height=bytes.readUInt16BE(offset+3),width=bytes.readUInt16BE(offset+5);
   assert.ok(width>0&&height>0&&width<=4096&&height<=4096,'Invalid JPEG dimensions');return {width,height};
  }
  offset+=length;
 }
 throw Error('No supported JPEG dimensions');
}
export function validateCandidate(row,entities) {
 assert.equal(row.approval,'approved');assert.equal(row.imageIdentityVerified,true);
 assert.equal(row.rights.status,'verified');assert.equal(row.rights.commercialUse,true);assert.equal(row.rights.redistribution,true);
 assert.ok(['CC0-1.0','CC-BY-4.0','CC-BY-SA-4.0'].includes(row.rights.license),'Unsupported media licence');
 const licenceUrls={'CC0-1.0':'https://creativecommons.org/publicdomain/zero/1.0/','CC-BY-4.0':'https://creativecommons.org/licenses/by/4.0/','CC-BY-SA-4.0':'https://creativecommons.org/licenses/by-sa/4.0/'};
 assert.equal(row.rights.licenseUrl,licenceUrls[row.rights.license]);
 assert.ok(row.rights.attribution&&row.rights.changes&&row.rights.evidenceUrl&&row.checkedAt&&row.region&&row.alt);
 for(const [value,host] of [[row.originalUrl,'upload.wikimedia.org'],[row.sourcePageUrl,'commons.wikimedia.org'],[row.rights.evidenceUrl,'commons.wikimedia.org']]) {
  const url=new URL(value);assert.equal(url.protocol,'https:');assert.equal(url.hostname,host);
  assert.ok(!url.username&&!url.password&&!url.port&&!url.hash,'Unqualified media source');
  if(url.search){assert.equal(host,'commons.wikimedia.org');assert.equal(url.pathname,'/w/index.php');assert.deepEqual([...url.searchParams.keys()].sort(),['oldid','title']);assert.match(url.searchParams.get('oldid'),/^\d+$/);assert.ok(url.searchParams.get('title').startsWith('File:'));}
 }
 const entity=entities.find(r=>r.id===row.entityId);
 assert.ok(entity,'Unknown catalogue ID');assert.equal(entity.kind,row.kind);assert.equal(entity.brand||'Miele',row.brand);
 if(row.kind==='model')assert.equal(entity.model,row.model);
 else assert.ok(row.kind==='part'&&entity.tier==='oem','Only identified original articles');
 assert.ok(row.binding.length>0);assert.deepEqual(row.binding,entity.identifiers,'Exact typed identity binding differs');
 assert.ok(entity.sourceUrls.includes(row.manufacturerSourceUrl),'Manufacturer binding not in catalogue');
 assert.ok(Array.isArray(row.variants)&&row.variants.length===2);
 const widths=new Set();
 for(const v of row.variants) {
  assert.match(v.file,/^integrations\/catalog-media-wave3-[a-z0-9-]+\.jpg$/);
  assert.equal(v.mime,'image/jpeg');assert.match(v.sha256,/^[a-f0-9]{64}$/);
  assert.ok([320,640].includes(v.width)&&v.height>0&&v.height<=4096&&!widths.has(v.width));widths.add(v.width);
  assert.ok(v.bytes>0&&v.bytes<=512_000);
 }
 assert.ok(row.identityReview?.scope,'Missing variant/scope decision');
 return row;
}
export function planImport(target,{research,lock}={}) {
 assert.ok(target,'Explicit --target required');target=path.resolve(target);
 assert.ok(fs.statSync(safePath(target)).isDirectory());
 research??=readJSON('catalog-media-wave3-research.json');lock??=readJSON('catalog-media-wave3-lock.json');
 assert.equal(hash(JSON.stringify(research)),'39492a943e34557bb74164f3d38a6683fd14ab0dfb44c33042d20bf7fc05a6f3','Research/review snapshot conflict');
 assert.equal(hash(JSON.stringify(lock)),'a4e0774c595a18f2c5562e3b5a04c9147c6abf179c36fea9e7424023a4acd9af','Source lock conflict');
 assert.equal(lock.baseCommit,baseCommit);assert.equal(lock.version,'1.29.0');
 const coverage=readJSON('catalog-media-wave3-coverage.json'),entities=coverage.rows;
 assert.equal(coverage.baseCommit,baseCommit);
 assert.equal(hash(JSON.stringify(entities.map(({id,kind,brand,model,identifiers,sourceUrls,tier})=>({id,kind,brand,model,identifiers,sourceUrls,tier})))),'e18210c81934e27b75ce9ec26d57df14a723f52d1b98e17a4c584e59575d334a','Catalogue identity audit conflict');
 const originals=new Map(),current=new Map();
 for(const [relative,entry] of Object.entries(lock.files)) {
  const bytes=bytesAt(target,relative);current.set(relative,bytes);
  if(entry.baseline!==undefined){assert.equal(hash(entry.baseline),entry.sha256);originals.set(relative,entry.baseline);}
  else assert.equal(hash(bytes),entry.sha256,'Checkpoint conflict: '+relative);
 }
 const accepted=research.candidates.filter(row=>row.approval==='approved');
 assert.equal(accepted.length,research.summary.approved);assert.equal(accepted.length,1);
 const seenIds=new Set(),seenMedia=new Set(),seenImages=new Set(),outputs=new Map();
 const records=accepted.map(row=>{
  validateCandidate(row,entities);
  for(const [seen,value] of [[seenIds,row.entityId],[seenMedia,row.mediaId],[seenImages,row.originalUrl]]){assert.ok(!seen.has(value),'Duplicate media/ID/image');seen.add(value);}
  const variants=row.variants.map(v=>{
   const bytes=bytesAt(root,v.file);assert.equal(hash(bytes),v.sha256,'Media content hash conflict');assert.equal(bytes.length,v.bytes);
   assert.deepEqual(jpegSize(bytes),{width:v.width,height:v.height});
   const relative='media/'+path.basename(v.file);outputs.set(relative,bytes);
   return {src:'./'+relative,width:v.width,height:v.height};
  }).sort((a,b)=>a.width-b.width);
  return {...row,src:variants[0].src,width:variants[0].width,height:variants[0].height,variants};
 });
 // Pure JSON module: no unapproved URL or candidate reaches the runtime registry.
 outputs.set('src/data/catalog-media.js',Buffer.from('export const catalogMedia='+JSON.stringify(records)+';\n'));
 outputs.set('src/core/catalog-media.js',bytesAt(root,'integrations/catalog-media-wave3-runtime.mjs'));
 let app=originals.get('src/app.js');
 app=replaceOnce(app,"import {photoPolicy} from './core/photo-policy.js';","import {photoPolicy} from './core/photo-policy.js';\nimport {approvedMediaFor,renderMedia,loadMedia,mediaLoaded,mediaFailed} from './core/catalog-media.js';");
 app=replaceBlock(app,'function productImage(product,large=false){','function partTypeIcon(type)',`function productImage(product,large=false){
  const media=approvedMediaFor(product,'model'),url=media?.src||'';
  const auto=photoPolicy(getPreferences().photos,large).automatic;
  const src=url&&auto?url:'./icons/vacuum.svg';
  return renderMedia(product,'model',{large,auto,src});
}`);
 app=replaceBlock(app,'function partPhoto(part,large=false){','function partFitmentMeta(part)',`function partPhoto(part,large=false){
 const type=partType(part),auto=photoPolicy(getPreferences().photos,large).automatic;
 return renderMedia(part,'part',{large,auto,type,fallbackSvg:partTypeIcon(type)});
}
app.addEventListener('click',event=>{
 const button=event.target.closest?.('[data-load-photo]');if(!button)return;
 event.preventDefault();event.stopPropagation();loadMedia(button);
},true);
app.addEventListener('load',event=>mediaLoaded(event.target),true);
app.addEventListener('error',event=>mediaFailed(event.target),true);
`);
 app=replaceOnce(app,'product.imageUrl?',"approvedMediaFor(product,'model')?");
 app=replaceOnce(app,'${candidate.imageUrl?`<img src="${esc(candidate.imageUrl)}" alt="" class="external-thumb" referrerpolicy="no-referrer">`:`<div class="external-thumb external-placeholder">🧹</div>`}','<div class="external-thumb external-placeholder">🧹</div>');
 app=replaceOnce(app,'Herstellerfotos laden','Freigegebene Produktbilder laden');
 app=replaceOnce(app,'Große Ansichten laden Herstellerfotos bei Sichtbarkeit;','Große Ansichten laden nur freigegebene, exakt zugeordnete Produktbilder bei Sichtbarkeit;');
 outputs.set('src/app.js',Buffer.from(app));
 outputs.set('styles.css',Buffer.from(originals.get('styles.css')+'\n'+bytesAt(root,'integrations/catalog-media-wave3-styles.css').toString()));
 let test=originals.get('tests/miele-parts.test.mjs');
 test=replaceOnce(test,"assert.match(app,/data-vacuum-photo/);","assert.match(app,/approvedMediaFor/);\nconst media=fs.readFileSync(new URL('../src/core/catalog-media.js',import.meta.url),'utf8');\nassert.match(media,/data-media-fallback/);assert.match(media,/Staubsauger-Illustration/);");
 test=replaceOnce(test,"assert.match(app,/img\\.src='\\.\\/icons\\/vacuum\\.svg'/,'failed/offline photos get an accessible vacuum fallback');","assert.match(media,/fallback.hidden=false/,'failed/offline photos restore the persistent accessible fallback');");
 outputs.set('tests/miele-parts.test.mjs',Buffer.from(test));
 const states=[];
 for(const [relative,bytes] of outputs) {
  const file=safePath(target,relative),present=fs.existsSync(file),input=present?bytesAt(target,relative):null;
  if(input?.equals(bytes))states.push('applied');
  else if(lock.files[relative]){assert.equal(hash(input),lock.files[relative].sha256,'Source conflict: '+relative);states.push('baseline');}
  else{assert.ok(!present,'Output collision: '+relative);states.push('baseline');}
  if(!current.has(relative))current.set(relative,input);
 }
 assert.equal(new Set(states).size,1,'Partial media import; restore a fresh checkpoint');
 return {target,outputs,current,state:states[0],summary:{state:states[0],approvedModelImages:records.filter(r=>r.kind==='model').length,approvedPartImages:records.filter(r=>r.kind==='part').length,unapprovedCandidates:research.summary.pending,networkRequests:0,generatedFiles:[...outputs.keys()]}};
}
export function runImport(target,{check=false,beforeCommit,rename=fs.renameSync,...options}={}) {
 const plan=planImport(target,options),lockPath=safePath(plan.target,'.catalog-media-wave3-lock');
 assert.ok(!fs.existsSync(lockPath),'Existing media transaction/recovery lock');
 if(check||plan.state==='applied')return {...plan.summary,check,writtenFiles:[]};
 for(const folder of [root,plan.target])assert.equal(execFileSync('git',['-C',folder,'branch','--show-current'],{encoding:'utf8'}).trim(),'work/catalog-media-wave3','Exclusive Work branch required');
 fs.mkdirSync(lockPath,{mode:0o700});const written=[],createdDirs=[];let retain=false;
 try {
  for(const [relative,bytes] of plan.outputs){const file=path.join(lockPath,relative);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes,{flag:'wx',mode:0o644});}
  beforeCommit?.(plan);
  for(const [relative,original] of plan.current){const file=safePath(plan.target,relative);if(original)assert.ok(bytesAt(plan.target,relative).equals(original),'Source changed during planning: '+relative);else assert.ok(!fs.existsSync(file),'Output appeared during planning: '+relative);}
  for(const [relative] of plan.outputs){const file=safePath(plan.target,relative),dir=path.dirname(file);if(!fs.existsSync(dir)){fs.mkdirSync(dir);createdDirs.push(dir);}rename(path.join(lockPath,relative),file);written.push(relative);}
 }catch(error){
  try{for(const relative of written.reverse()){const original=plan.current.get(relative),file=path.join(plan.target,relative);if(original){const recovery=path.join(lockPath,'recovery');fs.writeFileSync(recovery,original);fs.renameSync(recovery,file);}else fs.unlinkSync(file);}for(const dir of createdDirs.reverse())fs.rmdirSync(dir);}catch(rollback){retain=true;throw new AggregateError([error,rollback],'Rollback failed; recovery lock retained');}
  throw error;
 }finally{if(!retain)fs.rmSync(lockPath,{recursive:true});}
 return {...plan.summary,state:'applied',check,writtenFiles:written};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 try{
  const args=process.argv.slice(2);let target,check=false;
  for(let i=0;i<args.length;i++){if(args[i]==='--target'&&!target&&args[i+1]&&!args[i+1].startsWith('--'))target=args[++i];else if(args[i]==='--check'&&!check)check=true;else throw Error('Use --target <restored-site> [--check]; no force/download mode');}
  assert.ok(target);console.log(JSON.stringify(runImport(target,{check}),null,2));
 }catch(error){console.error(error.message);process.exitCode=1;}
}
