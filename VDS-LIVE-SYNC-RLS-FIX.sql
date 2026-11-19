-- VDS Live Sync RLS repair
-- Root cause: profiles is intentionally blocked for browser clients by RLS.
-- A direct EXISTS(SELECT ... FROM profiles) inside the vds_sync_events
-- policy is therefore also filtered by profiles RLS and denies every event.
-- This SECURITY DEFINER helper checks only the signed-in user's own profile
-- while bypassing profiles RLS; it returns a boolean and exposes no profile data.

create or replace function public.vds_can_read_sync_event(p_site text)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $function$
  select coalesce(
    p_site in ('bidding', 'dana')
    and exists (
      select 1
      from public.profiles as p
      where p.id = auth.uid()
        and p.active is distinct from false
        and (
          lower(coalesce(p.role, '')) = 'admin'
          or coalesce(p.permissions, '{}'::jsonb) @> jsonb_build_object(
            case
              when p_site = 'bidding' then 'siteBidding'
              else 'siteDana'
            end,
            true
          )
        )
    ),
    false
  );
$function$;

-- Only authenticated sessions may call the helper.
revoke all on function public.vds_can_read_sync_event(text) from public;
revoke all on function public.vds_can_read_sync_event(text) from anon;
grant execute on function public.vds_can_read_sync_event(text) to authenticated;

-- Keep the event table readable only through the per-user policy below.
alter table public.vds_sync_events enable row level security;
revoke all on table public.vds_sync_events from anon, authenticated;
grant select on table public.vds_sync_events to authenticated;

drop policy if exists "VDS users read permitted site events" on public.vds_sync_events;
create policy "VDS users read permitted site events"
on public.vds_sync_events
for select
to authenticated
using (public.vds_can_read_sync_event(site));

-- Verification: helper must be SECURITY DEFINER and policy must call it.
select
  p.proname as function_name,
  p.prosecdef as security_definer,
  pg_get_functiondef(p.oid) like '%auth.uid()%' as checks_signed_in_user
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'vds_can_read_sync_event';

select
  policyname,
  roles,
  cmd,
  qual
from pg_policies
where schemaname = 'public'
  and tablename = 'vds_sync_events'
  and policyname = 'VDS users read permitted site events';
