import assert from 'node:assert/strict';
import {createPilotAuthorization} from './marketplace-pilot.mjs';
const userId='00000000-0000-4000-8000-000000000001';
let allowed=false,http=200;
const env={SUPABASE_URL:'https://project.invalid',SUPABASE_SECRET_KEYS:JSON.stringify({default:'sb_secret_synthetic'})};
const authorize=createPilotAuthorization({env,fetchImpl:async(url,options)=>{
  assert.equal(url,'https://project.invalid/rest/v1/rpc/marketplace_check_pilot');
  assert.equal(options.headers.apikey,'sb_secret_synthetic');assert.equal(options.headers.Authorization,undefined);
  assert.ok([null,userId].includes(JSON.parse(options.body).p_user_id));
  return Response.json({allowed},{status:http});
}});
assert.equal(await authorize.probe(),true);assert.equal(await authorize(userId),false);
allowed=true;assert.equal(await authorize(userId),true);assert.equal(await authorize.probe(),false,'invalid probe cannot be accepted');
allowed=false;http=503;await assert.rejects(authorize(userId));
for(const value of [{},{allowed:'true'},null]){
  const malformed=createPilotAuthorization({env,fetchImpl:async()=>Response.json(value)});await assert.rejects(malformed(userId));
}
const noKey=createPilotAuthorization({env:{},fetchImpl:async()=>{throw new Error('must not send');}});await assert.rejects(noKey(userId));
const legacy=createPilotAuthorization({env:{SUPABASE_URL:env.SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY:'synthetic-legacy'},fetchImpl:async(url,options)=>{
  assert.equal(options.headers.Authorization,'Bearer synthetic-legacy');return Response.json({allowed:false});
}});assert.equal(await legacy(userId),false);
console.log('Pilot authorization contracts passed: server credentials, read-only probe, deny/allow, strict response and fail-closed errors. Synthetic calls only.');
