-- EASTLANE exchange rate section seed
-- Run in Supabase SQL Editor

insert into public.site_sections (section_key, title, payload, is_published)
values (
  'exchange_rate',
  'Курс CNY/RUB',
  jsonb_build_object('cnyPerRub', 0.09),
  true
)
on conflict (section_key)
do update set
  title = excluded.title,
  payload = excluded.payload,
  is_published = excluded.is_published,
  updated_at = now();

