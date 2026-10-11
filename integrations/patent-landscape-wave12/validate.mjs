import fs from 'node:fs';
const file=new URL('./patents.json',import.meta.url);
export function validate(data){
 const errors=[];if(!data||data.scope!=='preliminary-not-legal-opinion'||!Array.isArray(data.patents)||!data.patents.length)return ['invalid document'];
 const seen=new Set();for(const [i,p] of data.patents.entries()){
  for(const k of ['publication','jurisdiction','priority','filing','status','family','claim','feature','implemented','gap','risk','url'])if(typeof p[k]!=='string'||!p[k].trim())errors.push(i+':'+k);
  if(!/^(EP|US|CN|DE|WO)[0-9]+[A-Z][0-9]?$/.test(p.publication))errors.push(i+':publication-format');
  if(seen.has(p.publication))errors.push(i+':duplicate');seen.add(p.publication);
  if(!/^https:\/\/patents\.google\.com\/patent\/[A-Z0-9]+\/en$/.test(p.url)||!p.url.includes(p.publication))errors.push(i+':link');
  if(!/^20[0-9]{2}-[0-9]{2}-[0-9]{2}$/.test(p.filing)||!/^20[0-9]{2}-[0-9]{2}-[0-9]{2}$/.test(p.priority))errors.push(i+':date');
  if(!p.status.includes('unverified'))errors.push(i+':status-warning');
  if(/patentfrei|freedom to operate granted|launch approved/i.test(p.implemented+' '+p.gap))errors.push(i+':unfounded-clearance');
 }
 return errors;
}
export const load=()=>JSON.parse(fs.readFileSync(file,'utf8'));
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href){const errors=validate(load());console.log(JSON.stringify({records:load().patents.length,errors,legalClearance:false}));if(errors.length)process.exitCode=1;}
