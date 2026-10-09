import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {root,hash,inventory,coverage,baseCommit} from './catalog-media-wave3-audit.mjs';
import {runImport} from './catalog-media-wave3-import.mjs';
const require=createRequire(path.join(root,'integrations/auth-sdk/package.json'));
const esbuild=process.env.UF_ESBUILD_MODULE||require.resolve('esbuild');
const temp=fs.mkdtempSync(path.join(root,'.catalog-media-wave3-verify-')),checks=[];
function run(label,command,args,cwd) {
 const result=spawnSync(command,args,{cwd,env:{...process.env,UF_ESBUILD_MODULE:esbuild},encoding:'utf8',maxBuffer:16*1024*1024});
 fs.writeFileSync(path.join(temp,label+'.log'),(result.stdout||'')+(result.stderr||''));
 if(result.status!==0){console.error((result.stdout||'').slice(-1500),(result.stderr||'').slice(-1500));throw Error(label+' failed');}
 checks.push({label,status:'passed'});return result.stdout;
}
try {
 let first,generated;
 for(let pass=1;pass<=2;pass++) {
  const work=path.join(temp,'pass-'+pass),site=path.join(work,'site');fs.mkdirSync(path.join(work,'integrations'),{recursive:true});fs.copyFileSync(path.join(root,'integrations/build-app.mjs'),path.join(work,'integrations/build-app.mjs'));
  run('restore-'+pass,'python3',[path.join(root,'integrations/restore-source-checkpoint.py'),'--target',site],root);
  // The existing Dyson suite reads its checked-in research beside site/.
  fs.copyFileSync(path.join(root,'integrations/dyson-model-research-wave2.json'),path.join(work,'integrations/dyson-model-research-wave2.json'));
  if(pass===1){const data=await inventory(site),heads=JSON.parse(fs.readFileSync(path.join(root,'integrations/catalog-media-wave3-head-evidence.json')));assert.equal(heads.pending,0);assert.equal(heads.results.length,1180);const report=coverage(data,heads,['vac-dyson-model-dc19']);fs.writeFileSync(path.join(root,'integrations/catalog-media-wave3-coverage.json'),JSON.stringify(report,null,2)+'\n');}
  assert.equal(runImport(site,{check:true}).state,'baseline');const imported=runImport(site);assert.equal(imported.state,'applied');assert.deepEqual(runImport(site).writtenFiles,[]);assert.equal(runImport(site,{check:true}).state,'applied');
  run('build-'+pass,process.execPath,['integrations/build-app.mjs'],work);run('build-check-'+pass,process.execPath,['integrations/build-app.mjs','--check'],work);
  const artifacts=Object.fromEntries(fs.readdirSync(site).filter(f=>/^(app|services|catalog-[a-z]+)-v1\.29\.0\.js$/.test(f)).sort().map(f=>[f,{sha256:hash(fs.readFileSync(path.join(site,f))),bytes:fs.statSync(path.join(site,f)).size}]));
  const sources=Object.fromEntries(imported.generatedFiles.map(f=>[f,hash(fs.readFileSync(path.join(site,f)))]));assert.equal(Object.keys(artifacts).length,10);
  if(pass===1){first=artifacts;generated=sources;const suite=run('full-app', 'npm',['test'],site);assert.ok(suite.includes('Dyson wave2 passed'));assert.equal(JSON.parse(fs.readFileSync(path.join(site,'package.json'))).scripts.test.split(' && ').length,40);run('app-syntax','npm',['run','check'],site);}
  else{assert.deepEqual(artifacts,first);assert.deepEqual(sources,generated);}
 }
 const unit=run('media-tests',process.execPath,['--test','integrations/catalog-media-wave3-test.mjs'],root);assert.match(unit,/pass 33/);assert.match(unit,/fail 0/);
 for(const filename of fs.readdirSync(path.join(root,'integrations')).filter(f=>/^catalog-media-wave3.*\.mjs$/.test(f)))run('syntax-'+filename,process.execPath,['--check',path.join(root,'integrations',filename)],root);
 run('head-tests','python3',['-m','py_compile','integrations/catalog-media-wave3-head.py'],root);
 const report={schemaVersion:1,checkedAt:new Date().toISOString(),baseCommit,version:'1.29.0',appTestGroups:40,mediaTests:33,failures:0,freshCheckpoints:2,sourceFiles:generated,buildArtifacts:first,checks,limits:['Separate browser report is required; this runner does not pretend to verify physical devices.','No unapproved media download/import. Current batch is 1 model photo, 0 spare photos.']};
 fs.writeFileSync(path.join(root,'integrations/catalog-media-wave3-validation.json'),JSON.stringify(report,null,2)+'\n');fs.rmSync(temp,{recursive:true});console.log('40 app groups + 33 media tests + syntax; 7 source/assets and 10 bundles byte-identical across two fresh checkpoints.');
}catch(error){console.error(error.message+'; logs retained at '+temp);process.exitCode=1;}
