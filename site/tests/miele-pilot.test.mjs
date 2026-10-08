import assert from 'node:assert/strict';
import { categories, products, scenarios } from '../src/data/catalog.js';

assert.equal(categories.length,1);
assert.equal(categories[0].id,'vacuum');
assert.ok(products.length>=9,'Miele pilot should cover core current/legacy families');
assert.ok(products.every(p=>p.category==='vacuum'),'only vacuum category may be exposed');
assert.ok(products.every(p=>['Miele','Bosch','Dyson','AEG','Rowenta','Philips','Siemens','Samsung','Hoover','Vorwerk'].includes(p.brand)),'only supported vacuum brands may be exposed');
assert.ok(products.every(p=>p.dataStatus==='manufacturer-verified'),'pilot catalog should be manufacturer verified');
const byModel=Object.fromEntries(products.map(p=>[p.model,p]));
assert.equal(byModel['Complete C3'].vacuumMeta.bagSystem,'GN');
assert.equal(byModel['Complete C1'].vacuumMeta.bagSystem,'FJM');
assert.equal(byModel['Guard L1'].vacuumMeta.bagSystem,'TU');
assert.equal(byModel['Guard M1'].vacuumMeta.bagSystem,'CO');
assert.ok(byModel['Complete C3'].parts.some(p=>p.identifiers?.some(i=>i.value==='12421170')));
assert.ok(byModel['Guard M1'].parts.some(p=>p.identifiers?.some(i=>i.value==='12557080')));
assert.ok(scenarios.length>=4);
console.log('All Miele pilot checks passed.');
