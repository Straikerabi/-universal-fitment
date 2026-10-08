// Keep a usable current-tab copy when browser storage is blocked or full.
const temporary=new Map(), unreadable=new Set();
const plain=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const shape=(value,fallback)=>Array.isArray(fallback)?Array.isArray(value):plain(fallback)?plain(value):typeof value===typeof fallback;
export function readLocal(key,fallback){
  let raw;
  if(temporary.has(key))raw=temporary.get(key);
  else try{raw=localStorage.getItem(key);}catch{return fallback;}
  if(raw===null||raw===undefined){unreadable.delete(key);return fallback;}
  try{
    const value=JSON.parse(raw);
    if(value===null){unreadable.delete(key);return fallback;}
    if(!shape(value,fallback))throw new Error('Unexpected data shape');
    unreadable.delete(key);return value;
  }catch{unreadable.add(key);return fallback;}
}
export function writeLocal(key,value){
  let raw;
  try{raw=JSON.stringify(value);}catch{return false;}
  try{localStorage.setItem(key,raw);temporary.delete(key);unreadable.delete(key);return true;}
  catch{temporary.set(key,raw);unreadable.delete(key);return false;}
}
export function removeLocal(key){
  try{localStorage.removeItem(key);temporary.delete(key);unreadable.delete(key);return true;}
  catch{temporary.set(key,'null');unreadable.delete(key);return false;}
}
export function localDataStatus(){return {temporary:temporary.size>0,unreadable:unreadable.size>0};}

export function cleanIds(value,limit=100){
  return Array.isArray(value)?[...new Set(value.filter(id=>typeof id==='string'&&id.length>0&&id.length<=200))].slice(0,limit):[];
}
export function cleanMap(value){
  if(!plain(value))return {};
  return Object.fromEntries(Object.entries(value).filter(([key])=>!['__proto__','prototype','constructor'].includes(key)).slice(0,1000));
}
