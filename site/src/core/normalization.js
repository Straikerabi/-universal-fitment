export function normalizeText(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function compactIdentifier(value = '') {
  return normalizeText(value).replace(/\s+/g, '');
}

export function normalizeGTIN(value = '') {
  const raw=String(value).trim();
  if(!/^[\d\s.-]+$/.test(raw))return null;
  const digits = raw.replace(/\D/g, '');
  if (![8, 12, 13, 14].includes(digits.length)) return null;
  return digits.padStart(14, '0');
}

export function isLikelyVIN(value = '') {
  const v = compactIdentifier(value);
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(v);
}

export function tokens(value = '') {
  return new Set(normalizeText(value).split(' ').filter(Boolean));
}
