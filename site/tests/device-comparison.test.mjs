import assert from 'node:assert/strict';
import{compareDevices}from '../src/core/device-comparison.js';
import{products}from '../src/data/catalog.js';
const models=products.filter(p=>p.recordType==='model');
assert.equal(compareDevices([models[0].id]),null);assert.equal(compareDevices([models[0].id,models[0].id]),null);assert.equal(compareDevices(models.slice(0,5).map(p=>p.id)),null);assert.equal(compareDevices([models[0].id,'unknown']),null);assert.equal(compareDevices([models[0].id,products.find(p=>p.recordType==='family').id]),null);
for(let i=0;i<models.length;i++){
 const selected=[models[i],models[(i+1)%models.length]],r=compareDevices(selected.map(p=>p.id));assert.equal(r.products.length,2);
 for(const row of r.rows){assert.equal(row.values.length,2);assert.ok(row.values.every(v=>typeof v==='string'&&v.length));assert.equal(row.different,row.values[0]!==row.values[1]);}
 assert.deepEqual(r.rows.find(r=>r.label==='Geräte-Materialnummer').values,selected.map(p=>p.vacuumMeta.materialNumber||'Nicht belegt'));
 assert.ok(!r.rows.some(r=>/Preis|Bewertung|Passform|passt/i.test(r.label)),'comparison adds no invented price, quality or compatibility');
}
const sparse={...models[0],id:'sparse',controlType:'',equipment:[],facts:[]};const r=compareDevices(['sparse',models[1].id],{catalog:[sparse,models[1]]});assert.equal(r.rows.find(r=>r.label==='Saugkraftregulierung').values[0],'Nicht belegt');assert.equal(r.rows.find(r=>r.label==='Hersteller-Ausstattung').values[0],'Nicht belegt');
console.log('Device comparison checks passed: all catalog variants, 2–4 distinct concrete devices, source facts, differences and explicit missing values; no inferred compatibility or price.');
