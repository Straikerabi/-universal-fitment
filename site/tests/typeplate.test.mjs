import assert from 'node:assert/strict';
import {reviewTypePlate,parseTypePlate} from '../src/core/typeplate.js';
import {products,mielePartsCatalog} from '../src/data/catalog.js';
import {isValidGTIN,classifyIdentifier} from '../src/core/identifiers.js';
import {normalizeGTIN} from '../src/core/normalization.js';
const a=products.find(p=>p.id==='vac-miele-model-12560300'),b=products.find(p=>p.id==='vac-miele-model-12887840');
const ean=p=>p.identifiers.find(x=>x.type==='ean').value;
let r=reviewTypePlate(`Miele\nMat.-Nr.: 12560300\nTyp: SVZF0\nSeriennummer: SECRET1234`);
assert.equal(r.status,'exact_device');assert.equal(r.suggestions[0].id,a.id);assert.equal(r.entries.find(e=>e.kind==='serial').matches.length,0);
r=reviewTypePlate(`Miele\nMat.-Nr.: 12560300\nEAN: ${ean(b)}`);assert.equal(r.status,'conflict');assert.equal(r.suggestions.length,0);
r=reviewTypePlate(`Miele Mat.-Nr.: 12560300 EAN: ${ean(b)}`);assert.equal(r.status,'conflict','multiple labels on one OCR line remain distinct');
r=reviewTypePlate(`Miele Mat.-Nr.: 12560300 EAN: ${ean(a)} Typ: ${a.identifiers.find(x=>x.type==='product-type').value}`);assert.equal(r.status,'exact_device');
r=reviewTypePlate('Miele\nType SGDF3\nComplete C3');assert.equal(r.status,'family');assert.ok(r.suggestions.every(p=>p.recordType==='family'&&p.model==='Complete C3'),'unknown type does not discard a named known family');
r=reviewTypePlate(`Dyson\nMat.-Nr. 12560300`);assert.equal(r.status,'unresolved');assert.equal(r.suggestions.length,0);
r=reviewTypePlate(`Miele Bosch\nMat.-Nr. 12560300`);assert.equal(r.status,'unsupported_brand');
r=reviewTypePlate('Mat.-Nr. 12560300');assert.equal(r.needsBrandConfirmation,true);assert.equal(r.status,'exact_device');
r=reviewTypePlate('Miele\nSeriennummer: 12560300');assert.equal(r.status,'unresolved');assert.equal(r.suggestions.length,0);
r=reviewTypePlate(`Miele\nSeriennummer: ${ean(a)}`);assert.equal(r.suggestions.length,0);
r=reviewTypePlate('Miele\nMat.-Nr.: 12560300\nComplete C3');assert.equal(r.status,'conflict','named family and exact identifier disagree');
r=reviewTypePlate('Miele\nMat.-Nr.: 99999999\nEAN: '+ean(a));assert.equal(r.status,'conflict','unknown material is not silently ignored');
r=reviewTypePlate('Miele\nEAN: 1234567890123');assert.equal(r.hasInvalidFields,true);assert.equal(r.suggestions.length,0);
r=reviewTypePlate('Miele\nMaterial-Nr.\n12560300');assert.equal(r.status,'exact_device');
r=reviewTypePlate('Miele\nMaterial-Nr.\nSeriennummer: 12560300');assert.equal(r.status,'unresolved','following label is not a missing field value');
r=reviewTypePlate('Miele\nMat.-Nr.: 12557060');assert.equal(r.status,'part_only');assert.equal(r.suggestions.length,0);assert.ok(r.partSuggestions.length);
for(const p of products.filter(p=>p.brand==='Miele'&&p.recordType==='model')){
 r=reviewTypePlate(`Miele\nMaterial-Nr.: ${p.vacuumMeta.materialNumber}\nEAN: ${ean(p)}`);assert.equal(r.status,'exact_device');assert.equal(r.suggestions[0].id,p.id);
 r=reviewTypePlate(`Miele\nEAN: 0${ean(p)}`);assert.equal(r.suggestions[0].id,p.id);
 const type=p.identifiers.find(i=>i.type==='product-type')?.value;if(type){r=reviewTypePlate(`Miele\nTyp: ${type}`);assert.ok(r.suggestions.some(x=>x.id===p.id));if(r.suggestions.length>1)assert.equal(r.status,'shared_identity');}
}
for(const p of mielePartsCatalog){const code=p.identifiers.find(i=>i.type==='material-number')?.value;if(code&&!products.some(x=>x.vacuumMeta?.materialNumber===code)){r=reviewTypePlate('Miele\nMat.-Nr.: '+code);assert.equal(r.suggestions.length,0);assert.ok(r.partSuggestions.some(x=>x.id===p.id));}}
assert.equal(parseTypePlate('x'.repeat(20000)).text.length,8000);
for(const value of ['PREFIX'+ean(a),'Serial '+ean(a),ean(a)+'X']){assert.equal(isValidGTIN(value),false);assert.equal(normalizeGTIN(value),null);assert.notEqual(classifyIdentifier(value).kind,'gtin');}
assert.equal(isValidGTIN(ean(a).replace(/(.{4})/g,'$1 ')),true);assert.equal(isValidGTIN(ean(a).slice(0,4)+'-'+ean(a).slice(4)),true);
console.log('Type-plate checks passed: all 62 device variants, shared types, family fallback, foreign brands, serial exclusion, contradictory identifiers, part-only codes and bounded OCR text. Synthetic fixtures only.');
r=reviewTypePlate('Miele Mat.-Nr.: 12560300 Mat.-Nr.: 12887840');assert.equal(r.status,'conflict','repeated identical labels cannot hide contradictory numbers');
r=reviewTypePlate('Miele\nTyp SNRF0');assert.equal(r.entries[0].kind,'type','SNRF0 is a type, not the S-Nr serial label');
r=reviewTypePlate(`Miele\nSeriennummer:\n${ean(a)}`);assert.equal(r.suggestions.length,0,'a multiline serial value never becomes an unlabeled barcode');assert.ok(r.entries.every(e=>e.kind==='serial'));
r=reviewTypePlate('Miele\nMaterial-Nr.: 12560300\nMaterial-Nr.: 12557060');assert.equal(r.status,'conflict','mixed part and device numbers require correction');
