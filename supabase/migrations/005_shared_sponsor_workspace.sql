-- VDS: allow one shared sponsor workspace used by BOTH Bidding and Dana Paramita.
-- Safe to run on the existing production database; existing rows are preserved.

alter table public.app_state
  drop constraint if exists app_state_site_check;

alter table public.app_state
  add constraint app_state_site_check
  check (site in ('bidding', 'dana', 'sponsor'));

-- The previous merge function rejected every site except bidding and dana.
-- Sponsor payloads share the same table but do not contain transaction data.
create or replace function public.merge_vds_app_state(
  p_site text,
  p_payload jsonb,
  p_updated_by uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_site not in ('bidding', 'dana', 'sponsor') then
    raise exception 'Website tidak valid';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Payload tidak valid';
  end if;

  insert into public.app_state(site, payload, updated_by, updated_at)
  values (
    p_site,
    jsonb_set(
      jsonb_set(
        p_payload,
        '{transactions}',
        public.merge_vds_json_array('[]'::jsonb, p_payload->'transactions'),
        true
      ),
      '{history}',
      public.merge_vds_json_array('[]'::jsonb, p_payload->'history'),
      true
    ),
    p_updated_by,
    now()
  )
  on conflict (site) do update set
    payload = jsonb_set(
      jsonb_set(
        excluded.payload,
        '{transactions}',
        public.merge_vds_json_array(public.app_state.payload->'transactions', excluded.payload->'transactions'),
        true
      ),
      '{history}',
      public.merge_vds_json_array(public.app_state.payload->'history', excluded.payload->'history'),
      true
    ),
    updated_by = excluded.updated_by,
    updated_at = now();
end;
$$;

revoke all on function public.merge_vds_app_state(text, jsonb, uuid) from public, anon, authenticated;
grant execute on function public.merge_vds_app_state(text, jsonb, uuid) to service_role;
