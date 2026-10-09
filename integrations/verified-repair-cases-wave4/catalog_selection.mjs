// Read-only checkpoint comparison. Imports baseline catalog data, never an engine.
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const root = process.argv[2];
if (!root) throw Error('Usage: node catalog_selection.mjs /absolute/restored-checkpoint');
const dataset = JSON.parse(readFileSync(new URL('./cases.json', import.meta.url)));
const {products} = await import(pathToFileURL(resolve(root, 'src/data/catalog.js')));
const result = dataset.cases.map(c => {
  const matches = products.filter(p => p.id === c.catalogId && p.brand === c.brand && p.recordType === 'model');
  if (matches.length !== 1) throw Error(`Missing/duplicate real catalog profile: ${c.catalogId}`);
  return {case: c.id, catalogId: matches[0].id, model: matches[0].model};
});
console.log(JSON.stringify({baseline: dataset.baselineCommit, matchedModels: result.length, selection: result}, null, 2));
