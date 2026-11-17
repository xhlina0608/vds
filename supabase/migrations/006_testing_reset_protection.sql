-- VDS testing-data reset protection
-- A newer reset marker makes stale browser snapshots unable to resurrect deleted rows.
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
declare
  v_existing jsonb;
  v_existing_reset timestamptz;
  v_incoming_reset timestamptz;
  v_transactions jsonb;
  v_history jsonb;
begin
  if p_site not in ('bidding','dana') then
    raise exception 'Website tidak valid';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Payload tidak valid';
  end if;

  select payload into v_existing
  from public.app_state where site = p_site for update;

  v_existing_reset := nullif(v_existing->>'_testing_reset_at','')::timestamptz;
  v_incoming_reset := nullif(p_payload->>'_testing_reset_at','')::timestamptz;

  if v_existing is null then
    v_transactions := public.merge_vds_json_array('[]'::jsonb, p_payload->'transactions');
    v_history := public.merge_vds_json_array('[]'::jsonb, p_payload->'history');
  elsif v_existing_reset is not null and
        (v_incoming_reset is null or v_incoming_reset < v_existing_reset) then
    -- Old browser state: preserve server's post-reset transactions and history.
    v_transactions := coalesce(v_existing->'transactions','[]'::jsonb);
    v_history := coalesce(v_existing->'history','[]'::jsonb);
  elsif v_incoming_reset is not null and
        (v_existing_reset is null or v_incoming_reset > v_existing_reset) then
    -- Explicit newer reset: accept its empty/replacement arrays.
    v_transactions := coalesce(p_payload->'transactions','[]'::jsonb);
    v_history := coalesce(p_payload->'history','[]'::jsonb);
  else
    v_transactions := public.merge_vds_json_array(v_existing->'transactions', p_payload->'transactions');
    v_history := public.merge_vds_json_array(v_existing->'history', p_payload->'history');
  end if;

  insert into public.app_state(site, payload, updated_by, updated_at)
  values (
    p_site,
    jsonb_set(jsonb_set(p_payload, '{transactions}', v_transactions, true),
              '{history}', v_history, true),
    p_updated_by, now()
  )
  on conflict (site) do update set
    payload = jsonb_set(
      jsonb_set(excluded.payload, '{transactions}', v_transactions, true),
      '{history}', v_history, true
    ),
    updated_by = excluded.updated_by,
    updated_at = now();
end;
$$;
