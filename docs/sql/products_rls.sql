-- EASTLANE products write-access RLS (hard reset)
-- Run in Supabase SQL Editor
-- Goal: remove conflicting write policies and keep only admin role based rules

alter table public.products enable row level security;

do $$
declare p record;
begin
  -- Remove all write policies regardless of previous names.
  for p in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and cmd in ('ALL', 'INSERT', 'UPDATE', 'DELETE')
  loop
    execute format('drop policy if exists %I on public.products;', p.policyname);
  end loop;
end
$$;

create policy products_admin_insert
  on public.products
  for insert
  to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy products_admin_update
  on public.products
  for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy products_admin_delete
  on public.products
  for delete
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
