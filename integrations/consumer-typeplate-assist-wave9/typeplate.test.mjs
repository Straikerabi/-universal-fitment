import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {catalogSnapshot} from '../consumer-repair-mission-poc/catalog-snapshot.mjs';
import {snapshot,dataPolicy,normalize,escapeHtml,guidanceFor,brandNames,findMatches,identityProfile,matchMessage,safeSourceUrl,validatePublicInput} from './typeplate.mjs';
import {createPreviewServer,csp} from './serve.mjs';

const data=(devices,parts=[])=>({devices,parts});
const dummy=(id,reference,extra={})=>({id,brand:'Bosch',model:'BGL75X1PRQ',reference,identifiers:[],candidatePartIds:[],...extra});
const old=JSON.stringify(snapshot);
test('production module uses current Consumer snapshot by reference',()=>{
 assert.equal(snapshot,catalogSnapshot);
 assert.ok(snapshot.devices.length>0);
 assert.ok(snapshot.parts.length>0);
});
test('brand list is dynamic, distinct and alphabetically sorted',()=>{
 const brands=brandNames();assert.equal(brands.length,new Set(snapshot.devices.map(x=>x.brand)).size);
 assert.deepEqual(brands,[...brands].sort((a,b)=>a.localeCompare(b,'de')));
});
test('brand list handles absent devices',()=>assert.deepEqual(brandNames({}),[]));
test('normalization preserves hyphen, slash and leading zeros',()=>{
 assert.equal(normalize('  vs20c95d4tk/wd  '),'VS20C95D4TK/WD');
 assert.equal(normalize(' 00460431 '),'00460431');
 assert.equal(normalize('BGL75X1PRQ/01'),'BGL75X1PRQ/01');
 assert.notEqual(normalize('A/01'),normalize('A/02'));
 assert.notEqual(normalize('A-B'),normalize('AB'));
});
test('normalization handles missing input and harmless Unicode width',()=>{
 assert.equal(normalize(null),'');assert.equal(normalize('ＡＢ１２'),'AB12');
});
test('full recorded Samsung reference receives reference level, not fitment',()=>{
 const matches=findMatches('VS20C95D4TK/WD','Samsung');
 assert.equal(matches[0].device.reference,'VS20C95D4TK/WD');
 assert.equal(matches[0].level,'catalog-reference');
 assert.match(matchMessage(matches[0].level),/ungeprüft/);
});
test('model stem is an identifier, not full country suffix',()=>{
 const matches=findMatches('VS20C95D4TK','Samsung');
 const selected=matches.find(x=>x.device.reference==='VS20C95D4TK/WD');
 assert.ok(selected);
 assert.notEqual(selected.level,'catalog-reference');
});
test('different Samsung country suffix cannot silently match',()=>{
 assert.equal(findMatches('VS20C95D4TK/WA','Samsung').some(x=>x.level==='catalog-reference'),false);
 assert.equal(findMatches('VS20C95D4TK/WD','Samsung')[0].level,'catalog-reference');
});
test('Bosch index sibling cannot be promoted to exact identity',()=>{
 const d=data([dummy('a','BGL75X1PRQ/01'),dummy('b','BGL75X1PRQ/02')]);
 const a=findMatches('BGL75X1PRQ/01','all',d);
 assert.equal(a.filter(x=>x.level==='catalog-reference').length,1);
 assert.equal(a.find(x=>x.level==='catalog-reference').device.id,'a');
 assert.equal(findMatches('BGL75X1PRQ/03','all',d).some(x=>x.level==='catalog-reference'),false);
});
test('prefix-only Bosch model must remain variant unknown',()=>{
 const matches=findMatches('BGL75X1PRQ','all',data([dummy('a','BGL75X1PRQ/01'),dummy('b','BGL75X1PRQ/02')]));
 assert.equal(matches.length,2);assert.ok(matches.every(x=>x.level==='possible'));
});
test('Hoover product code is distinguishable from complete model reference',()=>{
 const match=findMatches('39401035','Hoover')[0];
 assert.ok(match);assert.equal(match.level,'product-code');
 assert.match(matchMessage(match.level),/Revision/);
});
test('partial search never returns an asserted complete reference',()=>{
 const matches=findMatches('V15');
 assert.ok(matches.length>0);
 assert.ok(matches.every(x=>x.level!=='catalog-reference'));
});
test('brand filter restricts matches without mutating source',()=>{
 const matches=findMatches('Miele','Bosch');assert.equal(matches.length,0);
 assert.equal(JSON.stringify(snapshot),old);
});
test('empty query allows browse without marking variants verified',()=>{
 const all=findMatches('');assert.equal(all.length,snapshot.devices.length);
 assert.ok(all.every(x=>x.level==='browse'));
});
test('numeric sorting and ties deterministic across repeated searches',()=>{
 assert.deepEqual(findMatches('vac').map(x=>x.device.id),findMatches('vac').map(x=>x.device.id));
});
test('false-like and absent data do not produce phantom matches',()=>{
 assert.deepEqual(findMatches('x','all',{devices:[]}),[]);
 assert.deepEqual(findMatches('x','all',{}),[]);
});
test('device profile is read only and never grants real fitment or commerce',()=>{
 for(const d of snapshot.devices){
  const p=identityProfile(d);
  assert.equal(p.realFitsConfirmed,0);assert.equal(p.fitment,'unknown');
  assert.equal(p.purchaseAllowed,false);assert.equal(p.userVariantVerified,false);
  assert.ok(p.candidates.every(x=>typeof x.id==='string'));
 }
 assert.equal(JSON.stringify(snapshot),old);
});
test('profile retains catalog reference, market and source absence without fabricating',()=>{
 const d=dummy('a','BGL/01',{market:null,source:null,variantHint:null});
 const p=identityProfile(d,data([d]));
 assert.equal(p.market,null);assert.equal(p.variantHint,null);assert.equal(p.source,null);
 assert.equal(p.candidates.length,0);
});
test('profile ignores unrecognized device IDs',()=>{
 assert.equal(identityProfile(dummy('foreign','X')),null);
});
test('candidate identities remain candidates and never positive confirmed passes',()=>{
 const d=dummy('a','BGL/01',{candidatePartIds:['p','unknown']});
 const p=identityProfile(d,data([d],[{id:'p',name:'Filter',code:'00460431',assembly:'filter'}]));
 assert.equal(p.candidates.length,1);assert.equal(p.candidates[0].code,'00460431');
 assert.equal(p.realFitsConfirmed,0);
});
test('brand-specific guidance covers actual five brands with caution',()=>{
 for(const b of brandNames()){const h=guidanceFor(b);
  assert.ok(h.label&&h.locate&&h.reminder);
  assert.match(h.reminder,/nicht|kein|keine|weder|offen|auseinanderfallen/i);
 }
 assert.equal(guidanceFor('Unbekannt').label,'Modell- und Typenkennung');
});
test('no precise physical label location is guessed',()=>{
 for(const b of brandNames())assert.doesNotMatch(guidanceFor(b).locate,/unter dem Akku|hinter dem Filter|an der Unterseite|rechts unten/i);
});
test('source links reject unsafe schemes, credentials, spoofed hosts and ports',()=>{
 for(const u of [
  'javascript:alert(1)','http://www.miele.de/product/1','https://www.miele.de.evil.invalid/p',
  'https://abc@www.miele.de/p','https://www.miele.de:444/p','https://example.com/p'
 ])assert.equal(safeSourceUrl({url:u},'Miele'),null);
 assert.equal(safeSourceUrl(null,'Miele'),null);
});
test('official identity link is shown only for its declared brand',()=>{
 const s={url:'https://www.miele.de/product/11806000'};
 assert.equal(safeSourceUrl(s,'Miele'),s.url);
 assert.equal(safeSourceUrl(s,'Samsung'),null);
});
test('escape function neutralizes HTML delimiters and attributes',()=>{
 const e=escapeHtml('<img src=x onerror="x">&' + "'");
 assert.doesNotMatch(e,/<img|onerror="/);
 assert.match(e,/&lt;img/);assert.match(e,/&quot;/);assert.match(e,/&#39;/);
});
test('input length and embedded newlines rejected; no unwanted trimming of suffix',()=>{
 assert.equal(validatePublicInput('A'.repeat(100)).ok,true);
 assert.equal(validatePublicInput('A'.repeat(101)).ok,false);
 assert.equal(validatePublicInput('AA\nBB').ok,false);
 assert.equal(validatePublicInput('VS20C95D4TK/WA').ok,true);
});
test('privacy contract is manual-only with zero real positive fitments',()=>{
 assert.deepEqual(dataPolicy,{transport:'none',persistence:'none',camera:'none',ocr:'none',
  realFitmentsConfirmed:0,automaticVariantConfirmation:false});
});
test('static UI has no injection sink, camera upload, network request or storage',()=>{
 const app=readFileSync(new URL('./app.mjs',import.meta.url),'utf8');
 const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
 assert.doesNotMatch(app,/innerHTML|outerHTML|fetch\s*\(|localStorage|sessionStorage|navigator\.mediaDevices|indexedDB/);
 assert.doesNotMatch(html,/type=["']file|<form[^>]+action=/i);
 assert.match(html,/Keine automatische Erkennung/);
 assert.match(html,/keine Seriennummer/);
 assert.match(html,/no-referrer/);
});
test('mobile stylesheet supports focus, narrow phones, dark mode and reduced motion',()=>{
 const css=readFileSync(new URL('./styles.css',import.meta.url),'utf8');
 for(const token of ['focus-visible','max-width:390px','prefers-color-scheme:dark','prefers-reduced-motion:reduce','min-height:44px'])assert.ok(css.includes(token),token);
});
test('server CSP forbids outgoing requests, frames, workers and forms',()=>{
 for(const clause of ["connect-src 'none'","frame-ancestors 'none'","worker-src 'none'","form-action 'none'"])assert.ok(csp.includes(clause));
});
test('loopback preview serves only allowlisted assets, never shared worker or lock',async t=>{
 const server=createPreviewServer();
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(()=>new Promise(resolve=>server.close(resolve)));
 const root='http://127.0.0.1:'+server.address().port;
 const path='/integrations/consumer-typeplate-assist-wave9/';
 const ok=await fetch(root+path);assert.equal(ok.status,200);assert.match(await ok.text(),/Typenschild-Hilfe/);
 assert.match(ok.headers.get('content-security-policy'),/connect-src 'none'/);
 assert.equal(ok.headers.get('referrer-policy'),'no-referrer');
 const imported=await fetch(root+'/integrations/consumer-repair-mission-poc/catalog-snapshot.mjs');
 assert.equal(imported.status,200);assert.match(await imported.text(),/catalogSnapshot/);
 for(const forbidden of [
  '/integrations/consumer-repair-mission-poc/app.mjs',
  '/integrations/consumer-repair-mission-poc/offline-worker.mjs',
  '/integrations/consumer-launch-preflight-wave6/source-lock.json',
  '/integrations/consumer-typeplate-assist-wave9/README.md',
  '/integrations/consumer-typeplate-assist-wave9/../consumer-repair-mission-poc/offline-worker.mjs'
 ]){const response=await fetch(root+forbidden);assert.equal(response.status,404,forbidden);}
 const post=await fetch(root+path,{method:'POST'});assert.equal(post.status,405);
 const head=await fetch(root+path,{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
});
