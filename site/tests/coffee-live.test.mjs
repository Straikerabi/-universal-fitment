import assert from 'node:assert/strict';
import { coffeeCareSuggestions, getCoffeeBrandProfile, isLikelyCoffeeMachine } from '../src/data/coffee-support.js';
import { categories, products } from '../src/data/catalog.js';

assert.ok(categories.some(c=>c.id==='coffee'));
assert.equal(getCoffeeBrandProfile("De'Longhi")?.key,'delonghi');
assert.equal(getCoffeeBrandProfile('Saeco')?.key,'philips');
assert.equal(isLikelyCoffeeMachine({brand:"De'Longhi",name:'Magnifica'}),true);

const delonghi=coffeeCareSuggestions({brand:"De'Longhi",model:'ECAM22.110.B'});
assert.ok(delonghi.some(item=>item.identifier==='DLSC500' && item.status==='manufacturer_verified'));
assert.ok(delonghi.every(item=>item.source.url.startsWith('https://')));

const philips=coffeeCareSuggestions({brand:'Philips',model:'EP5547/90',name:'Series 5500 Kaffeevollautomat'});
assert.ok(philips.some(item=>item.identifier==='CA6903'));

const nespresso=coffeeCareSuggestions({brand:'Nespresso',model:'Vertuo Pop'});
assert.ok(nespresso.some(item=>item.status==='manufacturer_verified'));
console.log('All coffee live-data checks passed.');

const krups=products.find(p=>p.id==='coffee-krups-kp310510-real');
assert.ok(krups);
assert.ok(krups.aliases.includes('KP310'));
assert.ok(krups.parts.some(part=>part.id==='krups-ms624360' && part.fitment.status==='manufacturer_verified'));
