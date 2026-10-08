import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';
import {importMieleModels, createPlan, digest, validateEvidence} from './import-miele-models-wave2.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidence = JSON.parse(fs.readFileSync(path.join(root, 'integrations/miele-model-research-wave2.json'), 'utf8'));
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'miele-wave2-tests-'));
process.on('exit', () => fs.rmSync(work, {recursive: true, force: true}));
let counter = 0;
const fresh = () => {
  const target = path.join(work, 'site-' + counter++);
  const run = spawnSync('python3', [path.join(root, 'integrations/restore-source-checkpoint.py'), '--target', target], {encoding: 'utf8'});
  assert.equal(run.status, 0, run.stderr);
  return target;
};
const hashes = folder => Object.fromEntries(fs.readdirSync(folder, {recursive: true, withFileTypes: true}).filter(e => e.isFile()).map(e => {
  const filename = path.join(e.parentPath, e.name);
  return [path.relative(folder, filename), digest(fs.readFileSync(filename))];
}).sort(([a], [b]) => a.localeCompare(b)));

test('curated decisions: 25 additional code profiles, 17 deferred, 10 rejected; no fake variants', () => {
  const {models} = validateEvidence(evidence);
  assert.equal(models.length, 25);
  assert.equal(evidence.result.finalModelCount, 82);
  assert.equal(evidence.result.finalRecordCount, 87);
  assert.equal(evidence.result.deferredCandidateCount, 17);
  assert.equal(evidence.result.rejectedCandidateCount, 10);
});

test('fresh checkpoint import, byte-identical repeat, read-only check and exact mutation allowlist', () => {
  const target = fresh(), before = hashes(target);
  assert.throws(() => importMieleModels({target, evidence, check: true}), /Wave not imported/);
  assert.deepEqual(hashes(target), before);
  const preview = importMieleModels({target, evidence, dryRun: true});
  assert.equal(preview.plannedModels, 25);
  assert.deepEqual(hashes(target), before);
  const result = importMieleModels({target, evidence});
  assert.equal(result.addedModels, 25);
  const after = hashes(target);
  const changed = Object.keys(after).filter(p => after[p] !== before[p]);
  assert.deepEqual(new Set(changed), new Set(result.changedFiles));
  assert.equal(importMieleModels({target, evidence}).addedModels, 0);
  assert.equal(importMieleModels({target, evidence, check: true}).check, true);
  assert.deepEqual(hashes(target), after);
  assert.equal(JSON.parse(fs.readFileSync(path.join(target, 'package.json'))).version, '1.28.0');
});

test('reject duplicate code, embedded current alias and repeated base group before mutation', () => {
  const target = fresh(), before = hashes(target);
  const duplicate = structuredClone(evidence);
  duplicate.candidates.push({...duplicate.candidates[0], id: 'duplicate'});
  assert.throws(() => importMieleModels({target, evidence: duplicate}));
  const alias = structuredClone(evidence);
  alias.baseline.models[0].alternativeName = 'Existing model S 192';
  assert.throws(() => importMieleModels({target, evidence: alias}), /alias\/duplicate/);
  const group = structuredClone(evidence);
  group.candidates[1].baseDeviceKey = group.candidates[0].baseDeviceKey;
  assert.throws(() => importMieleModels({target, evidence: group}));
  assert.deepEqual(hashes(target), before);
});

test('reject inferred EAN, material, country/index, type code, robot and new parts', () => {
  const target = fresh(), before = hashes(target);
  for (const [field, value] of [['ean', '4002516925668'], ['materialNumber', '99999999'], ['countrySuffix', 'DE'], ['executionNumber', '01'], ['typePlateCode', 'SGDF5'], ['formFactor', 'robot'], ['addedParts', 1]]) {
    const invalid = structuredClone(evidence);
    invalid.candidates[0][field] = value;
    assert.throws(() => importMieleModels({target, evidence: invalid}), undefined, field);
  }
  assert.deepEqual(hashes(target), before);
});

test('source pin, individual column/page and decision sums must match', () => {
  const target = fresh(), before = hashes(target);
  for (const edit of [e => e.sources[0].url = 'https://example.test/catalog.pdf', e => e.sources[0].responseSha256 = '0'.repeat(64), e => e.sources[0].tables[0].observedCodes.push('S 9999'), e => e.baseline.sourceFiles['src/data/miele-spare-records.js'] = '0'.repeat(64), e => e.candidates[0].formFactor = 'upright', e => e.candidates[0].sources[0].pdfPage = 1, e => e.result.addedPartCount = 1, e => e.result.finalModelCount = 100, e => e.candidates[0].decision = 'deferred']) {
    const invalid = structuredClone(evidence); edit(invalid);
    assert.throws(() => importMieleModels({target, evidence: invalid}));
  }
  assert.deepEqual(hashes(target), before);
});

test('source drift in Miele articles, prices, unrelated brand or version aborts atomically', () => {
  for (const relative of ['src/data/miele-spare-records.js', 'src/data/miele-commerce-records.js', 'src/data/samsung-pack.js', 'package.json', 'src/core/typeplate.js']) {
    const target = fresh(), filename = path.join(target, relative);
    fs.appendFileSync(filename, '\n ');
    const before = hashes(target);
    assert.throws(() => importMieleModels({target, evidence}), /Source conflict/);
    assert.deepEqual(hashes(target), before);
  }
});

test('partial import and modified generated payload are rejected without writes', () => {
  const target = fresh();
  importMieleModels({target, evidence});
  const module = path.join(target, 'src/data/miele-models-wave2.js');
  fs.appendFileSync(module, '\n// conflict\n');
  const before = hashes(target);
  assert.throws(() => importMieleModels({target, evidence}), /New output conflict/);
  assert.deepEqual(hashes(target), before);
  const partial = fresh();
  const plan = createPlan({target: partial, evidence});
  fs.writeFileSync(path.join(partial, 'src/data/miele-models.js'), plan.changed.get('src/data/miele-models.js'));
  const state = hashes(partial);
  assert.throws(() => importMieleModels({target: partial, evidence}), /Partial wave import/);
  assert.deepEqual(hashes(partial), state);
});

test('symlink files, dangling symlinks and symlink source directories are refused', () => {
  const target = fresh();
  const module = path.join(target, 'src/data/miele-models.js');
  const moved = path.join(work, 'outside-original.js');
  fs.renameSync(module, moved); fs.symlinkSync(moved, module);
  assert.throws(() => importMieleModels({target, evidence}), /Symlink source/);
  const dangling = fresh();
  fs.symlinkSync(path.join(work, 'not-there.js'), path.join(dangling, 'src/data/miele-models-wave2.js'));
  assert.throws(() => importMieleModels({target: dangling, evidence}), /Symlink target/);
  const directory = fresh();
  fs.renameSync(path.join(directory, 'src/data'), path.join(directory, 'elsewhere'));
  fs.symlinkSync(path.join(directory, 'elsewhere'), path.join(directory, 'src/data'));
  assert.throws(() => importMieleModels({target: directory, evidence}), /Symlink source/);
});

test('exclusive lock and simulated mid-commit I/O failure leave exact original files', () => {
  const target = fresh(), before = hashes(target);
  const lock = path.join(target, '.miele-wave2-import.lock');
  fs.writeFileSync(lock, 'busy');
  assert.throws(() => importMieleModels({target, evidence}), /EEXIST/);
  assert.equal(fs.readFileSync(lock, 'utf8'), 'busy');
  fs.unlinkSync(lock);
  let renames = 0;
  assert.throws(() => importMieleModels({target, evidence, transactionOptions: {rename: (from, to) => {
    if (++renames === 7) throw Error('simulated rename failure');
    fs.renameSync(from, to);
  }}}), /simulated rename failure/);
  assert.deepEqual(hashes(target), before);
  assert.ok(!fs.readdirSync(target).some(p => p.startsWith('.miele-wave2-')));
});

test('CLI rejects missing/unknown arguments without source changes', () => {
  const target = fresh(), before = hashes(target);
  for (const args of [['--target'], ['--unexpected'], ['--check', '--dry-run']]) {
    const run = spawnSync(process.execPath, [path.join(root, 'integrations/import-miele-models-wave2.mjs'), ...args], {encoding: 'utf8'});
    assert.notEqual(run.status, 0);
  }
  assert.deepEqual(hashes(target), before);
});
