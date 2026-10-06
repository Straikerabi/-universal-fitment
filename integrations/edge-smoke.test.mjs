import assert from 'node:assert/strict';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const output=resolve(process.argv[2]||'build-marketplace-edge');
const file=`${output}/index-smoke.mjs`;
let handler;
globalThis.Deno={env:{toObject:()=>({})},serve:fn=>{handler=fn;}};
try{
  // The entrypoint has no TS-only syntax; run identical bytes under Node for import/boot checks.
  await writeFile(file,await readFile(`${output}/index.ts`));
  await import(pathToFileURL(file).href);
  assert.equal(typeof handler,'function');
  const health=await handler(new Request('https://example.invalid/functions/v1/marketplace-search/health'));
  assert.equal(health.status,200);assert.equal((await health.json()).partCount,167);
  const blocked=await handler(new Request('https://example.invalid/functions/v1/marketplace-search',{method:'POST'}));
  assert.equal(blocked.status,401);assert.deepEqual(await blocked.json(),{status:'auth_required'});
}finally{delete globalThis.Deno;await unlink(file);}
console.log('Generated Edge entrypoint boots, loads the full catalog index and rejects unauthenticated searches.');
