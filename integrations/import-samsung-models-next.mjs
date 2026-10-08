import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const copy = value => JSON.parse(JSON.stringify(value));
const fullCodePattern = /^(?:VC[A-Z0-9-]{4,16}|VS[A-Z0-9]{7,12})\/[A-Z0-9]{2,3}$/;
const codePattern = /^(?:VC[A-Z0-9-]{4,16}|VS[A-Z0-9]{7,12})$/;

function sourceUrl(value) {
  assert.equal(typeof value, 'string', 'Source URL must be text');
  const url = new URL(value);
  assert.equal(url.origin, 'https://www.samsung.com', 'Manufacturer HTTPS origin required');
  assert.equal(url.username + url.password + url.search + url.hash, '', 'Unexpected source URL credentials or parameters');
  assert.ok(/^\/de\/(?:support\/model\/|vacuum-cleaners\/stick\/)/.test(url.pathname), 'German device source required');
  assert.equal(url.href, value, 'Use the canonical source URL');
  return url;
}

export function validateEvidence(evidence) {
  assert.equal(evidence.schemaVersion, 1);
  assert.equal(evidence.brand, 'Samsung');
  assert.equal(evidence.baseline.modelCount, 69);
  assert.equal(evidence.baseline.partCount, 36);
  assert.equal(evidence.baseline.models.length, 69);
  assert.equal(new Set(evidence.baseline.models.map(m => m.code)).size, 69);
  assert.ok(evidence.models.length > 0 && evidence.models.length <= 31);
  const sources = new Map();
  for (const source of evidence.sources) {
    assert.ok(!sources.has(source.id), 'Duplicate source ID');
    sources.set(source.id, source);
  }
  const codes = new Set(evidence.baseline.models.map(m => m.code));
  const references = new Set(evidence.baseline.models.flatMap(m => m.deviceReferences));
  const variantOwners = new Map(evidence.baseline.models.flatMap(m => [m.code, ...m.deviceReferences.map(r => r.split('/')[0])].map(code => [code, m.code])));
  const groups = new Set();
  for (const model of evidence.models) {
    assert.ok(codePattern.test(model.code), 'Invalid model code');
    assert.equal(model.fullCode.split('/')[0], model.code);
    assert.ok(fullCodePattern.test(model.fullCode), 'Exact country-qualified device code required');
    assert.ok(!codes.has(model.code), 'Existing or repeated model code: ' + model.code);
    assert.ok(!variantOwners.has(model.code), 'A variant cannot become a second base device');
    codes.add(model.code);
    assert.equal(typeof model.baseDeviceKey, 'string');
    assert.ok(model.baseDeviceKey.length > 3);
    assert.ok(!groups.has(model.baseDeviceKey), 'Do not count one base device twice');
    groups.add(model.baseDeviceKey);
    assert.ok(['floor', 'cordless'].includes(model.deviceType), 'Device outside vacuum scope');
    assert.equal(model.region, 'DE');
    assert.equal(model.decision, 'add');
    assert.ok(model.independenceBasis.length > 20, 'An independence decision is required');
    assert.ok(model.notes.length && Array.isArray(model.uncertainties));
    assert.match(model.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(model.url, sources.get(model.primarySourceId)?.url);
    assert.equal(model.primarySourceId, model.referenceSources[model.fullCode]);
    assert.ok(model.deviceReferences.includes(model.fullCode));
    assert.equal(new Set(model.deviceReferences).size, model.deviceReferences.length);
    for (const reference of model.deviceReferences) {
      assert.ok(fullCodePattern.test(reference), 'Unqualified variant');
      assert.ok(!references.has(reference), 'Existing or repeated full reference: ' + reference);
      references.add(reference);
      const base = reference.split('/')[0];
      assert.ok(!variantOwners.has(base) || variantOwners.get(base) === model.code, 'Variant assigned to multiple base devices');
      variantOwners.set(base, model.code);
      const source = sources.get(model.referenceSources[reference]);
      assert.ok(source, 'Every variant needs its own observed manufacturer source');
      const url = sourceUrl(source.url);
      assert.equal(source.httpStatus, 200);
      assert.equal(source.observedFullCode, reference, 'URL alone does not prove a model');
      assert.equal(url.pathname, '/de/support/model/' + reference + '/', 'Exact support variant URL required');
      assert.equal(source.checkedAt, model.checkedAt);
      assert.match(source.responseSha256, /^[a-f0-9]{64}$/);
      assert.equal(source.categoryCode, model.deviceType === 'cordless' ? '2404' : '2401', 'Correct floor/stick vacuum service category required');
    }
    sourceUrl(model.url);
    if (model.deviceReferences.length > 1) {
      const proof = sources.get(model.equivalenceSourceId);
      assert.ok(proof, 'Variants cannot be merged without explicit manufacturer evidence');
      sourceUrl(proof.url);
      assert.equal(proof.equivalenceClaim, 'manufacturer_explicitly_identical');
      assert.deepEqual(proof.equivalentReferences, model.deviceReferences);
    }
  }
  assert.equal(evidence.result.addedModelCount, evidence.models.length);
  assert.equal(evidence.result.finalModelCount, 69 + evidence.models.length);
  assert.equal(evidence.result.finalModelsWithoutParts, 49 + evidence.models.length);
  assert.equal(evidence.result.remainingTargetSlots, 100 - evidence.result.finalModelCount);
  assert.equal(evidence.result.addedPartCount, 0);
  return sources;
}

function parseExport(raw, tag) {
  const pattern = new RegExp('export const ' + tag + '=([\\s\\S]*?);\\s*(?=export const |$)');
  const match = raw.match(pattern);
  assert.ok(match, 'Missing literal export: ' + tag);
  return JSON.parse(match[1]);
}

function recordFor(model) {
  const references = model.deviceReferences.join(', ');
  return {
    brand: 'Samsung', code: model.code, model: model.code, series: model.series,
    deviceType: model.deviceType, type: model.name, url: model.url,
    guideUrl: model.url, partsUrl: model.url,
    deviceReferences: [...model.deviceReferences], aliases: [...new Set([model.manufacturerModelName, model.name])],
    checkedAt: model.checkedAt,
    sourceNote: `Samsung-DE belegt ${references}. ${model.independenceBasis} Der Serviceeintrag belegt die Gerätekennung; aktuellen deutschen Verkauf, Preis und Verfügbarkeit bestätigt er nicht.`,
    variantNote: `Vollständigen Modellcode einschließlich Länderkennung am Typenschild prüfen (${references}). Ausführungen, Baujahr und Zubehör separat prüfen; aus Serienähnlichkeit folgt keine Teilepassung.`,
    partListCoverage: {sourceUrl: model.url, note: 'Noch keine gerätespezifisch geprüften Artikelquellen importiert. 0 gelistete Teile; aus Geräteunterlagen und mitgeliefertem Zubehör werden keine Ersatzteilbeziehungen abgeleitet.'},
    partCount: 0, physicalPartCount: 0
  };
}

// These are isolated preparation patches in a restored working copy, never archive edits.
function updateLegacyAssertions(raw, count) {
  const replacements = [
    ["assert.equal(catalogCoverage().find(r=>r.brand==='Samsung').recordsWithoutParts,49);", `assert.equal(catalogCoverage().find(r=>r.brand==='Samsung').recordsWithoutParts,${49 + count});`, 1],
    ["assert.equal(filterCatalog({brand:'Samsung',partCoverage:'missing'}).length,49);", `assert.equal(filterCatalog({brand:'Samsung',partCoverage:'missing'}).length,${49 + count});`, 1],
    ["assert.equal(catalogCoverage().find(r=>r.brand==='Samsung').models,69);", `assert.equal(catalogCoverage().find(r=>r.brand==='Samsung').models,${69 + count});`, 2]
  ];
  for (const [before, after, occurrences] of replacements) {
    const beforeCount = raw.split(before).length - 1;
    const afterCount = raw.split(after).length - 1;
    assert.ok(beforeCount === occurrences && afterCount === 0 || beforeCount === 0 && afterCount === occurrences,
      'Legacy assertion changed; review the Samsung preparation patch before integrating');
    raw = raw.replaceAll(before, after);
  }
  return raw;
}

function updateSamsungTypeplate(raw) {
  const before = 'VS(?:15|20|28)[A-Z0-9]{7,9}';
  const after = 'VS(?:(?:15|20|28)[A-Z0-9]{7,9}|(?:70|80|90)[A-Z0-9]{6})';
  assert.ok(raw.split(before).length === 2 && !raw.includes(after) || !raw.includes(before) && raw.split(after).length === 2,
    'Samsung typeplate parser changed; review this isolated prefix patch');
  return raw.replace(before, after);
}

function updateGlobalAssertions(raw, count) {
  for (const [expression, baseline] of [
    ['catalogStats.modelCount', 895], ['catalogStats.recordCount', 906],
    ['progress.reduce((n,r)=>n+r.slots,0)', 682]
  ]) {
    const before = `assert.equal(${expression},${baseline});`;
    const after = `assert.equal(${expression},${baseline + count});`;
    assert.ok(raw.split(before).length === 2 && !raw.includes(after) || !raw.includes(before) && raw.split(after).length === 2,
      'Global count assertion changed; review alongside other Work imports');
    raw = raw.replace(before, after);
  }
  return raw;
}

async function packedByteCount(pack) {
  const require = createRequire(new URL('./auth-sdk/package.json', import.meta.url));
  const esbuild = process.env.UF_ESBUILD_MODULE ? await import(process.env.UF_ESBUILD_MODULE) : require('esbuild');
  const result = await esbuild.build({stdin: {contents: 'export const brandPack=' + JSON.stringify(pack) + ';\n', loader: 'js'},
    bundle: true, format: 'esm', platform: 'browser', target: 'es2022', minify: true, legalComments: 'inline', write: false});
  return result.outputFiles[0].contents.length;
}

export async function importSamsungModels({target, evidence, check = false}) {
  validateEvidence(evidence);
  const root = fs.realpathSync(target);
  const paths = {
    pack: path.join(root, 'src/data/samsung-pack.js'),
    index: path.join(root, 'src/data/new-brands-index.js'),
    tests: path.join(root, 'tests/catalog-v126.test.mjs'),
    typeplate: path.join(root, 'src/core/typeplate.js'),
    testsSeven: path.join(root, 'tests/catalog-seven-brands.test.mjs'),
    testsVorwerk: path.join(root, 'tests/vorwerk-expansion.test.mjs')
  };
  for (const filename of Object.values(paths)) {
    assert.equal(fs.realpathSync(filename), filename, 'Do not follow source file symlinks');
  }
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version, evidence.baseline.version,
    'Rebase/import review required for a different source checkpoint');
  const raw = Object.fromEntries(Object.entries(paths).map(([key, filename]) => [key, fs.readFileSync(filename, 'utf8')]));
  const pack = parseExport(raw.pack, 'brandPack');
  const index = parseExport(raw.index, 'newBrandsIndex');
  const manifest = parseExport(raw.index, 'newBrandsManifest');
  assert.equal(pack.brand, 'Samsung');
  assert.equal(hash(pack.parts), evidence.baseline.partsSha256, 'Existing Samsung articles/relationships changed');
  const baselineCodes = new Set(evidence.baseline.models.map(m => m.code));
  assert.equal(hash(pack.models.filter(m => baselineCodes.has(m.code))), evidence.baseline.modelRowsSha256, 'Existing Samsung detail rows changed');
  assert.equal(hash(index.filter(m => m.brand === 'Samsung' && baselineCodes.has(m.code))), evidence.baseline.indexRowsSha256, 'Existing Samsung index rows changed');
  const samsung = index.filter(m => m.brand === 'Samsung');
  assert.equal(new Set(pack.models.map(m => m.code)).size, pack.models.length, 'Duplicate detail row');
  assert.equal(new Set(samsung.map(m => m.code)).size, samsung.length, 'Duplicate index row');
  assert.equal(pack.models.length, samsung.length, 'Partial index/detail import');
  assert.deepEqual(new Set(pack.models.map(m => m.code)), new Set(samsung.map(m => m.code)));
  const untouchedIndex = copy(index.filter(m => m.brand !== 'Samsung'));
  const untouchedManifest = copy(Object.fromEntries(Object.entries(manifest).filter(([brand]) => brand !== 'Samsung')));
  let added = 0;
  for (const model of evidence.models) {
    const record = recordFor(model);
    const {partListCoverage, ...summary} = record;
    const detail = pack.models.find(m => m.code === model.code);
    const compact = samsung.find(m => m.code === model.code);
    assert.equal(Boolean(detail), Boolean(compact), 'Partial model import');
    if (detail) {
      assert.deepEqual(detail, record, 'Imported detail differs from evidence');
      assert.deepEqual(compact, summary, 'Imported index differs from evidence');
    } else {
      assert.ok(!check, 'Model not imported: ' + model.code);
      pack.models.push(record);
      const last = index.map(m => m.brand).lastIndexOf('Samsung');
      assert.ok(last >= 0);
      index.splice(last + 1, 0, summary);
      added++;
    }
  }
  assert.equal(pack.models.length, evidence.result.finalModelCount, 'Unknown Samsung rows require an import review');
  const expectedManifest = {...manifest.Samsung, modelCount: pack.models.length, recordCount: pack.models.length,
    packBytes: await packedByteCount(pack),
    note: `${pack.models.length} Samsung-Modellgruppen mit exakten Herstellerkennungen; 20 mit bestehenden gelisteten Zubehörbeziehungen, ${evidence.result.finalModelsWithoutParts} ohne importierte gerätespezifische Teile. ${evidence.models.length} weitere Grundgeräte aus der Recherche zu Issue #13; baugleiche Ultra-Farbausführungen zählen gemeinsam. Herstellerweite Obergrenze und weitere Varianten bleiben offen.`};
  assert.equal(expectedManifest.partCount, 36);
  assert.equal(expectedManifest.physicalPartCount, 36);
  if (check) assert.deepEqual(manifest.Samsung, expectedManifest, 'Samsung manifest is stale');
  manifest.Samsung = expectedManifest;
  const tests = updateLegacyAssertions(raw.tests, evidence.models.length);
  const typeplate = updateSamsungTypeplate(raw.typeplate);
  assert.deepEqual(index.filter(m => m.brand !== 'Samsung'), untouchedIndex);
  assert.deepEqual(Object.fromEntries(Object.entries(manifest).filter(([brand]) => brand !== 'Samsung')), untouchedManifest);
  const output = {
    pack: '// Samsung model-only preparation for Issue #13; source checkpoint remains unchanged.\nexport const brandPack=' + JSON.stringify(pack) + ';\n',
    index: '// Verified Samsung and Hoover model index.\nexport const newBrandsIndex=' + JSON.stringify(index) + ';\nexport const newBrandsManifest=' + JSON.stringify(manifest) + ';\n',
    tests, typeplate,
    testsSeven: updateGlobalAssertions(raw.testsSeven, evidence.models.length),
    testsVorwerk: updateGlobalAssertions(raw.testsVorwerk, evidence.models.length)
  };
  // Validate the entire batch before writing any file; repeat/check runs are byte-stable.
  if (check) {
    for (const key of Object.keys(paths)) assert.equal(raw[key], output[key], 'Prepared file differs: ' + key);
  } else {
    for (const key of Object.keys(paths)) if (raw[key] !== output[key]) fs.writeFileSync(paths[key], output[key]);
  }
  return {addedModels: added, samsungModels: pack.models.length, exactNewReferences: evidence.models.reduce((n, m) => n + m.deviceReferences.length, 0),
    samsungArticles: pack.parts.length, addedArticles: 0, addedFitment: 0, modelsWithoutParts: evidence.result.finalModelsWithoutParts, check};
}

async function main() {
  const args = process.argv.slice(2);
  let target = path.join(projectRoot, 'site');
  let evidenceFile = path.join(projectRoot, 'integrations/samsung-model-research-next.json');
  let check = false;
  while (args.length) {
    const arg = args.shift();
    if (arg === '--target' || arg === '--evidence') {
      assert.ok(args[0] && !args[0].startsWith('--'), 'Missing value for ' + arg);
      if (arg === '--target') target = path.resolve(args.shift());
      else evidenceFile = path.resolve(args.shift());
    } else if (arg === '--check') check = true;
    else throw new Error('Unknown option: ' + arg);
  }
  console.log(JSON.stringify(await importSamsungModels({target, evidence: JSON.parse(fs.readFileSync(evidenceFile, 'utf8')), check})));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {console.error(error.message); process.exitCode = 1;});
}
