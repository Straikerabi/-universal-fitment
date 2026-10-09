import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {cacheName,catalogFingerprint,assetPaths} from '../offline-config.mjs';
import {configSource,offlineConfig} from '../prepare-offline.mjs';
import {dataFingerprint,freshMission,restoreMission} from '../mission-state.mjs';

test('offline cache manifest is current and contains only explicitly allowed local UI/core assets',()=>{
 const c=offlineConfig();
 assert.equal(fs.readFileSync(new URL('../offline-config.mjs',import.meta.url),'utf8'),configSource());
 assert.equal(cacheName,c.cacheName);assert.deepEqual(assetPaths,c.assetPaths);
 assert.ok(assetPaths.every(url=>url.startsWith('/')&&!url.includes('..')&&!url.includes('?')));
 assert.ok(assetPaths.every(url=>!url.includes('tests')&&!url.includes('catalog-lock')&&!url.includes('coverage')));
 assert.equal(new Set(assetPaths).size,assetPaths.length);
});
test('mission cache is bound to catalog, shared core and fixture bytes without storing engine responses',()=>{
 assert.equal(dataFingerprint,catalogFingerprint);
 const s=freshMission();assert.equal(s.version,2);
 assert.equal(restoreMission({...s,fingerprint:'old-catalog-or-core'}).deviceId,null);
 assert.equal(restoreMission({...s,response:{status:'supported'}}).deviceId,null);
 assert.deepEqual(restoreMission(s),s);
});
