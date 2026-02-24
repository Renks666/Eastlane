-- Add product seasonality as fixed enum-like text[]
-- Run in Supabase SQL Editor

alter table public.products
  add column if not exists seasons text[] default '{}'::text[];

-- Normalize current data before constraints:
-- trim, lowercase, drop empty values, deduplicate.
update public.products
set seasons = coalesce(
  (
    select array_agg(value order by value)
    from (
      select distinct nullif(lower(trim(item)), '') as value
      from unnest(coalesce(public.products.seasons, '{}'::text[])) as item
    ) normalized
    where value is not null
  ),
  '{}'::text[]
);

-- Backfill legacy products with "summer" when no seasons are set.
update public.products
set seasons = array['summer']::text[]
where seasons is null or cardinality(seasons) = 0;

alter table public.products
  alter column seasons set default '{}'::text[],
  alter column seasons set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_seasons_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_seasons_check
      check (seasons <@ array['winter', 'spring', 'summer', 'autumn']::text[]);
  end if;
end
$$;

create index if not exists idx_products_seasons_gin on public.products using gin (seasons);
