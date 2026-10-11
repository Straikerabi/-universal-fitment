import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const weights={distinctiveness:30,pronounceability:20,confusionResistance:20,appStoreFit:15,b2cB2bBreadth:15};
const statuses=new Set(['unknown','registered','not_registered_at_check']);
export function validate(d){
 const errors=[]; const add=x=>errors.push(x);
 if(!d||typeof d!=='object'||Array.isArray(d))return ['root.invalid'];
 if(d.schemaVersion!==1||d.issueNumber!==107||d.currentBrandName!=='Universal Fitment'||d.readOnlyResearch!==true||d.launchAllowed!==false||d.domainRightToUseConfirmed!==false||d.legalClearance!=='pending_qa_legal')add('meta.unauthorized');
 if(JSON.stringify(weights)!==JSON.stringify(d.scoreWeights))add('meta.weights');
 if(!Array.isArray(d.candidates)||d.candidates.length<20||d.candidates.length>30)return [...errors,'candidates.count'];
 const names=new Set(),ranks=new Set();
 for(const c of d.candidates){
  const id=c?.id??'missing';const name=c?.name??'';
  if(!/^BR-\d{2}$/.test(id))add(id+'.id');
  if(!/^[A-Z][a-z]{5,11}$/.test(name))add(id+'.name');
  if(names.has(name.toLowerCase()))add(id+'.duplicate');names.add(name.toLowerCase());
  if(!c.origin||!c.reason||!c.risks||!c.pronunciation?.de||!c.pronunciation?.en||!/^20\d\d-\d\d-\d\d$/.test(c.searchDate??''))add(id+'.rationale');
  let total=0;
  for(const [k,w] of Object.entries(weights)){const n=c.score?.[k];if(!Number.isInteger(n)||n<1||n>5)add(id+'.rating.'+k);total+=(n??0)*w/5;}
  if(total!==c.scoreTotal)add(id+'.weighted_total');
  if(c.shortlistRank!==null){if(!Number.isInteger(c.shortlistRank)||c.shortlistRank<1||c.shortlistRank>5||ranks.has(c.shortlistRank))add(id+'.rank');ranks.add(c.shortlistRank);}
  if(c.legalStatus!=='pending_qa_legal'||c.appStoreStatus!=='not_systematically_checked'||c.brandChosen!==false||c.published!==false)add(id+'.release_violation');
  if(!Array.isArray(c.observedWebReferences))add(id+'.sources');
  for(const tld of ['de','com']){
   const x=c.domains?.[tld],url=(tld==='de'?'https://rdap.denic.de/domain/':'https://rdap.verisign.com/com/v1/domain/')+name.toLowerCase()+'.'+tld;
   if(!x||!statuses.has(x.status)) {add(id+'.domain_status.'+tld);continue;}
   if(x.source!==url)add(id+'.domain_url.'+tld);
   if(x.status==='unknown'&&(x.httpStatus!==null||x.checkedAt!==null))add(id+'.domain_unknown.'+tld);
   if(x.status!=='unknown'){
    if(![200,404].includes(x.httpStatus)||!/^20\d\d-\d\d-\d\dT/.test(x.checkedAt??''))add(id+'.domain_missing_evidence.'+tld);
    if((x.status==='registered'&&x.httpStatus!==200)||(x.status==='not_registered_at_check'&&x.httpStatus!==404))add(id+'.domain_wrong_code.'+tld);
   }
  }
 }
 if(ranks.size!==5)add('shortlist.count');
 const short=d.candidates.filter(c=>c.shortlistRank!==null).sort((a,b)=>a.shortlistRank-b.shortlistRank);
 for(let i=1;i<short.length;i++)if(short[i-1].scoreTotal<short[i].scoreTotal)add('shortlist.score_order');
 if(short.length===5 && d.candidates.some(c=>c.shortlistRank===null&&c.scoreTotal>Math.min(...short.map(v=>v.scoreTotal))))add('shortlist.not_highest');
 return errors;
}
export function read(){return JSON.parse(readFileSync(new URL('./candidates.json',import.meta.url),'utf8'));}
if(process.argv[1]===fileURLToPath(import.meta.url)){const d=read(),errors=validate(d);console.log(JSON.stringify({count:d.candidates.length,shortlist:d.candidates.filter(c=>c.shortlistRank!==null).map(c=>c.name),errors},null,2));if(errors.length)process.exitCode=1;}
