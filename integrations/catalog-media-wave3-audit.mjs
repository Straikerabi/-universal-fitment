import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';

export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
export const baseCommit='d4853c4e5245410630742f58aead661d77f42c32';
export function lockedSources(target) {
 const lock=JSON.parse(fs.readFileSync(path.join(root,'integrations/catalog-media-wave3-lock.json')));
 assert.equal(lock.baseCommit,baseCommit);assert.equal(lock.version,'1.29.0');
 for(const [relative,entry] of Object.entries(lock.files)) {
  let cursor=path.parse(path.resolve(target)).root;
  for(const component of path.join(path.resolve(target),relative).slice(cursor.length).split(path.sep)) {
   cursor=path.join(cursor,component);assert.ok(!fs.lstatSync(cursor).isSymbolicLink(),'Symlink: '+cursor);
  }
  assert.equal(hash(fs.readFileSync(path.join(target,relative))),entry.sha256,'Checkpoint conflict: '+relative);
 }
 return lock;
}
export async function inventory(target) {
 // Only checksum-verified, restored project source is executed for this audit.
 lockedSources(target);
 const source=relative=>import(pathToFileURL(path.join(path.resolve(target),relative)));
 const {products,partsCatalog,registerCatalogPack,catalogCoverage,catalogStats}=await source('src/data/catalog.js');
 const {partType,isPhysicalPart}=await source('src/data/part-taxonomy.js');
 for(const brand of ['Dyson','AEG','Rowenta','Philips','Siemens','Vorwerk','Samsung','Hoover']) {
  const {brandPack}=await source('src/data/'+brand.toLowerCase()+'-pack.js');registerCatalogPack(brandPack);
 }
 const common=r=>({id:r.id,brand:r.brand||null,targetBrands:r.targetBrands||[r.brand||'Miele'],
  model:r.model||null,name:r.name||null,identifiers:r.identifiers||[],
  imageUrl:r.imageUrl||null,sourceUrls:[...new Set([r.sourceUrl,...(r.sources||r.provenance?.sources||[]).map(s=>s.url)].filter(Boolean))],
  identityScope:r.identityScope||null,sourceMarket:r.sourceMarket||null});
 return {models:products.filter(r=>r.recordType==='model').map(r=>({...common(r),kind:'model',category:'vacuum'})),
  parts:partsCatalog.map(r=>({...common(r),kind:'part',category:partType(r).id,physical:isPhysicalPart(r),tier:r.tier})),
  familyFallbacks:products.filter(r=>r.recordType!=='model').map(r=>({...common(r),kind:'family-fallback',category:'vacuum'})),
  catalogCoverage:catalogCoverage(),catalogStats};
}
export function coverage(data,heads,approvedIds=[]) {
 const probes=new Map(heads.results.map(r=>[r.url,r])),approved=new Set(approvedIds);
 const rows=[...data.models,...data.parts,...data.familyFallbacks].map(r=>{
  const probe=r.imageUrl?probes.get(r.imageUrl):null;
  const linkStatus=!r.imageUrl?'not_present':!probe?'not_checked':[404,410].includes(probe.status)?'broken':probe.status===200&&(probe.contentType||'').startsWith('image/')?'head_image_ok':'indeterminate';
  return {...r,imageStatus:!r.imageUrl?'not_present':linkStatus==='broken'?'broken_url':'unapproved',
   linkStatus,rightsStatus:r.imageUrl?'not_documented':'not_applicable',
   identityStatus:r.imageUrl?'catalog_binding_not_independently_reviewed':'no_image',
   width:null,height:null,format:probe?.contentType||null,corsAllowOrigin:probe?.corsAllowOrigin||null,
   hotlinkDependency:r.imageUrl?new URL(r.imageUrl).hostname:null,
   approvedBefore:false,approvedAfter:approved.has(r.id),
   liveRenderingAfter:approved.has(r.id)?'licensed_local_image':'local_svg_fallback'};
 });
 const summarize=records=>({records:records.length,existingImageUrls:records.filter(r=>r.imageUrl).length,
  missing:records.filter(r=>!r.imageUrl).length,brokenHeads:records.filter(r=>r.linkStatus==='broken').length,
  indeterminateHeads:records.filter(r=>r.imageUrl&&r.linkStatus==='indeterminate').length,
  imageHeadsOk:records.filter(r=>r.linkStatus==='head_image_ok').length,notCheckedHeads:records.filter(r=>r.linkStatus==='not_checked').length,
  documentedApprovedBefore:0,approvedAfter:records.filter(r=>r.approvedAfter).length,
  fallbackAfter:records.filter(r=>!r.approvedAfter).length});
 const models=rows.filter(r=>r.kind==='model'),parts=rows.filter(r=>r.kind==='part');
 return {schemaVersion:1,baseCommit,version:'1.29.0',checkedAt:new Date().toISOString(),
  definitions:{existingImageUrl:'A URL is not evidence of a usable, correctly bound or licensed photo.',
   unapproved:'No image-specific publication permission was recorded in the source checkpoint.',
   linkCheck:'HEAD only. 403/429/5xx/timeouts/redirects are indeterminate; HEAD 200 does not prove GET/hotlink/decoding permission.',
   models:'1093 records = 1082 distinct brand/model labels. Nine family fallback records are audited separately.',
   attribution:'Source-linked manufacturer provenance is not a media licence.',
   perBrand:'Model brands and article targetBrands. Cross-brand articles can appear in multiple per-brand buckets.'},
  summary:{models:summarize(models),parts:summarize(parts),familyFallbacks:summarize(rows.filter(r=>r.kind==='family-fallback'))},
  byBrand:Object.fromEntries(data.catalogCoverage.map(r=>[r.brand,{models:summarize(models.filter(x=>x.brand===r.brand)),parts:summarize(parts.filter(x=>x.targetBrands.includes(r.brand)))}])),
  byCategory:Object.fromEntries([...new Set(parts.map(r=>r.category))].sort().map(c=>[c,summarize(parts.filter(r=>r.category===c))])),
  duplicateUrls:[...new Set(rows.map(r=>r.imageUrl).filter(Boolean))].map(url=>({url,ids:rows.filter(r=>r.imageUrl===url).map(r=>r.id)})).filter(r=>r.ids.length>1),rows};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 const args=process.argv.slice(2);assert.deepEqual(args.filter((_,i)=>i%2===0),['--target','--heads','--output']);
 assert.equal(args.length,6);
 const data=await inventory(args[1]),heads=JSON.parse(fs.readFileSync(args[3]));
 const research=JSON.parse(fs.readFileSync(path.join(root,'integrations/catalog-media-wave3-research.json')));
 const report=coverage(data,heads,research.candidates.filter(r=>r.approval==='approved').map(r=>r.entityId));
 fs.writeFileSync(args[5],JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report.summary,null,2));
}
