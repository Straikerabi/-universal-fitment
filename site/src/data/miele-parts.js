import { mieleSpareRecords } from './miele-spare-records.js';
import { mieleAftermarketRecords } from './miele-aftermarket.js';
import { partType, partPurpose, partPurposes } from './part-taxonomy.js';

export const mieleSpareCatalogUrl='https://www.miele.de/category/1287097/ersatzteile-staubsauger';
const stamp='2026-10-06';
const source=(name,url,note,type='manufacturer')=>({name,url,note,type,grade:type==='manufacturer'?'A':'B',retrievedAt:stamp,license:'source-linked'});
const normalize=value=>String(value||'').toLowerCase().normalize('NFKD').replace(/\p{M}/gu,'').replace(/ß/g,'ss').replace(/[^a-z0-9]/g,'');

export function partCategory(part){
  return partType(part).label;
}

export function partIdentity(part){
  const code=part.identifiers?.find(i=>i.type===(part.tier==='aftermarket'?'supplier-article':'material-number'))?.value;
  const alternate=part.identifiers?.find(i=>['manufacturer-article','manufacturer-designation'].includes(i.type))?.value;
  const prefix=part.brand&&part.brand!=='Miele'&&part.tier==='oem'?`${part.brand}:`:'';
  return code||alternate?`${part.tier}:${prefix}${code||alternate}`:part.id;
}

export const partBrands=part=>part.targetBrands||[part.brand||'Miele'];

export function scopeMatchesProduct(scope={},product){
  const meta=product.vacuumMeta||{};
  if(scope.bagSystems?.length&&!scope.bagSystems.includes(meta.bagSystem)) return false;
  const type=product.identifiers?.find(i=>i.type==='product-type')?.value||'';
  return !!(scope.series?.includes(meta.series)||scope.models?.some(m=>normalize(m)===normalize(product.model))||scope.typeCodes?.includes(type)||scope.typePrefixes?.some(prefix=>type.startsWith(prefix))||scope.deviceTypes?.includes(meta.deviceType));
}

export const mieleOriginalSpareParts=mieleSpareRecords.map(record=>({
  id:`miele-part-${record.material}`,name:`Miele ${record.name}`,kind:'Original-Ersatzteil',tier:'oem',catalogOrigin:'miele-spares',
  imageUrl:record.imageUrl,sourceUrl:record.url,description:record.description,features:record.features,manuals:record.manuals,
  scope:record.scope,restrictions:record.restrictions,
  identifiers:[{type:'material-number',value:record.material},...(record.ean?[{type:'ean',value:record.ean}]:[])],
  fitment:{status:'catalog_only',confidence:0,evidence:[source(`Miele · ${record.name}`,record.url,'Originalteil im öffentlichen Miele-Katalog. Die dort genannten Serien, Typen und Einschränkungen sind unten angegeben; ein Katalogeintrag allein bestätigt kein konkretes Gerät.')]},offers:[]
}));

export const mieleAftermarketParts=mieleAftermarketRecords.map(record=>({
  id:`aftermarket-${record.brand.toLowerCase()}-${record.code}`,name:`${record.brand} ${record.name}`,kind:record.kind,tier:'aftermarket',catalogOrigin:'aftermarket',
  sourceUrl:record.url,scope:record.scope,replaces:record.replaces,manuals:record.manuals,excludeHandleControl:record.excludeHandleControl,
  identifiers:[{type:'supplier-article',value:record.code},...(record.ean?[{type:'ean',value:record.ean}]:[])],
  fitment:{status:'supplier_listed',confidence:.86,evidence:[source(`${record.brand} · ${record.code}`,record.url,record.note,record.sourceType==='seller'?'seller':'aftermarket-manufacturer')]},offers:[]
}));

function originalCondition(part,product){
  const restriction=(part.restrictions||[]).join(' ');
  // A nozzle-specific replacement may be mapped only when the device lists that nozzle.
  const nozzle=part.name.match(/SBD\d+(?:-\d)?/)?.[0];
  if(nozzle&&product.equipment?.some(item=>normalize(item).includes(normalize(nozzle)))) return restriction.replace('Passt zur genannten Bodendüse. Die Düse am eigenen Gerät muss dieselbe SBD-Nummer tragen.','').trim();
  return restriction;
}

export function extendMieleProduct(product){
  const parts=[...product.parts];
  const candidates=[];
  for(const part of mieleOriginalSpareParts){
    if(!scopeMatchesProduct(part.scope,product)) continue;
    const condition=originalCondition(part,product);
    const mapped={...part,fitment:{...part.fitment,status:condition?'variant_check_required':'manufacturer_family_listed',confidence:condition ? .74 : .95,condition:condition||'Miele nennt die Serie bzw. den Gerätetyp. Materialnummer und vorhandene Ausführung vor Auswahl vergleichen.'}};
    if(condition)candidates.push(mapped);
    else if(!parts.some(p=>partIdentity(p)===partIdentity(mapped)))parts.push(mapped);
  }
  for(const part of mieleAftermarketParts){
    if(!scopeMatchesProduct(part.scope,product)) continue;
    const control=product.controlType||'';
    if(part.excludeHandleControl&&/handgriff|funk/i.test(control))continue;
    const condition=part.excludeHandleControl?'Mechanischer Schlauch: Anschlüsse und Griffausführung am eigenen Gerät prüfen.':'Anbieter nennt die Serie bzw. das Modell. Originalnummer, Anschlüsse und Ausführung am eigenen Gerät vergleichen.';
    if(!parts.some(p=>partIdentity(p)===partIdentity(part)))parts.push({...part,fitment:{...part.fitment,condition}});
  }
  return {...product,parts,candidateParts:candidates,accessoryAliases:parts.flatMap(p=>[p.name,...p.identifiers.map(i=>i.value)])};
}

export function collectMieleParts(products){
  const map=new Map([...mieleOriginalSpareParts,...mieleAftermarketParts].map(p=>[partIdentity(p),{...p,modelIds:[],candidateModelIds:[]}])) ;
  for(const product of products){
    for(const [key,list] of [['modelIds',product.parts],['candidateModelIds',product.candidateParts||[]]]){
      for(const part of list){
        const id=partIdentity(part);
        const material=part.identifiers?.find(i=>i.type==='material-number')?.value;
        if(!map.has(id))map.set(id,{...part,sourceUrl:part.sourceUrl||part.fitment.evidence.find(e=>material&&e.url?.includes(`/product/${material}/`))?.url,modelIds:[],candidateModelIds:[]});
        const entry=map.get(id);
        if(!entry[key].includes(product.id))entry[key].push(product.id);
      }
    }
  }
  return [...map.values()].map(p=>({...p,partCategory:partCategory(p)}));
}

export function filterParts(parts,{query='',brand='all',tier='all',category='all',purpose='all',series='all'}={},products=[]){
  const q=normalize(query);
  const queryTokens=String(query||'').split(/\s+/).map(normalize).filter(Boolean);
  const code=q.replace(/\s/g,'').replace(/^0+/,'');
  return parts.filter(part=>{
    if(brand!=='all'&&!partBrands(part).includes(brand))return false;
    if(tier!=='all'&&part.tier!==tier)return false;
    if(category!=='all'&&partCategory(part)!==category)return false;
    if(purpose!=='all'&&partPurpose(part).id!==purpose)return false;
    if(series!=='all'&&!part.scope?.series?.includes(series)&&![...(part.modelIds||[]),...(part.candidateModelIds||[])].some(id=>products.find(p=>p.id===id)?.vacuumMeta?.series===series))return false;
    if(!q)return true;
    const hay=normalize([part.name,part.kind,partCategory(part),partPurpose(part).label,...(part.identifiers||[]).map(i=>i.value),...(part.replaces||[]),...(part.scope?.series||[]),...(part.features||[])].join(' '));
    const exactCode=code.length>=7&&(part.identifiers||[]).some(i=>normalize(i.value).replace(/\s/g,'').replace(/^0+/,'')===code);
    if(/^\d{7,}$/.test(code))return exactCode;
    return exactCode||hay.includes(q)||queryTokens.every(token=>hay.includes(token));
  });
}

export function partFilterOptions(parts,products,brand='all'){
  const scoped=filterParts(parts,{brand});
  const byId=new Map(products.filter(p=>brand==='all'||p.brand===brand).map(p=>[p.id,p]));
  const series=scoped.flatMap(part=>[...(part.scope?.series||[]),...[...(part.modelIds||[]),...(part.candidateModelIds||[])].map(id=>byId.get(id)?.vacuumMeta?.series)]).filter(Boolean);
  const sort=values=>[...new Set(values)].sort((a,b)=>a.localeCompare(b,'de'));
  return {categories:sort(scoped.map(partCategory)),purposes:partPurposes.filter(p=>scoped.some(part=>partPurpose(part).id===p.id)),series:sort(series)};
}

export const mielePartsCoverage={originalSpareCount:mieleOriginalSpareParts.length,aftermarketCount:mieleAftermarketParts.length,excludedNonVacuumCount:4,retrievedAt:stamp};
