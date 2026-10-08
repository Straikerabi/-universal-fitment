export const MAX_CART_QUANTITY=999;
export function cartQuantity(value){
  const n=Number(value);
  return Number.isFinite(n)?Math.min(MAX_CART_QUANTITY,Math.max(1,Math.floor(n)||1)):1;
}
