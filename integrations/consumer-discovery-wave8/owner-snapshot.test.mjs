import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogSnapshot} from '../consumer-repair-mission-poc/catalog-snapshot.mjs';
import {facets,findDevices,deviceProfile,profileMarkup} from './discovery.mjs';
test('actual owner Consumer snapshot is browsable with dynamic counts and zero assumed fits',()=>{
 const f=facets(catalogSnapshot);
 assert.ok(f.total>=1);
 assert.equal(findDevices(catalogSnapshot,{}).visibleCount,f.total);
 assert.deepEqual(f.brands,[...new Set(catalogSnapshot.devices.map(d=>d.brand))].sort((a,b)=>new Intl.Collator('de',{numeric:true,sensitivity:'base'}).compare(a,b)));
 for(const device of catalogSnapshot.devices){
  const p=deviceProfile(catalogSnapshot,device.id);
  assert.ok(p);assert.equal(p.fitmentConfirmed,false);assert.equal(p.purchaseAllowed,false);
  assert.equal(p.documentedCandidates,p.groups.reduce((n,g)=>n+g.parts.length,0));
  assert.match(profileMarkup(p),/Passung nicht bestätigt/);
 }
});