import assert from 'node:assert/strict';
import { verifiedProducts } from '../src/data/verified-products.js';
import { products } from '../src/data/catalog.js';

assert.ok(verifiedProducts.length >= 6, 'expected verified seed dataset including coffee');
assert.ok(products.some(p=>p.id==='vac-dyson-v11-real'));
assert.ok(products.some(p=>p.id==='vac-miele-c3-real'));
assert.ok(products.some(p=>p.id==='wash-bosch-wae24166uk-real'));
assert.ok(products.some(p=>p.id==='coffee-delonghi-ecam29089-real'));
assert.ok(products.some(p=>p.id==='coffee-philips-ep554790-real'));
assert.ok(products.some(p=>p.id==='coffee-nespresso-vertuo-pop-real'));

for(const product of verifiedProducts){
  assert.equal(product.dataStatus,'manufacturer-verified');
  assert.ok(product.sources?.length, `${product.id} must have sources`);
  for(const src of product.sources){
    assert.match(src.url,/^https:\/\//);
    assert.equal(src.grade,'A');
  }
  for(const part of product.parts||[]){
    assert.equal(part.fitment.status,'manufacturer_verified');
    assert.ok(part.fitment.confidence >= .95);
    assert.ok(part.fitment.evidence.every(e=>e.url?.startsWith('https://')));
    assert.equal(part.offers.length,0,'verified seed parts must not contain invented offers');
  }
}

const miele=verifiedProducts.find(p=>p.id==='vac-miele-c3-real');
assert.ok(miele.identifiers.some(i=>i.type==='ean'&&i.value==='4002515488492'));
const bosch=verifiedProducts.find(p=>p.id==='wash-bosch-wae24166uk-real');
assert.ok(bosch.identifiers.some(i=>i.type==='ean'&&i.value==='4242002720524'));
const dyson=verifiedProducts.find(p=>p.id==='vac-dyson-v11-real');
assert.ok(dyson.parts.some(p=>p.identifiers?.some(i=>i.value==='970013-02')));

console.log('All verified data tests passed.');
