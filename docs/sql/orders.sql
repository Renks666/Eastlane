-- EASTLANE orders schema
-- Run in Supabase SQL Editor

do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('new', 'confirmed', 'processing', 'done', 'cancelled');
  end if;
end
$$;

create table if not exists public.orders (
  id bigint generated always as identity primary key,
  customer_name text,
  customer_phone text,
  contact_channel text not null default 'telegram',
  contact_value text,
  comment text,
  total_amount numeric(12,2) not null default 0,
  status public.order_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  product_id bigint references public.products(id) on delete set null,
  product_name_snapshot text not null,
  size_snapshot text,
  price_snapshot numeric(12,2) not null,
  quantity integer not null check (quantity > 0),
  line_total numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_order_items_order_id on public.order_items(order_id);

-- Optional trigger to update updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();
