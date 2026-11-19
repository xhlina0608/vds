-- VDS Realtime repair: ensure authenticated users can receive compact transaction events.
-- Run once in Supabase SQL Editor. Does not read or modify app_state or transaction data.

create table if not exists public.vds_sync_events (
  id bigint generated always as identity primary key,
  site text not null check (site in ('bidding','dana')),
  event_payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists vds_sync_events_site_created_idx
  on public.vds_sync_events (site, created_at desc);

alter table public.vds_sync_events enable row level security;
revoke all on public.vds_sync_events from anon, authenticated;
grant select on public.vds_sync_events to authenticated;

drop policy if exists "VDS users read permitted site events" on public.vds_sync_events;
create policy "VDS users read permitted site events"
on public.vds_sync_events for select to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.active is distinct from false
      and (
        lower(coalesce(p.role, '')) = 'admin'
        or p.permissions @> jsonb_build_object(
          case when vds_sync_events.site = 'bidding' then 'siteBidding' else 'siteDana' end,
          true
        )
      )
  )
);

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'vds_sync_events'
     ) then
    alter publication supabase_realtime add table public.vds_sync_events;
  end if;
end $$;

-- Keep only a short event window. Transaction history remains in app_state.
create or replace function public.vds_prune_sync_events()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  delete from public.vds_sync_events where created_at < now() - interval '7 days';
  return new;
end;
$$;
drop trigger if exists vds_prune_sync_events_after_insert on public.vds_sync_events;
create trigger vds_prune_sync_events_after_insert
  after insert on public.vds_sync_events
  for each statement execute function public.vds_prune_sync_events();
revoke all on function public.vds_prune_sync_events() from public, anon, authenticated;
