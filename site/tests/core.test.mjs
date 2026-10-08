import assert from 'node:assert/strict';
import { compactIdentifier, isLikelyVIN, normalizeGTIN, normalizeText } from '../src/core/normalization.js';
import { matchProducts, scoreProduct } from '../src/core/matcher.js';
import { rankOffers, recommendationBreakdown, recommendationScore, totalPrice } from '../src/core/ranking.js';
import { products } from '../src/data/demo-products.js';

assert.equal(normalizeText('Škoda Octavia 1U'), 'SKODA OCTAVIA 1U');
assert.equal(compactIdentifier('GSR 18V-55'), 'GSR18V55');
assert.equal(normalizeGTIN('4006381333931'), '04006381333931');
assert.equal(normalizeGTIN('abc'), null);
assert.equal(isLikelyVIN('WVWZZZ1JZXW000001'), true);
assert.equal(isLikelyVIN('too-short'), false);

const tool = products.find(p=>p.id==='tool-demo-1');
assert.equal(scoreProduct(tool,'UF-TOOL-001'),100);
assert.ok(scoreProduct(tool,'GSR 18V-55')>=96);
assert.equal(matchProducts(products,'WAN282H3')[0].product.id,'wash-demo-1');
assert.equal(matchProducts(products,'AKL')[0].product.id,'car-demo-1');

const offers=[
 {price:10,shipping:5,qualityScore:7,reviewTrust:7,sellerScore:8,returnsScore:8,compatibilityConfidence:.9,deliveryDays:4},
 {price:20,shipping:0,qualityScore:9,reviewTrust:9,sellerScore:9,returnsScore:9,compatibilityConfidence:.95,deliveryDays:1}
];
assert.equal(totalPrice(offers[0]),15);
assert.ok(recommendationScore(offers[1],offers)>recommendationScore(offers[0],offers));
const breakdown=recommendationBreakdown(offers[1],offers);
assert.equal(breakdown.total,recommendationScore(offers[1],offers));
assert.ok(breakdown.weighted.compatibility>0);
assert.equal(rankOffers(offers,'cheapest')[0].total,15);
assert.equal(rankOffers(offers,'quality')[0].qualityScore,9);
assert.equal(rankOffers(offers,'fastest')[0].deliveryDays,1);

console.log('All core tests passed.');
