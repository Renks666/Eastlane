-- EASTLANE product sizes RLS (hard reset)
-- Run in Supabase SQL Editor

alter table public.product_sizes enable row level security;

do $$
declare p record;
begin
  for p in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'product_sizes'
      and cmd in ('ALL', 'SELECT', 'INSERT', 'UPDATE', 'DELETE')
  loop
    execute format('drop policy if exists %I on public.product_sizes;', p.policyname);
  end loop;
end
$$;

create policy product_sizes_public_select
  on public.product_sizes
  for select
  to anon, authenticated
  using (true);

create policy product_sizes_admin_insert
  on public.product_sizes
  for insert
  to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy product_sizes_admin_update
  on public.product_sizes
  for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy product_sizes_admin_delete
  on public.product_sizes
  for delete
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
