// Optional, read-only RDAP status snapshot. Does not authorize acquisition or mark clearance.
// Every request has a finite timeout. 404 = not registered AT CHECK, not a right-to-use.
import {read,validate} from './validate.mjs';
const doc=read();
if(validate(doc).length)throw new Error('Fail-closed: manifest invalid before RDAP lookup');
const target=doc.candidates.filter(c=>c.shortlistRank!==null).sort((a,b)=>a.shortlistRank-b.shortlistRank);
const checks=await Promise.all(target.flatMap(c=>['de','com'].map(async tld=>{
 const url=c.domains[tld].source;
 try {
  const response=await fetch(url,{method:'HEAD',headers:{'Accept':'application/rdap+json'},signal:AbortSignal.timeout(6000)});
  const status=response.status===200?'registered':response.status===404?'not_registered_at_check':'unknown';
  return {name:c.name,tld,registry:url,httpStatus:response.status,status,checkedAt:new Date().toISOString(),note:'Registry observation only; no domain purchase or trademark clearance'};
 }catch(e){return {name:c.name,tld,registry:url,httpStatus:null,status:'unknown',checkedAt:new Date().toISOString(),note:'Request failed, unavailable or blocked; no domain claim',error:String(e).slice(0,140)};}
})));
console.log(JSON.stringify({asOf:new Date().toISOString(),purpose:'research_only',legalClearance:false,claimsOfAvailability:false,checks},null,2));
