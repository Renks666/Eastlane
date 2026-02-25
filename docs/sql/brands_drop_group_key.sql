-- EASTLANE brands: drop legacy group_key
-- Run after app code is updated to stop reading/writing group_key.
-- Safe to run multiple times.

begin;

drop index if exists public.idx_brands_group_key;

alter table if exists public.brands
  drop constraint if exists brands_group_key_check;

alter table if exists public.brands
  drop column if exists group_key;

commit;
