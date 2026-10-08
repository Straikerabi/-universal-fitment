import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const evidence=JSON.parse(fs.readFileSync(path.join(root,'integrations/samsung-model-first-v1271.json'),'utf8'));
const packFile=path.join(root,'site/src/data/samsung-pack.js');
const indexFile=path.join(root,'site/src/data/new-brands-index.js');
const rawPack=fs.readFileSync(packFile,'utf8');
const tag='export const brandPack=';
assert.equal(rawPack.includes(tag),true);
const pack=JSON.parse(rawPack.slice(rawPack.indexOf(tag)+tag.length).trim().replace(/;\s*$/,''));
const rawIdx=fs.readFileSync(indexFile,'utf8');
const indexStart='export const newBrandsIndex=';
const manifestStart='export const newBrandsManifest=';
assert.ok(rawIdx.includes(indexStart)&&rawIdx.includes(manifestStart));
const [first,last]=rawIdx.split(manifestStart);
const index=JSON.parse(first.slice(first.indexOf(indexStart)+indexStart.length).trim().replace(/;\s*$/,''));
const manifest=JSON.parse(last.trim().replace(/;\s*$/,''));
assert.equal(pack.brand,'Samsung');
assert.equal(pack.models.length,67);
assert.equal(pack.parts.length,36);
assert.equal(manifest.Samsung.modelCount,67);
assert.equal(manifest.Samsung.partCount,36);
assert.equal(index.filter(x=>x.brand==='Samsung').length,67);
assert.equal(evidence.models.length,2);
const known=new Set(pack.models.map(x=>x.code));
const knownIndex=new Set(index.filter(x=>x.brand==='Samsung').map(x=>x.code));
assert.equal(known.size,67);
assert.equal(knownIndex.size,67);
for(const x of evidence.models){
 assert.ok(/^VS[A-Z0-9]+$/.test(x.code),'Unqualified model code');
 assert.equal(x.full,x.code+'/WD');
 assert.ok(!known.has(x.code),'Model is already in pack: '+x.code);
 assert.ok(!knownIndex.has(x.code),'Model is already in index: '+x.code);
 assert.ok(x.url.startsWith('https://www.samsung.com/de/vacuum-cleaners/stick/'),'Manufacturer device evidence');
 assert.ok(x.url.endsWith(x.code.toLowerCase()+'-wd/'),'Mismatched manufacturer URL');
 assert.ok(x.service.startsWith('https://www.samsung.com/de/support/model/'+x.code+'/WD/'));
 const note='Hersteller bestätigt den vollständigen Modellcode '+x.full+'. In dieser Modell-zuerst-Phase sind für dieses Gerät noch keine einzelnen Zubehör- oder Ersatzteilbeziehungen übernommen. Herstellerangaben über optionales Zubehör werden separat vor technischen Passungsbehauptungen geprüft.';
 const record={
  brand:'Samsung',code:x.code,model:x.code,series:x.series,deviceType:x.deviceType,
  type:x.name,url:x.url,guideUrl:x.service,partsUrl:x.service,
  deviceReferences:[x.full],aliases:[x.name],checkedAt:evidence.checkedAt,
  sourceNote:note,variantNote:'Vollständige /WD-Kennung am Typenschild bestätigen. Baujahre, regionale Ausführungen, Akku, Düsen, Wischaufsätze und Clean Station unterscheiden.',
  partListCoverage:{sourceUrl:x.url,note:'Noch keine gerätespezifisch überprüfte Teileliste katalogisiert. Einzelne optionale Herstellerartikel sind Forschungsdaten und nicht automatisch passende Ersatzteile.'},
  partCount:0,physicalPartCount:0
 };
 pack.models.push(record);
 const {partListCoverage,...summary}=record;
 const pos=index.map(y=>y.brand).lastIndexOf('Samsung');
 assert.ok(pos>=0);
 index.splice(pos+1,0,summary);
 known.add(x.code);knownIndex.add(x.code);
}
assert.equal(known.size,69);
assert.equal(knownIndex.size,69);
assert.equal(pack.models.length,69);
assert.equal(index.filter(x=>x.brand==='Samsung').length,69);
assert.equal(pack.parts.length,36,'No parts import in model-first stage');
manifest.Samsung.modelCount=69;
manifest.Samsung.recordCount=69;
manifest.Samsung.note='69 echte und exakt benannte Samsung-Gerätemodelle (vollständige /xx-Kennung); davon 20 mit konkret herstellerseitig gelisteten optionalen Zubehörbeziehungen, 49 bisher ohne importierte gerätespezifische Teile. Die zwei neuen /WD-Geräte werden bewusst ohne unqualifizierte technische Ersatzteilpassungen aufgenommen.';
fs.writeFileSync(packFile,'// Samsung manufacturer-verified model records, latest model-only intake 2026-10-08.\nexport const brandPack='+JSON.stringify(pack)+';\n');
fs.writeFileSync(indexFile,'// Samsung + Hoover verified model references and compact availability notes.\nexport const newBrandsIndex='+JSON.stringify(index)+';\nexport const newBrandsManifest='+JSON.stringify(manifest)+';\n');
console.log(JSON.stringify({newModels:evidence.models.map(x=>x.full),samsungModels:pack.models.length,samsungArticles:pack.parts.length,modelsWithoutParts:pack.models.filter(x=>!x.partCount).length,addedFitment:0}));
