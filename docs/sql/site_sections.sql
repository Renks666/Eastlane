-- EASTLANE storefront editable content
-- Run in Supabase SQL Editor

create table if not exists public.site_sections (
  id bigint generated always as identity primary key,
  section_key text not null unique,
  title text,
  payload jsonb not null default '{}'::jsonb,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_site_sections_key on public.site_sections(section_key);

create or replace function public.set_site_section_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_site_sections_updated_at on public.site_sections;
create trigger trg_site_sections_updated_at
before update on public.site_sections
for each row execute function public.set_site_section_updated_at();
