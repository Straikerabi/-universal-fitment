-- Read-only checks after the separately authorized initial setup. No pilot user is created/admitted.
begin;
select
  has_function_privilege('anon', 'public.marketplace_check_pilot(uuid)', 'execute') as guest_execute,
  has_function_privilege('authenticated', 'public.marketplace_check_pilot(uuid)', 'execute') as user_execute,
  has_function_privilege('service_role', 'public.marketplace_check_pilot(uuid)', 'execute') as server_execute,
  has_table_privilege('anon', 'fitment_private.marketplace_pilots', 'select') as guest_read,
  has_table_privilege('authenticated', 'fitment_private.marketplace_pilots', 'select') as user_read,
  has_table_privilege('service_role', 'fitment_private.marketplace_pilots', 'select') as server_read,
  has_table_privilege('service_role', 'fitment_private.marketplace_pilots', 'insert') as server_insert;
select relrowsecurity as rls_enabled from pg_class
where oid = 'fitment_private.marketplace_pilots'::regclass;
set local role service_role;
select public.marketplace_check_pilot(null) as invalid_id,
  public.marketplace_check_pilot('00000000-0000-4000-8000-000000000001'::uuid) as missing_pilot;
rollback;
