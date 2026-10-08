import assert from 'node:assert/strict';
import { classifyIdentifier, isValidGTIN, extractTypePlateIdentity } from '../src/core/identifiers.js';
import { resolveProductQuery } from '../src/data/product-resolver.js';

assert.equal(isValidGTIN('4002515488492'),true);
assert.equal(isValidGTIN('1234567890123'),false);
assert.equal(classifyIdentifier('20D14W81E04831820UB').kind,'manufacturer-code');
assert.equal(classifyIdentifier('ECAM290.89.SBX').kind,'model');
assert.equal(classifyIdentifier('4002515488492').kind,'gtin');
let calls=0;
const result=await resolveProductQuery([], '20D14W81E04831820UB', {fetchFn:async()=>{calls++;throw new Error('should not fetch');}});
assert.equal(result.externalStatus,'needs-model');
assert.equal(calls,0);
console.log('All identifier-classification checks passed.');

const plate=extractTypePlateIdentity(['KRUPS','TYPE KP310','REF:KP310510/7Z0 - 5120']);
assert.equal(plate.brand,'KRUPS');
assert.equal(plate.type,'KP310');
assert.equal(plate.reference,'KP310510/7Z0');
assert.equal(plate.primary,'KP310510/7Z0');
