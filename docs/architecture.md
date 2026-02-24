# Architecture

## Layers

1. `app/*`
- Route handlers and page composition.
- Minimal business logic.

2. `src/domains/*`
- Domain rules and use-case services.
- Repository access to Supabase.

3. `src/shared/*`
- Cross-cutting infrastructure: auth guard, logger, action error helpers, reusable UI.

## Domains

### Catalog

- `types.ts`: `CatalogFilterParams` DTO.
- `services/filter-params.ts`: parse/serialize URL filters.
- `repositories/catalog-repository.ts`: category/brand/products/filter metadata queries.

### Brand

- `types.ts`: `BrandGroupKey` union + labels/order helpers.

### Order

- `types.ts`: `OrderStatus`, `ContactChannel`, checkout payload.
- `services/checkout-service.ts`: payload validation + item normalization + totals.
- `services/order-service.ts`: orchestration for create order / update status.
- `repositories/order-repository.ts`: all order DB operations.

### Product

- `services/product-image-service.ts`: upload/remove/reorder product images in Supabase Storage.

### Product Attributes

- `types.ts`: normalization + dedupe helpers for sizes/colors.
- `services/attribute-options-service.ts`: upsert dictionary values and usage checks.

### Content

- `types.ts`: typed content section interfaces.
- `default-content.ts`: fallback storefront content.
- `delivery-rates-schema.ts`: zod schema/normalization for delivery rates payload.
- `eastlane-tariffs-schema.ts`: zod schema/normalization for EASTLANE tariffs payload.
- `repositories/site-sections-repository.ts`: pull overrides from `site_sections`.
- `services/storefront-content-service.ts`: merge defaults + DB content.

## Security

- `middleware.ts` protects `/admin/*` routes.
- `requireAdminUser()` used in server actions.
- Admin is defined only by:
  - `user.app_metadata.role === "admin"`, or
  - `user.user_metadata.role === "admin"`, or
  - email in `ADMIN_EMAILS`.
- If none of these is configured, no user is considered admin (safe default).

## Error Handling and Logging

- Server actions return `{ ok: boolean, error?: string }` style objects.
- `src/shared/lib/logger.ts` used for centralized action logging.
- `src/shared/lib/action-result.ts` normalizes unknown errors.
