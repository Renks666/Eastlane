-- Add currency snapshots for orders and order_items
-- Run in Supabase SQL Editor

alter table public.orders
  add column if not exists total_currency text not null default 'RUB',
  add column if not exists exchange_rate_snapshot numeric(12,6),
  add column if not exists total_amount_rub_approx numeric(12,2);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_total_currency_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_total_currency_check
      check (total_currency in ('RUB', 'CNY'));
  end if;
end
$$;

alter table public.order_items
  add column if not exists price_currency_snapshot text not null default 'RUB',
  add column if not exists line_total_rub_approx numeric(12,2) not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'order_items_price_currency_snapshot_check'
      and conrelid = 'public.order_items'::regclass
  ) then
    alter table public.order_items
      add constraint order_items_price_currency_snapshot_check
      check (price_currency_snapshot in ('RUB', 'CNY'));
  end if;
end
$$;

create index if not exists idx_orders_total_currency on public.orders(total_currency);
create index if not exists idx_order_items_price_currency_snapshot on public.order_items(price_currency_snapshot);

