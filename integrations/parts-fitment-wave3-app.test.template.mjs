import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {products,partsCatalog,optionalCatalogBrands,registerCatalogPack,catalogCoverage,filterCatalog} from '../src/data/catalog.js';
import {brandDeviceId} from '../src/data/brand-products.js';
import {isPhysicalPart,partTypeSummary} from '../src/data/part-taxonomy.js';
import {partIdentity} from '../src/data/miele-parts.js';
import {quoteForPart,cartQuoteItem} from '../src/data/miele-commerce.js';
import {reviewTypePlate} from '../src/core/typeplate.js';
import {applyPartsFitmentWave3} from '../src/data/parts-fitment-wave3.js';
const baseline=JSON.parse(fs.readFileSync(process.env.UF_PARTS_WAVE3_BASELINE||new URL('../../integrations/parts-fitment-wave3-baseline.json',import.meta.url)));
const sha=x=>createHash('sha256').update(x).digest('hex');
const commercial=p=>({sourceQuote:p.sourceQuote,offers:p.offers,availabilityNote:p.availabilityNote,sourceUrl:p.sourceUrl,imageUrl:p.imageUrl,fitmentStatus:p.fitment.status});
const before=catalogCoverage();
const saved=products.find(p=>p.id===brandDeviceId('Hoover','DS22G'));
assert.equal(saved.catalogLoaded,false);assert.equal(saved.physicalPartCount,4);
assert.equal(products.find(p=>p.id===brandDeviceId('Samsung','VS80F28EFP')).physicalPartCount,8);
for(const brand of optionalCatalogBrands){const {brandPack}=await import(`../src/data/${brand.toLowerCase()}-pack.js`);registerCatalogPack(brandPack);registerCatalogPack(brandPack);}
assert.strictEqual(products.find(p=>p.id===saved.id),saved,'Saved references survive lazy hydration');
assert.equal(partsCatalog.length,1961);assert.equal(partsCatalog.filter(isPhysicalPart).length,1843);
assert.equal(new Set(partsCatalog.map(partIdentity)).size,partsCatalog.length);
for(const old of baseline.parts){
 const p=partsCatalog.find(p=>p.id===old.id);assert.ok(p,'Every legacy article survives: '+old.id);
 assert.equal(sha(JSON.stringify(p.identifiers)),old.identifiersSha256,'Legacy identifiers preserved');
 assert.equal(sha(JSON.stringify((p.relationships||[]).slice(0,old.relationshipCount))),old.relationshipsSha256,'Every old relationship retained verbatim and in order');
 assert.equal(sha(JSON.stringify(commercial(p))),old.commercialSha256,'No renewal of price, offer, stock, availability, photo or purchase status');
}
assert.equal(products.length,baseline.models.length);
for(const old of baseline.models){const m=products.find(p=>p.id===old.id);assert.ok(m);for(const id of old.partIds)assert.ok(m.parts.some(p=>p.id===id),'Legacy model-to-part association: '+old.id+' / '+id);}
const expected={Samsung:{parts:51,physicalParts:51,recordsWithoutParts:54,recordsWithParts:23},Hoover:{parts:76,physicalParts:76,recordsWithoutParts:95,recordsWithParts:5}};
for(const row of catalogCoverage()){
 const prev=baseline.coverage.find(r=>r.brand===row.brand),index=before.find(r=>r.brand===row.brand);
 for(const k of ['parts','physicalParts','recordsWithoutParts','recordsWithParts']){
  assert.equal(row[k],expected[row.brand]?.[k]??prev[k],row.brand+' '+k);
  assert.equal(index[k],row[k],'Index/loaded counts agree: '+row.brand+' '+k);
 }
 assert.equal(row.records,prev.records);assert.equal(row.models,prev.models);
 assert.equal(filterCatalog({brand:row.brand,partCoverage:'missing'}).length,row.recordsWithoutParts);
 const typed=partTypeSummary(partsCatalog.filter(p=>(p.targetBrands||[p.brand||'Miele']).includes(row.brand)));assert.equal(typed.reduce((n,t)=>n+t.count,0),row.parts);
}
const newArticles=partsCatalog.filter(p=>!baseline.parts.some(o=>o.id===p.id));
assert.equal(newArticles.length,21);assert.equal(newArticles.filter(p=>p.brand==='Samsung').length,5);assert.equal(newArticles.filter(p=>p.brand==='Hoover').length,16);
for(const p of newArticles){
 assert.equal(p.sourceQuote,null);assert.deepEqual(p.offers,[]);assert.equal(quoteForPart(p),null);assert.equal(cartQuoteItem(p),null);
 assert.equal(p.fitment.status,'catalog_only');assert.ok(isPhysicalPart(p));assert.equal(p.tier,'oem');
 assert.equal(p.sourceMarket,p.brand==='Samsung'?'DE':'GB');
}
const links=partsCatalog.flatMap(p=>(p.relationships||[]).filter(r=>r.partsFitmentWave3).map(r=>({part:p,...r})));
assert.equal(links.length,36);assert.equal(links.filter(r=>r.part.brand==='Hoover').length,18);assert.equal(links.filter(r=>r.part.brand==='Samsung').length,18);
for(const r of links){
 const d=products.find(p=>p.id===brandDeviceId(r.part.brand,r.code)),scoped=d.parts.find(p=>p.id===r.part.id);assert.ok(scoped);
 assert.equal(scoped.fitment.status,'variant_check_required');assert.ok(scoped.fitment.condition.includes(r.reference));
 assert.ok(scoped.fitment.condition.includes('['+r.sourceMarket+']'));for(const c of r.conditions)assert.ok(scoped.fitment.condition.includes(c));
 assert.equal(quoteForPart(scoped),null);assert.equal(cartQuoteItem(scoped),null);
}
const byCode=(brand,code)=>partsCatalog.find(p=>p.brand===brand&&p.identifiers.some(i=>i.type==='manufacturer-article'&&i.value===code));
const nullEan=byCode('Hoover','35602487');assert.ok(nullEan);assert.ok(!nullEan.identifiers.some(i=>i.type==='ean'),'Unknown EAN remains absent, not string null or placeholder');
assert.ok(byCode('Samsung','VCA-SHFF80K').identifiers.some(i=>i.type==='ean'&&i.value==='8806099133504'));
assert.ok(byCode('Hoover','48021590').identifiers.some(i=>i.type==='ean'&&i.value==='8057166547445'));
for(const code of ['49037664','48023954']){const p=byCode('Hoover',code);assert.ok(p.restrictions.some(r=>r.includes('UK-Netzstecker')));assert.ok(p.relationships.every(r=>r.sourceMarket==='GB'));assert.ok(!p.modelIds.includes(brandDeviceId('Hoover','HF201H011')));}
assert.ok(!byCode('Hoover','39800043').modelIds.includes(brandDeviceId('Hoover','FD22G')),'Same voltage/family does not mix batteries');
assert.ok(!byCode('Hoover','35601729').modelIds.includes(brandDeviceId('Hoover','DS22G')));
assert.ok(!byCode('Samsung','VCA-SBTA95/VT').modelIds.includes(brandDeviceId('Samsung','VS80F28EFP')),'Wrong battery variant remains excluded');
assert.ok(!byCode('Samsung','VCA-SAPC97/WA').modelIds.length,'Family-only battery remains unlinked');
assert.equal(byCode('Samsung','VCA-SHFF90M').modelIds.length,0,'EEM alias does not transfer a filter to EEK');
assert.equal(byCode('Samsung','VCA-TABF95').modelIds.length,0,'A real new original article is not automatically fitted by family');
const ai=products.find(p=>p.id===brandDeviceId('Samsung','VS90F40EEK'));assert.equal(ai.parts.length,5);assert.ok(!ai.parts.some(p=>p.id===byCode('Samsung','VCA-SHFF90M').id));
assert.equal(products.find(p=>p.id===brandDeviceId('Hoover','HF222RH001')).parts.length,0,'General catalogue is not a product-code list');
for(const [code,n] of [['HF202P011',10],['HF201H011',12]])assert.equal(products.find(p=>p.id===brandDeviceId('Hoover',code)).parts.length,n);
assert.equal(reviewTypePlate('Hoover\nProduktcode: 39400303').suggestions[0].id,saved.id);
assert.equal(reviewTypePlate('Samsung\nModellcode: VS80F28EFP/WD').suggestions[0].id,brandDeviceId('Samsung','VS80F28EFP'));
const {brandPack}=await import('../src/data/samsung-pack.js');assert.deepEqual(applyPartsFitmentWave3(brandPack),brandPack,'Runtime extension is idempotent');
console.log('Parts/fitment wave3 passed: 1,940 legacy articles and all old associations preserved; 21 new OEM articles, 36 conditional exact relationships, six zero-to-parts records; market/battery/variant/source/EAN and purchase gates intact.');
