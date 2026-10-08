import {products,partsCatalog} from '../data/catalog.js';
import {compactIdentifier,normalizeGTIN,normalizeText} from './normalization.js';
import {isValidGTIN} from './identifiers.js';
import {parseBoschENumber,boschServiceLink} from './bosch-identity.js';
import {partBrands} from '../data/miele-parts.js';
import {parseAegPNC,aegPartsLink,parseSiemensENumber,siemensServiceLink,parsePhilipsModelReference,parseVorwerkModel} from './brand-identity.js';

const labels={material:'Material-Nr.',gtin:'EAN / GTIN',type:'Gerätetyp',reference:'Produkt-/Artikel-Nr.',model:'Modell / Serie',enumber:'Bosch / Siemens E-Nr.',pnc:'AEG PNC / Prod.No.',serial:'Serien-/Fabrikations-/FD-Kennung'};
const brandPattern=/\b(MIELE|DYSON|BOSCH|AEG|SIEMENS|PHILIPS|ROWENTA|VORWERK|SAMSUNG|HOOVER|KRUPS|JURA|SAECO|NESPRESSO|KÄRCHER|KARCHER|DELONGHI|DE['’]LONGHI)\b/gi;
const samsungReference=value=>String(value||'').trim().toUpperCase().match(/^(?:VS(?:15|20|28)[A-Z0-9]{7,9}|VCC?[A-Z0-9-]{4,16}|SC[A-Z0-9-]{4,16})(?:\/[A-Z0-9]{2,3})?$/)?.[0]||null;
const familyPattern=/\b(?:COMPLETE\s+C[123]|COMPACT\s+C[12]|CLASSIC\s+C1|GUARD\s+[LSM]1|TRIFLEX\s+HX[123]|DUOFLEX\s+HX1|BOOST\s+CX1|BLIZZARD\s+CX1)\b/gi;
const fieldPatterns=[
 ['serial',/\b(?:SER(?:IAL)?(?:\s*(?:NUMBER|NO|NR))?|SERIEN(?:NUMMER|\s*NR)|FABR(?:IKATIONS)?[.\s-]*(?:NUMMER|NR|NO)|S[.\s-]*NR|Z[.\s-]*NR|FD)\b\.?\s*[:#-]?\s*(.*)$/i],
 ['enumber',/\bE[.\s-]*(?:NR|NUMMER|NUMBER|NO)\b\.?\s*[:#-]?\s*(.*)$/i],
 ['pnc',/\b(?:PNC|PROD[.\s-]*(?:NO|NR))\b\.?\s*[:#-]?\s*(.*)$/i],
 ['material',/\b(?:MAT(?:ERIAL)?[.\s-]*(?:NUMMER|NUMBER|NR|NO)?|M[.\s-]*NR)\b\.?\s*[:#-]?\s*(.*)$/i],
 ['gtin',/\b(?:EAN(?:[ -]?13)?|GTIN(?:[ -]?14)?|UPC)\s*[:.#-]?\s*(.*)$/i],
 ['type',/\b(?:TYPE|TYP|MODELLTYP)\b\s*[:.#-]?\s*(.*)$/i],
 ['reference',/\b(?:REF(?:ERENCE)?|ART(?:IKEL)?[.\s-]*(?:NUMMER|NR|NO)?|PRODUKTCODE|PRODUCT\s*CODE|PRODUCT\s*(?:NUMBER|NO|NR)|PRODUKT[.\s-]*(?:NUMMER|NR)|P[.\s-]*NR)\b\.?\s*[:#-]?\s*(.*)$/i],
 ['model',/\b(?:MODEL(?:\s*CODE)?|MODELL(?:CODE)?|SERIE)\b\s*[:.#-]?\s*(.*)$/i]
];
export function parseTypePlate(value=''){
 const text=String(value??'').slice(0,8000),lines=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,100);
 const brands=[...new Set([...text.matchAll(brandPattern)].map(m=>normalizeText(m[1])))];
 const entries=[],consumedLines=new Set();
 const add=(kind,value,line)=>{const v=String(value).trim().slice(0,80);if(v&&!entries.some(x=>x.kind===kind&&compactIdentifier(x.value)===compactIdentifier(v)))entries.push({kind,label:labels[kind],value:v,line});};
 for(let index=0;index<lines.length;index++){
  if(consumedLines.has(index))continue;
  const line=lines[index];let field=null;
  const fields=fieldPatterns.flatMap(([kind,pattern])=>[...line.matchAll(new RegExp(pattern.source.replace('(.*)$',''),'gi'))].map(found=>({kind,found}))).sort((a,b)=>a.found.index-b.found.index);
  for(let fieldIndex=0;fieldIndex<fields.length;fieldIndex++){
   const {kind,found}=fields[fieldIndex];
   const start=found.index+found[0].length;
   let content=line.slice(start,fields[fieldIndex+1]?.found.index??line.length).trim();
   if(!content&&lines[index+1]&&!fieldPatterns.some(([,p])=>p.test(lines[index+1]))){content=lines[index+1];consumedLines.add(index+1);}
   if(kind==='enumber')add(kind,content.match(/^(?:B|VS)[A-Z0-9]+(?:\s*\/\s*[A-Z0-9]*)?/i)?.[0]||content.match(/^\S+/)?.[0]||'',index);
   else if(kind==='model'){const families=[...content.matchAll(familyPattern)];for(const match of families)add(kind,match[0],index);if(!families.length){const samsung=samsungReference(content);const number=samsung?null:parseBoschENumber(content)||parseSiemensENumber(content);if(samsung)add(kind,samsung,index);else if(number)add('enumber',number.full,index);else if(parseVorwerkModel(content))add(kind,parseVorwerkModel(content).code,index);else add(kind,content.match(/^[A-Z0-9][A-Z0-9._/-]*(?:\s+[A-Z0-9][A-Z0-9._/-]*){0,4}/i)?.[0]||'',index);}}
   else if(['material','gtin','pnc'].includes(kind))add(kind,content.match(/^\d(?:[\d\s.-]*\d)?/)?.[0]||content.match(/^\S+/)?.[0]||'',index);
   else if(kind==='reference')add(kind,content.match(/^\d(?:[\d\s.-]*\d)?/)?.[0]||content.match(/^[A-Z0-9][A-Z0-9._/-]*(?:\s+\d+)?/i)?.[0]||'',index);
   else add(kind,kind==='type'&&parseVorwerkModel(content)?parseVorwerkModel(content).code:content.match(/^[A-Z0-9][A-Z0-9._/-]*/i)?.[0]||'',index);
   if(kind==='serial'||!field)field=kind;
  }
  // Explicit serial labels never become bare barcode/model candidates.
  if(field==='serial')continue;
  if(!field){
   for(const match of line.matchAll(familyPattern))add('model',match[0],index);
   for(const match of line.matchAll(/\b(?:VK\s*[1-9]\d{0,2}|V[TB]\s*[1-9]\d{2}|KOBOLD\s*[1-9]\d{2}|TIGER\s*[1-9]\d{2})\b/gi))add('model',parseVorwerkModel(match[0])?.code||match[0],index);
   for(const match of line.matchAll(/\b(?:RO|RH)[A-Z0-9]{4,6}(?:\/[A-Z0-9]{3})?\b/gi))add('model',match[0],index);
   for(const match of line.matchAll(/\b(?:FC|XC|XD|XB)\d{4}(?:\s*\/\s*\d{2}(?:R\d)?)?\b/gi))add('model',match[0],index);
   for(const match of line.matchAll(/\bVS[A-Z0-9]{3,12}(?:\s*\/\s*[A-Z0-9]*)?/gi))add(samsungReference(match[0])?'model':'enumber',match[0],index);
   for(const match of line.matchAll(/\bVCC?[A-Z0-9-]{4,16}(?:\/[A-Z0-9]{2,3})?\b/gi))if(samsungReference(match[0]))add('model',match[0],index);
   for(const match of line.matchAll(/\b(?:HF[X]?[A-Z0-9_]{3,12}|HE[A-Z0-9_]{3,12}|HP[A-Z0-9_]{3,12}|BR[A-Z0-9_]{3,12})(?:\s+\d{3})?\b/gi))add('model',match[0],index);
   for(const match of line.matchAll(/\bS[A-Z]{2,3}\d\b/gi))add('type',match[0],index);
   for(const match of line.matchAll(/\bB(?:G[BCDLS]|CH|HH|BS|CS|SS|KS|TS|DS)[A-Z0-9]{2,12}(?:\s*\/\s*[A-Z0-9]*)?/gi))add('enumber',match[0],index);
   for(const match of line.matchAll(/\b(?:VX\d+|LX\d+|LXB\d+|CX7|QX\d+|AP8\d?|A[LB]6\d?|AUF)[A-Z0-9Öö._/-]*/gi))add('model',match[0],index);
   if(brands.includes('DYSON')&&/^DYSON\s+(?:V\d+|GEN5|CYCLONE|CINETIC|BIG\s+BALL)/i.test(line))add('model',line.replace(/^DYSON\s+/i,'').replace(/™/g,'').trim(),index);
   if(/^[\d\s.-]+$/.test(line)&&isValidGTIN(line))add('gtin',line,index);
  }
 }
 return {text,brands,entries};
}
const materialDigits=value=>/^[\d\s.-]+$/.test(value)?value.replace(/\D/g,''):null;
const same=(a,b)=>compactIdentifier(a)===compactIdentifier(b);
export function reviewScannedCode(value,{catalog=products,parts=partsCatalog}={}){
 const query=String(value??'').trim();
 const knownArticle=parts.some(p=>p.identifiers?.some(i=>['material-number','manufacturer-article','supplier-article'].includes(i.type)&&same(i.value,query)));
 const knownDeviceMaterial=catalog.some(p=>p.identifiers?.some(i=>i.type==='material-number'&&same(i.value,query)));
 const knownDevicePnc=catalog.some(p=>p.identifiers?.some(i=>i.type==='pnc'&&same(i.value,query)));
 const knownDeviceSku=catalog.some(p=>p.identifiers?.some(i=>i.type==='device-sku'&&same(i.value,query)));
 const label=knownDevicePnc?'PNC':knownArticle||knownDeviceMaterial||knownDeviceSku?'Produkt-/Artikel-Nr.':isValidGTIN(query)?'EAN':null;
 return reviewTypePlate(label?`${label}: ${query}`:query,{catalog,parts});
}
export function reviewTypePlate(value,{catalog=products,parts=partsCatalog}={}){
 const parsed=parseTypePlate(value),entries=parsed.entries.map(entry=>({...entry,matches:[],partMatches:[],invalid:false}));
 const warnings=[];
 const allowedBrands=[...new Set(catalog.map(p=>normalizeText(p.brand)))];
 const foreign=parsed.brands.length>1||parsed.brands.some(brand=>!allowedBrands.includes(brand));
 if(foreign)warnings.push('Die Marke ist nicht unterstützt oder mehrere Marken stehen im Text. Korrigiere die gelesene Marke und prüfe die Katalogabdeckung.');
 const selectedBrand=parsed.brands.length===1&&!foreign?parsed.brands[0]:null;
 const scopedCatalog=catalog.filter(p=>!foreign&&(!selectedBrand||normalizeText(p.brand)===selectedBrand));
 const scopedParts=parts.filter(p=>!foreign&&(!selectedBrand||partBrands(p).some(b=>normalizeText(b)===selectedBrand)));
 for(const entry of entries){
  if(entry.kind==='serial')continue;
  if(entry.kind==='gtin'&&!isValidGTIN(entry.value)){entry.invalid=true;warnings.push('Eine EAN-/GTIN-Prüfziffer oder das Zahlenformat ist ungültig. Bitte vom Typenschild ablesen.');continue;}
  if(entry.kind==='material'&&!/^[0-9]{7,8}$/.test(materialDigits(entry.value)||'')){entry.invalid=true;warnings.push('Eine Materialnummer ist nicht im erwarteten Zahlenformat. Bitte die gedruckte Kennung prüfen.');continue;}
  const pnc=entry.kind==='pnc'?parseAegPNC(entry.value):null;
  if(entry.kind==='pnc'&&(!pnc||selectedBrand&&selectedBrand!=='AEG')){entry.invalid=true;warnings.push('Die PNC ist ungültig oder passt nicht zur gelesenen Marke. Bei AEG die 9 oder 11 Ziffern neben Prod.No. ablesen.');continue;}
  if(pnc){entry.pncRevision=pnc.revision;const url=aegPartsLink(pnc.full);if(url)entry.serviceLink={url,label:'AEG Teile mit dieser PNC prüfen'};}
  const siemensNumber=entry.kind==='enumber'?parseSiemensENumber(entry.value):null;
  const number=entry.kind==='enumber'?siemensNumber||parseBoschENumber(entry.value):null;
  const numberBrand=siemensNumber?'SIEMENS':'BOSCH';
  if(entry.kind==='enumber'&&(!number||selectedBrand&&selectedBrand!==numberBrand)){entry.invalid=true;warnings.push('Die E-Nr. ist ungültig oder passt nicht zur gelesenen Marke. Modellreferenz und zwei Ziffern nach / vom Typenschild prüfen.');continue;}
  if(number){entry.deviceIndex=number.index;entry.serviceLink=siemensNumber?siemensServiceLink(number.full):boschServiceLink(number.full);}
  const modelReference=entry.kind==='reference'&&(['ROWENTA','PHILIPS','SIEMENS','VORWERK','SAMSUNG','HOOVER'].includes(selectedBrand)||parsePhilipsModelReference(entry.value)||parseSiemensENumber(entry.value));
  const idMatches=(identifiers)=>identifiers?.some(id=>entry.kind==='gtin'?['ean','gtin','upc'].includes(id.type)&&normalizeGTIN(id.value)===normalizeGTIN(entry.value):['material','reference'].includes(entry.kind)?['material-number','manufacturer-article','supplier-article','device-sku',...(modelReference?['manufacturer-model']:[])].includes(id.type)&&same(id.value,materialDigits(entry.value)||entry.value):entry.kind==='pnc'?id.type==='pnc'&&(pnc.revision?same(id.value,pnc.full):String(id.value).startsWith(pnc.base)):entry.kind==='enumber'?id.type==='manufacturer-model'&&same(id.value,number.base):entry.kind==='type'?(id.type==='product-type'||id.type==='manufacturer-model'&&selectedBrand==='VORWERK')&&same(id.value,entry.value):false);
  if(entry.kind==='model')entry.matches=scopedCatalog.filter(p=>same(p.model,entry.value)||same(p.vacuumMeta?.series||'',entry.value)||(['Rowenta','Philips','Siemens','Vorwerk','Samsung','Hoover'].includes(p.brand)&&p.identifiers.some(i=>i.type==='manufacturer-model'&&same(i.value,entry.value)))).map(p=>p.id);
  else entry.matches=scopedCatalog.filter(p=>p.recordType==='model'&&idMatches(p.identifiers)).map(p=>p.id);
  if(['material','reference','gtin'].includes(entry.kind))entry.partMatches=scopedParts.filter(p=>idMatches(p.identifiers)).map(p=>p.id);
 }
 const strong=entries.filter(e=>['material','reference','gtin','enumber','pnc'].includes(e.kind)&&!e.invalid&&e.matches.length);
 const unknownStrong=entries.filter(e=>['material','gtin','enumber','pnc'].includes(e.kind)&&!e.invalid&&!e.matches.length&&!e.partMatches.length);
 const constraints=entries.filter(e=>e.kind!=='serial'&&e.matches.length);
 let matching=strong.length?[...strong[0].matches]:[];
 if(!matching.length){const type=entries.find(e=>e.kind==='type'&&e.matches.length);matching=type?[...type.matches]:[];}
 if(!matching.length){const models=entries.filter(e=>e.kind==='model'&&e.matches.length);matching=models.length?[...models[0].matches]:[];}
 const initial=[...matching];
 for(const entry of constraints)matching=matching.filter(id=>entry.matches.includes(id));
 const partField=entries.some(e=>!e.matches.length&&e.partMatches.length);
 const indexes=entries.filter(e=>e.kind==='enumber'&&e.deviceIndex).map(e=>e.deviceIndex);
 const conflict=initial.length>0&&matching.length===0||strong.length>0&&(unknownStrong.length>0||partField)||new Set(indexes).size>1;
 if(conflict)warnings.push('Die gelesenen Gerätekennungen lassen sich nicht gemeinsam bestätigen. Korrigiere den Text anhand des Typenschilds, bevor du ein Gerät auswählst.');
 if(entries.some(e=>e.kind==='serial'))warnings.push('Serien-/Fabrikationsnummern werden angezeigt, aber weder zur Gerätesuche noch als Passformnachweis verwendet.');
 const partOnly=entries.some(e=>e.partMatches.length)&&!initial.length;
 if(partOnly)warnings.push('Ein Teile- oder Zubehörbarcode identifiziert keinen einzelnen Staubsauger. Öffne das Teil und wähle dein Gerät separat.');
 const familyMode=!strong.length&&!entries.some(e=>e.kind==='type'&&e.matches.length);
 let suggestions=(foreign||conflict?[]:matching).map(id=>catalog.find(p=>p.id===id)).filter(Boolean);
 if(familyMode){const families=suggestions.filter(p=>p.recordType==='family');if(families.length)suggestions=families;}
 const boschReference=suggestions.some(p=>p.brand==='Bosch');
 if(boschReference)warnings.push('Die Bosch-Modellreferenz ist zugeordnet. Der vollständige E-Nr.-Index /xx und die Eignung jedes Ersatzteils bleiben beim Hersteller zu prüfen; FD und Seriennummer liefern keinen Passformnachweis.');
 if(suggestions.some(p=>p.brand==='Samsung'))warnings.push('Samsung-Modellreferenz erkannt. Vollständigen Länder- und Modellcode sowie Jet-Generation und Zubehörtyp separat vergleichen.');
 if(suggestions.some(p=>p.brand==='Hoover'))warnings.push('Hoover-Modellreferenz erkannt. Ausführung und achtstelligen Produktcode vom Typenschild vergleichen; britische Zubehörangaben bestätigen keine deutsche Teilepassung.');
 const additionalReference=suggestions.some(p=>['AEG','Dyson','Rowenta','Philips','Siemens','Vorwerk','Samsung','Hoover'].includes(p.brand));
 if(suggestions.some(p=>p.brand==='AEG'))warnings.push('AEG-Modellreferenz erkannt. Die vollständige 11-stellige PNC-Ausführung und die Artikel-Eignung beim Hersteller prüfen. Eine 9-stellige PNC lässt den zweistelligen Index offen.');
 if(suggestions.some(p=>p.brand==='Dyson'))warnings.push('Dyson-Modellreferenz erkannt. Produktnummer, Gerätegeneration, Akku-Befestigung und Filterform prüfen; eine Serienbezeichnung bestätigt keine Ersatzteil-Ausführung.');
 if(suggestions.some(p=>p.brand==='Rowenta'))warnings.push('Rowenta-Modellreferenz erkannt. Vollständige Ref. Nr. mit /xxx-Ausführung und die Eignung jedes Artikels beim Hersteller prüfen.');
 if(suggestions.some(p=>p.brand==='Philips'))warnings.push('Philips-Modellreferenz erkannt. Vollständigen /xx-Produktcode, gegebenenfalls R-Ausführung und die Artikel-Eignung beim Hersteller prüfen.');
 if(suggestions.some(p=>p.brand==='Siemens'))warnings.push('Siemens-Modellreferenz erkannt. Vollständige E-Nr. mit /xx-Index und die Eignung jedes Ersatzteils beim Hersteller prüfen; FD und Seriennummer sind kein Passformnachweis.');
 if(suggestions.some(p=>p.brand==='Vorwerk'))warnings.push('Vorwerk-Grundgerät erkannt. VK-/VT-/VB-Kennung, Anschlüsse und die Eignung jedes Artikels beim Hersteller prüfen. Elektrobürsten und weitere Vorsatzgeräte haben eigene Typkennungen; deren Teile werden nicht aus dem Grundmodell abgeleitet.');
 const confirmationBrands=[...new Set(suggestions.map(p=>p.brand))];
 if(!parsed.brands.length)warnings.push(`Die Marke wurde nicht erkannt. Prüfe am Gerät die Marke${confirmationBrands.length===1?` ${confirmationBrands[0]}`:''}.`);
 const status=foreign?'unsupported_brand':conflict?'conflict':boschReference?'model_reference':additionalReference?'catalog_reference':suggestions.length===1&&strong.length?'exact_device':suggestions.length&&familyMode?'family':suggestions.length?'shared_identity':partOnly?'part_only':'unresolved';
 return {...parsed,entries,warnings:[...new Set(warnings)],suggestions,partSuggestions:[...new Set(entries.flatMap(e=>e.partMatches))].map(id=>parts.find(p=>p.id===id)).filter(Boolean),status,confirmationBrand:confirmationBrands.length===1?confirmationBrands[0]:null,needsBrandConfirmation:!parsed.brands.length,hasInvalidFields:entries.some(e=>e.invalid)};
}
