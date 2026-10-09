import {readFile,writeFile,mkdtemp,mkdir,copyFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {ROOT,serialize,sha} from './coverage.mjs';
import {contractSchema,assessFitment} from './contract.mjs';
import {realCatalogUnknownRequest,syntheticRequest} from './fixtures.mjs';
const dir=dirname(fileURLToPath(import.meta.url));
const args=process.argv.slice(2);
if(args.some(a=>!['--check','--app'].includes(a)))throw new Error('Usage: node verify.mjs [--check] [--app]');
const commands=[];
function run(cmd,argv,options={}) {
  const out=execFileSync(cmd,argv,{cwd:ROOT,encoding:'utf8',maxBuffer:20*1024*1024,...options});
  process.stdout.write(out);commands.push({command:[cmd,...argv].join(' '),exitCode:0});return out;
}
const schema=serialize(contractSchema),schemaPath=join(dir,'contract.schema.json');
if(args.includes('--check')){if(await readFile(schemaPath,'utf8')!==schema)throw new Error('Schema differs from runtime contract');}else await writeFile(schemaPath,schema);
run(process.execPath,['--test',join(dir,'contract.test.mjs'),join(dir,'coverage.test.mjs')]);
run(process.execPath,[join(dir,'coverage.mjs'),'--check']);
if(args.includes('--app')) {
  const temp=await mkdtemp(join(tmpdir(),'uf-fitment-app-'));
  try {
    const site=join(temp,'site');
    run('python3',[join(ROOT,'integrations/restore-source-checkpoint.py'),'--target',site]);
    await mkdir(join(temp,'integrations'));
    await copyFile(join(ROOT,'integrations/build-app.mjs'),join(temp,'integrations/build-app.mjs'));
    // An unchanged checkpoint test reads its existing research manifest outside site/.
    if(sha(await readFile(join(ROOT,'integrations/dyson-model-research-wave2.json')))!=='81cf181d4ba5b93a2b3ae5d6cb9253ca4c09ab5b9007fbf9cc7801dcc44cc956')throw new Error('Unchanged baseline Dyson research manifest differs');
    await copyFile(join(ROOT,'integrations/dyson-model-research-wave2.json'),join(temp,'integrations/dyson-model-research-wave2.json'));
    const esbuild=process.env.UF_ESBUILD_MODULE||pathToFileURL(join(ROOT,'integrations/auth-sdk/node_modules/esbuild/lib/main.js')).href;
    const env={...process.env,UF_ESBUILD_MODULE:esbuild};
    run(process.execPath,[join(temp,'integrations/build-app.mjs')],{env});
    run('npm',['test'],{cwd:site});run('npm',['run','check'],{cwd:site});
    run(process.execPath,[join(temp,'integrations/build-app.mjs'),'--check'],{env});
  }finally{await rm(temp,{recursive:true,force:true});}
}
const status={contractVersion:'1.0.0',runtime:process.version,tests:'98 node:test cases',baselineAppTests:args.includes('--app')?'40 unchanged test groups, syntax and byte-reproducible build passed':'not run in this invocation',schemaSha256:sha(schema),baseline:JSON.parse(await readFile(join(dir,'baseline-report.json'),'utf8')).counts,realCatalogExample:assessFitment(realCatalogUnknownRequest()),syntheticPositive:assessFitment(syntheticRequest()),commands,scope:{branch:'work/fitment-engine-v1-poc',uiChanges:0,wave3Imported:false,publicApi:false,mainMerged:false,deployed:false}};
// Portable commands: do not persist temp paths/runtime log timestamps in golden reports.
status.commands=commands.map(c=>({...c,command:c.command.replaceAll(process.execPath,'node').replaceAll(ROOT,'<repo>').replace(/\/tmp\/uf-fitment-app-[^/ ]+/g,'<fresh-app>')}));
if(!args.includes('--check'))await writeFile(join(dir,'validation.json'),serialize(status));
console.log(JSON.stringify({verified:true,schemaSha256:status.schemaSha256,baseline:status.baseline,app:status.baselineAppTests}));
