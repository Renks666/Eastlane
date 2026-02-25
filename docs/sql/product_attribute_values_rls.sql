-- EASTLANE product attribute link tables RLS (hard reset)
-- Run in Supabase SQL Editor

alter table public.product_size_values enable row level security;
alter table public.product_color_values enable row level security;

do $$
declare p record;
begin
  for p in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'product_size_values'
      and cmd in ('ALL', 'SELECT', 'INSERT', 'UPDATE', 'DELETE')
  loop
    execute format('drop policy if exists %I on public.product_size_values;', p.policyname);
  end loop;

  for p in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'product_color_values'
      and cmd in ('ALL', 'SELECT', 'INSERT', 'UPDATE', 'DELETE')
  loop
    execute format('drop policy if exists %I on public.product_color_values;', p.policyname);
  end loop;
end
$$;

create policy product_size_values_public_select
  on public.product_size_values
  for select
  to anon, authenticated
  using (true);

create policy product_size_values_admin_insert
  on public.product_size_values
  for insert
  to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy product_size_values_admin_update
  on public.product_size_values
  for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy product_size_values_admin_delete
  on public.product_size_values
  for delete
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy product_color_values_public_select
  on public.product_color_values
  for select
  to anon, authenticated
  using (true);

create policy product_color_values_admin_insert
  on public.product_color_values
  for insert
  to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy product_color_values_admin_update
  on public.product_color_values
  for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy product_color_values_admin_delete
  on public.product_color_values
  for delete
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
