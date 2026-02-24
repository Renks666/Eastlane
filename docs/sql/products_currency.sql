-- Add explicit product price currency
-- Run in Supabase SQL Editor

alter table public.products
  add column if not exists price_currency text not null default 'RUB';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_price_currency_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_price_currency_check
      check (price_currency in ('RUB', 'CNY'));
  end if;
end
$$;

create index if not exists idx_products_price_currency on public.products(price_currency);

