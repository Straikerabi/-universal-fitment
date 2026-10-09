// Presentation boundary only. #48 owns every technical fitment decision.
export const viewVersion='demo-view/1';
const statuses=['confirmed','unknown','excluded'];
const fields=['presentationVersion','tenantId','caseId','outcome','reason','next','evidence'];
export function validateView(value,context) {
  if(!value||Object.getPrototypeOf(value)!==Object.prototype) throw Error('Invalid response');
  if(fields.some(k=>!Object.hasOwn(value,k)))throw Error('Missing response field');
  if(Object.keys(value).some(k=>!fields.includes(k))) throw Error('Unmapped response field');
  if(value.presentationVersion!==viewVersion||value.tenantId!==context.tenantId||value.caseId!==context.caseId||!statuses.includes(value.outcome)) throw Error('Response boundary mismatch');
  for(const k of ['reason','next']) if(typeof value[k]!=='string'||!value[k].trim()||value[k].length>600) throw Error('Invalid display text');
  if(!Array.isArray(value.evidence)||value.evidence.length>8) throw Error('Invalid evidence');
  const ids=new Set();
  for(const e of value.evidence) {
    if(!e||Object.keys(e).some(k=>!['id','scope','tenantId','label','text','rights'].includes(k))) throw Error('Unmapped evidence');
    if(!['public','tenant'].includes(e.scope)||e.rights!=='synthetic-test-only'||(e.scope==='tenant'?e.tenantId!==context.tenantId:e.tenantId!==null)) throw Error('Evidence access denied');
    for(const k of ['id','label','text']) if(typeof e[k]!=='string'||!e[k].trim()||e[k].length>600) throw Error('Invalid evidence text');
    if(ids.has(e.id))throw Error('Duplicate evidence');ids.add(e.id);
  }
  if(value.outcome!=='unknown'&&!value.evidence.length) throw Error('Missing supplied evidence');
  return structuredClone(value);
}
export function createAdapter({invoke,validateContract,mapToView,timeoutMs=1500}) {
  if([invoke,validateContract,mapToView].some(f=>typeof f!=='function')||!Number.isFinite(timeoutMs)||timeoutMs<1)throw Error('Explicit contract hooks required');
  return async(request,context)=>{
    let timer;const controller=new AbortController();
    try {
      // Capability/context must be supplied by the future trusted server, not query params.
      const safeContext=structuredClone(context),safeRequest=structuredClone(request);
      if(typeof safeContext?.tenantId!=='string'||typeof safeContext?.caseId!=='string'||!safeContext.tenantId||!safeContext.caseId||safeRequest.caseId!==safeContext.caseId) throw Error('Invalid context');
      const raw=await Promise.race([Promise.resolve().then(()=>invoke(structuredClone(safeRequest),{...safeContext,signal:controller.signal})),new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('Timeout'));},timeoutMs);})]);
      if(validateContract(raw,safeRequest,safeContext)!==true)throw Error('Contract rejected');
      return {ok:true,view:validateView(mapToView(raw,safeContext),safeContext)};
    }catch {
      // Never render malformed/private/raw error payloads or infer a positive fallback.
      return {ok:false,view:null,error:'Die Antwort ist nicht verfügbar oder nicht freigegeben. Keine Auswahlbestätigung.'};
    }finally{clearTimeout(timer);controller.abort();}
  };
}
