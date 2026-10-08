import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd(),base=path.join(root,'site');
const appPath=path.join(base,'src/app.js');
const cssPath=path.join(base,'styles.css');
const app=fs.readFileSync(appPath,'utf8');
const css=fs.readFileSync(cssPath,'utf8');

const first='<article class="card catalog-coverage"><b>Weitere Ersatzteile anhand deines Geräts prüfen</b>';
const start=app.indexOf(first);
assert.ok(start>0,'Coverage article on catalog page must exist');
assert.equal(app.indexOf(first,start+first.length),-1,'One exact fallback card required');
const end=app.indexOf('</article>',start);
assert.ok(end>start);
const region=app.slice(start,end);
const anchorStart=region.indexOf('<a class="btn btn-secondary"');
assert.ok(anchorStart>0);
const anchors=[...region.matchAll(/<a class="btn btn-secondary" href="[^"]+" target="_blank" rel="noopener noreferrer">[^<]+<\/a>/g)];
assert.equal(anchors.length,7,'All seven safe original manufacturer links must be present');
const labels=anchors.map(x=>x[0].match(/>([^<]+)<\/a>$/)?.[1]);
assert.deepEqual(labels,[
'Miele Original-Ersatzteile öffnen ↗','Bosch Ersatzteile mit E-Nr. prüfen ↗',
'Dyson Teile & Generation prüfen ↗','AEG Teile mit PNC prüfen ↗',
'Rowenta Teile mit Ref. Nr. prüfen ↗','Philips Teile mit Modellnummer prüfen ↗',
'Siemens Teile mit E-Nr. prüfen ↗'
],'Manufacturer link destinations and labels must stay unchanged');
const last=anchors.at(-1);
const expectedTailIndex=last.index+last[0].length;
assert.equal(region.slice(expectedTailIndex),'','No hidden or additional content after links');
const before=region.slice(0,anchorStart),linkText=region.slice(anchorStart);
let nextRegion;
if(region.includes('class="maker-part-links"')){
 assert.equal((region.match(/class="maker-part-links"/g)||[]).length,1);
 nextRegion=region;
}else{
 nextRegion=before+'<nav class="maker-part-links" aria-label="Weitere Original-Ersatzteile beim Hersteller">'+linkText+'</nav>';
}
if(nextRegion!==region){
 fs.writeFileSync(appPath,app.slice(0,start)+nextRegion+app.slice(end));
}

const marker='/* Mobile maker parts link controls — keep each manufacturer action in normal flow. */';
const styles=String.raw\`
/* Mobile maker parts link controls — keep each manufacturer action in normal flow. */
.catalog-coverage .maker-part-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
  align-items: stretch;
  column-gap: .75rem;
  row-gap: .75rem;
  width: 100%;
  max-width: 100%;
  margin-top: 1rem;
}
.catalog-coverage .maker-part-links > a.btn {
  position: relative;
  display: flex;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  height: auto;
  min-height: 48px;
  margin: 0;
  padding: .8rem .9rem;
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.4;
  text-align: center;
  align-items: center;
  justify-content: center;
}
@media (max-width: 600px) {
  .catalog-coverage .maker-part-links {
    grid-template-columns: minmax(0, 1fr);
  }
}
\`;
if(!css.includes(marker))fs.writeFileSync(cssPath,css+'\n'+styles);
else assert.equal(css.split(marker).length,2,'Only one mobile maker links CSS rule group');
console.log(JSON.stringify({changedLinks:nextRegion!==region,linkedManufacturers:labels,linkDestinationsUnchanged:true,styleReady:true,smallViewportColumns:1}));
