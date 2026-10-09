// This module is copied locally to site/src/core/catalog-media.js by the importer.
import {catalogMedia} from '../data/catalog-media.js';

const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const pathAllowed=value=>/^\.\/media\/catalog-media-wave3-[a-z0-9-]+\.jpg$/.test(value||'');
const licences=new Set(['CC0-1.0','CC-BY-4.0','CC-BY-SA-4.0']);
export function createMediaLookup(records) {
 const valid=records.filter(row=>row.approval==='approved'&&row.imageIdentityVerified===true&&
  row.rights?.status==='verified'&&row.rights.commercialUse===true&&row.rights.redistribution===true&&
  licences.has(row.rights.license)&&pathAllowed(row.src)&&row.variants?.every(v=>pathAllowed(v.src))&&
  row.alt&&row.rights.attribution&&row.binding?.length&&row.width>0&&row.height>0);
 const ids=new Set();for(const row of valid){if(ids.has(row.entityId))throw Error('Duplicate media entity');ids.add(row.entityId);}
 const byId=new Map(valid.map(row=>[row.entityId,row]));
 return (entity,kind)=>{
  const row=byId.get(entity?.id);
  if(!row||row.kind!==kind||row.brand!==(entity.brand||'Miele'))return null;
  if(kind==='model'&&row.model!==entity.model)return null;
  if(!row.binding.every(id=>(entity.identifiers||[]).some(actual=>actual.type===id.type&&actual.value===id.value)))return null;
  return row;
 };
}
export const approvedMediaFor=createMediaLookup(catalogMedia);
const byMediaId=new Map(catalogMedia.filter(row=>approvedMediaFor({id:row.entityId,brand:row.brand,model:row.model,identifiers:row.binding},row.kind)===row).map(row=>[row.mediaId,row]));
function imageAttributes(media,large) {
 return `src="${escape(media.src)}" srcset="${media.variants.map(v=>`${escape(v.src)} ${v.width}w`).join(', ')}" sizes="${large?'(max-width: 440px) 110px, 220px':'(max-width: 440px) 64px, 88px'}" alt="${escape(media.alt)}" width="${media.width}" height="${media.height}" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-catalog-media-photo data-media-id="${escape(media.mediaId)}"`;
}
export function renderMedia(entity,kind,{large=false,auto=false,fallbackSvg='',type=null}={}) {
 const media=approvedMediaFor(entity,kind),part=kind==='part';
 const classes=part?`part-photo part-type-visual ${large?'part-photo-large':''}`:`product-icon product-photo ${large?'product-photo-large':''}`;
 const fallback=part?`<span class="part-symbol" data-media-fallback role="img" aria-label="Teileart: ${escape(type.label)}">${fallbackSvg}</span>`:
  '<img src="./icons/vacuum.svg" alt="Staubsauger-Illustration" data-media-fallback width="88" height="100" loading="lazy" decoding="async">';
 const button=media&&!auto?`<button type="button" class="photo-load" data-load-photo="${escape(media.src)}" data-media-id="${escape(media.mediaId)}" data-media-entity="${escape(media.entityId)}" aria-label="Produktfoto von ${escape(entity.brand||'Miele')} ${escape(entity.model||entity.name)} laden">Foto laden</button>`:'';
 const photo=media&&auto?`<img ${imageAttributes(media,large)}>`:'';
 const credit=media?`<small class="media-credit">Bild: ${escape(media.rights.attribution)} · <a href="${escape(media.rights.licenseUrl)}" target="_blank" rel="noopener noreferrer">${escape(media.rights.license)}</a> · <a href="${escape(media.sourcePageUrl)}" target="_blank" rel="noopener noreferrer">Quelle</a><span>${part?'Artikelreferenz · OEM-Nummer prüfen':'Modellreferenz · Ausführung prüfen'}</span></small>`:'';
 return `<div class="media-frame ${large?'media-frame-large':''}" data-media-entity="${escape(entity.id)}"><div class="${classes}" ${part?`data-part-type="${escape(type.id)}" style="--part-color:${type.color}"`:''} data-media-state="${photo?'loading':'fallback'}">${fallback}${photo}${button}<span class="media-status" role="status"></span></div>${credit}</div>`;
}
export function loadMedia(button) {
 const media=byMediaId.get(button?.dataset.mediaId);
 if(!media||media.entityId!==button.dataset.mediaEntity||media.src!==button.dataset.loadPhoto||!pathAllowed(media.src))return false;
 const container=button.parentElement;
 if(container.querySelector('[data-catalog-media-photo]'))return false;
 const img=document.createElement('img');
 img.alt=media.alt;img.width=media.width;img.height=media.height;
 img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';
 img.dataset.catalogMediaPhoto='';img.dataset.mediaId=media.mediaId;
 img.sizes='(max-width: 440px) 64px, 220px';
 container.dataset.mediaState='loading';container.append(img);
 img.srcset=media.variants.map(v=>`${v.src} ${v.width}w`).join(', ');img.src=media.src;
 button.remove();return true;
}
export function mediaLoaded(img) {
 if(!img?.matches?.('[data-catalog-media-photo]'))return;
 const box=img.parentElement;box.dataset.mediaState='loaded';
 const fallback=box.querySelector('[data-media-fallback]');if(fallback)fallback.hidden=true;
 box.querySelector('.media-status').textContent='';
}
export function mediaFailed(img) {
 if(!img?.matches?.('[data-catalog-media-photo]'))return;
 const box=img.parentElement;img.remove();box.dataset.mediaState='fallback';
 const fallback=box.querySelector('[data-media-fallback]');if(fallback)fallback.hidden=false;
 box.querySelector('.media-status').textContent='Produktfoto nicht verfügbar; Illustration wird angezeigt.';
}
