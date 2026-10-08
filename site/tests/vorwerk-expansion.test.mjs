import assert from 'node:assert/strict';
import {products,partsCatalog,catalogStats,catalogCoverage,catalogBrands,optionalCatalogBrands,brandManifest,registerCatalogPack,filterCatalog} from '../src/data/catalog.js';
import {brandPack} from '../src/data/vorwerk-pack.js';
import {createCatalogLoader,brandsForBackup} from '../src/core/catalog-loader.js';
import {parseVorwerkModel,reviewVorwerkModel} from '../src/core/brand-identity.js';
import {reviewTypePlate,reviewScannedCode} from '../src/core/typeplate.js';
import {extractTypePlateIdentity} from '../src/core/identifiers.js';
import {matchProducts} from '../src/core/matcher.js';
import {partIdentity,partCategory} from '../src/data/miele-parts.js';
import {quoteForPart,canSelectQuote,cartQuoteItem,shippingCost} from '../src/data/miele-commerce.js';
import {partSearchIdentity,marketplaceSearchNote} from '../src/core/marketplaces.js';
import {createBackup,reviewBackup} from '../src/core/backup.js';
import {buildHandoffPlan,handoffListText} from '../src/core/handoff.js';
import {installationTime} from '../src/data/miele-installation-times.js';
import {catalogTargetProgress,deviceBudgetBand} from '../src/data/catalog-plan.js';

const codes=['VK7','VB100','VK200','VK150','VK140','VK136','VK135','VK131','VK130','VK122','VK121','VK120','VT300','VT270','VT265','VT260','VT252','VT251'];
assert.equal(catalogBrands.length,10);assert.equal(catalogStats.modelCount,868);assert.equal(catalogStats.recordCount,879);
assert.deepEqual(brandPack.models.map(m=>m.code),codes);
assert.equal(brandPack.parts.length,105);assert.equal(brandManifest.Vorwerk.manualCount,12);
const models=filterCatalog({brand:'Vorwerk'}),refs=new Map(models.map(p=>[p.id,p]));
assert.equal(models.length,18);assert.ok(models.every(p=>p.catalogLoaded===false&&p.parts.length===0));
assert.equal(partsCatalog.length,270,'optional articles are absent until requested');
const invalid=structuredClone(brandPack);invalid.parts[0].relationships.push({code:'VR7',url:invalid.parts[0].url});
assert.throws(()=>registerCatalogPack(invalid));assert.equal(partsCatalog.length,270);assert.ok(models.every(p=>!p.catalogLoaded));
let imports=0;
const loader=createCatalogLoader({packs:Object.fromEntries(optionalCatalogBrands.map(b=>[b,b.toLowerCase()])),register:registerCatalogPack,importModule:async b=>{imports++;return import(`../src/data/${b}-pack.js`);}});
await Promise.all([loader.ensure('Vorwerk'),loader.ensure('Vorwerk')]);assert.equal(imports,1);
assert.equal(partsCatalog.length,375);registerCatalogPack(brandPack);assert.equal(partsCatalog.length,375);
for(const device of models){
 assert.equal(device,refs.get(device.id));assert.equal(device.catalogLoaded,true);
 assert.equal(device.identityScope,'model-reference');assert.equal(device.vacuumMeta.materialNumber,null);
 assert.equal(device.sources[0].retrievedAt,'2026-10-07');assert.equal(new URL(device.sources[0].url).hostname,'www.vorwerk.com');
 assert.equal(device.partCount,device.parts.length);assert.equal(deviceBudgetBand(device),'unknown');
 assert.ok(device.partListCoverage.note);assert.match(device.identityNote,/eigene Typkennungen/);
 for(const part of device.parts){
  assert.equal(part.brand,'Vorwerk');assert.equal(part.fitment.status,'variant_check_required');
  assert.match(part.fitment.condition,/separat/);assert.ok(part.relationships.some(r=>device.deviceReferences.includes(r.code)));
  assert.ok(part.fitment.evidence.every(e=>e.retrievedAt==='2026-10-07'));
  const q=quoteForPart(part);if(q){assert.equal(q.partKey,partIdentity(part));assert.equal(q.stock,'unknown');assert.equal(q.vatIncluded,true);}
  assert.equal(canSelectQuote(q,Date.parse('2026-10-07T12:00:00Z')),false);assert.equal(cartQuoteItem(part,device),null);
  assert.equal(installationTime(part).status,'unknown');assert.equal(part.offers.length,0);
 }
}
const device=code=>products.find(p=>p.id==='vac-vorwerk-model-'+code.toLowerCase());
const vk7=device('VK7'),vb100=device('VB100'),vk135=device('VK135'),vk200=device('VK200');
assert.equal(filterCatalog({brand:'Vorwerk',deviceType:'cordless'}).length,2);
assert.equal(new Set(vk7.identifiers.map(i=>i.type+':'+i.value)).size,vk7.identifiers.length);
assert.equal(partCategory(vk7.parts.find(p=>p.identifiers[0].value==='MF7 Motorschutzfilter')),'Filter');
assert.equal(vk7.vacuumMeta.bagSystem,'FP7');assert.equal(vb100.vacuumMeta.bagSystem,'FP100');
assert.equal(models.filter(p=>p.manuals.some(m=>m.label==='Gebrauchsanweisung')).length,12);
assert.ok(models.every(p=>p.manuals.every(m=>new URL(m.url).hostname==='www.vorwerk.com')));
assert.equal(device('VK120').parts.length,0,'unobserved legacy articles remain open');
const fp7=vk7.parts.find(p=>p.identifiers[0].value.startsWith('FP7 '));assert.ok(fp7);
assert.equal(partCategory(fp7),'Staubsaugerbeutel');assert.equal(quoteForPart(fp7).price,38);assert.match(quoteForPart(fp7).unitLabel,/je 6/);
assert.ok(!vb100.parts.some(p=>p.id===fp7.id),'VB100 is not given VK7 bags');
assert.ok(vb100.parts.some(p=>p.identifiers[0].value.startsWith('FP100 ')));
assert.ok(!vk135.parts.some(p=>p.identifiers[0].value.startsWith('FP200 ')));
assert.ok(vk200.parts.some(p=>p.identifiers[0].value.startsWith('FP200 ')));
assert.ok(vk7.parts.some(p=>p.identifiers[0].value==='BY7 Akku'));
for(const p of partsCatalog.filter(p=>p.brand==='Vorwerk')){
 assert.equal(p.identifiers[0].type,'manufacturer-designation','a named product does not invent a numeric OEM article number');
 assert.ok(p.identifiers.every(i=>i.type!=='manufacturer-article'));assert.equal(new URL(p.sourceUrl).hostname,'www.vorwerk.com');
 assert.ok(p.modelIds.every(id=>refs.has(id)));if(quoteForPart(p))assert.equal(quoteForPart(p).stock,'unknown');else assert.equal(p.sourceQuote,null);
}
for(const designation of ['SC7 Ladegerät','CA7 Ladeadapter']){
 const p=partsCatalog.find(p=>p.brand==='Vorwerk'&&p.identifiers[0].value===designation);assert.ok(p);
 assert.equal(p.modelIds.length,0,'component compatibility does not imply main-device compatibility');assert.equal(p.fitment.status,'catalog_only');
 assert.ok(!vk7.parts.some(mapped=>mapped.id===p.id));
}
for(const [input,code] of [['VK7','VK7'],['Vorwerk Kobold VK 135','VK135'],['Kobold 136','VK136'],['Tiger260','VT260'],['Kobold VT270','VT270'],['VB100','VB100']])assert.equal(parseVorwerkModel(input)?.code,code);
for(const bad of ['136','EB400','SP600','VR7','RB7','VK7/01','VK7 serial 123','VK007'])assert.equal(parseVorwerkModel(bad),null,bad);
assert.equal(reviewVorwerkModel(vk7,'VK 7').status,'listed');assert.equal(reviewVorwerkModel(vk7,'VK200').status,'different_model');assert.equal(reviewVorwerkModel(vk7,'EB7').status,'invalid');
for(const text of ['Vorwerk\nModell: VK7','Vorwerk Kobold VK 7','Vorwerk\nTyp: VK7','Vorwerk\nRef: VK7','Vorwerk\nModell: Kobold VK7']){
 const review=reviewTypePlate(text);assert.equal(review.status,'catalog_reference',text);assert.equal(review.suggestions.length,1,text);assert.equal(review.suggestions[0].id,vk7.id);assert.match(review.warnings.join(' '),/Vorsatz/);
}
assert.equal(reviewTypePlate('Vorwerk\nTiger 260').suggestions[0].id,device('VT260').id);
for(const text of ['Vorwerk\nSeriennummer: VK7','Vorwerk\nFD: VK7','Vorwerk\nModell: EB7','Bosch\nModell: VK7','Vorwerk\nModell: FC9330','Vorwerk\nModell: VR7'])assert.equal(reviewTypePlate(text).suggestions.length,0,text);
assert.equal(reviewTypePlate('Vorwerk\nModell: VK7\nTyp: VK200').status,'conflict');
assert.equal(reviewScannedCode('VK7').status,'catalog_reference');assert.equal(reviewScannedCode('VK7').needsBrandConfirmation,true);
assert.equal(extractTypePlateIdentity(['Vorwerk','VK7']).brand,'VORWERK');assert.equal(extractTypePlateIdentity(['Vorwerk','Seriennummer: VK7']).primary,'');
assert.equal(matchProducts(products,'VK7')[0].product.id,vk7.id);assert.equal(matchProducts(products,'Kobold 136')[0].product.id,device('VK136').id);
const identity=partSearchIdentity(fp7);assert.equal(identity.codeType,'manufacturer-designation');assert.match(identity.query,/Vorwerk FP7/);
const note={...marketplaceSearchNote(fp7,vk7,'used'),key:'vorwerk-fp7',quantity:2};assert.equal(note.price,null);
assert.deepEqual(brandsForBackup({cart:[note]},products),['Vorwerk']);
const restored=reviewBackup(JSON.stringify(createBackup({saved:[vk7.id],deviceMeta:{[vk7.id]:{nickname:'Flur'}}},[note],{})));
assert.equal(restored.summary.devices,1);assert.equal(restored.cart.length,1);assert.equal(restored.cart[0].partKey,partIdentity(fp7));assert.equal(restored.cart[0].price,null);
const plan=buildHandoffPlan(restored.cart,{resolvePart:item=>device('VK7').parts.find(p=>p.id===item.partId)});
assert.equal(plan.total,null);assert.equal(plan.groups[0].lines[0].partNumberLabel,'Herstellerbezeichnung');
assert.match(handoffListText(plan),/Herstellerbezeichnung: FP7/);assert.doesNotMatch(handoffListText(plan),/Teilenummer: FP7/);
assert.equal(buildHandoffPlan(restored.cart).groups[0].lines[0].partNumberLabel,'Teilekennung','an unloaded record does not invent its identifier type');
assert.equal(shippingCost('vorwerk-de',38.99),5);assert.equal(shippingCost('vorwerk-de',39),0);
await loader.ensureAll();assert.equal(imports,8);assert.equal(new Set(partsCatalog.map(partIdentity)).size,1921);
assert.equal(partsCatalog.length,1921);assert.equal(new Set(products.map(p=>p.id)).size,products.length);
const progress=catalogTargetProgress(catalogCoverage());assert.equal(progress.reduce((n,r)=>n+r.slots,0),655);assert.equal(progress.filter(r=>!r.active).length,0);
assert.equal(progress.find(r=>r.brand==='Vorwerk').models,18);
console.log('Vorwerk passed: 18 actual main devices, 105 manufacturer designations, 12 direct manuals, lazy/offline-ready hydration, separate accessory types, serial/brand boundaries, source-only prices, backup and shopping list. Ten brands retain 1,921 distinct articles.');
