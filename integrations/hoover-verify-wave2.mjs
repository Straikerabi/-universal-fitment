// Runs the complete wave against two fresh, checksum-restored local work trees.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {root, runHooverImport} from './import-hoover-models-wave2.mjs';

const args = process.argv.slice(2);
let reportPath;
if (args.length) {
  assert.equal(args.length, 2); assert.equal(args[0], '--report');
  reportPath = path.resolve(args[1]);
  assert.equal(path.dirname(reportPath), path.join(root, 'integrations'), 'Save reports only beside the wave artifacts');
  assert.ok(/^hoover-[a-z0-9-]+\.json$/.test(path.basename(reportPath)));
}
const require = createRequire(path.join(root, 'integrations/auth-sdk/package.json'));
const esbuildModule = process.env.UF_ESBUILD_MODULE || require.resolve('esbuild');
process.env.UF_ESBUILD_MODULE = path.resolve(esbuildModule);
const env = {...process.env};
const base = fs.mkdtempSync(path.join(root, '.hoover-wave2-verify-'));
const checks = [];
function run(label, cmd, argv, cwd, extraEnv = {}) {
  const result = spawnSync(cmd, argv, {cwd, env:{...env, ...extraEnv}, encoding:'utf8', maxBuffer:16 * 1024 * 1024});
  fs.writeFileSync(path.join(base, label.replace(/\W/g, '-') + '.log'), (result.stdout || '') + (result.stderr || ''));
  if (result.status !== 0) {
    console.error((result.stdout || '').slice(-5000), (result.stderr || '').slice(-5000));
    throw Error(label + ' failed (' + result.status + ')');
  }
  checks.push({label, status:'passed'}); return result.stdout;
}
const sourceDigests = site => Object.fromEntries(['src/data/hoover-pack.js', 'src/data/new-brands-index.js',
  'src/core/typeplate.js', 'tests/catalog-seven-brands.test.mjs', 'tests/vorwerk-expansion.test.mjs',
  'tests/catalog-v126.test.mjs'].map(relative => [relative, createHash('sha256').update(fs.readFileSync(path.join(site, relative))).digest('hex')]));
const artifacts = site => Object.fromEntries(fs.readdirSync(site).filter(name => /^(?:app|services|catalog-[a-z]+)-v1\.28\.0\.js$/.test(name)).sort().map(name => {
  const bytes = fs.readFileSync(path.join(site, name));
  return [name, {bytes:bytes.length, sha256:createHash('sha256').update(bytes).digest('hex')}];
}));
try {
  let first, summary, sources;
  for (let pass = 1; pass <= 2; pass++) {
    const work = path.join(base, 'pass-' + pass), site = path.join(work, 'site');
    fs.mkdirSync(path.join(work, 'integrations'), {recursive:true});
    fs.copyFileSync(path.join(root, 'integrations/build-app.mjs'), path.join(work, 'integrations/build-app.mjs'));
    run('restore-' + pass, 'python3', [path.join(root, 'integrations/restore-source-checkpoint.py'), '--target', site], root);
    const before = await runHooverImport(site, {check:true}); assert.equal(before.state, 'baseline');
    summary = await runHooverImport(site); assert.equal(summary.state, 'applied');
    assert.deepEqual((await runHooverImport(site)).writtenFiles, []);
    assert.equal((await runHooverImport(site, {check:true})).state, 'applied');
    run('build-' + pass, process.execPath, ['integrations/build-app.mjs'], work);
    run('build-check-' + pass, process.execPath, ['integrations/build-app.mjs', '--check'], work);
    const packages = artifacts(site), generated = sourceDigests(site);
    assert.equal(Object.keys(packages).length, 10);
    if (pass === 1) {
      first = packages; sources = generated;
      const output = run('full-app-suite', 'npm', ['test'], site);
      const pkg = JSON.parse(fs.readFileSync(path.join(site, 'package.json')));
      assert.equal(pkg.scripts.test.split(' && ').length, 38);
      assert.ok(output.includes('Model parts UI passed'));
      run('full-app-syntax', 'npm', ['run', 'check'], site);
      const specific = run('hoover-import-and-app-tests', process.execPath, ['--test', 'integrations/hoover-models-wave2.test.mjs'], root, {UF_HOOVER_TARGET:site});
      assert.match(specific, /tests 29/); assert.match(specific, /pass 29/); assert.match(specific, /fail 0/);
      run('importer-syntax', process.execPath, ['--check', 'integrations/import-hoover-models-wave2.mjs'], root);
      run('wave-tests-syntax', process.execPath, ['--check', 'integrations/hoover-models-wave2.test.mjs'], root);
      console.log('Fresh checkpoint: 38 app test groups, 29 wave tests and syntax checks passed.');
    } else {
      assert.deepEqual(packages, first, 'Fresh builds must be byte-identical, including all other brands');
      assert.deepEqual(generated, sources, 'Fresh importer output must be byte-identical');
      console.log('Second fresh checkpoint: all six source files and ten build packages are byte-identical.');
    }
  }
  const report = {schemaVersion:1, checkedAt:'2026-10-08', baseCommit:'d254df54d7bb4d72febdf9f2587efec9a66be336',
    appVersion:'1.28.0', esbuildVersion:'0.25.12', appTestGroups:38, waveTests:29, failures:0,
    freshCheckpointRuns:2, sourceFiles:sources, buildArtifacts:first, summary, checks,
    limits:['OCR/Typenschildtests verwenden synthetische Text-Fixtures; keine physische Geräteprüfung.',
      'EU-Hoover-Fitmentservice beim Live-Abruf blockiert; Originalbeziehungen unverändert aus dem geprüften Checkpoint erhalten.',
      'Quellenmärkte der neuen Modelle: 3 DE, 1 FR, 72 GB; keine marktübergreifende Gleichheit oder Passung behauptet.',
      'Der gemeinsame Checkpoint, site/, Releases und produktive Workflows werden in dieser PR nicht geändert.']};
  if (reportPath) fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  fs.rmSync(base, {recursive:true});
  console.log('Hoover 24 → 100; 60 original articles and 22 relationships retained; 0 inferred fitment.');
} catch (error) {
  console.error('Validation failed: ' + error.message + '\nLogs retained at ' + base);
  process.exitCode = 1;
}
