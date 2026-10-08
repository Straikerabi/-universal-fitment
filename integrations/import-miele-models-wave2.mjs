import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const digest = value => createHash('sha256').update(value).digest('hex');
const canonical = value => String(value).normalize('NFKD').replace(/\p{M}/gu, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const sourcePins = {
  'catalog-2011': ['https://www1.miele.de/ex/prospects/de/2011_10/9013391_Bodenpflege_FH/pdf/all.pdf', 'a0b22d802bd66cb2fa13b8bfd1b6747e7b155d149c108f2ae8f895503da55c25'],
  'catalog-2013': ['https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf', 'b4160e666a0c26607950a76cd35088a58c05c0646e477c31ee4660b31a17a138'],
  'catalog-2012-oct': ['https://www1.miele.de/ex/prospects/de/2012_10/9013393_Bodenpflege/pdf/all.pdf', '1b28cfba25d44511d6b79f582cf09a3d4c9e5cd9588d2082d553c5385d75ba5f']
};

export function validateEvidence(evidence) {
  assert.equal(evidence.schemaVersion, 1);
  assert.equal(evidence.issue, 22);
  assert.equal(evidence.branch, 'work/model-miele-wave2');
  assert.equal(evidence.brand, 'Miele');
  const baseline = evidence.baseline;
  assert.equal(baseline.commit, 'd254df54d7bb4d72febdf9f2587efec9a66be336');
  assert.equal(baseline.version, '1.28.0');
  assert.equal(baseline.modelCount, 57);
  assert.equal(baseline.recordCount, 62);
  assert.equal(baseline.models.length, 62);
  assert.equal(new Set(baseline.models.map(m => m.material)).size, 62);
  assert.equal(new Set(baseline.models.map(m => m.model)).size, 57);
  assert.equal(baseline.coverage.physicalParts, 167);
  assert.equal(Object.keys(baseline.sourceFiles).length, 131);
  for (const [relative, sha] of Object.entries(baseline.sourceFiles)) {
    assert.ok(!path.isAbsolute(relative) && !relative.split('/').includes('..'));
    assert.match(sha, /^[a-f0-9]{64}$/);
  }
  const sources = new Map();
  for (const source of evidence.sources) {
    assert.ok(!sources.has(source.id), 'Duplicate source ID');
    assert.deepEqual([source.url, source.responseSha256], sourcePins[source.id], 'Unreviewed manufacturer source');
    assert.equal(source.market, 'DE');
    assert.equal(source.httpStatus, 200);
    assert.equal(source.verification, 'downloaded_pdf_and_table_checked');
    assert.equal(source.checkedAt, evidence.checkedAt);
    assert.ok(Number.isInteger(source.responseBytes) && source.responseBytes > 1000);
    for (const table of source.tables) {
      assert.ok(Number.isInteger(table.pdfPage) && table.pdfPage > 0 && table.pdfPage <= source.pageCount);
      assert.equal(table.tableLabel, 'Typ-/Verkaufsbezeichnung');
      assert.match(table.pageTextSha256, /^[a-f0-9]{64}$/);
      assert.equal(new Set(table.observedCodes).size, table.observedCodes.length);
      assert.ok(table.observedCodes.every(c => /^S [1-9]\d{2,3}$/.test(c)));
    }
    sources.set(source.id, source);
  }
  assert.equal(sources.size, 3);
  const candidates = evidence.candidates;
  assert.equal(new Set(candidates.map(c => c.id)).size, candidates.length);
  const models = candidates.filter(c => c.decision === 'accepted');
  assert.ok(models.length > 0 && models.length <= 43);
  const known = new Set(baseline.models.flatMap(m => [m.model, m.material, m.ean, m.type, m.series, m.alternativeName]).filter(Boolean).map(canonical));
  // Also reject a historical code embedded in a current alias/marketing label.
  for (const row of baseline.models) for (const label of [row.model, row.alternativeName]) {
    for (const match of String(label).matchAll(/\bS\s*([1-9]\d{2,3})\b/gi)) known.add('S' + match[1]);
  }
  const groups = new Set();
  for (const candidate of candidates) {
    assert.ok(['accepted', 'rejected', 'deferred'].includes(candidate.decision));
    assert.equal(candidate.checkedAt, evidence.checkedAt);
    assert.equal(candidate.brand, 'Miele');
    if (candidate.decision !== 'accepted') {
      assert.equal(candidate.addedModelCount, 0);
      assert.ok(candidate.reason.length > 20 && sources.has(candidate.sourceId));
      continue;
    }
    const code = canonical(candidate.modelCode);
    assert.match(candidate.modelCode, /^S [1-9]\d{2,3}$/);
    assert.equal(candidate.modelName, candidate.modelCode);
    assert.equal(candidate.id, 'miele-' + code.toLowerCase());
    assert.equal(candidate.baseDeviceKey, 'miele:historical:' + code.toLowerCase());
    assert.ok(!known.has(code), 'Existing/alias/duplicate base code: ' + code);
    assert.ok(!groups.has(candidate.baseDeviceKey), 'Duplicate base device');
    known.add(code); groups.add(candidate.baseDeviceKey);
    assert.equal(candidate.market, 'DE');
    assert.equal(candidate.deviceType, 'bagged');
    assert.ok(['canister', 'stick', 'upright'].includes(candidate.formFactor), 'Outside household vacuum scope');
    assert.equal(candidate.variantStatus, 'execution_open');
    assert.equal(candidate.addedParts, 0);
    for (const key of ['countrySuffix', 'executionNumber', 'typePlateCode', 'materialNumber', 'ean']) {
      assert.equal(candidate[key], null, 'Do not invent a variant, material number, EAN or type code');
    }
    assert.ok(candidate.independenceBasis.length > 30 && candidate.duplicateDecision.length > 30);
    assert.ok(Array.isArray(candidate.uncertainties) && candidate.uncertainties.length >= 2);
    assert.deepEqual(candidate.aliases, [code]);
    assert.ok(candidate.sources.length > 0);
    for (const ref of candidate.sources) {
      const source = sources.get(ref.sourceId);
      const table = source?.tables.find(t => t.pdfPage === ref.pdfPage);
      assert.equal(ref.tableLabel, 'Typ-/Verkaufsbezeichnung');
      assert.equal(ref.observedCode, candidate.modelCode);
      assert.ok(table?.observedCodes.includes(candidate.modelCode), 'Model not observed in an individual manufacturer column');
    }
    assert.ok(candidate.sources.some(ref => ref.sourceId === candidate.primarySourceId && ref.pdfPage === candidate.primaryPdfPage));
  }
  assert.equal(evidence.result.addedModelCount, models.length);
  assert.equal(evidence.result.finalModelCount, 57 + models.length);
  assert.equal(evidence.result.finalRecordCount, 62 + models.length);
  assert.equal(evidence.result.finalModelsWithoutParts, models.length);
  assert.equal(evidence.result.physicalPartCount, 167);
  assert.equal(evidence.result.addedPartCount, 0);
  assert.equal(evidence.result.addedFitmentCount, 0);
  assert.equal(evidence.result.remainingTargetSlots, 43 - models.length);
  assert.equal(evidence.result.deferredCandidateCount, candidates.filter(c => c.decision === 'deferred').length);
  assert.equal(evidence.result.rejectedCandidateCount, candidates.filter(c => c.decision === 'rejected').length);
  // Bind every source guard and curated identity to the reviewed evidence, not editable claims.
  assert.equal(digest(JSON.stringify(baseline)), 'a0d3d63ecc50da2257f2006095dd9e6cef1de218f01944718bbfa552ea72648f', 'Reviewed baseline manifest changed');
  assert.equal(digest(JSON.stringify(evidence.sources)), '499b7362d1575c13d9005bc265d09eab9c4ff7f7c05d677bfb130c84425b7ee5', 'Reviewed manufacturer table evidence changed');
  assert.equal(digest(JSON.stringify(models)), '79dc9e8793e433ff5d05a64a9f21d6377ce672d229cef63fc42a233761b005a4', 'Reviewed model identities changed');
  return {models, sources};
}

export function productFor(model, sources) {
  const source = sources.get(model.primarySourceId);
  const sourceUrl = source.url + '#page=' + model.primaryPdfPage;
  const identityNote = 'Historische Miele-Modellreferenz. Ausführung, Materialnummer und Gerätetyp am Typenschild prüfen; Modellcode und Beipackzubehör bestätigen keine Ersatzteilpassung.';
  return {
    id: 'vac-miele-model-' + canonical(model.modelCode).toLowerCase(), recordType: 'model', category: 'vacuum', icon: '🧹', brand: 'Miele',
    model: model.modelName, type: 'Historischer ' + (model.formFactor === 'canister' ? 'Bodenstaubsauger' : model.formFactor === 'stick' ? 'Stielstaubsauger' : 'Bürststaubsauger') + ' · Ausführung offen',
    aliases: model.aliases, accessoryAliases: [], imageUrl: null, equipment: [], controlType: '',
    identifiers: [{type: 'manufacturer-model', value: model.modelCode}],
    dataStatus: 'manufacturer-verified', identityStatus: 'model_reference', variantStatus: 'execution_open',
    deviceReferences: [model.modelCode], variantNote: identityNote,
    vacuumMeta: {series: model.series, bagSystem: 'unknown', deviceType: model.deviceType, formFactor: model.formFactor, filterSystem: null, color: null, materialNumber: null, modelName: model.modelName, currentListing: false},
    sources: [{name: 'Miele · ' + model.modelCode + ' · Modellspalte S. ' + model.primaryPdfPage, url: sourceUrl, type: 'manufacturer', grade: 'A', license: 'source-linked', retrievedAt: model.checkedAt, note: 'Herstellerkatalog belegt ein vollständiges Haushaltsgerät unter diesem numerischen Modellcode. ' + identityNote}],
    manuals: [{label: 'Hersteller-Modellübersicht (historischer Katalog)', url: sourceUrl}, {label: 'Gebrauchsanweisung mit Typenschilddaten bei Miele suchen', url: 'https://www.miele.de/e/manual-finder'}],
    parts: [], candidateParts: [], stockPlans: [], issues: [], jobs: [],
    partListCoverage: {sourceUrl, status: 'missing', note: '0 gerätespezifisch geprüfte Teile. Vorhandene Familienlisten und mitgelieferte Düsen werden nicht übernommen.'},
    facts: [{label: 'Modell', value: model.modelCode}, {label: 'Geräteart', value: model.formFactor === 'canister' ? 'Bodenstaubsauger' : model.formFactor === 'stick' ? 'Stielstaubsauger' : 'Bürststaubsauger'}, {label: 'Modellstatus', value: 'Historische Hersteller-Modellreferenz'}, {label: 'Ausführungsstatus', value: 'Materialnummer, EAN und Typenschild-Ausführung nicht belegt'}, {label: 'Teileabdeckung', value: '0 gerätespezifisch geprüfte Teile'}, {label: 'Datenstand', value: model.checkedAt}]
  };
}

function replaceExact(raw, before, after, count = 1) {
  assert.equal(raw.split(before).length - 1, count, 'Integration anchor changed: ' + before.slice(0, 80));
  return raw.replaceAll(before, after);
}

function safePath(root, relative, {allowMissing = false} = {}) {
  const absolute = path.join(root, relative);
  assert.ok(absolute.startsWith(root + path.sep), 'Unsafe target path');
  for (const component of relative.split('/').reduce((list, name) => [...list, [...(list.at(-1) || []), name]], [])) {
    const filename = path.join(root, ...component);
    if (!fs.existsSync(filename)) {
      // lstat still catches a dangling symlink before accepting a missing output.
      try { assert.ok(!fs.lstatSync(filename).isSymbolicLink(), 'Symlink target'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      assert.ok(allowMissing && filename === absolute, 'Missing source path: ' + relative);
    } else assert.ok(!fs.lstatSync(filename).isSymbolicLink(), 'Symlink source path: ' + relative);
  }
  return absolute;
}

export function createPlan({target, evidence}) {
  const {models, sources} = validateEvidence(evidence);
  const snapshot = JSON.parse(fs.readFileSync(path.join(projectRoot, 'integrations/miele-models-wave2.baseline.json'), 'utf8'));
  assert.equal(snapshot.schemaVersion, 1);
  assert.equal(snapshot.sourceCommit, evidence.baseline.commit);
  assert.equal(Object.keys(snapshot.files).length, 11);
  for (const [relative, content] of Object.entries(snapshot.files)) {
    assert.equal(typeof content, 'string');
    assert.equal(digest(content), evidence.baseline.sourceFiles[relative], 'Pinned baseline changed: ' + relative);
  }
  const root = fs.realpathSync(target);
  const raw = {};
  for (const [relative, expected] of Object.entries(evidence.baseline.sourceFiles)) {
    const filename = safePath(root, relative);
    raw[relative] = fs.readFileSync(filename);
  }
  const baselineText = relative => {
    const current = raw[relative];
    if (digest(current) === evidence.baseline.sourceFiles[relative]) return current.toString('utf8');
    // Read the SHA-256-pinned baseline snapshot when checking an already imported target.
    const pinned = snapshot.files[relative];
    assert.equal(digest(pinned), evidence.baseline.sourceFiles[relative], 'Pinned baseline changed');
    return pinned;
  };
  const changed = new Map();
  const add = (relative, value) => changed.set(relative, Buffer.from(value));
  const audit = {issue: 22, baseline: {modelsSha256: evidence.baseline.modelsSha256, partsSha256: evidence.baseline.partsSha256, priceRecordsSha256: evidence.baseline.priceRecordsSha256, otherProductsSha256: evidence.baseline.otherProductsSha256, globalStats: evidence.baseline.globalStats}, result: evidence.result, models: models.map(m => ({id: 'vac-miele-model-' + canonical(m.modelCode).toLowerCase(), code: m.modelCode, formFactor: m.formFactor, sourceUrl: sources.get(m.primarySourceId).url + '#page=' + m.primaryPdfPage})), sourcePins};
  add('src/data/miele-models-wave2.js', '// Generated by integrations/import-miele-models-wave2.mjs; model-only, no inferred variant or fitment.\nexport const mieleWave2Models=' + JSON.stringify(models.map(m => productFor(m, sources))) + ';\nexport const mieleWave2Audit=' + JSON.stringify(audit) + ';\n');
  let modelModule = baselineText('src/data/miele-models.js');
  modelModule = replaceExact(modelModule, "import { mieleModelRecords } from './miele-model-records.js';", "import { mieleModelRecords } from './miele-model-records.js';\nimport { mieleWave2Models } from './miele-models-wave2.js';");
  modelModule = replaceExact(modelModule, 'export const mieleConcreteModels=mieleModelRecords.map(record=>extendMieleProduct(buildModel(record)));', 'export const mieleConcreteModels=[...mieleModelRecords.map(record=>extendMieleProduct(buildModel(record))),...mieleWave2Models];');
  add('src/data/miele-models.js', modelModule);
  let typeplate = baselineText('src/core/typeplate.js');
  typeplate = replaceExact(typeplate, 'const familyPattern=', "const mieleHistoricalCode=value=>String(value||'').trim().toUpperCase().match(/^S\\s*([1-9]\\d{2,3})$/)?.[1]||null;\nconst familyPattern=");
  typeplate = replaceExact(typeplate, "else if(kind==='model'){const families=", "else if(['type','model'].includes(kind)&&brands.length===1&&brands[0]==='MIELE'&&mieleHistoricalCode(content))add('model','S '+mieleHistoricalCode(content),index);\n   else if(kind==='model'){const families=");
  typeplate = replaceExact(typeplate, "if(!field){\n", "if(!field){\n   if(brands.length===1&&brands[0]==='MIELE'){const legacy=mieleHistoricalCode(line.replace(/^MIELE\\s+/i,''));if(legacy)add('model','S '+legacy,index);}\n");
  typeplate = replaceExact(typeplate, 'const additionalReference=suggestions.some', "const historicalMiele=suggestions.some(p=>p.brand==='Miele'&&p.identityStatus==='model_reference');\n if(historicalMiele)warnings.push('Historische Miele-Modellreferenz erkannt. Materialnummer, Gerätetyp und Ausführung am Typenschild sowie jedes Ersatzteil separat prüfen; Farbe, EcoLine/Special und Beipackzubehör bestätigen keine Teilepassung.');\n const additionalReference=suggestions.some");
  typeplate = replaceExact(typeplate, "boschReference?'model_reference':additionalReference?", "(boschReference||historicalMiele)?'model_reference':additionalReference?");
  add('src/core/typeplate.js', typeplate);
  let identifiers = baselineText('src/core/identifiers.js');
  identifiers = replaceExact(identifiers, '|S\\d{3,4}', '');
  identifiers = replaceExact(identifiers, 'const familyMatches=[...genericFamilyMatches,...mieleFamilyMatches,...vorwerkModels];', "const historicalMiele=brandMatch?.[1]==='MIELE'&&!/\\b(?:BOSCH|SIEMENS|DYSON|AEG|PHILIPS|ROWENTA|VORWERK|SAMSUNG|HOOVER)\\b/.test(text)?(Array.isArray(lines)?lines:String(lines).split(/\\r?\\n/)).flatMap(line=>{const m=String(line).trim().toUpperCase().match(/^(?:MIELE\\s+)?(?:(?:TYP|TYPE|MODELL|MODEL)\\s*[:.#-]?\\s*)?(S\\s*[1-9]\\d{2,3})$/);return m?['S '+m[1].replace(/\\D/g,'')]:[];}):[];\n  const familyMatches=[...genericFamilyMatches,...mieleFamilyMatches,...vorwerkModels,...historicalMiele];");
  add('src/core/identifiers.js', identifiers);
  let legacyModelsTest = baselineText('tests/miele-models.test.mjs');
  legacyModelsTest = replaceExact(legacyModelsTest, 'for(const product of models){', "for(const product of models.filter(p=>p.identityStatus!=='model_reference')){");
  add('tests/miele-models.test.mjs', legacyModelsTest);
  let partsTest = baselineText('tests/miele-parts.test.mjs');
  partsTest = replaceExact(partsTest, "if(product.recordType==='model'){", "if(product.recordType==='model'&&product.identityStatus!=='model_reference'){");
  add('tests/miele-parts.test.mjs', partsTest);
  let typeplateTest = baselineText('tests/typeplate.test.mjs');
  typeplateTest = replaceExact(typeplateTest, "p=>p.brand==='Miele'&&p.recordType==='model'", "p=>p.brand==='Miele'&&p.recordType==='model'&&p.identityStatus!=='model_reference'");
  add('tests/typeplate.test.mjs', typeplateTest);
  const count = models.length;
  let boschTest = baselineText('tests/bosch-catalog.test.mjs');
  boschTest = replaceExact(boschTest, "assert.equal(filterCatalog({brand:'Miele'}).length,62);", `assert.equal(filterCatalog({brand:'Miele'}).length,${62 + count});`);
  add('tests/bosch-catalog.test.mjs', boschTest);
  let philipsTest = baselineText('tests/philips-expansion.test.mjs');
  philipsTest = replaceExact(philipsTest, "['Miele',57,167]", `['Miele',${57 + count},167]`);
  add('tests/philips-expansion.test.mjs', philipsTest);
  for (const relative of ['tests/catalog-seven-brands.test.mjs', 'tests/vorwerk-expansion.test.mjs']) {
    let tests = baselineText(relative);
    for (const [expression, before] of [['catalogStats.modelCount', 943], ['catalogStats.recordCount', 954], ['progress.reduce((n,r)=>n+r.slots,0)', 730]]) {
      tests = replaceExact(tests, `assert.equal(${expression},${before});`, `assert.equal(${expression},${before + count});`);
    }
    add(relative, tests);
  }
  add('tests/miele-models-wave2.test.mjs', fs.readFileSync(path.join(projectRoot, 'integrations/miele-models-wave2.app-test.mjs')));
  let packageText = baselineText('package.json');
  packageText = replaceExact(packageText, 'node tests/model-parts-view.test.mjs"', 'node tests/model-parts-view.test.mjs && node tests/miele-models-wave2.test.mjs"');
  add('package.json', packageText);

  // Reject drift anywhere in the 131-file source checkpoint, including unrelated brands.
  // Each changed file must be wholly baseline or wholly this wave; never merge arbitrary text.
  for (const [relative, current] of Object.entries(raw)) {
    assert.ok(digest(current) === evidence.baseline.sourceFiles[relative] || changed.get(relative)?.equals(current), 'Source conflict (no files written): ' + relative);
  }
  for (const [relative, output] of changed) {
    if (!(relative in raw)) {
      const filename = safePath(root, relative, {allowMissing: true});
      const current = fs.existsSync(filename) ? fs.readFileSync(filename) : null;
      assert.ok(current === null || current.equals(output), 'New output conflict: ' + relative);
      raw[relative] = current;
    }
  }
  const states = [...changed].map(([relative, output]) => raw[relative]?.equals(output));
  assert.ok(states.every(Boolean) || states.every(v => !v), 'Partial wave import; restore a clean checkpoint instead of mixing rows');
  return {root, models, changed, raw, alreadyImported: states.every(Boolean)};
}

export function commitPlan(plan, {rename = fs.renameSync} = {}) {
  const lock = path.join(plan.root, '.miele-wave2-import.lock');
  const fd = fs.openSync(lock, 'wx');
  let stage;
  const mutations = [];
  try {
    fs.closeSync(fd);
    stage = fs.mkdtempSync(path.join(plan.root, '.miele-wave2-stage-'));
    const entries = [...plan.changed].map(([relative, output], i) => {
      const filename = safePath(plan.root, relative, {allowMissing: true});
      const staged = path.join(stage, 'new-' + i);
      fs.writeFileSync(staged, output, {flag: 'wx', mode: fs.existsSync(filename) ? fs.statSync(filename).mode & 0o777 : 0o644});
      return {relative, filename, staged, backup: path.join(stage, 'old-' + i), oldMoved: false, published: false};
    });
    // Check every guard again under the exclusive importer lock before the first source write.
    for (const [relative, expected] of Object.entries(plan.raw)) {
      const filename = safePath(plan.root, relative, {allowMissing: expected === null});
      const current = fs.existsSync(filename) ? fs.readFileSync(filename) : null;
      assert.ok(expected === null ? current === null : current?.equals(expected), 'Source changed during staging: ' + relative);
    }
    for (const entry of entries) {
      mutations.push(entry);
      if (fs.existsSync(entry.filename)) {rename(entry.filename, entry.backup); entry.oldMoved = true;}
      rename(entry.staged, entry.filename); entry.published = true;
    }
  } catch (error) {
    for (const entry of mutations.reverse()) {
      if (entry.published) fs.unlinkSync(entry.filename);
      if (entry.oldMoved) fs.renameSync(entry.backup, entry.filename);
    }
    throw error;
  } finally {
    if (stage) fs.rmSync(stage, {recursive: true, force: true});
    fs.unlinkSync(lock);
  }
}

export function importMieleModels({target, evidence, check = false, dryRun = false, transactionOptions} = {}) {
  const plan = createPlan({target, evidence});
  if (check) assert.ok(plan.alreadyImported, 'Wave not imported; --check does not write source files');
  if (!check && !dryRun && !plan.alreadyImported) commitPlan(plan, transactionOptions);
  return {addedModels: plan.alreadyImported || check || dryRun ? 0 : plan.models.length, plannedModels: plan.models.length, modelCount: evidence.result.finalModelCount, recordCount: evidence.result.finalRecordCount, physicalParts: 167, addedParts: 0, addedFitment: 0, check, dryRun, alreadyImported: plan.alreadyImported, changedFiles: [...plan.changed.keys()]};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    let target = path.join(projectRoot, 'site');
    let evidenceFile = path.join(projectRoot, 'integrations/miele-model-research-wave2.json');
    let check = false, dryRun = false;
    const args = process.argv.slice(2);
    while (args.length) {
      const arg = args.shift();
      if (arg === '--target' || arg === '--evidence') {
        assert.ok(args[0] && !args[0].startsWith('--'), 'Missing value for ' + arg);
        if (arg === '--target') target = path.resolve(args.shift());
        else evidenceFile = path.resolve(args.shift());
      } else if (arg === '--check') check = true;
      else if (arg === '--dry-run') dryRun = true;
      else throw Error('Unknown option: ' + arg);
    }
    assert.ok(!(check && dryRun), 'Choose --check or --dry-run');
    console.log(JSON.stringify(importMieleModels({target, evidence: JSON.parse(fs.readFileSync(evidenceFile, 'utf8')), check, dryRun})));
  } catch (error) {console.error(error.message); process.exitCode = 1;}
}
