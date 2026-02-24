-- EASTLANE brands schema + products.brand_id (phase 1)
-- Run in Supabase SQL Editor

create table if not exists public.brands (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null,
  group_key text not null,
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
    where conname = 'brands_name_unique'
      and conrelid = 'public.brands'::regclass
  ) then
    alter table public.brands add constraint brands_name_unique unique (name);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'brands_slug_unique'
      and conrelid = 'public.brands'::regclass
  ) then
    alter table public.brands add constraint brands_slug_unique unique (slug);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'brands_slug_format_check'
      and conrelid = 'public.brands'::regclass
  ) then
    alter table public.brands add constraint brands_slug_format_check check (slug ~ '^[a-z0-9-]+$');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'brands_group_key_check'
      and conrelid = 'public.brands'::regclass
  ) then
    alter table public.brands add constraint brands_group_key_check check (
      group_key in ('sport-streetwear', 'mass-market-casual', 'premium-designer', 'outdoor')
    );
  end if;
end
$$;

create index if not exists idx_brands_group_key on public.brands(group_key);
create index if not exists idx_brands_sort_order on public.brands(sort_order);
create index if not exists idx_brands_is_active on public.brands(is_active);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_brands_updated_at on public.brands;
create trigger trg_brands_updated_at
before update on public.brands
for each row execute function public.set_updated_at();

alter table public.products
  add column if not exists brand_id bigint references public.brands(id) on delete restrict;

create index if not exists idx_products_brand_id on public.products(brand_id);
