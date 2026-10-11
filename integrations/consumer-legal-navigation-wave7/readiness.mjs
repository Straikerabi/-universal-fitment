export const routes=Object.freeze([
 {id:'legal-impressum',label:'Impressum'},
 {id:'legal-datenschutz',label:'Datenschutz'},
 {id:'legal-kontakt',label:'Kontakt'},
 {id:'legal-daten',label:'Daten & Cache löschen'}
]);
export const modes=Object.freeze(['free-readonly','affiliate','b2b-saas']);
// No actual operator facts, texts, contacts or approval input is accepted here.
export function readiness(mode='free-readonly',references={}){
 if(!modes.includes(mode))throw Error('Unsupported scope');
 const supplied=id=>typeof references?.[id]==='string'&&/^[a-f0-9]{64}$/.test(references[id])&&new Set(references[id]).size>8;
 return Object.freeze({mode,launchApproved:false,commercialApproved:false,overall:'BLOCKED',checks:[
  {id:'operator',priority:'P0',status:supplied('operator')?'UNKNOWN':'BLOCKED'},
  {id:'privacy',priority:'P0',status:supplied('privacy')?'UNKNOWN':'BLOCKED'},
  {id:'hosting-rights',priority:'P0',status:'BLOCKED'},
  {id:'storage-purpose-erasure',priority:'P0',status:'BLOCKED'},
  {id:'affiliate',priority:'P1',status:mode==='affiliate'?'BLOCKED':'PASS',applicable:mode==='affiliate'},
  {id:'tenant-api-contracts',priority:'P0',status:mode==='b2b-saas'?'BLOCKED':'PASS',applicable:mode==='b2b-saas'},
  {id:'human-release',priority:'P0',status:'BLOCKED'}
 ]});
}
export function legalRoute(hash){return routes.find(r=>'#'+r.id===hash)?.id||null;}
