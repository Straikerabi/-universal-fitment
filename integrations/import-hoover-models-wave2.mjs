import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readJSON = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const compact = value => String(value).toUpperCase().replace(/[\s_./-]/g, '');
const official = value => {
  const url = new URL(value);
  assert.equal(url.protocol, 'https:', 'Only HTTPS manufacturer sources');
  assert.ok(!url.username && !url.password && !url.port, 'Unqualified source authority');
  assert.ok(['service.hoover.co.uk', 'www.hoover-home.com'].includes(url.hostname), 'Non-manufacturer model source');
  return url;
};

export function validateResearch(research, evidence) {
  assert.equal(research.schemaVersion, 1);
  assert.equal(research.brand, 'Hoover');
  assert.equal(research.baseCommit, 'd254df54d7bb4d72febdf9f2587efec9a66be336');
  assert.equal(research.appVersion, '1.28.0');
  assert.equal(research.checkedAt, '2026-10-08');
  assert.ok(Array.isArray(research.candidates) && research.candidates.length > 76);
  const sources = new Map(evidence.modelPages.map(item => [item.url, item]));
  assert.equal(sources.size, evidence.modelPages.length, 'Duplicate source page');
  const accepted = research.candidates.filter(item => item.decision === 'accepted');
  assert.equal(accepted.length, research.summary.accepted);
  assert.ok(accepted.length > 0 && accepted.length <= 76, 'The wave has at most 76 new base devices');
  const codes = new Set(), names = new Set(), productCodes = new Set(), bases = new Set(), manuals = new Set();
  for (const item of research.candidates) {
    assert.ok(['accepted', 'rejected', 'deferred'].includes(item.decision));
    assert.ok(item.reason && typeof item.countsAsNewBase === 'boolean');
    assert.equal(item.countsAsNewBase, item.decision === 'accepted');
    official(item.url);
    if (item.decision !== 'accepted') continue;
    assert.equal(item.brand, 'Hoover');
    assert.equal(item.deviceCategory, 'domestic-dry-vacuum');
    assert.ok(['floor', 'cordless'].includes(item.deviceType));
    assert.ok(['DE', 'GB', 'FR'].includes(item.sourceMarket));
    assert.match(item.productCode, /^(?:390|391|394)\d{5}$/);
    assert.match(item.model, /^[A-Z][A-Z0-9_ /-]{2,25}$/);
    assert.equal(item.code, item.model.replace(/\s+/g, ''));
    assert.equal(item.fitmentRelationshipsAdded, 0);
    assert.equal(item.partsAdded, 0);
    assert.equal(item.technicalRevision, null, 'No guessed service revision');
    for (const field of ['price', 'stock', 'ean', 'parts', 'relationships', 'deviceQuote']) {
      assert.ok(!Object.hasOwn(item, field), `Model-only intake forbids ${field}`);
    }
    const source = sources.get(item.url);
    assert.ok(source && source.verified, 'No captured primary verification: ' + item.model);
    assert.equal(source.observedModel, item.model);
    assert.equal(source.observedProductCode, item.productCode);
    assert.equal(source.sourceMarket, item.sourceMarket);
    assert.equal(source.checkedAt, research.checkedAt);
    assert.equal(source.deviceCategory, item.deviceCategory);
    assert.ok(source.verificationMethod && /hoover/i.test(source.pageTitle));
    assert.equal(source.deviceType, item.deviceType);
    assert.equal(source.series ?? item.series, item.series);
    if (item.countrySuffix) assert.ok(item.model.endsWith(' ' + item.countrySuffix), 'Unobserved country suffix');
    assert.ok(source.manualUrl === (item.manualUrl || null));
    assert.ok(item.baseModelKey && item.baseDecision, 'Missing independent-base review');
    for (const [set, value, label] of [[codes, compact(item.code), 'code'], [names, compact(item.model), 'model'],
      [productCodes, item.productCode, 'product code'], [bases, item.baseModelKey, 'base decision']]) {
      assert.ok(!set.has(value), `Duplicate ${label}: ${value}`); set.add(value);
    }
    if (item.manualUrl) {
      const url = official(item.manualUrl);
      assert.equal(url.hostname, 'service.hoover.co.uk');
      assert.ok(url.pathname.startsWith('/media/') && url.pathname.endsWith('.pdf'));
      const manual = evidence.manuals.find(row => row.url === item.manualUrl);
      assert.ok(manual?.pdf && manual.status === 200 && /^[a-f0-9]{64}$/.test(manual.sha256));
      assert.ok(!manuals.has(manual.sha256), 'Shared manual without independent platform evidence');
      manuals.add(manual.sha256);
    }
  }
  for (const decision of ['rejected', 'deferred']) {
    assert.equal(research.summary[decision], research.candidates.filter(item => item.decision === decision).length);
  }
  return accepted;
}

function safeTarget(target) {
  assert.ok(target, 'Provide --target with a locally restored source directory');
  const absolute = path.resolve(target);
  // Check every ancestor, not only the leaf: a src or data symlink could escape.
  let cursor = path.parse(absolute).root;
  for (const segment of absolute.slice(cursor.length).split(path.sep)) {
    cursor = path.join(cursor, segment);
    assert.ok(!fs.lstatSync(cursor).isSymbolicLink(), 'Target ancestor is a symlink: ' + cursor);
  }
  assert.ok(fs.statSync(absolute).isDirectory());
  return absolute;
}

function safeRead(target, relative) {
  assert.ok(!path.isAbsolute(relative) && !relative.split('/').includes('..'));
  const file = path.join(target, relative);
  let cursor = target;
  for (const segment of relative.split('/')) {
    cursor = path.join(cursor, segment);
    assert.ok(!fs.lstatSync(cursor).isSymbolicLink(), 'Source path is a symlink: ' + relative);
  }
  assert.ok(fs.statSync(file).isFile(), 'Expected a regular source file: ' + relative);
  return fs.readFileSync(file);
}

function replaceOnce(text, before, after) {
  assert.equal(text.split(before).length, 2, 'Expected exactly one known patch anchor: ' + before);
  return text.replace(before, after);
}

function parseExports(text, tags) {
  let cursor = 0;
  return tags.map((tag, index) => {
    const start = text.indexOf(tag, cursor);
    assert.ok(start >= cursor && start === text.lastIndexOf(tag), 'Invalid JSON export: ' + tag);
    const end = index === tags.length - 1 ? text.length : text.indexOf(tags[index + 1], start + tag.length);
    assert.ok(end > start);
    cursor = end;
    return JSON.parse(text.slice(start + tag.length, end).trim().replace(/;\s*$/, ''));
  });
}

async function buildPackSize(contents) {
  const require = createRequire(new URL('./auth-sdk/package.json', import.meta.url));
  const esbuild = process.env.UF_ESBUILD_MODULE ? await import(pathToFileURL(path.resolve(process.env.UF_ESBUILD_MODULE))) : require('esbuild');
  assert.equal(esbuild.version, '0.25.12', 'Use the pinned project esbuild version');
  const result = await esbuild.build({stdin:{contents, sourcefile:'hoover-pack.js', loader:'js'},
    bundle:true, format:'esm', platform:'browser', target:'es2022', minify:true, legalComments:'inline', write:false});
  return result.outputFiles[0].contents.length;
}

function makeRecord(item, checkedAt) {
  const market = {DE:'Deutschland', GB:'Großbritannien', FR:'Frankreich'}[item.sourceMarket];
  const partsUrl = item.sourceMarket === 'GB' ? item.url : 'https://www.hoover-home.com/de_DE/zubehor-und-ersatzteile/';
  return {
    brand:'Hoover', code:item.code, model:item.model, series:item.series, deviceType:item.deviceType,
    type:`${item.deviceType === 'cordless' ? 'Akku-Staubsauger' : 'Staubsauger'} ${item.series} · ${market}`,
    url:item.url, guideUrl:item.url, partsUrl, productCode:item.productCode,
    deviceReferences:[item.model], aliases:[item.productCode], checkedAt,
    sourceMarket:item.sourceMarket, baseModelKey:item.baseModelKey,
    sourceNote:`Hoover nennt dieses vollständige Gerät als ${item.model} mit Produktcode ${item.productCode}. Quellenmarkt: ${market}. Keine Übertragung auf andere Länder-, Farb-, Ausstattungs- oder Revisionsausführungen; kein deutsches Angebot und keine Ersatzteilfreigabe daraus abgeleitet.`,
    variantNote:`Exakte Modellkennung ${item.model} und achtstelligen Produktcode ${item.productCode} am Typenschild vergleichen. Quelle: ${market}. ${item.countrySuffix ? 'Belegte Ausführungskennung: ' + item.countrySuffix + '. ' : 'Keine zusätzliche Länderkennung oder Revision erfunden. '}Andere Ausführungen und alle Ersatzteile bleiben separat zu prüfen.`,
    facts:[{label:'Hoover Produktcode', value:item.productCode}, {label:'Quellenmarkt', value:market}],
    ...(item.manualUrl ? {manuals:[{label:'Gebrauchsanweisung', url:item.manualUrl}]} : {}),
    partCount:0, physicalPartCount:0,
    partListCoverage:{status:'not_catalogued', sourceUrl:partsUrl,
      note:'Grundgerät und Produktcode sind offiziell belegt. Noch keine gerätespezifisch geprüfte Teileliste übernommen; 0 neue Artikelbeziehungen. Serienähnlichkeit und generische Zubehörhinweise liefern keine Passungszusage.'}
  };
}

export async function planHooverImport(target, {research, evidence, checkpoint} = {}) {
  target = safeTarget(target);
  research ??= readJSON(path.join(root, 'integrations/hoover-model-research-wave2.json'));
  evidence ??= readJSON(path.join(root, 'integrations/hoover-source-evidence-wave2.json'));
  checkpoint ??= readJSON(path.join(root, 'integrations/hoover-checkpoint-lock-wave2.json'));
  assert.equal(sha(JSON.stringify(research)), 'a45e8d7dcb58530b2502d53630564c598e10da6368998bc319ee05a6307e6404', 'Research snapshot conflict');
  assert.equal(sha(JSON.stringify(evidence)), '91994d27a2f853c1dc25805724d11741c714a9909b82ebaa52482fd56004ea81', 'Primary evidence snapshot conflict');
  assert.equal(sha(JSON.stringify(checkpoint)), 'd29d4c9a08b00df0feddb12b10374162b2d46f3d11e769e24918d4f28a74d44a', 'Corrupt baseline lock snapshot');
  const accepted = validateResearch(research, evidence);
  assert.equal(checkpoint.version, '1.28.0');
  assert.equal(checkpoint.archiveSha256, '5cb8e5b9c155b8493ded22211778cbf224c538f73214cb41590dc95f6f41d0a3');
  const baseline = new Map(), current = new Map();
  for (const [relative, entry] of Object.entries(checkpoint.files)) {
    const bytes = safeRead(target, relative);
    current.set(relative, bytes);
    if (entry.baseline !== undefined) {
      assert.equal(sha(entry.baseline), entry.sha256, 'Corrupt baseline lock: ' + relative);
      baseline.set(relative, Buffer.from(entry.baseline));
    } else {
      assert.equal(sha(bytes), entry.sha256, 'Checkpoint/source conflict: ' + relative);
    }
  }
  const pkg = JSON.parse(current.get('package.json'));
  assert.equal(pkg.version, '1.28.0'); assert.equal(pkg.private, true); assert.equal(pkg.type, 'module');
  const packPath = 'src/data/hoover-pack.js', indexPath = 'src/data/new-brands-index.js';
  const [pack] = parseExports(baseline.get(packPath).toString(), ['export const brandPack=']);
  const [index, manifest] = parseExports(baseline.get(indexPath).toString(), ['export const newBrandsIndex=', 'export const newBrandsManifest=']);
  assert.equal(pack.brand, 'Hoover'); assert.equal(pack.models.length, 24); assert.equal(pack.parts.length, 55);
  assert.equal(manifest.Hoover.recordCount, 24); assert.equal(manifest.Hoover.partCount, 60);
  const existing = index.filter(row => row.brand === 'Hoover');
  assert.equal(existing.length, 24);
  assert.deepEqual(pack.models.map(row => [row.code, row.model, row.productCode]), existing.map(row => [row.code, row.model, row.productCode]));
  const identities = new Set(pack.models.flatMap(row => [row.code, row.model, ...(row.aliases || []), ...(row.deviceReferences || [])]).map(compact));
  const originalModels = JSON.stringify(pack.models), originalParts = JSON.stringify(pack.parts);
  const additions = accepted.map(item => {
    for (const identity of [item.code, item.model, item.productCode]) {
      assert.ok(!identities.has(compact(identity)), 'Existing model/alias/product-code collision: ' + identity);
    }
    for (const identity of [item.code, item.model, item.productCode]) identities.add(compact(identity));
    return makeRecord(item, research.checkedAt);
  });
  pack.models.push(...additions);
  assert.equal(JSON.stringify(pack.models.slice(0, 24)), originalModels);
  assert.equal(JSON.stringify(pack.parts), originalParts, 'Model import cannot touch parts or relationships');
  const insertAt = index.map(row => row.brand).lastIndexOf('Hoover') + 1;
  index.splice(insertAt, 0, ...additions.map(({partListCoverage, ...summary}) => summary));
  const count = pack.models.length, missing = count - 2;
  const packText = '// Hoover manufacturer/service-verified base-device intake, wave 2, 2026-10-08.\nexport const brandPack=' + JSON.stringify(pack) + ';\n';
  Object.assign(manifest.Hoover, {modelCount:count, recordCount:count,
    manualCount:additions.filter(row => row.manuals).length, packBytes:await buildPackSize(packText),
    note:`${count} konkret belegte Hoover-Grundgeräte-Referenzen mit exakten Produktcodes; 60 physische Artikel unverändert. HF202P 011 und HF201H 011 behalten 10 bzw. 12 Artikelbeziehungen. ${missing} Modelle ohne Teileliste. Die neuen Geräte bleiben ohne Teilepassung. Quellenmärkte DE, GB und FR sind am Gerät sichtbar; keine britischen oder französischen Preise, Verfügbarkeiten oder Ausführungen als deutsches Angebot übernommen.`});
  const outputs = new Map([[packPath, Buffer.from(packText)], [indexPath, Buffer.from('// Verified Samsung and Hoover model index; Hoover wave 2.\nexport const newBrandsIndex=' + JSON.stringify(index) + ';\nexport const newBrandsManifest=' + JSON.stringify(manifest) + ';\n')]]);
  for (const relative of ['tests/catalog-seven-brands.test.mjs', 'tests/vorwerk-expansion.test.mjs']) {
    let testSource = replaceOnce(baseline.get(relative).toString(),
      'assert.equal(catalogStats.modelCount,943);assert.equal(catalogStats.recordCount,954);',
      `assert.equal(catalogStats.modelCount,${943 + additions.length});assert.equal(catalogStats.recordCount,${954 + additions.length});`);
    testSource = replaceOnce(testSource, 'assert.equal(progress.reduce((n,r)=>n+r.slots,0),730);',
      `assert.equal(progress.reduce((n,r)=>n+r.slots,0),${730 + additions.length});`);
    outputs.set(relative, Buffer.from(testSource));
  }
  outputs.set('tests/catalog-v126.test.mjs', Buffer.from(replaceOnce(baseline.get('tests/catalog-v126.test.mjs').toString(),
    "assert.equal(catalogCoverage().find(r=>r.brand==='Hoover').recordsWithoutParts,22);",
    `assert.equal(catalogCoverage().find(r=>r.brand==='Hoover').recordsWithoutParts,${missing});`)));
  // The shared parser is changed only in the local import plan. Keep Hoover's
  // unknown, foreign or unlisted execution fields from silently falling back to
  // another recognised field. Do not broaden OCR patterns for historic codes.
  outputs.set('src/core/typeplate.js', Buffer.from(replaceOnce(baseline.get('src/core/typeplate.js').toString(),
    "const conflict=initial.length>0&&matching.length===0||strong.length>0&&(unknownStrong.length>0||partField)||new Set(indexes).size>1;",
    "const hooverMismatch=selectedBrand==='HOOVER'&&initial.length>0&&entries.some(e=>e.kind==='model'&&!e.matches.length||e.kind==='reference'&&/^\\d{8}$/.test(e.value.replace(/[\\s.-]/g,''))&&!e.matches.length);\n const conflict=hooverMismatch||initial.length>0&&matching.length===0||strong.length>0&&(unknownStrong.length>0||partField)||new Set(indexes).size>1;")));
  const states = [...outputs].map(([relative, bytes]) => {
    const input = current.get(relative);
    assert.ok(input, 'Output path not locked: ' + relative);
    if (input.equals(bytes)) return 'applied';
    assert.ok(input.equals(baseline.get(relative)), 'Source conflict before mutation: ' + relative);
    return 'baseline';
  });
  assert.ok(new Set(states).size === 1, 'Partial import/conflict: restore a fresh checkpoint');
  const state = states[0];
  return {target, outputs, current, state, summary:{state, newModels:additions.length, hooverModels:count,
    physicalArticles:60, existingFitmentRelationships:22, addedFitmentRelationships:0,
    modelsWithoutParts:missing, manualCount:manifest.Hoover.manualCount,
    catalogModels:943 + additions.length, catalogRecords:954 + additions.length,
    generatedSourceFiles:[...outputs.keys()]}};
}

export async function runHooverImport(target, {check = false, research, evidence, checkpoint, beforeCommit, rename = fs.renameSync} = {}) {
  const plan = await planHooverImport(target, {research, evidence, checkpoint});
  const lock = path.join(plan.target, '.hoover-wave2-import-lock');
  assert.ok(!fs.existsSync(lock), 'Another import or interrupted transaction holds the lock');
  if (check || plan.state === 'applied') return {...plan.summary, check, writtenFiles:[]};
  const branch = execFileSync('git', ['-C', root, 'branch', '--show-current'], {encoding:'utf8'}).trim();
  assert.ok(branch && branch !== 'main' && branch !== 'master', 'Apply on a local work/integration branch, never main');
  const gitTarget = execFileSync('git', ['-C', plan.target, 'rev-parse', '--show-toplevel'], {encoding:'utf8', stdio:['ignore','pipe','ignore']}).trim();
  const targetBranch = execFileSync('git', ['-C', gitTarget, 'branch', '--show-current'], {encoding:'utf8'}).trim();
  assert.ok(targetBranch && targetBranch !== 'main' && targetBranch !== 'master', 'Target belongs to main/master');
  fs.mkdirSync(lock, {mode:0o700});
  const written = [];
  let removeLock = true;
  try {
    for (const [relative, bytes] of plan.outputs) {
      const staged = path.join(lock, relative); fs.mkdirSync(path.dirname(staged), {recursive:true});
      fs.writeFileSync(staged, bytes, {flag:'wx', mode:fs.statSync(path.join(plan.target, relative)).mode & 0o777});
      assert.equal(sha(fs.readFileSync(staged)), sha(bytes));
    }
    if (beforeCommit) await beforeCommit(plan);
    for (const [relative, bytes] of plan.current) {
      assert.ok(safeRead(plan.target, relative).equals(bytes), 'Source changed during preflight: ' + relative);
    }
    for (const [relative] of plan.outputs) {
      rename(path.join(lock, relative), path.join(plan.target, relative)); written.push(relative);
    }
  } catch (error) {
    // Roll back earlier renames on ordinary I/O failures. Keep a recovery lock
    // if rollback itself fails; don't conceal an interrupted or damaged import.
    try {
      for (const relative of written.reverse()) {
        const recovery = path.join(lock, 'rollback-' + written.indexOf(relative));
        fs.writeFileSync(recovery, plan.current.get(relative));
        fs.renameSync(recovery, path.join(plan.target, relative));
      }
    } catch (rollbackError) {
      removeLock = false;
      throw new AggregateError([error, rollbackError], 'Import/rollback failed; preserve the lock and restore a fresh checkpoint');
    }
    throw error;
  } finally {
    if (removeLock) fs.rmSync(lock, {recursive:true});
  }
  return {...plan.summary, state:'applied', check:false, writtenFiles:[...plan.outputs.keys()]};
}

async function cli() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: node integrations/import-hoover-models-wave2.mjs --target site [--check]\n--check validates a baseline/applied tree and reports pending files without mutation.\nRequires the checked v1.28.0 source and pinned esbuild 0.25.12. Apply only on a local work/integration branch.'); return;
  }
  let target, check = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--check') { assert.ok(!check, 'Repeated --check'); check = true; }
    else if (args[i] === '--target') { assert.ok(!target && args[i + 1] && !args[i + 1].startsWith('--'), 'Provide exactly one --target'); target = args[++i]; }
    else throw Error('Unknown argument: ' + args[i]);
  }
  console.log(JSON.stringify(await runHooverImport(target, {check}), null, 2));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  cli().catch(error => {console.error('Hoover wave 2: ' + error.message); process.exitCode = 1;});
}
