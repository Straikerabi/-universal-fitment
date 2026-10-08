import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assessMerchantOffer,normalizedManufacturerCode} from './offer-gate.mjs';

const registry = JSON.parse(fs.readFileSync(new URL('./merchant-candidates.json',import.meta.url),'utf8'));
const basePart = {
  deviceModelId:'MODEL-SYNTHETIC-01',
  brand:'Miele',
  oemPartNumber:'0123/45-B',
  manufacturerEvidenceUrl:'https://manufacturer.example.test/part',
  hasVerifiedDeviceFitment:true
};
const baseOffer = {
  merchantProductId:'TEST-SKU-001',
  brand:'Miele',
  oemPartNumber:'0123/45-B',
  oemFieldEvidence:'merchant_feed_explicit_oem_number',
  available:true,
  currency:'EUR',
  priceGrossCents:2599,
  shippingGrossCents:null,
  verifiedAt:'2026-10-08T13:00:00.000Z',
  productUrl:'https://shop.example.test/oem-0123'
};
const nowMs=Date.parse('2026-10-08T14:00:00.000Z');
const check=(s,p=basePart,o=baseOffer,m='staubsaugermanufaktur')=>assessMerchantOffer({registry:s,catalogPart:p,offer:o,merchantId:m,nowMs});
const clone = value => structuredClone(value);
const findReason=(result, reason)=>assert(result.reasons.includes(reason),JSON.stringify(result));
let count=0;

assert.equal(registry.liveAffiliateOffersEnabled,false);
assert.equal(registry.merchants.length,3);
for (const merchant of registry.merchants) {
  assert.equal(merchant.approvalStatus,'not_applied');
  assert.equal(merchant.feedAccessStatus,'not_granted');
  assert.equal(merchant.commercialRightsVerified,false);
  assert.deepEqual(merchant.storeHostsVerified,[]);
  assert(merchant.programUrl.startsWith('https://www.adcell.de/partnerprogramme/'));
} count++;

findReason(check(registry),'partner_release_disabled');count++;
findReason(check(registry),'partner_approval_missing');count++;
findReason(check(registry),'authorized_feed_missing');count++;
findReason(check(registry),'commercial_rights_not_verified');count++;
findReason(check(registry),'merchant_url_not_verified');count++;

const approved=clone(registry);
approved.liveAffiliateOffersEnabled=true;
approved.merchants[0].approvalStatus='approved';
approved.merchants[0].feedAccessStatus='granted';
approved.merchants[0].commercialRightsVerified=true;
approved.merchants[0].storeHostsVerified=['shop.example.test'];
assert.equal(check(approved).publishable,true);count++;

findReason(check(approved,basePart,{...baseOffer,oemPartNumber:'012345-B'}),'no_exact_brand_oem_match');count++;
findReason(check(approved,basePart,{...baseOffer,oemPartNumber:'123/45-B'}),'no_exact_brand_oem_match');count++;
findReason(check(approved,basePart,{...baseOffer,brand:'Bosch'}),'no_exact_brand_oem_match');count++;
findReason(check(approved,{...basePart,hasVerifiedDeviceFitment:false}),'catalog_fitment_not_evidenced');count++;
findReason(check(approved,basePart,{...baseOffer,oemFieldEvidence:'seller_sku_only'}),'merchant_oem_field_unverified');count++;
findReason(check(approved,basePart,{...baseOffer,verifiedAt:'2026-10-06T00:00:00Z'}),'stale_offer');count++;
findReason(check(approved,basePart,{...baseOffer,verifiedAt:'2026-10-09T00:00:00Z'}),'stale_offer');count++;
findReason(check(approved,basePart,{...baseOffer,available:null}),'availability_unverified');count++;
findReason(check(approved,basePart,{...baseOffer,productUrl:'http://shop.example.test/oem-0123'}),'merchant_url_not_verified');count++;
findReason(check(approved,basePart,{...baseOffer,productUrl:'https://shop.example.test.attacker.test/foo'}),'merchant_url_not_verified');count++;
findReason(check(approved,basePart,{...baseOffer,productUrl:'https://attacker.test@shop.example.test/foo'}),'merchant_url_not_verified');count++;
findReason(check(approved,basePart,{...baseOffer,priceGrossCents:NaN}),'price_unverified');count++;
findReason(check(approved,basePart,{...baseOffer,shippingGrossCents:undefined}),'shipping_unverified');count++;
assert.equal(normalizedManufacturerCode(' 0123/45-B '),'0123/45-B');count++;

console.log(`PASS: ${count} specialist-affiliate evidence and negative tests. No live provider access was used.`);
