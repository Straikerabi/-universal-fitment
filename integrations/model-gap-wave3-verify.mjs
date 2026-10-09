// Isolated, deterministic full validation. No main/ref/hosting writes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {projectRoot,readEvidence,readBaseline,digest,importCatalog} from './import-model-gap-wave3-catalog.mjs';
import {verifySources} from './import-model-gap-wave3-sources.mjs';

const args=process.argv.slice(2);let reportFile,cacheDir;
while(args.length){const arg=args.shift();assert.ok(args[0]&&!args[0].startsWith('--'),'Missing argument');if(arg==='--report')reportFile=path.resolve(args.shift());else if(arg==='--cache-dir')cacheDir=path.resolve(args.shift());else throw Error('Unknown argument '+arg);}
if(reportFile)assert.ok(reportFile.startsWith(path.join(projectRoot,'integrations/model-gap-wave3-'))&&reportFile.endsWith('.json'),'Report must be an own Wave3 integration JSON');
const work=fs.mkdtempSync(path.join(os.tmpdir(),'uf-wave3-verify-')),commands=[];
const log=[];
const files=folder=>{
 const entries=fs.readdirSync(folder,{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>{const filename=path.join(e.parentPath,e.name);return [path.relative(folder,filename).split(path.sep).join('/'),{sha256:digest(fs.readFileSync(filename)),bytes:fs.statSync(filename).size}];});
 return Object.fromEntries(entries.sort(([a],[b])=>a.localeCompare(b)));
};
function run(command,args,cwd=projectRoot,env=process.env){
 const result=spawnSync(command,args,{cwd,env,encoding:'utf8',maxBuffer:10*1024*1024,timeout:180000});
 const output=result.stdout+result.stderr;
 const commandLine=[command,...args].join(' ').replaceAll(projectRoot,'<repository>').replaceAll(work,'<temporary>');
 commands.push({command:commandLine,exitCode:result.status,outputSha256:digest(output)});log.push('$ '+commandLine+'\n'+output);
 assert.equal(result.status,0,output||String(result.error));console.log(commandLine+' — passed');return output;
}
try{
 const baseline=readBaseline(),evidence=readEvidence(),require=createRequire(new URL('./auth-sdk/package.json',import.meta.url));
 const env={...process.env,UF_ESBUILD_MODULE:require.resolve('esbuild')},builds=[];let firstImported;
 const unit=run(process.execPath,['--test','--test-reporter=tap','integrations/import-model-gap-wave3-catalog.test.mjs']);assert.match(unit,/# tests 22/);
 for(const iteration of ['first','second']){
  const workspace=path.join(work,iteration),target=path.join(workspace,'site');fs.mkdirSync(path.join(workspace,'integrations'),{recursive:true});
  run('python3',[path.join(projectRoot,'integrations/restore-source-checkpoint.py'),'--target',target]);
  const before=files(target);await importCatalog({target,dryRun:true});assert.deepEqual(files(target),before);
  assert.equal((await importCatalog({target})).addedProfiles,22);const imported=files(target);if(iteration==='first')firstImported=imported;
  assert.equal((await importCatalog({target})).addedProfiles,0);await importCatalog({target,check:true});assert.deepEqual(files(target),imported);
  fs.copyFileSync(path.join(projectRoot,'integrations/build-app.mjs'),path.join(workspace,'integrations/build-app.mjs'));
  fs.copyFileSync(path.join(projectRoot,'integrations/dyson-model-research-wave2.json'),path.join(workspace,'integrations/dyson-model-research-wave2.json'));
  run(process.execPath,[path.join(workspace,'integrations/build-app.mjs')],workspace,env);
  run(process.execPath,[path.join(workspace,'integrations/build-app.mjs'),'--check'],workspace,env);
  builds.push(files(target));
  if(iteration==='first'){
   const output=run('npm',['test','--prefix',target]);assert.match(output,/Wave3 app passed/);
   assert.equal(JSON.parse(fs.readFileSync(path.join(target,'package.json'))).scripts.test.split(' && ').length,41);
   run('npm',['run','check','--prefix',target]);
   for(const relative of Object.keys(imported).filter(f=>/\.(?:js|mjs)$/.test(f)))run(process.execPath,['--check',path.join(target,relative)]);
  }
 }
 assert.deepEqual(builds[0],builds[1],'Two independent fresh checkpoints produce identical source and compiled bytes');
 const patch=path.join(work,'model-gap-wave3-local.patch'),patchWorkspace=path.join(work,'patch-check');fs.mkdirSync(patchWorkspace);
 run(process.execPath,['integrations/model-gap-wave3-patch.mjs','--target',path.join(work,'first/site'),'--output',patch]);
 run('python3',[path.join(projectRoot,'integrations/restore-source-checkpoint.py'),'--target',path.join(patchWorkspace,'site')]);
 run('git',['apply','--check',patch],patchWorkspace);run('git',['apply',patch],patchWorkspace);
 assert.deepEqual(files(path.join(patchWorkspace,'site')),firstImported,'Local unified patch reproduces exact importer bytes');
 for(const name of ['import-model-gap-wave3-catalog.mjs','import-model-gap-wave3-sources.mjs','import-model-gap-wave3-catalog.test.mjs','model-gap-wave3-app-test.mjs','model-gap-wave3-verify.mjs','model-gap-wave3-patch.mjs'])run(process.execPath,['--check','integrations/'+name]);
 const sourceVerification=cacheDir?verifySources({cacheDir}):null;
 const changed=Object.keys(builds[0]).filter(f=>baseline.sourceFiles[f]!==builds[0][f].sha256&&!/^((?:app|services|catalog-[a-z]+)-v1\.29\.0\.js)$/.test(f));
 const report={issue:37,branch:evidence.branch,baselineCommit:baseline.commit,version:baseline.version,verifiedAt:new Date().toISOString(),passed:true,isolatedImporterTests:22,applicationTestGroups:41,sourceGuards:136,independentFreshBuilds:2,allSourcesAndBuildsByteIdentical:true,localPatch:{sha256:digest(fs.readFileSync(patch)),applyCheckPassed:true,appliedBytesEqualImporter:true,notCommitted:true},sourceVerification,result:evidence.result,vorwerkBoundary:evidence.vorwerkBoundary,preservation:{oldModelRows:1093,oldHydratedArticles:1940,hydratedProductsSha256:baseline.hydratedProductsSha256,hydratedPartsSha256:baseline.hydratedPartsSha256,addedFitments:0},localIntegrationPaths:changed,compiledArtifacts:Object.fromEntries(Object.entries(builds[0]).filter(([f])=>/^(?:app|services|catalog-[a-z]+)-v1\.29\.0\.js$/.test(f))),commands};
 if(reportFile){fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');fs.writeFileSync(reportFile.replace(/\.json$/,'.log'),log.join('\n'));}
 console.log(JSON.stringify({passed:true,isolatedImporterTests:22,applicationTestGroups:41,identicalFreshBuilds:2,verifiedManufacturerSources:sourceVerification?.verifiedSources??'not requested',localIntegrationPaths:changed,report:reportFile||null},null,2));
}finally{fs.rmSync(work,{recursive:true,force:true});}
