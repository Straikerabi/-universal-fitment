import assert from 'node:assert/strict';
import { categories, demoScenarios, products } from '../src/data/demo-products.js';

assert.ok(categories.length >= 4);
assert.equal(new Set(categories.map(c=>c.id)).size,categories.length,'category IDs must be unique');
assert.equal(new Set(products.map(p=>p.id)).size,products.length,'product IDs must be unique');

const allPartIds=[];
const allIssueIds=[];
for(const product of products){
  assert.ok(categories.some(c=>c.id===product.category),`unknown category on ${product.id}`);
  assert.ok(product.brand && product.model,`missing product identity on ${product.id}`);
  assert.ok(Array.isArray(product.identifiers) && product.identifiers.length,`missing identifiers on ${product.id}`);
  assert.ok(Array.isArray(product.parts),`parts must be an array on ${product.id}`);
  assert.ok(product.parts.length || (product.jobs||[]).length || (product.stockPlans||[]).length,`product ${product.id} needs parts, jobs or stock plans`);
  assert.ok(Array.isArray(product.issues),`issues must be an array on ${product.id}`);
  for(const part of product.parts){
    allPartIds.push(`${product.id}:${part.id}`);
    assert.ok(part.fitment && part.fitment.confidence >= 0 && part.fitment.confidence <= 1,`bad confidence on ${part.id}`);
    assert.ok(Array.isArray(part.fitment.evidence) && part.fitment.evidence.length,`missing evidence on ${part.id}`);
    assert.ok(Array.isArray(part.offers) && part.offers.length,`missing offers on ${part.id}`);
    for(const evidence of part.fitment.evidence){
      assert.ok(['A','B','C'].includes(evidence.grade),`bad evidence grade on ${part.id}`);
    }
    for(const offer of part.offers){
      assert.ok(Number.isFinite(offer.price) && offer.price >= 0,`bad price on ${part.id}`);
      assert.ok(Number.isFinite(offer.shipping) && offer.shipping >= 0,`bad shipping on ${part.id}`);
      assert.ok(offer.compatibilityConfidence >= 0 && offer.compatibilityConfidence <= 1,`bad offer fitment on ${part.id}`);
    }
  }
  for(const issue of product.issues){
    allIssueIds.push(`${product.id}:${issue.id}`);
    assert.ok(issue.label && issue.summary,`bad issue on ${product.id}`);
    assert.ok(issue.confidence>=0 && issue.confidence<=1,`bad issue confidence on ${issue.id}`);
    assert.ok(Array.isArray(issue.steps) && issue.steps.length,`missing issue steps on ${issue.id}`);
    for(const linked of issue.linkedPartIds || []) assert.ok(product.parts.some(p=>p.id===linked),`issue ${issue.id} references missing part ${linked}`);
  }
}
assert.equal(new Set(allPartIds).size,allPartIds.length,'part IDs must be unique inside product namespace');
assert.equal(new Set(allIssueIds).size,allIssueIds.length,'issue IDs must be unique inside product namespace');
for(const scenario of demoScenarios){
  assert.ok(products.some(p=>p.id===scenario.productId),`scenario target missing: ${scenario.productId}`);
}
console.log('All demo data invariants passed.');
