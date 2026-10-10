import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateOwnerDelta,scopeProof} from '../scope.mjs';
import {summarize} from '../policy.mjs';
const lock=()=>JSON.parse(readFileSync(new URL('../owner-authorized-delta.json',import.meta.url),'utf8'));
test('actual #81 delta preserves all remaining baseline files and records both real hashes',()=>{
 const proof=scopeProof();assert.equal(proof.baselineFiles,3719);
 assert.equal(proof.protectedFiles+proof.authorizedDelta.length,3719);
 assert.equal(proof.authorizedDelta.length,3);
 for(const f of proof.authorizedDelta){assert.notEqual(f.beforeSha256,f.afterSha256);assert.match(f.beforeGitBlob,/^[a-f0-9]{40}$/);assert.match(f.afterGitBlob,/^[a-f0-9]{40}$/);}
});
test('Owner authority cannot expand to catalog, engine, app or worker bytes',()=>{
 for(const path of ['integrations/consumer-repair-mission-poc/catalog-snapshot.mjs','integrations/fitment-engine-v1-poc/contract.mjs','integrations/consumer-repair-mission-poc/app.mjs','integrations/consumer-repair-mission-poc/offline-worker.mjs']){
  const modified=lock();modified.files[0].path=path;assert.throws(()=>validateOwnerDelta(modified),/Unauthorized Owner delta/);
 }
 const duplicate=lock();duplicate.files.push(duplicate.files[0]);assert.throws(()=>validateOwnerDelta(duplicate),/Duplicate Owner path/);
});
test('missing Owner hash/source-byte/served-byte proof never satisfies the complete gate',()=>{
 const synthetic={schema:'SYNTHETIC-INCOMPLETE-REPORTER-FIXTURE'};
 for(const scopeProof of [{ownerIssue:81,authorizedDelta:[]},{ownerIssue:75},null])
  assert.ok(summarize({...synthetic,scopeProof}).problems.includes('owner-delta-or-source-bytes-not-proved'));
 assert.ok(summarize(synthetic).problems.includes('served-source-bytes-not-proved'));
});
