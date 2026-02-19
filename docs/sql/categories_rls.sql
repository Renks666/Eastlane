-- EASTLANE categories write-access RLS (hard reset)
-- Run in Supabase SQL Editor
-- Goal: remove conflicting write policies and keep only admin role based rules

alter table public.categories enable row level security;

do $$
declare p record;
begin
  -- Remove all write policies regardless of previous names.
  for p in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'categories'
      and cmd in ('ALL', 'INSERT', 'UPDATE', 'DELETE')
  loop
    execute format('drop policy if exists %I on public.categories;', p.policyname);
  end loop;
end
$$;

create policy categories_admin_insert
  on public.categories
  for insert
  to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy categories_admin_update
  on public.categories
  for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy categories_admin_delete
  on public.categories
  for delete
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
