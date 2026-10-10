import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {PLAYWRIGHT_VERSION} from './policy.mjs';
export async function loadPlaywright(){
 const require=createRequire(import.meta.url);
 const modulePath=process.env.UF_PLAYWRIGHT_MODULE||require.resolve('playwright');
 const pkg=JSON.parse(await readFile(path.join(path.dirname(modulePath),'package.json'),'utf8'));
 assert.equal(pkg.version,PLAYWRIGHT_VERSION,'Pinned Playwright required');
 const loaded=await import(pathToFileURL(modulePath).href);
 const playwright=loaded.chromium?loaded:loaded.default;
 assert.ok(playwright?.chromium&&playwright?.webkit,'Both engine APIs are required');
 return {playwright,version:pkg.version};
}
