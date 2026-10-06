export function createQuotaReservation({env,fetchImpl=fetch}){
  let secret;
  try{secret=JSON.parse(env.SUPABASE_SECRET_KEYS||'{}').default;}catch{}
  const key=(typeof secret==='string'?(env[secret]||secret):null)||env.SUPABASE_SERVICE_ROLE_KEY;
  const call=async(userId,provider)=>{
    if(!env.SUPABASE_URL||!key)throw new Error('Quota configuration missing');
    const headers={'Content-Type':'application/json',apikey:key};
    if(!key.startsWith('sb_secret_'))headers.Authorization=`Bearer ${key}`;
    const response=await fetchImpl(`${env.SUPABASE_URL}/rest/v1/rpc/marketplace_reserve_quota`,{
      method:'POST',headers,body:JSON.stringify({p_user_id:userId,p_provider:provider}),signal:AbortSignal.timeout(5000)
    });
    if(!response.ok)throw new Error('Quota backend unavailable');
    return response.json();
  };
  const reserve=async(userId,provider)=>{
    const result=await call(userId,provider);
    if(result?.allowed===true)return {allowed:true};
    if(result?.allowed===false&&result.reason==='quota_exceeded'&&Number.isInteger(result.retry_after_seconds)&&
      result.retry_after_seconds>=1&&result.retry_after_seconds<=86400)return {allowed:false,retryAfterSeconds:result.retry_after_seconds};
    throw new Error('Invalid quota response');
  };
  // Invalid arguments prove RPC permissions without reserving a slot or storing a user ID.
  reserve.probe=async()=>{const result=await call(null,null);return result?.allowed===false&&result.reason==='invalid_request';};
  return reserve;
}
