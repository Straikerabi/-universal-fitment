// Bosch model references identify the catalog model; /xx is a separate device index.
// No index or FD/serial value is invented or treated as verified parts fitment.
export const boschSupportUrls={
 parts:'https://www.bosch-home.com/de/produkte/ersatzteile',
 manuals:'https://www.bosch-home.com/de/service/hilfe-und-unterstuetzung/gebrauchsanleitungen'
};
export function parseBoschENumber(value){
 const text=String(value??'').trim().toUpperCase().replace(/\s+/g,'');
 const match=text.match(/^(B(?:G[BCDLS]|CH|HH|BS|CS|SS|KS|TS|DS)[A-Z0-9]{2,12})(?:\/(\d{2}))?$/);
 return match?{base:match[1],index:match[2]||null,full:match[1]+(match[2]?`/${match[2]}`:'')}:null;
}
export function boschServiceLink(value){
 const e=parseBoschENumber(value);
 return e?.index?{label:`Bosch Service für ${e.full}`,url:`https://www.bosch-home.com/de/de/productservice/${e.base}-${e.index}`,eNumber:e.full}:null;
}
