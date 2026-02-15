import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { StoreShell } from "@/components/store/StoreShell"
import { StoreProductCard } from "@/components/store/StoreProductCard"

type CatalogPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

type Category = { id: number; name: string; slug: string }
type Product = {
  id: number
  name: string
  price: number
  colors: string[] | null
  sizes: string[] | null
  images: string[] | null
  categories: { name: string; slug: string }[] | null
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const supabase = await createClient()
  const params = await searchParams

  const { data: categories } = await supabase.from("categories").select("id, name, slug").order("name")
  const { data: allProducts } = await supabase.from("products").select("sizes, colors, price")

  const allSizes = Array.from(new Set(allProducts?.flatMap((item) => item.sizes || []) || [])).sort()
  const allColors = Array.from(new Set(allProducts?.flatMap((item) => item.colors || []) || [])).sort()
  const minPrice = Math.min(...(allProducts?.map((item) => item.price) || [0]))
  const maxPrice = Math.max(...(allProducts?.map((item) => item.price) || [10000]))

  let query = supabase
    .from("products")
    .select("id, name, price, colors, sizes, images, categories(name, slug)")

  const q = typeof params.q === "string" ? params.q.trim() : ""
  const categorySlug = params.category
  const sizes = params.size
  const colors = params.color
  const minPriceParam = typeof params.minPrice === "string" ? params.minPrice : ""
  const maxPriceParam = typeof params.maxPrice === "string" ? params.maxPrice : ""

  if (q) {
    query = query.ilike("name", `%${q}%`)
  }

  if (categorySlug && categorySlug !== "all") {
    const { data: categoryData } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single()
    if (categoryData) {
      query = query.eq("category_id", categoryData.id)
    }
  }

  if (sizes) {
    const sizeArray = Array.isArray(sizes) ? sizes : [sizes]
    if (sizeArray.length > 0) {
      query = query.overlaps("sizes", sizeArray)
    }
  }

  if (colors) {
    const colorArray = Array.isArray(colors) ? colors : [colors]
    if (colorArray.length > 0) {
      query = query.overlaps("colors", colorArray)
    }
  }

  if (minPriceParam) {
    query = query.gte("price", Number(minPriceParam))
  }
  if (maxPriceParam) {
    query = query.lte("price", Number(maxPriceParam))
  }

  const { data } = await query.order("created_at", { ascending: false })
  const products = (data ?? []) as Product[]

  const selectedSizes = Array.isArray(sizes) ? sizes : sizes ? [sizes] : []
  const selectedColors = Array.isArray(colors) ? colors : colors ? [colors] : []

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
              defaultValue={q}
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
              <input type="hidden" name="q" value={q} />
              <div className="rounded-xl border border-[#d8cfb7] bg-[#faf8f2] p-3">
                <p className="mb-2 text-sm font-semibold text-[#0f3f33]">Категория</p>
                <select
                  name="category"
                  defaultValue={typeof categorySlug === "string" ? categorySlug : "all"}
                  className="h-10 w-full rounded-xl border border-[#d8cfb7] bg-white px-3 text-sm text-[#0f1720] outline-none focus:border-[#b29152]"
                >
                  <option value="all">Все категории</option>
                  {(categories as Category[] | null)?.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-[#0f3f33]">Размер</p>
                <div className="grid grid-cols-3 gap-2">
                  {allSizes.map((size) => (
                    <label key={size} className="inline-flex items-center gap-2 rounded-lg border border-[#d8cfb7] bg-white px-2 py-1.5 text-xs text-[#5f6e65]">
                      <input type="checkbox" name="size" value={size} defaultChecked={selectedSizes.includes(size)} />
                      {size}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-[#0f3f33]">Цвет</p>
                <div className="grid grid-cols-2 gap-2">
                  {allColors.map((color) => (
                    <label key={color} className="inline-flex items-center gap-2 rounded-lg border border-[#d8cfb7] bg-white px-2 py-1.5 text-xs text-[#5f6e65]">
                      <input type="checkbox" name="color" value={color} defaultChecked={selectedColors.includes(color)} />
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
                    min={minPrice}
                    defaultValue={minPriceParam || String(minPrice)}
                    className="h-10 rounded-lg border border-[#d8cfb7] bg-white px-3 text-sm text-[#0f1720]"
                  />
                  <input
                    name="maxPrice"
                    type="number"
                    min={minPrice}
                    defaultValue={maxPriceParam || String(maxPrice)}
                    className="h-10 rounded-lg border border-[#d8cfb7] bg-white px-3 text-sm text-[#0f1720]"
                  />
                </div>
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
            <div className="mb-4 text-sm text-[#6f7d75]">Найдено товаров: {products.length}</div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
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
