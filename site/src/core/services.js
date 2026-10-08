// Local search links are suggestions, never verified repair partners.
export function repairSearchUrl({brand='',place=''}={}){
 const raw=String(place);if(/[<>\r\n]/.test(raw))return null;
 const location=raw.trim().replace(/\s+/g,' ');
 if(location.length<2||location.length>100||/[<>\r\n]/.test(location))return null;
 const maker=['Miele','Bosch','Dyson','AEG'].includes(brand)?brand:'';
 const query=[maker,'Staubsauger Reparatur Elektrogeräte Kundendienst',location].filter(Boolean).join(' ');
 return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(query);
}
export function repairRequestText(product,job,context){
 return [product?`Gerät: ${product.brand} ${product.model}`:'Gerät: bitte ergänzen',context&&product&&context.productId===product.id?`E-Nr.: ${context.eNumber}`:null,job?`Anliegen: ${job.label}`:'Fehlerbild: bitte ergänzen','Bitte bestätigen: Reparieren Sie diesen Staubsauger? Welche Prüfkosten, Versandkosten und voraussichtliche Dauer fallen an?','Falls eigene Ersatzteile mitgebracht werden: Bitte vorab Annahme, Einbau und Gewährleistung klären.'].filter(Boolean).join('\n');
}
