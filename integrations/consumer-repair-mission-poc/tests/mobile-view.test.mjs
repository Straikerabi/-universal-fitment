import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogSnapshot} from '../catalog-snapshot.mjs';
import {assemblies,freshMission,transition,assessment,checklist,restoreMission,exportMission} from '../mission-state.mjs';
import {browseParts,defaultFilters,cleanFilters,checklistSections,sortRows,sourceRegion} from '../parts-view.mjs';
import {buildSyntheticUiRequest} from '../../dual-platform-owner-review/ui-fixtures.mjs';
import {inspectOnBothSurfaces} from '../../dual-platform-owner-review/bridge.mjs';

const real=id=>transition(freshMission(),{type:'device',value:id||catalogSnapshot.devices[0].id});
test('all five assembly groups preserve existing device memberships and zero confirmed real parts',()=>{
 assert.deepEqual(assemblies.map(a=>a.id),['filter','brush','battery','hose','body']);
 for(const device of catalogSnapshot.devices){
  const view=browseParts(real(device.id));
  assert.equal(view.groups.length,5);assert.equal(view.candidates,device.candidatePartIds.length);
  assert.deepEqual(view.groups.flatMap(g=>g.parts.map(p=>p.id)).sort(),[...device.candidatePartIds].sort());
  for(const group of view.groups){assert.equal(group.confirmedReal,0);for(const part of group.parts){assert.equal(part.fitmentConfirmed,false);assert.equal(part.fitmentStatus,'unclear');assert.ok(part.source);}}
 }
});
test('literal part-code, assembly and type filters intersect without inferring a fitment',()=>{
 const s=real('vac-samsung-model-vs20c95d4tk');
 assert.equal(browseParts(s,{query:'VCA-SAPB95/WA',assembly:'battery',type:'energy'}).visibleCount,1);
 assert.equal(browseParts(s,{query:'VCA-SAPB95/WD'}).visibleCount,0);
 assert.equal(browseParts(s,{query:'VCA-SAPB95/WA',type:'filter'}).visibleCount,0);
 assert.equal(browseParts(real(),{query:'Filter'}).visibleCount,1);
 assert.equal(assessment(s).status,'unclear');
});
test('source website locale never becomes a device-region fitment claim',()=>{
 const s=real('vac-hoover-model-hf202p011'),device=catalogSnapshot.devices.find(d=>d.id===s.deviceId);
 const part=browseParts(s).groups.flatMap(g=>g.parts)[0];
 assert.equal(device.market,'DE');assert.equal(sourceRegion(device.source),'DE');
 assert.equal(sourceRegion(part.source),'GB (en_GB)');assert.equal(part.fitmentConfirmed,false);
 assert.equal(assessment(s).status,'unclear');
 assert.equal(sourceRegion({url:'https://example.invalid/synthetic'}),'nicht dokumentiert');
});
test('original identity evidence remains distinct from alternatives and synthetic evidence',()=>{
 const s=real();assert.equal(browseParts(s,{evidence:'original'}).visibleCount,3);
 assert.equal(browseParts(s,{evidence:'alternative'}).visibleCount,0);
 assert.equal(browseParts(s,{evidence:'synthetic'}).visibleCount,0);
 const d=transition(freshMission('synthetic'),{type:'scenario',value:'filter-positive'});
 assert.equal(browseParts(d,{evidence:'original'}).visibleCount,0);
 assert.equal(browseParts(d,{evidence:'synthetic'}).visibleCount,1);
});
test('filter miss and missing documentation have different empty-state reasons',()=>{
 const s=real();
 assert.equal(browseParts(s,{query:'not-an-existing-part'}).groups[0].emptyReason,'filtered');
 assert.equal(browseParts(s).groups.find(g=>g.id==='hose').emptyReason,'not-documented');
 assert.equal(browseParts(real('vac-bosch-model-bch3all21')).candidates,0);
});
test('sorting is deterministic, read-only and price requests cannot enable commerce',()=>{
 const s=real('vac-samsung-model-vs20c95d4tk'),before=JSON.stringify(catalogSnapshot);
 for(const sort of ['name','code','price']){const view=browseParts(s,{sort});assert.equal(view.priceSortAvailable,false);assert.equal(view.candidates,2);}
 assert.deepEqual(cleanFilters({sort:'price'}),defaultFilters());
 assert.equal(JSON.stringify(catalogSnapshot),before);
 const synthetic=[{id:'DEMO-A',name:'Zubehör',code:'DEMO-1'},{id:'DEMO-B',name:'Filter B',code:'DEMO-10'},{id:'DEMO-C',name:'Filter A',code:'DEMO-2'}];
 assert.deepEqual(sortRows(synthetic,'name').map(x=>x.id),['DEMO-C','DEMO-B','DEMO-A']);
 assert.deepEqual(sortRows(synthetic,'code').map(x=>x.id),['DEMO-A','DEMO-C','DEMO-B']);
 assert.deepEqual(synthetic.map(x=>x.id),['DEMO-A','DEMO-B','DEMO-C']);
});
test('filters never discard selected parts or completed notes',()=>{
 let s=transition(real(),{type:'assembly',value:'filter'});
 s=transition(s,{type:'part',value:'miele-part-13070280'});s=transition(s,{type:'done',value:'identity'});
 const saved=JSON.stringify(s);assert.equal(browseParts(s,{evidence:'alternative'}).visibleCount,0);
 assert.equal(JSON.stringify(s),saved);assert.match(exportMission(s),/13070280/);
});
test('reselecting the same assembly preserves work; switching assembly clears stale work',()=>{
 let s=transition(real(),{type:'assembly',value:'filter'});s=transition(s,{type:'part',value:'miele-part-13070280'});
 assert.deepEqual(transition(s,{type:'assembly',value:'filter'}).selectedPartIds,s.selectedPartIds);
 assert.deepEqual(transition(s,{type:'assembly',value:'hose'}).selectedPartIds,[]);
});
test('mismatched user variant remains a missing item in review, checklist and export',()=>{
 let s=transition(real('vac-samsung-model-vs20c95d4tk'),{type:'assembly',value:'filter'});
 s=transition(s,{type:'variant',known:true,code:'VS20C95D4TK/WA'});
 assert.ok(assessment(s).missing.some(x=>x.includes('weicht')));
 assert.ok(checklist(s).some(x=>x.label.includes('weicht')));assert.match(exportMission(s),/weicht/);
 assert.equal(assessment(s).status,'unclear');
});
test('grouped checklist retains every item once and never marks a repair complete',()=>{
 const s=transition(real(),{type:'assembly',value:'filter'}),sections=checklistSections(s);
 assert.equal(new Set(sections.flatMap(x=>x.items).map(x=>x.id)).size,checklist(s).length);
 assert.equal(sections.flatMap(x=>x.items).length,checklist(s).length);
 assert.equal(assessment(s).completeKit,false);
});
test('schema-1 missions and duplicate done markers cannot survive wave4 restore',()=>{
 const s=transition(real(),{type:'assembly',value:'filter'});
 assert.equal(restoreMission({...s,version:1}).deviceId,null);
 assert.equal(restoreMission({...s,done:['identity','identity']}).deviceId,null);
});
test('synthetic UI status still equals the existing shared engine for each assembly and revision state',()=>{
 for(const id of ['filter-positive','revision-missing','filter-negative','connector-negative','kit-incomplete'])for(const known of [true,false])for(const group of assemblies){
  let s=transition(freshMission('synthetic'),{type:'scenario',value:id});
  s=transition(s,{type:'variant',known});s=transition(s,{type:'assembly',value:group.id});
  const request=buildSyntheticUiRequest(id,{variantKnown:known,assemblyId:group.id});
  const expected=inspectOnBothSurfaces(request,{tenantId:'demo-consumer',caseId:'demo-'+id});
  assert.equal(assessment(s).status,expected.consumer.status);assert.equal(assessment(s).purchaseAllowed,false);
  assert.equal(browseParts(s).groups.reduce((n,g)=>n+g.confirmedReal,0),0);
 }
});
