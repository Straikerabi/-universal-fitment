import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const site=path.join(process.cwd(),'site');
const script=fs.readFileSync(path.join(site,'src/app.js'),'utf8');
const css=fs.readFileSync(path.join(site,'styles.css'),'utf8');
const start=script.indexOf('<article class="card catalog-coverage"><b>Weitere Ersatzteile anhand deines Geräts prüfen</b>');
const end=script.indexOf('</article>',start);
assert.ok(start>0&&end>start);
const card=script.slice(start,end);
const matches=[...card.matchAll(/<a class="btn btn-secondary" href="([^"]+)" target="_blank" rel="noopener noreferrer">([^<]+)<\/a>/g)];
assert.equal(matches.length,7,'All existing source-specific manufacturer links retained');
assert.equal(card.split('class="maker-part-links"').length,2,'One labeled maker links layout');
const nav=card.match(/<nav class="maker-part-links" aria-label="([^"]+)">([\s\S]+)<\/nav>$/);
assert.ok(nav,'All links must be inside semantic nav');
assert.ok(/Original-Ersatzteile/.test(nav[1]));
assert.equal([...nav[2].matchAll(/<a class=/g)].length,7,'All seven links inside grid');
assert.ok(matches.every(m=>nav[2].includes(m[0])),'None may float outside grid');
assert.ok(matches.every(m=>m[1].startsWith('${')),'Existing internal manufacturer URL sources retained');
assert.ok(css.includes('.catalog-coverage .maker-part-links > a.btn'));
const rule=css.slice(css.lastIndexOf('/* Mobile maker parts link controls'));
assert.match(rule,/display:\s*grid;/);
assert.match(rule,/display:\s*flex;/);
assert.match(rule,/grid-template-columns:\s*minmax\(0,\s*1fr\);/);
assert.match(rule,/@media\s*\(max-width:\s*600px\)/);
assert.match(rule,/min-height:\s*48px/);
assert.match(rule,/white-space:\s*normal/);
assert.match(rule,/overflow-wrap:\s*anywhere/);
assert.match(rule,/box-sizing:\s*border-box/);
assert.match(rule,/height:\s*auto/);
assert.match(rule,/margin:\s*0/);
assert.match(rule,/gap:\s*\.75rem/);
assert.ok(!rule.includes('position: absolute'));
const labels=matches.map(m=>m[2]);
assert.deepEqual(labels,[
 'Miele Original-Ersatzteile öffnen ↗',
 'Bosch Ersatzteile mit E-Nr. prüfen ↗',
 'Dyson Teile & Generation prüfen ↗',
 'AEG Teile mit PNC prüfen ↗',
 'Rowenta Teile mit Ref. Nr. prüfen ↗',
 'Philips Teile mit Modellnummer prüfen ↗',
 'Siemens Teile mit E-Nr. prüfen ↗'
]);
console.log('Maker links mobile grid checks passed: 7 preserved sources, semantic nav, 1 column <=600px, free text wrap, minimum 48px touch areas.');
