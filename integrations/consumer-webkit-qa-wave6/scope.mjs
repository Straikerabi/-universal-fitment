import {execFileSync} from 'node:child_process';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {BASE_COMMIT,allowedPath,allowedChange,OWNER_DELTA_PATHS,WORKFLOW} from './policy.mjs';
export const here=path.dirname(fileURLToPath(import.meta.url));
export const repo=path.resolve(here,'../..');
export const git=(...args)=>execFileSync('git',args,{cwd:repo,encoding:'utf8',maxBuffer:16*1024*1024}).trim();
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export function validateOwnerDelta(lock){
 assert.equal(lock.schema,'uf.owner-authorized-consumer-delta/1');assert.equal(lock.issue,81);assert.equal(lock.baseCommit,BASE_COMMIT);
 assert.ok(Array.isArray(lock.files)&&lock.files.length>0,'Missing explicit Owner delta');
 assert.equal(new Set(lock.files.map(f=>f.path)).size,lock.files.length,'Duplicate Owner path');
 for(const f of lock.files){
  assert.ok(OWNER_DELTA_PATHS.includes(f.path),'Unauthorized Owner delta: '+f.path);
  for(const key of ['beforeSha256','afterSha256'])assert.match(f[key],/^[a-f0-9]{64}$/);
  assert.notEqual(f.beforeSha256,f.afterSha256,'Delta must actually change bytes');
 }
 return lock;
}
export function scopeProof(){
 const changed=git('diff','--name-only',BASE_COMMIT).split('\n').filter(Boolean);
 const untracked=git('ls-files','--others','--exclude-standard').split('\n').filter(Boolean);
 assert.ok([...changed,...untracked].every(allowedChange),'Changes outside QA and explicit #81 Consumer scope');
 const lock=validateOwnerDelta(JSON.parse(readFileSync(path.join(here,'owner-authorized-delta.json'),'utf8')));
 const deltas=new Map(lock.files.map(f=>[f.path,f]));
 const entries=git('ls-tree','-r',BASE_COMMIT).split('\n');
 const baselineEntries=entries.filter(line=>!allowedPath(line.split('\t')[1]));
 const protectedEntries=baselineEntries.filter(line=>!deltas.has(line.split('\t')[1]));
 const sourceBytes=[],verifiedDelta=[];
 for(const line of baselineEntries){
  const [info,file]=line.split('\t'),[,type,expected]=info.split(' ');
  assert.equal(type,'blob','Unexpected protected object '+file);
  const bytes=readFileSync(path.join(repo,file));
  const actual=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  const afterSha256=sha256(bytes),delta=deltas.get(file);
  if(delta){
   const before=execFileSync('git',['show',BASE_COMMIT+':'+file],{cwd:repo});
   assert.equal(delta.beforeSha256,sha256(before),'Owner before-hash differs from real base: '+file);
   assert.equal(delta.afterSha256,afterSha256,'Unsealed Owner source bytes: '+file);
   verifiedDelta.push({...delta,beforeGitBlob:expected,afterGitBlob:actual});
  }else assert.equal(actual,expected,'Protected baseline bytes changed: '+file);
  sourceBytes.push({path:file,gitBlob:actual,sha256:afterSha256});
 }
 assert.equal(verifiedDelta.length,lock.files.length,'Owner path missing from protected baseline');
 const digest=createHash('sha256').update(protectedEntries.join('\n')).digest('hex');
 return {unchanged:true,ownerIssue:81,baselineFiles:baselineEntries.length,authorizedDelta:verifiedDelta,
  sourceBytesDigest:sha256(JSON.stringify(sourceBytes)),protectedFiles:protectedEntries.length,baselineTree:git('rev-parse',BASE_COMMIT+'^{tree}'),
  protectedTreeEntriesSha256:digest,changedPaths:changed,untrackedPaths:untracked};
}
export function suiteFingerprint(){
 function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
  if(['node_modules','artifacts','evidence'].includes(e.name))return [];
  const file=path.join(dir,e.name);
  return e.isDirectory()?walk(file):e.name.endsWith('.mjs')||['package.json','package-lock.json'].includes(e.name)?[file]:[];
 });}
 const files=[...walk(here),path.join(here,'owner-authorized-delta.json'),path.join(repo,WORKFLOW)].sort().map(file=>({
  path:path.relative(repo,file),sha256:createHash('sha256').update(readFileSync(file)).digest('hex')
 }));
 return {files,digest:createHash('sha256').update(JSON.stringify(files)).digest('hex')};
}
