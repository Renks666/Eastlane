-- EASTLANE product colors RLS (hard reset)
-- Run in Supabase SQL Editor

alter table public.product_colors enable row level security;

do $$
declare p record;
begin
  for p in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'product_colors'
      and cmd in ('ALL', 'SELECT', 'INSERT', 'UPDATE', 'DELETE')
  loop
    execute format('drop policy if exists %I on public.product_colors;', p.policyname);
  end loop;
end
$$;

create policy product_colors_public_select
  on public.product_colors
  for select
  to anon, authenticated
  using (true);

create policy product_colors_admin_insert
  on public.product_colors
  for insert
  to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy product_colors_admin_update
  on public.product_colors
  for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy product_colors_admin_delete
  on public.product_colors
  for delete
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
