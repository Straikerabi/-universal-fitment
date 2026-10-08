import { compactIdentifier, isLikelyVIN } from './normalization.js';

export function isValidGTIN(value='') {
  const raw=String(value).trim();
  if(!/^[\d\s.-]+$/.test(raw))return false;
  const digits=raw.replace(/\D/g,'');
  if(![8,12,13,14].includes(digits.length)) return false;
  const body=digits.slice(0,-1);
  const check=Number(digits.at(-1));
  if(!Number.isInteger(check)) return false;
  let sum=0;
  let weight=3;
  for(let i=body.length-1;i>=0;i--){
    sum+=Number(body[i])*weight;
    weight=weight===3?1:3;
  }
  return (10-(sum%10))%10===check;
}

export function classifyIdentifier(value='') {
  const raw=String(value||'').trim();
  const compact=compactIdentifier(raw);
  const digits=raw.replace(/\D/g,'');
  if(!raw) return {kind:'empty',label:'Keine Eingabe',confidence:1,searchable:false};
  if(isValidGTIN(raw)) return {kind:'gtin',label:`GTIN-${digits.length}`,confidence:1,searchable:true};
  if(isLikelyVIN(raw)) return {kind:'vin',label:'VIN',confidence:.98,searchable:true};

  const mixed=/[A-Z]/i.test(compact)&&/\d/.test(compact);
  const hasSeparators=/[.\/_-]/.test(raw);
  if(mixed && compact.length>=15 && compact.length<=32 && !hasSeparators){
    return {
      kind:'manufacturer-code',
      label:'Hersteller-/Seriencode',
      confidence:.78,
      searchable:false,
      reason:'Langer gemischter Barcode ohne GTIN-Format; häufig Serien-, Produktions- oder interner Herstellercode.'
    };
  }
  if([8,12,13,14].includes(digits.length) && /^\d+$/.test(raw.replace(/\s/g,''))){
    return {kind:'numeric-code',label:'Numerischer Code',confidence:.7,searchable:false,reason:'Länge ähnelt GTIN, Prüfziffer ist aber ungültig.'};
  }
  if(mixed && compact.length>=3 && compact.length<=32){
    return {kind:'model',label:'Modell-/Produktnummer',confidence:.72,searchable:true};
  }
  return {kind:'unknown',label:'Unbekannter Identifikator',confidence:.4,searchable:true};
}


export function extractTypePlateIdentity(lines=[]) {
  const text=(Array.isArray(lines)?lines:[lines]).join(' ').toUpperCase().replace(/\s+/g,' ').trim();
  if(!text) return {primary:'',brand:'',type:'',reference:'',candidates:[]};

  const brandMatch=text.match(/\b(KRUPS|DELONGHI|DE'LONGHI|DE’LONGHI|PHILIPS|SAECO|BOSCH|SIEMENS|JURA|NESPRESSO|MIELE|DYSON|VORWERK|KARCHER|KÄRCHER)\b/);
  const refMatch=text.match(/\b(?:REF(?:ERENCE)?|ART(?:IKEL)?(?:NR)?|PRODUCT(?:\s+NO)?)\s*[:.#-]?\s*([A-Z0-9][A-Z0-9._\/-]{3,24})/);
  const typeMatch=text.match(/\b(?:TYPE|TYP|MODEL|MODELL)\s*[:.#-]?\s*([A-Z]{1,8}[A-Z0-9._\/-]{2,24})/);
  const genericFamilyMatches=text.match(/\b(?:ECAM|EP|SM|KP|EA|XN|XP|YY|TI|EQ)[A-Z0-9._\/-]{2,22}\b/g)||[];
  const mieleFamilyMatches=text.match(/\b(?:COMPLETE\s+C[123]|COMPACT\s+C[12]|CLASSIC\s+C1|GUARD\s+[LSM]1|TRIFLEX\s+HX[123]|DUOFLEX\s+HX1|BOOST\s+CX1|BLIZZARD\s+CX1|S\d{3,4})\b/g)||[];
  const mieleTypes=brandMatch?.[1]==='MIELE'?(text.match(/\bS[A-Z]{2,3}\d\b/g)||[]):[];
  const material=brandMatch?.[1]==='MIELE'?text.match(/\b(?:MAT(?:ERIAL)?[.\s-]*(?:NUMMER|NUMBER|NR|NO)?\.?|M[.\s-]*NR\.?)\s*[:#-]?\s*(\d{7,8})\b/)?.[1]||'':'';
  const ean=brandMatch?.[1]==='MIELE'?text.match(/\b(?:EAN|GTIN)\s*[:.#-]?\s*(\d{8,14})\b/)?.[1]||'':'';
  const vorwerkModels=brandMatch?.[1]==='VORWERK'?(Array.isArray(lines)?lines:String(lines).split(/\r?\n/)).filter(line=>!/\b(?:SERIAL|SERIENNUMMER|S[.\s-]*NR|FABRIKATIONSNUMMER)\b/i.test(line)).join(' ').toUpperCase().match(/\b(?:VK\s*[1-9]\d{0,2}|V[TB]\s*[1-9]\d{2})\b/g)||[]:[];
  const familyMatches=[...genericFamilyMatches,...mieleFamilyMatches,...vorwerkModels];
  const clean=value=>String(value||'').replace(/[.,;:]+$/,'');
  const reference=clean(refMatch?.[1]);
  const type=clean(typeMatch?.[1]);
  const candidates=[material,isValidGTIN(ean)?ean:'',reference,type,...mieleTypes,...familyMatches.map(clean)]
    .filter(Boolean)
    .filter((value,index,array)=>array.indexOf(value)===index)
    .filter(value=>classifyIdentifier(value).kind!=='manufacturer-code');
  return {
    primary:material||(isValidGTIN(ean)?ean:'')||reference||type||candidates[0]||'',
    brand:brandMatch?.[1]||'',
    type,
    reference,
    candidates
  };
}
