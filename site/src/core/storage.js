import { readLocal, writeLocal, removeLocal, cleanIds, cleanMap } from './local-state.js';
const KEYS = {
  saved:'uf:saved', reports:'uf:reports', recent:'uf:recent', demoSeen:'uf:demo-seen',
  deviceMeta:'uf:device-meta', jobSelections:'uf:job-selections', inventory:'uf:inventory', reminderPrefs:'uf:reminder-prefs',
  toolInventory:'uf:tool-inventory', maintenance:'uf:maintenance', vehicleMeta:'uf:vehicle-meta'
};

function read(key,fallback=[]){return readLocal(key,fallback);}
function write(key,value){return writeLocal(key,value);}
function remove(key){return removeLocal(key);}
const record=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{};
const bounded=(value,fallback,min,max)=>Math.max(min,Math.min(max,Math.floor(value!==null&&value!==''&&Number.isFinite(Number(value))?Number(value):Number(fallback))));

export const savedIds = () => cleanIds(read(KEYS.saved, []));
export function toggleSaved(id) {
  const ids = new Set(savedIds());
  if (ids.has(id)) ids.delete(id); else ids.add(id);
  write(KEYS.saved, [...ids]);
  return ids.has(id);
}
export function isSaved(id) { return savedIds().includes(id); }

export function addRecent(id) {
  const list = recentIds().filter(x => x !== id);
  list.unshift(id);
  write(KEYS.recent, list.slice(0, 12));
}
export const recentIds = () => cleanIds(read(KEYS.recent, []),12);
export function clearRecent() { return remove(KEYS.recent); }

export function addReport(report) {
  const list = read(KEYS.reports, []);
  list.unshift({ ...report, createdAt: new Date().toISOString(), status:'queued-local' });
  write(KEYS.reports, list.slice(0, 100));
}
export const reports = () => read(KEYS.reports, []);

export function getDeviceMeta(id) {
  const all = cleanMap(read(KEYS.deviceMeta, {}));
  return all && typeof all === 'object' ? record(all[id]) : {};
}
export function setDeviceMeta(id, patch) {
  const all = cleanMap(read(KEYS.deviceMeta, {}));
  const next = { ...(all && typeof all === 'object' ? all : {}), [id]: { ...(all?.[id] || {}), ...patch, updatedAt:new Date().toISOString() } };
  write(KEYS.deviceMeta, next);
  return next[id];
}

function jobKey(productId, jobId){ return `${productId}:${jobId}`; }
export function getJobSelection(productId, jobId, fallback=[]) {
  const all = cleanMap(read(KEYS.jobSelections, {}));
  const value = all?.[jobKey(productId,jobId)];
  return Array.isArray(value) ? cleanIds(value) : cleanIds(fallback);
}
export function setJobSelection(productId, jobId, itemIds=[]) {
  const all = cleanMap(read(KEYS.jobSelections, {}));
  const next = { ...(all && typeof all === 'object' ? all : {}), [jobKey(productId,jobId)]: [...new Set(itemIds)] };
  write(KEYS.jobSelections, next);
  return next[jobKey(productId,jobId)];
}

function stockKey(productId, stockId){ return `${productId}:${stockId}`; }
export function getInventoryPlan(productId, stockPlan) {
  const all = cleanMap(read(KEYS.inventory, {}));
  const stored = record(all?.[stockKey(productId, stockPlan.id)]);
  return {
    stock:bounded(stored.stock,stockPlan.defaultStock||0,0,999),
    avgDaysPerUnit:bounded(stored.avgDaysPerUnit,stockPlan.avgDaysPerUnit||1,1,365),
    leadTimeMinDays:bounded(stored.leadTimeMinDays,stockPlan.leadTimeMinDays||0,0,180),
    leadTimeMaxDays:bounded(stored.leadTimeMaxDays,stockPlan.leadTimeMaxDays||0,0,180),
    safetyDays:bounded(stored.safetyDays,stockPlan.safetyDays||0,0,365),
    updatedAt:stored.updatedAt || null
  };
}
export function setInventoryPlan(productId, stockPlanId, patch) {
  const all = cleanMap(read(KEYS.inventory, {}));
  const key=stockKey(productId,stockPlanId);
  const current=all?.[key] || {};
  const next={ ...(all && typeof all === 'object' ? all : {}), [key]:{...current,...patch,updatedAt:new Date().toISOString()} };
  write(KEYS.inventory,next);
  return next[key];
}

export function getReminderPref(productId, stockPlanId) {
  const all=cleanMap(read(KEYS.reminderPrefs,{}));
  return {enabled:all?.[stockKey(productId,stockPlanId)]?.enabled===true};
}
export function setReminderPref(productId, stockPlanId, patch) {
  const all=cleanMap(read(KEYS.reminderPrefs,{}));
  const key=stockKey(productId,stockPlanId);
  const next={...(all && typeof all==='object'?all:{}),[key]:{...(all?.[key]||{}),...patch,updatedAt:new Date().toISOString()}};
  write(KEYS.reminderPrefs,next);
  return next[key];
}

export function getToolInventory() {
  const value=read(KEYS.toolInventory,{});
  return cleanMap(value);
}
export function setToolInventory(label, status) {
  const all=getToolInventory();
  const next={...all,[label]:status};
  write(KEYS.toolInventory,next);
  return next;
}

export function getMaintenance(productId){
  const all=cleanMap(read(KEYS.maintenance,{}));
  return Array.isArray(all?.[productId]) ? all[productId].filter(v=>v&&typeof v==='object'&&!Array.isArray(v)).slice(0,100) : [];
}
export function addMaintenance(productId, entry){
  const all=cleanMap(read(KEYS.maintenance,{}));
  const list=Array.isArray(all?.[productId]) ? all[productId] : [];
  const next={...all,[productId]:[{...entry,id:`m-${Date.now()}`,createdAt:new Date().toISOString()},...list].slice(0,100)};
  write(KEYS.maintenance,next);
  return next[productId];
}

export function getVehicleMeta(productId){
  const all=cleanMap(read(KEYS.vehicleMeta,{}));
  return all && typeof all==='object' ? record(all[productId]) : {};
}
export function setVehicleMeta(productId,patch){
  const all=cleanMap(read(KEYS.vehicleMeta,{}));
  const next={...(all&&typeof all==='object'?all:{}),[productId]:{...(all?.[productId]||{}),...patch,updatedAt:new Date().toISOString()}};
  write(KEYS.vehicleMeta,next);
  return next[productId];
}

export function exportDemoData() {
  return {
    schemaVersion:2,
    exportedAt:new Date().toISOString(),
    saved:savedIds(),
    recent:recentIds(),
    reports:reports(),
    deviceMeta:read(KEYS.deviceMeta,{}),
    jobSelections:read(KEYS.jobSelections,{}),
    inventory:read(KEYS.inventory,{}),
    reminderPrefs:read(KEYS.reminderPrefs,{}),
    toolInventory:read(KEYS.toolInventory,{}),
    maintenance:read(KEYS.maintenance,{}),
    vehicleMeta:read(KEYS.vehicleMeta,{})
  };
}

export function resetDemoStorage() {
  Object.values(KEYS).forEach(remove);
}

// Restoring a reviewed local backup replaces only the app's known storage keys.
export function replaceDemoData(data){
  for(const [field,key] of Object.entries(KEYS)){
    if(field==='demoSeen')continue;
    write(key, ['saved','recent','reports'].includes(field)?(data[field]||[]):(data[field]||{}));
  }
}
