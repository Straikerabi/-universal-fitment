import {execFileSync} from 'node:child_process';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {BASE_COMMIT,allowedPath,WORKFLOW} from './policy.mjs';
export const here=path.dirname(fileURLToPath(import.meta.url));
export const repo=path.resolve(here,'../..');
export const git=(...args)=>execFileSync('git',args,{cwd:repo,encoding:'utf8',maxBuffer:16*1024*1024}).trim();
export function scopeProof(){
 const changed=git('diff','--name-only',BASE_COMMIT).split('\n').filter(Boolean);
 const untracked=git('ls-files','--others','--exclude-standard').split('\n').filter(Boolean);
 assert.ok([...changed,...untracked].every(allowedPath),'Changes outside isolated QA/workflow scope');
 const entries=git('ls-tree','-r',BASE_COMMIT).split('\n');
 const protectedEntries=entries.filter(line=>!allowedPath(line.split('\t')[1]));
 for(const line of protectedEntries){
  const [info,file]=line.split('\t'),[,type,expected]=info.split(' ');
  assert.equal(type,'blob','Unexpected protected object '+file);
  const bytes=readFileSync(path.join(repo,file));
  const actual=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  assert.equal(actual,expected,'Protected baseline bytes changed: '+file);
 }
 const digest=createHash('sha256').update(protectedEntries.join('\n')).digest('hex');
 return {unchanged:true,protectedFiles:protectedEntries.length,baselineTree:git('rev-parse',BASE_COMMIT+'^{tree}'),
  protectedTreeEntriesSha256:digest,changedPaths:changed,untrackedPaths:untracked};
}
export function suiteFingerprint(){
 function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
  if(['node_modules','artifacts','evidence'].includes(e.name))return [];
  const file=path.join(dir,e.name);
  return e.isDirectory()?walk(file):e.name.endsWith('.mjs')||['package.json','package-lock.json'].includes(e.name)?[file]:[];
 });}
 const files=[...walk(here),path.join(repo,WORKFLOW)].sort().map(file=>({
  path:path.relative(repo,file),sha256:createHash('sha256').update(readFileSync(file)).digest('hex')
 }));
 return {files,digest:createHash('sha256').update(JSON.stringify(files)).digest('hex')};
}
