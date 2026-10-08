import assert from 'node:assert/strict';
import fs from 'node:fs';
import {products} from '../src/data/catalog.js';
import {repairProviders,rentalProviders,repairsFor,rentalsFor} from '../src/data/services.js';
import {repairSearchUrl,repairRequestText} from '../src/core/services.js';
for(const brand of ['Miele','Bosch','Dyson','AEG']){
 const devices=products.filter(p=>p.brand===brand);
 assert.ok(devices.length>50);
 for(const p of devices){assert.equal(repairsFor(p).length,1);assert.equal(repairsFor(p)[0].brand,brand);assert.equal(rentalsFor(p).length,1);}
}
assert.deepEqual(repairsFor({brand:'Miele',category:'car'}),[]);
assert.deepEqual(repairsFor({brand:'Unknown',category:'vacuum'}),[]);
assert.deepEqual(rentalsFor({category:'car'}),[]);
for(const p of [...repairProviders,...rentalProviders])assert.equal(new URL(p.url).protocol,'https:');
assert.equal(repairsFor().length,4);
assert.match(repairRequestText(null,null,null),/Gerät: bitte ergänzen/);
const url=repairSearchUrl({brand:'Bosch',place:'  Eschelbronn  '});
const query=new URL(url).searchParams.get('query');
assert.match(query,/Bosch Staubsauger Reparatur Elektrogeräte Kundendienst Eschelbronn/);
assert.doesNotMatch(query,/Kfz|Werkstatt|km/);
for(const place of ['', 'x', '<script>', 'a'.repeat(101), 'Berlin\nParis'])assert.equal(repairSearchUrl({place}),null);
assert.ok(repairSearchUrl({place:'10115'}));
assert.doesNotMatch(new URL(repairSearchUrl({brand:'Injected brand',place:'Berlin'})).searchParams.get('query'),/Injected/);
const p=products.find(p=>p.brand==='Bosch');
assert.match(repairRequestText(p,null,{productId:p.id,eNumber:p.model+'/02'}),/E-Nr\.:/);
assert.doesNotMatch(repairRequestText(p,null,{productId:'other',eNumber:'wrong'}),/wrong/);
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
assert.match(app,/import\(SERVICE_MODULE\)/);
assert.doesNotMatch(app,/Spätere Partnerfilter|Kfz Werkstatt/);
assert.match(app,/keine geprüften Partner/);
assert.match(app,/kein Miet- oder Testangebot belegt/);
assert.match(app,/version!==renderVersion/);
assert.equal(rentalProviders[0].deposit,70);assert.equal(rentalProviders[0].rates[1].amount,37);
assert.ok(fs.existsSync(new URL('../services-v1.26.8.js',import.meta.url)));
const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');
assert.doesNotMatch(sw.split("self.addEventListener('install'")[0],/services-v/,'optional pack must not be precached');
console.log('Service checks passed: all catalog devices, brand/category boundaries, local search, rental scope and optional pack.');
