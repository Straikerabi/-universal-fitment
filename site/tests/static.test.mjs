import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(new URL('..',import.meta.url).pathname);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');

assert.match(html,/lang="de"/);
assert.match(html,/apple-touch-icon/);
assert.equal(manifest.display,'standalone');
assert.ok(manifest.icons.some(i=>i.sizes==='192x192'));
assert.ok(manifest.icons.some(i=>i.sizes==='512x512'));
const app=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
assert.match(app,/Job-Vollständigkeit/);
assert.match(app,/Smart Stock/);
assert.match(app,/Notification\.requestPermission/);
assert.match(app,/Live-Abgleich/);
assert.match(app,/external-product/);
assert.match(app,/brand==='Hoover'\?'Hoover-Produktcode'/);
const scanner=fs.readFileSync(path.join(root,'src/core/scanner.js'),'utf8');
assert.match(scanner,/tesseract\.js/);
assert.match(scanner,/Typenschild wird gelesen/);

for(const rel of ['./index.html','./styles.css','./manifest.webmanifest','./src/app.js','./src/core/matcher.js','./src/core/identifiers.js','./src/data/demo-products.js','./src/data/product-resolver.js','./src/data/coffee-support.js','./src/data/verified-products.js','./src/data/catalog.js','./src/data/miele-vacuum.js']){
  if(!rel.includes('/src/')&&rel!=='./styles.css')assert.ok(sw.includes(`'${rel}'`),`service worker must cache ${rel}`);
  assert.ok(fs.existsSync(path.join(root,rel.replace(/^\.\//,''))),`missing ${rel}`);
}
assert.ok(sw.includes("'./app-v1.26.8.js'"));
assert.match(html,/src="\.\/app-v1\.26\.8\.js"/);
assert.ok(fs.existsSync(path.join(root,'app-v1.26.8.js')));
console.log('All static/PWA checks passed.');
