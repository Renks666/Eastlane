import Link from "next/link"
import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"
import { StoreShell } from "@/components/store/StoreShell"
import { StoreProductCard } from "@/components/store/StoreProductCard"
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
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-8 md:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#0f5a49] md:text-4xl">Каталог</h1>
            <p className="mt-2 text-sm text-[#6f7d75]">Поиск, категории и фильтры по размеру, цвету и цене.</p>
          </div>
          <form action="/catalog" className="flex w-full max-w-xl gap-2">
            <input
              name="q"
              defaultValue={filters.q}
              placeholder="Например: кроссовки, пальто, ботинки"
              className="h-11 w-full rounded-full border border-[#d8cfb7] bg-white px-4 text-sm text-[#0f1720] placeholder:text-[#99a198] outline-none focus:border-[#b29152]"
            />
            <button className="rounded-full bg-[#c6a15b] px-5 text-sm font-medium text-[#0f1720] transition hover:bg-[#b29152]" type="submit">
              Найти
            </button>
          </form>
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-2xl border border-[#d8cfb7] bg-white p-4 shadow-[0_14px_32px_-26px_rgba(15,63,51,0.6)]">
            <form action="/catalog" className="space-y-5">
              <input type="hidden" name="q" value={filters.q} />
              <div className="rounded-xl border border-[#d8cfb7] bg-[#faf8f2] p-3">
                <p className="mb-2 text-sm font-semibold text-[#0f3f33]">Категория</p>
                <select
                  name="category"
                  defaultValue={filters.category}
                  className="h-10 w-full rounded-xl border border-[#d8cfb7] bg-white px-3 text-sm text-[#0f1720] outline-none focus:border-[#b29152]"
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
                <p className="mb-2 text-sm font-medium text-[#0f3f33]">Размер</p>
                <div className="grid grid-cols-3 gap-2">
                  {meta.allSizes.map((size) => (
                    <label key={size} className="inline-flex items-center gap-2 rounded-lg border border-[#d8cfb7] bg-white px-2 py-1.5 text-xs text-[#5f6e65]">
                      <input type="checkbox" name="size" value={size} defaultChecked={filters.sizes.includes(size)} />
                      {size}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-[#0f3f33]">Цвет</p>
                <div className="grid grid-cols-2 gap-2">
                  {meta.allColors.map((color) => (
                    <label key={color} className="inline-flex items-center gap-2 rounded-lg border border-[#d8cfb7] bg-white px-2 py-1.5 text-xs text-[#5f6e65]">
                      <input type="checkbox" name="color" value={color} defaultChecked={filters.colors.includes(color)} />
                      {color}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-[#0f3f33]">Цена</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="minPrice"
                    type="number"
                    min={meta.minPrice}
                    defaultValue={String(filters.minPrice ?? meta.minPrice)}
                    className="h-10 rounded-lg border border-[#d8cfb7] bg-white px-3 text-sm text-[#0f1720]"
                  />
                  <input
                    name="maxPrice"
                    type="number"
                    min={meta.minPrice}
                    defaultValue={String(filters.maxPrice ?? meta.maxPrice)}
                    className="h-10 rounded-lg border border-[#d8cfb7] bg-white px-3 text-sm text-[#0f1720]"
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-[#0f3f33]">Сортировка</p>
                <select
                  name="sort"
                  defaultValue={filters.sort}
                  className="h-10 w-full rounded-xl border border-[#d8cfb7] bg-white px-3 text-sm text-[#0f1720] outline-none focus:border-[#b29152]"
                >
                  <option value="newest">Сначала новые</option>
                  <option value="price-asc">Цена: по возрастанию</option>
                  <option value="price-desc">Цена: по убыванию</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button type="submit" className="rounded-xl bg-[#c6a15b] px-3 py-2 text-sm font-medium text-[#0f1720] transition hover:bg-[#b29152]">
                  Применить
                </button>
                <Link href="/catalog" className="rounded-xl border border-[#d8cfb7] px-3 py-2 text-center text-sm text-[#5f6e65] transition hover:bg-[#f7f4ea]">
                  Сброс
                </Link>
              </div>
            </form>
          </aside>

          <div>
            <div className="mb-4 text-sm text-[#6f7d75]">Найдено товаров: {(products as CatalogProduct[]).length}</div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {(products as CatalogProduct[]).map((product) => (
                <StoreProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    images: product.images,
                    sizes: product.sizes,
                    colors: product.colors,
                    categoryName: product.categories?.[0]?.name ?? "Каталог",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </StoreShell>
  )
}

