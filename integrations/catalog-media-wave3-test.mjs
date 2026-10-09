import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {test} from 'node:test';
import {root,hash,coverage} from './catalog-media-wave3-audit.mjs';
import {planImport,runImport,validateCandidate,jpegSize} from './catalog-media-wave3-import.mjs';
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'integrations/catalog-media-wave3-'+name+'.json')));
const audit=read('coverage'),research=read('research'),gold=research.candidates.find(r=>r.approval==='approved');
const snapshot=directory=>{
 const out={};function walk(folder,prefix=''){for(const name of fs.readdirSync(folder).sort()){const p=path.join(folder,name),relative=prefix+name,s=fs.lstatSync(p);if(s.isSymbolicLink())out[relative]='symlink';else if(s.isDirectory())walk(p,relative+'/');else out[relative]=hash(fs.readFileSync(p));}}walk(directory);return out;
};
function fixture(fn){const parent=fs.mkdtempSync(path.join(root,'.catalog-media-wave3-test-')),site=path.join(parent,'site');execFileSync('python3',[path.join(root,'integrations/restore-source-checkpoint.py'),'--target',site]);try{return fn(site,parent);}finally{fs.rmSync(parent,{recursive:true,force:true});}}
test('complete coverage and honest licence accounting',()=>{
 assert.equal(audit.rows.filter(r=>r.kind==='model').length,1093);assert.equal(audit.rows.filter(r=>r.kind==='part').length,1940);
 assert.equal(new Set(audit.rows.map(r=>r.id)).size,3042);assert.equal(Object.keys(audit.byBrand).length,10);
 assert.equal(audit.summary.models.existingImageUrls,535);assert.equal(audit.summary.parts.existingImageUrls,676);
 assert.equal(audit.summary.models.documentedApprovedBefore,0);assert.equal(audit.summary.models.approvedAfter,1);assert.equal(audit.summary.parts.approvedAfter,0);
 assert.equal(research.candidates.length,24);assert.equal(research.candidates.filter(r=>r.approval==='approved').length,1);
 assert.ok(research.candidates.filter(r=>r.approval!=='approved').every(r=>r.imageBytesDownloaded===0));
 assert.ok(audit.rows.filter(r=>r.imageUrl).every(r=>r.rightsStatus==='not_documented'));
});
test('HEAD 403/timeout/redirect is indeterminate, not a fabricated broken link',()=>{
 const data={models:[audit.rows.find(r=>r.imageUrl)],parts:[],familyFallbacks:[],catalogCoverage:[]};
 for(const status of [403,429,500,null,302])assert.equal(coverage(data,{results:[{url:data.models[0].imageUrl,status}]}).rows[0].linkStatus,'indeterminate');
 for(const status of [404,410])assert.equal(coverage(data,{results:[{url:data.models[0].imageUrl,status}]}).rows[0].linkStatus,'broken');
});
test('only approved CC0 exact DC19 binding passes review',()=>{assert.equal(validateCandidate(gold,audit.rows),gold);});
for(const [name,mutate] of [
 ['unapproved',r=>r.approval='pending'],['missing licence',r=>r.rights.license=null],
 ['editorial only',r=>r.rights.commercialUse=false],['no rehosting permission',r=>r.rights.redistribution=false],
 ['false image identity',r=>r.imageIdentityVerified=false],['wrong ID',r=>r.entityId='vac-dyson-model-dc19t2'],
 ['wrong model',r=>r.model='DC19T2'],['wrong typed SKU',r=>r.binding=[{type:'device-sku',value:'DC19'}]],
 ['foreign host',r=>r.originalUrl='https://evil.example/image.jpg'],['source credentials',r=>r.originalUrl='https://user:secret@upload.wikimedia.org/image.jpg'],
 ['HTTP source',r=>r.originalUrl=r.originalUrl.replace('https:','http:')],['missing attribution',r=>r.rights.attribution=null],
 ['path traversal',r=>r.variants[0].file='integrations/../image.jpg'],['unsupported SVG',r=>r.variants[0].mime='image/svg+xml'],
 ['duplicate responsive width',r=>r.variants[1].width=320],['wrong manufacturer source',r=>r.manufacturerSourceUrl='https://www.dyson.de/']])
 test('refuses '+name,()=>{const row=structuredClone(gold);mutate(row);assert.throws(()=>validateCandidate(row,audit.rows));});
test('approved assets have pinned hash, valid JPEG and exact dimensions',()=>{
 for(const asset of gold.variants){const b=fs.readFileSync(path.join(root,asset.file));assert.equal(hash(b),asset.sha256);assert.equal(b.length,asset.bytes);assert.deepEqual(jpegSize(b),{width:asset.width,height:asset.height});}
 assert.throws(()=>jpegSize(Buffer.from('<svg onload="alert(1)"></svg>')));
});
test('dry-run is immutable, exact outputs only, apply/check/reapply idempotent',()=>fixture(site=>{
 const before=snapshot(site);assert.equal(runImport(site,{check:true}).state,'baseline');assert.deepEqual(snapshot(site),before);
 const first=runImport(site);assert.equal(first.state,'applied');assert.equal(first.writtenFiles.length,7);
 const after=snapshot(site),changed=Object.keys(after).filter(k=>before[k]!==after[k]);assert.deepEqual(changed.sort(),first.writtenFiles.sort());
 assert.deepEqual(runImport(site).writtenFiles,[]);assert.equal(runImport(site,{check:true}).state,'applied');assert.deepEqual(snapshot(site),after);
 const data=fs.readFileSync(path.join(site,'src/data/catalog-media.js'),'utf8');assert.ok(!data.includes('media.miele.com'));assert.ok(!data.includes('pending'));assert.ok(data.includes('dyson-dc19-cc0'));
}));
for(const file of ['src/app.js','styles.css','src/data/hoover-pack.js','src/data/samsung-pack.js','package.json'])test('source conflict refuses all writes: '+file,()=>fixture(site=>{
 fs.appendFileSync(path.join(site,file),'\n/* independent change */\n');const before=snapshot(site);assert.throws(()=>runImport(site),/conflict/);assert.deepEqual(snapshot(site),before);
}));
test('modified research grant cannot self-approve or mutate files',()=>fixture(site=>{
 const changed=structuredClone(research);changed.candidates[0].approval='approved';const before=snapshot(site);assert.throws(()=>runImport(site,{research:changed}),/snapshot conflict/);assert.deepEqual(snapshot(site),before);
}));
test('partial import refused rather than overwritten',()=>fixture(site=>{
 const plan=planImport(site),[relative,bytes]=[...plan.outputs][0];fs.mkdirSync(path.join(site,'media'));fs.writeFileSync(path.join(site,relative),bytes);const before=snapshot(site);assert.throws(()=>runImport(site),/Partial/);assert.deepEqual(snapshot(site),before);
}));
test('race before commit is detected; no import output written',()=>fixture(site=>{
 assert.throws(()=>runImport(site,{beforeCommit:()=>fs.appendFileSync(path.join(site,'styles.css'),'\n/* race */')}),/changed during/);
 assert.ok(!fs.existsSync(path.join(site,'media')));assert.ok(!fs.existsSync(path.join(site,'.catalog-media-wave3-lock')));
}));
test('rename failure rolls back files and newly created directories',()=>fixture(site=>{
 const before=snapshot(site);let n=0;assert.throws(()=>runImport(site,{rename:(a,b)=>{if(++n===4)throw Error('simulated rename failure');fs.renameSync(a,b);}}),/simulated/);
 assert.deepEqual(snapshot(site),before);assert.ok(!fs.existsSync(path.join(site,'media')));
}));
test('symlink target/data and existing transaction lock refused',()=>fixture((site,parent)=>{
 const alias=path.join(parent,'alias');fs.symlinkSync(site,alias,'dir');assert.throws(()=>runImport(alias),/Symlink/);
 fs.mkdirSync(path.join(site,'.catalog-media-wave3-lock'));assert.throws(()=>runImport(site),/transaction/);
}));
test('CLI rejects unknown flags; main fixture cannot be changed',()=>fixture((site,parent)=>{
 for(const args of [[],['--target'],['--target',site,'--force'],['--target',site,'--target',site]])assert.notEqual(spawnSync(process.execPath,[path.join(root,'integrations/catalog-media-wave3-import.mjs'),...args]).status,0);
 execFileSync('git',['init','-b','main',parent],{stdio:'ignore'});const before=snapshot(site);assert.throws(()=>runImport(site),/Exclusive/);assert.deepEqual(snapshot(site),before);
}));
test('runtime lookup rejects wrong variant, IDs and unapproved legacy URL',async()=>{
 const module=await import(pathToFileURL(path.join(root,'site/src/core/catalog-media.js')));
 const data=await import(pathToFileURL(path.join(root,'site/src/data/catalog-media.js')));
 const entity=audit.rows.find(r=>r.id===gold.entityId);assert.ok(module.approvedMediaFor(entity,'model'));
 assert.equal(module.approvedMediaFor({...entity,id:'vac-dyson-model-dc19t2'},'model'),null);
 assert.equal(module.approvedMediaFor({...entity,model:'DC19T2'},'model'),null);
 assert.equal(module.approvedMediaFor({...entity,identifiers:[]},'model'),null);
 for(const change of [r=>r.approval='pending',r=>r.rights.commercialUse=false,r=>r.src='https://evil.example/x.jpg']){const row=structuredClone(data.catalogMedia[0]);change(row);assert.equal(module.createMediaLookup([row])(entity,'model'),null);}
 assert.throws(()=>module.createMediaLookup([...data.catalogMedia,...data.catalogMedia]),/Duplicate/);
 assert.ok(!module.renderMedia(audit.rows.find(r=>r.imageUrl&&r.kind==='model'),'model',{auto:true}).includes('data-catalog-media-photo'));
});
