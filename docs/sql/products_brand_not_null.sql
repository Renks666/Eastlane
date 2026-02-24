-- EASTLANE products brand_id NOT NULL (phase 2)
-- Run only after all products have brand_id filled

do $$
declare missing_count integer;
begin
  select count(*)
  into missing_count
  from public.products
  where brand_id is null;

  if missing_count > 0 then
    raise exception 'Cannot set products.brand_id NOT NULL: % rows are missing brand_id', missing_count;
  end if;
end
$$;

alter table public.products
  alter column brand_id set not null;
