// Wave9: manual-only typeplate guidance; read-only Consumer snapshot, no OCR or fitment decisions.
import {catalogSnapshot} from '../consumer-repair-mission-poc/catalog-snapshot.mjs';

export const snapshot=catalogSnapshot;
export const dataPolicy=Object.freeze({
  transport:'none', persistence:'none', camera:'none', ocr:'none',
  realFitmentsConfirmed:0, automaticVariantConfirmation:false
});

const hints=Object.freeze({
  Bosch:{
    label:'E-Nr. und Index',
    locate:'Suche nach „E-Nr.“ auf dem Typenschild. Den Zusatz nach dem Schrägstrich (z. B. /01) separat ablesen und nicht weglassen.',
    reminder:'Eine verkürzte Modellbezeichnung ersetzt nicht die vollständige E-Nr. mit Index.'
  },
  Miele:{
    label:'Modell, Typ und Materialnummer',
    locate:'Prüfe Modellname, Gerätetyp und Material-/Artikelnummer getrennt. Gleiche Modellfamilien können unterschiedliche Ausführungen haben.',
    reminder:'Die Materialnummer eines Katalogeintrags ist kein Nachweis für die konkrete Ausführung deines Geräts.'
  },
  Dyson:{
    label:'Produkt-/Modellnummer',
    locate:'Suche nach einer vollständigen Produkt-/Modellnummer und unterscheide sie vom allgemeinen Seriennamen wie V10 oder V15.',
    reminder:'Eine übereinstimmende Generation bestätigt weder Akku- noch Anschlusskompatibilität.'
  },
  Samsung:{
    label:'Vollständiger Modellcode',
    locate:'Übernimm den Modellcode vollständig, einschließlich des Länder-/Ausführungssuffixes nach dem Schrägstrich (falls vorhanden).',
    reminder:'Abweichende Suffixe und nahe Modellcodes gelten nicht automatisch als dieselbe Ausführung.'
  },
  Hoover:{
    label:'Modell und Produktcode',
    locate:'Notiere den vollständigen Modellcode sowie, falls vorhanden, den achtstelligen Produktcode getrennt.',
    reminder:'Modellnamen und Produktcodes können je nach Markt oder Revision auseinanderfallen.'
  }
});
const fallback=Object.freeze({
  label:'Modell- und Typenkennung',
  locate:'Lies Marke, vollständige Modell- oder Typenkennung und mögliche Revisions-/Länderzusätze getrennt ab. Prüfe auch das Handbuch.',
  reminder:'Ähnliche Nummern sind keine identischen Gerätevarianten.'
});
export const guidanceFor=brand=>hints[brand]||fallback;
export const normalize=value=>String(value??'').normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleUpperCase('de-DE');
export function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const observed=(device)=>[device.reference,device.productCode,device.model,...(Array.isArray(device.identifiers)?device.identifiers.map(x=>x.value):[])].filter(x=>typeof x==='string'&&x.trim());
export const brandNames=(snapshotIn=snapshot)=>[...new Set((snapshotIn.devices||[]).map(x=>x.brand).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));

export function findMatches(input,brand='all',snapshotIn=snapshot){
  const q=normalize(input).slice(0,100);
  const list=Array.isArray(snapshotIn?.devices)?snapshotIn.devices:[];
  const permitted=list.filter(d=>brand==='all'||d.brand===brand);
  if(!q)return permitted.map(d=>({device:d,level:'browse',rank:5})).sort(order);
  return permitted.flatMap(device=>{
    const ref=normalize(device.reference),code=normalize(device.productCode);
    const identifiers=Array.isArray(device.identifiers)?device.identifiers.map(x=>normalize(x.value)):[];
    const haystack=observed(device).map(normalize);
    let rank=Infinity,level='possible';
    if(ref&&q===ref){rank=0;level='catalog-reference';}
    else if(code&&q===code){rank=1;level='product-code';}
    else if(identifiers.includes(q)){rank=2;level='identifier';}
    else if(haystack.some(x=>x.startsWith(q))){rank=3;}
    else if(haystack.some(x=>x.includes(q))){rank=4;}
    return Number.isFinite(rank)?[{device,rank,level}]:[];
  }).sort(order);
}
function order(a,b){
 return a.rank-b.rank||String(a.device.brand).localeCompare(String(b.device.brand),'de')||
  String(a.device.model).localeCompare(String(b.device.model),'de')||
  String(a.device.id).localeCompare(String(b.device.id),'de');
}
export function matchMessage(level){
 if(level==='catalog-reference')return 'Katalogreferenz gefunden – eigene Ausführung ungeprüft';
 if(level==='product-code')return 'Produktcode gefunden – Markt/Revision noch prüfen';
 if(level==='identifier')return 'Teilkennung gefunden – vollständige Ausführung offen';
 if(level==='browse')return 'Katalogeintrag – keine persönliche Geräteprüfung';
 return 'Ähnlicher Katalogeintrag – ausdrücklich kein Variantenabgleich';
}
export function identityProfile(device,snapshotIn=snapshot){
 if(!device||!Array.isArray(snapshotIn?.devices)||!snapshotIn.devices.some(x=>x.id===device.id))return null;
 const ids=Array.isArray(device.identifiers)?device.identifiers.filter(x=>x&&typeof x.value==='string'&&x.value):[];
 const parts=Array.isArray(snapshotIn.parts)?snapshotIn.parts:[];
 const candidateIds=Array.isArray(device.candidatePartIds)?device.candidatePartIds:[];
 return Object.freeze({
  id:device.id, brand:device.brand||'Nicht dokumentiert',model:device.model||'Nicht dokumentiert',
  reference:device.reference||'Nicht dokumentiert',
  productCode:device.productCode||null,market:device.market||null,
  identifiers:ids.map(x=>({type:x.type||'unbekannt',value:x.value})),
  variantHint:device.variantHint||null,
  source:device.source||null,
  candidates:candidateIds.map(id=>parts.find(x=>x.id===id)).filter(Boolean).map(part=>({
   id:part.id,name:part.name||'Unbenannter Kandidat',code:part.code||'Offen',
   type:part.assembly||'unbekannt'
  })),
  realFitsConfirmed:0, fitment:'unknown', userVariantVerified:false, purchaseAllowed:false
 });
}
const allowedHosts=Object.freeze({
 Bosch:['www.bosch-home.com'],Miele:['www.miele.de'],Dyson:['www.dyson.de'],
 Samsung:['www.samsung.com'],Hoover:['www.hoover-home.com','service.hoover.co.uk']
});
export function safeSourceUrl(source,brand){
 try{
  if(!source||typeof source.url!=='string')return null;
  const u=new URL(source.url);
  if(u.protocol!=='https:'||u.username||u.password||u.port||!allowedHosts[brand]?.includes(u.hostname))return null;
  return u.href;
 }catch{return null;}
}
export function validatePublicInput(input){
 const q=String(input??'').trim();
 if(q.length>100)return {ok:false,reason:'Maximal 100 Zeichen. Nutze nur eine Geräte-/Typenkennung.'};
 if(/[\r\n]/.test(q))return {ok:false,reason:'Bitte nur eine einzelne Kennung eingeben.'};
 return {ok:true,reason:null};
}
