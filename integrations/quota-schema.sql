-- Initial schema setup; deliberately not a fabricated Supabase CLI migration.
begin;
create schema if not exists fitment_private;
revoke all on schema fitment_private from public, anon, authenticated;
grant usage on schema fitment_private to service_role;

create table if not exists fitment_private.marketplace_quota (
  scope text not null,
  bucket timestamptz not null,
  used integer not null check (used >= 0),
  primary key (scope, bucket)
);
create index if not exists marketplace_quota_bucket_idx on fitment_private.marketplace_quota(bucket);
alter table fitment_private.marketplace_quota enable row level security;
drop policy if exists marketplace_no_client_access on fitment_private.marketplace_quota;
create policy marketplace_no_client_access on fitment_private.marketplace_quota
  as restrictive for all to anon, authenticated using (false) with check (false);
revoke all on fitment_private.marketplace_quota from public, anon, authenticated;
grant select, insert, update, delete on fitment_private.marketplace_quota to service_role;

create or replace function public.marketplace_reserve_quota(p_user_id uuid, p_provider text)
returns jsonb language plpgsql security invoker
set search_path = '' set lock_timeout = '2s'
as $$
declare
  v_now timestamptz;
  v_minute timestamptz;
  v_day timestamptz;
  v_scopes text[];
  v_buckets timestamptz[];
  v_limits integer[] := array[5,20,100];
  v_used integer;
  v_retry integer;
  i integer;
begin
  if p_user_id is null or p_provider is null or p_provider not in ('ebay','amazon') then
    return jsonb_build_object('allowed',false,'reason','invalid_request');
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('universal-fitment-marketplace-quota-v1'));
  v_now := pg_catalog.clock_timestamp();
  v_minute := pg_catalog.date_trunc('minute',v_now);
  v_day := pg_catalog.date_trunc('day',v_now at time zone 'UTC') at time zone 'UTC';
  v_scopes := array['user:'||p_user_id::text||':minute','global:minute','provider:'||p_provider||':day'];
  v_buckets := array[v_minute,v_minute,v_day];
  delete from fitment_private.marketplace_quota where bucket < v_now - interval '2 days';
  for i in 1..3 loop
    select used into v_used from fitment_private.marketplace_quota where scope=v_scopes[i] and bucket=v_buckets[i];
    if coalesce(v_used,0)>=v_limits[i] then
      v_retry := greatest(1,ceil(extract(epoch from (v_buckets[i]+case when i=3 then interval '1 day' else interval '1 minute' end-v_now)))::integer);
      return jsonb_build_object('allowed',false,'reason','quota_exceeded','retry_after_seconds',v_retry);
    end if;
  end loop;
  for i in 1..3 loop
    insert into fitment_private.marketplace_quota(scope,bucket,used) values(v_scopes[i],v_buckets[i],1)
      on conflict(scope,bucket) do update set used=fitment_private.marketplace_quota.used+1;
  end loop;
  return jsonb_build_object('allowed',true,'minute_bucket',v_minute,'day_bucket',v_day);
end;
$$;
revoke execute on function public.marketplace_reserve_quota(uuid,text) from public, anon, authenticated;
grant execute on function public.marketplace_reserve_quota(uuid,text) to service_role;
commit;
