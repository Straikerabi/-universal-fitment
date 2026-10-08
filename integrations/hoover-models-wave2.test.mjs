import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync, spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {test} from 'node:test';
import {root, validateResearch, planHooverImport, runHooverImport} from './import-hoover-models-wave2.mjs';

const research = JSON.parse(fs.readFileSync(path.join(root, 'integrations/hoover-model-research-wave2.json')));
const evidence = JSON.parse(fs.readFileSync(path.join(root, 'integrations/hoover-source-evidence-wave2.json')));
const checkpoint = JSON.parse(fs.readFileSync(path.join(root, 'integrations/hoover-checkpoint-lock-wave2.json')));
const accepted = research.candidates.filter(row => row.decision === 'accepted');
const target = path.resolve(process.env.UF_HOOVER_TARGET || path.join(root, 'site'));
const source = relative => import(pathToFileURL(path.join(target, relative)));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

function snapshot(directory) {
  const result = {};
  const visit = (dir, prefix = '') => {
    for (const name of fs.readdirSync(dir).sort()) {
      const relative = prefix + name, file = path.join(dir, name), stat = fs.lstatSync(file);
      if (stat.isSymbolicLink()) result[relative] = 'symlink:' + fs.readlinkSync(file);
      else if (stat.isDirectory()) visit(file, relative + '/');
      else result[relative] = sha(fs.readFileSync(file));
    }
  };
  visit(directory); return result;
}
async function fixture(fn) {
  const parent = fs.mkdtempSync(path.join(root, '.hoover-wave2-test-'));
  const site = path.join(parent, 'site');
  execFileSync('python3', [path.join(root, 'integrations/restore-source-checkpoint.py'), '--target', site]);
  try {return await fn(site, parent);} finally {fs.rmSync(parent, {recursive:true, force:true});}
}
const firstAccepted = data => data.candidates.find(row => row.decision === 'accepted');

test('manufacturer evidence, exact product codes, all decisions and target accounting', () => {
  assert.equal(validateResearch(research, evidence).length, 76);
  assert.deepEqual(research.summary.acceptedByMarket, {DE:3, GB:72, FR:1});
  assert.equal(evidence.directory.facts.length, 518);
  assert.equal(research.candidates.length, 522);
  assert.equal(new Set(accepted.map(row => row.productCode)).size, 76);
  for (const model of ['CP71CP01', 'SL8123']) {
    const rows = research.candidates.filter(row => row.model === model);
    assert.equal(rows.length, 2); assert.ok(rows.every(row => row.decision === 'deferred'));
  }
  for (const row of research.candidates.filter(row => ['Handheld Models', 'Robot Models'].includes(row.manufacturerCategory))) {
    assert.equal(row.decision, 'rejected'); assert.equal(row.countsAsNewBase, false);
  }
  assert.ok(research.candidates.filter(row => /\+|KIT /.test(row.model)).every(row => row.decision === 'rejected'));
  assert.ok(research.candidates.filter(row => /^(?:HF910|HF920|BR71)/.test(row.model)).every(row => row.decision !== 'accepted'));
  assert.equal(research.summary.existingFitmentRelationships, 22);
});

for (const [label, mutate] of [
  ['unverified model page', (r, e) => {e.modelPages.find(row => row.url === firstAccepted(r).url).verified = false;}],
  ['wrong product code', r => {firstAccepted(r).productCode = '39009999';}],
  ['foreign source host', r => {firstAccepted(r).url = 'https://example.com/hoover';}],
  ['source credentials', r => {firstAccepted(r).url = 'https://user:pass@www.hoover-home.com/';}],
  ['robot device', r => {firstAccepted(r).deviceCategory = 'robot';}],
  ['invented revision', r => {firstAccepted(r).technicalRevision = '01';}],
  ['invented article', r => {firstAccepted(r).partsAdded = 1;}],
  ['invented fitment', r => {firstAccepted(r).fitmentRelationshipsAdded = 1;}],
  ['invented price', r => {firstAccepted(r).price = 99;}],
  ['bad manufacturer manual', (r, e) => {e.manuals.find(row => row.url === r.candidates.find(row => row.decision === 'accepted' && row.manualUrl).manualUrl).pdf = false;}],
  ['same manual under another URL', (r, e) => {const ms=r.candidates.filter(row => row.decision === 'accepted' && row.manualUrl);e.manuals.find(row => row.url === ms[1].manualUrl).sha256=e.manuals.find(row => row.url === ms[0].manualUrl).sha256;}],
  ['duplicate base decision', r => {const ms=r.candidates.filter(row => row.decision === 'accepted');ms[1].baseModelKey=ms[0].baseModelKey;}],
  ['count inflation', r => {r.summary.accepted++;}],
]) {
  test('rejects research with ' + label, () => {
    const r = structuredClone(research), e = structuredClone(evidence); mutate(r, e);
    assert.throws(() => validateResearch(r, e));
  });
}

test('dry run leaves the entire checkpoint unchanged; application is idempotent', () => fixture(async site => {
  const before = snapshot(site);
  const dry = await runHooverImport(site, {check:true});
  assert.equal(dry.state, 'baseline'); assert.deepEqual(dry.writtenFiles, []);
  assert.deepEqual(snapshot(site), before);
  const applied = await runHooverImport(site);
  assert.equal(applied.newModels, 76); assert.equal(applied.writtenFiles.length, 6);
  const after = snapshot(site);
  const twice = await runHooverImport(site);
  assert.equal(twice.state, 'applied'); assert.deepEqual(twice.writtenFiles, []);
  assert.deepEqual(snapshot(site), after);
  assert.equal((await runHooverImport(site, {check:true})).state, 'applied');
  const changed = Object.keys(after).filter(file => before[file] !== after[file]);
  assert.deepEqual(changed.sort(), applied.generatedSourceFiles.slice().sort());
}));

for (const file of ['src/data/hoover-pack.js', 'src/data/new-brands-index.js', 'src/core/typeplate.js', 'src/data/miele-model-records.js', 'src/data/samsung-pack.js', 'package.json']) {
  test('conflicting source aborts without touching any other file: ' + file, () => fixture(async site => {
    fs.appendFileSync(path.join(site, file), '\n/* independent work */\n');
    const before = snapshot(site);
    await assert.rejects(runHooverImport(site), /conflict/i);
    assert.deepEqual(snapshot(site), before);
  }));
}

test('detects a partial import instead of overwriting a mixed state', () => fixture(async site => {
  const plan = await planHooverImport(site);
  const [relative, bytes] = [...plan.outputs][0]; fs.writeFileSync(path.join(site, relative), bytes);
  const before = snapshot(site);
  await assert.rejects(runHooverImport(site), /Partial import/);
  assert.deepEqual(snapshot(site), before);
}));

test('preflight race aborts before the first source rename', () => fixture(async site => {
  const file = path.join(site, 'src/data/samsung-pack.js');
  const before = snapshot(site);
  await assert.rejects(runHooverImport(site, {beforeCommit:() => fs.appendFileSync(file, '\n// concurrent update\n')}), /changed during preflight/);
  const after = snapshot(site);
  assert.deepEqual(Object.keys(after).filter(key => before[key] !== after[key]), ['src/data/samsung-pack.js']);
  assert.ok(!fs.existsSync(path.join(site, '.hoover-wave2-import-lock')));
}));

test('I/O failure after a staged rename rolls back all earlier source files', () => fixture(async site => {
  const before = snapshot(site); let calls = 0;
  await assert.rejects(runHooverImport(site, {rename:(from, to) => {if (++calls === 3) throw Error('simulated rename failure');fs.renameSync(from, to);}}), /simulated rename failure/);
  assert.deepEqual(snapshot(site), before);
}));

test('root/ancestor/data/file symlinks cannot escape the target', () => fixture(async (site, parent) => {
  const alias = path.join(parent, 'alias'); fs.symlinkSync(site, alias);
  await assert.rejects(runHooverImport(alias), /symlink/);
  const outside = path.join(parent, 'outside'); fs.renameSync(path.join(site, 'src/data'), outside);
  fs.symlinkSync(outside, path.join(site, 'src/data'));
  const before = snapshot(site);
  await assert.rejects(runHooverImport(site), /symlink/);
  assert.deepEqual(snapshot(site), before);
}));

test('an import lock prevents another writer or an interrupted transaction', () => fixture(async site => {
  fs.mkdirSync(path.join(site, '.hoover-wave2-import-lock'));
  const before = snapshot(site);
  await assert.rejects(runHooverImport(site), /holds the lock/);
  assert.deepEqual(snapshot(site), before);
}));

test('CLI refuses ambiguous targets/unknown flags and main branches', () => fixture(async (site, parent) => {
  const script = path.join(root, 'integrations/import-hoover-models-wave2.mjs');
  for (const args of [[], ['--target'], ['--target', site, '--target', site], ['--target', site, '--force']]) {
    const result = spawnSync(process.execPath, [script, ...args], {encoding:'utf8'});
    assert.notEqual(result.status, 0);
  }
  execFileSync('git', ['init', '-b', 'main', parent], {stdio:'ignore'});
  const before = snapshot(site);
  await assert.rejects(runHooverImport(site), /main\/master/);
  assert.deepEqual(snapshot(site), before);
}));

test('corrupt baseline lock and false source revision both abort without mutation', () => fixture(async site => {
  const cp = structuredClone(checkpoint);
  cp.files['src/data/hoover-pack.js'].baseline += '\n';
  const before = snapshot(site);
  await assert.rejects(runHooverImport(site, {checkpoint:cp}), /Corrupt baseline/);
  const r = structuredClone(research); r.appVersion = '9.9.9';
  await assert.rejects(runHooverImport(site, {research:r}));
  assert.deepEqual(snapshot(site), before);
}));

test('index/payload, hydration, stable originals, all parts/prices/states and exact identity boundaries', async () => {
  assert.equal((await runHooverImport(target, {check:true})).state, 'applied', 'Apply the local importer before the app integration test');
  const {brandPack} = await source('src/data/hoover-pack.js');
  const {newBrandsIndex, newBrandsManifest} = await source('src/data/new-brands-index.js');
  const {applyHooverFitment} = await source('src/data/hoover-fitment.js');
  const {products, partsCatalog, registerCatalogPack, catalogCoverage, catalogStats, filterCatalog} = await source('src/data/catalog.js');
  const {reviewTypePlate, reviewScannedCode, parseTypePlate} = await source('src/core/typeplate.js');
  const {brandDeviceId} = await source('src/data/brand-products.js');
  const {createCatalogLoader, brandsForBackup} = await source('src/core/catalog-loader.js');
  const {quoteForPart, cartQuoteItem} = await source('src/data/miele-commerce.js');
  const {installationTime} = await source('src/data/miele-installation-times.js');
  const {createBackup, reviewBackup} = await source('src/core/backup.js');
  const {catalogTargetProgress} = await source('src/data/catalog-plan.js');
  const basePack = JSON.parse(checkpoint.files['src/data/hoover-pack.js'].baseline.split('export const brandPack=')[1].trim().replace(/;$/, ''));
  assert.deepEqual(brandPack.models.slice(0, 24), basePack.models);
  assert.deepEqual(brandPack.parts, basePack.parts);
  const transformed = applyHooverFitment(brandPack), baseTransformed = applyHooverFitment(basePack);
  assert.deepEqual(transformed.parts, baseTransformed.parts, 'All 60 original physical articles, source prices and fitment preserved');
  assert.deepEqual(transformed.models.slice(0, 24), baseTransformed.models);
  assert.equal(transformed.parts.length, 60);
  assert.equal(transformed.parts.reduce((sum, row) => sum + row.relationships.length, 0), 22);
  assert.equal(brandPack.models.length, 100);
  assert.equal(newBrandsIndex.filter(row => row.brand === 'Hoover').length, 100);
  assert.equal(newBrandsManifest.Hoover.recordCount, 100);
  assert.equal(newBrandsManifest.Hoover.manualCount, 72);
  const baselineIndex = JSON.parse(checkpoint.files['src/data/new-brands-index.js'].baseline.split('export const newBrandsIndex=')[1].split('export const newBrandsManifest=')[0].trim().replace(/;$/, ''));
  assert.deepEqual(newBrandsIndex.filter(row => row.brand !== 'Hoover'), baselineIndex.filter(row => row.brand !== 'Hoover'));
  const expected = products.filter(row => row.brand === 'Hoover'), refs = new Map(expected.map(row => [row.id, row]));
  const before = catalogCoverage().find(row => row.brand === 'Hoover');
  assert.equal(before.models, 100); assert.equal(before.recordsWithoutParts, 98);
  assert.equal(filterCatalog({brand:'Hoover', partCoverage:'missing'}).length, 98);
  const oldParts = partsCatalog.length, bad = structuredClone(brandPack); bad.models.pop();
  assert.throws(() => registerCatalogPack(bad)); assert.equal(partsCatalog.length, oldParts);
  assert.ok(expected.every(row => !row.catalogLoaded));
  let imports = 0;
  const loader = createCatalogLoader({packs:{Hoover:'fixture'}, register:registerCatalogPack,
    importModule:async () => {imports++; return {brandPack};}});
  await Promise.all([loader.ensure('Hoover'), loader.ensure('Hoover')]);
  assert.equal(imports, 1); assert.equal(partsCatalog.length, oldParts + 60);
  await loader.ensure('Hoover'); registerCatalogPack(brandPack);
  assert.equal(partsCatalog.length, oldParts + 60);
  const after = catalogCoverage().find(row => row.brand === 'Hoover');
  for (const key of ['models', 'records', 'recordsWithParts', 'recordsWithoutParts', 'parts', 'physicalParts', 'manuals']) assert.equal(after[key], before[key]);
  assert.equal(after.recordsWithParts, 2); assert.equal(after.recordsWithoutParts, 98);
  assert.equal(catalogStats.modelCount, 1019); assert.equal(catalogStats.recordCount, 1030);
  const progress = catalogTargetProgress(catalogCoverage()).find(row => row.brand === 'Hoover');
  assert.equal(progress.models, 100); assert.equal(progress.slots, 100); assert.equal(progress.missing, 0); assert.equal(progress.partsMissing, 40);
  for (const item of accepted) {
    const id = brandDeviceId('Hoover', item.code), device = products.find(row => row.id === id);
    assert.equal(device, refs.get(id), 'Hydration preserves saved-device object identity');
    assert.equal(device.parts.length, 0); assert.equal(device.partCount, 0); assert.equal(device.physicalPartCount, 0);
    assert.equal(device.candidateParts.length, 0); assert.equal(device.deviceQuote, null);
    assert.equal(device.identityScope, 'model-reference'); assert.equal(device.category, 'vacuum');
    assert.ok(device.sources.some(row => row.url === item.url));
    assert.ok(device.identifiers.some(row => row.type === 'device-sku' && row.value === item.productCode));
    assert.ok(device.facts.some(row => row.label === 'Quellenmarkt'));
    const result = reviewTypePlate(`Hoover\nModell: ${item.model}\nProduktcode: ${item.productCode}`);
    assert.equal(result.status, 'catalog_reference', item.model); assert.deepEqual(result.suggestions.map(row => row.id), [id]);
    assert.equal(reviewTypePlate(`Bosch\nModell: ${item.model}\nProduktcode: ${item.productCode}`).suggestions.length, 0);
    assert.equal(reviewTypePlate(`Hoover\nSeriennummer: ${item.productCode}`).suggestions.length, 0);
    assert.equal(reviewTypePlate(`Hoover\nModell: ${item.model}\nProduktcode: 39009999`).status, 'conflict');
    assert.equal(reviewTypePlate(`Hoover\nModell: ${item.model}\nProduktcode: 39 009 999`).status, 'conflict');
    assert.equal(reviewTypePlate(`Hoover\nModell: ${item.model}/9\nProduktcode: ${item.productCode}`).status, 'conflict');
    const other = accepted.find(row => row.productCode !== item.productCode);
    assert.equal(reviewTypePlate(`Hoover\nModell: ${item.model}\nProduktcode: ${other.productCode}`).status, 'conflict');
    assert.equal(reviewTypePlate(`Hoover\nPNC: ${item.productCode}`).suggestions.length, 0);
    const scanned = reviewScannedCode(item.productCode); assert.equal(scanned.status, 'catalog_reference');
    assert.deepEqual(scanned.suggestions.map(row => row.id), [id]);
    const unlabelled = parseTypePlate(`Hoover\n${item.model}`).entries;
    assert.ok(unlabelled.every(entry => entry.kind !== 'enumber' || !entry.value.includes(item.productCode)));
  }
  for (const part of partsCatalog.filter(row => row.brand === 'Hoover')) {
    assert.equal(quoteForPart(part), null); assert.equal(cartQuoteItem(part), null);
    assert.equal(installationTime(part).status, 'unknown');
    assert.ok(part.modelIds.every(id => ['vac-hoover-model-hf202p011', 'vac-hoover-model-hf201h011'].includes(id)));
  }
  assert.equal(expected.find(row => row.id === 'vac-hoover-model-hf202p011').parts.length, 10);
  assert.equal(expected.find(row => row.id === 'vac-hoover-model-hf201h011').parts.length, 12);
  const saved = [expected[0].id, brandDeviceId('Hoover', accepted[0].code)];
  assert.deepEqual(brandsForBackup({saved}, products), ['Hoover']);
  const backup = createBackup({saved}, [], {});
  const restored = reviewBackup(JSON.stringify(backup));
  assert.deepEqual(restored.data.saved, saved);
  assert.equal(newBrandsManifest.Hoover.packBytes, fs.statSync(path.join(target, 'catalog-hoover-v1.28.0.js')).size, 'Index byte metadata follows reproducible payload');
});
