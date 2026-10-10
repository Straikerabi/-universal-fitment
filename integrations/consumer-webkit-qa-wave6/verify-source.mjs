import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {assetFiles,configSource,offlineConfig,workerSource} from '../consumer-repair-mission-poc/prepare-offline.mjs';
const consumer=new URL('../consumer-repair-mission-poc/',import.meta.url);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
export function expectedAssetHashes(){
 return {...offlineConfig().hashes,'/offline-config.mjs':hash(readFileSync(new URL('offline-config.mjs',consumer)))};
}
export async function verifyServedSource(base){
 assert.equal(readFileSync(new URL('offline-config.mjs',consumer),'utf8'),configSource(),'Regenerate offline manifest from real source bytes');
 assert.equal(readFileSync(new URL('offline-worker.mjs',consumer),'utf8'),workerSource(),'Regenerate classic worker constants from real source bytes');
 const files={...assetFiles,'/offline-config.mjs':'offline-config.mjs','/offline-worker.mjs':'offline-worker.mjs'};
 const rows=await Promise.all(Object.entries(files).map(async([url,file])=>{
  const response=await fetch(new URL(url,base));assert.equal(response.status,200,url);
  const sha256=hash(Buffer.from(await response.arrayBuffer()));
  assert.equal(sha256,hash(readFileSync(new URL(file,consumer))),'Served source differs from locked disk bytes: '+url);
  return {url,sha256};
 }));
 return {manifestByteIdentical:true,assets:rows,digest:hash(JSON.stringify(rows))};
}
