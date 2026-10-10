import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {workerSource,configSource,offlineConfig} from '../../consumer-repair-mission-poc/prepare-offline.mjs';
test('classic worker and manifest generation reaches a byte-identical fixed point',()=>{
 assert.equal(readFileSync(new URL('../../consumer-repair-mission-poc/offline-worker.mjs',import.meta.url),'utf8'),workerSource());
 assert.equal(readFileSync(new URL('../../consumer-repair-mission-poc/offline-config.mjs',import.meta.url),'utf8'),configSource());
 assert.equal(workerSource(),workerSource());assert.equal(configSource(),configSource());
 assert.ok(workerSource().includes('const cacheName='+JSON.stringify(offlineConfig().cacheName)));
 const events=[];new Script(workerSource()).runInNewContext({self:{addEventListener:name=>events.push(name)}});
 assert.deepEqual(events,['install','activate','fetch']);
});
