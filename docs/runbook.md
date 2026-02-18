# Runbook

## 1. First-time setup

1. Configure env variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- optional `ADMIN_EMAILS` (required for admin access if you don't set `app_metadata.role`; if neither is set, no one can access `/admin`)

2. Apply SQL:
- `docs/sql/orders.sql`
- `docs/sql/site_sections.sql`

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

Set `is_published = true` to apply payload.
