// Merchant offer release guard for a future licensed CSV integration.
// No live provider account, tracking URL, image permission or offer is implied.
export function normalizedManufacturerCode(value) {
  // NO punctuation stripping, leading-zero removal or synthetic aliasing.
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}
export function normalizedBrand(value) {
  return typeof value === 'string' ? value.trim().toLocaleLowerCase('de-DE') : '';
}
function validMerchantLink(value, hosts) {
  if (typeof value !== 'string' || !Array.isArray(hosts) || hosts.length === 0) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return false;
    return hosts.some(host => typeof host === 'string' && host.toLowerCase() === url.hostname.toLowerCase());
  } catch {
    return false;
  }
}
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function assessMerchantOffer({registry, merchantId, catalogPart, offer, nowMs = Date.now()}) {
  const problems = [];
  if (!registry || registry.liveAffiliateOffersEnabled !== true) problems.push('partner_release_disabled');
  const merchant = registry?.merchants?.find(item => item.id === merchantId);
  if (!merchant) problems.push('unknown_merchant');
  if (merchant?.approvalStatus !== 'approved') problems.push('partner_approval_missing');
  if (merchant?.feedAccessStatus !== 'granted') problems.push('authorized_feed_missing');
  if (merchant?.commercialRightsVerified !== true) problems.push('commercial_rights_not_verified');

  if (catalogPart?.hasVerifiedDeviceFitment !== true ||
      typeof catalogPart?.deviceModelId !== 'string' || !catalogPart.deviceModelId.trim() ||
      !normalizedManufacturerCode(catalogPart?.oemPartNumber) ||
      !normalizedBrand(catalogPart?.brand) ||
      typeof catalogPart?.manufacturerEvidenceUrl !== 'string' ||
      !catalogPart.manufacturerEvidenceUrl.startsWith('https://')) {
    problems.push('catalog_fitment_not_evidenced');
  }
  if (offer?.oemFieldEvidence !== 'merchant_feed_explicit_oem_number') problems.push('merchant_oem_field_unverified');
  if (!normalizedBrand(offer?.brand) || normalizedBrand(offer?.brand) !== normalizedBrand(catalogPart?.brand) ||
      !normalizedManufacturerCode(offer?.oemPartNumber) ||
      normalizedManufacturerCode(offer?.oemPartNumber) !== normalizedManufacturerCode(catalogPart?.oemPartNumber)) {
    problems.push('no_exact_brand_oem_match');
  }
  if (typeof offer?.merchantProductId !== 'string' || !offer.merchantProductId.trim()) {
    problems.push('merchant_product_id_missing');
  }
  if (offer?.available !== true) problems.push('availability_unverified');
  if (!Number.isInteger(offer?.priceGrossCents) || offer.priceGrossCents < 0 ||
      offer?.currency !== 'EUR') problems.push('price_unverified');
  if (offer?.shippingGrossCents !== null &&
      (!Number.isInteger(offer?.shippingGrossCents) || offer.shippingGrossCents < 0)) {
    problems.push('shipping_unverified');
  }
  const snapshot = Date.parse(offer?.verifiedAt ?? '');
  if (!Number.isFinite(snapshot) || !Number.isFinite(nowMs) || snapshot > nowMs ||
      nowMs - snapshot > MAX_AGE_MS) problems.push('stale_offer');
  if (!validMerchantLink(offer?.productUrl, merchant?.storeHostsVerified)) problems.push('merchant_url_not_verified');

  return {publishable: problems.length === 0, reasons: [...new Set(problems)]};
}
// Used only for UI decisions in a future importer; this module does not build
// affiliate URLs, automatically publish offers or fetch merchant websites.
