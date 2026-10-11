import fs from 'node:fs';
export const load=()=>JSON.parse(fs.readFileSync(new URL('./screening.json',import.meta.url),'utf8'));
export function validate(d){const errors=[];if(!d||d.launchApproved!==false||d.brandChosen!==false||d.legalClearance!==false||!Array.isArray(d.candidates)||d.candidates.length!==5)return ['invalid fail-closed root'];const names=new Set();for(const [i,c] of d.candidates.entries()){
 for(const k of ['name','asOf','legalDecision','similarityReview','conflictSignal','conflictUrl','companySearch','appStoreSearch','risk'])if(typeof c[k]!=='string'||!c[k])errors.push(i+':'+k);
 if(names.has(c.name))errors.push(i+':duplicate');names.add(c.name);
 if(c.legalDecision!=='blocked_pending_official_register_search')errors.push(i+':unapproved-clearance');
 if(c.registers?.DPMA!=='not_verified'||c.registers?.EUIPO!=='not_verified'||c.registers?.WIPO!=='not_verified')errors.push(i+':invented-register-verification');
 if(JSON.stringify(c.classesProposed)!=='[9,35,42]')errors.push(i+':classes');
 if(!/^https:\/\//.test(c.conflictUrl))errors.push(i+':conflict-link');
 for(const t of ['de','com'])if(!/^https:\/\//.test(c.domains?.[t]?.source)||![200,404].includes(c.domains[t].marketingHttpStatus))errors.push(i+':domain-'+t);
 }return errors;}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href){const e=validate(load());console.log(JSON.stringify({candidates:load().candidates.length,errors:e,legalClearance:false}));if(e.length)process.exitCode=1;}
