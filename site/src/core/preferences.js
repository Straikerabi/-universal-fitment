const KEY='uf:preferences:v1';
const DEFAULTS={market:'DE',currency:'EUR',units:'metric',radiusKm:25,quality:'balanced',deliveryPriority:'value',allowLocation:false,photos:'details'};
export function normalizePreferences(value={}){
  return {...DEFAULTS,photos:['details','on-demand','automatic'].includes(value?.photos)?value.photos:'details',radiusKm:[5,10,25,50].includes(value?.radiusKm)?value.radiusKm:25,
    quality:['balanced','premium','budget'].includes(value?.quality)?value.quality:'balanced',
    deliveryPriority:['value','fast','few-packages'].includes(value?.deliveryPriority)?value.deliveryPriority:'value',allowLocation:value?.allowLocation===true};
}
export function getPreferences(){return normalizePreferences(readLocal(KEY,{}));}
export function setPreferences(patch){const next=normalizePreferences({...getPreferences(),...patch});writeLocal(KEY,next);return next;}
import {readLocal,writeLocal} from './local-state.js';
