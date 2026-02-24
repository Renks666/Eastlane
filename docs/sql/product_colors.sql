-- EASTLANE product colors dictionary
-- Run in Supabase SQL Editor

create table if not exists public.product_colors (
  id bigint generated always as identity primary key,
  value text not null,
  value_normalized text not null,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'product_colors_value_normalized_unique'
      and conrelid = 'public.product_colors'::regclass
  ) then
    alter table public.product_colors
      add constraint product_colors_value_normalized_unique unique (value_normalized);
  end if;
end
$$;

create index if not exists idx_product_colors_is_active on public.product_colors(is_active);
create index if not exists idx_product_colors_sort_order on public.product_colors(sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_product_colors_updated_at on public.product_colors;
create trigger trg_product_colors_updated_at
before update on public.product_colors
for each row execute function public.set_updated_at();
