export function parseAegPNC(value=''){
 const raw=String(value).trim();if(!/^[\d\s.-]+$/.test(raw))return null;
 const digits=raw.replace(/\D/g,'');if(!/^\d{9}(?:\d{2})?$/.test(digits))return null;
 return {full:digits,base:digits.slice(0,9),revision:digits.length===11?digits.slice(9):null};
}
export function reviewAegPNC(product,value){
 const pnc=parseAegPNC(value);if(product?.brand!=='AEG'||!pnc)return {status:'invalid',pnc:null};
 const known=product.pncs||[];
 if(!pnc.revision)return {status:known.some(x=>x.startsWith(pnc.base))?'prefix_only':'unknown',pnc};
 return {status:known.includes(pnc.full)?'listed':'unknown',pnc};
}
export function aegPartsLink(value){
 const pnc=parseAegPNC(value);return pnc?.revision?'https://shop.aeg.de/search?pnc='+pnc.full:null;
}

export function parseSiemensENumber(value=''){
 const raw=String(value??'').trim().toUpperCase().replace(/\s*\/\s*/g,'/');
 const match=/^(VS[A-Z0-9]{3,12})(?:\/(\d{2}))?$/.exec(raw);
 return match?{base:match[1],index:match[2]||null,full:match[1]+(match[2]?'/'+match[2]:'')}:null;
}
export function siemensServiceLink(value){
 const number=parseSiemensENumber(value);
 return number?.index?{url:`https://www.siemens-home.bsh-group.com/de/de/productservice/${number.base}-${number.index}`,label:'Siemens Service mit dieser E-Nr. öffnen'}:null;
}
export function reviewSiemensENumber(product,value){
 const number=parseSiemensENumber(value);
 if(product?.brand!=='Siemens'||!number)return {status:'invalid',number:null};
 if(number.base!==product.model)return {status:'different_model',number};
 if(!number.index)return {status:'index_open',number};
 return {status:(product.deviceReferences||[]).includes(number.full)?'listed':'unlisted_index',number};
}
export function parsePhilipsModelReference(value=''){
 const raw=String(value??'').trim().toUpperCase().replace(/\s*\/\s*/g,'/');
 const match=/^((?:FC|XC|XD|XB)\d{4})(?:\/(\d{2}(?:R\d)?))?$/.exec(raw);
 return match?{base:match[1],variant:match[2]||null,full:raw}:null;
}
export function reviewPhilipsModelReference(product,value){
 const reference=parsePhilipsModelReference(value);
 if(product?.brand!=='Philips'||!reference)return {status:'invalid',reference:null};
 if(reference.base!==product.model)return {status:'different_model',reference};
 if(!reference.variant)return {status:'variant_open',reference};
 return {status:(product.deviceReferences||[]).includes(reference.full)?'listed':'unlisted_variant',reference};
}
export function parseVorwerkModel(value=''){
 const raw=String(value??'').trim().toUpperCase();
 const match=/^(?:VORWERK\s+)?(?:(KOBOLD|TIGER)\s*)?(?:(VK|VT|VB)\s*([1-9]\d{0,2})|([1-9]\d{2}))$/.exec(raw);
 if(!match)return null;
 const prefix=match[2]||(match[1]==='KOBOLD'?'VK':match[1]==='TIGER'?'VT':null);
 if(!prefix||match[1]==='TIGER'&&prefix!=='VT')return null;
 const code=prefix+(match[3]||match[4]);
 return /^(?:VK[1-9]\d{0,2}|V[TB][1-9]\d{2})$/.test(code)?{code}:null;
}
export function reviewVorwerkModel(product,value){
 const reference=parseVorwerkModel(value);
 if(product?.brand!=='Vorwerk'||!reference)return {status:'invalid',reference:null};
 return {status:(product.deviceReferences||[]).includes(reference.code)?'listed':'different_model',reference};
}
