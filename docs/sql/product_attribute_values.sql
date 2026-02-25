-- EASTLANE normalized product attribute links
-- Run after product_sizes.sql and product_colors.sql

create table if not exists public.product_size_values (
  product_id bigint not null references public.products(id) on delete cascade,
  size_id bigint not null references public.product_sizes(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (product_id, size_id)
);

create table if not exists public.product_color_values (
  product_id bigint not null references public.products(id) on delete cascade,
  color_id bigint not null references public.product_colors(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (product_id, color_id)
);

create index if not exists idx_product_size_values_size_id on public.product_size_values(size_id);
create index if not exists idx_product_color_values_color_id on public.product_color_values(color_id);
