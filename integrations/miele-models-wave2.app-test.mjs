// Copied into site/tests by the importer. Run there as part of the full app suite.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {products, mielePartsCatalog, catalogStats, catalogCoverage, filterCatalog} from '../src/data/catalog.js';
import {mieleConcreteModels, mieleCatalogStats, filterMieleCatalog} from '../src/data/miele-models.js';
import {mieleWave2Models, mieleWave2Audit as audit} from '../src/data/miele-models-wave2.js';
import {mielePriceRecords} from '../src/data/miele-commerce-records.js';
import {reviewTypePlate, reviewScannedCode} from '../src/core/typeplate.js';
import {extractTypePlateIdentity} from '../src/core/identifiers.js';
import {matchProducts} from '../src/core/matcher.js';
import {resolveProductQuery} from '../src/data/product-resolver.js';
import {catalogTargetProgress, deviceBudgetBand} from '../src/data/catalog-plan.js';
import {quoteForPart, cartQuoteItem} from '../src/data/miele-commerce.js';
import {compareDevices} from '../src/core/device-comparison.js';
import {createBackup, reviewBackup} from '../src/core/backup.js';

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const newIds = new Set(mieleWave2Models.map(m => m.id));
assert.equal(hash(mieleConcreteModels.filter(m => !newIds.has(m.id))), audit.baseline.modelsSha256, 'all 62 old Miele variants and their jobs/parts/states unchanged');
assert.equal(hash(mielePartsCatalog), audit.baseline.partsSha256, '167 original/supplier articles, prices and fitment relationships unchanged');
assert.equal(hash(mielePriceRecords), audit.baseline.priceRecordsSha256, 'price/stock snapshots unchanged');
assert.equal(hash(products.filter(p => p.brand !== 'Miele')), audit.baseline.otherProductsSha256, 'other brands unchanged');
assert.equal(mieleWave2Models.length, audit.result.addedModelCount);
assert.equal(newIds.size, mieleWave2Models.length);
assert.equal(new Set(mieleWave2Models.map(m => m.model)).size, mieleWave2Models.length);
assert.equal(mieleCatalogStats.modelCount, audit.result.finalModelCount);
assert.equal(mieleCatalogStats.variantCount, audit.result.finalRecordCount);
assert.equal(mieleCatalogStats.familyCount, 9);
const coverage = catalogCoverage().find(r => r.brand === 'Miele');
assert.equal(coverage.models, audit.result.finalModelCount);
assert.equal(coverage.records, audit.result.finalRecordCount);
assert.equal(coverage.recordsWithParts, 62);
assert.equal(coverage.recordsWithoutParts, audit.result.addedModelCount);
assert.equal(coverage.physicalParts, 167);
assert.equal(coverage.parts, 167);
assert.equal(catalogStats.modelCount, 943 + audit.result.addedModelCount);
assert.equal(catalogStats.recordCount, 954 + audit.result.addedModelCount);
assert.equal(catalogTargetProgress(catalogCoverage()).reduce((n, r) => n + r.slots, 0), 730 + audit.result.addedModelCount);
assert.deepEqual(new Set(filterCatalog({brand: 'Miele', partCoverage: 'missing'}).map(p => p.id)), newIds);
for (const model of mieleWave2Models) {
  const number = model.model.replace(/\D/g, '');
  assert.equal(products.find(p => p.id === model.id), model, 'eager index and detail use the same record');
  assert.equal(mieleConcreteModels.find(p => p.id === model.id), model);
  assert.equal(model.category, 'vacuum');
  assert.equal(model.dataStatus, 'manufacturer-verified');
  assert.equal(model.identityStatus, 'model_reference');
  assert.equal(model.variantStatus, 'execution_open');
  assert.equal(model.vacuumMeta.materialNumber, null);
  assert.equal(model.vacuumMeta.color, null);
  assert.equal(model.vacuumMeta.currentListing, false);
  assert.equal(model.imageUrl, null, 'do not reuse a current model photo');
  assert.deepEqual(model.identifiers, [{type: 'manufacturer-model', value: model.model}]);
  for (const key of ['parts', 'candidateParts', 'equipment', 'stockPlans', 'jobs', 'issues', 'accessoryAliases']) assert.deepEqual(model[key], [], key);
  assert.equal(model.vacuumMeta.bagSystem, 'unknown', 'no bag-family inference');
  assert.equal(model.partListCoverage.status, 'missing');
  assert.ok(model.manuals.some(d => /historischer Katalog/.test(d.label)));
  assert.ok(!model.manuals.some(d => d.label === 'Gebrauchsanweisung'), 'catalog is not mislabelled as an exact manual');
  assert.ok(model.sources.every(s => s.type === 'manufacturer' && s.grade === 'A' && new URL(s.url).hostname === 'www1.miele.de'));
  assert.equal(model.sources[0].url, audit.models.find(r => r.id === model.id).sourceUrl);
  assert.equal(deviceBudgetBand(model), 'unknown');
  assert.ok(!model.deviceQuote);
  assert.ok(!mielePartsCatalog.some(p => p.modelIds.includes(model.id) || p.candidateModelIds.includes(model.id)));
  assert.equal(matchProducts(products, model.model)[0].product.id, model.id);
  assert.equal(matchProducts(products, 'S' + number)[0].product.id, model.id);
  const local = await resolveProductQuery(products, model.model, {fetchFn: async () => {throw Error('historical known code must resolve offline');}});
  assert.equal(local.usedExternal, false);
  for (const input of [`Miele\nS ${number}`, `Miele S${number}`, `Miele\nModell: S${number}`, `Miele\nTyp: S ${number}`]) {
    const review = reviewTypePlate(input);
    assert.equal(review.status, 'model_reference', input);
    assert.deepEqual(review.suggestions.map(p => p.id), [model.id]);
    assert.match(review.warnings.join(' '), /Materialnummer.*Ausführung/);
  }
  for (const label of ['Seriennummer', 'Fabrikationsnummer', 'FD']) {
    assert.equal(reviewTypePlate(`Miele\n${label}: S${number}`).suggestions.length, 0);
    assert.ok(!extractTypePlateIdentity(['Miele', `${label}: S${number}`]).candidates.includes(model.model));
  }
  for (const input of [`Miele\nS${number}/99`, `Miele\nS${number}999`, `Miele\nModell: S${number}/DE`, `Miele\nModell: S${number}999`, `Bosch\nModell: S${number}`, `Miele Bosch\nS${number}`]) {
    assert.equal(reviewTypePlate(input).suggestions.length, 0, input);
  }
  const extracted = extractTypePlateIdentity(['Miele', 'S ' + number]);
  assert.ok(extracted.candidates.includes(model.model));
  assert.equal(matchProducts(products, extracted.primary)[0].product.id, model.id);
}
for (const code of ['S 194', 'S 5211', 'S 6240', 'S 6760', 'S 8310', 'S 8730']) assert.equal(mieleWave2Models.filter(p => p.model === code).length, 1, 'color/equipment variants count once');
for (const code of ['S 5981', 'Premium 5000', 'Premium 8000', 'S8 UniQ', 'Miele Hybrid', 'S4 EcoLine', 'S8 Cat & Dog']) assert.ok(!mieleWave2Models.some(p => p.model === code));
const first = mieleWave2Models[0];
assert.equal(reviewTypePlate('Miele\nModell: S 9999').status, 'unresolved');
assert.equal(reviewTypePlate(`Miele\nModell: ${first.model}\nMaterial-Nr.: 12560300`).status, 'conflict');
assert.equal(reviewTypePlate(`Miele\nModell: ${first.model}\nEAN: 4002516925668`).status, 'conflict');
assert.equal(reviewTypePlate(`Miele\nModell: ${first.model}\nModell: S 8310`).status, 'conflict');
const unknown = reviewTypePlate(`Miele\nModell: ${first.model}\nMaterial-Nr.: 99999999`);
assert.ok(unknown.status !== 'exact_device', 'unknown material must never certify an exact variant');
const known = reviewTypePlate('Miele\nMaterial-Nr.: 12560300\nTyp: SVZF0');
assert.equal(known.status, 'exact_device');
assert.equal(known.suggestions[0].id, 'vac-miele-model-12560300');
const bag = reviewScannedCode('12421170');
assert.equal(bag.status, 'part_only');
assert.equal(bag.suggestions.length, 0);
for (const part of mielePartsCatalog) assert.equal(cartQuoteItem(part, first), null);
assert.equal(quoteForPart({id: 'unverified-miele-test', identifiers: []}), null);
assert.ok(!extractTypePlateIdentity(['Miele', 'Bosch', 'S 8310']).candidates.includes('S 8310'));
const comparison = compareDevices([first.id, 'vac-miele-model-12560300']);
assert.equal(comparison.rows.find(r => r.label === 'Geräte-Materialnummer').values[0], 'Nicht belegt');
const backup = reviewBackup(JSON.stringify(createBackup({saved: [first.id, 'vac-miele-model-12560300']}, [], {})));
assert.deepEqual(backup.data.saved, [first.id, 'vac-miele-model-12560300']);
assert.equal(filterMieleCatalog({series: first.vacuumMeta.series}).some(p => p.id === first.id), true);
console.log(`Miele wave2 passed: ${mieleWave2Models.length} historical code profiles, ${mieleCatalogStats.modelCount} model names / ${mieleCatalogStats.variantCount} rows; 167 unchanged articles; no invented EAN, variant, parts, quote or photo; index/detail, OCR, typeplate, backup and offline boundaries.`);
