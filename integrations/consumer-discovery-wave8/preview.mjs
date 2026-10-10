// Standalone preview only: not imported by the production Consumer app or offline worker.
import {catalogSnapshot} from '../consumer-repair-mission-poc/catalog-snapshot.mjs';
import {facets,findDevices,deviceProfile,deviceCardMarkup,profileMarkup,typeLabels,escapeHtml} from './discovery.mjs';

const $ = id => document.getElementById(id);
const initial = facets(catalogSnapshot);
const controls = {query:$('modelQuery'),brand:$('brand'),type:$('type'),sort:$('sort')};
let selectedId = null;
const option = (value,label) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
controls.brand.innerHTML = option('all','Alle Marken') + initial.brands.map(x=>option(x,x)).join('');
controls.type.innerHTML = option('all','Alle Gerätearten') + initial.types.map(x=>option(x,typeLabels[x]||x)).join('');
$('catalogTotal').textContent = `${initial.total} dokumentierte Kataloggeräte · ${initial.brands.length} Marken`;

function render({focusProfile=false}={}){
  const view=findDevices(catalogSnapshot,{query:controls.query.value,brand:controls.brand.value,type:controls.type.value,sort:controls.sort.value});
  if(selectedId && !view.items.some(x=>x.device.id===selectedId)) selectedId=null;
  $('resultsCount').textContent=`${view.visibleCount} von ${view.total} Kataloggeräten sichtbar`;
  $('deviceResults').innerHTML=view.items.length?view.items.map(x=>deviceCardMarkup(x.device,x)).join(''):
    `<div class="no-results"><h3>Keine dokumentierte Kennung gefunden</h3><p>Prüfe die vollständige Nummer und ihre Länder- oder Revisionszusätze. Ein ähnlicher Treffer wird nicht automatisch als passende Ausführung übernommen.</p><button type="button" data-reset>Suche zurücksetzen</button></div>`;
  $('deviceProfile').innerHTML=selectedId?profileMarkup(deviceProfile(catalogSnapshot,selectedId)):
    `<div class="profile-empty"><p class="eyebrow">Gerätedetails</p><h2>Erst das Gerät, dann das Teil.</h2><p>Öffne einen Steckbrief für dokumentierte Kennungen, Quelle und offene Fragen. Alle realen Teilepassungen bleiben ungeprüft.</p></div>`;
  if(focusProfile && selectedId){
    const h=$('deviceProfile').querySelector('h2');
    if(h){h.tabIndex=-1;h.focus({preventScroll:true});h.scrollIntoView({block:'start'});}
  }
}
controls.query.addEventListener('input',()=>render());
for(const name of ['brand','type','sort'])controls[name].addEventListener('change',()=>render());
document.addEventListener('click',event=>{
  const select=event.target.closest('button[data-select-device]');
  if(select){selectedId=select.getAttribute('data-select-device');render({focusProfile:true});return;}
  if(event.target.closest('button[data-close-profile]')){selectedId=null;render();$('modelQuery').focus({preventScroll:true});return;}
  if(event.target.closest('button[data-reset]')){
    controls.query.value='';controls.brand.value='all';controls.type.value='all';controls.sort.value='relevance';selectedId=null;
    render();controls.query.focus();
  }
});
render();