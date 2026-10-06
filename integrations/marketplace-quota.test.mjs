import assert from 'node:assert/strict';
import { createQuotaReservation } from './marketplace-quota.mjs';
const env={SUPABASE_URL:'https://example.invalid',SUPABASE_SERVICE_ROLE_KEY:'test-legacy-server-key'};
let calls=0;
const reserve=createQuotaReservation({env,fetchImpl:async(url,options)=>{
  calls++;assert.equal(url,'https://example.invalid/rest/v1/rpc/marketplace_reserve_quota');
  assert.equal(options.headers.Authorization,'Bearer test-legacy-server-key');
  assert.deepEqual(JSON.parse(options.body),{p_user_id:'user-fixture',p_provider:'ebay'});
  return Response.json({allowed:true,minute_bucket:'ignored'});
}});
assert.deepEqual(await reserve('user-fixture','ebay'),{allowed:true});assert.equal(calls,1);
for(const result of [{allowed:false,reason:'quota_exceeded',retry_after_seconds:42}]){
  const limited=createQuotaReservation({env,fetchImpl:async()=>Response.json(result)});
  assert.deepEqual(await limited('user-fixture','ebay'),{allowed:false,retryAfterSeconds:42});
}
for(const result of [{allowed:false,reason:'invalid_request'},{allowed:'true'},{allowed:false,reason:'quota_exceeded',retry_after_seconds:-1}]){
  const invalid=createQuotaReservation({env,fetchImpl:async()=>Response.json(result)});
  await assert.rejects(invalid('user-fixture','ebay'));
}
const down=createQuotaReservation({env,fetchImpl:async()=>new Response(null,{status:500})});await assert.rejects(down('user-fixture','ebay'));
const absent=createQuotaReservation({env:{},fetchImpl:async()=>{throw new Error('Must not fetch');}});await assert.rejects(absent('user-fixture','ebay'));
const modern=createQuotaReservation({env:{SUPABASE_URL:env.SUPABASE_URL,SUPABASE_SECRET_KEYS:JSON.stringify({default:'sb_secret_test_fixture'})},fetchImpl:async(url,options)=>{
  assert.equal(options.headers.apikey,'sb_secret_test_fixture');assert.equal(options.headers.Authorization,undefined);return Response.json({allowed:true});
}});assert.deepEqual(await modern('user-fixture','amazon'),{allowed:true});
console.log('Quota client checks passed: server credentials only, explicit grants, denied/invalid budgets and failures close access.');
