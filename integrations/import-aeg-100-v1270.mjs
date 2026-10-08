import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const inputs=JSON.parse(fs.readFileSync(path.join(root,'integrations/aeg-model-candidates-v1270.json'),'utf8'));
const packFile=path.join(root,'site/src/data/aeg-pack.js');
const idxFile=path.join(root,'site/src/data/brand-index.js');
const packText=fs.readFileSync(packFile,'utf8');
const packTag='export const brandPack=';
assert.ok(packText.includes(packTag));
const pack=JSON.parse(packText.slice(packText.indexOf(packTag)+packTag.length).trim().replace(/;\s*$/,''));
const indexText=fs.readFileSync(idxFile,'utf8');
const indexTag='export const brandIndex=';
const manifestTag='export const brandManifest=';
const indexStart=indexText.indexOf(indexTag);
const manifestStart=indexText.indexOf(manifestTag);
assert.ok(indexStart>=0&&manifestStart>indexStart);
const indexData=indexText.slice(indexStart+indexTag.length,manifestStart).trim().replace(/;\s*$/,'');
const manifestTail=indexText.slice(manifestStart+manifestTag.length);
const tailMarker=';\napplyHooverIndexFitment';
const afterManifest=manifestTail.indexOf(tailMarker);
assert.ok(afterManifest>0);
const manifestData=manifestTail.slice(0,afterManifest).trim();
const suffix=manifestTail.slice(afterManifest+1);
const index=JSON.parse(indexData);
const manifest=JSON.parse(manifestData);
assert.equal(pack.brand,'AEG');
assert.equal(pack.models.length,78);
assert.equal(pack.parts.length,354);
assert.equal(index.filter(x=>x.brand==='AEG').length,78);
assert.equal(manifest.AEG.modelCount,78);
assert.equal(inputs.models.length,22);
assert.equal(inputs.summary.manufacturerDirect,22);
const existing=new Set(pack.models.map(x=>x.code));
assert.equal(existing.size,78);
const compactCodes=new Set(index.filter(x=>x.brand==='AEG').map(x=>x.code));
assert.equal(compactCodes.size,78);
const observedCodes=new Set();
const pncModels=new Map();
let nineDigitPrefixes=0;
for(const item of inputs.models){
 const code=item.code;
 assert.ok(!existing.has(code),'Device already listed '+code);
 assert.ok(!compactCodes.has(code),'Index already listed '+code);
 assert.ok(!observedCodes.has(code),'Input duplicate '+code);
 observedCodes.add(code);
 assert.ok(/^[A-Z0-9][A-Z0-9-]+$/.test(code));
 assert.ok(/^\d{9}(\d{2})?$/.test(item.pnc),'AEG product number from source');
 assert.equal(item.evidenceTier,'manufacturer','Unverified manufacturer model source');
 assert.ok(/^https:\/\/(www\.aeg\.de|shop\.aeg\.(de|at)|shop\.electrolux\.de)\//.test(item.url),'Allowed manufacturer host');
 if(item.url.includes('/model/m/')) assert.ok(item.url.endsWith('/'+code),'Manufacturer model URL must refer to precise code');
 else assert.ok(item.url.endsWith('/'+code.toLowerCase()+'/'),'Retail product page must refer to exact code');
 const complete=item.pnc.length===11;
 if(!complete)nineDigitPrefixes++;
 // Model/PNC source is documentary evidence of device existence; NOT a spare-parts compatibility matrix.
 const note=complete?
   'Herstellerseitig gelistetes Modell mit 11-stelliger PNC-Ausführung '+item.pnc+'. Eine passende Ersatzteilliste wurde für dieses Modell noch nicht katalogisiert.':
   'Die Hersteller-Produktseite nennt nur die neunstellige Produktnummer '+item.pnc+'. Die vollständige PNC-Variante muss vor einer Ersatzteilsuche auf dem Typenschild geprüft werden; fehlende zwei Stellen werden niemals ergänzt.';
 const model={
  brand:'AEG',code,model:code,series:item.series,deviceType:item.deviceType,
  pncs:complete?[item.pnc]:[],
  checkedAt:inputs.checkedAt,sourceNote:item.source+'; '+note,
  dataStatus:'manufacturer-verified',url:item.url,
  guideUrl:'https://www.aeg.de/support/user-manuals/',
  partsUrl:complete?'https://shop.aeg.de/search?pnc='+item.pnc:'https://shop.aeg.de/',
  manuals:[{label:'Gebrauchsanleitung über PNC suchen',url:'https://www.aeg.de/support/user-manuals/'},{label:'Belegter AEG-Modell- und PNC-Nachweis',url:item.url}],
  variantNote:note,
  facts:complete?[]:[{label:'Neunstellige Produktnummer (PNC unvollständig)',value:item.pnc}],
  partCount:0,physicalPartCount:0,
  partListCoverage:'Noch keine gerätespezifische Original-Ersatzteilliste erfasst. Modellcode allein bestätigt keine Bauteilpassung. Vollständige PNC-Ausführung vor einer Teilebestellung vergleichen.'
 };
 pack.models.push(model);
 existing.add(code);
 const {partListCoverage,manuals,variantNote,facts,...light}=model;
 const candidate={...light,partCount:0,physicalPartCount:0};
 const insert=index.map(m=>m.brand).lastIndexOf('AEG');
 assert.ok(insert>=0);
 index.splice(insert+1,0,candidate);
 pncModels.set(code,model);
}
assert.equal(nineDigitPrefixes,6);
assert.equal(pack.models.length,100);
assert.equal(index.filter(m=>m.brand==='AEG').length,100);
assert.equal(new Set(pack.models.map(x=>x.code)).size,100);
assert.equal(new Set(index.filter(x=>x.brand==='AEG').map(x=>x.code)).size,100);
assert.equal(pack.parts.length,354,'No unsupported parts were added');
manifest.AEG.modelCount=100;
manifest.AEG.recordCount=100;
manifest.AEG.note='100 exakt benannte AEG-Staubsauger einschließlich 22 zusätzlicher aus Herstellerquellen belegter Modelle. Weiterhin 351 physische Ersatz-/Zubehörartikel und 3 sonstige Artikel. Für die 22 neuen Geräte fehlen gerätespezifisch geprüfte Ersatzteillisten; neunstellige Produktnummern wurden nicht um erfundene PNC-Stellen ergänzt.';
fs.writeFileSync(packFile,'// Real AEG product model references; 22 additionally sourced 2026-10-08. No implied spare-parts fitment.\nexport const brandPack='+JSON.stringify(pack)+';\n');
const header=indexText.slice(0,indexStart);
fs.writeFileSync(idxFile,header+indexTag+JSON.stringify(index)+';\n'+manifestTag+JSON.stringify(manifest)+';'+suffix);
console.log(JSON.stringify({added_models:observedCodes.size,AEG_models:pack.models.length,AEG_articles:pack.parts.length,no_parts:new Set(inputs.models.map(x=>x.code)).size,pnc_prefix_only:nineDigitPrefixes}));
