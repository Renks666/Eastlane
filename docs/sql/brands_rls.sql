-- EASTLANE brands RLS (hard reset)
-- Run in Supabase SQL Editor

alter table public.brands enable row level security;

do $$
declare p record;
begin
  -- Remove all policies regardless of previous names.
  for p in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'brands'
      and cmd in ('ALL', 'SELECT', 'INSERT', 'UPDATE', 'DELETE')
  loop
    execute format('drop policy if exists %I on public.brands;', p.policyname);
  end loop;
end
$$;

create policy brands_public_select
  on public.brands
  for select
  to anon, authenticated
  using (true);

create policy brands_admin_insert
  on public.brands
  for insert
  to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy brands_admin_update
  on public.brands
  for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy brands_admin_delete
  on public.brands
  for delete
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
