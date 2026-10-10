// Wave9 internal marketing: read-only, no network, no publication, no external deps.
// Verify every manifest asset maps to precisely one authored Markdown section.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateManifest } from './validate.mjs';

const dir = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(dir, 'campaign-manifest.json'), 'utf8'));
const errors = validateManifest(manifest);
const declaredDocs = new Set(['B2C-STARTPAKET.md', 'B2B-STARTPAKET.md', 'LANDING-PRESS.md']);
const registered = new Map();
const discovered = new Map();
for (const doc of declaredDocs) {
  const body = readFileSync(join(dir, doc), 'utf8');
  const headings = [...body.matchAll(/^## ((?:B2C|B2B|WEB|PRESS)-\d{2})\s*\|/gm)].map(m => m[1]);
  discovered.set(doc, headings);
  for (const [id, count] of headings.reduce((acc, id) => acc.set(id,(acc.get(id) ?? 0)+1),new Map())) {
    if (count !== 1) errors.push('duplicate-section: '+doc+'/'+id);
  }
}
for (const asset of manifest.assets) {
  if (!declaredDocs.has(asset.doc)) {errors.push('invalid-doc: '+asset.id);continue;}
  const key = asset.doc+'#'+asset.id;
  registered.set(key, (registered.get(key) ?? 0) + 1);
  if (discovered.get(asset.doc).filter(id => id === asset.id).length !== 1) errors.push('missing-section: '+key);
}
for (const [key, count] of registered) if (count !== 1) errors.push('duplicate-manifest-asset: '+key);
for (const [doc, ids] of discovered) {
  for (const id of ids) if (!registered.has(doc+'#'+id)) errors.push('orphan-section: '+doc+'#'+id);
}
const summary = {manifestAssets:manifest.assets.length,
  referencedAssets:registered.size,
  markdownSections:[...discovered.values()].reduce((n, a)=>n+a.length,0),
  documents:discovered.size,
  releaseState:manifest.releaseState,
  externalPublicationAuthorized:manifest.externalPublicationAuthorized,
  errors};
console.log(JSON.stringify(summary,null,2));
if (errors.length) process.exitCode = 1;
