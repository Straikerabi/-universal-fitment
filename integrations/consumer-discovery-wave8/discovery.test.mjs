import test from 'node:test';
import assert from 'node:assert/strict';
import {normalize,safeSourceUrl,facets,findDevices,deviceProfile,deviceCardMarkup,profileMarkup} from './discovery.mjs';
const source=url=>({name:'Offizielle Quelle',url,checkedAt:'2026-10-08'});
const snapshot={devices:[
 {id:'a',brand:'Miele',model:'Triflex HX2 Cat & Dog',reference:'11806000',productCode:null,type:'cordless',market:'DE',identifiers:[{type:'material-number',value:'11806000'}],candidatePartIds:['p1','unknown-id'],source:source('https://www.miele.de/product/11806000'),variantHint:'Materialnummer prüfen.'},
 {id:'b',brand:'Bosch',model:'BGL75X1PRQ',reference:'BGL75X1PRQ',type:'bagged',market:'DE',identifiers:[{type:'manufacturer-model',value:'BGL75X1PRQ'}],candidatePartIds:[],source:source('https://www.bosch-home.com/de/de/'),variantHint:'E-Nr. /xx vergleichen.'},
 {id:'c',brand:'Samsung',model:'VS20C95D4TK',reference:'VS20C95D4TK/WD',type:'cordless',market:'DE',identifiers:[{type:'manufacturer-model',value:'VS20C95D4TK'},{type:'manufacturer-model',value:'VS20C95D4TK/WD'}],candidatePartIds:[],source:source('https://www.samsung.com/de/support/'),variantHint:'Länderkennung prüfen.'}
],parts:[{id:'p1',name:'Feinstaubfilter',code:'13070280',assembly:'filter',source:source('https://www.miele.de/product/13070280')} ]};
test('search normalization handles umlauts, separators, and whitespace but preserves full suffixes',()=>{
 assert.equal(normalize('Bürste  WÄ / ß-02'),'BURSTEWASS02');
 assert.equal(normalize(' VS20C95D4TK/WD '),'VS20C95D4TKWD');
 assert.notEqual(normalize('VS20C95D4TK/WD'),normalize('VS20C95D4TK/WA'));
});
test('exact source identifiers rank ahead of partial names and do not confirm variants',()=>{
 const result=findDevices(snapshot,{query:'11806000'});
 assert.equal(result.items[0].device.id,'a');assert.equal(result.items[0].exactIdentifier,true);
 assert.equal(deviceProfile(snapshot,'a').fitmentConfirmed,false);
});
test('search accepts multipart brand/model and product codes without inventing fuzzy variants',()=>{
 assert.deepEqual(findDevices(snapshot,{query:'bosch BGL75'}).items.map(x=>x.device.id),['b']);
 assert.deepEqual(findDevices(snapshot,{query:'VS20C95D4TK/WA'}).items,[]);
 const extended={devices:[{...snapshot.devices[0],productCode:'39401035'}]};
 assert.equal(findDevices(extended,{query:'39401035'}).items[0].exactIdentifier,true);
});
test('filters intersect and never silently switch to a similar model',()=>{
 assert.equal(findDevices(snapshot,{query:'',brand:'Samsung',type:'bagged'}).visibleCount,0);
 assert.deepEqual(findDevices(snapshot,{brand:'Samsung',type:'cordless'}).items.map(x=>x.device.id),['c']);
 assert.deepEqual(findDevices(snapshot,{brand:'Hoover'}).items,[]);
});
test('facet counts and names derive from snapshot, including future imports',()=>{
 assert.deepEqual(facets(snapshot).brands,['Bosch','Miele','Samsung']);
 assert.equal(facets({...snapshot,devices:[...snapshot.devices,{...snapshot.devices[0],id:'d',brand:'Hoover'}]}).total,4);
 assert.deepEqual(facets({devices:[]}),{brands:[],types:[],total:0});
});
test('sort results deterministic, no mutation of input',()=>{
 const before=JSON.stringify(snapshot);
 assert.deepEqual(findDevices(snapshot,{sort:'brand'}).items.map(x=>x.device.id),['b','a','c']);
 assert.equal(JSON.stringify(snapshot),before);
});
test('profile parts include only explicit references and never upgrade them to fitment',()=>{
 const p=deviceProfile(snapshot,'a');
 assert.equal(p.documentedCandidates,1);assert.equal(p.unresolvedCandidateReferences,1);
 assert.equal(p.groups[0].parts[0].code,'13070280');assert.equal(p.fitmentStatus,'unclear');
 assert.equal(p.purchaseAllowed,false);assert.equal(p.fitmentConfirmed,false);
});
test('no candidate references is not interpreted as unavailable parts',()=>{
 const html=profileMarkup(deviceProfile(snapshot,'b'));
 assert.match(html,/noch keine Artikelidentitäten dokumentiert/);
 assert.doesNotMatch(html,/nicht erhältlich/);
});
test('unsafe links refused, only HTTPS without credentials permitted',()=>{
 assert.equal(safeSourceUrl('javascript:alert(1)'),null);
 assert.equal(safeSourceUrl('http://manufacturer.example/'),null);
 assert.equal(safeSourceUrl('https://evil:pw@host.test/'),null);
 assert.equal(safeSourceUrl('https://manufacturer.example/path'),'https://manufacturer.example/path');
});
test('all untrusted catalogue strings are HTML escaped',()=>{
 const poisoned={...snapshot,devices:[{...snapshot.devices[0],id:'" onclick="alert(1)',model:'<img src=x onerror=alert(1)>',variantHint:'<script>alert(1)</script>',source:source('javascript:alert(1)')} ]};
 const device=poisoned.devices[0];const c=deviceCardMarkup(device),p=profileMarkup(deviceProfile(poisoned,device.id));
 assert.doesNotMatch(c,/<img|onclick="alert/);
 assert.doesNotMatch(p,/<script>|href="javascript/);
 assert.match(p,/&lt;script&gt;/);
});
test('missing fields display honest unknown placeholders rather than guessed values',()=>{
 const blank={devices:[{id:'blank',candidatePartIds:[],identifiers:[]}],parts:[]};
 const p=deviceProfile(blank,'blank');
 assert.equal(p.reference,'Nicht dokumentiert');assert.equal(p.source.url,null);
 assert.match(profileMarkup(p),/Kein sicherer Herstellerlink dokumentiert/);
});
test('device not in snapshot yields no profile, never a near-match',()=>{
 assert.equal(deviceProfile(snapshot,'missing'),null);
 assert.match(profileMarkup(null),/Wähle ein Gerät/);
});