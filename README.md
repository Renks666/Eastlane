# EASTLANE

Next.js storefront + admin panel for a fashion store. The project uses Supabase (PostgreSQL/Auth/Storage), server actions, and a domain-oriented structure.

## Stack

- Next.js App Router
- TypeScript + React
- Tailwind CSS + shadcn/ui
- Supabase: Auth, Postgres, Storage

## Project Structure

- `app/*`: routing and composition layer (pages + server actions entrypoints)
- `src/domains/catalog/*`: catalog filters DTO/parser + repository
- `src/domains/brand/*`: brand groups and labels
- `src/domains/product-attributes/*`: sizes/colors dictionaries and normalization
- `src/domains/order/*`: checkout validation, order services, order repository, statuses/types
- `src/domains/product/*`: product image service (upload/remove/reorder)
- `src/domains/content/*`: storefront content model/defaults/repository/service
- `src/shared/lib/*`: supabase clients, auth guards, logger, action result helpers
- `src/shared/ui/admin/*`: shared admin UI blocks
- `docs/sql/*`: SQL schema/migrations snippets

## Environment Variables

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional:

- `ADMIN_EMAILS` - comma-separated admin emails (`user1@example.com,user2@example.com`). Alternatively, set `app_metadata.role` or `user_metadata.role` to `"admin"` in Supabase. If neither is configured, no one has admin access.

## SQL Setup

Run in Supabase SQL editor:

1. `docs/sql/orders.sql`
2. `docs/sql/site_sections.sql`
3. `docs/sql/brands.sql`
4. `docs/sql/brands_seed.sql`
5. `docs/sql/products_rls.sql`
6. `docs/sql/categories_rls.sql`
7. `docs/sql/brands_rls.sql`
8. `docs/sql/product_sizes.sql`
9. `docs/sql/product_colors.sql`
10. `docs/sql/product_attributes_seed_from_products.sql`
11. `docs/sql/product_sizes_rls.sql`
12. `docs/sql/product_colors_rls.sql`
13. `docs/sql/admin_users.sql` (set your admin emails in SQL before run)

Phase 2 (after backfill all `products.brand_id`):

14. `docs/sql/products_brand_not_null.sql`

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deployment

- Build: `npm run build`
- Start: `npm run start`
- Ensure all env variables are configured in deployment environment.

## Key Flows

- Checkout model: `cart -> order -> manager confirmation` (no online payment yet)
- Contact channel supports `telegram | phone`
- Storefront content can be overridden from `site_sections` table
- Admin area is protected by auth + role check
