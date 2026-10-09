// Emit a precise LOCAL integration patch. The Work PR never changes site/checkpoint.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync,execFileSync} from 'node:child_process';
import {projectRoot,createPlan,digest} from './import-model-gap-wave3-catalog.mjs';
const args=process.argv.slice(2);let target=path.join(projectRoot,'site'),output;
while(args.length){const arg=args.shift();assert.ok(args[0]&&!args[0].startsWith('--'));if(arg==='--target')target=path.resolve(args.shift());else if(arg==='--output')output=path.resolve(args.shift());else throw Error('Unknown argument '+arg);}
assert.ok(output,'Provide --output PATH outside the repository');
assert.ok(!output.startsWith(projectRoot+path.sep),'Integration patch remains local, outside this Work repository');
assert.ok(!fs.existsSync(output),'Do not overwrite an existing integration patch');
const plan=await createPlan({target});assert.equal(plan.alreadyImported,true,'Patch must represent a checked complete import');
const work=fs.mkdtempSync(path.join(os.tmpdir(),'uf-wave3-patch-'));
try{
 const before=path.join(work,'before'),after=path.join(work,'after');fs.mkdirSync(after);
 execFileSync('python3',[path.join(projectRoot,'integrations/restore-source-checkpoint.py'),'--target',before]);
 let patch='';const files=[];
 for(const [relative,bytes] of plan.changed){
  const a=path.join(before,relative),b=path.join(after,relative);fs.mkdirSync(path.dirname(b),{recursive:true});fs.writeFileSync(b,bytes);
  const result=spawnSync('git',['diff','--no-index','--no-ext-diff','--no-color','--',fs.existsSync(a)?a:'/dev/null',b],{encoding:'utf8',maxBuffer:10*1024*1024});
  assert.equal(result.status,1,result.stderr);
  let delta=result.stdout.replaceAll('a'+before+'/','a/site/').replaceAll('b'+after+'/','b/site/').replaceAll('a'+after+'/','a/site/');
  patch+=delta;files.push({path:'site/'+relative,beforeSha256:fs.existsSync(a)?digest(fs.readFileSync(a)):null,afterSha256:digest(bytes)});
 }
 fs.writeFileSync(output,patch,{flag:'wx'});console.log(JSON.stringify({issue:37,patchSha256:digest(patch),patchBytes:Buffer.byteLength(patch),changedSourceFiles:files,notCommitted:true},null,2));
}finally{fs.rmSync(work,{recursive:true,force:true});}
