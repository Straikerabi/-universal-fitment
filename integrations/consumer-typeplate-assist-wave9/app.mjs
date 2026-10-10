import {snapshot,brandNames,findMatches,identityProfile,matchMessage,guidanceFor,safeSourceUrl,validatePublicInput} from './typeplate.mjs';
const byId=id=>document.getElementById(id);
const field=byId('code'),brand=byId('brand'),results=byId('matches'),status=byId('resultStatus'),profile=byId('profile');
let selectedId=null;
const dom=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=String(text);return el;};
function facts(list,term,value){
 const dt=dom('dt',null,term),dd=dom('dd',null,value??'Nicht dokumentiert');
 list.append(dt,dd);
}
function updateHint(){
 const h=guidanceFor(brand.value);
 byId('guideTitle').textContent=h.label;
 byId('guideDescription').textContent=h.locate;
 byId('guideReminder').textContent=h.reminder;
}
function renderProfile(){
 const d=snapshot.devices.find(x=>x.id===selectedId);
 const p=identityProfile(d);
 profile.hidden=!p;
 byId('profileContent').replaceChildren();
 if(!p)return;
 byId('profileTitle').textContent=p.brand+' · '+p.model;
 const root=byId('profileContent');
 root.append(dom('p','warning','Katalogreferenz gefunden. Die Ausführung deines eigenen Geräts, die Passung und der Einbau sind NICHT bestätigt.'));
 const dl=dom('dl','fact-grid');
 facts(dl,'Katalog-Referenz',p.reference);
 facts(dl,'Produktcode (falls erfasst)',p.productCode);
 facts(dl,'Quellenmarkt',p.market);
 facts(dl,'Gerätevariante',p.userVariantVerified?'Geprüft':'Nicht überprüft');
 facts(dl,'Passungsstatus','Unbekannt · 0 bestätigte reale Teile');
 root.append(dl);
 const variant=dom('div','profile-box');
 variant.append(dom('h4',null,'Varianten-Hinweis'));
 variant.append(dom('p',null,p.variantHint||'Für dieses Gerät liegt kein eigener Varianten-Hinweis vor.'));
 root.append(variant);
 const ids=dom('div','profile-box');
 ids.append(dom('h4',null,'Beobachtete Kennungen (nur Identitäten)'));
 if(!p.identifiers.length) ids.append(dom('p','muted','Keine zusätzlichen Kennungen erfasst.'));
 else {const ul=dom('ul','identifier-list');for(const id of p.identifiers){ul.append(dom('li',null,id.type+': '+id.value));}ids.append(ul);}
 root.append(ids);
 const parts=dom('details','parts-disclosure');
 const sum=dom('summary',null,'Beobachtete Teilekandidaten · '+p.candidates.length+' (Passung offen)');
 parts.append(sum);
 if(p.candidates.length){
  const ul=dom('ul','candidate-list');for(const item of p.candidates)ul.append(dom('li',null,item.name+' · '+item.code+' · Identität beobachtet, Einbau ungeprüft'));parts.append(ul);
 }else parts.append(dom('p','muted','Keine Teilekandidaten dokumentiert. Das bedeutet nicht, dass Ersatzteile nicht existieren.'));
 root.append(parts);
 const source=dom('div','profile-box');
 source.append(dom('h4',null,'Dokumentierte Herstellerreferenz'));
 const url=safeSourceUrl(p.source,p.brand);
 if(url){
  const link=dom('a','source-link','Herstellerseite extern öffnen ↗');link.href=url;link.rel='noopener noreferrer';link.target='_blank';
  source.append(link);
  source.append(dom('p','muted','Erfasst: '+(p.source?.checkedAt||'nicht dokumentiert')+'. Quelle zur Geräteidentität, keine Lizenz- oder Kompatibilitätsfreigabe.'));
 }else source.append(dom('p','muted','Keine freigegebene externe Quellenadresse für diesen Hersteller-Eintrag.'));
 root.append(source);
}
function renderMatches(){
 const validation=validatePublicInput(field.value);
 byId('validation').hidden=validation.ok;
 byId('validation').textContent=validation.reason||'';
 if(!validation.ok){results.replaceChildren();status.textContent='Ungültige Eingabe.';selectedId=null;renderProfile();return;}
 const found=findMatches(field.value,brand.value);
 status.textContent=found.length+' Katalogeinträge sichtbar · '+(snapshot.devices?.length||0)+' insgesamt · 0 bestätigte reale Passungen';
 results.replaceChildren();
 if(!found.length){const empty=dom('div','empty');empty.append(dom('strong',null,'Kein dokumentierter Katalogtreffer'));empty.append(dom('p',null,'Prüfe die vollständige Kennung einschließlich Suffix und Index. Kein Treffer bedeutet nicht, dass das Gerät oder ein Ersatzteil nicht existiert.'));results.append(empty);}
 for(const entry of found){
  const d=entry.device,button=dom('button','result-card');
  button.type='button';button.dataset.deviceId=d.id;
  button.setAttribute('aria-pressed',String(d.id===selectedId));
  button.append(dom('span','result-name',String(d.brand||'')+' · '+String(d.model||'Unbekannt')));
  button.append(dom('span','result-code',String(d.reference||'Kennung offen')+' · Markt '+String(d.market||'offen')));
  button.append(dom('span','result-evidence',matchMessage(entry.level)));
  results.append(button);
 }
 if(selectedId&&!found.some(x=>x.device.id===selectedId))selectedId=null;
 renderProfile();
}
for(const name of brandNames()){const option=dom('option',null,name);option.value=name;brand.append(option);}
byId('searchForm').addEventListener('submit',event=>{event.preventDefault();renderMatches();});
field.addEventListener('input',renderMatches);
brand.addEventListener('change',()=>{selectedId=null;updateHint();renderMatches();});
results.addEventListener('click',event=>{
 const button=event.target.closest('button[data-device-id]');
 if(!button||!results.contains(button))return;
 selectedId=button.dataset.deviceId;renderMatches();
 byId('profileTitle').setAttribute('tabindex','-1');byId('profileTitle').focus({preventScroll:false});
});
byId('reset').addEventListener('click',()=>{
 field.value='';brand.value='all';selectedId=null;updateHint();renderMatches();field.focus();
});
updateHint();renderMatches();
