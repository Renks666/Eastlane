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
