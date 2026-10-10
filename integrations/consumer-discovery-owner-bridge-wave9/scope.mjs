import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const base='3bafbc7fd8c8da5ed6fe3bddc70eacbc0be1e035';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const own='integrations/consumer-discovery-owner-bridge-wave9/';
export const consumerPaths=['app.mjs','styles.css','discovery-ui.mjs','serve.mjs','prepare-offline.mjs','offline-config.mjs','offline-worker.mjs'].map(f=>'integrations/consumer-repair-mission-poc/'+f);
export const workflow='.github/workflows/consumer-discovery-owner-bridge-wave9.yml';
const git=(...a)=>execFileSync('git',a,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024}).trim();
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export function scopeProof(){
 // The unchanged Owner runner writes untracked evidence here. This exception
 // applies ONLY to generated untracked artifacts, never tracked source changes.
 const runtimeArtifact=p=>/^integrations\/private-owner-wave5\/artifacts\/owner-integration-browser\/[a-z0-9.-]+\.(png|json|txt)$/.test(p);
 const untracked=git('ls-files','--others','--exclude-standard').split('\n').filter(p=>!runtimeArtifact(p));
 const paths=[...new Set([...git('diff','--name-only',base).split('\n'),...untracked].filter(Boolean))];
 assert.ok(paths.every(p=>consumerPaths.includes(p)||p.startsWith(own)||p===workflow),'Outside exclusive #95 scope: '+paths.join(','));
 const delta=[],protectedFiles=[];
 for(const line of git('ls-tree','-r',base).split('\n')){
  const [info,p]=line.split('\t');const expected=info.split(' ')[2];const bytes=fs.readFileSync(path.join(root,p));
  const blob=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  if(consumerPaths.includes(p)&&blob!==expected){const before=execFileSync('git',['show',base+':'+p],{cwd:root});delta.push({path:p,beforeGitBlob:expected,afterGitBlob:blob,beforeSha256:sha(before),afterSha256:sha(bytes)});}
  else {assert.equal(blob,expected,'Unapproved baseline bytes changed: '+p);protectedFiles.push({path:p,gitBlob:blob,sha256:sha(bytes)});}
 }
 for(const p of consumerPaths.filter(p=>!git('ls-tree','-r','--name-only',base).split('\n').includes(p))){if(fs.existsSync(path.join(root,p)))delta.push({path:p,beforeGitBlob:null,beforeSha256:null,afterSha256:sha(fs.readFileSync(path.join(root,p)))});}
 const testCodeFiles=fs.readdirSync(path.join(root,own)).filter(f=>f.endsWith('.mjs')).sort().map(f=>({path:own+f,sha256:sha(fs.readFileSync(path.join(root,own,f)))}));
 if(fs.existsSync(path.join(root,workflow)))testCodeFiles.push({path:workflow,sha256:sha(fs.readFileSync(path.join(root,workflow)))});
 return {schema:'uf.owner-discovery-delta/1',issue:95,baseCommit:base,branch:'work/wave9-consumer-discovery-owner-bridge',changedConsumerFiles:delta,protectedFiles:protectedFiles.length,protectedDigest:sha(JSON.stringify(protectedFiles)),testCodeDigest:sha(JSON.stringify(testCodeFiles)),launchApproved:false,legalSourceLockUpdated:false,manualOwnerReviewRequired:true};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const proof=scopeProof();const file=path.join(root,own,'source-delta.json');
 if(process.argv.includes('--write')){
  assert.equal(git('branch','--show-current'),'work/wave9-consumer-discovery-owner-bridge');
  fs.writeFileSync(file,JSON.stringify(proof,null,2)+'\n');
 }else assert.deepEqual(JSON.parse(fs.readFileSync(file,'utf8')),proof,'Source delta changed; explicit review/reseal required');
 console.log('SOURCE-DELTA-PROOF '+JSON.stringify(proof));
}
