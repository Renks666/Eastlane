-- EASTLANE normalize products.sizes/products.colors using dictionaries
-- and backfill normalized link tables.
-- Run after:
--   1) product_sizes.sql
--   2) product_colors.sql
--   3) product_attribute_values.sql

-- Ensure dictionaries contain normalized values from products first.
insert into public.product_sizes (value, value_normalized, sort_order, is_active)
select
  min(trim(v)) as value,
  lower(trim(v)) as value_normalized,
  100 as sort_order,
  true as is_active
from public.products p
cross join lateral unnest(coalesce(p.sizes, '{}')) as v
where trim(v) <> ''
group by lower(trim(v))
on conflict (value_normalized) do update set
  value = excluded.value,
  is_active = true;

insert into public.product_colors (value, value_normalized, sort_order, is_active)
select
  min(trim(v)) as value,
  lower(trim(v)) as value_normalized,
  100 as sort_order,
  true as is_active
from public.products p
cross join lateral unnest(coalesce(p.colors, '{}')) as v
where trim(v) <> ''
group by lower(trim(v))
on conflict (value_normalized) do update set
  value = excluded.value,
  is_active = true;

-- Rewrite products.sizes to canonical dictionary values (dedupe by normalized value).
with canonical_sizes as (
  select
    p.id as product_id,
    coalesce(
      array_agg(src.value order by src.ordinality)
        filter (where src.rn = 1 and src.value is not null),
      '{}'::text[]
    ) as values
  from public.products p
  left join lateral (
    select
      u.ordinality,
      s.value,
      s.value_normalized,
      row_number() over (partition by s.value_normalized order by u.ordinality) as rn
    from unnest(coalesce(p.sizes, '{}')) with ordinality as u(raw_value, ordinality)
    left join public.product_sizes s
      on s.value_normalized = lower(trim(u.raw_value))
    where trim(coalesce(u.raw_value, '')) <> ''
  ) src on true
  group by p.id
)
update public.products p
set sizes = canonical_sizes.values
from canonical_sizes
where canonical_sizes.product_id = p.id;

-- Rewrite products.colors to canonical dictionary values (dedupe by normalized value).
with canonical_colors as (
  select
    p.id as product_id,
    coalesce(
      array_agg(src.value order by src.ordinality)
        filter (where src.rn = 1 and src.value is not null),
      '{}'::text[]
    ) as values
  from public.products p
  left join lateral (
    select
      u.ordinality,
      c.value,
      c.value_normalized,
      row_number() over (partition by c.value_normalized order by u.ordinality) as rn
    from unnest(coalesce(p.colors, '{}')) with ordinality as u(raw_value, ordinality)
    left join public.product_colors c
      on c.value_normalized = lower(trim(u.raw_value))
    where trim(coalesce(u.raw_value, '')) <> ''
  ) src on true
  group by p.id
)
update public.products p
set colors = canonical_colors.values
from canonical_colors
where canonical_colors.product_id = p.id;

-- Rebuild normalized link tables from canonical arrays.
delete from public.product_size_values;
delete from public.product_color_values;

insert into public.product_size_values (product_id, size_id)
select distinct
  p.id,
  s.id
from public.products p
cross join lateral unnest(coalesce(p.sizes, '{}')) as raw_value
join public.product_sizes s
  on s.value_normalized = lower(trim(raw_value));

insert into public.product_color_values (product_id, color_id)
select distinct
  p.id,
  c.id
from public.products p
cross join lateral unnest(coalesce(p.colors, '{}')) as raw_value
join public.product_colors c
  on c.value_normalized = lower(trim(raw_value));
