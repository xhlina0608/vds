-- VDS concurrent-safe app_state merge
-- Run once in Supabase SQL Editor. This preserves transaction/history rows
-- submitted by different users even when their browser snapshots are stale.

create or replace function public.merge_vds_json_array(p_existing jsonb, p_incoming jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select coalesce(jsonb_agg(x.value order by x.row_key), '[]'::jsonb)
  from (
    select distinct on (coalesce(v.value->>'id', v.value::text))
      coalesce(v.value->>'id', v.value::text) as row_key,
      v.value
    from (
      select e.value, 0 as priority
      from jsonb_array_elements(case when jsonb_typeof(p_existing)='array' then p_existing else '[]'::jsonb end) e(value)
      union all
      select i.value, 1 as priority
      from jsonb_array_elements(case when jsonb_typeof(p_incoming)='array' then p_incoming else '[]'::jsonb end) i(value)
    ) v
    order by coalesce(v.value->>'id', v.value::text), v.priority desc
  ) x;
$$;

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
  if p_site not in ('bidding','dana') then
    raise exception 'Website tidak valid';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Payload tidak valid';
  end if;

  insert into public.app_state(site, payload, updated_by, updated_at)
  values (
    p_site,
    jsonb_set(
      jsonb_set(p_payload, '{transactions}', public.merge_vds_json_array('[]'::jsonb, p_payload->'transactions'), true),
      '{history}', public.merge_vds_json_array('[]'::jsonb, p_payload->'history'), true
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

revoke all on function public.merge_vds_json_array(jsonb,jsonb) from public, anon, authenticated;
revoke all on function public.merge_vds_app_state(text,jsonb,uuid) from public, anon, authenticated;
grant execute on function public.merge_vds_app_state(text,jsonb,uuid) to service_role;
