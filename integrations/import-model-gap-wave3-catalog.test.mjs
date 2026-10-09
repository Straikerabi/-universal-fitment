import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {test,after} from 'node:test';
import {projectRoot,readEvidence,readBaseline,validateEvidence,createPlan,commitPlan,importCatalog,digest} from './import-model-gap-wave3-catalog.mjs';

const root=fs.mkdtempSync(path.join(os.tmpdir(),'uf-wave3-tests-'));
after(()=>fs.rmSync(root,{recursive:true,force:true}));
const restore=name=>{const target=path.join(root,name);execFileSync('python3',[path.join(projectRoot,'integrations/restore-source-checkpoint.py'),'--target',target]);return target;};
const fingerprint=target=>{const result={};const walk=(dir,relative='')=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const name=relative+entry.name;if(entry.isDirectory())walk(path.join(dir,entry.name),name+'/');else result[name]=digest(fs.readFileSync(path.join(dir,entry.name)));}};walk(target);return result;};
const evidence=readEvidence();
test('reviewed22 profiles,39 decisions, official evidence and archive boundary',()=>{
 const r=validateEvidence(evidence);assert.equal(r.models.length,22);assert.equal(r.sources.size,15);
 assert.equal(evidence.vorwerkBoundary.conditionalArchiveLabelCeiling,41);assert.equal(evidence.result.remainingTargetSlots,109);
});
for(const [label,mutate] of [
 ['duplicate decision ID',e=>e.candidates[1].id=e.candidates[0].id],
 ['duplicate historical base group',e=>e.candidates[1].baseDeviceKey=e.candidates[0].baseDeviceKey],
 ['existing model alias',e=>e.candidates[0].aliases=['VK7']],
 ['unsupported manufacturer source',e=>e.sources[0].url='https://example.com/vorwerk.pdf'],
 ['unreviewed real-looking historical number',e=>e.candidates[0].modelCode='Kobold 111'],
 ['fake extra parts',e=>e.candidates[0].addedParts=1],
 ['fake EAN',e=>e.candidates[0].ean='4002516925668'],
 ['invented typeplate code',e=>e.candidates[0].typePlateCode='VK30'],
 ['wrong country suffix',e=>e.candidates.find(c=>c.brand==='Samsung'&&c.decision==='accepted').deviceReferences=['VC07M25M9WD/DE']],
 ['robot introduced under accepted name',e=>e.candidates[0].formFactor='robot'],
 ['unreviewed exact source response',e=>e.sources[0].responseSha256='a'.repeat(64)],
 ['silent candidate removal',e=>e.candidates.pop()],
 ['wrong baseline',e=>e.baselineCommit='a'.repeat(40)]
])test('reject '+label,()=>{const value=structuredClone(evidence);mutate(value);assert.throws(()=>validateEvidence(value));});
test('deterministic clean import, idempotence, dry-run and --check do not mutate',async()=>{
 const a=restore('a'),b=restore('b'),before=fingerprint(a);
 await assert.rejects(()=>importCatalog({target:a,check:true}));assert.deepEqual(fingerprint(a),before);
 const dry=await importCatalog({target:a,dryRun:true});assert.equal(dry.addedProfiles,0);assert.deepEqual(fingerprint(a),before);
 assert.equal((await importCatalog({target:a})).addedProfiles,22);const imported=fingerprint(a);
 assert.equal((await importCatalog({target:a})).addedProfiles,0);assert.deepEqual(fingerprint(a),imported);
 assert.equal((await importCatalog({target:a,check:true})).alreadyImported,true);assert.deepEqual(fingerprint(a),imported);
 await importCatalog({target:b});assert.deepEqual(fingerprint(b),imported,'Two fresh checkpoints produce identical bytes');
});
test('unrelated source drift refuses the complete transaction',async()=>{
 const target=restore('drift'),file=path.join(target,'src/data/philips-pack.js');fs.appendFileSync(file,'\n// test drift');
 const before=fingerprint(target);await assert.rejects(()=>importCatalog({target}),/Source conflict/);assert.deepEqual(fingerprint(target),before);
});
test('new generated module collision never overwrites',async()=>{
 const target=restore('collision');fs.writeFileSync(path.join(target,'src/data/model-gap-wave3.js'),'foreign work');
 const before=fingerprint(target);await assert.rejects(()=>importCatalog({target}),/collision/);assert.deepEqual(fingerprint(target),before);
});
test('partial import refuses mixed rows',async()=>{
 const target=restore('partial'),plan=await createPlan({target});const [name,bytes]=[...plan.changed][0];fs.writeFileSync(path.join(target,name),bytes);
 const before=fingerprint(target);await assert.rejects(()=>importCatalog({target}),/Partial/);assert.deepEqual(fingerprint(target),before);
});
test('file, dangling and root ancestor symlinks refused',async()=>{
 const target=restore('symlink'),file=path.join(target,'src/core/typeplate.js'),outside=path.join(root,'outside');fs.renameSync(file,outside);fs.symlinkSync(outside,file);
 await assert.rejects(()=>importCatalog({target}),/Symlink/);
 const link=path.join(root,'root-link');fs.symlinkSync(target,link);await assert.rejects(()=>importCatalog({target:link}),/symlink/i);
 fs.unlinkSync(file);fs.symlinkSync(path.join(root,'missing'),file);await assert.rejects(()=>importCatalog({target}),/Symlink/);
});
test('exclusive lock, failure rollback and retry',async()=>{
 const target=restore('rollback'),plan=await createPlan({target}),before=fingerprint(target),lock=path.join(target,'.model-gap-wave3.lock');
 fs.writeFileSync(lock,'other importer');assert.throws(()=>commitPlan(plan),/EEXIST/);fs.unlinkSync(lock);assert.deepEqual(fingerprint(target),before);
 let calls=0;assert.throws(()=>commitPlan(plan,{rename:(a,b)=>{if(++calls===7)throw Error('injected publish failure');fs.renameSync(a,b);}}),/injected/);
 assert.deepEqual(fingerprint(target),before);assert.ok(!fs.existsSync(lock));assert.ok(!fs.readdirSync(target).some(n=>n.includes('wave3-stage')));
 commitPlan(plan);assert.equal((await importCatalog({target,check:true})).alreadyImported,true);
});
test('staging race refused before any source writes',async()=>{
 const target=restore('race'),plan=await createPlan({target}),file=path.join(target,'src/core/matcher.js');fs.appendFileSync(file,'\n// simulated concurrent editor');
 const before=fingerprint(target);assert.throws(()=>commitPlan(plan),/changed during staging/);assert.deepEqual(fingerprint(target),before);
});
test('all136 source guards pinned, no root/global/release output',()=>{
 assert.equal(Object.keys(readBaseline().sourceFiles).length,136);
 assert.ok(!fs.existsSync(path.join(projectRoot,'integrations/model-gap-wave3-source-checkpoint.json')));
});
