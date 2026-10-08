import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateVin, normalizeVin } from '../src/core/vehicle.js';
import { faqItems } from '../src/data/faq.js';
import { getJobGuidance } from '../src/data/job-guidance.js';

assert.equal(validateVin('WVWZZZ1JZXW000001').valid,true,'17-char VIN format should be accepted');
assert.equal(validateVin('SHORT').valid,false,'short VIN rejected');
assert.equal(normalizeVin('wvw zzz 1jz xw000001'),'WVWZZZ1JZXW000001');
assert.ok(faqItems.length>=10,'FAQ should cover core questions');
assert.ok(getJobGuidance('car-demo-1','car-oil-service').tools.length>=3,'oil-service tool list exists');
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
assert.match(app,/APP_VERSION = '1\.26\.8'/);
assert.match(app,/photoLibrary/,'explicit photo-library picker exists');
assert.match(app,/function cartPage/,'universal cart page exists');
assert.match(app,/function workshopPage/,'workshop finder exists');
assert.match(app,/function helpPage/,'FAQ page exists');
assert.match(app,/Reparaturbereitschaft/,'repair readiness is rendered');
console.log('All current feature checks passed.');
