import assert from 'node:assert/strict';
import { products } from '../src/data/demo-products.js';

for (const product of products) {
  const partIds=new Set(product.parts.map(part=>part.id));
  const stockIds=new Set((product.stockPlans||[]).map(plan=>plan.id));
  for (const job of product.jobs||[]) {
    assert.ok(job.id && job.label,`${product.id}: invalid job`);
    assert.ok(Array.isArray(job.items) && job.items.length,`${product.id}/${job.id}: job needs items`);
    if(job.mainPartId) assert.ok(partIds.has(job.mainPartId),`${product.id}/${job.id}: missing main part ${job.mainPartId}`);
    for(const item of job.items){
      if(item.partId) assert.ok(partIds.has(item.partId),`${product.id}/${job.id}: missing linked part ${item.partId}`);
      if(item.stockPlanId) assert.ok(stockIds.has(item.stockPlanId),`${product.id}/${job.id}: missing stock plan ${item.stockPlanId}`);
    }
  }
  for(const plan of product.stockPlans||[]){
    assert.ok(plan.defaultStock>=0,`${product.id}/${plan.id}: invalid stock`);
    assert.ok(plan.avgDaysPerUnit>0,`${product.id}/${plan.id}: invalid consumption rate`);
    assert.ok(plan.leadTimeMaxDays>=plan.leadTimeMinDays,`${product.id}/${plan.id}: invalid lead-time window`);
  }
}

const washer=products.find(p=>p.id==='wash-demo-1');
assert.ok(washer.jobs.some(j=>j.id==='wash-pump-change'));
assert.ok(washer.jobs.some(j=>j.id==='wash-care'));
const car=products.find(p=>p.id==='car-demo-1');
assert.ok(car.jobs.some(j=>j.id==='car-oil-service'));
assert.ok(car.jobs.some(j=>j.id==='car-drive-shaft'));
const bagVac=products.find(p=>p.id==='vac-bag-demo-1');
assert.ok(bagVac.stockPlans.some(p=>p.id==='vac-bags' && p.leadTimeMaxDays>=30));
console.log('All job-kit / smart-stock checks passed.');
