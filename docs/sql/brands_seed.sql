-- EASTLANE brands seed
-- Run after docs/sql/brands.sql

insert into public.brands (name, slug, group_key, sort_order, is_active)
values
  ('Nike', 'nike', 'sport-streetwear', 10, true),
  ('Adidas', 'adidas', 'sport-streetwear', 20, true),
  ('Puma', 'puma', 'sport-streetwear', 30, true),
  ('New Balance', 'new-balance', 'sport-streetwear', 40, true),
  ('Reebok', 'reebok', 'sport-streetwear', 50, true),
  ('Under Armour', 'under-armour', 'sport-streetwear', 60, true),
  ('Converse', 'converse', 'sport-streetwear', 70, true),
  ('Vans', 'vans', 'sport-streetwear', 80, true),

  ('Zara', 'zara', 'mass-market-casual', 10, true),
  ('H&M', 'h-m', 'mass-market-casual', 20, true),
  ('Uniqlo', 'uniqlo', 'mass-market-casual', 30, true),
  ('Pull&Bear', 'pull-bear', 'mass-market-casual', 40, true),
  ('Bershka', 'bershka', 'mass-market-casual', 50, true),
  ('Stradivarius', 'stradivarius', 'mass-market-casual', 60, true),
  ('Mango', 'mango', 'mass-market-casual', 70, true),

  ('Tommy Hilfiger', 'tommy-hilfiger', 'premium-designer', 10, true),
  ('Calvin Klein', 'calvin-klein', 'premium-designer', 20, true),
  ('Ralph Lauren', 'ralph-lauren', 'premium-designer', 30, true),
  ('Hugo Boss', 'hugo-boss', 'premium-designer', 40, true),
  ('Armani', 'armani', 'premium-designer', 50, true),
  ('Lacoste', 'lacoste', 'premium-designer', 60, true),

  ('The North Face', 'the-north-face', 'outdoor', 10, true),
  ('Columbia', 'columbia', 'outdoor', 20, true),
  ('Patagonia', 'patagonia', 'outdoor', 30, true),
  ('Salomon', 'salomon', 'outdoor', 40, true),
  ('Other / Drugoi', 'other', 'mass-market-casual', 999, true)
on conflict (slug) do update set
  name = excluded.name,
  group_key = excluded.group_key,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
