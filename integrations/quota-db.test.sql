-- Run with the project admin SQL connection while live requests are disabled. All fixtures roll back.
begin;
set local role service_role;
do $test$
declare r jsonb; i integer; u uuid:='00000000-0000-4000-8000-000000000099';
begin
  delete from fitment_private.marketplace_quota;
  for i in 1..5 loop
    r:=public.marketplace_reserve_quota(u,'ebay');
    assert (r->>'allowed')::boolean;
  end loop;
  r:=public.marketplace_reserve_quota(u,'amazon');
  assert not (r->>'allowed')::boolean;
  assert (r->>'retry_after_seconds')::integer between 1 and 60;
  delete from fitment_private.marketplace_quota;
  insert into fitment_private.marketplace_quota values('global:minute',date_trunc('minute',clock_timestamp()),20);
  r:=public.marketplace_reserve_quota(u,'ebay');
  assert not (r->>'allowed')::boolean;
  assert (select count(*) from fitment_private.marketplace_quota)=1;
  delete from fitment_private.marketplace_quota;
  insert into fitment_private.marketplace_quota values('provider:ebay:day',date_trunc('day',clock_timestamp() at time zone 'UTC') at time zone 'UTC',100);
  r:=public.marketplace_reserve_quota(u,'ebay');
  assert not (r->>'allowed')::boolean;
  r:=public.marketplace_reserve_quota(u,'amazon');
  assert (r->>'allowed')::boolean;
  assert not (public.marketplace_reserve_quota(null,'ebay')->>'allowed')::boolean;
end;
$test$;
rollback;

select has_function_privilege('anon','public.marketplace_reserve_quota(uuid,text)','execute') as anon_execute,
has_function_privilege('authenticated','public.marketplace_reserve_quota(uuid,text)','execute') as user_execute,
has_function_privilege('service_role','public.marketplace_reserve_quota(uuid,text)','execute') as server_execute,
has_table_privilege('anon','fitment_private.marketplace_quota','select') as anon_read,
(select relrowsecurity from pg_class where oid='fitment_private.marketplace_quota'::regclass) as rls_enabled;
