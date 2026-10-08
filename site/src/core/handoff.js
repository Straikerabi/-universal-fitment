import { cartPriceKnown, groupCartItems, quoteForPart } from '../data/miele-commerce.js';
import { marketplaceConditions, partSearchIdentity, searchLinksForPart } from './marketplaces.js';
import { cartQuantity } from './quantity.js';

export const handoffCapabilities=Object.freeze({
  mode:'merchant-links',paymentLocation:'merchant',automaticCartTransfer:false,createsOrder:false,acceptsPayment:false
});

export function safeHandoffUrl(value){
  try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:null;}catch{return null;}
}
const conditionLabel=value=>marketplaceConditions.find(([id])=>id===value)?.[1]||'Zustand noch prüfen';

function searchLinks(item,part){
  // A known catalog part is the authority; old links may carry another part's search text.
  if(part)return searchLinksForPart(part,item.requestedCondition||'used').map(({provider,name,url})=>({provider,name,url,kind:'search'}));
  const stored=Array.isArray(item.lookupLinks)?item.lookupLinks:[];
  const links=stored.flatMap(link=>{
    const url=safeHandoffUrl(link?.url);
    if(!url)return [];
    const parsed=new URL(url),host=link.provider==='ebay'?'www.ebay.de':link.provider==='amazon'?'www.amazon.de':null;
    const path=link.provider==='ebay'?'/sch/i.html':'/s';
    return host&&parsed.hostname===host&&parsed.pathname===path?[{provider:link.provider,name:link.provider==='ebay'?'eBay':'Amazon',url,kind:'search'}]:[];
  });
  if(links.length)return links;
  return searchLinksForPart(part,item.requestedCondition||'used').map(({provider,name,url})=>({provider,name,url,kind:'search'}));
}

export function buildHandoffPlan(items,{resolvePart=()=>null,now=Date.now()}={}){
  const records=(Array.isArray(items)?items:[]).filter(item=>item&&typeof item==='object'&&!Array.isArray(item)).map(item=>({...item,quantity:cartQuantity(item.quantity)}));
  const groups=groupCartItems(records,now).map(group=>({...group,lines:group.items.map(item=>{
    const part=resolvePart(item),identity=partSearchIdentity(part);
    const note=item.entryType==='marketplace-search';
    const source=note?null:safeHandoffUrl(item.sourceUrl);
    const reference=source||note?null:safeHandoffUrl(part?quoteForPart(part)?.sourceUrl||part.sourceUrl:null);
    const links=note?searchLinks(item,part):source?[{name:item.merchant||'Anbieter',url:source,kind:'product'}]:reference?[{name:'Teilequelle',url:reference,kind:'reference'}]:[];
    const kind=note?'marketplace-search':source?'product-page':reference?'part-reference':'unresolved';
    return {key:item.key||`${item.productId||''}:${item.partId||''}:${item.offerId||''}`,label:String(item.label||'Teil'),productLabel:String(item.productLabel||''),
      partId:item.partId,productId:item.productId,partNumber:identity?.code||String(item.partKey||'').split(':').at(-1)||null,
      partNumberLabel:identity?identity.codeType==='manufacturer-designation'?'Herstellerbezeichnung':'Teilenummer':'Teilekennung',
      quantity:item.quantity,kind,links,requestedCondition:note?conditionLabel(item.requestedCondition):null,
      unitLabel:!note&&item.unitLabel?String(item.unitLabel):null,
      priceKnown:!note&&cartPriceKnown(item,now),price:!note&&cartPriceKnown(item,now)?item.price:null,
      needsVariantCheck:item.fitmentStatus==='variant_check_required'||part?.fitment?.status==='variant_check_required',
      canTransferAutomatically:false,quantityTransferred:false,orderCreated:false,paymentAccepted:false};
  })}));
  const lines=groups.flatMap(group=>group.lines);
  return {...handoffCapabilities,groups,itemCount:lines.length,unitCount:lines.reduce((n,line)=>n+line.quantity,0),
    linkedCount:lines.filter(line=>line.links.length).length,searchCount:lines.filter(line=>line.kind==='marketplace-search').length,
    unresolvedCount:lines.filter(line=>!line.links.length).length,
    knownSubtotal:groups.reduce((sum,group)=>Math.round((sum+group.knownSubtotal)*100)/100,0),
    total:groups.length&&groups.every(group=>group.total!==null)?Math.round(groups.reduce((sum,group)=>sum+group.total,0)*100)/100:null};
}

export function handoffListText(plan){
  const text=['Universal Fitment · Einkaufsliste — kein Bestellauftrag','Bestellung und Zahlung beim jeweiligen Händler. Mengen wurden nicht übertragen.'];
  for(const group of plan.groups){
    text.push('',group.merchant);
    for(const line of group.lines){
      text.push(`${line.quantity} × ${line.label}`);
      if(line.productLabel)text.push(`Gerät: ${line.productLabel}`);
      if(line.partNumber)text.push(`${line.partNumberLabel||'Teilenummer'}: ${line.partNumber}`);
      if(line.unitLabel)text.push(`Verkaufseinheit: ${line.unitLabel}`);
      if(line.requestedCondition)text.push(`Gesucht: ${line.requestedCondition} — Zustand im Angebot prüfen`);
      if(line.needsVariantCheck)text.push('Ausführung und Anschlüsse vor Auswahl prüfen.');
      for(const link of line.links)text.push(`${link.name}${link.kind==='search'?' Suche':''}: ${link.url}`);
      if(!line.links.length)text.push('Anbieter/Angebot noch auswählen.');
      text.push('');
    }
  }
  return text.join('\n').trim();
}
