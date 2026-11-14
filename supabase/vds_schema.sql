-- SIAKANG VDS cloud schema. Run once in Supabase SQL Editor.
-- This backend keeps browser access to profiles/app_state blocked; Edge Function
-- uses the server-side service role after validating each user's access.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  role text not null default 'user' check (role in ('admin','user')),
  active boolean not null default true,
  permissions jsonb not null default '{}'::jsonb,
  must_change_password boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists active boolean not null default true;
alter table public.profiles add column if not exists permissions jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists must_change_password boolean not null default true;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
create unique index if not exists profiles_username_lower_uidx
  on public.profiles (lower(username)) where username is not null;

create table if not exists public.app_state (
  site text primary key check (site in ('bidding','dana')),
  payload jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare uname text;
begin
  uname := lower(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)));
  insert into public.profiles (id, username, role, active, permissions, must_change_password)
  values (new.id, uname, 'user', true, '{}'::jsonb, true)
  on conflict (id) do update set username = excluded.username;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.app_state enable row level security;

-- Remove any pre-existing policies on these two application tables so an older
-- permissive policy cannot accidentally grant browser access.
do $$
declare pol record;
begin
  for pol in select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename in ('profiles','app_state')
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

create policy vds_profiles_deny_client on public.profiles
  for all to anon, authenticated using (false) with check (false);
create policy vds_app_state_deny_client on public.app_state
  for all to anon, authenticated using (false) with check (false);
