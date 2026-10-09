import {assemblies,currentDevice,checklist} from './mission-state.mjs';
import {browseParts,partTypes,evidenceOptions,checklistSections} from './parts-view.mjs';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const option=(id,label,value)=>`<option value="${id}" ${id===value?'selected':''}>${esc(label)}</option>`;

export function filtersMarkup(filters,open=false){
 return `<section class="parts-toolbar" aria-label="Teile eingrenzen">
  <label><span>Teilename oder Teilecode</span><input id="partQuery" type="search" value="${esc(filters.query)}" maxlength="100" placeholder="z. B. Filter oder 13070280" autocomplete="off" spellcheck="false"></label>
  <details id="partFilterOptions" class="filter-options" ${open?'open':''}>
   <summary><span class="filter-title">Filter & Sortierung</span><span class="filter-indicator" aria-hidden="true">⌄</span></summary>
   <div class="filter-grid">
    <label><span>Baugruppe</span><select id="assemblyFilter">${option('all','Alle Baugruppen',filters.assembly)}${assemblies.map(x=>option(x.id,x.label,filters.assembly)).join('')}</select></label>
    <label><span>Teileart</span><select id="typeFilter">${option('all','Alle Teilearten',filters.type)}${partTypes.map(x=>option(x.id,x.label,filters.type)).join('')}</select></label>
    <label><span>Nachweis zur Identität</span><select id="evidenceFilter">${evidenceOptions.map(x=>option(x.id,x.label,filters.evidence)).join('')}</select></label>
    <label><span>Sortieren innerhalb der Baugruppe</span><select id="partSort" aria-describedby="priceSortReason">${option('name','Name A–Z',filters.sort)}${option('code','Teilecode aufsteigend',filters.sort)}<option value="price" disabled>Preis – nicht verfügbar</option></select></label>
   </div>
   <p id="priceSortReason" class="field-help">Preis-Sortierung ist deaktiviert: Es gibt keine lizenzierten, aktuellen Preise. Identitätsnachweise bestätigen keine Passung.</p>
  </details>
  <div class="filter-meta"><p id="browseSummary" role="status" aria-live="polite"></p><button id="resetPartFilters" class="text-button">Filter zurücksetzen</button></div>
 </section>`;
}

export function browseSummary(state,filters){
 const view=browseParts(state,filters);
 return `${view.visibleCount} von ${view.candidates} ${state.mode==='synthetic'?'synthetischen Demo-Kandidaten':'belegten Prüfkandidaten'} sichtbar · 0 bestätigte reale Teile`;
}

export function emptyMarkup(reason,state){
 const filtered=reason==='filtered';
 return `<div class="empty" data-empty="${reason}">
  <strong>${filtered?'Kein Treffer mit diesen Filtern':'Hier noch kein dokumentierter Artikel'}</strong>
  <p>${filtered?'Die vorhandenen Identitäten bleiben im Katalog. Ändere die Suche oder setze die Filter zurück.':'Für diesen Bereich gibt es im ausgewählten Pilotbestand keinen dokumentierten Artikel. Das heißt weder „nicht erhältlich“ noch „nicht separat verkauft“. OEM-Nummer und Originalbeleg bleiben offen.'}</p>
  <button class="small-link text-button" ${filtered?'data-reset-filters':'data-step="2"'}>${filtered?'Filter zurücksetzen':'Gerätekennung prüfen'}</button>
  ${state.mode==='synthetic'?'<p>Die Testfälle sind synthetisch und sagen nichts über echte Ersatzteile aus.</p>':''}
 </div>`;
}

function identityLabel(part){
 return part.synthetic?'Synthetischer Testartikel':part.identityEvidence==='original'?'Originalteil-Identität belegt':'Identitätsnachweis offen';
}

export function partsMarkup(parts,state,sourceBox,{preview=false}={}){
 return parts.map(part=>`<article class="candidate" data-candidate="${esc(part.id)}">
  ${preview||part.synthetic?`<div class="preview-part"><strong>${esc(part.name)}</strong><code>${esc(part.code)}</code></div>`:
   `<label class="check-row"><input type="checkbox" data-part="${esc(part.id)}" ${state.selectedPartIds.includes(part.id)?'checked':''}><span><strong>${esc(part.name)}</strong><small><code>${esc(part.code)}</code> · Als Prüfkandidat vormerken</small></span></label>`}
  <p class="identity-label ${part.synthetic?'demo-label':''}">${identityLabel(part)} · ${part.synthetic?'keine reale OEM-Passung':'Passung unbestätigt'}</p>
  ${part.source?`<details data-source="${esc(part.id)}"><summary>Quelle zur Artikelidentität</summary>${sourceBox(part.source,'Artikelidentität – keine bestätigte Passung')}</details>`:'<p class="field-help">Fiktive Kennung und Testquelle. Kein Herstellerangebot.</p>'}
 </article>`).join('');
}

export function groupsMarkup(state,filters,opened,sourceBox,icon){
 return browseParts(state,filters).groups.map(group=>`<details class="assembly-disclosure" data-group="${group.id}" ${opened.has(group.id)?'open':''}>
  <summary>${icon(group.id)}<span class="group-title"><strong>${esc(group.label)}</strong><small>${group.visibleCount} von ${group.candidates} ${state.mode==='synthetic'?'Demo-Kandidaten':'belegten Prüfkandidaten'} · 0 bestätigte reale Teile</small></span><span class="disclosure-chevron" aria-hidden="true">⌄</span></summary>
  <div class="assembly-content"><p class="field-help">${esc(group.hint)}${state.mode==='synthetic'?` · ${group.syntheticSupported} durch die gemeinsame Engine positiv bewertete Demo-Testfälle; keine reale Freigabe`:''}</p>
   ${group.parts.length?partsMarkup(group.parts,state,sourceBox,{preview:true}):emptyMarkup(group.emptyReason,state)}
   <button class="assembly-select secondary" data-assembly="${group.id}" aria-pressed="${state.assemblyId===group.id}">${state.assemblyId===group.id?'Für Mission ausgewählt':'Für Mission auswählen'} <span aria-hidden="true">${state.assemblyId===group.id?'✓':'→'}</span></button>
  </div>
 </details>`).join('');
}

export function activePartsMarkup(state,filters,sourceBox){
 const selected=browseParts(state,{...filters,assembly:state.assemblyId}).groups[0];
 if(!selected)return emptyMarkup('not-documented',state);
 return selected.parts.length?partsMarkup(selected.parts,state,sourceBox):emptyMarkup(selected.emptyReason,state);
}

export function checklistMarkup(state,sourceBox){
 const items=checklist(state),done=items.filter(x=>state.done.includes(x.id)).length;
 return `<div class="checklist-overview"><p class="check-summary">${done} von ${items.length} Notizen erledigt · ${state.mode==='real'?'Passung bleibt unbestätigt':'synthetisches Beispiel'}</p>
  <span>${items.filter(x=>x.kind==='missing'&&!state.done.includes(x.id)).length} offene Angaben</span></div>`+
  checklistSections(state).map(section=>`<section class="panel checklist-section" aria-labelledby="section-${section.id}">
   <h3 id="section-${section.id}">${esc(section.title)} <span class="section-count">${section.items.length}</span></h3>
   ${section.items.length?`<ul class="checklist">${section.items.map(item=>`<li><label class="check-row ${state.done.includes(item.id)?'done':''}"><input type="checkbox" data-done="${esc(item.id)}" ${state.done.includes(item.id)?'checked':''}><span><strong>${esc(item.label)}</strong><small>${esc(item.detail)}</small></span></label>
    ${item.source?`<details class="checklist-source"><summary>Artikelbeleg zur Prüfliste</summary>${sourceBox(item.source,'Artikelidentität – Passung weiterhin unbestätigt')}</details>`:''}
    ${item.kind==='candidate'?`<button class="text-button remove-part" data-remove-part="${esc(item.id.slice(5))}" aria-label="Prüfkandidat ${esc(item.label)} entfernen">Aus Prüfliste entfernen</button>`:''}</li>`).join('')}</ul>`:
    `<p class="field-help">${section.id==='parts'?'Noch kein Prüfkandidat vorgemerkt. Du kannst die Baugruppe erneut öffnen; unbekannte Positionen bleiben unter „Noch zu klären“.':'In diesem Abschnitt gibt es keine weiteren Notizen. Das bestätigt keine vollständige Reparatur.'}</p>`}
  </section>`).join('');
}

export function variantMarkup(state){
 const device=currentDevice(state);
 if(!device)return '';
 if(state.mode==='synthetic')return '<small class="variant-line">Ausführung ausschließlich synthetisch · keine echte Marke</small>';
 const mismatch=state.observedCode&&state.observedCode.toLocaleUpperCase('de-DE')!==device.reference.toLocaleUpperCase('de-DE');
 return `<small class="variant-line">Quellenmarkt ${esc(device.market)} · ${state.variantKnown?'Eigene Kennung ungeprüft':'Eigene Ausführung noch offen'}</small>${state.observedCode?`<small class="variant-line">Eigene Angabe: <code>${esc(state.observedCode)}</code>${mismatch?' · weicht von der Quellenkennung ab':''}</small>`:''}`;
}
