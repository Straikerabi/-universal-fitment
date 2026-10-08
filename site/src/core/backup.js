import {products} from '../data/catalog.js';
import {partIdentity} from '../data/miele-parts.js';
import {quoteForPart} from '../data/miele-commerce.js';
import {marketplaceSearchNote,normalizeCondition} from './marketplaces.js';
import {normalizeCartItems} from './cart.js';
import {normalizePreferences} from './preferences.js';
import {cleanIds,cleanMap} from './local-state.js';

export const MAX_BACKUP_BYTES=1024*1024;
const record=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const text=(v,max=600)=>typeof v==='string'?v.slice(0,max):'';
const timestamp=v=>Number.isFinite(Date.parse(v))?v:null;
const fields=(value,names)=>Object.fromEntries(names.filter(name=>Object.hasOwn(record(value),name)).map(name=>[name,text(value[name])]));
const known=new Map(products.map(p=>[p.id,p]));
const mapsForDevices=(value,convert)=>Object.fromEntries(Object.entries(cleanMap(value)).filter(([id])=>known.has(id)).map(([id,v])=>[id,convert(v,id)]));

export function createBackup(data,cart,preferences,externalProducts={}){
  return {format:'universal-fitment-backup',schemaVersion:3,exportedAt:new Date().toISOString(),
    ...Object.fromEntries(['saved','recent','reports'].map(key=>[key,Array.isArray(data?.[key])?data[key]:[]])),
    ...Object.fromEntries(['deviceMeta','jobSelections','inventory','reminderPrefs','toolInventory','maintenance'].map(key=>[key,record(data?.[key])])),
    cart:Array.isArray(cart)?cart:[],preferences:record(preferences),externalProducts:record(externalProducts)};
}

export function reviewBackup(raw){
  if(typeof raw!=='string'||new TextEncoder().encode(raw).length>MAX_BACKUP_BYTES)throw new Error('Die Sicherung darf höchstens 1 MB groß sein.');
  let input;try{input=JSON.parse(raw);}catch{throw new Error('Diese Datei enthält keine gültige JSON-Sicherung.');}
  if(!input||Array.isArray(input)||typeof input!=='object'||![2,3].includes(input.schemaVersion)||
    (input.schemaVersion===3&&input.format!=='universal-fitment-backup'))throw new Error('Dieses Sicherungsformat wird nicht unterstützt.');
  const stats={skipped:0,openPrices:0};
  if(input.schemaVersion===3){
    const arrays=['saved','recent','reports','cart'],maps=['deviceMeta','jobSelections','inventory','reminderPrefs','toolInventory','maintenance','preferences','externalProducts'];
    if(arrays.some(key=>!Array.isArray(input[key]))||maps.some(key=>!input[key]||typeof input[key]!=='object'||Array.isArray(input[key])))throw new Error('Die Sicherung ist unvollständig oder enthält ungültige Datenbereiche. Es wurden keine Daten übernommen.');
  }
  // External candidates are identity notes, never new catalog products or fitment evidence.
  const externalProducts=Object.fromEntries(Object.entries(cleanMap(input.externalProducts)).slice(0,20).flatMap(([id,v])=>{
    if(!id.startsWith('external-')||!v||typeof v!=='object'||!String(v.brand||'').toLowerCase().includes('miele')){stats.skipped++;return [];}
    const candidate={...fields(v,['id','name','title','brand','model','code','category','source','sourceKey','note','confirmedAt']),id,verifiedCompatibility:false};
    for(const key of ['sourceUrl','imageUrl'])try{const u=new URL(v[key]);if(u.protocol==='https:'&&!u.username&&!u.password)candidate[key]=u.href;}catch{}
    return [[id,candidate]];
  }));
  const ids=values=>cleanIds(values).filter(id=>{const accepted=known.has(id)||Object.hasOwn(externalProducts,id);if(!accepted)stats.skipped++;return accepted;});
  const data={saved:ids(input.saved),recent:ids(input.recent).slice(0,12),reports:[],deviceMeta:mapsForDevices(input.deviceMeta,v=>fields(v,['nickname','serial','notes','updatedAt'])),
    jobSelections:{},inventory:{},reminderPrefs:{},toolInventory:{},maintenance:{},vehicleMeta:{}};
  const jobs=new Map(products.flatMap(p=>(p.jobs||[]).map(job=>[`${p.id}:${job.id}`,new Set(job.items.map(i=>i.id))])));
  for(const [key,value] of Object.entries(cleanMap(input.jobSelections)))if(jobs.has(key))data.jobSelections[key]=cleanIds(value).filter(id=>jobs.get(key).has(id));
  const stockKeys=new Set(products.flatMap(p=>(p.stockPlans||[]).map(plan=>`${p.id}:${plan.id}`)));
  for(const [key,value] of Object.entries(cleanMap(input.inventory)))if(stockKeys.has(key)){
    const v=record(value),next={};
    for(const [name,min,max] of [['stock',0,999],['avgDaysPerUnit',1,365],['leadTimeMinDays',0,180],['leadTimeMaxDays',0,180],['safetyDays',0,365]]){
      if(typeof v[name]==='number'&&Number.isFinite(v[name]))next[name]=Math.max(min,Math.min(max,Math.floor(v[name])));
    }
    data.inventory[key]=next;
  }
  for(const [key,value] of Object.entries(cleanMap(input.reminderPrefs)))if(stockKeys.has(key))data.reminderPrefs[key]={enabled:record(value).enabled===true};
  for(const [key,value] of Object.entries(cleanMap(input.toolInventory)))if(key.length<=120&&['have','missing'].includes(value))data.toolInventory[key]=value;
  data.maintenance=mapsForDevices(input.maintenance,v=>Array.isArray(v)?v.filter(x=>x&&typeof x==='object'&&!Array.isArray(x)).slice(0,100).map(x=>fields(x,['id','label','note','type','createdAt'])):[]);
  data.reports=Array.isArray(input.reports)?input.reports.filter(x=>x&&typeof x==='object'&&!Array.isArray(x)).slice(0,100).map(x=>({...fields(x,['type','reason','note','productId','partId','createdAt']),status:'queued-local'})):[];

  const cart=[];
  const normalizedCart=normalizeCartItems(input.cart);
  stats.skipped+=Math.max(0,(Array.isArray(input.cart)?input.cart.length:0)-normalizedCart.length);
  for(const item of normalizedCart){
    const product=known.get(item.productId),part=product?.parts.find(p=>p.id===item.partId)||product?.candidateParts?.find(p=>p.id===item.partId);
    if(!part||(item.partKey&&item.partKey!==partIdentity(part))){stats.skipped++;continue;}
    if(item.entryType==='marketplace-search'){
      const note=marketplaceSearchNote(part,product,normalizeCondition(item.requestedCondition));
      if(note)cart.push({...note,key:item.key,quantity:item.quantity,addedAt:timestamp(item.addedAt)});
      else stats.skipped++;
      continue;
    }
    const quote=quoteForPart(part),keys=['price','currency','market','vatIncluded','priceBasis','merchantId','shippingRuleId','checkedAt','sourceUrl','stock'];
    const valid=quote&&keys.every(key=>item[key]===quote[key])&&part.fitment?.status!=='variant_check_required'&&item.testData!==true&&(!item.dataMode||item.dataMode==='live');
    const base={key:item.key,productId:product.id,partId:part.id,partKey:partIdentity(part),label:part.name,productLabel:`${product.brand} ${product.model}`,quantity:item.quantity,
      fitment:part.fitment.confidence,fitmentStatus:part.fitment.status,addedAt:timestamp(item.addedAt)};
    if(valid)cart.push({...base,...quote,offerId:`source:${quote.partKey}:${quote.merchantId}`});
    else{stats.openPrices++;cart.push({...base,merchant:'Angebot erneut prüfen',price:null,stock:'unknown',sourceUrl:part.sourceUrl||quote?.sourceUrl||null});}
  }
  const preferences=normalizePreferences(input.preferences);
  return {data,cart,preferences,externalProducts,stats,summary:{devices:new Set([...data.saved,...Object.keys(externalProducts)]).size,cartPositions:cart.length,notes:Object.keys(data.deviceMeta).length,exportedAt:timestamp(input.exportedAt)}};
}
