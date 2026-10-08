import { groupCartItems } from '../data/miele-commerce.js';
import { readLocal, writeLocal } from './local-state.js';
import { cartQuantity } from './quantity.js';
const CART_KEY='uf:cart:v1';

export function normalizeCartItems(value){
  if(!Array.isArray(value))return [];
  const seen=new Set();
  return value.filter(item=>item&&typeof item==='object'&&!Array.isArray(item)&&typeof item.key==='string'&&item.key.length>0&&item.key.length<=600)
    .slice(0,500).filter(item=>{if(seen.has(item.key))return false;seen.add(item.key);return true;})
    .map(item=>({...item,quantity:cartQuantity(item.quantity),lookupLinks:Array.isArray(item.lookupLinks)?item.lookupLinks.filter(link=>link&&typeof link==='object'&&!Array.isArray(link)).slice(0,2):[]}));
}
function read(){return normalizeCartItems(readLocal(CART_KEY,[]));}
function write(items){return writeLocal(CART_KEY,items);}

export function cartItems(){return read();}
export function cartCount(){return read().reduce((sum,item)=>sum+cartQuantity(item.quantity),0);}
export function addCartItem(item){
  const list=read();
  if(!item||typeof item!=='object'||Array.isArray(item))return list;
  const key=String(item.key||`${item.productId||''}:${item.partId||''}:${item.offerId||item.merchant||'generic'}`);
  const idx=list.findIndex(x=>x.key===key);
  const next={...item,key,quantity:cartQuantity(item.quantity),addedAt:item.addedAt||new Date().toISOString()};
  if(idx>=0) list[idx]={...list[idx],...next,quantity:cartQuantity(list[idx].quantity+next.quantity)}; else if(list.length<500)list.push(next);
  write(list);return list;
}
export function setCartQuantity(key,quantity){
  const qty=Number.isFinite(Number(quantity))&&Number(quantity)<=0?0:cartQuantity(quantity);const list=read();
  const next=qty<=0?list.filter(x=>x.key!==key):list.map(x=>x.key===key?{...x,quantity:qty}:x);
  write(next);return next;
}
export function removeCartItem(key){return setCartQuantity(key,0);}
export function clearCart(){write([]);return [];}
export function replaceCart(items){const next=normalizeCartItems(items);write(next);return next;}
export function cartGroups(){
  return groupCartItems(read());
}
