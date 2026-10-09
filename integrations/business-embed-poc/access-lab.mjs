// Pure, in-memory architecture demonstrator. These are NOT credentials or server IAM.
export const roleScopes=Object.freeze({reader:Object.freeze(['fitment:read']),reviewer:Object.freeze(['fitment:read','evidence:read']),admin:Object.freeze(['fitment:read','evidence:read','audit:read'])});
const knownTenants=['atelier','nordlicht'];
const actions=['fitment:read','evidence:read','audit:read'];
export function demoPrincipal(tenantId,role,now) {
 if(!knownTenants.includes(tenantId)||!Object.hasOwn(roleScopes,role))throw Error('Unknown demo principal');
 return {id:'SYN-ACTOR-'+tenantId+'-'+role,tenantId,role,token:{id:'SYN-TOKEN-'+role,tenantId,scopes:[...roleScopes[role]],expiresAt:now+60000,revoked:false}};
}
export function authorize(principal,request,now) {
 if(!Number.isFinite(now)||!principal||!request||!knownTenants.includes(principal.tenantId)||request.tenantId!==principal.tenantId)return 'TENANT_DENIED';
 if(!Object.hasOwn(roleScopes,principal.role)||!actions.includes(request.action)||!roleScopes[principal.role].includes(request.action))return 'ROLE_DENIED';
 const token=principal.token;
 if(!token||token.tenantId!==principal.tenantId||token.revoked!==false||!Number.isFinite(token.expiresAt)||token.expiresAt<=now||!Array.isArray(token.scopes)||!token.scopes.includes(request.action))return 'TOKEN_DENIED';
 if(request.usage!=='private-test')return 'PRODUCTION_DENIED';
 const grant=request.grant;
 if(!grant||grant.kind!=='synthetic'||grant.rights!=='private-test-only'||!['public','tenant'].includes(grant.scope)||
  (grant.scope==='tenant'?grant.tenantId!==principal.tenantId:grant.tenantId!==null)||!Number.isFinite(grant.expiresAt)||grant.expiresAt<=now||grant.revoked!==false)return 'FEED_RIGHTS_DENIED';
 return 'ALLOWED';
}
export function demoGrant(tenantId,scope,now){return {id:'SYN-FEED-'+scope,kind:'synthetic',scope,tenantId:scope==='tenant'?tenantId:null,rights:'private-test-only',expiresAt:now+60000,revoked:false};}
export function cacheKey({tenantId,role,grantVersion,contractVersion,caseId}) {
 const values=[tenantId,role,grantVersion,contractVersion,caseId];
 if(values.some(v=>typeof v!=='string'||!v||v.length>100))throw Error('Invalid cache key');
 return JSON.stringify(values); // Concept only: no actual caching in this demo.
}
export function createAccessLab({clock=()=>Date.now(),limit=8,windowMs=60000,retentionMs=300000,maxEvents=50}={}) {
 if(!Number.isInteger(limit)||limit<1||!Number.isFinite(windowMs)||windowMs<=0||!Number.isFinite(retentionMs)||retentionMs<=0||!Number.isInteger(maxEvents)||maxEvents<1)throw Error('Invalid limits');
 let events=[],buckets=new Map(),sequence=0;
 const purge=now=>{events=events.filter(e=>now-e.at<retentionMs);for(const [key,b] of buckets)if(now-b.start>=windowMs)buckets.delete(key);};
 return {
  check(principal,request){
   const now=clock();if(!Number.isFinite(now))throw Error('Invalid clock');purge(now);
   let decision=authorize(principal,request,now),retryAfterMs=0;
   if(decision==='ALLOWED'){
    const key=principal.tenantId;let b=buckets.get(key);if(!b){b={start:now,count:0};buckets.set(key,b);}
    if(b.count>=limit){decision='RATE_LIMITED';retryAfterMs=Math.max(0,windowMs-(now-b.start));}else b.count++;
   }
   // Fixed fields only. Never persist search text, devices, tokens, raw payloads or secrets.
   events.push({sequence:++sequence,at:now,tenantId:knownTenants.includes(principal?.tenantId)?principal.tenantId:'denied',role:Object.hasOwn(roleScopes,principal?.role)?principal.role:'denied',action:actions.includes(request?.action)?request.action:'denied',decision});
   events=events.slice(-maxEvents);
   return {allowed:decision==='ALLOWED',decision,retryAfterMs};
  },
  audit(principal){
   const now=clock();purge(now);
   const request={tenantId:principal?.tenantId,action:'audit:read',usage:'private-test',grant:demoGrant(principal?.tenantId,'tenant',now)};
   if(authorize(principal,request,now)!=='ALLOWED')throw Error('Audit access denied');
   return structuredClone(events.filter(e=>e.tenantId===principal.tenantId));
  },
  clear(){events=[];buckets.clear();}
 };
}
