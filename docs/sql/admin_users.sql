-- EASTLANE admin users helpers
-- Run in Supabase SQL Editor as project owner (postgres)

-- 1) Grant admin role in app_metadata for both admin emails.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email in ('renks666@gmail.com', 'me@argenoev.ru');

-- 2) Verify role was written.
select
  email,
  raw_app_meta_data ->> 'role' as app_role
from auth.users
where email in ('me@argenoev.ru', 'renks666@gmail.com');
