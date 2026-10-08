import { mielePriceRecords } from './miele-commerce-records.js';
import { partIdentity } from './miele-parts.js';
import { cartQuantity } from '../core/quantity.js';

export const shippingPolicies={
 'vorwerk-de':{merchant:'Vorwerk Kobold',market:'DE',currency:'EUR',fee:5,freeFrom:39,checkedAt:'2026-10-07',sourceUrl:'https://www.vorwerk.com/de/de/s/shop/kobold-mf7-motorschutzfilter-de',summary:'Vorwerk-Shop: Versand innerhalb Deutschlands, unter 39 € Bestellwert 5 €, ab 39 € kostenfrei. Aktuelle Bedingungen im Shop prüfen.',deliveryNote:'Die erfassten Artikel nennen 3–5 oder 5–7 Werktage. Bestellbarkeit und den konkreten Liefertermin auf der Artikelseite prüfen.'},
 'philips-home-de':{merchant:'Philips Home / Versuni',market:'DE',currency:'EUR',fee:null,freeFrom:20,checkedAt:'2026-10-07',sourceUrl:'https://www.home-appliances.philips/de/de/p/FC8003_01',summary:'Die erfasste Philips-Home-Artikelseite nennt kostenlosen Versand ab 20 € Bestellwert. Versandkosten darunter sind noch offen; aktuelle Shopbedingungen prüfen.',deliveryNote:'Die erfassten Philips-Home-Artikelquellen nennen je nach Artikel 2–3 oder 5–7 Werktage. Lagerbestand und den konkreten Liefertermin im Shop prüfen.'},
 'siemens-de':{merchant:'Siemens',market:'DE',currency:'EUR',fee:null,feeBands:[{through:19.99,fee:4.70},{through:49.99,fee:5.95}],freeFrom:50,checkedAt:'2026-10-07',sourceUrl:'https://www.siemens-home.bsh-group.com/de/produkte/versandkosten',summary:'Siemens-Endkunden-Shop: bis 19,99 € Warenwert 4,70 €, von 20,00 € bis 49,99 € 5,95 €, ab 50,00 € kostenfrei.',deliveryNote:'Aktuelle Bestellbarkeit und Liefertermin auf der Artikelseite und im Hersteller-Warenkorb prüfen.'},
 'rowenta-parts-de':{merchant:'Rowenta Zubehör',market:'DE',currency:'EUR',fee:null,freeFrom:30,checkedAt:'2026-10-07',sourceUrl:'https://www.rowenta.de/Zubeh%C3%B6r-Shop/schaumstofffilter-ss-2230002948/a/2230002948',summary:'Die erfassten Rowenta-Zubehörseiten nennen kostenlosen Versand ab 30 €. Der Betrag darunter ist hier noch offen.',deliveryNote:'Die Artikelquelle nennt 2–3 Werktage. Aktuelle Verfügbarkeit und Liefertermin im Shop prüfen.',extra:'Rowenta Shop und Rowenta Zubehör werden getrennt beliefert; laut Hersteller sind Artikel aus beiden Lagern nicht in einer Bestellung kombinierbar.'},
 'rowenta-shop-de':{merchant:'Rowenta Shop',market:'DE',currency:'EUR',fee:null,freeFrom:null,checkedAt:'2026-10-07',sourceUrl:'https://www.rowenta.de/Zubeh%C3%B6r-Shop/beutel-mit-effizienter-filterung-x4-zr200520/a/1600005060',summary:'Versandbetrag und Freigrenze für Rowenta Shop im Händler-Warenkorb prüfen. Die erfasste Seite nennt unterschiedliche Freigrenzen; hier wird kein Gesamtversand zugesagt.',deliveryNote:'Aktuelle Bestellbarkeit und Liefertermin beim Verkäufer prüfen.',extra:'Rowenta Shop und Rowenta Zubehör sind laut Hersteller getrennte Lager und lassen sich nicht in einer gemeinsamen Bestellung kombinieren.'},
 'rowenta-seller-unresolved-de':{merchant:'Rowenta · Verkäufer noch offen',market:'DE',currency:'EUR',fee:null,freeFrom:null,checkedAt:'2026-10-07',sourceUrl:'https://www.rowenta.de/Zubeh%C3%B6r-Shop/Staubsauger/csc/FloorCare',summary:'Für Quellen ohne eindeutigen Verkäufer bleiben Versandkosten und Freigrenze offen. Verkäufer und Versand im Hersteller-Shop prüfen.',deliveryNote:'Kein aktueller Lagerbestand oder Liefertermin bestätigt.'},
  'dyson-de':{merchant:'Dyson',market:'DE',currency:'EUR',fee:6,freeFrom:49,checkedAt:'2026-10-06',sourceUrl:'https://www.dyson.de/support/journey/spare-details.972204-01',summary:'Dyson-Zubehör und Ersatzteile: unter 49 € Warenwert 6 € Standardversand, ab 49 € kostenfrei.',deliveryNote:'Dyson nennt für Zubehör und Ersatzteile 5–7 Werktage. Die konkrete Bestellbarkeit und den Liefertermin im Shop prüfen.'},
  'aeg-de':{merchant:'AEG Ersatzteile-Shop',market:'DE',currency:'EUR',fee:5.99,freeFrom:null,checkedAt:'2026-10-06',sourceUrl:'https://shop.aeg.de/delivery',summary:'AEG Ersatzteile-Shop: 5,99 € je Bestellung; Versand nur innerhalb Deutschlands. Abweichende Angebote und aktuellen Shopstand prüfen.',deliveryNote:'Bei ausreichendem Lagerbestand nennt AEG 1–3 Werktage ab Bestellung. Lieferung über GLS; DHL-Packstationen werden laut Anbieter nicht beliefert.'},
  'bosch-de':{merchant:'Bosch',market:'DE',currency:'EUR',fee:null,feeBands:[{through:19.99,fee:4.70},{through:49.99,fee:5.95}],freeFrom:50,checkedAt:'2026-10-06',sourceUrl:'https://www.bosch-home.com/de/produkte/versandkosten',summary:'Bosch-Endkunden-Shop: bis 19,99 € Warenwert 4,70 €, von 20,00 € bis 49,99 € 5,95 €, ab 50,00 € kostenfrei.',deliveryNote:'Die genaue Ankunftszeit hängt vom Artikel und der Bestellung ab; „auf Lager“ ist kein Liefertermin.'},
  'miele-de':{merchant:'Miele Online-Shop',market:'DE',currency:'EUR',fee:6.50,freeFrom:49,checkedAt:'2026-10-06',sourceUrl:'https://www.miele.de/cs/service/faq-lieferung-193482',summary:'DHL innerhalb Deutschlands: 6,50 € unter 49 € Warenwert, ab 49 € versandkostenfrei.',deliveryNote:'Verfügbare Artikel laut Miele meist in ca. 1–3 Werktagen; die konkrete Produktseite kann eine andere Spanne nennen. Bei Vorkasse erfolgt die Lieferung erst nach Zahlungseingang.'},
  'electropapa-free-de':{merchant:'Electropapa',market:'DE',currency:'EUR',fee:0,freeFrom:null,checkedAt:'2026-10-06',sourceUrl:'https://electropapa.com/de/versand',summary:'Die erfassten deutschen Produktseiten nennen kostenfreien Versand nach DE. Versandart im Shop auswählen.',deliveryNote:'„Versand innerhalb von 24 h“ beschreibt den Versandstart; eine genaue Ankunftszeit ist auf den erfassten Seiten nicht angegeben.',extra:'Versandübersicht: Post kostenfrei; DHL ab 1,90 €, ab 25 € Warenwert kostenfrei; Express ab 9,90 €.'},
  'mueller-de':{merchant:'Müller',market:'DE',currency:'EUR',fee:3.95,freeFrom:49,checkedAt:'2026-10-06',sourceUrl:'https://www.mueller.de/service/lieferung-retoure/',summary:'Standardlieferung nach Hause: 3,95 € unter 49 € Warenwert, ab 49 € kostenfrei. Filialabholung kostenfrei.',deliveryNote:'Für den erfassten Swirl-Beutel ist keine bestellbare Lieferung bestätigt.'},
  'reinigungsberater-de':{merchant:'Reinigungsberater · Geschäftskunden',market:'DE',currency:'EUR',fee:null,freeFrom:null,checkedAt:'2026-10-06',sourceUrl:'https://www.reinigungsberater.de/service/versandkosten',summary:'6,95 € inkl. MwSt. je Paket bis 23 kg; ausgewählte Kleinpakete 3,95 €. Unter 35,70 € Bruttobestellwert zusätzlich 4,76 € Verpackungspauschale.',deliveryNote:'Paketanzahl und Kleinpaket-Eignung werden im Shop bestimmt; deshalb hier kein fester Gesamtversand.',extra:'Deutsche Inseln: zusätzlich 14,28 € inkl. MwSt. je nach Lieferadresse.'}
};

const quotes=new Map(mielePriceRecords.map(q=>[q.partKey,q]));
export const quoteForPart=part=>quotes.get(partIdentity(part))||part.sourceQuote||null;
export const isAmount=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0;
export const roundMoney=value=>Math.round((value+Number.EPSILON)*100)/100;

export function quoteStatus(quote,now=Date.now()){
  const stamp=Date.parse(quote?.checkedAt||'');
  const age=Number(now)-stamp;
  if(!Number.isFinite(stamp)||!Number.isFinite(age))return 'unknown';
  if(age < -300000)return 'future';
  if(quote?.sourceAgeNote)return 'reference';
  return age<=86400000?'fresh':'stale';
}
export function quoteFresh(quote,now=Date.now()){return quoteStatus(quote,now)==='fresh';}
export function comparableQuote(quote){
  return !!quote&&isAmount(quote.price)&&quote.currency==='EUR'&&quote.vatIncluded===true&&quote.priceBasis==='unit'&&quote.market==='DE';
}
export function canSelectQuote(quote,now=Date.now()){
  return comparableQuote(quote)&&quote.stock==='available'&&quoteFresh(quote,now);
}
export function shippingCost(ruleId,subtotal){
  const rule=shippingPolicies[ruleId];
  if(!rule||!isAmount(subtotal))return null;
  const cents=Math.round(subtotal*100);
  if(isAmount(rule.freeFrom)&&cents>=Math.round(rule.freeFrom*100))return 0;
  if(rule.feeBands){const band=rule.feeBands.find(b=>cents<=Math.round(b.through*100));return isAmount(band?.fee)?band.fee:null;}
  return isAmount(rule.fee)?rule.fee:null;
}
export function singleQuoteTotal(quote){
  if(!comparableQuote(quote)||quote.stock!=='available')return null;
  const shipping=shippingCost(quote.shippingRuleId,quote.price);
  return shipping===null?null:roundMoney(quote.price+shipping);
}

export function cartQuoteItem(part,product,now=Date.now()){
  const mapped=product?.parts?.find(p=>p.id===part?.id&&partIdentity(p)===partIdentity(part));
  if(!mapped)return null;
  const quote=quoteForPart(part);
  if(!mapped||part.fitment?.status==='variant_check_required'||!['manufacturer_listed','manufacturer_family_listed','manufacturer_verified','supplier_listed'].includes(mapped.fitment?.status)||!canSelectQuote(quote,now))return null;
  return {productId:product.id,partId:part.id,partKey:partIdentity(part),label:part.name,productLabel:`${product.brand} ${product.model}`,
    fitment:mapped.fitment.confidence,fitmentStatus:mapped.fitment.status,merchantId:quote.merchantId,merchant:quote.merchant,
    offerId:`source:${quote.partKey}:${quote.merchantId}`,sourceUrl:quote.sourceUrl,price:quote.price,currency:quote.currency,
    vatIncluded:quote.vatIncluded,priceBasis:quote.priceBasis,market:quote.market,unitLabel:quote.unitLabel,
    shippingRuleId:quote.shippingRuleId,checkedAt:quote.checkedAt,stock:quote.stock,availabilityText:quote.availabilityText,delivery:quote.delivery};
}
export function cartPriceKnown(item,now=Date.now()){
  return item?.entryType!=='marketplace-search'&&!['offer_check_required','variant_check_required'].includes(item?.fitmentStatus)&&item?.testData!==true&&(!item?.dataMode||item.dataMode==='live')&&canSelectQuote(item,now);
}
export function groupCartItems(items,now=Date.now()){
  const groups=new Map();
  for(const item of Array.isArray(items)?items:[]){
    if(!item||typeof item!=='object'||Array.isArray(item))continue;
    const marketplace=['ebay','amazon'].includes(item.provider);
    const id=marketplace?`${item.provider}:${item.sellerId||`unresolved:${item.key||item.offerId||groups.size}`}`:item.merchantId||item.merchant||'unselected';
    if(!groups.has(id))groups.set(id,{merchant:item.merchant||'Noch kein Händler gewählt',merchantId:item.merchantId||null,items:[],knownSubtotal:0,unknownPriceCount:0,shippingKnown:false,shipping:null,total:null});
    const group=groups.get(id);group.items.push(item);
    if(cartPriceKnown(item,now))group.knownSubtotal=roundMoney(group.knownSubtotal+item.price*cartQuantity(item.quantity));
    else group.unknownPriceCount++;
  }
  for(const group of groups.values()){
    const rules=new Set(group.items.map(item=>item.shippingRuleId));
    if(!group.unknownPriceCount&&rules.size===1&&[...rules][0])group.shipping=shippingCost([...rules][0],group.knownSubtotal);
    group.shippingKnown=group.shipping!==null;
    if(!group.unknownPriceCount&&group.shippingKnown)group.total=roundMoney(group.knownSubtotal+group.shipping);
  }
  return [...groups.values()];
}

export function sortCommerceParts(parts,sort='name',timeForPart=()=>null,now=Date.now()){
  const recordedPrice=sort==='recorded-price'||sort==='recorded-price-desc';
  const descending=sort==='recorded-price-desc'||sort==='name-desc';
  const value=part=>{
    if(sort==='time')return timeForPart(part)?.minMinutes??Infinity;
    const quote=quoteForPart(part);
    // A recorded price can be sorted without becoming a current purchasable offer.
    if(recordedPrice)return comparableQuote(quote)?quote.price:Infinity;
    if(!canSelectQuote(quote,now))return Infinity;
    return sort==='total'?(singleQuoteTotal(quote)??Infinity):quote.price;
  };
  return [...parts].sort((a,b)=>{
    if(sort!=='name'&&sort!=='name-desc'){
      const av=value(a),bv=value(b);
      if(av!==bv){
        if(av===Infinity)return 1;
        if(bv===Infinity)return -1;
        return (av<bv?-1:1)*(descending?-1:1);
      }
    }
    return a.name.localeCompare(b.name,'de')*(sort==='name-desc'?-1:1);
  });
}
