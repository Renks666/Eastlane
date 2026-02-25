-- EASTLANE brands seed
-- Run after docs/sql/brands.sql

insert into public.brands (name, slug, sort_order, is_active)
values
  ('Nike', 'nike', 10, true),
  ('Adidas', 'adidas', 20, true),
  ('Puma', 'puma', 30, true),
  ('New Balance', 'new-balance', 40, true),
  ('Reebok', 'reebok', 50, true),
  ('Under Armour', 'under-armour', 60, true),
  ('Converse', 'converse', 70, true),
  ('Vans', 'vans', 80, true),

  ('Zara', 'zara', 10, true),
  ('H&M', 'h-m', 20, true),
  ('Uniqlo', 'uniqlo', 30, true),
  ('Pull&Bear', 'pull-bear', 40, true),
  ('Bershka', 'bershka', 50, true),
  ('Stradivarius', 'stradivarius', 60, true),
  ('Mango', 'mango', 70, true),

  ('Tommy Hilfiger', 'tommy-hilfiger', 10, true),
  ('Calvin Klein', 'calvin-klein', 20, true),
  ('Ralph Lauren', 'ralph-lauren', 30, true),
  ('Hugo Boss', 'hugo-boss', 40, true),
  ('Armani', 'armani', 50, true),
  ('Lacoste', 'lacoste', 60, true),

  ('The North Face', 'the-north-face', 10, true),
  ('Columbia', 'columbia', 20, true),
  ('Patagonia', 'patagonia', 30, true),
  ('Salomon', 'salomon', 40, true),
  ('Other / Drugoi', 'other', 999, true)
on conflict (slug) do update set
  name = excluded.name,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
