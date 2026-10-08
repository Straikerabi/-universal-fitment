import {repairSearchUrl,repairRequestText} from './core/services.js';
import {photoPolicy} from './core/photo-policy.js';
import {catalogTarget,catalogTargetProgress,deviceBudgetBands,deviceBudgetBand} from './data/catalog-plan.js';
import { categories, products, scenarios as demoScenarios, mieleCatalogStats, filterCatalog, partsCatalog, catalogBrands, optionalCatalogBrands, catalogStats, boschCatalogStats,brandManifest,catalogCoverage,registerCatalogPack } from './data/catalog.js';
import {createCatalogLoader,brandsForBackup} from './core/catalog-loader.js';
import {brandSupport} from './data/brand-products.js';
import {reviewAegPNC,aegPartsLink,reviewSiemensENumber,siemensServiceLink,reviewPhilipsModelReference,reviewVorwerkModel} from './core/brand-identity.js';
import {partType,partPurpose,partPurposes,partTypeSummary,groupPartsByType,isPhysicalPart} from './data/part-taxonomy.js';
import { filterParts, partFilterOptions, partCategory, partBrands, partIdentity, mielePartsCoverage, mieleSpareCatalogUrl } from './data/miele-parts.js';
import { installationInfo, swirlBagSteps } from './data/miele-guides.js';
import { installationTime } from './data/miele-installation-times.js';
import { marketplaceConditions, normalizeCondition, partSearchIdentity, searchLinksForPart, marketplaceSearchNote } from './core/marketplaces.js';
import { quoteForPart, quoteFresh, quoteStatus, comparableQuote, canSelectQuote, shippingCost, shippingPolicies, singleQuoteTotal, cartQuoteItem, cartPriceKnown, isAmount, roundMoney, sortCommerceParts } from './data/miele-commerce.js';
import { matchProducts,matchReason } from './core/matcher.js';
import { resolveProductQuery } from './data/product-resolver.js';
import { classifyIdentifier,isValidGTIN } from './core/identifiers.js';
import { rankOffers, recommendationBreakdown } from './core/ranking.js';
import { addMaintenance, addRecent, addReport, clearRecent, exportDemoData, getDeviceMeta, getInventoryPlan, getJobSelection, getMaintenance, getReminderPref, getToolInventory, getVehicleMeta, isSaved, recentIds, resetDemoStorage, replaceDemoData, savedIds, setDeviceMeta, setInventoryPlan, setJobSelection, setReminderPref, setToolInventory, setVehicleMeta, toggleSaved } from './core/storage.js';
import { scannerCapabilities, startBarcodeScanner, detectBarcodeFromImage, detectTextFromImage } from './core/scanner.js';
import { addCartItem, replaceCart, cartCount, cartGroups, cartItems, clearCart, removeCartItem, setCartQuantity } from './core/cart.js';
import { buildHandoffPlan, handoffListText } from './core/handoff.js';
import { localDataStatus, readLocal, writeLocal, cleanMap } from './core/local-state.js';
import { createBackup, reviewBackup, MAX_BACKUP_BYTES } from './core/backup.js';
import { checkPilotHealth, readinessReport } from './core/pilot-readiness.js';
import {reviewTypePlate,reviewScannedCode} from './core/typeplate.js';
import {compareDevices} from './core/device-comparison.js';
import {parseBoschENumber,boschSupportUrls} from './core/bosch-identity.js';
import {createBoschContext,boschPartReviewText} from './core/bosch-context.js';
import { getPreferences, setPreferences } from './core/preferences.js';
import { normalizeHsn, normalizeTsn, normalizeVin, validateVin } from './core/vehicle.js';
import { faqItems } from './data/faq.js';
import {communityLinks,feedbackTopics,feedbackDraft,feedbackMailUrl,supportEmail} from './core/feedback.js';
import { getJobGuidance } from './data/job-guidance.js';

const APP_VERSION = '1.26.8';
const catalogLoader=createCatalogLoader({packs:Object.fromEntries(optionalCatalogBrands.map(brand=>[brand,`./catalog-${brand.toLowerCase()}-v${APP_VERSION}.js`])),register:registerCatalogPack});
import { createClient } from './vendor/supabase.js';
import { createPilotClient, pilotConfig, pilotMessages } from './core/pilot-client.js';
const pilot=createPilotClient({auth:createClient(pilotConfig.url,pilotConfig.key,{auth:{persistSession:false,autoRefreshToken:true,detectSessionInUrl:false}}).auth});

const THEME_KEY = 'uf_theme_v1';
const app = document.querySelector('#app');
let scannerSession = null;
let scannerController = null;
let photoController = null;
let readinessController = null;
let resolverController = null;
const plateState={text:'',origin:'manual'};
const boschContext=createBoschContext();
const readinessState={healthResult:null,accessResult:{status:'not_checked'},userId:null};
let renderVersion = 0;
let photoVersion = 0;
let selectedPhotoUrl = null;
let deferredInstallPrompt = null;
let catalogLoadErrors=[];
const state = { offerMode:'recommended', catalogFilters:{brand:'all',series:'all',bagSystem:'all',deviceType:'all',budget:'all',partCoverage:'all',sort:'relevance'},partsFilters:{brand:'all',query:'',tier:'all',category:'all',purpose:'all',series:'all',sort:'name'},productPartsFilters:{productId:'',query:'',tier:'all',category:'all',purpose:'all',sort:'name'},productPartGroups:{} };
state.catalogLimit=40;
state.marketplaceFilters={brand:'all',query:'',tier:'all',category:'all',purpose:'all',series:'all',condition:'used'};
const EXTERNAL_PRODUCTS_KEY='uf_external_products_v1';

function readExternalProducts(){return cleanMap(readLocal(EXTERNAL_PRODUCTS_KEY,{}));}

function rememberExternalProduct(candidate){
  const map=readExternalProducts();
  const id=String(candidate?.id||`external-${Date.now()}`);
  map[id]={...candidate,id,confirmedAt:new Date().toISOString()};
  const entries=Object.entries(map).slice(-20);
  writeLocal(EXTERNAL_PRODUCTS_KEY,Object.fromEntries(entries));
  return id;
}
function getExternalProduct(id){ return readExternalProducts()[id]||null; }
function externalSavedProducts(){ return Object.values(readExternalProducts()).filter(p=>p&&typeof p==='object'&&!Array.isArray(p)); }

const money = value => new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(Number(value)||0);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const identifierLabel=(type,brand='')=>type==='device-sku'&&brand==='Hoover'?'Hoover-Produktcode':({'material-number':'Material-Nr.','manufacturer-model':'Modellreferenz','manufacturer-article':'Hersteller-Artikel-Nr.','manufacturer-designation':'Herstellerbezeichnung','supplier-article':'Anbieter-Artikel-Nr.','ean':'EAN','gtin':'GTIN','upc':'UPC','product-type':'Gerätetyp','model-family':'Gerätefamilie','bag-system':'Beutelsystem','pnc':'AEG PNC','device-sku':'Dyson-Produktnummer','supplier-model':'Zubehör-Modell'}[type]||'Kennung');
const byId = id => document.getElementById(id);

function savedTheme(){
  try {
    const value = localStorage.getItem(THEME_KEY);
    return ['light','dark','system'].includes(value) ? value : 'system';
  } catch { return 'system'; }
}
function resolvedTheme(mode=savedTheme()){
  if(mode === 'system') return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  return mode;
}
function applyTheme(mode=savedTheme()){
  const resolved = resolvedTheme(mode);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themeMode = mode;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#090c11' : '#f4f6f8');
}
function setTheme(mode){
  try { localStorage.setItem(THEME_KEY, mode); } catch {}
  applyTheme(mode);
}

function cleanupTransientResources(){
  renderVersion++;
  photoVersion++;
  scannerController?.abort();scannerController=null;
  photoController?.abort();photoController=null;
  readinessController?.abort();readinessController=null;
  resolverController?.abort();resolverController=null;
  if(scannerSession?.stop) scannerSession.stop();
  scannerSession = null;
  if(selectedPhotoUrl){ URL.revokeObjectURL(selectedPhotoUrl); selectedPhotoUrl = null; }
}

function navigate(route, param=''){
  cleanupTransientResources();
  location.hash = param ? `${route}/${encodeURIComponent(param)}` : route;
}

function currentConnectionLabel(){ return navigator.onLine ? 'Online' : 'Offline'; }
function currentConnectionClass(){ return navigator.onLine ? 'status-online' : 'status-offline'; }

function shell(content, active='home'){
  renderVersion++;
  const themeIcon = resolvedTheme()==='dark' ? '☾' : '☀';
  const savedCount = savedIds().filter(id=>products.some(p=>p.id===id)).length + externalSavedProducts().length;
  const count=cartCount();
  const dataStatus=localDataStatus();
  if(catalogLoadErrors.length)content=`<section class="card notice" role="status"><b>Markendetails noch nicht verfügbar</b><p class="small">${esc(catalogLoadErrors.join(' und '))}: Für den ersten Abruf ist eine Verbindung nötig. Der Modellindex und bereits geladene Kataloge bleiben verfügbar.</p><button class="btn btn-secondary" id="retryCatalog">Erneut laden</button><button class="btn btn-ghost" id="catalogHome">Zur Modellübersicht</button></section>`+content;
  app.innerHTML = `
    <div class="shell">
      <header class="topbar">
        <button class="brand-button" id="brandHome" aria-label="Zur Startseite">
          <span class="brand-mark">UF</span>
          <span class="brand-wrap"><span class="brand">Universal Fitment</span><span class="tag">Staubsauger · ${catalogBrands.length} Marken</span></span>
        </button>
        <div class="top-actions">
          <span id="connectionBadge" class="connection-badge ${currentConnectionClass()}"><span class="connection-dot"></span>${currentConnectionLabel()}</span>
          <button class="icon-btn cart-top-btn" id="quickCart" aria-label="Warenkorb" title="Warenkorb">🛒${count?`<span class="nav-badge cart-top-badge">${count}</span>`:''}</button>
          <button class="icon-btn" id="quickTheme" aria-label="Darstellung wechseln" title="Darstellung">${themeIcon}</button>
        </div>
      </header>
      <main class="content" id="mainContent" tabindex="-1">${dataStatus.temporary?'<div class="notice warn" role="status"><b>Nur vorübergehend gespeichert:</b> Dein Browser kann die Änderungen gerade nicht dauerhaft sichern. Exportiere vor dem Schließen eine Sicherung. <button class="text-button" data-local-backup>Sicherung öffnen</button></div>':dataStatus.unreadable?'<div class="notice warn" role="status">Einige lokale Einträge konnten nicht gelesen werden. Die App verwendet die gültigen Daten. <button class="text-button" data-local-backup>Sicherungen prüfen</button></div>':''}${content}</main>
      <nav class="bottomnav" aria-label="Hauptnavigation">
        <button data-nav="home" class="${active==='home'?'active':''}"><span class="nav-icon">⌂</span>Start</button>
        <button data-nav="scan" class="${active==='scan'?'active':''}"><span class="nav-icon">⌁</span>Scan</button>
        <button data-nav="saved" class="${active==='saved'?'active':''}"><span class="nav-icon">▣</span>Geräte${savedCount?`<span class="nav-badge">${savedCount}</span>`:''}</button>
        <button data-nav="cart" class="${active==='cart'?'active':''}"><span class="nav-icon">🛒</span>Warenkorb${count?`<span class="nav-badge">${count}</span>`:''}</button>
        <button data-nav="settings" class="${active==='settings'?'active':''}"><span class="nav-icon">☰</span>Mehr</button>
      </nav>
      <div id="toastRegion" class="toast-region" aria-live="polite" aria-atomic="true"></div>
      <div id="modalRoot"></div>
    </div>`;

  document.querySelectorAll('[data-nav]').forEach(button=>button.addEventListener('click',()=>navigate(button.dataset.nav)));
  document.querySelector('[data-local-backup]')?.addEventListener('click',()=>navigate('backup'));
  byId('brandHome')?.addEventListener('click',()=>navigate('home'));
  byId('retryCatalog')?.addEventListener('click',()=>route());
  byId('catalogHome')?.addEventListener('click',()=>navigate('home'));
  byId('quickCart')?.addEventListener('click',()=>navigate('cart'));
  byId('quickTheme')?.addEventListener('click',()=>{
    const next = resolvedTheme()==='dark' ? 'light' : 'dark';
    setTheme(next);
    route();
  });
}

function toast(message, tone='default'){
  if(localDataStatus().temporary&&/gespeichert|wiederhergestellt|vorgemerkt|geleert|aktiviert|deaktiviert/i.test(message)){message+=' Nur vorübergehend; bitte eine Sicherung exportieren.';tone='default';}
  const region = byId('toastRegion');
  if(!region) return;
  const node = document.createElement('div');
  node.className = `toast ${tone==='success'?'toast-success':tone==='error'?'toast-error':''}`;
  node.textContent = message;
  region.appendChild(node);
  requestAnimationFrame(()=>node.classList.add('show'));
  setTimeout(()=>{ node.classList.remove('show'); setTimeout(()=>node.remove(),180); }, 2600);
}

async function copyText(value){
  try{
    await navigator.clipboard.writeText(String(value));
    return true;
  }catch{
    try{
      const area=document.createElement('textarea');
      area.value=String(value); area.setAttribute('readonly',''); area.style.position='fixed'; area.style.opacity='0';
      document.body.appendChild(area); area.select(); const ok=document.execCommand('copy'); area.remove(); return ok;
    }catch{return false;}
  }
}

async function shareCurrent({title,text,url=location.href}){
  if(navigator.share){
    try{ await navigator.share({title,text,url}); return; }
    catch(error){ if(error?.name==='AbortError') return; }
  }
  const ok=await copyText(url);
  toast(ok?'Link kopiert.':'Teilen ist auf diesem Gerät nicht verfügbar.',ok?'success':'error');
}


function dataStatusMeta(product){
  if(product?.catalogPack)return {label:'Modellquelle belegt',cls:'pill-info',short:'Modellquelle'};
  if(product?.dataStatus==='manufacturer-verified') return {label:'Hersteller-verifiziert',cls:'pill-ok',short:'Verifiziert'};
  if(product?.dataStatus==='catalog-verified') return {label:'Katalog-verifiziert',cls:'pill-ok',short:'Verifiziert'};
  return {label:'Demo',cls:'pill-neutral',short:'Demo'};
}
function safeExternalUrl(value=''){
  try{const url=new URL(value);return url.protocol==='https:'?url.href:'';}catch{return '';}
}

function productImage(product,large=false){
  const url=safeExternalUrl(product.imageUrl);
  const auto=photoPolicy(getPreferences().photos,large).automatic;
  const alt=`${product.brand} ${product.model} – Staubsauger, Produktfoto`;
  return `<div class="product-icon product-photo ${large?'product-photo-large':''}"><img src="${esc(url&&auto?url:'./icons/vacuum.svg')}" alt="${esc(url&&auto?alt:'Staubsauger-Illustration')}" width="${large?140:88}" height="${large?150:100}" loading="lazy" decoding="async" data-vacuum-photo>${url&&!auto?`<button type="button" class="photo-load" data-load-photo="${esc(url)}" data-photo-alt="${esc(alt)}" aria-label="Produktfoto von ${esc(product.brand)} ${esc(product.model)} laden">Foto laden</button>`:''}</div>`;
}
function partTypeIcon(type){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${type.icon}"/></svg>`;}
function partLabels(part){
 const type=partType(part),purpose=partPurpose(part);
 return `<div class="part-labels"><span class="part-type-badge" data-part-type="${type.id}" style="--part-color:${type.color}">${partTypeIcon(type)}${esc(type.label)}</span><span class="part-purpose">${esc(purpose.label)}</span></div>`;
}
function partReferenceNote(part){
 return `${part.attachmentReferences?.length?`<p class="small part-reference-note"><b>Vorsatztyp:</b> ${part.attachmentReferences.map(esc).join(' · ')}</p>`:''}${part.sourceMarket==='GB'?'<p class="small part-reference-note">Herstellerquelle: Großbritannien · deutsche Geräteausführung prüfen</p>':''}`;
}

function purposeFilter(id,value='all'){
 return `<label><span>Artikelart</span><select id="${id}"><option value="all">Alle Artikelarten</option>${partPurposes.map(p=>`<option value="${p.id}" ${p.id===value?'selected':''}>${p.label}</option>`).join('')}</select></label>`;
}
function partTypeFilters(parts,filters,context){
 const types=partTypeSummary(parts),chip=t=>`<button type="button" class="part-type-chip ${filters.category===t.label?'selected':''}" style="--part-color:${t.color}" data-part-type-filter="${esc(t.label)}" data-part-filter-context="${context}" aria-pressed="${filters.category===t.label}">${partTypeIcon(t)}<span>${esc(t.label)}</span><b>${t.count}</b></button>`;
 return `<div class="part-type-key"><p class="small muted">Gleiche Teileart, gleiche Farbe – bei jeder Marke.</p><div class="part-type-quick">${types.slice(0,4).map(chip).join('')}</div>${types.length>4?`<details><summary class="small">${types.length-4} weitere Teilearten anzeigen</summary><div class="part-type-quick">${types.slice(4).map(chip).join('')}</div></details>`:''}</div>`;
}
function wirePartTypeFilters(context,selectId,update){
 document.querySelectorAll(`[data-part-filter-context="${context}"]`).forEach(button=>button.addEventListener('click',()=>{const select=byId(selectId);select.value=select.value===button.dataset.partTypeFilter?'all':button.dataset.partTypeFilter;update();}));
}
function partPhoto(part,large=false){
 const type=partType(part),url=safeExternalUrl(part.imageUrl),auto=photoPolicy(getPreferences().photos,large).automatic;
 return `<div class="part-photo part-type-visual ${large?'part-photo-large':''}" data-part-type="${type.id}" style="--part-color:${type.color}">${url&&auto?`<img src="${esc(url)}" alt="${esc(part.name)}" width="${large?220:72}" height="${large?180:72}" loading="lazy" decoding="async" data-part-photo>`:`<span class="part-symbol" role="img" aria-label="Teileart: ${esc(type.label)}">${partTypeIcon(type)}</span>${url?`<button type="button" class="photo-load" data-load-photo="${esc(url)}" data-photo-alt="${esc(part.name)}">Foto laden</button>`:''}`}</div>`;
}
app.addEventListener('click',event=>{
 const button=event.target.closest?.('[data-load-photo]');if(!button)return;
 event.preventDefault();event.stopPropagation();
 const url=safeExternalUrl(button.dataset.loadPhoto);if(!url)return;
 let img=button.parentElement.querySelector('img');
 if(!img){img=document.createElement('img');img.dataset.partPhoto='';img.width=72;img.height=72;button.parentElement.prepend(img);}
 img.alt=button.dataset.photoAlt;img.decoding='async';img.src=url;button.remove();
},true);

app.addEventListener('error',event=>{
  const img=event.target;
  if(img.matches?.('[data-vacuum-photo]')&&!img.dataset.fallback){img.dataset.fallback='true';img.alt='Staubsauger-Illustration (Produktfoto nicht verfügbar)';img.src='./icons/vacuum.svg';}
  else if(img.matches?.('[data-part-photo]'))img.hidden=true;
},true);

function partFitmentMeta(part){
  if(part.fitment.status==='variant_check_required')return {label:'Ausführung prüfen',cls:'pill-warn',tone:'warn'};
  if(part.tier==='aftermarket')return {label:'Nachbau · Anbieterangabe',cls:'pill-info',tone:'good'};
  if(part.fitment.status==='manufacturer_family_listed')return {label:'Miele-Serienzuordnung',cls:'pill-ok',tone:'strong'};
  if(part.fitment.status==='catalog_only')return {label:'Originalteil · Zuordnung prüfen',cls:'pill-warn',tone:'warn'};
  return {label:'Hersteller-Zuordnung',cls:'pill-ok',tone:'strong'};
}

function renderBoschSupportResult(context,product,part){
 if(!context)return '';
 const reviewText=part&&boschPartReviewText(product,part,context);
 return `<p class="small">E-Nr. für diesen Geräteablauf: <b>${esc(context.eNumber)}</b>. Format geprüft; ob der Index existiert und welches Teil passt, bestätigt erst Bosch.</p><a class="btn btn-primary" href="${esc(context.serviceLink.url)}" target="_blank" rel="noopener noreferrer">${esc(context.serviceLink.label)} · beim Hersteller prüfen ↗</a>${reviewText?'<p><button class="btn btn-secondary" id="boschCopyPart">E-Nr. & Teilenummer kopieren</button></p>':''}`;
}
function renderBoschSupport(product,part){
 if(product?.brand!=='Bosch')return '';
 const context=boschContext.get(product);
 return `<section class="card"><h3>Bosch Ersatzteile mit E-Nr. prüfen</h3><p class="muted">${esc(product.model)} ist die Modellreferenz. Lies zusätzlich den zweistelligen Index nach „/“ direkt vom Typenschild ab. Gelistetes Zubehör bleibt bis zur Eignungsprüfung beim Hersteller ungeklärt.</p><label class="field-label" for="boschENumber">Vollständige E-Nr. vom eigenen Gerät</label><input class="text-input" id="boschENumber" maxlength="24" autocomplete="off" spellcheck="false" placeholder="${esc(product.model)}/xx" value="${esc(context?.eNumber||'')}"><div class="row wrap"><button class="btn btn-secondary" id="boschCheck">E-Nr. prüfen & Service zeigen</button><button class="btn btn-ghost" id="boschClear">E-Nr. verwerfen</button></div><div id="boschSupportResult" role="status">${renderBoschSupportResult(context,product,part)}</div><p class="small muted">Die E-Nr. bleibt beim Wechsel zwischen diesem Gerät und seinen Teilen erhalten. Sie wird beim Verlassen des Geräteablaufs oder Neuladen verworfen. FD und Seriennummer sind nicht nötig; erst der Link öffnet Bosch.</p><div class="row wrap"><a class="btn btn-secondary" href="${boschSupportUrls.parts}" target="_blank" rel="noopener noreferrer">Bosch Ersatzteilsuche ↗</a><a class="btn btn-ghost" href="${boschSupportUrls.manuals}" target="_blank" rel="noopener noreferrer">Anleitung nach E-Nr. suchen ↗</a></div></section>`;
}
function wireBoschSupport(product,part){
 const wireCopy=()=>byId('boschCopyPart')?.addEventListener('click',async()=>{
  const text=boschPartReviewText(product,part,boschContext.get(product));
  if(!text)return;
  const ok=await copyText(text);toast(ok?'E-Nr. und Teilekennung kopiert.':'Kopieren nicht möglich.',ok?'success':'error');
 });
 wireCopy();
 byId('boschCheck')?.addEventListener('click',()=>{
  const context=boschContext.set(product,byId('boschENumber').value),region=byId('boschSupportResult');
  if(!context){region.textContent=`Bitte ${product.model} mit dem tatsächlichen zweistelligen /xx-Index eingeben. Die Modellreferenz muss zu diesem Gerät passen.`;return;}
  byId('boschENumber').value=context.eNumber;
  region.innerHTML=renderBoschSupportResult(context,product,part);wireCopy();
 });
 byId('boschENumber')?.addEventListener('input',()=>{boschContext.clear();byId('boschSupportResult').textContent='Geänderte E-Nr. erneut prüfen.';});
 byId('boschClear')?.addEventListener('click',()=>{boschContext.clear();byId('boschENumber').value='';byId('boschSupportResult').textContent='E-Nr. verworfen.';});
}

function renderManufacturerNotices(subject){
 return (subject?.safetyNotices||[]).map(notice=>{
  const url=safeExternalUrl(notice.url);
  return `<section class="card catalog-coverage manufacturer-notice" aria-label="Herstellerhinweis"><h3>${esc(notice.title)}</h3><p class="notice">${esc(notice.note)}</p>${url?`<a class="btn btn-secondary" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Rückruf und kostenlosen Austausch bei Philips prüfen ↗</a>`:''}<p class="small muted">Herstellerquelle geprüft: ${esc(notice.checkedAt)}. Modell und Akku-Code gemeinsam vergleichen.</p></section>`;
 }).join('');
}
function partManufacturerLinkLabel(part){
 return part.sourcePageType==='device-parts-table'?'Hersteller-Teileliste':part.tier==='oem'?`${part.brand||'Miele'} Originalteil`:'Nachbau beim Anbieter';
}
function renderBrandIdentity(product,part){
 if(!product?.catalogPack)return '';
 const note=part?` Artikel ${part.identifiers?.find(i=>i.type==='manufacturer-article')?.value||part.name} beim Hersteller separat prüfen.`:'';
 if(['Samsung','Hoover'].includes(product.brand))return `<section class="card"><h3>${esc(product.brand)}: vollständige Gerätekennung prüfen</h3><p class="muted">${esc(product.identityNote)}</p><p class="small">Erfasste Modellcodes: ${product.deviceReferences.map(x=>`<b>${esc(x)}</b>`).join(' · ')}.</p>${product.brand==='Hoover'?`<p class="small">Produktcode: <b>${esc(product.identifiers.find(i=>i.type==='device-sku')?.value||'noch offen')}</b></p>`:''}<a class="btn btn-secondary" href="${esc(safeExternalUrl(product.spareFinderUrl))}" target="_blank" rel="noopener noreferrer">Hersteller-Ersatzteile mit Gerätekennung prüfen ↗</a></section>`;
 if(product.brand==='Vorwerk')return `<section class="card"><h3>Vorwerk: Grundgerät und Vorsatztyp prüfen</h3><p class="muted">${esc(product.identityNote)}${esc(note)}</p><p class="small">Grundgerätekennung: <b>${esc(product.deviceReferences.join(' · '))}</b>. Bei Elektrobürsten, Düsen und Saugwischern zusätzlich den aufgedruckten Zubehörtyp vergleichen.</p><label class="field-label" for="vorwerkModel">Kennung vom eigenen Grundgerät</label><input class="text-input" id="vorwerkModel" maxlength="32" autocomplete="off" spellcheck="false" placeholder="${esc(product.deviceReferences[0])}"><button class="btn btn-secondary" id="vorwerkCheck">Grundgerät lokal prüfen</button><div id="vorwerkResult" role="status"></div><p class="small muted">Die Originalartikel sind unter ihrer Herstellerbezeichnung erfasst. Numerische Artikelnummern bleiben offen. Preise sind gespeicherte Shopstände.</p><a class="btn btn-secondary" href="${esc(safeExternalUrl(product.spareFinderUrl))}" target="_blank" rel="noopener noreferrer">Vorwerk Originalteile und Zubehör prüfen ↗</a></section>`;
 if(product.brand==='Siemens')return `<section class="card"><h3>Siemens: vollständige E-Nr. prüfen</h3><p class="muted">${esc(product.identityNote)}${esc(note)}</p><p class="small">${product.deviceReferences.length?`Beobachtete Ausführungen: ${product.deviceReferences.map(x=>`<b>${esc(x)}</b>`).join(' · ')}.`:'Der /xx-Index ist in dieser Modellquelle noch offen.'} Eine erfasste Ausführung gibt keine anderen Indizes frei.</p><label class="field-label" for="siemensENumber">E-Nr. vom eigenen Gerät</label><input class="text-input" id="siemensENumber" maxlength="24" autocomplete="off" placeholder="${esc(product.model)}/xx"><button class="btn btn-secondary" id="siemensCheck">E-Nr. lokal prüfen</button><div id="siemensResult" role="status"></div><a class="btn btn-secondary" href="${esc(safeExternalUrl(product.spareFinderUrl))}" target="_blank" rel="noopener noreferrer">Erfasste Siemens Teilequelle öffnen ↗</a></section>`;
 if(product.brand==='Philips')return `${renderManufacturerNotices(product)}<section class="card"><h3>Philips: vollständige Modellnummer prüfen</h3><p class="muted">${esc(product.identityNote)}${esc(note)}</p><p class="small">Beobachtete Produktcodes: ${product.deviceReferences.map(x=>`<b>${esc(x)}</b>`).join(' · ')||'Ausführung noch offen'}. Die gemeinsame Modellnummer bestätigt keine Teilepassung.</p>${product.dataStatus==='manufacturer-listed'?'<p class="notice">Modell im deutschen Hersteller-Verzeichnis gefunden. Einzelne Geräteunterlagen und Teilelisten sind noch offen.</p>':''}<label class="field-label" for="philipsModelReference">Vollständige Modellnummer vom eigenen Gerät</label><input class="text-input" id="philipsModelReference" maxlength="24" autocomplete="off" spellcheck="false" placeholder="${esc(product.model)}/xx oder /xxR1"><button class="btn btn-secondary" id="philipsCheck">Modellnummer lokal prüfen</button><div id="philipsResult" role="status"></div><a class="btn btn-secondary" href="${esc(safeExternalUrl(product.spareFinderUrl))}" target="_blank" rel="noopener noreferrer">Philips Ersatzteile anhand Modellnummer suchen ↗</a></section>`;
 if(product.brand==='Rowenta')return `<section class="card"><h3>Rowenta: vollständige Ref. Nr. prüfen</h3><p class="muted">${esc(product.identityNote)}${esc(note)}</p><p class="small">Beobachtete Referenzen: ${product.deviceReferences.map(x=>`<b>${esc(x)}</b>`).join(' · ')}. Zusammengefasste Ausführungen haben keine gemeinsame Teilefreigabe.</p><a class="btn btn-secondary" href="${esc(safeExternalUrl(product.spareFinderUrl))}" target="_blank" rel="noopener noreferrer">Referenz im Rowenta Zubehörshop suchen ↗</a></section>`;
 if(product.brand==='Dyson')return `<section class="card"><h3>Dyson-Generation vor dem Teilekauf prüfen</h3><p class="muted">${esc(product.identityNote)}${esc(note)}</p><p class="small">Hersteller-Produktnummer dieser Referenz: <b>${esc(product.deviceSku)}</b>. Bei V11 können verschraubte und einklickbare Akkus, bei V8 unterschiedliche Filterformen und bei V10 verschiedene Behältergrößen vorkommen. Die Referenz allein bestätigt kein Austausch- oder Nachbauteil.</p><a class="btn btn-secondary" href="${esc(safeExternalUrl(product.spareFinderUrl))}" target="_blank" rel="noopener noreferrer">Dyson Teile & Ausführung prüfen ↗</a></section>`;
 return `<section class="card"><h3>AEG Teile mit der vollständigen PNC prüfen</h3><p class="muted">Lies die Produktnummer neben „Prod.No.“ am Typenschild ab. Neun Ziffern identifizieren den Stamm; die zwei weiteren Ziffern unterscheiden die Ausführung.${esc(note)}</p><p class="small">PNC in der Modellquelle: ${product.pncs.map(p=>`<b>${esc(p)}</b>`).join(' · ')}.</p><label class="field-label" for="aegPNC">PNC vom eigenen Gerät</label><input class="text-input" id="aegPNC" maxlength="22" inputmode="numeric" autocomplete="off" placeholder="9 oder 11 Ziffern"><button class="btn btn-secondary" id="aegCheck">PNC lokal prüfen</button><div id="aegResult" role="status"></div><p class="small muted">Die Eingabe bleibt nur auf dieser Seite. Erst ein Klick auf den Link öffnet die PNC-Suche bei AEG; Seriennummer und Anmeldung sind hier nicht nötig.</p></section>`;
}
function renderPartListCoverage(product){
 const coverage=product?.partListCoverage;if(!coverage)return '';
 const note=typeof coverage==='string'?coverage:coverage.note;
 const url=typeof coverage==='object'?safeExternalUrl(coverage.sourceUrl):null;
 return `<section class="card catalog-coverage"><h3>Stand der Teileliste</h3><p class="small muted">${esc(note||'Weitere Artikel anhand der vollständigen Gerätekennung beim Hersteller prüfen.')}</p>${url?`<a class="btn btn-secondary" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${product.brand==='Vorwerk'?'Vorwerk Zubehörshop':`Hersteller-Teileliste ${esc(coverage.reference||'')}`} öffnen ↗</a>`:''}</section>`;
}
function wireBrandIdentity(product){
 byId('vorwerkCheck')?.addEventListener('click',()=>{
  const review=reviewVorwerkModel(product,byId('vorwerkModel').value),messages={invalid:'Bitte die VK-, VT- oder VB-Kennung vom Grundgerät ablesen, zum Beispiel VK7 oder Tiger 260. Eine Zubehör- oder Seriennummer genügt hier nicht.',different_model:'Diese Kennung gehört zu einem anderen Grundmodell. Geräteauswahl und Typenschild vergleichen.',listed:'Die Grundgerätekennung stimmt mit dieser Modellreferenz überein. Zubehörtyp, Anschlüsse und die Eignung jedes Ersatzteils müssen separat geprüft werden.'};
  byId('vorwerkResult').textContent=messages[review.status];
 });
 byId('vorwerkModel')?.addEventListener('input',()=>{byId('vorwerkResult').textContent='Geänderte Grundgerätekennung erneut prüfen.';});
 byId('vorwerkModel')?.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();byId('vorwerkCheck').click();}});
 byId('philipsCheck')?.addEventListener('click',()=>{
  const review=reviewPhilipsModelReference(product,byId('philipsModelReference').value),messages={invalid:'Bitte eine Philips-Modellnummer mit dem tatsächlichen /xx-Produktcode und gegebenenfalls R-Ausführung ablesen.',different_model:'Diese Nummer gehört zu einem anderen Modell. Prüfe die Geräteauswahl und das Typenschild.',variant_open:'Der Modellstamm ist erkannt. Die zwei Ziffern nach / und gegebenenfalls die R-Ausführung bleiben offen.',listed:'Dieser vollständige Produktcode steht im erfassten Geräteverzeichnis. Die Eignung jedes Ersatzteils am eigenen Gerät bleibt beim Hersteller zu prüfen.',unlisted_variant:'Der Modellstamm ist erkannt. Diese /xx/R-Ausführung steht noch nicht im lokalen Geräteverzeichnis. Im Philips-Support separat prüfen.'};
  byId('philipsResult').textContent=messages[review.status];
 });
 byId('philipsModelReference')?.addEventListener('input',()=>{byId('philipsResult').textContent='Geänderte Modellnummer erneut prüfen.';});
 byId('philipsModelReference')?.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();byId('philipsCheck').click();}});
 byId('siemensCheck')?.addEventListener('click',()=>{
  const review=reviewSiemensENumber(product,byId('siemensENumber').value),messages={invalid:'Bitte eine Siemens E-Nr. mit dem tatsächlichen zweistelligen /xx-Index ablesen.',different_model:'Diese E-Nr. gehört zu einem anderen Modell. Prüfe die Auswahl und das Typenschild.',index_open:'Modellreferenz erkannt. Der zweistellige /xx-Index ist noch offen.',listed:'Diese E-Nr. steht in der erfassten Herstellerquelle. Die Eignung des einzelnen Artikels am eigenen Gerät bleibt zu prüfen.',unlisted_index:'Modellreferenz erkannt. Dieser /xx-Index ist noch nicht in der lokalen Teilequelle erfasst. Im Siemens Service separat prüfen.'};
  const link=['listed','unlisted_index'].includes(review.status)?siemensServiceLink(review.number?.full):null;
  byId('siemensResult').innerHTML=`<p class="notice">${esc(messages[review.status])}</p>${link?`<a class="btn btn-secondary" href="${esc(safeExternalUrl(link.url))}" target="_blank" rel="noopener noreferrer">${esc(link.label)} ↗</a>`:''}`;
 });
 byId('siemensENumber')?.addEventListener('input',()=>{byId('siemensResult').textContent='Geänderte E-Nr. erneut prüfen.';});
 byId('aegCheck')?.addEventListener('click',()=>{
  const review=reviewAegPNC(product,byId('aegPNC').value),messages={invalid:'Bitte 9 oder 11 Ziffern der PNC ablesen.',prefix_only:'Der PNC-Stamm steht in der Modellquelle. Die zweistellige Ausführung ist noch offen.',listed:'Diese vollständige PNC steht in der Modellquelle. Die Eignung des einzelnen Artikels bleibt beim Hersteller zu prüfen.',unknown:'Diese PNC steht nicht in der erfassten Modellquelle. Prüfe Modell und Typenschild; daraus wird hier keine passende Ausführung abgeleitet.'};
  const url=aegPartsLink(review.pnc?.full),region=byId('aegResult');
  region.innerHTML=`<p class="notice compact">${esc(messages[review.status])}</p>${url?`<a class="btn btn-secondary" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Teile für diese PNC bei AEG prüfen ↗</a>`:''}`;
 });
 byId('aegPNC')?.addEventListener('input',()=>{byId('aegResult').textContent='Geänderte PNC erneut prüfen.';});
}

function renderPartInstructions(part,product){
  const info=installationInfo(part,product);
  const time=installationTime(part);
  return `<div class="section-head"><div class="section-title">Einbau & Pflege</div><span class="small muted">${info.missing?'Anleitung fehlt':'Quellen verlinkt'}</span></div>
    <section class="card installation-card">${part.professionalOnly?'<p class="notice warn">Montage mit dem Reparaturdienst klären und die Herstellerunterlagen beachten.</p>':''}<div class="install-time"><strong>⏱ ${esc(time.label)}</strong>${time.status==='estimate'?`<span class="pill pill-info">Schätzung</span><p class="small">${esc(time.task)} · ${esc(time.basis)}</p>`:''}<p class="small muted">${esc(time.reason)}</p>${time.status==='estimate'?'<p class="small muted">Aktive Arbeitszeit für einen Wechsel. Ladezeit, Trocknung und Fehlersuche kommen bei Bedarf separat dazu.</p>':''}</div><div class="divider"></div><p class="small muted">${esc(info.note)}</p>
      ${part.id==='aftermarket-swirl-swirl-m40-m50-anti-geruch'?`<ol class="checklist">${swirlBagSteps.map((step,i)=>`<li><span>${i+1}</span><div>${esc(step)}</div></li>`).join('')}</ol><p class="small muted">Kurzfassung der Swirl-Bilderanleitung. Halterung kann je nach Gerät abweichen.</p>`:''}
      <div class="guide-links">${info.links.map(link=>`<a class="btn btn-secondary" href="${esc(safeExternalUrl(link.url))}" target="_blank" rel="noopener noreferrer">📘 ${esc(link.label)} ↗</a><p class="small muted">${esc(link.scope)}</p>`).join('')}</div>
      ${info.finder?`<a href="${esc(info.finder.url)}" target="_blank" rel="noopener noreferrer">${esc(info.finder.label)} ↗</a>`:''}
      ${info.dataSheets.length?`<div class="divider"></div><b class="small">Produktdaten · keine Einbauanleitung</b><div class="guide-links">${info.dataSheets.map(link=>`<a href="${esc(safeExternalUrl(link.url))}" target="_blank" rel="noopener noreferrer">${esc(link.label)} ↗</a>`).join('')}</div>`:''}
    </section>`;
}

function priceText(quote){
  if(!quote||!isAmount(quote.price)||!['EUR','PLN'].includes(quote.currency))return 'Preis offen';
  const amount=new Intl.NumberFormat('de-DE',{style:'currency',currency:quote.currency}).format(quote.price);
  return `${quote.priceBasis==='bulk-from'?'ab ':''}${amount}`;
}
function priceTaxLabel(quote){
  return quote?.vatIncluded===true?'inkl. MwSt.':quote?.vatIncluded===false?'netto · zzgl. MwSt.':'Steuerbasis offen';
}
function quoteDate(quote){
  return Number.isFinite(Date.parse(quote?.checkedAt))?new Date(quote.checkedAt).toLocaleDateString('de-DE',{timeZone:'Europe/Berlin'}):'Datum offen';
}
function priceAgeLabel(quote){
  const labels={fresh:'Preisstand · unter 24 h',stale:'Älter als 24 h',future:'Abrufdatum prüfen',unknown:'Abrufdatum offen',reference:'Quellenpreis · im Shop prüfen'};
  return isAmount(quote?.price)?labels[quoteStatus(quote)]:labels[quoteStatus(quote)]?.replace('Preisstand','Quellenstand');
}
function deliveryText(quote){
  if(!quote)return 'Lieferzeit offen';
  if(quote.stock==='unavailable')return 'Nicht bestellbar im erfassten Stand';
  if(quote.delivery)return `ca. ${quote.delivery.min}–${quote.delivery.max} Werktage`;
  return quote.stock==='available'?'Auf Lager · Ankunftszeit offen':'Verfügbarkeit und Lieferzeit offen';
}
function shippingText(quote){
  if(!quote||quote.market!=='DE')return 'Versand nach DE offen';
  const shipping=comparableQuote(quote)?shippingCost(quote.shippingRuleId,quote.price):null;
  return shipping===null?'im Shop prüfen':shipping===0?'kostenfrei':money(shipping);
}
function renderPartCommerce(part,product){
  const quote=quoteForPart(part);
  if(!quote)return '<section class="card"><h3>Preis und Versand offen</h3><p class="muted">Für dieses Teil wurde kein belegter Anbieterpreis erfasst.</p></section>';
  const fresh=quoteFresh(quote),total=fresh?singleQuoteTotal(quote):null;
  const policy=shippingPolicies[quote.shippingRuleId];
  const selectable=!!cartQuoteItem(part,product);
  return `<div class="section-head"><div class="section-title">Preis, Versand & Lieferung</div><span class="pill ${fresh?'pill-info':'pill-warn'}">${esc(priceAgeLabel(quote))}</span></div>
    <section class="card price-quote" data-price-quote="${esc(quote.partKey)}"><div class="row-tight"><b>${esc(quote.merchant)}</b><span class="pill ${quote.stock==='available'&&fresh?'pill-ok':'pill-warn'}">${quote.stock==='available'?'Auf Lager im erfassten Stand':quote.stock==='unavailable'?'Nicht bestellbar im erfassten Stand':'Bestand offen'}</span></div>
    <div class="commerce-grid"><div><span>Artikelpreis</span><strong>${esc(priceText(quote))}</strong><small>${esc(priceTaxLabel(quote))} · ${esc(quote.unitLabel)}</small></div><div><span>Versand nach DE</span><strong>${esc(shippingText(quote))}</strong><small>für 1 Verkaufseinheit</small></div><div><span>Gesamt für 1 Verkaufseinheit</span><strong>${total!==null?money(total):'offen'}</strong><small>${total!==null?'inkl. MwSt. und genanntem Standardversand':'Bestellbarkeit, Preisbasis und Versand im Shop prüfen'}</small></div></div>
    <p><b>Lieferung:</b> ${esc(deliveryText(quote))}</p><p class="small muted">${esc(quote.availabilityText)}${quote.dispatchNote?` · ${esc(quote.dispatchNote)}`:''}</p>
    ${quote.deliveryNote?`<p class="small muted">${esc(quote.deliveryNote)}</p>`:''}
    ${policy?`<p class="small muted">${esc(policy.summary)} <a href="${esc(policy.sourceUrl)}" target="_blank" rel="noopener noreferrer">Versandquelle ↗</a></p>`:''}
    <p class="small muted">${esc(quote.priceNote||'')} ${quote.sourceAgeNote?esc(quote.sourceAgeNote):''}</p>
    <div class="row price-actions"><a class="btn btn-secondary" href="${esc(safeExternalUrl(quote.sourceUrl))}" target="_blank" rel="noopener noreferrer">Preis im Shop prüfen ↗</a>${selectable?'<button class="btn btn-primary" data-add-price>🛒 Mit diesem Preis vormerken</button>':''}<button class="btn btn-ghost" data-shipping>Versandübersicht</button></div>
    <p class="small muted price-stand">Abruf ${esc(quoteDate(quote))} · gespeicherte Quellenangabe. Der aktuelle Shoppreis gilt bei Bestellung.${!fresh?' Preisstand nicht aktuell bestätigt; vor Verwendung im Shop prüfen.':''}</p></section>`;
}

function renderMarketplaceLinks(part,condition){
  return `<div class="marketplace-link-grid">${searchLinksForPart(part,condition).map(link=>`<div class="marketplace-choice"><a class="btn btn-secondary" data-marketplace-link="${link.provider}" href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${esc(link.label)} ↗</a><small class="muted">${esc(link.note)}</small></div>`).join('')}</div>`;
}
function renderPartMarketplaces(part,product){
  const identity=partSearchIdentity(part);
  if(!identity)return '';
  const condition=state.marketplaceFilters.condition;
  return `<div class="section-head"><div class="section-title">Gebraucht & weitere Kaufoptionen</div><span class="pill pill-info">Externe Suche</span></div>
    <section class="card marketplace-panel"><label class="field-label" for="partMarketCondition">Gesuchter Zustand</label><select class="text-input" id="partMarketCondition">${marketplaceConditions.map(([value,label])=>`<option value="${value}" ${value===condition?'selected':''}>${label}</option>`).join('')}</select>
    <p class="small muted">Suchtext: <b>${esc(identity.query)}</b> · ${part.tier==='oem'?'Originalteil':'Nachbau-Artikel'}</p>
    ${renderMarketplaceLinks(part,condition)}<p class="small muted">Preis, Versand, Lieferzeit, Zustand und Lieferumfang im Angebot prüfen. Die Suchtreffer bestätigen noch keine Passgenauigkeit; Altteilnummer, Ausführung und Anschlüsse vergleichen.</p>
    <div class="row">${product?'<button class="btn btn-secondary" data-save-market-search>🛒 Suche als Teilenotiz vormerken</button>':''}<button class="btn btn-ghost" id="moreMarketplaces">${product?'Marktplatzsuche für dieses Gerät':'Alle Teile auf Marktplätzen suchen'}</button></div>
    ${!partBrands(part).includes('Miele')?'<p class="notice info">Suchlinks sind nutzbar. Live-Angebote innerhalb der App sind für diese Marke noch nicht freigeschaltet.</p>':`<div class="section-head"><b>Pilot-Angebotssuche</b><button class="text-button" data-pilot-account>Pilotkonto</button></div><p class="small muted">Für freigeschaltete Pilotkonten. Händlerzugänge sind noch in Vorbereitung.</p><div class="row"><button class="btn btn-secondary" data-pilot-provider="ebay">eBay-Angebote prüfen</button><button class="btn btn-secondary" data-pilot-provider="amazon">Amazon-Angebote prüfen</button></div><div id="pilotResults" aria-live="polite"></div>`}
    <p class="small muted">Aktuelle Angebote werden beim Anbieter geöffnet. In der App sind noch keine Live-Angebote von eBay oder Amazon geladen.</p></section>`;
}
function wirePartMarketplaces(part,product){
  document.querySelector('[data-pilot-account]')?.addEventListener('click',()=>navigate('account'));
  document.querySelectorAll('[data-pilot-provider]').forEach(button=>button.addEventListener('click',async()=>{
    const region=byId('pilotResults'),condition=state.marketplaceFilters.condition;
    const buttons=[...document.querySelectorAll('[data-pilot-provider]')];buttons.forEach(b=>b.disabled=true);
    region.textContent='Angebotssuche wird geprüft …';
    const result=await pilot.search(button.dataset.pilotProvider,part,condition);
    if(!region.isConnected)return;
    buttons.forEach(b=>b.disabled=false);
    region.innerHTML=`<p class="small muted">${esc(pilotMessages[result.status]||'Die Suche ist derzeit nicht verfügbar.')}</p>${result.offers.map(offer=>`<article class="card"><b>${esc(offer.title)}</b><p class="small">${offer.price===null?'Preis offen':esc(money(offer.price))} · ${esc(offer.seller||'Verkäufer offen')} · ${esc(offer.condition==='used'?'Gebraucht':offer.condition==='new'?'Neu':'Überholt')}</p><p class="small muted">Versand und Lieferzeit beim Händler prüfen. Teilenummer, Ausführung und Anschlüsse vergleichen; Passgenauigkeit nicht bestätigt.</p><a class="btn btn-secondary" href="${esc(offer.url)}" target="_blank" rel="noopener noreferrer">Angebot beim Händler öffnen ↗</a></article>`).join('')}${result.status==='ready'&&!result.offers.length?'<p class="small">Keine passenden Angebote zurückgegeben.</p>':''}`;
  }));
  byId('partMarketCondition')?.addEventListener('change',()=>{state.marketplaceFilters.condition=normalizeCondition(byId('partMarketCondition').value);route();});
  byId('moreMarketplaces')?.addEventListener('click',()=>navigate('marketplaces',product?.id||''));
  document.querySelector('[data-save-market-search]')?.addEventListener('click',()=>{
    const note=marketplaceSearchNote(part,product,state.marketplaceFilters.condition);
    if(!note){toast('Erst ein Gerät und ein zugeordnetes Teil auswählen.','error');return;}
    addCartItem(note);route();toast('Teilesuche vorgemerkt. Angebot und Preis bleiben offen.','success');
  });
}

function marketplacesPage(productId=''){
  const product=productId?products.find(p=>p.id===productId):null;
  if(productId&&!product){notFound();return;}
  const f=state.marketplaceFilters,sourceParts=product?product.parts:partsCatalog;
  const {categories,series}=partFilterOptions(sourceParts,products,product?'all':f.brand);
  if(f.category!=='all'&&!categories.includes(f.category))f.category='all';
  if(!product&&f.series!=='all'&&!series.includes(f.series))f.series='all';
  const list=filterParts(sourceParts,{...f,brand:product?'all':f.brand,series:product?'all':f.series},products).sort((a,b)=>a.name.localeCompare(b.name,'de'));
  shell(`<button class="btn btn-ghost" id="back">← ${product?esc(product.model):'Zur Startseite'}</button>
    <div class="eyebrow">${product?esc(product.brand):`${catalogBrands.length} Marken`} · eBay & Amazon</div><h2>Gebrauchte Teile finden.</h2>
    <p class="muted">Schläuche, Rohre, Bürsten, Akkus und weitere Teile anhand ihrer Teilenummer suchen. Neu oder gebraucht auswählen und die aktuellen Angebote direkt beim Anbieter prüfen.</p>
    ${renderBoschSupport(product)}
    ${renderBrandIdentity(product)}${product?.deviceQuote?`<section class="card"><h3>Gerätepreis & Budget</h3>${renderDeviceBudget(product)}<p class="small muted">Dieser Preis betrifft das vollständige Gerät. Für Ersatzteile gelten die jeweiligen Artikelpreise. Keine verbindliche Kaufempfehlung oder Verkaufsrangfolge.</p><a class="btn btn-secondary" href="${esc(safeExternalUrl(product.deviceQuote.productUrl||product.deviceQuote.sourceUrl))}" target="_blank" rel="noopener noreferrer">Gerätepreis beim Hersteller prüfen ↗</a></section>`:''}
    <section class="card filter-card"><form id="marketSearch" class="searchbar"><input id="marketQuery" aria-label="Teil für Marktplatzsuche" inputmode="search" placeholder="Teil, Material-Nr., Artikel-Nr. oder EAN …" value="${esc(f.query)}"><button class="btn btn-primary">Suchen</button></form>
    <div class="filter-grid">${product?'':`<label><span>Marke des Geräts</span><select id="marketBrand"><option value="all">Alle Marken</option>${catalogBrands.map(b=>`<option value="${b}" ${f.brand===b?'selected':''}>${b}</option>`).join('')}</select></label>`}<label><span>Gerät</span><select id="marketDevice"><option value="">Gesamter Teilekatalog</option>${products.filter(p=>product||f.brand==='all'||p.brand===f.brand).sort((a,b)=>a.model.localeCompare(b.model,'de')).map(p=>`<option value="${esc(p.id)}" ${p.id===productId?'selected':''}>${esc(p.brand)} ${esc(p.model)}${p.recordType==='model'?` · ${esc(p.identifiers.find(i=>i.type==='material-number')?.value||p.model)}`:' · Serienzuordnung'}</option>`).join('')}</select></label>
    <label><span>Zustand</span><select id="marketCondition">${marketplaceConditions.map(([v,l])=>`<option value="${v}" ${f.condition===v?'selected':''}>${l}</option>`).join('')}</select></label>
    <label><span>Original / Nachbau</span><select id="marketTier">${[['all','Alle Teile'],['oem','Originalteile'],['aftermarket','Nachbauten']].map(([v,l])=>`<option value="${v}" ${f.tier===v?'selected':''}>${l}</option>`).join('')}</select></label>
    ${purposeFilter('marketPurpose',f.purpose)}<label><span>Bauteil</span><select id="marketCategory"><option value="all">Alle Bauteile</option>${categories.map(c=>`<option value="${esc(c)}" ${f.category===c?'selected':''}>${esc(c)}</option>`).join('')}</select></label>
    ${product?'':`<label><span>Serie</span><select id="marketSeries"><option value="all">Alle Serien</option>${series.map(s=>`<option value="${esc(s)}" ${f.series===s?'selected':''}>${esc(s)}</option>`).join('')}</select></label>`}</div>
    <button class="btn btn-secondary btn-small" id="marketReset">Filter zurücksetzen</button>${partTypeFilters(filterParts(sourceParts,{brand:product?'all':f.brand}),f,'market')}</section>
    <div class="notice info"><b>${product?`${esc(product.brand)} ${esc(product.model)}`:'Teilekatalog ohne gewähltes Gerät'}:</b> ${product?'Die Teilezuordnung stammt aus dem Katalog.':'Öffne dein Gerät für die Teilezuordnung.'} Ein Treffer auf eBay oder Amazon ist noch keine Bestätigung. Teilenummer, Ausführung, Anschlüsse und Lieferumfang im Angebot vergleichen.</div>
    <div class="section-head"><div class="section-title">Teile für die Marktplatzsuche</div><span class="small muted">${list.length} von ${sourceParts.length} Teilen</span></div>
    <div class="parts-catalog-grid marketplace-catalog">${list.map(part=>{const fit=partFitmentMeta(part),identity=partSearchIdentity(part),time=installationTime(part);return `<article class="card marketplace-part" data-part-type="${partType(part).id}" style="--part-color:${partType(part).color}" data-market-part-card="${esc(part.id)}"><div class="part-card-top">${partPhoto(part)}<div class="grow"><span class="pill ${fit.cls}">${fit.label}</span><h3><button class="text-button" data-market-part="${esc(part.id)}">${esc(part.name)} ›</button></h3>${partLabels(part)}${partReferenceNote(part)}<div class="small muted">${part.tier==='oem'?'Originalteil':'Nachbau'}</div><div class="small part-number">${esc(identifierLabel(identity?.codeType,part.brand))} ${esc(identity?.code)}</div></div></div>
    ${renderMarketplaceLinks(part,f.condition)}<p class="small muted marketplace-price-open">Preis, Versand & Lieferzeit im Angebot prüfen.</p><div class="small muted">⏱ ${esc(time.label)}${time.status==='estimate'?' · aktive Arbeitszeit, geschätzt':''}</div>${product?`<button class="btn btn-ghost btn-small" data-market-save="${esc(part.id)}">🛒 Als Teilenotiz vormerken</button>`:''}</article>`;}).join('')||'<div class="card empty-state"><h3>Keine Teile für diese Auswahl</h3><p class="muted">Andere Bezeichnung suchen oder Filter zurücksetzen.</p></div>'}</div>
    <details class="card marketplace-explanation"><summary>Was zeigt die Marktplatzsuche?</summary><p class="small muted">Die Links suchen mit der Material- oder Artikelnummer des ausgewählten Teils. eBay öffnet eine Sofort-Kaufen-Suche mit dem gewählten Neu-/Gebraucht-Filter. Bei Amazon sind gebrauchte Kaufoptionen gegebenenfalls auf der Produktseite auswählbar; der Suchlink setzt keinen Zustandsfilter.</p><p class="small muted">Angebotsbestand, Preise, Versand und Liefertermine stehen beim jeweiligen Anbieter. Live-Angebote innerhalb der App benötigen noch freigeschaltete Zugänge. Vorgemerkte Suchen behalten einen offenen Preis und werden nicht als gekauft oder lieferbar behandelt.</p></details>`,'home');
  wireBoschSupport(product);
  wireBrandIdentity(product);
  byId('marketBrand')?.addEventListener('change',()=>{state.marketplaceFilters.brand=byId('marketBrand').value;state.marketplaceFilters.series='all';marketplacesPage(productId);});
  byId('back')?.addEventListener('click',()=>navigate(product?'product':'home',product?.id||''));
  const update=()=>{state.marketplaceFilters={brand:byId('marketBrand')?.value||'all',query:byId('marketQuery').value.trim(),tier:byId('marketTier').value,category:byId('marketCategory').value,purpose:byId('marketPurpose').value,series:byId('marketSeries')?.value||'all',condition:normalizeCondition(byId('marketCondition').value)};marketplacesPage(productId);};
  wirePartTypeFilters('market','marketCategory',update);
  byId('marketSearch')?.addEventListener('submit',e=>{e.preventDefault();update();});
  ['marketCondition','marketTier','marketCategory','marketPurpose','marketSeries'].forEach(id=>byId(id)?.addEventListener('change',update));
  byId('marketDevice')?.addEventListener('change',()=>{const next=byId('marketDevice').value;state.marketplaceFilters={...state.marketplaceFilters,category:'all',purpose:'all',series:'all'};navigate('marketplaces',next);});
  byId('marketReset')?.addEventListener('click',()=>{state.marketplaceFilters={brand:'all',query:'',tier:'all',category:'all',purpose:'all',series:'all',condition:'used'};marketplacesPage(productId);});
  document.querySelectorAll('[data-market-part]').forEach(b=>b.addEventListener('click',()=>navigate(product?'part':'catalog-part',product?`${product.id}:${b.dataset.marketPart}`:b.dataset.marketPart)));
  document.querySelectorAll('[data-market-save]').forEach(b=>b.addEventListener('click',()=>{const part=product.parts.find(p=>p.id===b.dataset.marketSave),note=marketplaceSearchNote(part,product,f.condition);if(note){addCartItem(note);marketplacesPage(productId);toast('Teilesuche vorgemerkt. Angebot und Preis bleiben offen.','success');}}));
}
function wireCommerce(part,product){
  document.querySelectorAll('[data-shipping]').forEach(b=>b.addEventListener('click',()=>navigate('shipping')));
  document.querySelectorAll('[data-add-price]').forEach(b=>b.addEventListener('click',()=>{
    const item=cartQuoteItem(part,product);
    if(!item){toast('Preis, Bestellbarkeit oder Teileausführung erst im Shop prüfen.','error');return;}
    addCartItem(item);toast('Teil mit Anbieter und Preisstand vorgemerkt.','success');
    partPage(`${product.id}:${part.id}`);
  }));
}
function renderPriceTable(parts,product){
  return `<div class="price-table-scroll" tabindex="0" aria-label="Preisliste seitlich scrollen"><table class="price-table"><caption>Je Verkaufseinheit · Versand für Deutschland · Einbauzeiten sind eigene Schätzungen</caption><thead><tr><th scope="col">Teil</th><th scope="col">Artikelpreis</th><th scope="col">Versand DE</th><th scope="col">Gesamt DE</th><th scope="col">Lieferung</th><th scope="col">Einbau ca.</th></tr></thead><tbody>${parts.map(part=>{
    const q=quoteForPart(part),time=installationTime(part),fresh=q&&quoteFresh(q),total=fresh?singleQuoteTotal(q):null;
    return `<tr data-price-row="${esc(part.id)}"><th scope="row"><button class="text-button price-part-name" data-price-part="${esc(part.id)}">${esc(part.name)} ›</button>${partLabels(part)}${partReferenceNote(part)}<small>${part.tier==='oem'?'Original':'Nachbau'} · ${esc(part.identifiers[0]?.value)}</small></th><td><strong>${esc(priceText(q))}</strong><small>${esc(q?.merchant||'Anbieter offen')}</small><small>${esc(priceTaxLabel(q))} · ${esc(q?.unitLabel||'')}</small>${q?`<small class="${fresh?'muted':'warn-text'}">${esc(priceAgeLabel(q))}</small>`:''}</td><td>${esc(shippingText(q))}</td><td><strong>${total!==null?money(total):'offen'}</strong></td><td>${esc(deliveryText(q))}</td><td>${esc(time.label)}${time.status==='estimate'?'<small>aktive Arbeitszeit · geschätzt</small>':'<small>Montageablauf fehlt oder Ausführung prüfen</small>'}</td></tr>`;
  }).join('')}</tbody></table></div>`;
}

function shippingPage(){
  shell(`<button class="btn btn-ghost" id="back">← Zurück</button><div class="eyebrow">Versand · Deutschland</div><h2>Versandkosten & Lieferzeiten</h2><p class="muted">Stand 06.10.2026. Kosten und Freigrenzen gelten je Händlerbestellung; die Lieferzeit hängt vom jeweiligen Teil ab.</p>
  <div class="shipping-policy-grid">${Object.values(shippingPolicies).map(p=>`<article class="card"><h3>${esc(p.merchant)}</h3><p>${esc(p.summary)}</p><p class="small muted">${esc(p.deliveryNote)}</p>${p.extra?`<p class="small muted">${esc(p.extra)}</p>`:''}<a class="btn btn-secondary" href="${esc(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">Versandbedingungen öffnen ↗</a></article>`).join('')}</div><p class="small muted">Ein Preis aus dem polnischen Electropapa-Shop bestätigt keinen Versand nach Deutschland. Nettopreise und Mengenstaffeln werden separat angezeigt.</p>`,'home');
  byId('back')?.addEventListener('click',()=>history.length>1?history.back():navigate('parts'));
}

function evidenceGradeLabel(grade){
  const map={A:'Starker Nachweis',B:'Unterstützender Nachweis',C:'Nur Hinweis'};
  return map[grade]||'Nachweis';
}

function jobRoleMeta(role){
  const map={
    required:{label:'Erforderlich',cls:'pill-bad',icon:'!'},
    recommended:{label:'Empfohlen',cls:'pill-info',icon:'+'},
    consumable:{label:'Verbrauch',cls:'pill-neutral',icon:'↻'},
    care:{label:'Pflege',cls:'pill-info',icon:'◇'},
    optional:{label:'Optional',cls:'pill-neutral',icon:'○'}
  };
  return map[role]||map.optional;
}

function jobDefaults(job){
  return (job.items||[]).filter(item=>item.includedWithMain).map(item=>item.id);
}

function jobCompleteness(job, selectedIds){
  const required=(job.items||[]).filter(item=>item.required);
  if(!required.length) return 100;
  const selected=new Set(selectedIds||[]);
  const covered=required.filter(item=>selected.has(item.id)).length;
  return Math.round((covered/required.length)*100);
}

function stockAdvice(plan, values){
  const stock=Math.max(0,Number(values.stock)||0);
  const avg=Math.max(.1,Number(values.avgDaysPerUnit)||1);
  const remainingDays=Math.round(stock*avg);
  const leadMin=Math.max(0,Number(values.leadTimeMinDays)||0);
  const leadMax=Math.max(leadMin,Number(values.leadTimeMaxDays)||leadMin);
  const safety=Math.max(0,Number(values.safetyDays)||0);
  const reorderAt=leadMax+safety;
  const shouldOrder=remainingDays<=reorderAt;
  const urgency=remainingDays<=leadMax?'high':shouldOrder?'medium':'low';
  return {remainingDays,leadMin,leadMax,safety,reorderAt,shouldOrder,urgency};
}

function notificationPermissionLabel(){
  if(!('Notification' in window)) return 'nicht unterstützt';
  if(Notification.permission==='granted') return 'erlaubt';
  if(Notification.permission==='denied') return 'blockiert';
  return 'noch nicht erlaubt';
}

async function requestNotifications(){
  if(!('Notification' in window)){toast('Benachrichtigungen werden von diesem Browser nicht unterstützt.','error');return false;}
  const permission=await Notification.requestPermission();
  if(permission==='granted'){toast('Benachrichtigungen erlaubt.','success');return true;}
  toast(permission==='denied'?'Benachrichtigungen wurden blockiert.':'Keine Berechtigung erteilt.',permission==='denied'?'error':'default');
  return false;
}

async function showLocalNotification(title,body){
  if(!('Notification' in window)) return false;
  if(Notification.permission!=='granted' && !(await requestNotifications())) return false;
  try{
    const reg=await navigator.serviceWorker?.ready;
    if(reg?.showNotification){await reg.showNotification(title,{body,icon:'./icons/icon-192.png',badge:'./icons/icon-192.png',tag:'uf-smart-stock-demo'});return true;}
  }catch{}
  try{new Notification(title,{body,icon:'./icons/icon-192.png'});return true;}catch{return false;}
}

function showModal({title, body, confirmLabel='Speichern', cancelLabel='Abbrechen', onConfirm, danger=false}){
  const root = byId('modalRoot');
  if(!root) return;
  root.innerHTML = `
    <div class="modal-backdrop" data-modal-close>
      <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div class="modal-grabber" aria-hidden="true"></div>
        <h2 id="modalTitle">${esc(title)}</h2>
        <div class="modal-body">${body}</div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="modalCancel">${esc(cancelLabel)}</button>
          <button class="btn ${danger?'btn-danger':'btn-primary'}" id="modalConfirm">${esc(confirmLabel)}</button>
        </div>
      </section>
    </div>`;
  const close = () => { root.innerHTML=''; };
  byId('modalCancel')?.addEventListener('click',close);
  root.querySelector('[data-modal-close]')?.addEventListener('click',e=>{ if(e.target.matches('[data-modal-close]')) close(); });
  byId('modalConfirm')?.addEventListener('click',()=>{ const shouldClose = onConfirm?.(close); if(shouldClose !== false) close(); });
  setTimeout(()=>root.querySelector('textarea,input,button')?.focus(),0);
}

function renderDeviceBudget(product){const q=product.deviceQuote;if(!q)return '<div class="small muted">Gerätepreis noch offen</div>';const band=deviceBudgetBands.find(([id])=>id===deviceBudgetBand(product))?.[1]||'Gerätepreis offen';return `<div class="small"><b>${money(q.price)} Gerätepreis</b> · ${esc(band)}<br><span class="muted">Hersteller-Stand ${esc(q.checkedAt)} · Preis und Versand im Shop prüfen</span></div>`;}

function productCard(product){
  const min = product.parts.flatMap(part=>part.offers || []).map(o=>(o.price||0)+(o.shipping||0)).filter(Number.isFinite);
  const from = min.length ? Math.min(...min) : null;
  const meta=getDeviceMeta(product.id);
  return `
    <article class="card product-card tap" data-product="${product.id}" tabindex="0" role="button" aria-label="${esc(product.brand)} ${esc(product.model)} öffnen">
      <div class="product-head">
        ${productImage(product)}
        <div class="grow">
          <div class="row-tight"><span class="pill ${dataStatusMeta(product).cls}">${dataStatusMeta(product).label}</span>${isSaved(product.id)?'<span class="pill pill-saved">★ gespeichert</span>':''}${meta.nickname?`<span class="pill pill-info">${esc(meta.nickname)}</span>`:''}</div>
          <h3>${esc(product.brand)} ${esc(product.model)}</h3>
          <div class="muted small">${esc(product.type)} · ${product.catalogLoaded===false?`${product.partCount} gelistete Teile · Details beim Öffnen`: `${product.parts.length} Teile`}${from!==null?` · ab ${money(from)}`:''}</div>
          ${product.recordType==='model'?renderDeviceBudget(product):''}
          ${product.recordType==='family'?'<div class="small muted">Familienzuordnung – genaue Materialnummer für das Einzelgerät prüfen.</div>':''}
        </div>
        <div class="chevron">›</div>
      </div>
    </article>`;
}

function wireProductCards(){
  document.querySelectorAll('[data-product]').forEach(el=>{
    const open = ()=>navigate('product',el.dataset.product);
    el.addEventListener('click',open);
    el.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();open();} });
  });
}

function productAverageFitment(product){
  if(!product?.parts?.length) return 0;
  return product.parts.reduce((sum,part)=>sum+Number(part.fitment?.confidence||0),0)/product.parts.length;
}
function filteredCatalog(){
  return filterCatalog(state.catalogFilters);
}

function isMielePilotCandidate(candidate){
  const brand=String(candidate?.brand||'').toLowerCase();
  const hay=[candidate?.name,candidate?.model,candidate?.category,candidate?.productType].filter(Boolean).join(' ').toLowerCase();
  return /\bmiele\b/i.test(brand) && (!hay || /vacuum|staub|saug|cleaner/.test(hay));
}

function renderMatches(matches,query=''){
  if(!matches.length) return `
    <div class="empty-state card">
      <div class="empty-icon">⌕</div><h3>Noch kein Katalogtreffer</h3>
      <p class="muted">Versuche Modell, Materialnummer, EAN oder fotografiere das komplette Typenschild.</p>
      <button class="btn btn-secondary" id="openScanFromEmpty">Scanner öffnen</button>
    </div>`;
  return matches.map(({product,score})=>`
    <article class="card product-card tap" data-product="${product.id}" tabindex="0" role="button">
      <div class="match-row"><div class="product-head grow">${productImage(product)}<div class="grow">
        <span class="pill ${score>=90?'pill-info':'pill-warn'}">${esc(matchReason(product,query))}</span>
        <h3>${esc(product.brand)} ${esc(product.model)}</h3><div class="muted small">${esc(product.type)}</div>
      </div></div><div class="chevron">›</div></div>
    </article>`).join('');
}

function home(query=''){
  const matches = query ? matchProducts(products,query) : [];
  const productCount = catalogStats.modelCount;
  const uniqueParts = catalogCoverage().reduce((n,r)=>n+r.physicalParts,0);
  const catalogList=filteredCatalog();
  const f=state.catalogFilters;
  const brandProducts=products.filter(p=>f.brand==='all'||p.brand===f.brand);
  const brandSeries=[...new Set(brandProducts.map(p=>p.vacuumMeta?.series).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));
  const bagSystems=[...new Set(brandProducts.map(p=>p.vacuumMeta?.bagSystem).filter(Boolean))].sort();
  const content = `
    <section class="hero">
      <div class="hero-topline"><div class="eyebrow">${catalogBrands.length} Marken · v${APP_VERSION}</div><span class="pill pill-ok">● Herstellerquellen</span></div>
      <h1>Dein Staubsauger.<br><span class="hero-accent">Teile für dein Modell.</span></h1>
      <div class="muted hero-copy">${productCount} Modelle erkennen und Originalteile, Nachbauten und Anleitungen finden. Vom Beutel über den Schlauch bis zur Bürstenwalze.</div>
      <div class="vacuum-showcase">${['vac-miele-model-12560300','vac-bosch-model-bbs611bsc'].map(id=>{const p=products.find(p=>p.id===id);return `<figure>${productImage(p,true)}<figcaption>${esc(p.brand)} ${esc(p.model)}<small>${p.vacuumMeta.deviceType==='cordless'?'Akku-Staubsauger':'Bodenstaubsauger'}</small></figcaption></figure>`}).join('')}</div>
      <form id="searchForm" class="searchbar">
        <input id="query" aria-label="Suche" autocomplete="off" inputmode="search" placeholder="Modell, E-Nr., Material-Nr. oder EAN …" value="${esc(query)}">
        <button class="btn btn-primary">Suchen</button>
      </form>
      <div class="row hero-actions"><button class="btn btn-secondary" id="scanHero">⌁ Typenschild / Barcode</button><button class="btn btn-secondary" id="recentHero">↻ Verlauf</button></div>
      <button class="btn btn-primary wide-btn" id="allParts">Alle Ersatzteile & Nachbauten →</button>
      <button class="btn btn-secondary wide-btn" id="allPrices">Preislisten, Versand & Einbauzeiten →</button>
      <button class="btn btn-secondary wide-btn" id="allMarketplaces">Gebrauchte Teile · eBay & Amazon →</button>
      <div class="row wrap"><button class="btn btn-secondary" id="repairHero">🔧 Reparieren lassen</button><button class="btn btn-secondary" id="rentalHero">Gerät mieten</button></div><div class="trust-row"><span>✓ ${esc(catalogBrands.join(' · '))}</span><span>✓ Herstellerquellen</span><span>✓ kein Login nötig</span></div>
    </section>
    <div class="metric-grid"><div class="metric"><strong>${productCount}</strong><span>Modellbezeichnungen</span></div><div class="metric"><strong>${catalogStats.recordCount}</strong><span>Katalogeinträge</span></div><div class="metric"><strong>${uniqueParts}</strong><span>Teile, Zubehör & Verbrauch</span></div></div>
    <div class="brand-catalog-grid">${catalogCoverage().map(r=>`<button class="card brand-catalog-card tap" data-brand-catalog="${esc(r.brand)}"><span class="row-tight"><b>${esc(r.brand)}</b>${['Rowenta','Philips'].includes(r.brand)?'<span class="pill pill-info">Erweitert</span>':['Vorwerk','Samsung','Hoover'].includes(r.brand)?'<span class="pill pill-info">Erweitert</span>':''}</span><strong>${r.models} Modelle</strong><small>${r.physicalParts} Teile · Ziel 100</small><small class="${r.recordsWithoutParts?'catalog-gap':''}">${r.recordsWithoutParts?`${r.recordsWithoutParts} Modelle ohne Teilezuordnung`:`Teile zu ${r.records} Modelleinträgen erfasst`}</small><small>${esc(r.identity)}</small></button>`).join('')}</div>
    <button class="btn btn-secondary wide-btn" id="catalogCoverage">100er-Ziele & fehlende Modellteile ansehen →</button>
    <p class="small muted">Modellbezeichnungen und Produktnummern sind getrennt gezählt. Teilelisten sind quellenbezogen; Ausführungen bleiben beim Hersteller zu prüfen. Datenstand: ${esc(catalogStats.retrievedAt)}. Produktfotos: jeweiliger Hersteller.</p>
    <div class="section-head"><div class="section-title">Schnell testen</div><span class="small muted">${catalogBrands.length} Marken</span></div>
    <div class="scenario-row">${demoScenarios.map(s=>`<button class="scenario-chip" data-scenario="${esc(s.query)}">${esc(s.label)}</button>`).join('')}</div>
    <div class="section-head"><div class="section-title">Modelle nach Marke filtern</div><span class="small muted">${catalogList.length} Modelleinträge sichtbar</span></div>
    <section class="card filter-card"><div class="filter-grid">
      <label><span>Marke</span><select id="filterBrand"><option value="all">Alle Marken</option>${catalogBrands.map(brand=>`<option value="${brand}" ${f.brand===brand?'selected':''}>${brand}</option>`).join('')}</select></label>
      <label><span>Serie</span><select id="filterSeries"><option value="all">Alle Serien</option>${brandSeries.map(series=>`<option value="${esc(series)}" ${f.series===series?'selected':''}>${esc(series)}</option>`).join('')}</select></label>
      <label><span>Geräteart</span><select id="filterDeviceType"><option value="all">Alle Gerätearten</option>${[['bagged','Mit Beutel'],['bagless','Ohne Beutel'],['cordless','Akku-Staubsauger'],['floor','Boden · Beutelsystem offen']].map(([v,label])=>`<option value="${v}" ${f.deviceType===v?'selected':''}>${label}</option>`).join('')}</select></label>
      <label><span>Beutelsystem</span><select id="filterBag"><option value="all">Alle</option>${bagSystems.map(b=>`<option value="${b}" ${f.bagSystem===b?'selected':''}>${b==='none'?'Kein Staubbeutel':b}</option>`).join('')}</select></label>
      <label><span>Gerätepreis / Budget</span><select id="filterBudget">${deviceBudgetBands.map(([value,label])=>`<option value="${value}" ${f.budget===value?'selected':''}>${esc(label)}</option>`).join('')}</select></label>
      <label><span>Teilezuordnung</span><select id="filterPartCoverage">${[['all','Alle Modelle'],['missing','Ohne erfasste Teile'],['available','Mit erfassten Teilen']].map(([v,l])=>`<option value="${v}" ${f.partCoverage===v?'selected':''}>${l}</option>`).join('')}</select></label><label><span>Sortieren</span><select id="filterSort"><option value="relevance" ${f.sort==='relevance'?'selected':''}>Katalogreihenfolge</option><option value="series" ${f.sort==='series'?'selected':''}>Modell A–Z</option><option value="parts" ${f.sort==='parts'?'selected':''}>meiste Teile</option><option value="price" ${f.sort==='price'?'selected':''}>Gerätepreis aufsteigend · bekannte Preise zuerst</option></select></label>
    </div><p class="small muted">Budget nach belegtem Gerätepreis, inkl. MwSt.; Versand zusätzlich prüfen. Gespeicherter Herstellerpreis, kein Live-Angebot. Modelle ohne Gerätepreis bleiben unter „Alle“ und „Gerätepreis noch offen“ sichtbar. Ersatzteilpreise bestimmen keine Budgetstufe.</p><div class="row filter-actions"><button class="btn btn-secondary btn-small" id="resetFilters">Filter zurücksetzen</button></div></section>
    <div class="section-head"><div class="section-title">${query?'Beste Treffer':'Gerätekatalog'}</div><span class="small muted">${query?`${matches.length} gefunden`:`${new Set(catalogList.map(p=>p.model)).size} Modelle · ${catalogList.length} Modelleinträge`}</span></div>
    <div id="results">${query?renderMatches(matches,query):catalogList.length?catalogList.slice(0,state.catalogLimit).map(productCard).join(''):'<div class="empty-state card"><h3>Keine passenden Modelle</h3><p class="muted">Für diese Filterkombination gibt es keinen Katalogeintrag. Setze die Filter zurück.</p></div>'}</div>
    ${!query&&catalogList.length>state.catalogLimit?`<button class="btn btn-secondary wide-btn" id="moreModels">40 weitere Modelle anzeigen · ${Math.min(state.catalogLimit,catalogList.length)} von ${catalogList.length}</button>`:''}
    <div class="demo-strip"><span class="demo-dot"></span><span><b>Katalog im Ausbau:</b> ${esc(catalogBrands.join(', '))} sind aktiv. Ein bestätigter Modellname ersetzt keine Teileprüfung. Weitere Marken und Bauteile werden in der Katalogabdeckung geführt; eine vollständige Deutschland-Verkaufsrangliste liegt noch nicht vor.</span></div>`;
  shell(content,'home');
  byId('searchForm')?.addEventListener('submit',e=>{e.preventDefault();const q=byId('query').value.trim();if(q) resolveScan(q);});
  const updateCatalogFilter=()=>{const brand=byId('filterBrand')?.value||'all',changed=brand!==state.catalogFilters.brand;state.catalogLimit=40;state.catalogFilters={brand,series:changed?'all':byId('filterSeries')?.value||'all',bagSystem:changed?'all':byId('filterBag')?.value||'all',deviceType:byId('filterDeviceType')?.value||'all',budget:byId('filterBudget')?.value||'all',partCoverage:byId('filterPartCoverage')?.value||'all',sort:byId('filterSort')?.value||'relevance'};home();};
  ['filterBrand','filterSeries','filterBag','filterDeviceType','filterBudget','filterPartCoverage','filterSort'].forEach(id=>byId(id)?.addEventListener('change',updateCatalogFilter));
  byId('resetFilters')?.addEventListener('click',()=>{state.catalogLimit=40;state.catalogFilters={brand:'all',series:'all',bagSystem:'all',deviceType:'all',budget:'all',partCoverage:'all',sort:'relevance'};home();});
  byId('scanHero')?.addEventListener('click',()=>navigate('scan'));
  byId('allParts')?.addEventListener('click',()=>navigate('parts'));
  byId('allPrices')?.addEventListener('click',()=>navigate('prices'));
  byId('repairHero')?.addEventListener('click',()=>navigate('workshop'));
  byId('rentalHero')?.addEventListener('click',()=>navigate('rentals'));
  byId('allMarketplaces')?.addEventListener('click',()=>navigate('marketplaces'));
  byId('recentHero')?.addEventListener('click',()=>navigate('recent'));
  byId('catalogCoverage')?.addEventListener('click',()=>navigate('coverage'));
  byId('moreModels')?.addEventListener('click',()=>{state.catalogLimit+=40;home(query);});
  document.querySelectorAll('[data-brand-catalog]').forEach(b=>b.addEventListener('click',()=>{state.catalogLimit=40;state.catalogFilters={brand:b.dataset.brandCatalog,series:'all',bagSystem:'all',deviceType:'all',budget:'all',partCoverage:'all',sort:'series'};home();byId('filterBrand')?.focus();}));
  byId('openScanFromEmpty')?.addEventListener('click',()=>navigate('scan'));
  document.querySelectorAll('[data-scenario]').forEach(el=>el.addEventListener('click',()=>resolveScan(el.dataset.scenario)));
  wireProductCards();
}

function coveragePage(){
 const rows=catalogCoverage(),progress=catalogTargetProgress(rows),target=catalogTarget.brands.length*catalogTarget.modelsPerBrand;
 shell(`<button class="btn btn-ghost" id="coverageBack">← Start</button><div class="eyebrow">Katalogstand · v${APP_VERSION}</div><h2>100 Modelle und 100 Teile je Marke</h2><p>Alle zehn Marken sind aktiv. Die beiden Ziele zählen wir getrennt: echte Modellreferenzen und katalogisierte Ersatzteile, Zubehörartikel und Verbrauchsmaterialien.</p>
 <section class="card"><h3>Was fehlt noch?</h3><p class="small muted">${esc(catalogTarget.note)} Weitere Artikel einer Marke füllen die Lücken einer anderen Marke nicht. Anleitungen und Komplettgeräte zählen separat. Eine Teilezuordnung bedeutet noch keine vollständige Teileliste.</p><div class="comparison-scroll" tabindex="0" role="region" aria-label="100er-Ziele nach Marke"><table class="comparison-table"><caption>${progress.reduce((n,r)=>n+r.slots,0)} von ${target} Modellplätzen · ${progress.filter(r=>!r.partsMissing).length} von 10 Marken mit mindestens 100 Teilen</caption><thead><tr><th>Marke</th><th>Modelle / 100</th><th>Modelle offen</th><th>Teile / 100</th><th>Teile offen</th><th>Modelle ohne Teile</th></tr></thead><tbody>${progress.map(r=>`<tr><th>${esc(r.brand)}</th><td>${r.models} / ${r.target}</td><td>${r.missing}</td><td>${r.parts} / ${r.partsTarget}</td><td>${r.partsMissing}</td><td>${r.withoutParts}</td></tr>`).join('')}</tbody></table></div></section>
 <div class="brand-catalog-grid">${rows.map(r=>`<article class="card"><h3>${esc(r.brand)}</h3><p class="small muted">${esc(r.note)}</p><p class="small">${r.parts-r.physicalParts} weitere Einträge: Dokumente, Komplettgeräte oder Einordnung offen. ${r.manuals} direkte Geräteanleitungen.</p><button class="btn btn-secondary" data-coverage-brand="${esc(r.brand)}">Alle Modelle ansehen</button>${r.recordsWithoutParts?`<button class="btn btn-secondary" data-coverage-missing="${esc(r.brand)}">${r.recordsWithoutParts} Modelle ohne Teile ansehen</button>`:''}</article>`).join('')}</div>
 <section class="card"><h3>Teile sofort erkennen</h3><p>Jede Teileart hat bei allen Marken dieselbe Farbe und ein eigenes Symbol. Düsen sind blau, Beutel gelb, Filter grün und Akkus violett. Zusätzlich kannst du nach Ersatzteil, Zubehör und Verbrauchsmaterial filtern.</p><button class="btn btn-primary" id="coverageParts">Teilekatalog öffnen →</button></section>
 <section class="card"><h3>Die nächsten Ergänzungen</h3><p>Fehlende Modellteile, zusätzliche Herstellerartikel und vollständige Geräteausführungen bleiben sichtbar. Drei vollständige deutsche Samsung-/WD-Gerätecodes besitzen belegte optionale Zubehörlisten. Bei Hoover sind HF202P 011 und HF201H 011 jetzt über ihre achtstelligen Produktcodes konkret zugeordnet; 22 Hoover-Modelle bleiben offen. Britische Artikelquellen und fremde Preisstände werden nicht als deutsches Angebot ausgegeben. Zubehörsets und Vorsatzgeräte werden bei Vorwerk nicht als zusätzliche Grundmodelle gezählt.</p></section>`,'home');
 byId('coverageBack').addEventListener('click',()=>navigate('home'));
 byId('coverageParts').addEventListener('click',()=>navigate('parts'));
 const showBrand=(brand,partCoverage)=>{state.catalogLimit=40;state.catalogFilters={brand,series:'all',bagSystem:'all',deviceType:'all',budget:'all',partCoverage,sort:'series'};navigate('home');};
 document.querySelectorAll('[data-coverage-brand]').forEach(b=>b.addEventListener('click',()=>showBrand(b.dataset.coverageBrand,'all')));
 document.querySelectorAll('[data-coverage-missing]').forEach(b=>b.addEventListener('click',()=>showBrand(b.dataset.coverageMissing,'missing')));
}

function categoryPage(id){
  const category = categories.find(x=>x.id===id);
  if(!category){notFound();return;}
  const list = products.filter(p=>p.category===id);
  shell(`<button class="btn btn-ghost" id="back">← Zurück</button><div class="eyebrow">Kategorie</div><h2>${category.icon} ${esc(category.name)}</h2><p class="muted">${list.length} Eintrag${list.length===1?'':'e'} · ${list.filter(p=>p.dataStatus==='manufacturer-verified').length} verifiziert</p>${list.map(productCard).join('')||'<div class="empty">Noch keine Produkte.</div>'}`,'home');
  byId('back')?.addEventListener('click',()=>navigate('home'));
  wireProductCards();
}

function fitmentLabel(confidence){
  if(confidence>=.95) return {label:'Sehr hohe Sicherheit', cls:'pill-ok', tone:'strong'};
  if(confidence>=.85) return {label:'Hohe Sicherheit', cls:'pill-info', tone:'good'};
  if(confidence>=.75) return {label:'Prüfung empfohlen', cls:'pill-warn', tone:'warn'};
  return {label:'Nicht ausreichend bestätigt', cls:'pill-bad', tone:'bad'};
}

function renderPart(part,catalog=false){
  const fit = partFitmentMeta(part);
  const quote=quoteForPart(part),time=installationTime(part);
  return `
    <article class="card part-card tap" data-part-type="${partType(part).id}" style="--part-color:${partType(part).color}" ${catalog?'data-catalog-part':'data-part'}="${part.id}" tabindex="0" role="button" aria-label="${esc(part.name)}: Details und Anleitungen öffnen">
      <div class="part-card-top">${partPhoto(part)}<div class="grow"><span class="pill ${fit.cls}">${fit.label}</span><h3>${esc(part.name)}</h3>${partLabels(part)}${partReferenceNote(part)}<div class="muted small">${part.tier==='oem'?'Original':'Nachbau'}</div><div class="small part-number">${esc(identifierLabel(part.identifiers?.[0]?.type,part.brand))} ${esc(part.identifiers?.[0]?.value)}</div></div><div class="chevron">›</div></div>
      <div class="part-meta"><span>${part.fitment.evidence.length} Quelle${part.fitment.evidence.length===1?'':'n'} · Details & Anleitung</span><strong>${esc(priceText(quote))}</strong></div>
      <div class="small muted part-commerce-line">${quote?`${esc(priceTaxLabel(quote))} · ${esc(quote.unitLabel)} · ${esc(quoteDate(quote))} · ${esc(priceAgeLabel(quote))}`:'Preisquelle fehlt'}</div>
      <div class="small part-commerce-line">${quote?.stock==='unavailable'?'Nicht bestellbar im erfassten Stand · ':''}⏱ ${esc(time.label)}${time.status==='estimate'?' · geschätzt':''}</div>
    </article>`;
}

function wirePartCards(productId,root=document){
  root.querySelectorAll('[data-part]').forEach(el=>{
    const open=()=>navigate('part',`${productId}:${el.dataset.part}`);
    el.addEventListener('click',open);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
  });
}

function renderModelPartGroups(parts,openMatches=false){
  if(!parts.length)return '<div class="empty">Für diese Auswahl kein belegter Nachbau bzw. kein Teil hinterlegt.</div>';
  return `<div class="model-part-group-toolbar"><p class="small muted">Kategorie aufklappen, um die Artikel zu sehen.</p><div class="row wrap"><button type="button" class="btn btn-secondary btn-small" data-model-parts-expand="true">Alle öffnen</button><button type="button" class="btn btn-ghost btn-small" data-model-parts-expand="false">Alle schließen</button></div></div>${groupPartsByType(parts).map(type=>`<details class="model-part-group" data-model-part-group="${type.id}" style="--part-color:${type.color}" ${openMatches||state.productPartGroups[type.id]?'open':''}><summary><span class="model-part-group-icon">${partTypeIcon(type)}</span><span class="model-part-group-title">${esc(type.label)}</span><span class="model-part-group-count">${type.parts.length} Artikel</span><svg class="model-part-group-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div class="model-part-group-content">${type.parts.map(part=>renderPart(part)).join('')}</div></details>`).join('')}`;
}

function wireModelPartGroups(productId){
  const root=byId('modelPartsResults');
  root.querySelectorAll('[data-model-part-group]').forEach(group=>group.addEventListener('toggle',()=>{
    if(root.isConnected&&root.contains(group)&&state.productPartsFilters.productId===productId)state.productPartGroups[group.dataset.modelPartGroup]=group.open;
  }));
  root.querySelectorAll('[data-model-parts-expand]').forEach(button=>button.addEventListener('click',()=>{
    root.querySelectorAll('[data-model-part-group]').forEach(group=>{
      group.open=button.dataset.modelPartsExpand==='true';
      state.productPartGroups[group.dataset.modelPartGroup]=group.open;
    });
  }));
  wirePartCards(productId,root);
}

function partsCatalogPage(productId='',priceView=false){
  const product=productId?products.find(p=>p.id===productId):null;
  if(productId&&!product){notFound();return;}
  const f=state.partsFilters;
  const sourceParts=product?product.parts:partsCatalog;
  const {categories,series}=partFilterOptions(sourceParts,products,product?'all':f.brand);
  if(f.category!=='all'&&!categories.includes(f.category))f.category='all';
  if(!product&&f.series!=='all'&&!series.includes(f.series))f.series='all';
  const list=sortCommerceParts(filterParts(sourceParts,{...f,brand:product?'all':f.brand,series:product?'all':f.series},products),f.sort,installationTime);
  shell(`<button class="btn btn-ghost" id="back">← ${product?esc(product.model):'Zur Startseite'}</button>
    <div class="eyebrow">${product?esc(product.brand):`${catalogBrands.length} Marken`} · ${product?esc(product.model):'Ersatzteile & Nachbauten'}</div><h2>${priceView?'Preislisten, Versand & Einbauzeit.':'Das passende Teil finden.'}</h2>
    <p class="muted">${product?`${sourceParts.length} zugeordnete Teile für dieses Gerät.`:`${partsCatalog.length} Originalartikel und Nachbauten mit Hersteller- und Anbieterquellen. Die konkrete Geräteausführung bleibt zu prüfen.`} Preise mit Abrufdatum; Bestellbarkeit und Lieferzeit stehen jeweils dabei.</p>
    ${renderBoschSupport(product)}
    ${renderBrandIdentity(product)}${product?.deviceQuote?`<section class="card"><h3>Gerätepreis & Budget</h3>${renderDeviceBudget(product)}<p class="small muted">Dieser Preis betrifft das vollständige Gerät. Für Ersatzteile gelten die jeweiligen Artikelpreise. Keine verbindliche Kaufempfehlung oder Verkaufsrangfolge.</p><a class="btn btn-secondary" href="${esc(safeExternalUrl(product.deviceQuote.productUrl||product.deviceQuote.sourceUrl))}" target="_blank" rel="noopener noreferrer">Gerätepreis beim Hersteller prüfen ↗</a></section>`:''}
    ${renderPartListCoverage(product)}
    <section class="card filter-card"><form id="partsSearch" class="searchbar"><input id="partsQuery" aria-label="Ersatzteil suchen" inputmode="search" placeholder="Teil, Material-Nr., Artikel-Nr. oder EAN …" value="${esc(f.query)}"><button class="btn btn-primary">Suchen</button></form>
    <div class="filter-grid">${product?'':`<label><span>Marke des Geräts</span><select id="partsBrand"><option value="all">Alle Marken</option>${catalogBrands.map(b=>`<option value="${b}" ${f.brand===b?'selected':''}>${b}</option>`).join('')}</select></label>`}<label><span>Original / Nachbau</span><select id="partsTier">${[['all','Alle Teile'],['oem','Originalteile'],['aftermarket','Nachbauten']].map(([v,l])=>`<option value="${v}" ${f.tier===v?'selected':''}>${l}</option>`).join('')}</select></label>
    ${purposeFilter('partsPurpose',f.purpose)}<label><span>Bauteil</span><select id="partsCategory"><option value="all">Alle Bauteile</option>${categories.map(c=>`<option value="${esc(c)}" ${f.category===c?'selected':''}>${esc(c)}</option>`).join('')}</select></label>
    ${product?'':`<label><span>Serie</span><select id="partsSeries"><option value="all">Alle Serien</option>${series.map(s=>`<option value="${esc(s)}" ${f.series===s?'selected':''}>${esc(s)}</option>`).join('')}</select></label>`}
    <label><span>Sortieren</span><select id="partsSort">${[['name','Name'],['price','Artikelpreis aufsteigend'],['total','Preis inkl. Versand aufsteigend'],['time','Einbauzeit aufsteigend']].map(([v,l])=>`<option value="${v}" ${f.sort===v?'selected':''}>${l}</option>`).join('')}</select></label></div>
    <button class="btn btn-secondary btn-small" id="partsReset">Filter zurücksetzen</button>${partTypeFilters(filterParts(sourceParts,{brand:product?'all':f.brand}),f,'parts')}</section>
    <div class="notice info"><b>Vor Auswahl:</b> Ein Teilekatalog bestätigt kein beliebiges Gerät. Öffne dein Modell für die Zuordnung und prüfe Ausführung, Altteilnummer und gegebenenfalls Seriennummer. Nachbauten sind nach Anbieterangabe zugeordnet.</div>
    <div class="row catalog-view-actions"><button class="btn ${priceView?'btn-secondary':'btn-primary'}" id="partsCards">Teilekarten</button><button class="btn ${priceView?'btn-primary':'btn-secondary'}" id="partsPrices">Preisliste</button><button class="btn btn-ghost" id="partsShipping">Versandübersicht</button><button class="btn btn-secondary" id="partsMarketplaces">Gebraucht · eBay & Amazon</button></div>
    ${priceView?`<div class="notice info"><b>Quellenstand, kein Live-Preis:</b> ${list.filter(part=>isAmount(quoteForPart(part)?.price)&&quoteFresh(quoteForPart(part))).length} von ${list.length} Teilen haben einen erfassten Preis mit Abruf unter 24 Stunden. Ältere und offene Angaben bleiben sichtbar; bestätigte Warenkorbsummen verwenden nur verfügbare, aktuelle Brutto-EUR-Preise.</div>`:''}
    <div class="section-head"><div class="section-title">${priceView?'Preisliste':'Teilekatalog'}</div><span class="small muted">${list.length} von ${sourceParts.length}</span></div>
    ${priceView?`<p class="small muted">Gesamtpreis für 1 Verkaufseinheit mit Standardversand nach DE. Der Warenkorb berücksichtigt die Freigrenze je Händler. Packungen können mehrere Teile enthalten; die Zeit gilt für einen Wechsel. Nettopreise, Fremdwährung, ältere oder nicht bestellbare Preise werden bei der Preissortierung hinten angezeigt.</p>${list.length?renderPriceTable(list,product):'<div class="card empty-state">Keine Teile für diese Filter gefunden.</div>'}`:`<div class="parts-catalog-grid">${list.map(p=>renderPart(p,!product)).join('')||'<article class="card empty-state"><h3>Keine Teile gefunden</h3><p class="muted">Andere Bezeichnung suchen oder Filter zurücksetzen.</p></article>'}</div>`}
    <p class="small muted">Abrufdatum steht an jeder Preisquelle. Preise sind Quellenstände und können sich ändern. Öffne ein Teil für den Shoplink, den Lieferumfang und die genaue Preisbasis. Einbauzeiten sind eigene Schätzungen; für interne Baugruppen bleibt der Aufwand offen.</p>
    <article class="card catalog-coverage"><b>Weitere Ersatzteile anhand deines Geräts prüfen</b><p class="small muted">Der öffentliche Katalog enthält nicht jede interne Baugruppe und Seriennummer-Ausführung. Motoren, Elektronik und nicht eindeutig zugeordnete Teile beim jeweiligen Hersteller anhand des Typenschilds prüfen.</p><a class="btn btn-secondary" href="${mieleSpareCatalogUrl}" target="_blank" rel="noopener noreferrer">Miele Original-Ersatzteile öffnen ↗</a><a class="btn btn-secondary" href="${boschSupportUrls.parts}" target="_blank" rel="noopener noreferrer">Bosch Ersatzteile mit E-Nr. prüfen ↗</a><a class="btn btn-secondary" href="${brandSupport.Dyson.parts}" target="_blank" rel="noopener noreferrer">Dyson Teile & Generation prüfen ↗</a><a class="btn btn-secondary" href="${brandSupport.AEG.parts}" target="_blank" rel="noopener noreferrer">AEG Teile mit PNC prüfen ↗</a><a class="btn btn-secondary" href="${brandSupport.Rowenta.parts}" target="_blank" rel="noopener noreferrer">Rowenta Teile mit Ref. Nr. prüfen ↗</a><a class="btn btn-secondary" href="${brandSupport.Philips.parts}" target="_blank" rel="noopener noreferrer">Philips Teile mit Modellnummer prüfen ↗</a><a class="btn btn-secondary" href="${brandSupport.Siemens.parts}" target="_blank" rel="noopener noreferrer">Siemens Teile mit E-Nr. prüfen ↗</a></article>`,'home');
  wireBoschSupport(product);
  wireBrandIdentity(product);
  byId('partsBrand')?.addEventListener('change',()=>{state.partsFilters.brand=byId('partsBrand').value;state.partsFilters.series='all';partsCatalogPage(productId,priceView);});
  byId('back')?.addEventListener('click',()=>navigate(product?'product':'home',product?.id||''));
  const update=()=>{state.partsFilters={brand:byId('partsBrand')?.value||'all',query:byId('partsQuery').value.trim(),tier:byId('partsTier').value,category:byId('partsCategory').value,purpose:byId('partsPurpose').value,series:byId('partsSeries')?.value||'all',sort:byId('partsSort').value};partsCatalogPage(productId,priceView);};
  wirePartTypeFilters('parts','partsCategory',update);
  byId('partsSearch')?.addEventListener('submit',e=>{e.preventDefault();update();});
  ['partsTier','partsCategory','partsPurpose','partsSeries','partsSort'].forEach(id=>byId(id)?.addEventListener('change',update));
  byId('partsReset')?.addEventListener('click',()=>{state.partsFilters={brand:'all',query:'',tier:'all',category:'all',purpose:'all',series:'all',sort:'name'};partsCatalogPage(productId,priceView);});
  byId('partsCards')?.addEventListener('click',()=>navigate(product?'product':'parts',product?.id||''));
  byId('partsPrices')?.addEventListener('click',()=>navigate('prices',product?.id||''));
  byId('partsShipping')?.addEventListener('click',()=>navigate('shipping'));
  byId('partsMarketplaces')?.addEventListener('click',()=>{state.marketplaceFilters={...state.marketplaceFilters,brand:f.brand,query:f.query,tier:f.tier,category:f.category,purpose:f.purpose,series:f.series};navigate('marketplaces',product?.id||'');});
  document.querySelectorAll('[data-price-part]').forEach(b=>b.addEventListener('click',()=>navigate(product?'part':'catalog-part',product?`${product.id}:${b.dataset.pricePart}`:b.dataset.pricePart)));
  if(product)wirePartCards(product.id);
  document.querySelectorAll('[data-catalog-part]').forEach(el=>{const open=()=>navigate('catalog-part',el.dataset.catalogPart);el.addEventListener('click',open);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});});
}

function catalogPartPage(id){
  const part=partsCatalog.find(p=>p.id===id);
  if(!part){notFound();return;}
  const models=products.filter(p=>part.modelIds.includes(p.id));
  const candidates=products.filter(p=>part.candidateModelIds.includes(p.id));
  const fit=partFitmentMeta(part);
  shell(`<button class="btn btn-ghost" id="back">← Teilekatalog</button><div class="eyebrow">${part.tier==='oem'?`${esc(part.brand||'Miele')} Originalteil`:'Nachbau · Anbieterangabe'}</div><h2>${esc(part.name)}</h2>
    ${renderManufacturerNotices(part)}<section class="card"><span class="pill ${fit.cls}">${fit.label}</span>${partLabels(part)}${partReferenceNote(part)}${partPhoto(part,true)}
    <div class="identifier-grid">${part.identifiers.map(i=>`<div class="identifier"><span>${esc(identifierLabel(i.type,part.brand))}</span><strong>${esc(i.value)}</strong></div>`).join('')}</div>
    ${part.replaces?.length?`<p class="small muted">Ersetzt laut Anbieter: ${esc(part.replaces.join(', '))}</p>`:''}
    ${part.features?.length?`<ul class="part-feature-list">${part.features.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`:''}
    ${(part.restrictions||[]).map(s=>`<p class="notice warn">${esc(s)}</p>`).join('')}
    ${part.sourceUrl?`<a class="btn btn-primary" href="${esc(safeExternalUrl(part.sourceUrl))}" target="_blank" rel="noopener noreferrer">${esc(partManufacturerLinkLabel(part))} öffnen ↗</a>`:''}</section>
    <div class="section-head"><div class="section-title">Zuordnung im Katalog</div><span class="small muted">${models.length} Einträge</span></div>
    <p class="small muted">${part.tier==='aftermarket'?'Die Kompatibilität stammt vom Nachbau-Anbieter.':'Die Zuordnung stammt aus den Hersteller-Produktlisten und Teilebeschreibungen; bei Bosch ist der E-Nr.-Index offen.'} Öffne dein konkretes Modell für Hinweise und die Geräteanleitung.</p>
    ${models.length?models.map(productCard).join(''):'<div class="notice warn">Für die vorhandenen Geräte keine eindeutige Zuordnung hinterlegt. Dieses Teil wird nicht als passend vorgeschlagen.</div>'}
    ${candidates.length?`<details class="card"><summary>Weitere ${candidates.length} Serien-Einträge · Ausführung prüfen</summary><p class="small muted">Diese Serie wird genannt, aber eine zusätzliche Einschränkung ist noch nicht aufgelöst.</p>${candidates.map(productCard).join('')}</details>`:''}
    ${part.sourceCoverage?.note?`<p class="small muted">${esc(part.sourceCoverage.note)}</p>`:''}
    ${renderPartCommerce(part)}
    ${renderPartMarketplaces(part)}
    ${renderPartInstructions(part)}
    <div class="section-head"><div class="section-title">Quellen</div></div>${part.fitment.evidence.map(e=>`<article class="source"><div><a href="${esc(safeExternalUrl(e.url))}" target="_blank" rel="noopener noreferrer"><b>${esc(e.name)}</b> ↗</a><p class="small muted">${esc(e.note)} · Stand ${esc(e.retrievedAt)}</p></div></article>`).join('')}`,'home');
  byId('back')?.addEventListener('click',()=>navigate('parts'));
  wireCommerce(part);
  wirePartMarketplaces(part);
  wireProductCards();
}

function productPage(id){
  const product=products.find(x=>x.id===id);
  if(!product){notFound();return;}
  addRecent(id);
  if(state.productPartsFilters.productId!==id){state.productPartsFilters={productId:id,query:'',tier:'all',category:'all',purpose:'all',sort:'name'};state.productPartGroups={};}
  const pf=state.productPartsFilters;
  const visibleParts=sortCommerceParts(filterParts(product.parts,pf),pf.sort,installationTime);
  const partCategories=[...new Set(product.parts.map(partCategory))].sort((a,b)=>a.localeCompare(b,'de'));
  const meta=getDeviceMeta(id);
  shell(`
    <div class="page-action-row"><button class="btn btn-ghost" id="back">← Zurück</button><button class="btn btn-ghost" id="shareProduct">↗ Teilen</button></div>
    <article class="product-hero card">
      <div class="product-head">${productImage(product,true)}<div class="grow"><div class="row-tight"><span class="pill ${dataStatusMeta(product).cls}">${dataStatusMeta(product).label}</span><span class="pill pill-info">${product.parts.filter(p=>p.tier==='oem').length} Original · ${product.parts.filter(p=>p.tier==='aftermarket').length} Nachbau</span>${meta.nickname?`<span class="pill pill-saved">${esc(meta.nickname)}</span>`:''}</div><h2>${esc(product.brand)} ${esc(product.model)}</h2><div class="muted">${esc(product.type)}</div></div></div>
      <p class="small muted">${product.imageUrl?`Produktfoto: ${esc(product.brand)} · ${product.identityScope==='model-reference'?'Modellreferenz, Geräteausführung prüfen':'Gerätevariante'}`:product.brand==='Vorwerk'?'Illustration · Modellreferenz':'Illustration · Familienzuordnung'}</p>
      <div class="divider"></div>
      <div class="identifier-grid">${product.identifiers.map(i=>`<button class="identifier identifier-button" data-copy-id="${esc(i.value)}" title="Kennung kopieren"><span>${esc(identifierLabel(i.type,product.brand))}</span><strong>${esc(i.value)}</strong><em>Kopieren</em></button>`).join('')}</div>
      <div class="row product-actions"><button class="btn btn-primary" id="save">${isSaved(id)?'★ Gespeichert':'☆ Gerät speichern'}</button><button class="btn btn-secondary" id="passport">Gerätepass</button><button class="btn btn-secondary" id="report">Datenproblem melden</button></div>
    </article>

    <section class="card"><h3>Reparatur oder Mietgerät?</h3><p class="small muted">Hersteller-Service für dieses Gerät oder ein Mietgerät für eine einzelne Reinigungsaufgabe finden.</p><div class="row wrap"><button class="btn btn-secondary" id="deviceRepair">Reparieren lassen</button><button class="btn btn-secondary" id="deviceRental">Gerät mieten</button></div></section>
    ${renderBoschSupport(product)}
    ${renderBrandIdentity(product)}${product?.deviceQuote?`<section class="card"><h3>Gerätepreis & Budget</h3>${renderDeviceBudget(product)}<p class="small muted">Dieser Preis betrifft das vollständige Gerät. Für Ersatzteile gelten die jeweiligen Artikelpreise. Keine verbindliche Kaufempfehlung oder Verkaufsrangfolge.</p><a class="btn btn-secondary" href="${esc(safeExternalUrl(product.deviceQuote.productUrl||product.deviceQuote.sourceUrl))}" target="_blank" rel="noopener noreferrer">Gerätepreis beim Hersteller prüfen ↗</a></section>`:''}
    ${(product.facts||[]).length?`<div class="section-head"><div class="section-title">Herstellerdaten</div><span class="small muted">Quelle verlinkt</span></div><article class="card"><div class="identifier-grid">${product.facts.map(f=>`<div class="identifier"><span>${esc(f.label)}</span><strong>${esc(f.value)}</strong></div>`).join('')}</div></article>`:''}
    ${(product.manuals||[]).length?`<div class="section-head"><div class="section-title">Anleitungen & Support</div><span class="small muted">offizielle Links</span></div><div class="link-grid">${product.manuals.map(m=>{const url=safeExternalUrl(m.url||m);const label=m.label||'Anleitung / Support';return url?`<a class="card quick-link tap" href="${esc(url)}" target="_blank" rel="noopener noreferrer"><span>📘</span><div><b>${esc(label)}</b><small>Herstellerquelle öffnen ↗</small></div></a>`:''}).join('')}</div>`:''}
    ${product.category==='car'?`<div class="section-head"><div class="section-title">Fahrzeug genauer identifizieren</div><span class="small muted">VIN / HSN-TSN</span></div><button class="card quick-link tap" id="vehicleIdentity"><span>🚘</span><div class="grow"><b>VIN/FIN oder KBA-Daten hinterlegen</b><small>Format prüfen und Fahrzeugkontext lokal speichern. Exakte Auflösung braucht später eine lizenzierte Datenquelle.</small></div><span class="chevron">›</span></button>`:''}
    ${(product.sources||[]).length?`<div class="section-head"><div class="section-title">Datenquellen</div><span class="small muted">${product.sources.length} Originalquelle${product.sources.length===1?'':'n'}</span></div><div class="evidence-list">${product.sources.map((e,index)=>{const url=safeExternalUrl(e.url);return `<article class="source"><div class="source-index">${index+1}</div><div class="grow"><div class="row-tight">${url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer"><b>${esc(e.name)}</b></a>`:`<b>${esc(e.name)}</b>`}<span class="pill grade-${String(e.grade||'A').toLowerCase()}">${esc(e.grade||'A')} · ${esc(evidenceGradeLabel(e.grade))}</span></div><div class="small muted">Stand ${esc(e.retrievedAt)}</div>${e.note?`<div class="small source-note">${esc(e.note)}</div>`:''}</div></article>`}).join('')}</div>`:''}

    ${(product.issues||[]).length?`<div class="section-head"><div class="section-title">Problem lösen</div><span class="small muted">${product.dataStatus==='manufacturer-verified'?'regelbasiert':'geführte Demo'}</span></div>
      <div class="issue-grid">${product.issues.map(issue=>`<button class="card issue-card tap" data-issue="${issue.id}"><span class="issue-icon">◇</span><span class="grow"><strong>${esc(issue.label)}</strong><small>${esc(issue.summary)}</small></span><span class="chevron">›</span></button>`).join('')}</div>`:''}

    ${(product.jobs||[]).length?`<div class="section-head"><div class="section-title">Arbeit erledigen</div><span class="small muted">Job-Kits</span></div>
      <div class="job-grid">${product.jobs.map(job=>{const defaults=getJobSelection(product.id,job.id,jobDefaults(job));const completeness=jobCompleteness(job,defaults);return `<button class="card job-card tap" data-job="${job.id}"><span class="job-icon">✓</span><span class="grow"><span class="pill ${job.dataStatus==='guidance'?'pill-info':completeness===100?'pill-ok':'pill-warn'}">${job.dataStatus==='guidance'?'Pflegehilfe':`${completeness}% komplett`}</span><strong>${esc(job.label)}</strong><small>${esc(job.summary)}</small></span><span class="chevron">›</span></button>`;}).join('')}</div>`:''}

    ${(product.stockPlans||[]).length?`<div class="section-head"><div class="section-title">Smart Stock</div><span class="small muted">Verbrauch & Nachkauf</span></div>
      <div class="stock-grid">${product.stockPlans.map(plan=>{const values=getInventoryPlan(product.id,plan);const advice=stockAdvice(plan,values);return `<button class="card stock-card tap" data-stock="${plan.id}"><span class="stock-status stock-${advice.urgency}">${advice.shouldOrder?'!':'✓'}</span><span class="grow"><strong>${esc(plan.label)}</strong><small>${values.stock} ${esc(plan.unit)} · ca. ${advice.remainingDays} Tage Reichweite</small><small>${advice.shouldOrder?'Nachbestellung empfohlen':'Puffer ausreichend'}</small></span><span class="chevron">›</span></button>`;}).join('')}</div>`:''}

    <div class="section-head"><div class="section-title">Originalteile & Nachbauten</div><span class="small muted" id="modelPartsCount" role="status">${visibleParts.length} von ${product.parts.length}</span></div>
    ${renderPartListCoverage(product)}
    <button class="btn btn-secondary wide-btn" id="modelPrices">Preisliste, Versand & Einbauzeiten für dieses Gerät →</button>
    <button class="btn btn-secondary wide-btn" id="modelMarketplaces">Gebrauchte Teile · eBay & Amazon für dieses Gerät →</button>
    <section class="card filter-card"><label class="field-label" for="modelPartsQuery">Teile dieses Geräts durchsuchen</label><input class="text-input" id="modelPartsQuery" placeholder="z. B. Filter, Schlauch oder Material-Nr." value="${esc(pf.query)}">
    <div class="filter-grid"><label><span>Original / Nachbau</span><select id="modelPartsTier">${[['all','Alle Teile'],['oem','Originalteile'],['aftermarket','Nachbauten']].map(([v,l])=>`<option value="${v}" ${pf.tier===v?'selected':''}>${l}</option>`).join('')}</select></label>${purposeFilter('modelPartsPurpose',pf.purpose)}<label><span>Bauteil</span><select id="modelPartsCategory"><option value="all">Alle Bauteile</option>${partCategories.map(c=>`<option value="${esc(c)}" ${pf.category===c?'selected':''}>${esc(c)}</option>`).join('')}</select></label><label><span>Sortieren</span><select id="modelPartsSort">${[['name','Name A–Z'],['name-desc','Name Z–A'],['recorded-price','Preis aufsteigend'],['recorded-price-desc','Preis absteigend'],['time','Einbauzeit aufsteigend']].map(([v,l])=>`<option value="${v}" ${pf.sort===v?'selected':''}>${l}</option>`).join('')}</select></label></div><p class="small muted">Sortierung innerhalb jeder Kategorie · erfasste Artikelpreise ohne Versand · ohne vergleichbaren Preis zuletzt.</p><button type="button" class="btn btn-secondary btn-small" id="modelPartsReset">Filter zurücksetzen</button></section>
    <p class="small muted">${product.catalogPack?'Originalartikel aus dem Herstellerverzeichnis. Die gelistete Kennung, Anschlüsse und Ausführung am eigenen Gerät prüfen.':product.brand==='Bosch'?'Original-Zubehör aus der Bosch-Modellliste. E-Nr.-Index und Eignung beim Hersteller prüfen; die konkrete Ausführung ist noch nicht bestätigt.':'Original-Zubehör aus Miele-Listen; Ersatzteile aus Miele-Serienangaben.'} Nachbauten nach Anbieterangabe. Kennung und Ausführung vor Auswahl vergleichen.</p>
    <div id="modelPartsResults">${renderModelPartGroups(visibleParts)}</div>
    ${(product.candidateParts||[]).length?`<details class="card variant-parts"><summary>Weitere Serienteile · ${product.candidateParts.length} Ausführungen prüfen</summary><p class="small muted">Die Serie steht in der Quelle, aber z. B. Elektroanschluss, Filterhalter oder Bodendüse müssen zusätzlich geprüft werden. Diese Teile sind nicht als passend bestätigt.</p>${product.candidateParts.map(p=>renderPart(p)).join('')}</details>`:''}
    <a class="btn btn-secondary wide-btn" href="${esc(safeExternalUrl(product.spareFinderUrl||(product.brand==='Bosch'?boschSupportUrls.parts:mieleSpareCatalogUrl)))}" target="_blank" rel="noopener noreferrer">Weitere Originalteile bei ${esc(product.brand)} anhand Typenschild prüfen ↗</a>
    <article class="principle-card"><div class="principle-icon">✓</div><div><b>Fitment-Regel</b><div class="small muted">KI darf Kandidaten vorschlagen, aber niemals allein Kompatibilität bestätigen.</div></div></article>`,'home');

  byId('back')?.addEventListener('click',()=>history.length>1?history.back():navigate('home'));
  byId('shareProduct')?.addEventListener('click',()=>shareCurrent({title:`${product.brand} ${product.model}`,text:`Universal Fitment Demo: ${product.brand} ${product.model}`}));
  byId('save')?.addEventListener('click',()=>{
    const saved=toggleSaved(id); byId('save').textContent=saved?'★ Gespeichert':'☆ Gerät speichern';
    toast(saved?'Gerät gespeichert.':'Gerät entfernt.', saved?'success':'default');
  });
  wireBoschSupport(product);
  wireBrandIdentity(product);
  byId('passport')?.addEventListener('click',()=>navigate('passport',id));
  byId('report')?.addEventListener('click',()=>reportDialog(product));
  byId('vehicleIdentity')?.addEventListener('click',()=>vehicleIdentityDialog(product));
  document.querySelectorAll('[data-copy-id]').forEach(button=>button.addEventListener('click',async()=>{
    const ok=await copyText(button.dataset.copyId); toast(ok?'Kennung kopiert.':'Kopieren nicht möglich.',ok?'success':'error');
  }));
  document.querySelectorAll('[data-issue]').forEach(el=>el.addEventListener('click',()=>navigate('issue',`${id}:${el.dataset.issue}`)));
  document.querySelectorAll('[data-job]').forEach(el=>el.addEventListener('click',()=>navigate('job',`${id}:${el.dataset.job}`)));
  document.querySelectorAll('[data-stock]').forEach(el=>el.addEventListener('click',()=>navigate('stock',`${id}:${el.dataset.stock}`)));
  document.querySelectorAll('.variant-parts').forEach(root=>wirePartCards(id,root));
  byId('deviceRepair')?.addEventListener('click',()=>navigate('workshop',id));
  byId('deviceRental')?.addEventListener('click',()=>navigate('rentals',id));
  byId('modelPrices')?.addEventListener('click',()=>{state.partsFilters={...state.productPartsFilters,series:'all',sort:'name'};navigate('prices',id);});
  byId('modelMarketplaces')?.addEventListener('click',()=>{state.marketplaceFilters={...state.marketplaceFilters,query:state.productPartsFilters.query,tier:state.productPartsFilters.tier,category:state.productPartsFilters.category,purpose:state.productPartsFilters.purpose,series:'all'};navigate('marketplaces',id);});
  const updateParts=()=>{
    const root=byId('modelPartsResults');
    root.querySelectorAll('[data-model-part-group]').forEach(group=>{state.productPartGroups[group.dataset.modelPartGroup]=group.open;});
    const next={productId:id,query:byId('modelPartsQuery').value.trim(),tier:byId('modelPartsTier').value,category:byId('modelPartsCategory').value,purpose:byId('modelPartsPurpose').value,sort:byId('modelPartsSort').value};
    const filterChanged=['query','tier','category','purpose'].some(key=>next[key]!==state.productPartsFilters[key]);
    const openMatches=filterChanged&&(next.query||[next.tier,next.category,next.purpose].some(value=>value!=='all'));
    state.productPartsFilters=next;
    const list=sortCommerceParts(filterParts(product.parts,next),next.sort,installationTime);
    root.innerHTML=renderModelPartGroups(list,openMatches);
    byId('modelPartsCount').textContent=`${list.length} von ${product.parts.length}`;
    wireModelPartGroups(id);
  };
  wireModelPartGroups(id);
  byId('modelPartsReset')?.addEventListener('click',()=>{
    byId('modelPartsQuery').value='';
    ['modelPartsTier','modelPartsCategory','modelPartsPurpose'].forEach(key=>{byId(key).value='all';});
    byId('modelPartsSort').value='name';
    updateParts();
  });
  byId('modelPartsQuery')?.addEventListener('input',updateParts);
  ['modelPartsTier','modelPartsCategory','modelPartsPurpose','modelPartsSort'].forEach(id=>byId(id)?.addEventListener('change',updateParts));
}

function evidenceTypeLabel(type){
  const map={'manufacturer':'Gerätehersteller','aftermarket-manufacturer':'Nachbau-Hersteller','seller':'Händlerangabe','manufacturer-demo':'Hersteller · Demo','catalog':'Katalog','catalog-demo':'Katalog · Demo','model-match-demo':'Modellabgleich · Demo','prototype-fixture':'Prototyp'};
  return map[type] || type;
}

function passportPage(id){
  const product=products.find(x=>x.id===id);
  if(!product){notFound();return;}
  const meta=getDeviceMeta(id);
  const saved=isSaved(id);
  shell(`
    <button class="btn btn-ghost" id="back">← ${esc(product.brand)} ${esc(product.model)}</button>
    <div class="eyebrow">Digitaler Gerätepass</div><h2>${product.icon} ${esc(meta.nickname||`${product.brand} ${product.model}`)}</h2>
    <p class="muted">Eigene Gerätedaten bleiben in dieser Demo ausschließlich lokal auf diesem Browser.</p>
    <article class="card passport-card">
      <div class="passport-head"><div><span class="pill ${saved?'pill-ok':'pill-warn'}">${saved?'lokal gespeichert':'noch nicht gespeichert'}</span><h3>${esc(product.brand)} ${esc(product.model)}</h3><div class="small muted">${esc(product.type)}</div></div><div class="passport-mark">UF</div></div>
      <div class="divider"></div>
      <label class="field-label" for="passportNickname">Eigener Name</label>
      <input class="text-input" id="passportNickname" maxlength="60" placeholder="z. B. Staubsauger im Flur" value="${esc(meta.nickname||'')}">
      <label class="field-label" for="passportSerial">Seriennummer / eigene Kennung</label>
      <input class="text-input" id="passportSerial" maxlength="80" placeholder="Optional" value="${esc(meta.serial||'')}">
      <label class="field-label" for="passportNotes">Notizen</label>
      <textarea id="passportNotes" class="textarea" rows="4" maxlength="600" placeholder="z. B. Kaufdatum, letzter Filterwechsel …">${esc(meta.notes||'')}</textarea>
      <div class="row passport-actions"><button class="btn btn-primary" id="savePassport">Gerätepass speichern</button><button class="btn btn-secondary" id="sharePassport">Teilen</button></div>
    </article>
    <div class="section-head"><div class="section-title">Verifizierbare Kennungen</div><span class="small muted">Herstellerdaten</span></div>
    <div class="identifier-grid">${product.identifiers.map(i=>`<div class="identifier"><span>${esc(identifierLabel(i.type,product.brand))}</span><strong>${esc(i.value)}</strong></div>`).join('')}</div>
    <div class="notice info"><b>Produktionsidee:</b> Hier können später Handbücher, Wartungshistorie, passende Verbrauchsteile, Rückrufe und Belege gebündelt werden.</div>`,'saved');
  byId('back')?.addEventListener('click',()=>navigate('product',id));
  byId('savePassport')?.addEventListener('click',()=>{
    if(!isSaved(id)) toggleSaved(id);
    setDeviceMeta(id,{nickname:byId('passportNickname')?.value.trim()||'',serial:byId('passportSerial')?.value.trim()||'',notes:byId('passportNotes')?.value.trim()||''});
    toast('Gerätepass lokal gespeichert.','success');
    setTimeout(()=>passportPage(id),120);
  });
  byId('sharePassport')?.addEventListener('click',()=>shareCurrent({title:`Gerätepass: ${product.brand} ${product.model}`,text:`Universal Fitment Gerätepass für ${product.brand} ${product.model}`}));
}

function issuePage(arg){
  const [productId,issueId]=String(arg||'').split(':');
  const product=products.find(x=>x.id===productId);
  const issue=product?.issues?.find(x=>x.id===issueId);
  if(!product||!issue){notFound();return;}
  const linked=(issue.linkedPartIds||[]).map(id=>product.parts.find(p=>p.id===id)).filter(Boolean);
  shell(`
    <button class="btn btn-ghost" id="back">← ${esc(product.brand)} ${esc(product.model)}</button>
    <div class="eyebrow">Geführter Problemlöser · Demo</div><h2>${esc(issue.label)}</h2>
    <section class="card diagnosis-card">
      <div class="diagnosis-score"><strong>${Math.round(issue.confidence*100)}%</strong><span>Hinweis-Sicherheit</span></div>
      <div class="grow"><span class="pill pill-info">Regelbasiert</span><h3>${esc(issue.summary)}</h3><div class="small muted">Kein KI-Raten: Diese Demo verwendet einen fest hinterlegten Prüfpfad.</div></div>
    </section>
    <div class="section-head"><div class="section-title">Erst prüfen</div><span class="small muted">${issue.steps.length} Schritte</span></div>
    <ol class="checklist">${issue.steps.map((step,index)=>`<li><span>${index+1}</span><div>${esc(step)}</div></li>`).join('')}</ol>
    ${product.category==='car'?'<div class="notice info"><b>Fahrzeug-Hinweis:</b> Der Prototyp zeigt nur einfache Service-/Prüfschritte. Sicherheitsrelevante Reparaturen werden nicht diagnostisch freigegeben.</div>':''}
    ${linked.length?`<div class="section-head"><div class="section-title">Möglicherweise relevant</div><span class="small muted">erst nach Prüfung</span></div>${linked.map(p=>renderPart(p)).join('')}`:''}
    <div class="demo-strip"><span class="demo-dot"></span><span>Dieser Problemlöser ist Demodaten-basiert und ersetzt keine Herstellerdiagnose.</span></div>`,'home');
  byId('back')?.addEventListener('click',()=>navigate('product',productId));
  document.querySelectorAll('[data-part]').forEach(el=>{
    const open=()=>navigate('part',`${productId}:${el.dataset.part}`);
    el.addEventListener('click',open); el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
  });
}

function partPage(arg){
  const [productId,partId]=String(arg||'').split(':');
  const product=products.find(x=>x.id===productId);
  const part=product?.parts.find(x=>x.id===partId)||product?.candidateParts?.find(x=>x.id===partId);
  if(!product||!part){notFound();return;}
  const fit=partFitmentMeta(part);
  const material=part.identifiers.find(i=>i.type==='material-number')?.value;
  const partSourceUrl=safeExternalUrl(part.sourceUrl||part.fitment.evidence.find(e=>e.url?.includes(`/product/${material}/`))?.url||part.fitment.evidence.at(-1)?.url);
  const alternatives=product.parts.filter(p=>p.id!==part.id&&p.tier!==part.tier&&partCategory(p)===partCategory(part));
  const ranked=rankOffers(part.offers,state.offerMode);
  const maxTotal=Math.max(...ranked.map(o=>o.total));
  const top=ranked[0];
  const topBreakdown=top?recommendationBreakdown(top,part.offers):null;
  const offers=ranked.map((offer,index)=>{
    const cheapest=Math.min(...ranked.map(o=>o.total));
    const badges=[];
    if(index===0&&state.offerMode==='recommended') badges.push('<span class="pill pill-ok">Empfehlung</span>');
    if(offer.total===cheapest&&ranked.length>1) badges.push('<span class="pill pill-info">Bester Preis</span>');
    if(offer.sponsored) badges.push('<span class="pill pill-warn">Anzeige</span>');
    const saving=maxTotal>offer.total?maxTotal-offer.total:0;
    return `
    <article class="offer ${index===0&&state.offerMode==='recommended'?'best':''}">
      <div class="offer-main"><div class="row-tight"><b>${esc(offer.merchant)}</b>${badges.join('')}</div>
      <div class="small muted">★ ${offer.rating} (${offer.reviewCount}) · Qualität ${offer.qualityScore}/10 · Score ${offer.recommendation}/100</div>
      <div class="small muted">${offer.deliveryDays?`ca. ${offer.deliveryDays} Tag${offer.deliveryDays===1?'':'e'} · `:''}${offer.stock==='in-stock'?'auf Lager · ':''}Demo-Angebot</div>
      ${saving>=5?`<div class="small offer-saving">${money(saving)} unter teuerstem Demo-Angebot</div>`:''}</div>
      <div class="price">${money(offer.total)}<div class="small muted">inkl. ${money(offer.shipping)} Versand</div></div>
    </article>`;
  }).join('');

  shell(`
    <div class="page-action-row"><button class="btn btn-ghost" id="back">← ${esc(product.brand)} ${esc(product.model)}</button><button class="btn btn-ghost" id="sharePart">↗ Teilen</button></div>
    <div class="eyebrow">Teil & Kompatibilität</div><h2>${esc(part.name)}</h2>
    <section class="fitment-card card fitment-${fit.tone}">
      ${partPhoto(part)}
      <div class="grow"><span class="pill ${fit.cls}">${fit.label}</span><h3>${part.tier==='oem'?'Originalteil':'Nachbau'}</h3>${partLabels(part)}${partReferenceNote(part)}<div class="muted small">${part.fitment.evidence.length} Quelle${part.fitment.evidence.length===1?'':'n'}</div></div>
    </section>
    ${part.fitment.condition?`<div class="notice ${part.fitment.status==='variant_check_required'?'warn':'info'}">${esc(part.fitment.condition)}</div>`:''}
    <div class="identifier-grid">${part.identifiers.map(i=>`<div class="identifier"><span>${esc(identifierLabel(i.type,part.brand))}</span><strong>${esc(i.value)}</strong></div>`).join('')}</div>
    ${renderBoschSupport(product,part)}
    ${renderBrandIdentity(product,part)}
    ${part.availabilityNote?`<p class="notice compact">${esc(part.availabilityNote)}</p>`:''}
    ${part.replaces?.length?`<p class="small muted">Ersetzt laut Anbieter: ${esc(part.replaces.join(', '))}</p>`:''}
    ${part.features?.length?`<ul class="part-feature-list">${part.features.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`:''}
    ${partSourceUrl?`<a class="btn btn-secondary wide-btn" href="${esc(partSourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(partManufacturerLinkLabel(part))} öffnen ↗</a>`:''}
    ${part.sourceCoverage?.note?`<p class="small muted">${esc(part.sourceCoverage.note)}</p>`:''}
    ${renderPartCommerce(part,product)}
    ${renderPartMarketplaces(part,product)}
    ${renderPartInstructions(part,product)}
    ${cartQuoteItem(part,product)?'':`<div class="row"><button class="btn btn-secondary" id="addPartToCart">🛒 Teil vormerken</button><span class="small muted">Als Teilenotiz ohne bestätigten Bestellpreis.</span></div>`}

    <div class="section-head"><div class="section-title">Quellen zur Zuordnung</div><span class="small muted">${part.tier==='aftermarket'?'Anbieterangabe':esc(product.brand)}</span></div>
    <div class="evidence-list">${part.fitment.evidence.map((e,index)=>{const url=safeExternalUrl(e.url);return `<article class="source"><div class="source-index">${index+1}</div><div class="grow"><div class="row-tight">${url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer"><b>${esc(e.name)}</b></a>`:`<b>${esc(e.name)}</b>`}<span class="pill pill-neutral">${esc(evidenceTypeLabel(e.type))}</span><span class="pill grade-${String(e.grade||'B').toLowerCase()}">${esc(e.grade||'B')} · ${esc(evidenceGradeLabel(e.grade))}</span></div><div class="small muted">Stand ${esc(e.retrievedAt)} · ${esc(e.license)}</div>${e.note?`<div class="small source-note">${esc(e.note)}</div>`:''}</div></article>`}).join('')}</div>

    ${(product.jobs||[]).filter(job=>job.mainPartId===part.id||(job.items||[]).some(item=>item.partId===part.id)).length?`<div class="section-head"><div class="section-title">Was gehört zur Arbeit?</div><span class="small muted">Job-Kit</span></div>${(product.jobs||[]).filter(job=>job.mainPartId===part.id||(job.items||[]).some(item=>item.partId===part.id)).map(job=>`<button class="card job-link-card tap" data-linked-job="${job.id}"><div><span class="pill pill-info">Zeit sparen</span><h3>${esc(job.label)}</h3><div class="small muted">Prüft Hauptteil, Anbauteile, Einmalteile und Verbrauchsmaterial gemeinsam.</div></div><span class="chevron">›</span></button>`).join('')}`:''}

    ${ranked.length?'<div class="section-head"><div class="section-title">Angebote</div><button class="text-button" id="rankingInfo">Wie wird gerankt?</button></div>':''}
    ${ranked.length?`<div class="segment" id="rankMode">${[['recommended','Empfohlen'],['cheapest','Günstig'],['quality','Qualität'],['value','Preis/Leistung'],['fastest','Schnellste']].map(([value,label])=>`<button data-mode="${value}" class="${state.offerMode===value?'active':''}">${label}</button>`).join('')}</div>`:''}
    ${state.offerMode==='recommended'&&topBreakdown?`<article class="recommendation-card card"><div class="recommendation-head"><div><div class="eyebrow">Warum Platz 1?</div><h3>${esc(top.merchant)}</h3></div><div class="score-bubble">${topBreakdown.total}</div></div><div class="score-bars">${[
      ['Kompatibilität',topBreakdown.weighted.compatibility,35],['Qualität',topBreakdown.weighted.quality,20],['Reviews',topBreakdown.weighted.reviews,15],['Händler',topBreakdown.weighted.seller,10],['Rückgabe',topBreakdown.weighted.returns,10],['Preis/Leistung',topBreakdown.weighted.value,10]
    ].map(([label,value,max])=>`<div class="score-row"><span>${label}</span><div class="score-track"><i style="width:${Math.max(0,Math.min(100,(value/max)*100))}%"></i></div><b>${value.toFixed(1)}</b></div>`).join('')}</div></article>`:''}
    ${offers?`<div class="offer-list">${offers}</div>`:''}
    ${alternatives.length?`<div class="section-head"><div class="section-title">${part.tier==='oem'?'Nachbauten':'Originalteile'} in dieser Bauteilgruppe</div></div><p class="small muted">Weitere Optionen für dieses Gerät. Lieferumfang und Originalnummern im jeweiligen Nachweis vergleichen.</p>${alternatives.map(p=>renderPart(p)).join('')}`:''}
    ${ranked.length?'<div class="demo-strip"><span class="demo-dot"></span><span>Diese Händler-, Preis- und Bewertungsdaten sind weiterhin Demodaten.</span></div>':''}`,'home');

  byId('back')?.addEventListener('click',()=>navigate('product',productId));
  wireBoschSupport(product,part);
  wireBrandIdentity(product);
  byId('sharePart')?.addEventListener('click',()=>shareCurrent({title:`${part.name} · ${product.brand} ${product.model}`,text:`Universal Fitment Demo: ${part.name} für ${product.brand} ${product.model}`}));
  byId('addPartToCart')?.addEventListener('click',()=>{addCartItem({productId,partId:part.id,partKey:partIdentity(part),label:part.name,productLabel:`${product.brand} ${product.model}`,fitment:part.fitment.confidence,fitmentStatus:part.fitment.status,sourceUrl:partSourceUrl||null,merchant:null,price:null,shipping:null});toast('Teil im Universal-Warenkorb vorgemerkt.','success');partPage(arg);});
  wireCommerce(part,product);
  wirePartMarketplaces(part,product);
  document.querySelectorAll('[data-linked-job]').forEach(button=>button.addEventListener('click',()=>navigate('job',`${productId}:${button.dataset.linkedJob}`)));
  wirePartCards(productId);
  document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{state.offerMode=button.dataset.mode;partPage(arg);}));
  byId('rankingInfo')?.addEventListener('click',()=>showModal({
    title:'Transparentes Ranking', confirmLabel:'Verstanden', cancelLabel:'Schließen',
    body:`<div class="ranking-grid"><span>Kompatibilität</span><b>35%</b><span>Produktqualität</span><b>20%</b><span>Review-Vertrauen</span><b>15%</b><span>Händlerqualität</span><b>10%</b><span>Rückgabe/Garantie</span><b>10%</b><span>Preis-Leistung</span><b>10%</b></div><div class="notice info">Gesponserte Angebote dürfen den Empfehlungs-Score nicht heimlich verändern. „Schnellste“ sortiert ausschließlich nach der angegebenen Lieferzeit.</div>`,
    onConfirm:close=>{close();}
  }));
}


function jobPage(arg){
  const [productId,jobId]=String(arg||'').split(':');
  const product=products.find(x=>x.id===productId);
  const job=product?.jobs?.find(x=>x.id===jobId);
  if(!product||!job){notFound();return;}
  if(job.dataStatus==='guidance'){
    const manual=product.manuals?.find(m=>m.label==='Gebrauchsanweisung');
    shell(`<button class="btn btn-ghost" id="back">← ${esc(product.brand)} ${esc(product.model)}</button><div class="eyebrow">Pflege nach Geräteanleitung</div><h2>${esc(job.label)}</h2><p class="muted">${esc(job.summary)}</p>
      <section class="card"><p>${esc(job.evidenceNote)}</p>${manual?`<a class="btn btn-primary" href="${esc(safeExternalUrl(manual.url))}" target="_blank" rel="noopener noreferrer">${esc(product.brand)} Geräteanleitung · Wartung und Reinigung ↗</a>`:'<p class="muted">Geräteanleitung anhand der vollständigen Kennung beim Hersteller suchen.</p>'}</section>
      ${product.issues?.[0]?.steps?.length?`<ol class="checklist">${product.issues[0].steps.map((step,i)=>`<li><span>${i+1}</span><div>${esc(step)}</div></li>`).join('')}</ol>`:''}
      <button class="btn btn-secondary" id="guidanceRepair">Reparieren lassen</button><p class="small muted">Welche Filter gereinigt, gewaschen oder gewechselt werden dürfen, steht in der Geräteanleitung. Trocknungszeit und konkrete Ausführung prüfen.</p>`,'home');
    byId('back').addEventListener('click',()=>navigate('product',productId));
    byId('guidanceRepair')?.addEventListener('click',()=>navigate('workshop',`${productId}:${jobId}`));
    return;
  }
  const defaults=jobDefaults(job);
  const selected=new Set(getJobSelection(productId,jobId,defaults));
  const completeness=jobCompleteness(job,[...selected]);
  const required=(job.items||[]).filter(item=>item.required);
  const missing=required.filter(item=>!selected.has(item.id));
  const selectedCount=(job.items||[]).filter(item=>selected.has(item.id)).length;
  const guidance=getJobGuidance(productId,jobId);
  const toolInventory=getToolInventory();
  const requiredTools=(guidance.tools||[]).filter(t=>t.required);
  const missingTools=requiredTools.filter(t=>toolInventory[t.label]!=='have');
  const technicalUnknown=(guidance.technical||[]).filter(t=>t.status!=='verified').length;
  const readinessChecks=[!missing.length,missingTools.length===0,technicalUnknown===0];
  const readiness=Math.round(readinessChecks.filter(Boolean).length/readinessChecks.length*100);
  const itemHtml=(job.items||[]).map(item=>{
    const meta=jobRoleMeta(item.role);
    const linkedPart=item.partId?product.parts.find(part=>part.id===item.partId):null;
    const checked=selected.has(item.id);
    return `<article class="job-item ${checked?'selected':''}"><button class="job-toggle" data-job-item="${item.id}" aria-pressed="${checked}"><span class="job-check">${checked?'✓':'+'}</span><span class="grow"><span class="row-tight"><b>${esc(item.label)}</b><span class="pill ${meta.cls}">${meta.label}</span>${item.includedWithMain?'<span class="pill pill-ok">im Hauptteil</span>':''}</span><small>${esc(item.reason||'')}</small>${linkedPart?`<span class="job-part-link" data-open-part="${linkedPart.id}">Teil ansehen · ${Math.round(linkedPart.fitment.confidence*100)}% Fitment</span>`:''}${item.stockPlanId?`<span class="job-part-link" data-open-stock="${item.stockPlanId}">Bestand & Nachkauf verwalten</span>`:''}</span></button></article>`;
  }).join('');
  shell(`
    <button class="btn btn-ghost" id="back">← ${esc(product.brand)} ${esc(product.model)}</button>
    <div class="eyebrow">Universal Job-Kit · Demo</div><h2>${esc(job.label)}</h2><p class="muted">${esc(job.summary)}</p>
    <section class="card job-completeness-card ${completeness===100?'complete':''}"><div class="job-completeness-score"><strong>${completeness}</strong><span>%</span></div><div class="grow"><span class="pill ${completeness===100?'pill-ok':'pill-warn'}">Job-Vollständigkeit</span><h3>${missing.length?`${missing.length} erforderliche Position${missing.length===1?'':'en'} fehlen`:'Arbeitskorb vollständig'}</h3><div class="small muted">${selectedCount} von ${job.items.length} Positionen ausgewählt · nur „Erforderlich“ zählt für den Score.</div></div></section>
    ${missing.length?`<button class="btn btn-primary wide-btn" id="addMissing">Fehlende erforderliche Teile hinzufügen</button>`:''}
    <button class="btn btn-secondary wide-btn" id="jobToCart">🛒 Ausgewählte Teile mit Preisstand vormerken</button><p class="small muted">Verfügbare Brutto-EUR-Preise aus der Preisliste werden übernommen. Andere Positionen bleiben als Teilenotiz mit offenem Preis erhalten.</p>
    <div class="section-head"><div class="section-title">Arbeitskorb</div><span class="small muted">Du entscheidest</span></div>
    <div class="job-item-list">${itemHtml}</div>
    ${job.mainPartId?renderPartInstructions(product.parts.find(p=>p.id===job.mainPartId),product):(product.manuals||[]).some(m=>m.label==='Gebrauchsanweisung')?`<div class="section-head"><div class="section-title">Pflegeanleitung</div></div><a class="btn btn-secondary wide-btn" href="${esc(product.manuals.find(m=>m.label==='Gebrauchsanweisung').url)}" target="_blank" rel="noopener noreferrer">${esc(product.brand)} Geräteanleitung · Wartung und Reinigung ↗</a>`:''}
    ${job.evidenceNote?`<div class="notice info"><b>Datenstatus:</b> ${esc(job.evidenceNote)}</div>`:''}
    <div class="section-head"><div class="section-title">Reparaturbereitschaft</div><span class="small muted">Teile · Werkzeug · Technik</span></div>
    <section class="card readiness-card"><div class="readiness-score"><strong>${readiness}</strong><span>%</span></div><div class="grow"><h3>${readiness===100?'Bereit':'Noch nicht vollständig bereit'}</h3><div class="small muted">${missing.length?`${missing.length} Pflichtposition(en) fehlen. `:''}${missingTools.length?`${missingTools.length} Werkzeug(e) fehlen. `:''}${technicalUnknown?`${technicalUnknown} technische Angabe(n) sind nicht verifiziert.`:'Technische Angaben sind verifiziert.'}</div></div></section>
    ${(guidance.tools||[]).length?`<div class="section-head"><div class="section-title">Werkzeuge</div><span class="small muted">vorhanden markieren</span></div><div class="tool-list">${guidance.tools.map(tool=>{const have=toolInventory[tool.label]==='have';return `<article class="tool-item ${have?'selected':''}"><button data-tool-label="${esc(tool.label)}"><span class="job-check">${have?'✓':'+'}</span><span class="grow"><b>${esc(tool.label)}</b><small>${esc(tool.kind)}${tool.required?' · erforderlich':' · optional'}${tool.note?` · ${esc(tool.note)}`:''}</small></span></button></article>`;}).join('')}</div>`:''}
    ${(guidance.technical||[]).length?`<div class="section-head"><div class="section-title">Technische Arbeitsdaten</div><span class="small muted">nur mit Quelle</span></div><div class="technical-list">${guidance.technical.map(item=>`<article class="card technical-item"><div><b>${esc(item.label)}</b><div class="small muted">${esc(item.value)}</div></div><span class="pill ${item.status==='verified'?'pill-ok':'pill-warn'}">${item.status==='verified'?'verifiziert':'nicht verifiziert'}</span></article>`).join('')}</div><div class="notice warn"><b>Keine Schätzwerte:</b> Drehmomente, Füllmengen und sicherheitskritische Arbeitswerte werden nur mit belastbarer Hersteller-/Katalogquelle freigegeben.</div>`:''}
    <div class="row"><button class="btn btn-secondary" id="findWorkshop">Reparaturdienst suchen</button></div>
    <div class="principle-card"><div class="principle-icon">✓</div><div><b>Kein Upselling-Zwang</b><div class="small muted">Empfohlene, optionale und Pflege-Positionen bleiben klar getrennt. Erforderliche Teile brauchen später einen belegten Arbeitsvorgang als Quelle.</div></div></div>`,'home');
  byId('back')?.addEventListener('click',()=>navigate('product',productId));
  byId('jobToCart')?.addEventListener('click',()=>{
    let count=0;
    (job.items||[]).filter(item=>selected.has(item.id)&&item.partId).forEach(item=>{const part=product.parts.find(p=>p.id===item.partId);if(!part)return;const quote=cartQuoteItem(part,product);addCartItem(quote?{...quote,jobId}:{productId,partId:part.id,label:part.name,productLabel:`${product.brand} ${product.model}`,fitment:part.fitment.confidence,merchant:null,price:null,shipping:null,jobId});count++;});
    toast(count?`${count} Teil${count===1?'':'e'} vorgemerkt.`:'Keine kaufbaren Teile ausgewählt.',count?'success':'default');
    if(count) jobPage(arg);
  });
  byId('addMissing')?.addEventListener('click',()=>{
    missing.forEach(item=>selected.add(item.id));
    setJobSelection(productId,jobId,[...selected]);
    toast('Erforderliche Positionen ergänzt.','success');
    jobPage(arg);
  });
  document.querySelectorAll('[data-job-item]').forEach(button=>button.addEventListener('click',event=>{
    if(event.target.closest('[data-open-part],[data-open-stock]')) return;
    const id=button.dataset.jobItem;
    if(selected.has(id)) selected.delete(id); else selected.add(id);
    setJobSelection(productId,jobId,[...selected]);
    jobPage(arg);
  }));
  document.querySelectorAll('[data-open-part]').forEach(el=>el.addEventListener('click',event=>{event.stopPropagation();navigate('part',`${productId}:${el.dataset.openPart}`);}));
  document.querySelectorAll('[data-open-stock]').forEach(el=>el.addEventListener('click',event=>{event.stopPropagation();navigate('stock',`${productId}:${el.dataset.openStock}`);}));
  document.querySelectorAll('[data-tool-label]').forEach(button=>button.addEventListener('click',()=>{const label=button.dataset.toolLabel;setToolInventory(label,toolInventory[label]==='have'?'missing':'have');jobPage(arg);}));
  byId('findWorkshop')?.addEventListener('click',()=>navigate('workshop',`${productId}:${jobId}`));
}

function stockPage(arg){
  const [productId,stockId]=String(arg||'').split(':');
  const product=products.find(x=>x.id===productId);
  const plan=product?.stockPlans?.find(x=>x.id===stockId);
  if(!product||!plan){notFound();return;}
  const values=getInventoryPlan(productId,plan);
  const advice=stockAdvice(plan,values);
  const reminder=getReminderPref(productId,stockId);
  const statusLabel=advice.urgency==='high'?'Jetzt nachbestellen':advice.urgency==='medium'?'Bestellung einplanen':'Puffer ausreichend';
  shell(`
    <button class="btn btn-ghost" id="back">← ${esc(product.brand)} ${esc(product.model)}</button>
    <div class="eyebrow">Smart Stock · Demo</div><h2>${esc(plan.label)}</h2>
    <section class="card stock-hero stock-${advice.urgency}"><div class="stock-big"><strong>${values.stock}</strong><span>${esc(plan.unit)}</span></div><div class="grow"><span class="pill ${advice.shouldOrder?'pill-warn':'pill-ok'}">${statusLabel}</span><h3>ca. ${advice.remainingDays} Tage Reichweite</h3><div class="small muted">Lieferfenster ${advice.leadMin}–${advice.leadMax} Tage + ${advice.safety} Tage Sicherheitspuffer</div></div></section>
    <article class="card stock-controls"><h3>Bestand & Verbrauch</h3><div class="stock-control-row"><div><b>Aktueller Bestand</b><div class="small muted">${esc(plan.unit)}</div></div><div class="stepper"><button data-stock-step="-1">−</button><strong>${values.stock}</strong><button data-stock-step="1">+</button></div></div><label class="field-label" for="avgDays">Ø Tage pro ${esc(plan.unit.replace(/en$/,''))}</label><input class="text-input" id="avgDays" type="number" min="1" max="365" value="${values.avgDaysPerUnit}"><label class="field-label" for="leadMax">Aktuelle maximale Lieferzeit in Tagen</label><input class="text-input" id="leadMax" type="number" min="0" max="180" value="${values.leadTimeMaxDays}"><button class="btn btn-secondary wide-btn" id="saveStock">Werte speichern</button></article>
    <article class="card reminder-card"><div class="setting-row"><div><span class="pill ${reminder.enabled?'pill-ok':'pill-neutral'}">${reminder.enabled?'aktiv':'aus'}</span><h3>Rechtzeitig erinnern</h3><div class="small muted">Die Schwelle wird aus Verbrauch, Lieferzeit und Puffer berechnet – nicht aus einem starren Kalenderintervall.</div></div><button class="btn ${reminder.enabled?'btn-secondary':'btn-primary'} btn-small" id="toggleReminder">${reminder.enabled?'Ausschalten':'Aktivieren'}</button></div><div class="divider"></div><button class="btn btn-secondary wide-btn" id="testNotification">Test-Benachrichtigung</button></article>
    ${plan.supplyRisk==='elevated'?`<div class="notice warn"><b>Lange Lieferzeit im Demo-Szenario:</b> Bei ${advice.leadMax} Tagen Maximal-Lieferzeit wird deutlich früher gewarnt. Später kann derselbe Mechanismus echte Händler-Lieferzeiten und Verfügbarkeitsrisiken berücksichtigen.</div>`:''}
    <div class="notice info"><b>Wichtig:</b> Diese Version speichert den Plan lokal. Echte zeitgesteuerte Pushs bei geschlossenem Browser brauchen unseren nächsten Backend-/Push-Schritt. Ein Test-Push funktioniert bereits, wenn dein Browser Benachrichtigungen erlaubt.</div>`,'home');
  byId('back')?.addEventListener('click',()=>navigate('product',productId));
  document.querySelectorAll('[data-stock-step]').forEach(button=>button.addEventListener('click',()=>{
    const next=Math.max(0,values.stock+Number(button.dataset.stockStep||0));
    setInventoryPlan(productId,stockId,{stock:next}); stockPage(arg);
  }));
  byId('saveStock')?.addEventListener('click',()=>{
    const avg=Math.max(1,Number(byId('avgDays')?.value)||values.avgDaysPerUnit);
    const max=Math.max(0,Number(byId('leadMax')?.value)||0);
    setInventoryPlan(productId,stockId,{avgDaysPerUnit:avg,leadTimeMaxDays:max,leadTimeMinDays:Math.min(values.leadTimeMinDays,max)});
    toast('Smart-Stock-Werte gespeichert.','success'); stockPage(arg);
  });
  byId('toggleReminder')?.addEventListener('click',async()=>{
    if(!reminder.enabled && !(await requestNotifications())) return;
    setReminderPref(productId,stockId,{enabled:!reminder.enabled});
    toast(!reminder.enabled?'Erinnerung lokal aktiviert.':'Erinnerung deaktiviert.','success'); stockPage(arg);
  });
  byId('testNotification')?.addEventListener('click',async()=>{
    const ok=await showLocalNotification(`Universal Fitment · ${plan.label}`,advice.shouldOrder?`Jetzt nachbestellen: ca. ${advice.remainingDays} Tage Reichweite, Lieferung bis ${advice.leadMax} Tage.`:`Alles okay: noch ca. ${advice.remainingDays} Tage Reichweite.`);
    toast(ok?'Test-Benachrichtigung gesendet.':'Benachrichtigung konnte nicht gesendet werden.',ok?'success':'error');
  });
}

function savedPage(){
  const list=products.filter(p=>savedIds().includes(p.id));
  const external=externalSavedProducts();
  const total=list.length+external.length;
  const externalHtml=external.map(product=>`<article class="card product-card tap" data-external-saved="${esc(product.id)}" tabindex="0" role="button"><div class="product-head">${productImage(product)}<div class="grow"><div class="row-tight"><span class="pill pill-info">Live identifiziert</span><span class="pill grade-c">Grade C</span></div><h3>${esc(product.brand)} ${esc(product.name)}</h3><div class="muted small">${esc(product.model||product.category||product.source)}</div></div><div class="chevron">›</div></div></article>`).join('');
  shell(`<div class="eyebrow">Deine Geräte</div><h2>Gespeichert</h2>${total?`<p class="muted">${total} Gerät${total===1?'':'e'} lokal gespeichert.</p>${list.map(productCard).join('')}${externalHtml}`:`<div class="empty-state card"><div class="empty-icon">☆</div><h3>Noch nichts gespeichert</h3><p class="muted">Speichere oder bestätige ein Gerät, um später schneller zurückzukehren.</p><button class="btn btn-primary" id="browseProducts">Geräte suchen</button></div>`}`,'saved');
  byId('browseProducts')?.addEventListener('click',()=>navigate('home'));
  wireProductCards();
  document.querySelectorAll('[data-external-saved]').forEach(card=>card.addEventListener('click',()=>navigate('external-product',card.dataset.externalSaved)));
}

function recentPage(){
  const list=recentIds().map(id=>products.find(p=>p.id===id)).filter(Boolean);
  shell(`<button class="btn btn-ghost" id="back">← Zurück</button><div class="section-head"><div><div class="eyebrow">Historie</div><h2>Zuletzt angesehen</h2></div>${list.length?'<button class="text-button danger-text" id="clearRecent">Leeren</button>':''}</div>${list.map(productCard).join('')||'<div class="empty-state card"><div class="empty-icon">↻</div><h3>Noch kein Verlauf</h3><p class="muted">Geöffnete Produkte erscheinen automatisch hier.</p></div>'}`,'home');
  byId('back')?.addEventListener('click',()=>navigate('home'));
  byId('clearRecent')?.addEventListener('click',()=>{clearRecent();recentPage();toast('Verlauf geleert.');});
  wireProductCards();
}

function typePlatePage(){
  const review=reviewTypePlate(plateState.text);
  const statusLabels={exact_device:'Gerätekennung im Katalog gefunden',model_reference:'Bosch-Modellreferenz erkannt · E-Nr.-Index prüfen',catalog_reference:'Modellreferenz erkannt · Geräteausführung prüfen',shared_identity:'Mehrere Varianten möglich',family:'Nur die Gerätefamilie erkannt',part_only:'Teil erkannt – Gerät noch offen',conflict:'Kennungen widersprechen sich',unsupported_brand:'Marke nicht unterstützt / mehrdeutig',unresolved:'Noch keine belegte Zuordnung'};
  const blocked=review.hasInvalidFields||review.status==='conflict'||review.status==='unsupported_brand';
  const canCompare=!blocked&&review.suggestions.filter(p=>p.recordType==='model').length>1;
  shell(`<button class="btn btn-ghost" id="plateBack">← Scan</button><div class="eyebrow">Typenschild prüfen</div><h2>Was steht auf deinem Gerät?</h2><p class="muted">${plateState.origin==='photo'?'Die Texterkennung kann sich verlesen.':'Übertrage Marke und Kennungen vom Typenschild.'} Prüfe den Text, bevor du ein Gerät auswählst. Foto und Text werden weder gespeichert noch an einen Produktkatalog gesendet.</p>
    <section class="card"><label class="field-label" for="plateText">Typenschildtext prüfen oder korrigieren</label><textarea class="textarea" id="plateText" rows="7" maxlength="8000" spellcheck="false" placeholder="Marke: Miele / Bosch / Siemens / Philips / Dyson / AEG / Rowenta / Vorwerk / Samsung / Hoover&#10;Miele: Material-Nr. · Bosch / Siemens: E-Nr. mit /xx&#10;AEG: PNC · Philips: Modell mit /xx · Rowenta: Ref. Nr. · Vorwerk: VK / VT / VB · Samsung: vollständiger Modellcode · Hoover: Modell + Produktcode">${esc(plateState.text)}</textarea><div class="row wrap"><button class="btn btn-primary" id="plateReview">Text lokal prüfen</button><button class="btn btn-secondary" id="plateClear">Text verwerfen</button></div><p class="small muted">Serien-/Fabrikationsnummern brauchst du für diese Prüfung nicht. Du kannst sie aus dem Text löschen.</p></section>
    <section class="card"><h3>${esc(statusLabels[review.status])}</h3><p class="small muted">${review.brands.length?`Gelesene Marke: ${esc(review.brands.join(' / '))}`:'Marke: noch offen'}</p>${review.entries.length?`<dl class="plate-identifiers">${review.entries.map(e=>`<div><dt>${esc(e.label)}</dt><dd><b>${esc(e.value)}</b><span class="small muted">${e.kind==='serial'?'Nur lokal angezeigt · nicht zur Suche verwendet':e.invalid?'Ungültiges Format / Prüfziffer':e.matches.length?`${e.matches.length} Geräte-/Familienzuordnung${e.matches.length===1?'':'en'} im Katalog`:e.partMatches.length?'Teilekennung · kein Gerät':'Im Gerätekatalog nicht zugeordnet'}</span></dd></div>`).join('')}</dl>`:'<p class="muted">Keine brauchbare Kennung gelesen. Gib E-Nr., Materialnummer, EAN, Typ oder Modell vom Typenschild ein.</p>'}${review.warnings.map(w=>`<p class="notice compact">${esc(w)}</p>`).join('')}</section>
    ${!blocked?review.entries.filter(e=>e.serviceLink).map(e=>`<p><a class="btn btn-secondary" data-plate-service href="${esc(e.serviceLink.url)}" target="_blank" rel="noopener noreferrer">${esc(e.serviceLink.label)} · Index beim Hersteller prüfen ↗</a></p>`).join(''):''}
    ${review.suggestions.length?`<section class="card"><h3>${review.status==='family'?'Gerätefamilie prüfen':'Mit deinem Typenschild vergleichen'}</h3><p class="muted">${review.status==='family'?'Eine Familie bestätigt keine konkrete Ausstattungs- oder Farbvariante. Teile mit offener Ausführung bleiben prüfpflichtig.':'Vergleiche Nummer, Typ und Ausführung. Ein Foto oder Suchtreffer allein beweist keine Teile-Passform.'}</p>${review.needsBrandConfirmation?`<label class="plate-brand-check"><input id="plateBrandConfirm" type="checkbox"> Am Gerät steht die Marke ${esc(review.confirmationBrand||'Miele oder Bosch')}.</label>`:''}${blocked?'<p class="notice warn">Korrigiere zuerst die ungültigen oder widersprüchlichen Kennungen.</p>':''}${canCompare?'<p class="small muted">Wähle zwei bis vier Varianten für einen Vergleich aus.</p><button class="btn btn-secondary" id="plateCompare" disabled>Varianten vergleichen</button><p id="plateCompareStatus" class="small" role="status"></p>':''}${review.suggestions.map(p=>`<article class="plate-candidate">${p.recordType==='model'&&canCompare?`<label class="plate-brand-check"><input type="checkbox" data-compare-device="${esc(p.id)}" aria-label="${esc(p.brand)} ${esc(p.model)} ${esc(p.vacuumMeta.materialNumber||'')} vergleichen"> Zum Vergleich auswählen</label>`:''}<h4>${esc(p.brand)} ${esc(p.model)}</h4><p class="small muted">${esc(p.type)}</p><p class="small">${p.vacuumMeta?.materialNumber?`Geräte-Material-Nr.: <b>${esc(p.vacuumMeta.materialNumber)}</b> · `:''}${p.identifiers?.find(i=>i.type==='product-type')?`Typ: <b>${esc(p.identifiers.find(i=>i.type==='product-type').value)}</b>`:''}</p><button class="btn btn-secondary" data-plate-product="${esc(p.id)}" ${blocked||review.needsBrandConfirmation?'disabled':''}>${p.recordType==='family'?'Familienzuordnung öffnen':p.identityScope==='model-reference'?'Modellreferenz öffnen':'Dieses Gerät öffnen'}</button></article>`).join('')}</section>`:''}
    ${review.partSuggestions.length&&review.status!=='unsupported_brand'&&review.status!=='conflict'?`<section class="card"><h3>Gelesene Kennung gehört auch zu einem Teil</h3><p class="muted">Ein Teilebarcode identifiziert kein einzelnes Gerät. Prüfe am Teil und am Gerät separat die Zuordnung.</p>${review.partSuggestions.map(p=>`<p><button class="text-button" data-plate-part="${esc(p.id)}">${esc(p.name)} · Teil öffnen ›</button></p>`).join('')}</section>`:''}
    <section class="card"><h3>Keine sichere Kennung?</h3><p class="muted">Nutze die manuelle Suche nach Modell oder Materialnummer. Ein unbekannter Typ bleibt offen; wir erfinden keine Zuordnung.</p><button class="btn btn-secondary" id="plateManual">Zur manuellen Suche</button></section>`,'scan');
  const compareIds=()=>[...document.querySelectorAll('[data-compare-device]:checked')].map(e=>e.dataset.compareDevice);
  document.querySelectorAll('[data-compare-device]').forEach(c=>c.addEventListener('change',()=>{const count=compareIds().length;byId('plateCompare').disabled=count<2||count>4||review.needsBrandConfirmation&&!byId('plateBrandConfirm')?.checked;byId('plateCompareStatus').textContent=count>4?'Bitte höchstens vier Varianten auswählen.':`${count} von höchstens vier Varianten ausgewählt.`;}));
  byId('plateCompare')?.addEventListener('click',()=>{if(byId('plateText').value!==plateState.text){toast('Bitte den geänderten Text zuerst neu prüfen.');return;}const ids=compareIds();if(blocked||review.needsBrandConfirmation&&!byId('plateBrandConfirm')?.checked)return;if(compareDevices(ids))navigate('compare',ids.join(','));});
  const readText=()=>{plateState.text=byId('plateText').value.slice(0,8000);};
  byId('plateReview').addEventListener('click',()=>{readText();typePlatePage();});
  byId('plateText').addEventListener('input',()=>{document.querySelectorAll('[data-plate-product],[data-plate-part],[data-compare-device]').forEach(b=>b.disabled=true);if(byId('plateCompare'))byId('plateCompare').disabled=true;document.querySelectorAll('[data-plate-service]').forEach(a=>{a.removeAttribute('href');a.setAttribute('aria-disabled','true');a.textContent='E-Nr. geändert · Text zuerst neu prüfen';});byId('plateReview').textContent='Geänderten Text neu prüfen';});
  byId('plateBack').addEventListener('click',()=>navigate('scan'));
  byId('plateManual').addEventListener('click',()=>navigate('scan'));
  byId('plateClear').addEventListener('click',()=>{plateState.text='';typePlatePage();toast('Typenschildtext verworfen.');});
  byId('plateBrandConfirm')?.addEventListener('change',event=>{document.querySelectorAll('[data-plate-product]').forEach(b=>b.disabled=blocked||!event.target.checked||byId('plateText').value!==plateState.text);const count=compareIds().length;if(byId('plateCompare'))byId('plateCompare').disabled=blocked||!event.target.checked||count<2||count>4||byId('plateText').value!==plateState.text;});
  document.querySelectorAll('[data-plate-product]').forEach(b=>b.addEventListener('click',()=>{const p=review.suggestions.find(p=>p.id===b.dataset.plateProduct);if(!p||blocked||byId('plateText').value!==plateState.text||review.needsBrandConfirmation&&!byId('plateBrandConfirm')?.checked)return;boschContext.rememberReview(review,p,{brandConfirmed:!!byId('plateBrandConfirm')?.checked});plateState.text='';navigate('product',p.id);}));
  document.querySelectorAll('[data-plate-part]').forEach(b=>b.addEventListener('click',()=>{plateState.text='';navigate('catalog-part',b.dataset.platePart);}));
}

function comparisonPage(param){
  const comparison=compareDevices(String(param||'').split(','));
  if(!comparison){shell(`<button class="btn btn-ghost" id="compareBack">← Scan</button><h2>Vergleich noch offen</h2><p class="muted">Wähle in der Typenschildprüfung zwei bis vier konkrete Gerätevarianten aus.</p>`,'scan');byId('compareBack').addEventListener('click',()=>navigate('scan'));return;}
  const sameSeries=new Set(comparison.products.map(p=>p.vacuumMeta.series)).size===1;
  shell(`<button class="btn btn-ghost" id="compareBack">← Typenschildprüfung</button><div class="eyebrow">Herstellerdaten vergleichen</div><h2>Welche Variante ist deine?</h2><p class="muted">${sameSeries?'Diese Geräte gehören zur gleichen Serie.':'Diese Geräte gehören zu unterschiedlichen Serien.'} Vergleiche die gedruckte Modell-/Materialkennung und die sichtbare Ausstattung. Bei Bosch zusätzlich den vollständigen E-Nr.-Index prüfen. Gleiche Daten beweisen keine Austauschbarkeit von Teilen.</p><p class="small muted">Unterschiede sind markiert. Fehlende Werte bleiben „Nicht belegt“. Bei schmalem Bildschirm kannst du die Tabelle seitlich schieben.</p>
    <div class="comparison-scroll" tabindex="0" role="region" aria-label="Vergleich der Gerätevarianten"><table class="comparison-table"><caption>Herstellerangaben der ausgewählten Gerätevarianten</caption><thead><tr><th scope="col">Merkmal</th>${comparison.products.map(p=>`<th scope="col">${esc(p.model)}<br><span class="small muted">${esc(p.vacuumMeta.materialNumber||p.model)}</span></th>`).join('')}</tr></thead><tbody>${comparison.rows.map(row=>`<tr class="${row.different?'comparison-different':''}"><th scope="row">${esc(row.label)}${row.different?'<span class="small muted">Unterschied</span>':''}</th>${row.values.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <section class="card"><h3>Mit deinem Gerät abgleichen</h3><div class="comparison-actions">${comparison.products.map(p=>`<article><h4>${esc(p.model)}</h4><p class="small muted">${p.brand==='Bosch'?'Modellreferenz':'Material-Nr.'} ${esc(p.vacuumMeta.materialNumber||p.model)}</p><a href="${esc(safeExternalUrl(p.sources[0].url))}" target="_blank" rel="noopener noreferrer">Herstellerquelle ↗</a><p><button class="btn btn-secondary" data-compare-open="${esc(p.id)}">Dieses Gerät öffnen</button></p></article>`).join('')}</div><p class="small muted">Das Öffnen bestätigt keine universelle Passform. Prüfe beim Teil die konkrete Zuordnung und alle Hinweise zur Ausführung.</p></section>`,'scan');
  byId('compareBack').addEventListener('click',()=>navigate(plateState.text?'plate-review':'scan'));
  document.querySelectorAll('[data-compare-open]').forEach(b=>b.addEventListener('click',()=>navigate('product',b.dataset.compareOpen)));
}

function scanPage(){
  const caps=scannerCapabilities();
  shell(`
    <div class="eyebrow">Identifizieren · Live</div><h2>Deinen Staubsauger finden</h2>
    <p class="muted">Scanne das Typenschild oder den Barcode deines Staubsaugers. Unterstützte Marken: ${esc(catalogBrands.join(', '))}. Alternativ kannst du Serie, Modell, Beutelnummer oder EAN eingeben.</p><div class="notice compact"><b>Wichtig beim Typenschild:</b> Ein Barcode kann nur eine Serien-/Produktionsnummer enthalten. Für die sichere Identifikation fotografiere möglichst das <b>komplette Typenschild</b> mit Marke, Modell, Type/E-Nr. und Product No.</div>
    <section class="card scanner">
      <div class="scanner-viewport"><video id="video" class="hidden" muted playsinline></video><div id="cameraPlaceholder" class="camera-placeholder"><span>⌁</span><b>Scanner bereit</b><small>Barcode oder Typenschild</small></div><div class="scan-frame" aria-hidden="true"></div></div>
      <div class="scanner-actions-grid"><button class="btn btn-primary" id="startCamera" ${caps.camera?'':'disabled'}>Live-Scan</button><label class="btn btn-secondary" for="photoCamera">Foto aufnehmen</label><input id="photoCamera" class="hidden" type="file" accept="image/*" capture="environment"><label class="btn btn-secondary" for="photoLibrary">Aus Fotos</label><input id="photoLibrary" class="hidden" type="file" accept="image/*"></div>
      <div id="scanStatus" class="capability-row"><span class="cap ${caps.secureContext?'cap-ok':'cap-warn'}">HTTPS ${caps.secureContext?'✓':'–'}</span><span class="cap ${caps.camera?'cap-ok':'cap-warn'}">Kamera ${caps.camera?'✓':'–'}</span><span class="cap ${caps.barcodeDetector?'cap-ok':'cap-warn'}">Barcode ${caps.barcodeDetector?'✓':'manuell'}</span><span class="cap cap-ok">Typtext OCR ✓</span></div>
      <button class="text-button" id="enterPlate">Typenschildtext eingeben / prüfen</button>
      <img id="preview" class="preview hidden" alt="Vorschau des ausgewählten Produktfotos">
      <div id="photoActions" class="hidden"><p class="small muted">Texterkennung lädt beim ersten Start zusätzliche Erkennungsdateien. Dein Foto bleibt im Browser. Lies möglichst das komplette Typenschild.</p><div class="row wrap"><button class="btn btn-secondary" id="readPhoto">Typtext vom Foto lesen (OCR)</button><button class="btn btn-secondary hidden" id="usePhotoBarcode">Barcode verwenden</button></div><p id="photoTextStatus" class="small" role="status"></p></div>
      <div class="divider"></div>
      <label class="field-label" for="manual">Marke, Modell, E-Nr., Material-Nr. oder EAN</label>
      <div class="searchbar compact-search"><input id="manual" autocomplete="off" placeholder="z. B. Complete C3, 12421170, 4002516766940"><button class="btn btn-primary" id="find">Live suchen</button></div>
      <div class="small muted scan-tip">Tipp: Bei Miele hilft die Materialnummer, bei Bosch die E-Nr. mit /xx, bei AEG die PNC und bei Dyson Modell und Generation. Für Verbrauchsmittel kannst du auch Materialnummer oder EAN scannen.</div>
      <div class="scenario-row mini">${demoScenarios.slice(0,6).map(s=>`<button class="scenario-chip" data-scan-demo="${esc(s.query)}">${esc(s.label)}</button>`).join('')}</div>
    </section>
    <div class="notice info"><b>Keine erfundenen Treffer:</b> Der Katalog unterstützt ${esc(catalogBrands.join(', '))}. Eine Modellreferenz oder ein Barcode allein bestätigt keine Ersatzteil-Passform; Herstellerquelle und Ausführung prüfen.</div>`,'scan');

  byId('enterPlate')?.addEventListener('click',()=>{plateState.origin='manual';navigate('plate-review');});
  const status=byId('scanStatus');
  const video=byId('video');
  byId('startCamera')?.addEventListener('click',async()=>{
    const button=byId('startCamera');button.disabled=true;
    const version=renderVersion;
    scannerController?.abort();scannerController=new AbortController();
    const signal=scannerController.signal;
    try{
      video.classList.remove('hidden'); byId('cameraPlaceholder')?.classList.add('hidden');
      const session=await startBarcodeScanner(video,code=>{if(version!==renderVersion||signal.aborted)return;toast(`Barcode erkannt: ${code}`,'success');resolveScan(code);},message=>{if(version!==renderVersion||signal.aborted)return;status.insertAdjacentHTML('beforeend',`<span class="scanner-message">${esc(message)}</span>`);},{signal});
      if(version!==renderVersion){session.stop();return;}
      scannerSession=session;
    }catch{
      if(version!==renderVersion)return;button.disabled=false;
      video.classList.add('hidden'); byId('cameraPlaceholder')?.classList.remove('hidden');
      if(signal.aborted)return;
      toast('Kamera konnte nicht gestartet werden. Nutze Foto oder manuelle Eingabe.','error');
    }
  });
  const find=()=>resolveScan(byId('manual')?.value);
  byId('find')?.addEventListener('click',find);
  byId('manual')?.addEventListener('keydown',e=>{if(e.key==='Enter')find();});
  document.querySelectorAll('[data-scan-demo]').forEach(button=>button.addEventListener('click',()=>resolveScan(button.dataset.scanDemo)));
  const processPhoto=async file=>{
    if(!file)return;
    if(file.size>25*1024*1024){toast('Das Foto ist größer als 25 MB. Bitte ein kleineres Bild wählen.','error');return;}
    const version=++photoVersion;
    photoController?.abort();photoController=new AbortController();
    const signal=photoController.signal;
    scannerController?.abort();scannerSession?.stop();scannerSession=null;
    video.classList.add('hidden');byId('cameraPlaceholder')?.classList.remove('hidden');byId('startCamera').disabled=!caps.camera;
    if(selectedPhotoUrl) URL.revokeObjectURL(selectedPhotoUrl);
    selectedPhotoUrl=URL.createObjectURL(file);
    const img=byId('preview'); img.src=selectedPhotoUrl; img.classList.remove('hidden');
    const actions=byId('photoActions'),read=byId('readPhoto'),barcodeButton=byId('usePhotoBarcode'),ocrLine=byId('photoTextStatus');
    actions.classList.remove('hidden');read.disabled=false;barcodeButton.classList.add('hidden');barcodeButton.onclick=null;ocrLine.textContent='Foto geladen. Starte die Texterkennung oder gib die Modellnummer ein.';
    read.onclick=async()=>{
    if(signal.aborted||version!==photoVersion)return;
    read.disabled=true;
    const lines=await detectTextFromImage(file,message=>{if(version===photoVersion&&!signal.aborted&&ocrLine.isConnected)ocrLine.textContent=message;},{signal});
    if(version!==photoVersion||signal.aborted||!img.isConnected)return;
    read.disabled=false;
    if(lines.length){plateState.text=lines.join('\n').slice(0,8000);plateState.origin='photo';navigate('plate-review');return;}
    if(!ocrLine.textContent.includes('erneut'))ocrLine.textContent='Kein Typtext erkannt. Bitte das komplette Typenschild erneut fotografieren oder den Text eingeben.';
    };
    const barcode=await detectBarcodeFromImage(file);
    if(version!==photoVersion||signal.aborted||!img.isConnected)return;
    if(barcode){
      barcodeButton.classList.remove('hidden');barcodeButton.textContent=`Barcode verwenden: ${barcode}`;barcodeButton.onclick=()=>{if(!signal.aborted&&version===photoVersion)resolveScan(barcode);};
    }
  };
  byId('photoCamera')?.addEventListener('change',e=>processPhoto(e.target.files?.[0]));
  byId('photoLibrary')?.addEventListener('change',e=>processPhoto(e.target.files?.[0]));

}

async function resolveScan(value,{forceExternal=false}={}){
  const query=String(value||'').trim();
  if(!query){toast('Bitte Modell, Barcode oder Typnummer eingeben.','error');return;}
  const eNumberReview=reviewTypePlate(query);
  if(!forceExternal&&(parseBoschENumber(query)||eNumberReview.entries.some(e=>e.kind==='enumber'))){plateState.text=query;plateState.origin='manual';navigate('plate-review');return;}
  const codeReview=reviewScannedCode(query);
  if(!forceExternal&&codeReview.status==='part_only'){
    plateState.text=codeReview.text;plateState.origin='manual';navigate('plate-review');return;
  }
  cleanupTransientResources();
  shell(`<button class="btn btn-ghost" id="back">← Scan</button><div class="eyebrow">Live-Abgleich</div><h2>Produkt wird gesucht …</h2><p class="muted">Lokaler verifizierter Katalog → externer Produktkatalog → Herstellerquelle.</p><div class="card loading-card"><div class="skeleton-line wide"></div><div class="skeleton-line"></div><div class="skeleton-line short"></div></div>`,'scan');
  byId('back')?.addEventListener('click',()=>navigate('scan'));

  const version=renderVersion;
  resolverController=new AbortController();const signal=resolverController.signal;
  if(!forceExternal&&!matchProducts(products,query).some(x=>x.score>=96)){
   const brands=optionalCatalogBrands.filter(b=>!catalogLoader.isLoaded(b));
   const loaded=await Promise.allSettled(brands.map(b=>catalogLoader.ensure(b)));
   if(version!==renderVersion||signal.aborted)return;
   catalogLoadErrors=brands.filter((b,i)=>loaded[i].status==='rejected');
  }
  const enrichedReview=reviewScannedCode(query);
  if(!forceExternal&&(enrichedReview.status==='part_only'||enrichedReview.entries.some(e=>e.kind==='pnc'&&e.matches.length))){plateState.text=enrichedReview.text;plateState.origin='manual';navigate('plate-review');return;}
  const resolved=await resolveProductQuery(products,query,{allowExternal:true,forceExternal,signal});
  if(version!==renderVersion)return;
  const matches=resolved.localMatches;
  const externalCandidates=[...(resolved.externalCandidates||[])].filter(isMielePilotCandidate);
  const externalNote=resolved.externalStatus==='needs-model'
    ? '<span class="pill pill-warn">Code erkannt · Modellnummer fehlt</span>'
    : resolved.usedExternal
      ? resolved.externalStatus==='found' ? `<span class="pill pill-info">Live geprüft · ${esc(resolved.externalSources?.join(' + ')||'externe Quelle')}</span>`
        : resolved.externalStatus==='rate-limited' ? '<span class="pill pill-warn">Live-Katalog Limit erreicht</span>'
        : resolved.externalStatus==='not-found' ? '<span class="pill pill-neutral">Live geprüft · kein Treffer</span>'
        : '<span class="pill pill-warn">Live-Quelle gerade nicht erreichbar</span>'
      : '<span class="pill pill-neutral">Noch kein exakter Produktbezug</span>';

  const localHtml=matches.map(({product,score})=>`<article class="card confirm-card"><div class="product-head grow">${productImage(product)}<div class="grow"><div class="row-tight"><span class="pill ${score>=90?'pill-ok':score>=70?'pill-info':'pill-warn'}">${esc(matchReason(product,query))}</span><span class="pill ${dataStatusMeta(product).cls}">${dataStatusMeta(product).label}</span></div><h3>${esc(product.brand)} ${esc(product.model)}</h3><div class="small muted">${esc(product.type)}</div></div></div><button class="btn btn-primary" data-confirm="${product.id}">Das ist mein Gerät</button></article>`).join('');

  const externalHtml=externalCandidates.slice(0,5).map(candidate=>{
    return `<article class="card external-card"><div class="external-head">${candidate.imageUrl?`<img src="${esc(candidate.imageUrl)}" alt="" class="external-thumb" referrerpolicy="no-referrer">`:`<div class="external-thumb external-placeholder">🧹</div>`}<div class="grow"><div class="row-tight"><span class="pill pill-info">Live · ${esc(candidate.source)}</span><span class="pill pill-ok">🧹 Miele Pilot</span><span class="pill pill-warn">Identität · Grade C</span></div><h3>${esc(candidate.brand)} ${esc(candidate.name)}</h3><div class="small muted">${candidate.model?`Modell ${esc(candidate.model)} · `:''}${candidate.code?`Code ${esc(candidate.code)} · `:''}${esc(candidate.category||'Produktkatalog')}</div></div></div><div class="notice compact"><b>Noch keine Fitment-Behauptung:</b> ${esc(candidate.note)}</div><div class="row"><button class="btn btn-primary" data-confirm-external="${esc(candidate.id)}">Das ist mein Gerät</button><button class="btn btn-secondary" data-external-info="${esc(candidate.id)}">Quelle</button></div></article>`;
  }).join('');

  const identifierHelp=resolved.externalStatus==='needs-model'
    ? `<div class="empty-state card"><div class="empty-icon">⌁</div><h3>Code erkannt – wahrscheinlich nicht die Modellnummer</h3><p class="muted"><b>${esc(query)}</b> ist kein gültiger EAN/UPC/GTIN. Das Muster sieht eher nach Serien-, Produktions- oder internem Herstellercode aus. Damit lässt sich das genaue Gerät oft nicht eindeutig bestimmen.</p><div class="notice compact"><b>Nächster Schritt:</b> Fotografiere das komplette Typenschild. Wir brauchen idealerweise Marke + Modell/Type/E-Nr./Product No. Den gelesenen Code werfen wir nicht weg – nach der Geräteerkennung kann er als zusätzlicher Geräte-Identifier gespeichert werden.</div><div class="row"><button class="btn btn-primary" id="scanWholePlate">Ganzes Typenschild scannen</button><button class="btn btn-secondary" id="forceLiveSearch">Trotzdem live suchen</button></div></div>`
    : `<div class="empty-state card"><div class="empty-icon">?</div><h3>Noch kein eindeutiger Treffer</h3><p class="muted">${resolved.externalStatus==='rate-limited'?'Der kostenlose Live-Katalog hat gerade sein Abfragelimit erreicht. ':''}Prüfe die Modell-/Produktnummer direkt am Typenschild. Ein Markenname allein reicht oft nicht.</p><button class="btn btn-secondary" id="tryAgain">Andere Eingabe</button></div>`;
  const emptyHtml=!matches.length&&!externalCandidates.length?identifierHelp:'';

  shell(`
    <button class="btn btn-ghost" id="back">← Scan</button><div class="eyebrow">Abgleich</div><h2>Ist dein Gerät dabei?</h2>
    <p class="muted">Ein Hersteller-Datensatz führt zu quellenbezogenen Teilen; Kennung und Ausführung bleiben separat zu prüfen. Ein Live-Katalogtreffer wird erst nach deiner Bestätigung als Gerät übernommen.</p>
    <div class="query-box"><span>Gesucht</span><strong>${esc(query)}</strong>${externalNote}</div>
    ${localHtml}${externalHtml}${emptyHtml}`,'scan');
  byId('back')?.addEventListener('click',()=>navigate('scan'));
  byId('tryAgain')?.addEventListener('click',()=>navigate('scan'));
  byId('scanWholePlate')?.addEventListener('click',()=>{navigate('scan');setTimeout(()=>toast('Fotografiere jetzt das komplette Typenschild, nicht nur den Barcode.'),0);});
  byId('forceLiveSearch')?.addEventListener('click',()=>resolveScan(query,{forceExternal:true}));
  document.querySelectorAll('[data-confirm]').forEach(button=>button.addEventListener('click',()=>navigate('product',button.dataset.confirm)));
  document.querySelectorAll('[data-confirm-external]').forEach(button=>button.addEventListener('click',()=>{
    const candidate=externalCandidates.find(item=>item.id===button.dataset.confirmExternal);
    if(!candidate) return;
    const id=rememberExternalProduct(candidate);
    navigate('external-product',id);
  }));
  document.querySelectorAll('[data-external-info]').forEach(button=>button.addEventListener('click',()=>{
    const candidate=externalCandidates.find(item=>item.id===button.dataset.externalInfo);
    const url=safeExternalUrl(candidate?.sourceUrl||'');
    showModal({title:'Live-Quelle',confirmLabel:url?'Quelle öffnen':'Verstanden',cancelLabel:'Schließen',body:`<p><b>${esc(candidate?.source||'Externe Quelle')}</b></p><p class="muted">Dieser Datensatz hilft nur bei der Produktidentität. Teile-Kompatibilität braucht einen separaten Hersteller-/Katalognachweis.</p>${url?`<p class="small"><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Datensatz öffnen ↗</a></p>`:''}`,onConfirm:close=>{if(url)window.open(url,'_blank','noopener');close();}});
  }));
}

function externalProductPage(id){
  const product=getExternalProduct(id);
  if(!product){notFound();return;}
  const sourceUrl=safeExternalUrl(product.sourceUrl||'');
  const identity=Math.round((product.confidence||.7)*100);
  const identifiers=[
    product.model?{label:'Modell',value:product.model}:null,
    product.code?{label:'EAN/UPC/GTIN',value:product.code}:null,
    product.category?{label:'Kategorie',value:product.category}:null
  ].filter(Boolean);
  shell(`
    <div class="page-action-row"><button class="btn btn-ghost" id="back">← Suche</button><button class="btn btn-ghost" id="shareExternal">↗ Teilen</button></div>
    <article class="product-hero card live-product-hero">
      <div class="product-head">${productImage(product,true)}<div class="grow"><div class="row-tight"><span class="pill pill-info">Live identifiziert</span><span class="pill pill-warn">Externe Identität · unbestätigt</span><span class="pill pill-ok">Miele Pilot</span></div><h2>${esc(product.brand)} ${esc(product.name)}</h2><div class="muted">${esc(product.model||product.category||'Externer Produktkatalog')}</div></div></div>
      <div class="divider"></div>
      <div class="identifier-grid">${identifiers.map(item=>`<button class="identifier identifier-button" data-copy-live="${esc(item.value)}"><span>${esc(item.label)}</span><strong>${esc(item.value)}</strong><em>Kopieren</em></button>`).join('')}</div>
      <div class="notice compact"><b>Pilot-Regel:</b> Ein externer Treffer bestätigt nur die Miele-Produktidentität. Beutel und Filter werden erst grün, wenn die konkrete Serie in unserer Miele-Herstellerzuordnung liegt.</div>
    </article>
    <div class="section-head"><div class="section-title">Produktquelle</div><span class="small muted">live</span></div>
    <article class="source"><div class="source-index">1</div><div class="grow"><div class="row-tight">${sourceUrl?`<a href="${esc(sourceUrl)}" target="_blank" rel="noopener noreferrer"><b>${esc(product.source)}</b></a>`:`<b>${esc(product.source)}</b>`}<span class="pill grade-c">C · Nur Identität</span></div><div class="small muted">Nicht als Fitmentquelle verwendet</div></div></article>
    <div class="section-head"><div class="section-title">Noch nicht in unserer Miele-Serie?</div><span class="small muted">kein Raten</span></div>
    <article class="card"><p class="muted">Fotografiere das komplette Typenschild oder gib die exakte Miele-Serie ein. Wenn wir die Familie noch nicht verifiziert haben, zeigen wir bewusst kein angeblich passendes Verbrauchsmittel.</p><button class="btn btn-secondary" id="newSearch">Noch einmal suchen</button></article>`,'scan');
  byId('back')?.addEventListener('click',()=>navigate('scan'));
  byId('newSearch')?.addEventListener('click',()=>navigate('scan'));
  byId('shareExternal')?.addEventListener('click',()=>shareCurrent({title:'Universal Fitment · Miele Pilot',text:`${product.brand} ${product.name}`}));
  document.querySelectorAll('[data-copy-live]').forEach(button=>button.addEventListener('click',async()=>toast(await copyText(button.dataset.copyLive)?'Kennung kopiert.':'Kopieren fehlgeschlagen.', 'success')));
}

function reportDialog(product){
  showModal({
    title:`Datenproblem melden`, confirmLabel:'Lokal speichern',
    body:`<p class="muted small">${esc(product.brand)} ${esc(product.model)} · In der Demo bleibt die Meldung nur auf diesem Gerät.</p><label class="field-label" for="reportReason">Was stimmt nicht?</label><textarea id="reportReason" class="textarea" rows="4" maxlength="500" placeholder="Kurze Beschreibung …"></textarea>`,
    onConfirm:close=>{
      const reason=byId('reportReason')?.value.trim();
      if(!reason){toast('Bitte kurz beschreiben, was nicht stimmt.','error');return false;}
      addReport({productId:product.id,reason}); close(); toast('Meldung lokal gespeichert.','success'); return false;
    }
  });
}

function isStandalone(){ return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; }
function isIOS(){ return /iphone|ipad|ipod/i.test(navigator.userAgent); }
function installHelp(){
  if(isStandalone()){toast('Die Demo läuft bereits als installierte Web-App.','success');return;}
  if(deferredInstallPrompt){
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.finally(()=>{deferredInstallPrompt=null;});
    return;
  }
  showModal({title:'Zum Home-Bildschirm',confirmLabel:'Verstanden',cancelLabel:'Schließen',body:isIOS()?`<ol class="install-steps"><li>In Safari unten auf <b>Teilen</b> tippen.</li><li><b>Zum Home-Bildschirm</b> wählen.</li><li>Mit <b>Hinzufügen</b> bestätigen.</li></ol>`:`<p class="muted">Nutze im Browser-Menü „App installieren“ oder „Zum Startbildschirm hinzufügen“. Diese Option erscheint erst nach HTTPS-Deployment.</p>`,onConfirm:close=>close()});
}

function vehicleIdentityDialog(product){
  const current=getVehicleMeta(product.id);
  showModal({
    title:'Fahrzeug identifizieren',confirmLabel:'Lokal speichern',cancelLabel:'Abbrechen',
    body:`<div class="notice info">VIN und HSN/TSN werden in dieser Version nur lokal gespeichert. Eine exakte Fahrzeugauflösung braucht eine lizenzierte Fahrzeugdatenquelle.</div>
      <label class="field-label" for="vinInput">VIN / FIN</label><input class="text-input" id="vinInput" maxlength="17" value="${esc(current.vin||'')}" placeholder="17-stellige VIN">
      <div class="two-col"><div><label class="field-label" for="hsnInput">HSN</label><input class="text-input" id="hsnInput" maxlength="4" value="${esc(current.hsn||'')}" placeholder="z. B. 8004"></div><div><label class="field-label" for="tsnInput">TSN</label><input class="text-input" id="tsnInput" maxlength="8" value="${esc(current.tsn||'')}" placeholder="z. B. ABC"></div></div>
      <div id="vehicleValidation" class="small muted"></div>`,
    onConfirm:close=>{
      const vin=normalizeVin(byId('vinInput')?.value||'');
      const hsn=normalizeHsn(byId('hsnInput')?.value||'');
      const tsn=normalizeTsn(byId('tsnInput')?.value||'');
      if(vin){const result=validateVin(vin);if(!result.valid){const el=byId('vehicleValidation');if(el)el.innerHTML=`<span class="bad-text">${esc(result.reason)}</span>`;return false;}}
      setVehicleMeta(product.id,{vin,hsn,tsn});close();toast('Fahrzeugdaten lokal gespeichert.','success');productPage(product.id);return false;
    }
  });
}

function cartPage(){
  const groups=cartGroups();
  const items=cartItems();
  const knownItemsTotal=roundMoney(groups.reduce((sum,g)=>sum+g.knownSubtotal,0));
  const unknownPriceCount=groups.reduce((sum,g)=>sum+g.unknownPriceCount,0);
  const complete=items.length>0&&groups.every(g=>g.total!==null);
  const total=complete?roundMoney(groups.reduce((sum,g)=>sum+g.total,0)):null;
  shell(`
    <div class="eyebrow">Universal-Warenkorb · Deutschland</div><h2>Teile & Kosten planen</h2>
    <p class="muted">Dein Einkaufsplan mit Teilen und Mengen. Gespeicherte Preise je Verkaufseinheit; Versand und Freigrenzen je Händlerbestellung. Bestellen und bezahlen wirst du im jeweiligen Shop.</p>
    ${items.length?`<section class="card cart-summary"><div><span class="pill pill-info">${items.length} Position${items.length===1?'':'en'}</span><h3>${total!==null?`${money(total)} inkl. Standardversand`:`${money(knownItemsTotal)} bekannte Artikelpreise`}</h3><div class="small muted">${unknownPriceCount?`${unknownPriceCount} Position${unknownPriceCount===1?'':'en'} ohne bestätigten, aktuellen Brutto-EUR-Preis. Gesamtbetrag offen.`:'Planungsbetrag auf Basis der Quellenstände; Preis und Bestellbarkeit im Shop prüfen.'}</div></div><button class="btn btn-danger btn-small" id="clearCart">Leeren</button></section>`:''}
    ${items.length?'<section class="card cart-next-step"><div><h3>Bereit für den Händler?</h3><p class="small muted">Artikel-Links und Mengenliste öffnen. Die Mengen werden noch nicht automatisch in fremde Warenkörbe übernommen.</p></div><button class="btn btn-primary" id="cartHandoff">Beim Händler bestellen →</button></section>':''}
    ${groups.map(group=>`<div class="section-head"><div class="section-title">${esc(group.merchant)}</div><span class="small muted">${group.items.length} Position${group.items.length===1?'':'en'}</span></div>
      <section class="card cart-group">${group.items.map(item=>{
        const source=safeExternalUrl(item.sourceUrl),known=cartPriceKnown(item);
        const product=products.find(p=>p.id===item.productId),part=product?.parts.find(p=>p.id===item.partId)||product?.candidateParts?.find(p=>p.id===item.partId),time=part?installationTime(part):null;
        return `<article class="cart-item"><div class="grow"><div class="row-tight"><b>${esc(item.label)}</b>${item.fitmentStatus==='variant_check_required'?'<span class="pill pill-warn">Ausführung prüfen</span>':''}</div><div class="small muted">${esc(item.productLabel||'')}${item.jobId?' · aus Job-Kit':''}</div>${item.entryType==='marketplace-search'?`<div class="small"><span class="pill pill-info">Teilenotiz · Gesucht: ${esc(marketplaceConditions.find(([id])=>id===item.requestedCondition)?.[1]||'Zustand offen')}</span></div>`:''}${isAmount(item.price)?`<div class="small">${esc(priceText(item))} · ${esc(item.unitLabel||'Preisstand prüfen')}</div>`:'<div class="small muted">Preis und Anbieter noch auswählen</div>'}${item.checkedAt?`<div class="small muted">Abruf ${esc(quoteDate(item))} · ${esc(priceTaxLabel(item))}</div>`:''}${!known&&isAmount(item.price)?'<div class="small warn-text">Preisstand oder Bestellbarkeit erneut prüfen; nicht in der Summe enthalten.</div>':''}${time?`<div class="small muted">⏱ ${esc(time.label)}${time.status==='estimate'?' pro Wechsel · geschätzt':''}</div>`:''}<div class="row">${source?`<a class="text-button" href="${esc(source)}" target="_blank" rel="noopener noreferrer">Im Shop prüfen ↗</a>`:''}${item.entryType==='marketplace-search'?(item.lookupLinks||[]).map(link=>{const url=safeExternalUrl(link.url);return url?`<a class="text-button" data-cart-marketplace="${esc(link.provider)}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(link.name)} Suche ↗</a>`:'';}).join(''):''}${part?`<button class="text-button" data-cart-part="${esc(`${product.id}:${part.id}`)}">Teil & Preis öffnen</button>`:''}</div></div><div class="cart-controls"><button aria-label="Menge verringern" data-cart-dec="${esc(item.key)}">−</button><strong>${Number(item.quantity)||1}</strong><button aria-label="Menge erhöhen" data-cart-inc="${esc(item.key)}">+</button><button class="text-button danger-text" data-cart-remove="${esc(item.key)}">Entfernen</button></div></article>`;
      }).join('')}<div class="divider"></div><div class="cart-group-total"><span>${group.unknownPriceCount?'Bekannte Artikelpreise':'Artikelgesamt'}</span><b>${money(group.knownSubtotal)}</b></div><div class="cart-group-total"><span>Versand je Händlerbestellung</span><b>${group.shippingKnown?money(group.shipping):'offen'}</b></div>${group.total!==null?`<div class="cart-group-total group-final"><span>Gesamt inkl. MwSt. und Standardversand</span><b>${money(group.total)}</b></div>`:'<p class="small muted">Gesamtbetrag offen, bis Preise und Versand bestätigt sind.</p>'}</section>`).join('')||`<div class="empty-state card"><div class="empty-icon">🛒</div><h3>Warenkorb ist leer</h3><p class="muted">Öffne ein passendes Teil und übernimm den Anbieterpreis oder merke es als Teilenotiz vor.</p><button class="btn btn-primary" id="cartBrowse">Preislisten öffnen</button></div>`}
    ${items.length?'<div class="notice info">Preise und Bestand können sich ändern. Im Shop werden der aktuelle Preis, die Lieferadresse und die gewählte Versandart bestätigt.</div>':''}`,'cart');
  byId('clearCart')?.addEventListener('click',()=>{clearCart();cartPage();toast('Warenkorb geleert.');});
  byId('cartBrowse')?.addEventListener('click',()=>navigate('prices'));
  byId('cartHandoff')?.addEventListener('click',()=>navigate('checkout'));
  document.querySelectorAll('[data-cart-part]').forEach(b=>b.addEventListener('click',()=>navigate('part',b.dataset.cartPart)));
  document.querySelectorAll('[data-cart-dec]').forEach(b=>b.addEventListener('click',()=>{const item=cartItems().find(x=>x.key===b.dataset.cartDec);setCartQuantity(b.dataset.cartDec,(Number(item?.quantity)||1)-1);cartPage();}));
  document.querySelectorAll('[data-cart-inc]').forEach(b=>b.addEventListener('click',()=>{const item=cartItems().find(x=>x.key===b.dataset.cartInc);setCartQuantity(b.dataset.cartInc,(Number(item?.quantity)||1)+1);cartPage();}));
  document.querySelectorAll('[data-cart-remove]').forEach(b=>b.addEventListener('click',()=>{removeCartItem(b.dataset.cartRemove);cartPage();}));
}

function handoffPage(){
  const resolvePart=item=>{const p=products.find(p=>p.id===item.productId);return p?.parts.find(part=>part.id===item.partId)||p?.candidateParts?.find(part=>part.id===item.partId)||null;};
  const plan=buildHandoffPlan(cartItems(),{resolvePart});
  shell(`<button class="btn btn-ghost" id="handoffBack">← Warenkorb bearbeiten</button><div class="eyebrow">Einkaufsplan · Händler-Weiterleitung</div><h2>Beim Händler bestellen.</h2>
    <p class="muted">Deine Teile und Mengen bleiben hier gespeichert. Öffne die jeweilige Artikelseite, lege die gewünschte Menge beim Händler in den Warenkorb und bezahle dort.</p>
    ${plan.itemCount?`<section class="card handoff-overview"><div><span class="pill pill-info">${plan.itemCount} Position${plan.itemCount===1?'':'en'} · ${plan.unitCount} Verkaufseinheit${plan.unitCount===1?'':'en'}</span><h3>${plan.total!==null?`${money(plan.total)} Planungsbetrag`:'Preis und Versand beim Händler bestätigen'}</h3><p class="small muted">${plan.total!==null?'Auf Basis gespeicherter Preise inkl. genanntem Standardversand. Der aktuelle Shoppreis gilt bei Bestellung.':'Suchnotizen, offene oder ältere Preise sind kein bestätigter Bestellbetrag.'}</p></div><button class="btn btn-secondary" id="copyHandoff">Einkaufsliste kopieren</button></section>
    <div class="notice info"><b>Zahlung beim Händler:</b> Diese Seite löst keine Bestellung und keine Zahlung aus. Mengen und Artikel werden noch nicht automatisch in Händler-Warenkörbe übertragen. Mehrere Shops bedeuten separate Bestellungen.</div>`:'<section class="card empty-state"><h3>Dein Einkaufsplan ist leer</h3><p class="muted">Wähle zuerst Teile oder eine Marktplatzsuche für dein Gerät.</p><button class="btn btn-primary" id="handoffBrowse">Teile finden</button></section>'}
    ${plan.groups.map((group,index)=>`<div class="section-head"><div class="section-title">${esc(group.merchant)}</div><span class="small muted">${group.lines.length} Position${group.lines.length===1?'':'en'}</span></div><section class="card handoff-group">
    ${group.lines.map(line=>`<article class="handoff-line" data-handoff-line="${esc(line.key)}"><div class="handoff-line-heading"><div class="grow"><b>${esc(line.label)}</b><div class="small muted">${esc(line.productLabel)}</div>${line.partNumber?`<div class="small part-number">${esc(line.partNumberLabel||'Teilenummer')} ${esc(line.partNumber)}</div>`:''}</div><div class="handoff-quantity"><strong>${line.quantity} ×</strong><small>Menge im Shop wählen</small></div></div>
    ${line.unitLabel?`<p class="small muted">Je Verkaufseinheit: ${esc(line.unitLabel)}</p>`:''}${line.requestedCondition?`<p class="small"><span class="pill pill-info">Gesucht: ${esc(line.requestedCondition)}</span> · Zustand und Lieferumfang im Angebot prüfen.</p>`:''}
    ${line.needsVariantCheck?'<p class="notice warn compact">Ausführung und Anschlüsse noch prüfen; dieses Teil ist nicht eindeutig bestätigt.</p>':''}
    <p class="small muted">${line.kind==='marketplace-search'?'Zuerst ein konkretes Angebot auswählen. Ein Suchtreffer bestätigt keine Passgenauigkeit.':line.kind==='part-reference'?'Teilequelle verlinkt; Angebot, Zustand und aktuellen Preis noch auswählen.':line.kind==='unresolved'?'Für diese Position fehlt noch eine gültige Händler- oder Angebotsseite.':line.priceKnown?'Artikel öffnen und den aktuellen Preis sowie die gewünschte Menge im Shop prüfen.':'Gespeicherten Preis und Bestellbarkeit auf der Artikelseite erneut prüfen.'}</p>
    <div class="row handoff-links">${line.links.map(link=>`<a class="btn ${link.kind==='search'?'btn-secondary':'btn-primary'}" data-handoff-link="${esc(link.name)}" data-handoff-kind="${link.kind}" href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${link.kind==='search'?`${esc(link.name)} Angebot auswählen`:link.kind==='reference'?'Teilequelle öffnen':`Artikel bei ${esc(link.name)} öffnen`} ↗</a>`).join('')}${line.partId&&line.productId&&resolvePart(line)?`<button class="btn btn-ghost" data-handoff-part="${esc(`${line.productId}:${line.partId}`)}">Teil & Quellen prüfen</button>`:''}</div></article>`).join('')}
    <div class="handoff-group-footer"><p class="small muted">${group.total!==null?`${money(group.total)} geplanter Quellenbetrag inkl. genanntem Standardversand; kein Zahlungsauftrag.`:'Endbetrag und Versand bleiben offen, bis das Angebot im Shop bestätigt ist.'}</p><button class="btn btn-secondary btn-small" data-copy-handoff-group="${index}">Diese Liste kopieren</button></div></section>`).join('')}
    ${plan.itemCount?`<details class="card handoff-explanation"><summary>Warum liegen die Teile nicht automatisch beim Händler im Warenkorb?</summary><p class="small muted">Unser Warenkorb sammelt passende Teile, Suchnotizen und Mengen. Für eine automatische Übergabe brauchen wir ein konkret ausgewähltes Angebot und eine vom Anbieter unterstützte Anbindung. Teilenummern allein wählen noch keinen Verkäufer, Zustand oder Lieferumfang.</p><p class="small muted">Eigene Zahlungen und ein gemeinsamer Checkout sind in dieser Version nicht aktiv. Bestellung, Bestellbestätigung und Zahlungsabwicklung erfolgen beim jeweiligen Händler. Wir lesen keinen fremden Warenkorb und erkennen keine abgeschlossene Bestellung automatisch.</p></details>`:''}`,'cart');
  byId('handoffBack')?.addEventListener('click',()=>navigate('cart'));
  byId('handoffBrowse')?.addEventListener('click',()=>navigate('parts'));
  const copyPlan=async selected=>{const ok=await copyText(handoffListText(selected));toast(ok?'Einkaufsliste mit Mengen und Links kopiert.':'Kopieren nicht verfügbar. Die Mengen und Links stehen auf dieser Seite.',ok?'success':'error');};
  byId('copyHandoff')?.addEventListener('click',()=>copyPlan(plan));
  document.querySelectorAll('[data-copy-handoff-group]').forEach(b=>b.addEventListener('click',()=>copyPlan({...plan,groups:[plan.groups[Number(b.dataset.copyHandoffGroup)]]})));
  document.querySelectorAll('[data-handoff-part]').forEach(b=>b.addEventListener('click',()=>navigate('part',b.dataset.handoffPart)));
}

const SERVICE_MODULE=`./services-v${APP_VERSION}.js`;
let servicesPromise;
function loadServices(){
 if(!servicesPromise)servicesPromise=import(SERVICE_MODULE).catch(error=>{servicesPromise=null;throw error;});
 return servicesPromise;
}
async function workshopPage(arg=''){
 const [productId,jobId]=String(arg||'').split(':');
 const product=products.find(p=>p.id===productId),job=product?.jobs?.find(j=>j.id===jobId);
 if((productId&&!product)||(jobId&&!job)){notFound();return;}
 shell(`<button class="btn btn-ghost" id="serviceBack">← Zurück</button><div class="eyebrow">Reparieren lassen</div><h2>Staubsauger-Reparatur</h2><div id="serviceContent" role="status">Servicequellen werden geladen …</div>`,'home');
 byId('serviceBack').addEventListener('click',()=>navigate(product?'product':'home',product?.id||''));
 const version=renderVersion;
 try{
  const {repairsFor,servicesReviewedAt}=await loadServices();if(version!==renderVersion)return;
  const providers=repairsFor(product),request=repairRequestText(product,job,boschContext.get(product));
  byId('serviceContent').innerHTML=`${product?`<p>Für <b>${esc(product.brand)} ${esc(product.model)}</b>${job?` · ${esc(job.label)}`:''}.</p>`:'<p class="muted">Hersteller-Service für Miele, Bosch, Dyson und AEG Staubsauger.</p>'}
   <div class="section-head"><div class="section-title">Hersteller-Service</div><span class="small muted">Quellen geprüft: ${esc(servicesReviewedAt)}</span></div>
   ${providers.length?providers.map(p=>`<article class="card"><h3>${esc(p.name)}</h3><p>${esc(p.summary)}</p><p class="small">${esc(p.requirements)}</p><p class="small muted">${esc(p.priceNote)}</p><div class="row wrap"><a class="btn btn-primary" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Reparatur beim Hersteller klären ↗</a><a class="btn btn-secondary" href="tel:${esc(p.phone)}">Service anrufen</a></div></article>`).join(''):'<div class="notice warn">Für dieses Gerät liegt hier noch keine belegte Staubsauger-Reparaturquelle vor.</div>'}
   <section class="card"><h3>Anfrage vorbereiten</h3><pre class="service-request">${esc(request)}</pre><button class="btn btn-secondary" id="copyRepair">Anfragetext kopieren</button><p class="small muted">Du entscheidest selbst, wem du ihn sendest. Termin, Reparaturdauer, Fremdteile und Endpreis werden vom Betrieb bestätigt.</p></section>
   ${!product||product.category==='vacuum'?`<section class="card"><h3>Lokalen Staubsauger-Service suchen</h3><p class="small muted">Externe Kartensuche nach Staubsauger-Reparatur und Elektrogeräte-Kundendienst. Ergebnisse sind keine geprüften Partner; Staubsauger-Service und Markenannahme beim Betrieb bestätigen. Eine Suche garantiert weder Entfernung noch Verfügbarkeit.</p><form id="repairPlaceForm" class="searchbar"><input id="repairPlace" aria-label="Ort oder PLZ" placeholder="Ort oder PLZ" maxlength="100" required><button class="btn btn-secondary">Kartensuche öffnen ↗</button></form><p class="small muted">Ort wird erst nach deiner Aktion an Google Maps übergeben und hier nicht gespeichert.</p><p id="repairSearchStatus" role="status"></p></section>`:''}`;
  byId('copyRepair')?.addEventListener('click',async()=>toast(await copyText(request)?'Anfragetext kopiert.':'Kopieren nicht verfügbar; Text oben auswählen.'));
  byId('repairPlaceForm')?.addEventListener('submit',event=>{event.preventDefault();const url=repairSearchUrl({brand:product?.brand,place:byId('repairPlace').value});if(!url){byId('repairSearchStatus').textContent='Bitte einen Ort oder eine PLZ mit 2–100 Zeichen eingeben.';return;}window.open(url,'_blank','noopener,noreferrer');});
 }catch{if(version!==renderVersion)return;byId('serviceContent').innerHTML='<div class="notice warn">Servicequellen sind noch nicht auf diesem Gerät geladen. Online erneut versuchen.</div><button class="btn btn-secondary" id="retryServices">Erneut laden</button>';byId('retryServices').addEventListener('click',()=>workshopPage(arg));}
}
async function rentalPage(productId=''){
 const product=products.find(p=>p.id===productId);
 if(productId&&!product){notFound();return;}
 shell(`<button class="btn btn-ghost" id="rentalBack">← Zurück</button><div class="eyebrow">Mieten statt kaufen</div><h2>Reinigungsgerät mieten</h2><div id="rentalContent" role="status">Mietquellen werden geladen …</div>`,'home');
 byId('rentalBack').addEventListener('click',()=>navigate(product?'product':'home',product?.id||''));const version=renderVersion;
 try{
  const {rentalsFor,servicesReviewedAt}=await loadServices();if(version!==renderVersion)return;
  const providers=rentalsFor(product);
  byId('rentalContent').innerHTML=`${product?`<div class="notice info">Dein Gerät: <b>${esc(product.brand)} ${esc(product.model)}</b>. Für genau dieses Modell ist hier kein Miet- oder Testangebot belegt. Die folgenden Angebote betreffen andere Reinigungsgeräte.</div>`:''}<p class="muted">Mietangebote für einzelne Aufgaben. Probieren vor dem Kauf eines konkreten Haushaltsstaubsaugers muss ein Händler gesondert bestätigen.</p>
   ${providers.map(p=>`<article class="card"><span class="pill pill-info">Mietgerät · Anbieterquelle</span><h3>${esc(p.device)}</h3><p>${esc(p.name)} · ${esc(p.purpose)}</p><div class="identifier-grid">${p.rates.map(rate=>`<div class="identifier"><span>${esc(rate.label)}</span><strong>${money(rate.amount)}</strong></div>`).join('')}<div class="identifier"><span>Kaution</span><strong>${money(p.deposit)}</strong></div></div><p class="small muted">Preisstand ${esc(servicesReviewedAt)}. ${esc(p.priceNote)}</p><p>${esc(p.availability)}</p><a class="btn btn-primary" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Miete & Markt beim Anbieter prüfen ↗</a></article>`).join('')||'<div class="notice warn">Für diese Gerätekategorie liegt kein Mietangebot vor.</div>'}
   <p class="small muted">Reservieren, Vertrag und Zahlung erfolgen beim Anbieter. Zubehör, Transport und Rückgabe vorher klären.</p>`;
 }catch{if(version!==renderVersion)return;byId('rentalContent').innerHTML='<div class="notice warn">Mietquellen sind noch nicht geladen. Online erneut versuchen.</div><button class="btn btn-secondary" id="retryRentals">Erneut laden</button>';byId('retryRentals').addEventListener('click',()=>rentalPage(productId));}
}

function contactPage(){
  shell(`<button class="btn btn-ghost" id="contactBack">← Mehr</button><div class="eyebrow">Gemeinsam weiterentwickeln</div><h2>Kontakt & Feedback</h2><p class="muted">Ideen, Tipps und Kommentare sind willkommen. Sag uns, welches Gerät oder Teil fehlt, was unklar ist oder was wir verbessern können.</p>
    <section class="card"><h3>Was wir vorhaben</h3><p>Heute: Staubsauger für den deutschen Markt. Unser Ziel: verlässliche Ersatzteilsuche für weitere Geräte und internationale Märkte.</p><div class="row wrap"><a class="btn btn-secondary" href="${esc(communityLinks.roadmapDe)}" target="_blank" rel="noopener noreferrer">Roadmap · Deutsch ↗</a><a class="btn btn-secondary" href="${esc(communityLinks.roadmapEn)}" target="_blank" rel="noopener noreferrer">Roadmap · English ↗</a><a class="btn btn-ghost" href="${esc(communityLinks.patchnotes)}" target="_blank" rel="noopener noreferrer">Patchnotes ↗</a></div></section>
    <form class="card" id="feedbackForm"><h3>Deinen Beitrag vorbereiten</h3><label class="field-label" for="feedbackTopic">Worum geht es?</label><select class="text-input" id="feedbackTopic">${feedbackTopics.map(([value,label])=>`<option value="${value}">${esc(label)}</option>`).join('')}</select><label class="field-label" for="feedbackModel">Gerät oder Teil · optional</label><input class="text-input" id="feedbackModel" maxlength="120" autocomplete="off" placeholder="z. B. Marke, Modellkennung oder Teilenummer"><label class="field-label" for="feedbackMessage">Deine Nachricht</label><textarea class="textarea" id="feedbackMessage" rows="5" maxlength="1200" required placeholder="Was möchtest du vorschlagen oder melden? Eine Quellenadresse hilft bei Katalogkorrekturen."></textarea><p class="small muted">Für öffentliche Beiträge bitte keine Seriennummern, Adressen, Zugangsdaten oder anderen persönlichen Angaben eintragen.</p><button class="btn btn-primary" type="submit">Entwurf vorbereiten</button></form>
    <section class="card hidden" id="feedbackPreview" aria-live="polite"><h3>Entwurf prüfen</h3><pre class="service-request" id="feedbackText"></pre><p class="small muted">Auf GitHub kannst du den Entwurf bearbeiten und selbst veröffentlichen. Dafür brauchst du ein GitHub-Konto. Der Beitrag und Kommentare sind öffentlich.</p><div class="row wrap"><a class="btn btn-primary" id="feedbackGitHub" target="_blank" rel="noopener noreferrer">GitHub-Entwurf öffnen ↗</a><button class="btn btn-secondary" id="feedbackCopy" type="button">Text kopieren</button>${supportEmail?'<a class="btn btn-secondary" id="feedbackEmail">E-Mail-Entwurf öffnen</a>':''}</div><p class="small muted" id="feedbackStatus" role="status"></p></section>
    ${supportEmail?'':'<section class="card"><h3>E-Mail-Kontakt</h3><p class="muted">Ein eigenes Supportpostfach folgt. Aktuell kannst du Feedback über GitHub teilen; das Formular sendet keine E-Mail.</p></section>'}
    <section class="card"><h3>Andere Ideen entdecken</h3><p class="muted">Schau dir vorhandene Vorschläge an und ergänze deine Erfahrungen in den Kommentaren.</p><a class="btn btn-secondary" href="${esc(communityLinks.issues)}" target="_blank" rel="noopener noreferrer">Beiträge & Kommentare auf GitHub ↗</a></section>`,'settings');
  let draft=null;
  byId('contactBack')?.addEventListener('click',()=>navigate('settings'));
  byId('feedbackForm')?.addEventListener('input',()=>{draft=null;byId('feedbackPreview').classList.add('hidden');byId('feedbackGitHub').removeAttribute('href');});
  byId('feedbackForm')?.addEventListener('submit',event=>{
    event.preventDefault();
    draft=feedbackDraft({topic:byId('feedbackTopic').value,model:byId('feedbackModel').value,message:byId('feedbackMessage').value,version:APP_VERSION});
    if(!draft){byId('feedbackMessage').focus();toast('Bitte eine Nachricht eintragen.');return;}
    byId('feedbackText').textContent=draft.text;byId('feedbackGitHub').href=draft.issueUrl;
    const mail=feedbackMailUrl(draft);if(mail&&byId('feedbackEmail'))byId('feedbackEmail').href=mail;
    byId('feedbackStatus').textContent='Entwurf vorbereitet. Dein Beitrag wurde noch nicht veröffentlicht.';
    byId('feedbackPreview').classList.remove('hidden');
  });
  byId('feedbackCopy')?.addEventListener('click',async()=>{if(!draft)return;const ok=await copyText(draft.text);byId('feedbackStatus').textContent=ok?'Text kopiert. Dein Beitrag wurde noch nicht veröffentlicht.':'Kopieren nicht möglich. Du kannst den Entwurf oben markieren und kopieren.';});
}

function helpPage(){
  shell(`<button class="btn btn-ghost" id="back">← Mehr</button><div class="eyebrow">Hilfe-Center</div><h2>FAQ</h2><p class="muted">Kurze Antworten auf die wichtigsten Fragen. Ideen und Datenfehler kannst du im Kontaktbereich als Beitrag vorbereiten.</p><input class="text-input" id="faqSearch" placeholder="FAQ durchsuchen …"><div id="faqList" class="faq-list"></div><div class="section-head"><div class="section-title">Etwas stimmt nicht?</div></div><section class="card"><div class="setting-row"><div><b>Datenfehler melden</b><div class="small muted">Falsches Gerät, Fitment, Preis oder Verfügbarkeit.</div></div><button class="btn btn-secondary btn-small" id="faqReport">Kontakt & Feedback öffnen</button></div></section>`,'settings');
  const draw=()=>{const q=String(byId('faqSearch')?.value||'').toLowerCase();const list=faqItems.filter(([a,b])=>!q||`${a} ${b}`.toLowerCase().includes(q));byId('faqList').innerHTML=list.map(([q,a])=>`<details class="card faq-item"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')||'<div class="empty-state card"><p class="muted">Keine passende FAQ gefunden.</p></div>';};
  draw();byId('faqSearch')?.addEventListener('input',draw);byId('back')?.addEventListener('click',()=>navigate('settings'));byId('faqReport')?.addEventListener('click',()=>navigate('contact'));
}

function accessPage(){
  const user=pilot.user;
  if(readinessState.userId!==user?.id){readinessState.accessResult={status:'not_checked'};readinessState.userId=user?.id||null;}
  const connection=readinessState.healthResult,health=connection?.status==='checked'?connection.health:null,access=readinessState.accessResult;
  const permissionLabel=!user?'Anmeldung nötig':access.status==='pilot_allowed'?'Freigeschaltet':access.status==='pilot_access_required'?'Freigabe fehlt':access.status==='not_checked'?'Noch nicht geprüft':'Prüfung nicht bestätigt';
  const providerLabel=name=>!health?'Noch nicht geprüft':health.providers[name]==='configured'?'Zugang eingerichtet':'Zugang noch offen';
  const report=readinessReport({appVersion:APP_VERSION,healthResult:connection,accessResult:access,loggedIn:!!user});
  const connectionText=!connection?'Noch nicht geprüft':connection.status==='checked'?'Server erreichbar':connection.status==='unsupported'?'Versionsantwort prüfen':'Verbindung nicht bestätigt';
  shell(`<button class="btn btn-ghost" id="accessBack">← Konto</button><div class="eyebrow">Pilotzugang · v${APP_VERSION}</div><h2>Was ist schon nutzbar?</h2>
    <p class="muted">Katalog, Geräte, Sicherung und Einkaufsplan kannst du als Gast nutzen. Für Händlerangebote prüfen wir Anmeldung, Pilotfreigabe und den jeweiligen Anbieterzugang getrennt.</p>
    <section class="card access-check"><h3>Verbindung & Zugang prüfen</h3><p class="small muted">Diese Prüfung ruft keine Händlerangebote ab und verbraucht kein Suchkontingent. Ohne Anmeldung prüfen wir nur den öffentlichen Serverstatus.</p><button class="btn btn-primary" id="checkReadiness">${user?'Meinen Pilotzugang prüfen':'Verbindung prüfen'}</button><p id="readinessMessage" role="status" aria-live="polite"></p>${connection?.checkedAt?`<p class="small muted">Zuletzt geprüft: ${esc(new Date(connection.checkedAt).toLocaleString('de-DE'))}. Das ist eine Momentaufnahme.</p>`:''}</section>
    <div class="access-grid">
      <section class="card"><h3>1 · Verbindung</h3><span class="pill ${health?'pill-ok':'pill-warn'}">${esc(connectionText)}</span>${health?`<p class="small muted">${health.partCount} Katalogteile erreichbar. Die serverseitigen Startprüfungen für Freigabe und Kontingent sind ${health.pilotBackendVerifiedAtStartup&&health.quotaBackendVerifiedAtStartup?'bestätigt':'noch nicht vollständig bestätigt'}.</p>`:'<p class="small muted">Prüfe online erneut. Der gespeicherte Katalog bleibt unabhängig davon nutzbar.</p>'}</section>
      <section class="card"><h3>2 · Dein Pilotzugang</h3><span class="pill ${user&&access.status==='pilot_allowed'?'pill-ok':'pill-warn'}">${esc(permissionLabel)}</span><p class="small muted">${!user?'Melde dich mit einem bereits eingerichteten Pilotkonto an.':access.status==='pilot_allowed'?'Die Freigabe wurde für dein angemeldetes Konto bestätigt. Jede Angebotssuche prüft sie erneut.':access.status==='pilot_access_required'?'Dein Konto benötigt eine befristete Freigabe durch den Betreiber. Du kannst dich nicht selbst freischalten.':access.status==='pilot_unavailable'?'Die Freigabeprüfung ist gerade nicht erreichbar. Daraus folgt keine Ablehnung deines Kontos.':access.status==='auth_required'?'Die Anmeldung ist abgelaufen. Bitte erneut anmelden.':'Starte die Prüfung, um Anmeldung und Freigabe bestätigen zu lassen.'}</p><button class="btn btn-secondary" id="readinessAccount">${user?'Konto öffnen':'Zur Pilotanmeldung'}</button></section>
      <section class="card"><h3>3 · eBay-Angebote</h3><span class="pill ${health?.providers.ebay==='configured'?'pill-info':'pill-warn'}">${esc(providerLabel('ebay'))}</span><p class="small muted">${health?.providers.ebay==='configured'?'Der Server meldet einen eingerichteten Zugang. Angebot, Zustand und Teileidentität werden erst bei der Suche geprüft.':'Die normale eBay-Teilesuche bleibt über einen externen Suchlink möglich. Live-Angebote brauchen einen eingerichteten Anbieterzugang.'}</p></section>
      <section class="card"><h3>4 · Amazon-Angebote</h3><span class="pill ${health?.providers.amazon==='configured'?'pill-info':'pill-warn'}">${esc(providerLabel('amazon'))}</span><p class="small muted">${health?.providers.amazon==='configured'?'Der Server meldet einen eingerichteten Zugang. Die aktuelle Antwort wird erst bei einer konkreten Teilesuche geprüft.':'Amazon-Suchlinks bleiben nutzbar. Für Angebote in der App fehlt noch der freigeschaltete Anbieterzugang.'}</p></section>
    </div>
    <section class="card"><h3>Was du jetzt tun kannst</h3><div class="row wrap"><button class="btn btn-secondary" id="readinessParts">Teile suchen</button><button class="btn btn-secondary" id="readinessBackup">Lokale Sicherung</button></div><p class="small muted">Geräte und Warenkorb bleiben lokal. Eine Anmeldung aktiviert keine Cloud-Synchronisation. Bestellen und bezahlen erfolgt beim jeweiligen Händler.</p></section>
    <details class="card"><summary>Diagnosebericht ansehen</summary><p class="small muted">Zum Weitergeben nach deiner eigenen Entscheidung. Enthält keine E-Mail, Geräte-/Seriennummern, Passwörter oder Tokens.</p><pre class="readiness-report">${esc(report)}</pre><button class="btn btn-secondary" id="copyReadiness">Diagnosebericht kopieren</button></details>`,'settings');
  byId('accessBack')?.addEventListener('click',()=>navigate('account'));
  byId('readinessAccount')?.addEventListener('click',()=>navigate('account'));
  byId('readinessParts')?.addEventListener('click',()=>navigate('parts'));
  byId('readinessBackup')?.addEventListener('click',()=>navigate('backup'));
  byId('copyReadiness')?.addEventListener('click',async()=>{const ok=await copyText(report);toast(ok?'Diagnosebericht kopiert.':'Kopieren nicht verfügbar. Du kannst den Bericht auf dieser Seite lesen.',ok?'success':'error');});
  byId('checkReadiness')?.addEventListener('click',async()=>{
    const button=byId('checkReadiness'),message=byId('readinessMessage'),version=renderVersion,id=pilot.user?.id||null;
    button.disabled=true;message.textContent='Verbindung und Zugangsstatus werden geprüft …';
    readinessController?.abort();const controller=new AbortController();readinessController=controller;
    const [healthResult,accessResult]=await Promise.all([checkPilotHealth({signal:controller.signal}),id?pilot.checkAccess({signal:controller.signal}):Promise.resolve({status:'auth_required'})]);
    if(version!==renderVersion||controller.signal.aborted)return;
    if(id!==(pilot.user?.id||null)){
      readinessState.healthResult=healthResult;readinessState.accessResult={status:'not_checked'};readinessState.userId=pilot.user?.id||null;
      accessPage();byId('readinessMessage').textContent='Die Anmeldung ist nicht mehr bestätigt. Bitte erneut anmelden.';return;
    }
    readinessState.healthResult=healthResult;readinessState.accessResult=accessResult;readinessState.userId=id;
    accessPage();
    byId('readinessMessage').textContent=healthResult.status==='checked'?'Prüfung abgeschlossen. Die einzelnen Schritte stehen unten.':'Die Verbindung konnte nicht bestätigt werden. Bitte online erneut versuchen.';
  });
}

function accountPage(){
  const user=pilot.user;
  shell(`<button class="btn btn-ghost" id="back">← Mehr</button><div class="eyebrow">Konto</div><h2>${user?'Pilotkonto angemeldet':'Gastmodus & Pilotanmeldung'}</h2>
    <section class="card account-card"><h3>Deine Geräte und dein Warenkorb</h3><p class="muted">Sie bleiben in diesem Browser gespeichert. Die Pilotanmeldung aktiviert keine Synchronisation und kein Cloud-Backup. Du kannst lokale Sicherungen auch als Gast verwenden.</p><button class="btn btn-secondary" id="accountBackup">Sicherung & Wiederherstellung</button></section>
    <section class="card"><h3>Pilot-Angebotssuche</h3><p class="muted">Nur für bereits eingerichtete Pilotkonten. Eine befristete Pilotfreigabe und ein eingerichteter Anbieterzugang werden zusätzlich benötigt.</p>
    ${user?`<p>Angemeldet als <b>${esc(user.email||'Pilotnutzer')}</b></p><button class="btn btn-secondary" id="pilotLogout">Abmelden</button>`:`<form id="pilotLogin"><label class="field-label" for="pilotEmail">E-Mail</label><input class="text-input" id="pilotEmail" type="email" autocomplete="username" required maxlength="254"><label class="field-label" for="pilotPassword">Passwort</label><input class="text-input" id="pilotPassword" type="password" autocomplete="current-password" required maxlength="256"><p class="small muted">Die Anmeldung gilt bis zum Schließen oder Neuladen dieser Seite. Zugangsdaten nur hier eingeben.</p><div class="row wrap"><button class="btn btn-primary" id="pilotSubmit" type="submit">Mit Pilotkonto anmelden</button><button class="btn btn-secondary hidden" id="pilotCancel" type="button">Anmeldung abbrechen</button></div></form><p class="small muted">Dein erstes Pilotkonto wird separat vom Betreiber eingerichtet und bestätigt. Öffentliche Registrierung, Passwort-Zurücksetzen und E-Mail-Links sind noch nicht verfügbar. Du kannst die App weiterhin als Gast nutzen.</p>`}
    <p id="pilotLoginMessage" role="status" aria-live="polite"></p></section>
    <section class="card"><h3>Verbindung, Pilotfreigabe & Händlerzugänge</h3><p class="muted">Prüfe den aktuellen Stand, ohne Angebote abzurufen oder Suchkontingent zu verbrauchen.</p><button class="btn btn-primary" id="accountReadiness">Zugangsstatus prüfen</button></section>`,'settings');
  byId('back')?.addEventListener('click',()=>navigate('settings'));
  byId('accountBackup')?.addEventListener('click',()=>navigate('backup'));
  byId('accountReadiness')?.addEventListener('click',()=>navigate('access'));
  byId('pilotLogout')?.addEventListener('click',async()=>{const version=renderVersion;readinessState.accessResult={status:'not_checked'};await pilot.signOut();if(version===renderVersion)accountPage();});
  byId('pilotCancel')?.addEventListener('click',()=>{void pilot.signOut();readinessState.accessResult={status:'not_checked'};accountPage();toast('Anmeldung abgebrochen.');});
  byId('pilotLogin')?.addEventListener('submit',async event=>{
    event.preventDefault();const button=byId('pilotSubmit'),message=byId('pilotLoginMessage');
    button.disabled=true;byId('pilotCancel')?.classList.remove('hidden');message.textContent='Anmeldung wird geprüft …';
    const email=byId('pilotEmail').value.trim(),password=byId('pilotPassword').value;byId('pilotPassword').value='';
    const ok=await pilot.signIn(email,password);
    if(!message.isConnected)return;
    if(ok){readinessState.accessResult={status:'not_checked'};accountPage();}else{button.disabled=false;byId('pilotCancel')?.classList.add('hidden');message.textContent='Anmeldung nicht möglich. Zugangsdaten und Verbindung prüfen; es muss ein bestätigtes Pilotkonto sein.';}
  });
}

function downloadBackup(){
  const snapshot=createBackup(exportDemoData(),cartItems(),getPreferences(),readExternalProducts());
  const blob=new Blob([JSON.stringify(snapshot,null,2)],{type:'application/json'});
  if(blob.size>MAX_BACKUP_BYTES){toast('Deine Daten überschreiten die Sicherungsgrenze von 1 MB. Bitte kürze umfangreiche eigene Notizen vor dem Export.','error');return;}
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=`universal-fitment-sicherung-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast('Sicherungsdatei erstellt. Bitte in deinen Dateien aufbewahren.','success');
}
function backupPage(){
  shell(`<button class="btn btn-ghost" id="backupBack">← Mehr</button><div class="eyebrow">Deine lokalen Daten</div><h2>Sicherung & Wiederherstellung</h2>
    <section class="card"><h3>Sicherung als Datei</h3><p class="muted">Gespeicherte Geräte, eigene Notizen, Verlauf, Wartung, Warenkorb und Einstellungen sichern. Bewahre die Datei auf, bevor du Browserdaten löschst oder das Gerät wechselst.</p><p class="small muted">Die Datei enthält deine eingegebenen Geräte- und Seriennummern. Anmeldung und Passwörter sind nicht enthalten. Die Sicherung wird hier ohne Cloud-Upload verarbeitet.</p><button class="btn btn-primary" id="backupExport">Sicherung herunterladen</button></section>
    <section class="card backup-import"><h3>Sicherung wiederherstellen</h3><p class="muted">Wähle eine Universal-Fitment-Sicherung bis 1 MB. Zuerst siehst du eine Vorschau. Deine bisherigen lokalen Daten werden erst nach deiner Bestätigung ersetzt.</p>
      <label class="field-label" for="backupFile">Sicherungsdatei (.json)</label><input class="text-input" id="backupFile" type="file" accept="application/json,.json"><div id="backupReview" aria-live="polite"></div>
      <button class="btn btn-secondary" id="backupApply" disabled>Vorschau prüfen & wiederherstellen</button>
    </section><p class="small muted">Bekannte Kataloggeräte werden mit dem aktuellen Katalog abgeglichen. Unbekannte Zuordnungen werden übersprungen. Geänderte oder nicht belegte Preise bleiben offen; eine alte Sicherung macht Preise nicht aktuell.</p>`,'settings');
  byId('backupBack')?.addEventListener('click',()=>navigate('settings'));
  byId('backupExport')?.addEventListener('click',downloadBackup);
  let reviewed=null,selection=0;
  byId('backupFile')?.addEventListener('change',async event=>{
    const version=++selection,region=byId('backupReview'),apply=byId('backupApply'),file=event.target.files?.[0];
    reviewed=null;apply.disabled=true;region.textContent='';if(!file)return;
    try{
      if(file.size>MAX_BACKUP_BYTES)throw new Error('Die Sicherung darf höchstens 1 MB groß sein.');
      const raw=await file.text();if(version!==selection||!region.isConnected)return;
      const snapshot=JSON.parse(raw),brands=brandsForBackup(snapshot,products);
      if(brands.some(b=>!catalogLoader.isLoaded(b)))region.textContent='Markenkataloge für die Sicherungsprüfung werden geladen …';
      await Promise.all(brands.map(b=>catalogLoader.ensure(b)));
      if(version!==selection||!region.isConnected)return;
      reviewed=reviewBackup(raw);
      const summary=reviewed.summary;
      region.innerHTML=`<div class="notice info"><b>Vorschau:</b> ${summary.devices} gespeicherte${summary.devices===1?'s Gerät':' Geräte'} · ${summary.cartPositions} Warenkorbposition${summary.cartPositions===1?'':'en'} · ${summary.notes} Geräte mit eigenen Notizen.<br>${summary.exportedAt?`Sicherung vom ${esc(new Date(summary.exportedAt).toLocaleString('de-DE'))}`:'Datum der Sicherung offen'}${reviewed.stats.skipped?`<p>${reviewed.stats.skipped} unbekannte oder widersprüchliche Einträge werden übersprungen.</p>`:''}${reviewed.stats.openPrices?`<p>${reviewed.stats.openPrices} Preisangaben stimmen nicht mit der belegten Teilequelle überein und bleiben offen.</p>`:''}</div>`;
      apply.disabled=false;
    }catch(error){if(version!==selection||!region.isConnected)return;region.textContent=error.message||'Diese Datei konnte nicht geprüft werden.';}
  });
  byId('backupApply')?.addEventListener('click',()=>{
    if(!reviewed)return;
    const backup=reviewed;
    showModal({title:'Lokale Daten ersetzen?',confirmLabel:'Diese Sicherung wiederherstellen',cancelLabel:'Abbrechen',danger:true,
      body:`<p>${backup.summary.devices} gespeicherte Geräte und ${backup.summary.cartPositions} Warenkorbpositionen übernehmen?</p><p class="muted">Die bisherigen Geräte, Notizen, Verlauf, Wartungsdaten, Warenkorb und Einstellungen in diesem Browser werden ersetzt. Lade vorher eine Sicherung herunter, wenn du sie behalten möchtest.</p>`,
      onConfirm:close=>{replaceDemoData(backup.data);replaceCart(backup.cart);setPreferences(backup.preferences);writeLocal(EXTERNAL_PRODUCTS_KEY,backup.externalProducts);close();backupPage();toast('Sicherung lokal wiederhergestellt.','success');return false;}
    });
  });
}

function settingsPage(){
  const mode=savedTheme();
  const caps=scannerCapabilities();
  const prefs=getPreferences();
  shell(`
    <div class="eyebrow">Mehr</div><h2>Einstellungen & Hilfe</h2><p class="muted">Konto, App-Verhalten, Datenschutz und Support an einem Ort.</p>
    <div class="settings-menu-grid">
      <button class="card menu-tile tap" id="accountMenu"><span>👤</span><div><b>Konto & Pilotzugang</b><small>Gastmodus, Anmeldung & Zugangsstatus</small></div><i>›</i></button>
      <button class="card menu-tile tap" id="marketplaceMenu"><span>♻</span><div><b>Gebrauchte Teile</b><small>Teilenummern auf eBay & Amazon suchen</small></div><i>›</i></button>
      <button class="card menu-tile tap" id="backupMenu"><span>⇩</span><div><b>Sicherung & Wiederherstellung</b><small>Geräte und Warenkorb als Datei sichern</small></div><i>›</i></button>
      <button class="card menu-tile tap" id="helpMenu"><span>?</span><div><b>FAQ & Hilfe</b><small>Wichtige Fragen, Datenfehler melden</small></div><i>›</i></button>
      <button class="card menu-tile tap" id="contactMenu"><span>✉</span><div><b>Kontakt & Roadmap</b><small>Ideen, Kommentare und unsere nächsten Schritte</small></div><i>›</i></button>
      <button class="card menu-tile tap" id="rentalMenu"><span>🧹</span><div><b>Reinigungsgerät mieten</b><small>Tarife & Anbieter prüfen</small></div><i>›</i></button>
      <button class="card menu-tile tap" id="workshopMenu"><span>🔧</span><div><b>Staubsauger reparieren lassen</b><small>4 Marken · Hersteller-Service & lokale Suche</small></div><i>›</i></button>
    </div>
    <article class="card settings-card"><h3>Darstellung</h3><div class="theme-choice" role="group" aria-label="Darstellung"><button data-theme-choice="light" class="${mode==='light'?'active':''}">☀ Hell</button><button data-theme-choice="dark" class="${mode==='dark'?'active':''}">☾ Dunkel</button><button data-theme-choice="system" class="${mode==='system'?'active':''}">◐ System</button></div></article>
    <article class="card settings-card"><h3>Suche & Markt</h3><div class="settings-form-grid"><label><span>Markt</span><select id="prefMarket"><option value="DE" ${prefs.market==='DE'?'selected':''}>Deutschland</option></select></label><label><span>Währung</span><select id="prefCurrency"><option value="EUR" ${prefs.currency==='EUR'?'selected':''}>EUR</option></select></label><label><span>Suchradius</span><select id="prefRadius">${[5,10,25,50].map(v=>`<option value="${v}" ${Number(prefs.radiusKm)===v?'selected':''}>${v} km</option>`).join('')}</select></label><label><span>Priorität</span><select id="prefDelivery"><option value="value" ${prefs.deliveryPriority==='value'?'selected':''}>Preis/Leistung</option><option value="fast" ${prefs.deliveryPriority==='fast'?'selected':''}>schnell</option><option value="few-packages" ${prefs.deliveryPriority==='few-packages'?'selected':''}>wenige Pakete</option></select></label></div></article>
    <article class="card settings-card"><h3>Bilder & Datenverbrauch</h3><label class="field-label" for="photoMode">Herstellerfotos laden</label><select class="text-input" id="photoMode">${[['details','Nur große Ansichten automatisch'],['on-demand','Alle Katalogfotos erst nach Klick'],['automatic','Auch Listenfotos automatisch']].map(([value,label])=>`<option value="${value}" ${prefs.photos===value?'selected':''}>${label}</option>`).join('')}</select><p class="small muted">Listen zeigen standardmäßig die lokale Staubsauger-Illustration. Große Ansichten laden Herstellerfotos bei Sichtbarkeit; der Sparmodus wartet überall auf deinen Klick. Fotos werden nicht in den App-Offlinecache übernommen. Service- und Mietdaten sowie die Detailpakete für ${esc(optionalCatalogBrands.join(', '))} werden erst beim Öffnen geladen. Modellindex, Miele und Bosch sind im Kern enthalten.</p></article>
    <article class="card settings-card"><h3>Installation & Status</h3><div class="setting-row"><div><b>Web-App installieren</b><div class="small muted">Für einen App-ähnlichen Start vom Home-Bildschirm.</div></div><button class="btn btn-secondary btn-small" id="installApp">${isStandalone()?'Installiert':'Anleitung'}</button></div><div class="setting-row"><div><b>Kamera</b><div class="small muted">${caps.secureContext?'Sichere Verbindung erkannt':'HTTPS für Kamera erforderlich'}.</div></div><span class="pill ${caps.camera?'pill-ok':'pill-warn'}">${caps.camera?'bereit':'nicht verfügbar'}</span></div><div class="setting-row"><div><b>Offline-Shell</b><div class="small muted">Gespeicherte Demo-/Gerätedaten bleiben lokal verfügbar.</div></div><span class="pill pill-ok">aktiv</span></div></article>
    <article class="card settings-card"><h3>Benachrichtigungen</h3><div class="setting-row"><div><b>Smart-Stock-Hinweise</b><div class="small muted">Browserstatus: ${esc(notificationPermissionLabel())}. Hintergrund-Push braucht später Backend.</div></div><button class="btn btn-secondary btn-small" id="enableNotifications">Erlauben / testen</button></div></article>
    <article class="card settings-card"><h3>Datenschutz & lokale Daten</h3><div class="setting-row"><div><b>Lokale Daten exportieren</b><div class="small muted">Geräte, Verlauf, Wartung, Warenkorb-nahe Daten und Einstellungen als JSON.</div></div><button class="btn btn-secondary btn-small" id="exportData">Export</button></div><div class="setting-row"><div><b>Aktueller Kontostatus</b><div class="small muted">${pilot.user?'Pilotkonto angemeldet. Geräte bleiben lokal.':'Kein Konto angemeldet.'}</div></div><span class="pill pill-ok">${pilot.user?'Pilot · lokal':'Gast · lokal'}</span></div><div class="setting-row"><div><b>Lokale Demo-Daten zurücksetzen</b><div class="small muted">Entfernt gespeicherte Geräte, Verlauf, Gerätepass, Werkzeuge und Wartungsdaten.</div></div><button class="btn btn-danger btn-small" id="resetDemo">Zurücksetzen</button></div></article>
    <article class="card settings-card"><h3>Recht & Transparenz</h3><div class="setting-row"><div><b>Datenschutz / Impressum / Nutzungsbedingungen</b><div class="small muted">Vor öffentlichem Launch müssen echte Betreiber- und Unternehmensdaten sowie finale Rechtstexte hinterlegt werden.</div></div><span class="pill pill-warn">Pre-Launch</span></div><div class="setting-row"><div><b>Ranking</b><div class="small muted">Kompatibilität und Qualität haben Vorrang; bezahlte Platzierungen müssen sichtbar gekennzeichnet werden.</div></div><span class="pill pill-ok">transparent</span></div></article>
    <div class="app-meta">Universal Fitment v${APP_VERSION} · ${navigator.onLine?'online':'offline'} · ${isStandalone()?'standalone':'browser'}</div>`,'settings');
  document.querySelectorAll('[data-theme-choice]').forEach(button=>button.addEventListener('click',()=>{setTheme(button.dataset.themeChoice);settingsPage();}));
  byId('accountMenu')?.addEventListener('click',()=>navigate('account'));
  byId('backupMenu')?.addEventListener('click',()=>navigate('backup'));
  byId('helpMenu')?.addEventListener('click',()=>navigate('help'));
  byId('contactMenu')?.addEventListener('click',()=>navigate('contact'));
  byId('marketplaceMenu')?.addEventListener('click',()=>navigate('marketplaces'));
  byId('rentalMenu')?.addEventListener('click',()=>navigate('rentals'));
  byId('workshopMenu')?.addEventListener('click',()=>navigate('workshop'));
  ['prefMarket','prefCurrency','prefRadius','prefDelivery'].forEach(id=>byId(id)?.addEventListener('change',()=>{setPreferences({market:byId('prefMarket')?.value||'DE',currency:byId('prefCurrency')?.value||'EUR',radiusKm:Number(byId('prefRadius')?.value||25),deliveryPriority:byId('prefDelivery')?.value||'value'});toast('Einstellung gespeichert.','success');}));
  byId('photoMode')?.addEventListener('change',()=>{setPreferences({photos:byId('photoMode').value});toast('Bildeinstellung gespeichert.');});
  byId('installApp')?.addEventListener('click',installHelp);
  byId('enableNotifications')?.addEventListener('click',async()=>{const ok=await showLocalNotification('Universal Fitment','Benachrichtigungen sind bereit. Smart Stock kann dich später rechtzeitig an Nachbestellungen erinnern.');if(ok)setTimeout(settingsPage,300);});
  byId('exportData')?.addEventListener('click',downloadBackup);
  byId('resetDemo')?.addEventListener('click',()=>showModal({title:'Lokale Daten zurücksetzen?',confirmLabel:'Zurücksetzen',cancelLabel:'Abbrechen',danger:true,body:'<p class="muted">Gespeicherte Geräte, Verlauf, Gerätepass-, Werkzeug-, Wartungs- und Meldedaten werden gelöscht. Theme und Warenkorb bleiben separat erhalten.</p>',onConfirm:close=>{resetDemoStorage();close();settingsPage();toast('Lokale Daten zurückgesetzt.','success');return false;}}));
}

function notFound(){
  shell(`<div class="empty-state card"><div class="empty-icon">404</div><h2>Seite nicht gefunden</h2><p class="muted">Der Demo-Link ist ungültig oder nicht mehr verfügbar.</p><button class="btn btn-primary" id="homeBtn">Zur Startseite</button></div>`,'home');
  byId('homeBtn')?.addEventListener('click',()=>navigate('home'));
}

function safeDecode(value){ try{return decodeURIComponent(value);}catch{return value;} }
function routeCatalogBrands(routeName,param){
 if(['parts','prices','marketplaces'].includes(routeName)&&!param)return optionalCatalogBrands;
 if(routeName==='catalog-part')return optionalCatalogBrands.filter(brand=>param.startsWith(brand.toLowerCase()+'-part-'));
 const ids=routeName==='compare'?param.split(','):[param.split(':')[0]];
 return [...new Set(ids.map(id=>products.find(p=>p.id===id)?.catalogPack).filter(Boolean))];
}
async function route(){
  cleanupTransientResources();
  catalogLoadErrors=[];
  const hash=location.hash.replace(/^#/,'')||'home';
  const [routeName,...rest]=hash.split('/');
  const param=safeDecode(rest.join('/'));
  const brands=routeCatalogBrands(routeName,param).filter(b=>!catalogLoader.isLoaded(b));
  if(brands.length){
   shell(`<h2>Markenkatalog wird geladen …</h2><p class="muted">${esc(brands.join(' und '))}: Teile, Anleitungen und Quellen werden einmalig geladen. Deine Gerätedaten bleiben lokal.</p>`,'home');
   const version=renderVersion;
   const results=await Promise.allSettled(brands.map(b=>catalogLoader.ensure(b)));
   if(version!==renderVersion)return;
   catalogLoadErrors=brands.filter((b,i)=>results[i].status==='rejected');
   if(catalogLoadErrors.length&&!(['parts','prices','marketplaces'].includes(routeName)&&!param)){shell('<h2>Für dieses Gerät fehlen noch die Markendetails.</h2><p class="muted">Verbinde dich für den ersten Abruf oder öffne einen bereits geladenen Katalog.</p>','home');return;}
  }
  boschContext.retainForRoute(routeName,param,products);
  if(!['plate-review','compare'].includes(routeName))plateState.text='';
  if(routeName==='home') home(param);
  else if(routeName==='coverage') coveragePage();
  else if(routeName==='scan') scanPage();
  else if(routeName==='plate-review') typePlatePage();
  else if(routeName==='compare') comparisonPage(param);
  else if(routeName==='saved') savedPage();
  else if(routeName==='settings') settingsPage();
  else if(routeName==='cart') cartPage();
  else if(routeName==='checkout') handoffPage();
  else if(routeName==='help') helpPage();
  else if(routeName==='contact') contactPage();
  else if(routeName==='account') accountPage();
  else if(routeName==='access') accessPage();
  else if(routeName==='backup') backupPage();
  else if(routeName==='workshop') workshopPage(param);
  else if(routeName==='rentals') rentalPage(param);
  else if(routeName==='recent') recentPage();
  else if(routeName==='product') productPage(param);
  else if(routeName==='external-product') externalProductPage(param);
  else if(routeName==='part') partPage(param);
  else if(routeName==='parts') partsCatalogPage(param);
  else if(routeName==='prices') partsCatalogPage(param,true);
  else if(routeName==='shipping') shippingPage();
  else if(routeName==='marketplaces') marketplacesPage(param);
  else if(routeName==='catalog-part') catalogPartPage(param);
  else if(routeName==='job') jobPage(param);
  else if(routeName==='stock') stockPage(param);
  else if(routeName==='passport') passportPage(param);
  else if(routeName==='issue') issuePage(param);
  else if(routeName==='category') categoryPage(param);
  else notFound();
  document.querySelector('#mainContent')?.focus?.({preventScroll:true});
  window.scrollTo({top:0,behavior:'auto'});
}

applyTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{if(savedTheme()==='system'){applyTheme('system');route();}});
window.addEventListener('hashchange',route);
window.addEventListener('online',()=>{const badge=byId('connectionBadge');if(badge){badge.className='connection-badge status-online';badge.innerHTML='<span class="connection-dot"></span>Online';}toast('Wieder online.','success');});
window.addEventListener('offline',()=>{const badge=byId('connectionBadge');if(badge){badge.className='connection-badge status-offline';badge.innerHTML='<span class="connection-dot"></span>Offline';}toast('Offline-Modus: Demo-Daten bleiben verfügbar.');});
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstallPrompt=event;});
window.addEventListener('pagehide',cleanupTransientResources);
document.addEventListener('visibilitychange',()=>{if(document.hidden){scannerController?.abort();scannerSession?.stop();scannerSession=null;const button=byId('startCamera');if(button)button.disabled=!scannerCapabilities().camera;byId('video')?.classList.add('hidden');byId('cameraPlaceholder')?.classList.remove('hidden');}});
route();
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
