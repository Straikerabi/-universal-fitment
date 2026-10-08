import { compactIdentifier, normalizeGTIN, normalizeText, tokens } from './normalization.js';
import {parseBoschENumber} from './bosch-identity.js';

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const x of a) if (b.has(x)) intersection++;
  return intersection / (a.size + b.size - intersection);
}

export function scoreProduct(product, query) {
  const raw = String(query || '').trim();
  if (!raw) return 0;
  const qNorm = normalizeText(raw);
  const qCompact = compactIdentifier(raw);
  const qGTIN = normalizeGTIN(raw);
  let score = 0;
  const eNumber=parseBoschENumber(raw);
  if(eNumber&&product.brand==='Bosch'&&product.model===eNumber.base)score=eNumber.index?94:100;

  for (const id of product.identifiers || []) {
    const idCompact = compactIdentifier(id.value);
    const accessoryId=id.type.startsWith('bag-')||id.type==='bag-system';
    const exactScore=accessoryId?76:id.type==='model-family'?92:100;
    if (qCompact && qCompact === idCompact) score = Math.max(score, exactScore);
    const idGTIN = ['gtin','ean','upc'].includes(id.type) ? normalizeGTIN(id.value) : null;
    if (qGTIN && idGTIN && qGTIN === idGTIN) score = Math.max(score, exactScore);
  }

  const model = normalizeText(product.model);
  const brand = normalizeText(product.brand);
  const haystack = normalizeText([product.brand, product.model, product.type, ...(product.aliases || [])].join(' '));
  if (qNorm === model || qNorm === `${brand} ${model}`) score = Math.max(score, 96);
  if (qNorm.length >= 4 && haystack.includes(qNorm)) score = Math.max(score, 88);
  if (qNorm.length >= 4 && (product.accessoryAliases||[]).some(alias=>normalizeText(alias).includes(qNorm))) score = Math.max(score, 76);

  const sim = jaccard(tokens(qNorm), tokens(haystack));
  if (sim >= 0.75) score = Math.max(score, 84);
  else if (sim >= 0.5) score = Math.max(score, 72);
  else if (sim >= 0.3) score = Math.max(score, 58);

  return Math.round(score);
}

export function matchProducts(products, query, { minScore = 40, limit = 8 } = {}) {
  return products
    .map(product => ({ product, score: scoreProduct(product, query) }))
    .filter(x => x.score >= minScore)
    .sort((a, b) => b.score - a.score || `${a.product.brand} ${a.product.model}`.localeCompare(`${b.product.brand} ${b.product.model}`))
    .slice(0, limit);
}

// Search scores rank candidates; they are not calibrated probabilities of identity or fitment.
export function matchReason(product,query=''){
  const eNumber=parseBoschENumber(query);
  if(eNumber&&product.brand==='Bosch'&&product.model===eNumber.base)return 'Bosch-Modellreferenz · E-Nr.-Index prüfen';
  const q=compactIdentifier(query),gtin=normalizeGTIN(query);
  const identifiers=product.identifiers||[];
  const exact=identifiers.find(id=>q&&q===compactIdentifier(id.value)||gtin&&['ean','gtin','upc'].includes(id.type)&&gtin===normalizeGTIN(id.value));
  if(exact){
    if(exact.type.startsWith('bag-')||exact.type==='bag-system')return 'Zubehörkennung · Gerät prüfen';
    if(exact.type==='material-number')return 'Geräte-Materialnummer stimmt überein';
    if(['ean','gtin','upc'].includes(exact.type))return 'Geräte-EAN stimmt überein';
    if(exact.type==='product-type')return 'Gerätetyp stimmt überein · Variante prüfen';
    if(exact.type==='pnc')return 'AEG PNC in der Modellquelle · Ausführung prüfen';
    if(exact.type==='device-sku')return 'Dyson-Produktnummer in der Quelle · Generation prüfen';
    if(exact.type==='model-family')return 'Gerätefamilie stimmt überein';
    return 'Katalogkennung stimmt überein';
  }
  if(q&&q===compactIdentifier(product.model))return product.recordType==='family'?'Gerätefamilie stimmt überein':'Modellname stimmt überein · Variante prüfen';
  if(q&&(product.accessoryAliases||[]).some(value=>q===compactIdentifier(value)))return 'Zubehörkennung · Gerät prüfen';
  return 'Ähnlicher Suchtreffer · am Gerät prüfen';
}
