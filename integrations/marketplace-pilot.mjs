// Server-only authorization, independent of client metadata and provider activation.
export function createPilotAuthorization({env,fetchImpl=fetch}){
  let secret;
  try{secret=JSON.parse(env.SUPABASE_SECRET_KEYS||'{}').default;}catch{}
  const key=(typeof secret==='string'?(env[secret]||secret):null)||env.SUPABASE_SERVICE_ROLE_KEY;
  const authorize=async userId=>{
    if(!env.SUPABASE_URL||!key)throw new Error('Pilot configuration missing');
    const headers={'Content-Type':'application/json',apikey:key};
    if(!key.startsWith('sb_secret_'))headers.Authorization=`Bearer ${key}`;
    const response=await fetchImpl(`${env.SUPABASE_URL}/rest/v1/rpc/marketplace_check_pilot`,{
      method:'POST',headers,body:JSON.stringify({p_user_id:userId}),signal:AbortSignal.timeout(5000)
    });
    if(!response.ok)throw new Error('Pilot backend unavailable');
    const result=await response.json();
    if(typeof result?.allowed!=='boolean')throw new Error('Invalid pilot response');
    return result.allowed;
  };
  // A null ID cannot be admitted; this read-only probe checks the actual RPC connection.
  authorize.probe=async()=>await authorize(null)===false;
  return authorize;
}
