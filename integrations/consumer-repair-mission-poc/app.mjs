import {catalogSnapshot} from './catalog-snapshot.mjs';
import {mockScenarios} from './mock-fitment-adapter.mjs';
import {defaultFilters,browseParts,sourceRegion} from './parts-view.mjs';
import {filtersMarkup,browseSummary,groupsMarkup,activePartsMarkup,checklistMarkup,variantMarkup} from './mobile-ui.mjs';
import {cacheName} from './offline-config.mjs';
import {assemblies,problems,freshMission,currentDevice,searchDevices,candidateParts,transition,assessment,checklist,exportMission,exportRepairPassport,saveMission,loadMission,storageKey} from './mission-state.mjs';
const $=s=>document.querySelector(s),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels=['Gerät','Ausführung','Baugruppe','Passung','Checkliste'];
let storage;try{storage=localStorage;}catch{storage={getItem:()=>null,setItem:()=>{throw Error('Unavailable');},removeItem:()=>{}};}
let state=loadMission(storage),query='',brand='all',saveFailed=false;
let partFilters=defaultFilters(),openGroups=null,filterPanelOpen=false;
let offlineReady=false,offlineDisabled=false;
try{offlineDisabled=storage.getItem('uf-consumer-offline-disabled')==='true';}catch{}
const icons={filter:'M7 5h18v22H7z M11 9v14 M16 9v14 M21 9v14',brush:'M4 22h24v6H4z M8 22l3-10h10l3 10 M12 12V5h8v7 M9 25v3 M15 25v3 M21 25v3',battery:'M7 7h18v21H7z M12 4h8v3 M17 12l-5 7h5l-2 5 6-8h-5z',hose:'M5 7h6v6H5z M8 13v8c0 5 4 7 8 7s8-3 8-7V9 M21 4h6v6h-6z',body:'M7 8h18v18H7z M10 4h12v4 M11 12h10v10H11z',device:'M12 3h8v9h-8z M16 12v11 M8 24h16v5H8z'};
function icon(id,extra=''){return `<svg class="mini-icon ${extra}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[id]||icons.device}"/></svg>`;}
function graphic(suffix='rail'){return `<svg class="device-graphic" viewBox="0 0 340 300" role="img" aria-label="Neutrale eigene Baugruppen-Illustration; kein konkretes Gerätemodell"><defs><pattern id="dot-grid-${suffix}" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#658474" opacity=".2"/></pattern></defs><rect width="340" height="300" fill="url(#dot-grid-${suffix})" rx="22"/><circle cx="174" cy="141" r="104" fill="#c9daca" opacity=".28"/><g transform="rotate(22 170 145)"><rect x="154" y="88" width="27" height="150" rx="11" fill="#759c86"/><rect x="125" y="31" width="97" height="80" rx="23" fill="#255c4a"/><rect x="146" y="47" width="51" height="50" rx="11" fill="#e1edda"/><path d="M152 53v38m10-38v38m10-38v38m10-38v38m10-38v38" stroke="#739c83" stroke-width="2"/><rect x="201" y="26" width="28" height="40" rx="8" fill="#88b799"/><rect x="121" y="18" width="78" height="14" rx="7" fill="#183d32"/><rect x="116" y="230" width="106" height="32" rx="13" fill="#255c4a"/><rect x="125" y="241" width="88" height="9" rx="4" fill="#a9c7af"/></g><g fill="#f5f8ed" stroke="#557e63" stroke-width="1.5"><circle cx="83" cy="76" r="15"/><circle cx="268" cy="106" r="15"/><circle cx="211" cy="254" r="15"/></g><g fill="#255c4a" font-family="-apple-system,sans-serif" font-size="10" font-weight="700" text-anchor="middle"><text x="83" y="80">01</text><text x="268" y="110">02</text><text x="211" y="258">03</text></g><path d="M97 76h25m132 30h-27m-16 133v-18" fill="none" stroke="#557e63" stroke-dasharray="3 4"/></svg>`;}
function feedback(message,error=false){$('#feedback').textContent=message;$('#feedback').classList.toggle('error',error);}
function persist(){saveFailed=!saveMission(storage,state);if(saveFailed)feedback('Speichern nicht möglich. Die Mission bleibt für diese Sitzung verfügbar; Text sichern.',true);}
function update(action,focus=false){filterPanelOpen=$('#partFilterOptions')?.open||false;state=transition(state,action);persist();render(focus);}
function resetBrowse(){partFilters=defaultFilters();openGroups=null;filterPanelOpen=false;}
function refreshParts(){
 if($('#assemblyGroups'))$('#assemblyGroups').innerHTML=groupsMarkup(state,partFilters,openGroups||new Set(),sourceBox,icon);
 if($('#partCandidates'))$('#partCandidates').innerHTML=activePartsMarkup(state,partFilters,sourceBox);
 if($('#browseSummary'))$('#browseSummary').textContent=browseSummary(state,state.step===4?{...partFilters,assembly:state.assemblyId}:partFilters);
}
function sourceBox(source,scope='Geräteidentität'){return `<div class="source-box"><strong>${esc(scope)}</strong><p>${esc(source.name)} · Katalogbeobachtung ${esc(source.checkedAt.slice(0,10))}</p><p>Quellenwebsite ${esc(sourceRegion(source))} · keine Übertragung auf andere Länder oder Revisionen.</p><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">Herstellerbeleg ansehen ↗</a><p>Quellenlink zur Identität. Keine aktuelle Kauf-, Bestands- oder Einbaufreigabe.</p></div>`;}
function pass(){const d=currentDevice(state);return d?`<div class="device-pass">${icon('device')}<div><strong>${esc(d.brand)} · ${esc(d.model)}</strong><small>Quellenkennung: <code>${esc(d.reference)}</code>${d.productCode?` · Produktcode <code>${esc(d.productCode)}</code>`:''}</small><small>${state.mode==='synthetic'?'Fiktives Gerät · synthetische Antworten':'Herstellerquelle dokumentiert · Passung separat zu prüfen'}</small>${variantMarkup(state)}</div></div>`:'';}
function actions(next='Weiter',disabled=false){return `<div class="actions">${state.step>1?'<button class="secondary" data-step="'+(state.step-1)+'">Zurück</button>':''}${state.step<5?`<button class="primary" data-step="${state.step+1}" ${disabled?'disabled':''}>${esc(next)} <span aria-hidden="true">→</span></button>`:''}</div>`;}
function heading(title,copy){return `<p class="step-kicker">${String(state.step).padStart(2,'0')} / ${labels[state.step-1].toUpperCase()}</p><h2>${title}</h2><p class="lede">${copy}</p>`;}
function deviceResults(){const rows=searchDevices(query,brand);return rows.length?rows.map(d=>`<button class="device-option" data-device="${esc(d.id)}" aria-pressed="${d.id===state.deviceId}">${icon('device')}<span class="device-text"><strong>${esc(d.brand)} · ${esc(d.model)}</strong><small><code>${esc(d.reference)}</code>${d.productCode?' · '+esc(d.productCode):''} · ${esc(d.market)}</small></span><span class="arrow" aria-hidden="true">${d.id===state.deviceId?'✓':'↗'}</span></button>`).join(''):`<div class="empty">Diese Kennung ist in den ${catalogSnapshot.devices.length} Pilotgeräten nicht erfasst. Es wird keine ähnliche Variante automatisch übernommen. Prüfe die Herstellerquelle oder eine andere genaue Kennung.</div>`;}
function stepOne(){
 if(state.mode==='synthetic')return heading('Erlebe die drei Passungszustände.','Wähle ein fiktives Beispiel. Gerät, Teile und Belege sind vollständig synthetisch.')+`<div class="device-results">${mockScenarios.map(s=>`<button class="device-option" data-scenario="${s.id}" aria-pressed="${state.scenarioId===s.id&&state.deviceId!==null}">${icon(s.assembly)}<span class="device-text"><strong>${s.label}</strong><small>DEMO-VAC-A · ${s.variant||'Ausführung offen'} · keine reale Marke</small></span><span class="arrow" aria-hidden="true">↗</span></button>`).join('')}</div>`+actions('Demo-Ausführung ansehen',!state.deviceId);
 return heading('Welches Gerät ist es?','Beginne mit der genauen Kennung. Ein Serienname allein sagt noch nicht, welches Teil passt.')+`<div class="search-row"><label><span class="field-label">Modell oder Gerätekennung</span><input id="deviceQuery" type="search" value="${esc(query)}" placeholder="z. B. VS20C95D4TK/WD" autocomplete="off" spellcheck="false" autocapitalize="characters"></label><label><span class="field-label">Marke</span><select id="brandFilter"><option value="all">Alle</option>${[...new Set(catalogSnapshot.devices.map(x=>x.brand))].map(x=>`<option ${brand===x?'selected':''}>${x}</option>`).join('')}</select></label></div><p class="catalog-note">${catalogSnapshot.devices.length} echte Pilotgeräte · ${new Set(catalogSnapshot.devices.map(d=>d.brand)).size} Marken · Snapshot v${catalogSnapshot.version}</p><div id="deviceResults" class="device-results" aria-label="Kataloggeräte">${deviceResults()}</div><label class="problem-field"><span class="field-label">Was möchtest du klären?</span><select id="problem">${problems.map(p=>`<option value="${p.id}" ${state.problemId===p.id?'selected':''}>${p.label}</option>`).join('')}</select></label>`+actions('Ausführung bestimmen',!state.deviceId)+`<p class="footer-context">Die Auswahl identifiziert einen Katalogeintrag. Sie bestätigt noch keine Passung.</p>`;
}
function stepTwo(){const d=currentDevice(state),fixture=mockScenarios.find(x=>x.id===state.scenarioId);return heading('Die Ausführung macht den Unterschied.','Behalte Zusätze, Länderkennung und Revision bei. Fehlende Angaben dürfen offen bleiben.')+pass()+`<div class="panel"><h3>Woran du deine Ausführung erkennst</h3><p class="field-help">${esc(d.variantHint)}</p>${d.productCode?`<div class="fact"><span>Produktcode aus der Herstellerquelle</span><strong><code>${esc(d.productCode)}</code> · Markt ${esc(d.market)}</strong></div>`:''}${state.mode==='real'?sourceBox(d.source):'<span class="tag demo">Synthetische Ausführung · kein Typenschild eines realen Geräts</span>'}<fieldset class="choice-group"><legend>${state.mode==='synthetic'?'Demo-Ausführung verwenden?':'Ist die Kennung am eigenen Gerät abgelesen?'}</legend><label class="radio-choice"><input type="radio" name="variant" value="known" ${state.variantKnown?'checked':''} ${state.mode==='synthetic'&&!fixture.variant?'disabled':''}><span><strong>${state.mode==='synthetic'?(fixture.variant||'Im Beispiel fehlt die Revision'):'Ja, ich habe die Angabe'}</strong><small>${state.mode==='synthetic'?'Gilt ausschließlich für diese synthetische Szene.':'Deine Angabe bleibt bis zum Quellenabgleich ungeprüft.'}</small></span></label><label class="radio-choice"><input type="radio" name="variant" value="unknown" ${!state.variantKnown?'checked':''}><span><strong>${state.mode==='synthetic'?'Ausführung offen lassen':'Noch nicht – Angabe bleibt offen'}</strong><small>Du kannst eine Prüfliste vorbereiten, ohne eine Passung zu bestätigen.</small></span></label></fieldset>${state.mode==='real'?`<label><span class="field-label">Eigene Gerätekennung (optional)</span><input id="observedCode" value="${esc(state.observedCode)}" maxlength="100" autocomplete="off" spellcheck="false" autocapitalize="characters" placeholder="Kennung genau übernehmen"></label><p class="field-help">Nur lokal gespeichert. Keine Seriennummer nötig.</p><div id="variantMismatch"></div>`:''}</div><p class="notice">${state.mode==='synthetic'?'Demoantworten haben keine Aussagekraft für echte Geräte.':'Eine abgelesene Kennung ist noch kein Herstellerbeleg für ein Ersatzteil. Andere Länder, Revisionen und Anschlüsse bleiben separat zu prüfen.'}</p>`+actions(state.variantKnown?'Baugruppe auswählen':'Mit offenen Angaben weiter');}
function stepThree(){
 const view=browseParts(state,partFilters);
 if(openGroups===null)openGroups=new Set([state.assemblyId||view.groups.find(x=>x.candidates)?.id||'filter']);
 return heading('Dein Gerät. Die richtigen Fragen.','Öffne eine Baugruppe und grenze die dokumentierten Identitäten ein. Eine Liste allein bestätigt keinen Einbau.')+pass()+
 `<div class="orientation compact-orientation">${graphic('stage3')}<p>Eigene neutrale Orientierung.<br>Keine modellgenauen Einbaupositionen.</p></div>`+
 filtersMarkup(partFilters,filterPanelOpen)+`<div id="assemblyGroups" class="assembly-list">${groupsMarkup(state,partFilters,openGroups,sourceBox,icon)}</div>`+
 '<p class="notice neutral">Belegt ist die Identität des Prüfkandidaten. Für echte Geräte sind derzeit 0 Teile in diesem Ablauf als passend bestätigt.</p>'+actions('Passung nachvollziehen',!state.assemblyId);
}
function stepFour(){
 const a=assessment(state),d=currentDevice(state);
 return heading('Nicht nur ein Haken. Ein Grund.','Sieh nach, was für deine Ausführung belegt ist und welcher nächste Prüfschritt fehlt.')+pass()+
 `<section class="assessment-card" data-status="${a.status}" aria-labelledby="assessmentTitle"><span class="tag ${a.synthetic?'demo':''}">${a.synthetic?'SYNTHETISCHE DEMO':'ECHTES GERÄT · PRÜFUNG OFFEN'}</span><h3 id="assessmentTitle">${esc(a.headline)}</h3><p>${a.synthetic?'Alle Gründe und Belege dieser Antwort sind fiktiv. Keine reale OEM-Passungsbehauptung.':'Eine gerätegenaue Passungsprüfung liegt für dieses Gerät noch nicht vor. Kein Teil wird als passend freigegeben.'}</p></section>`+
 `<div class="panel"><h3>${a.status==='incompatible'?'Warum ausgeschlossen?':a.status==='supported'?'Warum im Demo-Test passend?':'Warum passt noch nicht?'}</h3><ol class="evidence-path">${a.reasons.map(x=>'<li><span>'+esc(x)+'</span></li>').join('')}</ol>${a.evidence.length?`<p class="field-help">${a.evidence.map(x=>esc(x.id)).join(' · ')} · ausschließlich synthetische Beispielbelege.</p>`:''}${a.missing.length?`<h3>Das fehlt noch</h3><ul class="missing-list">${a.missing.map(x=>'<li>'+esc(x)+'</li>').join('')}</ul><p class="field-help">Diese Prüfpunkte werden in deine Checkliste übernommen.</p>`:''}</div>`+
 (state.mode==='real'?`<section class="panel"><h3>Dokumentierte Prüfkandidaten</h3><p class="field-help">Ausgewählter Bereich: ${esc(assemblies.find(x=>x.id===state.assemblyId).label)}. Ein Filter ändert weder die Passung noch vorgemerkte Notizen.</p>${filtersMarkup({...partFilters,assembly:state.assemblyId},filterPanelOpen)}<div id="partCandidates">${activePartsMarkup(state,partFilters,sourceBox)}</div><button class="text-button" data-step="3">Andere Baugruppe öffnen</button></section><details class="panel"><summary>Gerätequelle und Datenstand</summary>${sourceBox(d.source)}<p class="field-help">Dokumentierter Katalogstand v1.29.0. Zusätzliche neu recherchierte Teile sind hier noch nicht integriert. Kein aktueller Händlerfeed.</p></details>`:
 a.partCode?`<div class="panel"><h3>${esc(a.partCode)}</h3><p class="field-help">${a.status==='incompatible'?'Aus der Demo-Teileliste ausgeschlossen.':'Wird nur als synthetische Demo-Notiz übernommen.'}</p></div>`:'')+
 '<p class="notice">Keine bestätigten Bezugsquellen angebunden. Es gibt keine Kaufbuttons, Preise oder Lieferzusagen.</p>'+actions('Prüfliste vorbereiten');
}
function stepFive(){
 return heading('Eine klare Liste für deinen nächsten Schritt.','Offene Angaben, Teilekandidaten und Belege bleiben getrennt und jederzeit wieder auffindbar.')+pass()+
 `<p class="notice ${state.mode==='synthetic'?'':'neutral'}">${state.mode==='synthetic'?'SYNTHETISCHE DEMO – keine echte Reparatur- oder Einkaufsliste.':'Prüfliste, kein vollständiges Reparaturset. Auch erledigte Notizen bestätigen keine Passung.'}</p>`+checklistMarkup(state,sourceBox)+
 `<div class="save-actions"><button id="copyMission" class="primary">Text kopieren <span aria-hidden="true">↗</span></button><button id="downloadMission" class="secondary">Textdatei sichern</button><button id="downloadPassport" class="secondary">Prüfpass (JSON)</button></div><p class="footer-context">${saveFailed?'Lokales Speichern nicht möglich. Text sichern, bevor du die Seite schließt.':'Automatisch nur in diesem Browser gespeichert. Kein Konto, kein Cloud-Upload.'}</p>`+actions();
}
function mismatch(){if(!$('#variantMismatch'))return;const d=currentDevice(state),value=state.observedCode.toLocaleUpperCase('de-DE'),expected=d.reference.toLocaleUpperCase('de-DE');$('#variantMismatch').innerHTML=value&&value!==expected?'<p class="notice">Die eigene Angabe weicht von der Quellenkennung ab. Für diese Angabe liegt hier kein Nachweis vor; es erfolgt keine Übernahme einer ähnlichen Variante.</p>':'';}
function render(focus=false){
 $('#realMode').setAttribute('aria-pressed',String(state.mode==='real'));$('#demoMode').setAttribute('aria-pressed',String(state.mode==='synthetic'));$('#modeNotice').classList.toggle('demo',state.mode==='synthetic');$('#modeNotice').innerHTML=state.mode==='synthetic'?'<strong>SYNTHETISCHE DEMO · KEINE REALEN OEM-PASSUNGEN</strong>Fiktive Geräte, Teile und Belege. Die Demo ist vom echten Katalog getrennt.':'<strong>Lokaler Prototyp · vorhandene Herstellerquellen</strong>Geräte- und Artikelidentitäten belegt. Echte Passungen bleiben offen; die Demo verwendet synthetische Testfälle.';
 $('#progress').innerHTML=labels.map((x,i)=>`<button data-step="${i+1}" ${i+1===state.step?'aria-current="step"':''} class="${i+1<state.step?'completed':''}" ${(i+1>1&&!currentDevice(state))||(i+1>3&&!state.assemblyId)?'disabled':''}><span>${String(i+1).padStart(2,'0')}</span>${x}</button>`).join('');
 $('#workspace').innerHTML='<div class="stage">'+[stepOne,stepTwo,stepThree,stepFour,stepFive][state.step-1]()+'</div>';mismatch();refreshParts();$('#bootNotice').hidden=true;if(focus){$('#workspace').focus({preventScroll:true});window.scrollTo({top:Math.max(0,$('#progress').getBoundingClientRect().top+window.scrollY-14),behavior:'instant'});}
}
document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b||b.disabled)return;
 if(b.dataset.step)update({type:'step',value:Number(b.dataset.step)},true);
 else if(b.dataset.device){resetBrowse();update({type:'device',value:b.dataset.device});}
 else if(b.dataset.scenario){resetBrowse();update({type:'scenario',value:b.dataset.scenario});}
 else if(b.dataset.assembly){update({type:'assembly',value:b.dataset.assembly});$('#workspace [data-assembly="'+CSS.escape(b.dataset.assembly)+'"]')?.focus({preventScroll:true});}
 else if(b.id==='resetPartFilters'||b.hasAttribute('data-reset-filters')){resetBrowse();render();$('#partQuery')?.focus();feedback('Teilefilter zurückgesetzt; Passungsstatus unverändert.');}
 else if(b.dataset.removePart){update({type:'part',value:b.dataset.removePart});feedback('Prüfkandidat entfernt; Passungsstatus unverändert.');}
 else if(b.id==='eraseOffline')await toggleOffline();
 else if(b.id==='realMode'||b.id==='demoMode'){persist();state=loadMission(storage,b.id==='realMode'?'real':'synthetic');query='';brand='all';resetBrowse();render(true);feedback('Datenmodi sind getrennt.');}
 else if(b.id==='savedMission'){state=loadMission(storage,state.mode);if(!currentDevice(state)){feedback('Noch kein Gerät in dieser Mission gespeichert.');return;}render(true);feedback('Lokale Mission geöffnet; Passungsstatus unverändert.');}
 else if(b.id==='eraseMission'){try{storage.removeItem(storageKey(state.mode));}catch{}state=freshMission(state.mode);resetBrowse();render(true);feedback('Mission in diesem Datenmodus gelöscht.');}
 else if(b.id==='copyMission'){try{await navigator.clipboard.writeText(exportMission(state));feedback('Prüfliste kopiert.');}catch{feedback('Kopieren nicht möglich. Nutze „Textdatei sichern“.',true);}}
 else if(b.id==='downloadPassport'){
   try{
    const passport=await exportRepairPassport(state);
    const blob=new Blob([passport],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=state.mode==='synthetic'?'SYNTHETISCHE-DEMO-Pruefpass.json':'Universal-Fitment-Pruefpass.json';
    a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    feedback('Prüfpass lokal erstellt: Quellen und offene Fragen, keine Einbau- oder Kauf-Freigabe.');
   }catch{feedback('Prüfpass derzeit nicht verfügbar. Nutze die Textdatei.',true);}
 }
 else if(b.id==='downloadMission'){const blob=new Blob([exportMission(state)],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=state.mode==='synthetic'?'SYNTHETISCHE-DEMO-Pruefliste.txt':'Universal-Fitment-Pruefliste.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);feedback('Textdatei mit unverändertem Prüfstatus vorbereitet.');}
});
document.addEventListener('input',e=>{
 if(e.target.id==='deviceQuery'){query=e.target.value;$('#deviceResults').innerHTML=deviceResults();}
 if(e.target.id==='partQuery'){partFilters.query=e.target.value;refreshParts();}
 if(e.target.id==='observedCode'){state=transition(state,{type:'variant',known:state.variantKnown,code:e.target.value});persist();mismatch();$('#workspace .device-pass').outerHTML=pass();}
});
document.addEventListener('change',e=>{
 if(e.target.id==='brandFilter'){brand=e.target.value;$('#deviceResults').innerHTML=deviceResults();}
 else if(e.target.id==='problem')update({type:'problem',value:e.target.value});
 else if(e.target.name==='variant'){const value=e.target.value;resetBrowse();update({type:'variant',known:value==='known',code:state.observedCode});$('#workspace input[value="'+value+'"]')?.focus({preventScroll:true});}
 else if(['assemblyFilter','typeFilter','evidenceFilter','partSort'].includes(e.target.id)){const key={assemblyFilter:'assembly',typeFilter:'type',evidenceFilter:'evidence',partSort:'sort'}[e.target.id];partFilters[key]=e.target.value;if(state.step===4&&key==='assembly'){if(e.target.value==='all')update({type:'step',value:3},true);else update({type:'assembly',value:e.target.value});}else{if(key==='assembly'&&e.target.value!=='all')openGroups=new Set([e.target.value]);refreshParts();}}
 else if(e.target.dataset.part){const id=e.target.dataset.part;update({type:'part',value:id});$('#workspace input[data-part="'+CSS.escape(id)+'"]')?.focus({preventScroll:true});}
 else if(e.target.dataset.done){const id=e.target.dataset.done;update({type:'done',value:id});$('#workspace input[data-done="'+CSS.escape(id)+'"]')?.focus({preventScroll:true});}
});
document.addEventListener('toggle',event=>{
 const group=event.target.dataset?.group;
 if(group){openGroups??=new Set();if(event.target.open)openGroups.add(group);else openGroups.delete(group);}
},true);
// Manufacturer links remain identity references; they are not silently opened offline.
document.addEventListener('click',event=>{
 const link=event.target.closest('a[href^="https:"]');
 if(link&&!navigator.onLine){event.preventDefault();feedback('Offline: Der Herstellerbeleg kann gerade nicht neu geöffnet werden. Kennung und dokumentierter Quellenstand bleiben in der Prüfliste.',true);}
});
function connectionStatus(){
 $('#connectionStatus').textContent=!navigator.onLine?
  (offlineReady?'Offline · gespeicherte Vorschau. Herstellerbelege können nicht neu geprüft werden.':'Offline · laufende Sitzung. Diese Version ist nicht für einen Neustart gespeichert.'):
  (offlineReady?'Offline-Vorschau gespeichert · Quellen bleiben beim dokumentierten Stand.':offlineDisabled?'Offline-Speicherung ausgeschaltet.':'Lokale Sitzung · Offline-Vorschau wird vorbereitet.');
 $('#connectionStatus').classList.toggle('is-offline',!navigator.onLine);
 $('#eraseOffline').textContent=offlineDisabled?'Offline-Vorschau speichern':'Offline-Vorschau entfernen';
}
async function registerOffline(){
 if(offlineDisabled){connectionStatus();return;}
 try{
  if(!('serviceWorker' in navigator)||!isSecureContext)throw Error('Offline caching unavailable');
  offlineReady=await caches.has(cacheName);connectionStatus();
  if(!navigator.onLine&&offlineReady&&navigator.serviceWorker.controller)return;
  const registration=await navigator.serviceWorker.register('./offline-worker.mjs',{type:'module',updateViaCache:'none'});
  navigator.serviceWorker.ready.then(async()=>{try{offlineReady=await caches.has(cacheName);connectionStatus();}catch{}});
  registration.addEventListener('updatefound',()=>{const installing=registration.installing;installing?.addEventListener('statechange',()=>{if(installing.state==='activated')connectionStatus();});});
 }catch{
  if(offlineReady||!navigator.onLine)connectionStatus();
  else $('#connectionStatus').textContent='Lokale Sitzung · Offline-Speicherung hier nicht verfügbar. Nach Neuladen wird eine Verbindung benötigt.';
 }
}
async function toggleOffline(){
 if(offlineDisabled){offlineDisabled=false;try{storage.removeItem('uf-consumer-offline-disabled');}catch{}connectionStatus();await registerOffline();return;}
 offlineDisabled=true;try{storage.setItem('uf-consumer-offline-disabled','true');}catch{}
 try{
  for(const registration of await navigator.serviceWorker.getRegistrations())if(registration.active?.scriptURL===new URL('./offline-worker.mjs',location.href).href)await registration.unregister();
  for(const key of await caches.keys())if(key.startsWith('uf-consumer-mobile-wave4-'))await caches.delete(key);
  offlineReady=false;connectionStatus();feedback('Offline-Vorschau entfernt. Die lokal gespeicherte Prüfliste bleibt erhalten.');
 }catch{feedback('Offline-Vorschau konnte hier nicht entfernt werden. Browser-Speicher für diese lokale Vorschau prüfen.',true);}
}
window.addEventListener('online',connectionStatus);window.addEventListener('offline',connectionStatus);
$('#railGraphic').innerHTML=graphic();render();connectionStatus();registerOffline();
