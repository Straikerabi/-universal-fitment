const clamp01 = x => Math.max(0, Math.min(1, Number(x) || 0));

export function totalPrice(offer) {
  return (Number(offer.price) || 0) + (Number(offer.shipping) || 0);
}

function priceValue(offer, offers) {
  const totals = offers.map(totalPrice).filter(Number.isFinite);
  if (!totals.length) return 0.5;
  const min = Math.min(...totals), max = Math.max(...totals);
  if (max === min) return 1;
  return 1 - ((totalPrice(offer) - min) / (max - min));
}

export function recommendationBreakdown(offer, offers = [offer]) {
  const components = {
    compatibility: clamp01(offer.compatibilityConfidence ?? 0.5),
    quality: clamp01((offer.qualityScore ?? 5) / 10),
    reviews: clamp01((offer.reviewTrust ?? 5) / 10),
    seller: clamp01((offer.sellerScore ?? 5) / 10),
    returns: clamp01((offer.returnsScore ?? 5) / 10),
    value: clamp01(priceValue(offer, offers))
  };
  const weighted = {
    compatibility: components.compatibility * 35,
    quality: components.quality * 20,
    reviews: components.reviews * 15,
    seller: components.seller * 10,
    returns: components.returns * 10,
    value: components.value * 10
  };
  return { components, weighted, total: Math.round(Object.values(weighted).reduce((a,b)=>a+b,0)) };
}

export function recommendationScore(offer, offers = [offer]) {
  return recommendationBreakdown(offer, offers).total;
}

export function rankOffers(offers, mode = 'recommended') {
  const copy = offers.map(o => ({ ...o, total: totalPrice(o), recommendation: recommendationScore(o, offers) }));
  if (mode === 'cheapest') return copy.sort((a,b) => a.total - b.total);
  if (mode === 'quality') return copy.sort((a,b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0) || a.total - b.total);
  if (mode === 'value') return copy.sort((a,b) => ((b.qualityScore ?? 0)/(b.total || 1)) - ((a.qualityScore ?? 0)/(a.total || 1)));
  if (mode === 'fastest') return copy.sort((a,b) => (a.deliveryDays ?? 999) - (b.deliveryDays ?? 999) || a.total - b.total);
  return copy.sort((a,b) => b.recommendation - a.recommendation || a.total - b.total);
}
