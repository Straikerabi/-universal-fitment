// Rebuild and test two independent restored checkpoints; never writes site/ or main.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {digest, importMieleModels} from './import-miele-models-wave2.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidence = JSON.parse(fs.readFileSync(path.join(root, 'integrations/miele-model-research-wave2.json')));
const require = createRequire(new URL('./auth-sdk/package.json', import.meta.url));
const esbuildModule = require.resolve('esbuild');
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'miele-wave2-verify-'));
const commands = [];
const files = folder => Object.fromEntries(fs.readdirSync(folder, {recursive: true, withFileTypes: true}).filter(e => e.isFile()).map(e => {
  const file = path.join(e.parentPath, e.name);
  return [path.relative(folder, file).split(path.sep).join('/'), {sha256: digest(fs.readFileSync(file)), bytes: fs.statSync(file).size}];
}).sort(([a], [b]) => a.localeCompare(b)));
function run(command, args, cwd = root, env = process.env) {
  const result = spawnSync(command, args, {cwd, env, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 120000});
  const output = result.stdout + result.stderr;
  assert.equal(result.status, 0, output || String(result.error));
  commands.push({command: [command, ...args].map(s => s.replaceAll(root, '<repository>').replaceAll(work, '<temporary>')).join(' '), exitCode: result.status, outputSha256: digest(output)});
  return output;
}
try {
  const args = process.argv.slice(2);
  let reportFile = null;
  if (args.length) {
    assert.equal(args.shift(), '--report');
    assert.ok(args.length === 1 && !args[0].startsWith('--'), 'Use --report PATH');
    reportFile = path.resolve(args.shift());
  }
  const builds = [];
  let importResult;
  for (const copy of ['first', 'second']) {
    const workspace = path.join(work, copy), target = path.join(workspace, 'site');
    fs.mkdirSync(path.join(workspace, 'integrations'), {recursive: true});
    run('python3', [path.join(root, 'integrations/restore-source-checkpoint.py'), '--target', target]);
    const before = files(target);
    importMieleModels({target, evidence, dryRun: true});
    assert.deepEqual(files(target), before, 'dry-run is read-only');
    const result = importMieleModels({target, evidence});
    const imported = files(target);
    assert.equal(importMieleModels({target, evidence}).addedModels, 0);
    importMieleModels({target, evidence, check: true});
    assert.deepEqual(files(target), imported, 'repeat and --check are read-only');
    // Execute an unchanged copy of the repository builder with the installed, pinned esbuild.
    const builder = path.join(workspace, 'integrations/build-app.mjs');
    fs.copyFileSync(path.join(root, 'integrations/build-app.mjs'), builder);
    const env = {...process.env, UF_ESBUILD_MODULE: esbuildModule};
    run(process.execPath, [builder], workspace, env);
    run(process.execPath, [builder, '--check'], workspace, env);
    builds.push(files(target));
    if (copy === 'first') {
      importResult = result;
      const output = run('npm', ['test', '--prefix', target]);
      const script = JSON.parse(fs.readFileSync(path.join(target, 'package.json'))).scripts.test;
      assert.equal(script.split(' && ').length, 39);
      assert.ok(output.includes('Miele wave2 passed: 25 historical code profiles'));
      run('npm', ['run', 'check', '--prefix', target]);
      for (const relative of Object.keys(imported).filter(p => /\.(?:js|mjs)$/.test(p))) run(process.execPath, ['--check', path.join(target, relative)]);
    }
  }
  assert.deepEqual(builds[0], builds[1], 'all source and build bytes match across independent fresh checkpoints');
  const importerTests = run(process.execPath, ['--test', '--test-reporter=tap', path.join(root, 'integrations/miele-models-wave2.test.mjs')]);
  assert.match(importerTests, /# tests 10/);
  const allFiles = builds[0];
  const assets = Object.fromEntries(Object.entries(allFiles).filter(([name]) => /^(?:app|services|catalog-.*)-v1\.28\.0\.js$/.test(name)));
  assert.equal(Object.keys(assets).length, 10);
  const report = {
    issue: 22, branch: evidence.branch, baselineCommit: evidence.baseline.commit, version: evidence.baseline.version,
    verifiedAt: new Date().toISOString(), node: process.version, esbuild: require('esbuild/package.json').version,
    checkpointSha256: JSON.parse(fs.readFileSync(path.join(root, 'integrations/source-checkpoint.json'))).archive_sha256,
    researchSha256: digest(fs.readFileSync(path.join(root, 'integrations/miele-model-research-wave2.json'))),
    result: evidence.result, importResult, appTestGroups: 39, importerTests: 10,
    independentFreshCheckpoints: 2, allSourceAndBuildFilesByteIdentical: true,
    generatedFiles: Object.fromEntries(importResult.changedFiles.map(name => [name, allFiles[name]])),
    buildAssets: assets, commands
  };
  if (reportFile) fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({appTestGroups: 39, importerTests: 10, identicalFreshCheckpoints: 2, identicalBuildAssets: 10, addedModels: 25, modelCount: 82, unchangedPhysicalArticles: 167}));
} finally {
  fs.rmSync(work, {recursive: true, force: true});
}
