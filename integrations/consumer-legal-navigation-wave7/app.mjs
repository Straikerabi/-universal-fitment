import {mountLegalNavigation} from './navigation.mjs';
import {readiness,legalRoute} from './readiness.mjs';
import {eraseLocal,policies} from './deletion.mjs';
import {cacheName,assetPaths} from './offline-config.mjs';
import {quiescePreviewWorkers} from './offline-control.mjs';
const $=selector=>document.querySelector(selector);
$('#mission').tabIndex=-1;
$('#mode-note').setAttribute('aria-live','polite');
let storage;try{storage=localStorage;}catch{storage=null;}
const fresh=()=>({synthetic:true,step:1,variant:''});
let mission=fresh();
try{const value=JSON.parse(storage?.getItem(policies.preview.keys[1])||'null');if(value?.synthetic===true&&Number.isInteger(value.step)&&value.step>=1&&value.step<=5&&typeof value.variant==='string'&&value.variant.length<=100)mission={synthetic:true,step:value.step,variant:value.variant};}catch{}
const channel=typeof BroadcastChannel==='function'?new BroadcastChannel('uf-legal-wave7-erasure'):null;
function resetMemory(){mission=fresh();renderMission();$('#mission-status').textContent='Lokaler Missionszustand zurückgesetzt. Keine externe Löschung.';}
channel?.addEventListener('message',event=>{if(event.data?.type==='purge')resetMemory();});
function renderMission(){
 $('#steps').replaceChildren();['Gerät','Ausführung','Baugruppe','Passung','Checkliste'].forEach((label,i)=>{const b=document.createElement('button');b.textContent=String(i+1);b.setAttribute('aria-label',`Schritt ${i+1}: ${label}`);if(mission.step===i+1)b.setAttribute('aria-current','step');b.addEventListener('click',()=>{mission.step=i+1;renderMission();});$('#steps').append(b);});
 $('#step-title').textContent=`Schritt ${mission.step} von 5 · nur synthetische Navigation, keine Passungsprüfung`;
 $('#variant').value=mission.variant;
}
async function erase(){
 $('#offline-enable').disabled=true;
 const scope=new URL('./',location.href).href;
 const result=await eraseLocal({scope,storage,cacheStorage:globalThis.caches,serviceWorkers:navigator.serviceWorker,beforeErase:async()=>{resetMemory();channel?.postMessage({type:'purge'});await quiescePreviewWorkers(navigator.serviceWorker,scope);},afterErase:async()=>{$('#offline-status').textContent='Offline-Speicherung entfernt oder nicht vollständig verifiziert. Kein automatisches Wiedereinrichten.';}});
 $('#offline-enable').disabled=false;return result;
}
const nav=mountLegalNavigation({document,window,navHost:$('#legal-nav'),contentHost:$('#legal-content'),onErase:erase});
function route(){const isLegal=Boolean(legalRoute(location.hash));$('#mission').hidden=isLegal;if(location.hash==='#mission')$('#mission').focus();}
window.addEventListener('hashchange',route);
$('#variant').addEventListener('input',event=>{mission.variant=event.target.value.slice(0,100);});
$('#save-mission').addEventListener('click',()=>{
 try{if(!storage)throw Error();storage.setItem(policies.preview.keys[1],JSON.stringify(mission));$('#mission-status').textContent='Synthetische Mission in diesem Browserprofil gespeichert.';}catch{$('#mission-status').textContent='Speichern nicht verfügbar. Angaben bleiben nur in dieser Sitzung.';}
});
$('#download').addEventListener('click',()=>{
 const data={synthetic:true,variant:mission.variant,step:mission.step,launchApproved:false,fitmentApproved:false,notice:'Synthetischer Prüfpass, kein OEM-Nachweis; Downloads bleiben nach App-Löschung erhalten.'};
 const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='SYNTHETISCHE-LEGAL-PREVIEW.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#mission-status').textContent='Synthetische Datei lokal vorbereitet. Kein Upload; selbst im Downloadordner löschen.';
});
$('#mode').addEventListener('change',event=>{nav.setMode(event.target.value);const status=readiness(event.target.value);$('#mode-note').textContent=status.mode==='affiliate'?'Zusätzlich offen: Programme, Werbung, Tracking, echte Angebote und Preise.':status.mode==='b2b-saas'?'Zusätzlich offen: echte Mandanten, Rollen, API-Autorisierung, Verträge und Datenschutz.':'Kostenlos und read-only: Betreiber, Datenschutz, Rechte und Hosting trotzdem offen.';});
$('#mode').dispatchEvent(new Event('change'));
$('#offline-enable').addEventListener('click',async()=>{
 const button=$('#offline-enable');button.disabled=true;
 try{
  const registration=await navigator.serviceWorker.register('./sw.mjs',{type:'module',updateViaCache:'none'});
  await navigator.serviceWorker.ready;
  // ready may refer to an older worker; wait for this exact version's cache.
  let ready=false;for(let attempt=0;attempt<100;attempt++){if(await caches.has(cacheName)&&(await (await caches.open(cacheName)).keys()).length===assetPaths.length){ready=true;break;}await new Promise(resolve=>setTimeout(resolve,50));}
  if(!ready||registration.scope!==new URL('./',location.href).href)throw Error();
  $('#offline-status').textContent='Lokale Offline-Dateien vollständig gespeichert. Nach einem Online-Neustart offline erreichbar.';
 }catch{$('#offline-status').textContent='Offline-Speicherung nicht verifiziert. Verbindung und Browser-Speicher prüfen.';}
 finally{button.disabled=false;}
});
renderMission();route();
// Inspect existing local cache state, but never create/reinstall a cache at boot.
(async()=>{try{if(await caches.has(cacheName)&&(await (await caches.open(cacheName)).keys()).length===assetPaths.length)$('#offline-status').textContent='Lokale Offline-Dateien dieser Version vorhanden. Keine automatische Neuinstallation.';}catch{$('#offline-status').textContent='Vorhandene Offline-Dateien nicht verifiziert.';}})();
// No autosave: reset/broadcast cannot recreate erased records. A later explicit
// save starts a new mission. This preview does not install its worker at startup.
window.addEventListener('pagehide',()=>channel?.close());
