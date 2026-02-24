-- EASTLANE product sizes dictionary
-- Run in Supabase SQL Editor

create table if not exists public.product_sizes (
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
    where conname = 'product_sizes_value_normalized_unique'
      and conrelid = 'public.product_sizes'::regclass
  ) then
    alter table public.product_sizes
      add constraint product_sizes_value_normalized_unique unique (value_normalized);
  end if;
end
$$;

create index if not exists idx_product_sizes_is_active on public.product_sizes(is_active);
create index if not exists idx_product_sizes_sort_order on public.product_sizes(sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_product_sizes_updated_at on public.product_sizes;
create trigger trg_product_sizes_updated_at
before update on public.product_sizes
for each row execute function public.set_updated_at();
