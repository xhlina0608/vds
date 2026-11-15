-- VDS concurrent transaction numbering
-- Run this once in Supabase SQL Editor before deploying the updated vds-api.
create table if not exists public.vds_number_counters (
  site text not null check (site in ('bidding','dana')),
  counter_type text not null check (counter_type in ('bid','invoice')),
  last_value bigint not null default 0 check (last_value >= 0),
  updated_at timestamptz not null default now(),
  primary key (site, counter_type)
);

alter table public.vds_number_counters enable row level security;
revoke all on public.vds_number_counters from anon, authenticated, public;

create or replace function public.allocate_vds_transaction_numbers(
  p_site text,
  p_initial_bid bigint,
  p_initial_invoice bigint
)
returns table(bid_no bigint, invoice_no bigint)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_site not in ('bidding','dana') then
    raise exception 'Website tidak valid';
  end if;

  insert into public.vds_number_counters(site,counter_type,last_value,updated_at)
  values (p_site,'bid',greatest(coalesce(p_initial_bid,0),0)+1,now())
  on conflict (site,counter_type) do update
    set last_value = greatest(public.vds_number_counters.last_value,coalesce(p_initial_bid,0))+1,
        updated_at = now()
  returning last_value into bid_no;

  insert into public.vds_number_counters(site,counter_type,last_value,updated_at)
  values (p_site,'invoice',greatest(coalesce(p_initial_invoice,0),0)+1,now())
  on conflict (site,counter_type) do update
    set last_value = greatest(public.vds_number_counters.last_value,coalesce(p_initial_invoice,0))+1,
        updated_at = now()
  returning last_value into invoice_no;

  return next;
end;
$$;

revoke all on function public.allocate_vds_transaction_numbers(text,bigint,bigint) from public, anon, authenticated;
grant execute on function public.allocate_vds_transaction_numbers(text,bigint,bigint) to service_role;
