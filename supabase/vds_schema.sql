-- VDS online schema extension
-- Run in Supabase SQL Editor after the earlier VDS profiles/app_state setup.

create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists must_change_password boolean not null default true,
  add column if not exists permissions jsonb not null default
    '{"siteBidding":false,"siteDana":false}'::jsonb,
  add column if not exists active boolean not null default true,
  add column if not exists username text;

create unique index if not exists profiles_username_lower_uidx
  on public.profiles (lower(username))
  where username is not null;

create table if not exists public.app_state (
  site text primary key check (site in ('bidding','dana')),
  payload jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.app_state enable row level security;

-- Client access is intentionally denied. The vds-api Edge Function uses
-- the server-only service role after validating the user's Supabase session.
drop policy if exists "vds_profiles_deny_client" on public.profiles;
create policy "vds_profiles_deny_client"
on public.profiles for all to anon, authenticated
using (false) with check (false);

drop policy if exists "vds_app_state_deny_client" on public.app_state;
create policy "vds_app_state_deny_client"
on public.app_state for all to anon, authenticated
using (false) with check (false);

-- The first admin is created by the Edge Function bootstrap action.
-- Do not insert password hashes or service-role keys in SQL/browser code.
