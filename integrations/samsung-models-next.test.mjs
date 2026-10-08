import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {after, test} from 'node:test';
import {importSamsungModels, validateEvidence} from './import-samsung-models-next.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidence = JSON.parse(fs.readFileSync(path.join(root, 'integrations/samsung-model-research-next.json'), 'utf8'));
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'samsung-issue-13-'));
const target = path.join(work, 'site');
const files = ['src/data/samsung-pack.js', 'src/data/new-brands-index.js', 'tests/catalog-v126.test.mjs', 'src/core/typeplate.js', 'tests/catalog-seven-brands.test.mjs', 'tests/vorwerk-expansion.test.mjs'];
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const copy = value => structuredClone(value);
const snapshot = () => Object.fromEntries(files.map(name => [name, fs.readFileSync(path.join(target, name), 'utf8')]));
function command(program, args, cwd = root, input) {
  const result = spawnSync(program, args, {cwd, encoding: 'utf8', input, env: process.env, maxBuffer: 8 * 1024 * 1024});
  assert.equal(result.status, 0, result.stderr || result.stdout || result.error?.message);
  return result.stdout;
}
command('python3', [path.join(root, 'integrations/restore-source-checkpoint.py'), '--target', target]);
const original = snapshot();

function probe() {
  const result = command(process.execPath, ['--input-type=module', '-'], target, `
    import assert from 'node:assert/strict';
    import {createHash} from 'node:crypto';
    import fs from 'node:fs';
    import {products,partsCatalog,catalogBrands,optionalCatalogBrands,registerCatalogPack,catalogCoverage,filterCatalog} from './src/data/catalog.js';
    import {brandPack as samsung} from './src/data/samsung-pack.js';
    import {newBrandsIndex,newBrandsManifest} from './src/data/new-brands-index.js';
    import {brandDeviceId,makeBrandDevice} from './src/data/brand-products.js';
    import {reviewTypePlate,parseTypePlate} from './src/core/typeplate.js';
    import {catalogTargetProgress} from './src/data/catalog-plan.js';
    const evidence=${JSON.stringify(evidence)};
    const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
    const before=catalogCoverage();
    const objectRefs=new Map(products.map(p=>[p.id,p]));
    for(const brand of optionalCatalogBrands){
      const {brandPack}=await import('./src/data/'+brand.toLowerCase()+'-pack.js');
      registerCatalogPack(brandPack);registerCatalogPack(brandPack);
    }
    const after=catalogCoverage();
    assert.equal(catalogBrands.length,10);
    assert.equal(new Set(products.map(p=>p.id)).size,products.length);
    assert.equal(new Set(partsCatalog.map(p=>p.id)).size,partsCatalog.length);
    for(const brand of catalogBrands){
      const a=before.find(r=>r.brand===brand),b=after.find(r=>r.brand===brand);
      for(const key of ['models','records','recordsWithParts','recordsWithoutParts','parts','physicalParts'])assert.equal(a[key],b[key],brand+': index/detail coverage '+key);
    }
    for(const device of products)assert.equal(objectRefs.get(device.id),device,'Lazy loading preserves saved-device references');
    const newDevices=[];
    for(const model of evidence.models){
      const detail=samsung.models.find(r=>r.code===model.code);
      if(!detail)continue;
      const summary=newBrandsIndex.find(r=>r.brand==='Samsung'&&r.code===model.code);
      const {partListCoverage,...expectedSummary}=detail;
      assert.deepEqual(summary,expectedSummary,'New Samsung index/detail equality');
      const indexed=makeBrandDevice(summary,{index:true}),hydrated=products.find(p=>p.id===brandDeviceId('Samsung',model.code));
      for(const field of ['id','model','brand','type','deviceReferences','identifiers','partCount','physicalPartCount','vacuumMeta','sources'])assert.deepEqual(indexed[field],hydrated[field],field);
      assert.equal(hydrated.parts.length,0);
      assert.equal(hydrated.physicalPartCount,0);
      assert.equal(hydrated.deviceQuote,null);
      assert.equal(hydrated.candidateParts.length,0);
      assert.ok(hydrated.partListCoverage?.note.includes('0 gelistete Teile'));
      assert.ok(!partsCatalog.some(p=>p.modelIds.includes(hydrated.id)));
      assert.ok(filterCatalog({brand:'Samsung',partCoverage:'missing'}).some(p=>p.id===hydrated.id));
      assert.equal(hydrated.identityScope,'model-reference');
      for(const full of model.deviceReferences){
        for(const text of ['Samsung\\nModellcode: '+full,'Samsung\\n'+full]){
          const parsed=parseTypePlate(text);
          assert.ok(parsed.entries.every(e=>e.kind!=='enumber'),'Samsung is not Siemens');
          const review=reviewTypePlate(text);
          assert.equal(review.status,'catalog_reference');
          assert.deepEqual(review.suggestions.map(p=>p.id),[hydrated.id]);
          assert.ok(review.warnings.some(w=>w.includes('Zubehörtyp separat')));
        }
        const unknown=full.split('/')[0]+'/ZZ';
        assert.equal(reviewTypePlate('Samsung\\nModellcode: '+unknown).suggestions.length,0,'Unknown country is not silently bound');
        assert.equal(reviewTypePlate('Siemens\\nModellcode: '+full).suggestions.length,0,'Brand conflict');
        assert.equal(reviewTypePlate('Samsung\\nSeriennummer: '+full).suggestions.length,0,'Serial is not a model');
      }
      newDevices.push({id:hydrated.id,code:model.code,references:hydrated.deviceReferences});
    }
    const siemens=products.find(p=>p.brand==='Siemens'&&p.deviceReferences.length);
    assert.equal(reviewTypePlate('Siemens\\nE-Nr.: '+siemens.deviceReferences[0]).confirmationBrand,'Siemens','Siemens numeric-index recognition remains intact');
    console.log(JSON.stringify({brands:catalogBrands,coverage:after,modelCount:products.filter(p=>p.recordType==='model').length,
      partsCount:partsCatalog.length,partsHash:hash(partsCatalog),products:products.map(p=>({id:p.id,hash:hash(p)})),
      targetSlots:catalogTargetProgress(after).reduce((sum,r)=>sum+Math.min(100,r.models),0),
      samsungManifest:newBrandsManifest.Samsung,newDevices}));
  `);
  return JSON.parse(result.trim());
}

const baseline = probe();
const imported = await importSamsungModels({target, evidence});
const prepared = snapshot();
const final = probe();
after(() => fs.rmSync(work, {recursive: true, force: true}));

test('fresh checksum restore imports eight independent groups and nine exact references', () => {
  validateEvidence(evidence);
  assert.equal(imported.addedModels, 8);
  assert.equal(imported.exactNewReferences, 9);
  assert.equal(final.newDevices.length, 8);
  assert.equal(evidence.researchScope.sourceUrlCount, evidence.sources.length);
  assert.equal(evidence.decisions.length, evidence.researchScope.supportCandidateCount);
  assert.equal(evidence.decisions.filter(d=>d.decision==='add').length, 8);
  assert.ok(evidence.decisions.some(d=>d.decision==='excluded_scope'));
  assert.equal(evidence.researchScope.manufacturerWideUpperBound, null);
});

test('all ten brands, stable IDs, lazy hydration and exact variant binding', () => {
  assert.deepEqual(final.brands, baseline.brands);
  assert.equal(final.brands.length,10);
  const row=final.coverage.find(r=>r.brand==='Samsung');
  assert.equal(row.models,77);
  assert.equal(row.recordsWithoutParts,57);
  assert.equal(row.recordsWithParts,20);
  const ultra=final.newDevices.find(m=>m.code==='VS90F40EEK');
  assert.deepEqual(ultra.references,['VS90F40EEK/WD','VS90F40EEM/WD']);
  assert.ok(!final.newDevices.some(m=>m.code==='VS90F40EEM'));
});

test('all existing devices, articles, offers and fitment remain byte-semantically unchanged', () => {
  const hashes=new Map(final.products.map(p=>[p.id,p.hash]));
  for(const device of baseline.products)assert.equal(hashes.get(device.id),device.hash,device.id);
  assert.equal(final.partsHash,baseline.partsHash);
  assert.equal(final.partsCount,1930);
  assert.equal(final.modelCount,baseline.modelCount+8);
  assert.equal(final.targetSlots,baseline.targetSlots+8);
  for(const row of baseline.coverage.filter(r=>r.brand!=='Samsung'))assert.deepEqual(final.coverage.find(r=>r.brand===row.brand),row);
});

test('second import and check-only run are byte-stable', async () => {
  assert.equal((await importSamsungModels({target,evidence})).addedModels,0);
  assert.deepEqual(snapshot(),prepared);
  assert.equal((await importSamsungModels({target,evidence,check:true})).check,true);
  assert.deepEqual(snapshot(),prepared);
});

test('rejects fabricated/unqualified variants and unsupported device types before writing', async () => {
  for(const change of [
    e=>{e.models[0].fullCode=e.models[0].code;},
    e=>{e.models[0].deviceType='robot';},
    e=>{e.models[1].baseDeviceKey=e.models[0].baseDeviceKey;},
    e=>{e.models[0].code=e.baseline.models[0].code;e.models[0].fullCode=e.baseline.models[0].deviceReferences[0];},
    e=>{e.sources.find(s=>s.id===e.models[0].primarySourceId).observedFullCode='VCC000000/EG';},
    e=>{e.models.at(-1).equivalenceSourceId=undefined;},
    e=>{e.models.at(-1).deviceReferences.push('VS15A6031R1/ZZ');}
  ]){
    const bad=copy(evidence);change(bad);
    await assert.rejects(importSamsungModels({target,evidence:bad}));
    assert.deepEqual(snapshot(),prepared,'Invalid evidence cannot partially overwrite the catalog');
  }
});

test('rejects insecure, foreign, credentialed or code-mismatched source links', async () => {
  for(const url of ['http://www.samsung.com/de/support/model/VCC4040V34/XEG/',
    'https://www.samsung.com.evil.example/de/support/model/VCC4040V34/XEG/',
    'https://www.samsung.com/uk/support/model/VCC4040V34/XEG/',
    'https://user@www.samsung.com/de/support/model/VCC4040V34/XEG/',
    'https://www.samsung.com/de/support/model/VCC4040V34/XEG/?redirect=evil',
    'https://www.samsung.com/de/support/model/VCC9999/EG/']){
    const bad=copy(evidence);bad.models[0].url=url;
    bad.sources.find(s=>s.id===bad.models[0].primarySourceId).url=url;
    await assert.rejects(importSamsungModels({target,evidence:bad}));
    assert.deepEqual(snapshot(),prepared);
  }
});

test('detects drift, partial imports and invented offers instead of overwriting them', async () => {
  const replaceExport=(raw,tag,mutate)=>{
    const pattern=new RegExp('(export const '+tag+'=)([\\s\\S]*?)(;\\s*(?=export const |$))');
    const match=raw.match(pattern);
    assert.ok(match);
    const value=JSON.parse(match[2]);mutate(value);
    return raw.replace(pattern,()=>match[1]+JSON.stringify(value)+match[3]);
  };
  for(const [name,tag,mutate] of [
    ['src/data/samsung-pack.js','brandPack',p=>{p.parts[0].code='invented';}],
    ['src/data/samsung-pack.js','brandPack',p=>{p.models[0].type='changed baseline';}],
    ['src/data/samsung-pack.js','brandPack',p=>{p.models.at(-1).deviceQuote={price:1};}],
    ['src/data/new-brands-index.js','newBrandsIndex',p=>{p.splice(p.findIndex(m=>m.code===evidence.models[0].code),1);}]
  ]){
    const filename=path.join(target,name);
    fs.writeFileSync(filename,replaceExport(prepared[name],tag,mutate));
    const invalid=snapshot();
    try{
      await assert.rejects(importSamsungModels({target,evidence}));
      assert.deepEqual(snapshot(),invalid,'Fail safely on source drift');
    }finally{fs.writeFileSync(filename,prepared[name]);}
  }
});

test('only six documented local preparation files change; version and archives stay untouched', () => {
  assert.equal(JSON.parse(fs.readFileSync(path.join(target,'package.json'),'utf8')).version,'1.27.1');
  assert.deepEqual(Object.keys(prepared).filter(name=>prepared[name]!==original[name]),files);
  const actual=[];
  for(const entry of fs.readdirSync(target,{recursive:true,withFileTypes:true})){
    if(entry.isFile())actual.push(path.relative(target,path.join(entry.parentPath,entry.name)));
  }
  const second=path.join(work,'unchanged');
  command('python3',[path.join(root,'integrations/restore-source-checkpoint.py'),'--target',second]);
  for(const name of actual.filter(name=>!files.includes(name)))assert.equal(
    hash(fs.readFileSync(path.join(target,name))),hash(fs.readFileSync(path.join(second,name))),name);
});

test('CLI supports explicit target and check without changing the prepared copy', () => {
  const script=path.join(root,'integrations/import-samsung-models-next.mjs');
  const result=JSON.parse(command(process.execPath,[script,'--target',target,'--check']));
  assert.equal(result.check,true);
  assert.equal(result.addedModels,0);
  assert.deepEqual(snapshot(),prepared);
});
