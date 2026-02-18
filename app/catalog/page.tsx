import Link from "next/link"
import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"
import { StoreShell } from "@/components/store/StoreShell"
import { AnimatedProductGrid } from "@/components/store/AnimatedProductGrid"
import { Button } from "@/components/ui/button"
import {
  fetchCatalogCategories,
  fetchCatalogFilterMeta,
  fetchCatalogProducts,
} from "@/src/domains/catalog/repositories/catalog-repository"
import { parseCatalogFilterParams } from "@/src/domains/catalog/services/filter-params"
import type { CatalogCategory, CatalogProduct } from "@/src/domains/catalog/types"

type CatalogPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams
  const filters = parseCatalogFilterParams(params)
  const supabase = await createServerSupabaseClient()

  const [categories, meta, products] = await Promise.all([
    fetchCatalogCategories(supabase),
    fetchCatalogFilterMeta(supabase),
    fetchCatalogProducts(supabase, filters),
  ])

  return (
    <StoreShell>
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-12 md:px-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[color:var(--color-brand-forest)] md:text-4xl">Каталог</h1>
            <p className="mt-2 text-sm text-[color:var(--color-text-tertiary)]">Поиск, категории и фильтры по размеру, цвету и цене.</p>
          </div>
          <form action="/catalog" className="flex w-full max-w-xl gap-2">
            <input
              name="q"
              defaultValue={filters.q}
              placeholder="Например: кроссовки, пальто, ботинки"
              className="h-11 w-full rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-4 text-sm text-[color:var(--color-text-primary)] placeholder:text-[color:var(--color-text-placeholder)] outline-none focus:border-[color:var(--color-brand-beige-dark)]"
            />
            <Button type="submit" className="rounded-full bg-[color:var(--color-brand-forest)] text-white hover:bg-[color:var(--color-brand-forest-dark)]">
              Найти
            </Button>
          </form>
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-2xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] p-4 shadow-[0_14px_32px_-26px_rgba(15,63,51,0.6)]">
            <form action="/catalog" className="space-y-5">
              <input type="hidden" name="q" value={filters.q} />
              <div className="rounded-xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-tertiary)] p-3">
                <p className="mb-2 text-sm font-semibold text-[color:var(--color-brand-forest-light)]">Категория</p>
                <select
                  name="category"
                  defaultValue={filters.category}
                  className="h-10 w-full rounded-xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-3 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-brand-beige-dark)]"
                >
                  <option value="all">Все категории</option>
                  {(categories as CatalogCategory[]).map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-[color:var(--color-brand-forest-light)]">Размер</p>
                <div className="grid grid-cols-3 gap-2">
                  {meta.allSizes.map((size) => (
                    <label key={size} className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-2 py-1.5 text-xs text-[color:var(--color-text-secondary)]">
                      <input type="checkbox" name="size" value={size} defaultChecked={filters.sizes.includes(size)} />
                      {size}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-[color:var(--color-brand-forest-light)]">Цвет</p>
                <div className="grid grid-cols-2 gap-2">
                  {meta.allColors.map((color) => (
                    <label key={color} className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-2 py-1.5 text-xs text-[color:var(--color-text-secondary)]">
                      <input type="checkbox" name="color" value={color} defaultChecked={filters.colors.includes(color)} />
                      {color}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-[color:var(--color-brand-forest-light)]">Цена</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="minPrice"
                    type="number"
                    min={meta.minPrice}
                    defaultValue={String(filters.minPrice ?? meta.minPrice)}
                    className="h-10 rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-3 text-sm text-[color:var(--color-text-primary)]"
                  />
                  <input
                    name="maxPrice"
                    type="number"
                    min={meta.minPrice}
                    defaultValue={String(filters.maxPrice ?? meta.maxPrice)}
                    className="h-10 rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-3 text-sm text-[color:var(--color-text-primary)]"
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-[color:var(--color-brand-forest-light)]">Сортировка</p>
                <select
                  name="sort"
                  defaultValue={filters.sort}
                  className="h-10 w-full rounded-xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-3 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-brand-beige-dark)]"
                >
                  <option value="newest">Сначала новые</option>
                  <option value="price-asc">Цена: по возрастанию</option>
                  <option value="price-desc">Цена: по убыванию</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button type="submit" className="rounded-xl bg-[color:var(--color-brand-forest)] text-white hover:bg-[color:var(--color-brand-forest-dark)]">
                  Применить
                </Button>
                <Button asChild variant="outline">
                  <Link href="/catalog" className="rounded-xl">
                    Сброс
                  </Link>
                </Button>
              </div>
            </form>
          </aside>

          <div>
            <div className="mb-4 text-sm text-[color:var(--color-text-tertiary)]">Найдено товаров: {(products as CatalogProduct[]).length}</div>
            <AnimatedProductGrid
              products={(products as CatalogProduct[]).map((product) => ({
                id: product.id,
                name: product.name,
                price: product.price,
                images: product.images,
                sizes: product.sizes,
                colors: product.colors,
                categoryName: product.categories?.[0]?.name ?? "Каталог",
              }))}
            />
          </div>
        </div>
      </section>
    </StoreShell>
  )
}

