import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"
import { StoreShell } from "@/components/store/StoreShell"
import { AnimatedProductGrid } from "@/components/store/AnimatedProductGrid"
import { CatalogFiltersForm } from "@/components/store/CatalogFiltersForm"
import { CatalogFiltersSheet } from "@/components/store/CatalogFiltersSheet"
import {
  fetchCatalogBrands,
  fetchCatalogCategories,
  fetchCatalogFilterMeta,
  fetchCatalogProducts,
} from "@/src/domains/catalog/repositories/catalog-repository"
import { getStorefrontContent } from "@/src/domains/content/services/storefront-content-service"
import { parseCatalogFilterParams } from "@/src/domains/catalog/services/filter-params"
import type { CatalogBrand, CatalogCategory, CatalogProduct } from "@/src/domains/catalog/types"

type CatalogPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function resolveRelationName(
  relation: unknown
): string | null {
  if (!relation) return null
  if (Array.isArray(relation)) {
    const first = relation[0] as { name?: string } | undefined
    return typeof first?.name === "string" ? first.name : null
  }
  if (typeof relation === "object") {
    const single = relation as { name?: string }
    return typeof single.name === "string" ? single.name : null
  }
  return null
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams
  const filters = parseCatalogFilterParams(params)
  const supabase = await createServerSupabaseClient()

  const content = await getStorefrontContent()

  const [categories, brands, meta, products] = await Promise.all([
    fetchCatalogCategories(supabase),
    fetchCatalogBrands(supabase),
    fetchCatalogFilterMeta(supabase, filters, content.exchangeRate.cnyPerRub),
    fetchCatalogProducts(supabase, filters, content.exchangeRate.cnyPerRub),
  ])

  return (
    <StoreShell>
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-12 md:px-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[color:var(--color-brand-forest)] md:text-4xl">Каталог</h1>
            <p className="mt-2 text-sm text-[color:var(--color-text-tertiary)]">
              Поиск, категории и фильтры по брендам, размеру, цвету, сезонности и цене.
            </p>
          </div>
          <form action="/catalog" className="flex w-full max-w-xl gap-2">
            <input
              name="q"
              defaultValue={filters.q}
              placeholder="Например: кроссовки или Nike"
              className="h-11 w-full rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-4 text-sm text-[color:var(--color-text-primary)] placeholder:text-[color:var(--color-text-placeholder)] outline-none focus:border-[color:var(--color-brand-beige-dark)]"
            />
            <button
              type="submit"
              className="rounded-full bg-[color:var(--color-brand-forest)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-forest-dark)]"
            >
              Найти
            </button>
          </form>
          <CatalogFiltersSheet>
            <CatalogFiltersForm
              filters={filters}
              categories={categories as CatalogCategory[]}
              brands={brands as CatalogBrand[]}
              meta={meta}
            />
          </CatalogFiltersSheet>
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="hidden h-fit rounded-2xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] p-4 shadow-[0_14px_32px_-26px_rgba(15,63,51,0.6)] lg:block">
            <CatalogFiltersForm
              filters={filters}
              categories={categories as CatalogCategory[]}
              brands={brands as CatalogBrand[]}
              meta={meta}
            />
          </aside>

          <div>
            <div className="mb-4 text-sm text-[color:var(--color-text-tertiary)]">Найдено товаров: {(products as CatalogProduct[]).length}</div>
            <AnimatedProductGrid
              products={(products as CatalogProduct[]).map((product) => ({
                id: product.id,
                name: product.name,
                price: product.price,
                priceCurrency: product.price_currency,
                images: product.images,
                sizes: product.sizes,
                colors: product.colors,
                categoryName: resolveRelationName(product.categories) ?? "Каталог",
                brandName: resolveRelationName(product.brands),
              }))}
              cnyPerRub={content.exchangeRate.cnyPerRub}
            />
          </div>
        </div>
      </section>
    </StoreShell>
  )
}
