-- Initial setup SQL; apply through the project SQL connection. No CLI migration history claimed.
begin;
create schema if not exists fitment_private;
create table if not exists fitment_private.marketplace_pilots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  constraint marketplace_pilot_window check (expires_at > granted_at and expires_at <= granted_at + interval '90 days')
);
alter table fitment_private.marketplace_pilots enable row level security;
create policy marketplace_pilot_no_client_access on fitment_private.marketplace_pilots
  as restrictive for all to anon, authenticated using (false) with check (false);
revoke all on schema fitment_private from public, anon, authenticated;
revoke all on fitment_private.marketplace_pilots from public, anon, authenticated, service_role;
grant usage on schema fitment_private to service_role;
grant select on fitment_private.marketplace_pilots to service_role;

create or replace function public.marketplace_check_pilot(p_user_id uuid)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object('allowed', exists (
    select 1 from fitment_private.marketplace_pilots p
    where p.user_id = p_user_id and p.revoked_at is null
      and p.granted_at <= now() and p.expires_at > now()
  ));
$$;
revoke all on function public.marketplace_check_pilot(uuid) from public, anon, authenticated;
grant execute on function public.marketplace_check_pilot(uuid) to service_role;
commit;
