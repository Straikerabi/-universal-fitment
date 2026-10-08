export function photoPolicy(mode='details',large=false){
 const normalized=['details','on-demand','automatic'].includes(mode)?mode:'details';
 return {automatic:normalized==='automatic'||(normalized==='details'&&large),mode:normalized};
}
