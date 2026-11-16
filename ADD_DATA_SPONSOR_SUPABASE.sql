-- SIAKANG VDS: enable independent DATA SPONSOR site storage and permission
-- Run once in Supabase SQL Editor. Does not modify existing Bidding/Dana payloads.
begin;
alter table public.app_state drop constraint if exists app_state_site_check;
alter table public.app_state add constraint app_state_site_check check (site in ('bidding','dana','sponsor'));
-- Existing main admin gets access to the new website. Other users keep their current permissions.
update public.profiles set permissions = coalesce(permissions,'{}'::jsonb) || '{"siteSponsor":true,"sponsorManage":true,"sponsorExport":true}'::jsonb where lower(username)='septino' and role='admin';
commit;
