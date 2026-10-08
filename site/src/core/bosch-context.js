import {parseBoschENumber,boschServiceLink} from './bosch-identity.js';

// Only a normalized product E-Nr. is carried through this device workflow.
// Raw type-plate text, FD, serials, storage, backups and route URLs stay separate.
export function reviewedBoschENumber(review,product,{brandConfirmed=false}={}){
 if(product?.brand!=='Bosch'||review?.status!=='model_reference'||review.hasInvalidFields)return null;
 if(!review.suggestions?.some(p=>p.id===product.id))return null;
 if(review.needsBrandConfirmation&&!brandConfirmed)return null;
 const values=(review.entries||[]).filter(e=>e.kind==='enumber'&&!e.invalid&&e.matches?.includes(product.id))
  .map(e=>parseBoschENumber(e.value)).filter(e=>e?.index&&e.base===product.model);
 const unique=[...new Set(values.map(e=>e.full))];
 return unique.length===1?unique[0]:null;
}

export function createBoschContext(){
 let current=null;
 const clear=()=>{current=null;};
 const get=product=>current&&product?.brand==='Bosch'&&current.productId===product.id&&parseBoschENumber(current.eNumber)?.base===product.model?{...current,serviceLink:boschServiceLink(current.eNumber)}:null;
 const set=(product,value)=>{
  clear();
  const number=parseBoschENumber(value);
  if(product?.brand!=='Bosch'||!number?.index||number.base!==product.model)return null;
  current={productId:product.id,eNumber:number.full};
  return get(product);
 };
 const rememberReview=(review,product,options)=>set(product,reviewedBoschENumber(review,product,options));
 const retainForRoute=(route,param,catalog)=>{
  if(!current)return;
  const product=catalog.find(p=>p.id===current.productId),value=String(param||'');
  let keep=['product','parts','prices','marketplaces','passport','rentals','workshop'].includes(route)&&value===current.productId;
  const [id,child,...extra]=value.split(':');
  if(id===current.productId&&child&&!extra.length){
   if(route==='part')keep=[...(product?.parts||[]),...(product?.candidateParts||[])].some(p=>p.id===child);
   if(route==='workshop')keep=product?.jobs?.some(j=>j.id===child);
   if(route==='job')keep=product?.jobs?.some(j=>j.id===child);
   if(route==='stock')keep=product?.stockPlans?.some(s=>s.id===child);
   if(route==='issue')keep=product?.issues?.some(i=>i.id===child);
  }
  if(!keep||!get(product))clear();
 };
 return {get,set,clear,rememberReview,retainForRoute};
}

export function boschPartReviewText(product,part,context){
 if(product?.brand!=='Bosch'||context?.productId!==product.id)return null;
 const number=parseBoschENumber(context.eNumber);
 if(!number?.index||number.base!==product.model||![...(product.parts||[]),...(product.candidateParts||[])].some(p=>p.id===part?.id))return null;
 const labels={'material-number':'Material-Nr. des Teils','manufacturer-article':'Hersteller-Artikel-Nr.','supplier-article':'Anbieter-Artikel-Nr.','ean':'EAN des Teils'};
 return [`Gerät: Bosch ${number.full}`,`Teil: ${part.name}`,...(part.identifiers||[]).filter(i=>labels[i.type]).map(i=>`${labels[i.type]}: ${i.value}`),
  part.tier==='aftermarket'?'Nachbau laut Anbieter; keine Bosch-Freigabe.':null,
  'E-Nr.-Format geprüft. Geräteindex und Eignung dieses Teils beim Hersteller bzw. Anbieter noch prüfen.'].filter(Boolean).join('\n');
}
