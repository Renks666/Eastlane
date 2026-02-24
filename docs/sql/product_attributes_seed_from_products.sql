-- EASTLANE backfill sizes/colors dictionaries from existing products
-- Run after product_sizes.sql and product_colors.sql

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
