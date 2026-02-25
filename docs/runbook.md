# Runbook

## 1. First-time setup

1. Configure env variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- optional `ADMIN_EMAILS` (required for admin access if you don't set `app_metadata.role`; if neither is set, no one can access `/admin`)

2. Apply SQL:
- `docs/sql/orders.sql`
- `docs/sql/orders_currency_snapshots.sql`
- `docs/sql/site_sections.sql`
- `docs/sql/site_sections_delivery_rates_seed.sql` (optional seed for delivery rates block)
- `docs/sql/site_sections_eastlane_tariffs_seed.sql` (optional seed for EASTLANE tariffs block)
- `docs/sql/site_sections_exchange_rate_seed.sql` (optional seed for CNY/RUB exchange rate)
- `docs/sql/brands.sql`
- `docs/sql/brands_seed.sql`
- `docs/sql/products_currency.sql`
- `docs/sql/products_rls.sql`
- `docs/sql/categories_rls.sql`
- `docs/sql/brands_rls.sql`
- `docs/sql/product_sizes.sql`
- `docs/sql/product_colors.sql`
- `docs/sql/product_attribute_values.sql`
- `docs/sql/product_attributes_normalize_products.sql`
- `docs/sql/product_sizes_rls.sql`
- `docs/sql/product_colors_rls.sql`
- `docs/sql/product_attribute_values_rls.sql`
- `docs/sql/admin_users.sql` (edit emails in file first)

Phase 2 (after all existing products are assigned a brand):
- `docs/sql/products_brand_not_null.sql`

3. Install and run:

```bash
npm install
npm run dev
```

## 2. Admin access troubleshooting

If `/admin` redirects to `/admin/login` after successful sign-in:

1. Check Supabase session exists.
2. Verify admin role rules (at least one required; otherwise no one has admin access):
- set `ADMIN_EMAILS` to your account email (comma-separated), or
- set user metadata or app metadata role to `admin`.

3. If create/update/delete for products fails with `row-level security policy`:
- ensure `docs/sql/products_rls.sql` was applied;
- ensure current user has `raw_app_meta_data.role = 'admin'` (see `docs/sql/admin_users.sql`);
- sign out/in to refresh JWT claims.

4. If create/update/delete for categories fails with `row-level security policy`:
- ensure `docs/sql/categories_rls.sql` was applied;
- ensure current user has `raw_app_meta_data.role = 'admin'` (see `docs/sql/admin_users.sql`);
- sign out/in to refresh JWT claims.

5. If create/update/delete for brands fails with `row-level security policy`:
- ensure `docs/sql/brands_rls.sql` was applied;
- ensure current user has `raw_app_meta_data.role = 'admin'` (see `docs/sql/admin_users.sql`);
- sign out/in to refresh JWT claims.

6. If create/update/delete for sizes/colors fails with `row-level security policy`:
- ensure `docs/sql/product_sizes_rls.sql` and `docs/sql/product_colors_rls.sql` were applied;
- ensure current user has `raw_app_meta_data.role = 'admin'` (see `docs/sql/admin_users.sql`);
- sign out/in to refresh JWT claims.

7. If product create/update fails with errors about `product_size_values` or `product_color_values`:
- ensure `docs/sql/product_attribute_values.sql` and `docs/sql/product_attribute_values_rls.sql` were applied;
- run `docs/sql/product_attributes_normalize_products.sql` once to backfill links.

## 3. Checkout troubleshooting

Symptom: order is not created.

1. Check server logs for `orders.createOrder`.
2. Validate contact channel/payload:
- `telegram`: `@username` or `t.me/...`
- `phone`: at least 10 digits.
3. Verify `orders` and `order_items` tables exist.

## 4. Product image issues

Symptom: upload/remove fails.

1. Check bucket `product-images` exists.
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is valid.
3. Review logs for `admin.products.*` scope.

## 5. Storefront content overrides

To override defaults, insert/update rows in `site_sections`:

- `hero`
- `benefits`
- `lookbook`
- `faq`
- `contacts`
- `about`
- `delivery_rates`
- `eastlane_tariffs`
- `exchange_rate`

Set `is_published = true` to apply payload.
