import type { SupabaseClient } from "@supabase/supabase-js"
import type { CatalogCategory, CatalogFilterParams, CatalogProduct } from "@/src/domains/catalog/types"

export async function fetchCatalogCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("categories").select("id, name, slug").order("name")
  if (error) {
    throw new Error(`Failed to load categories: ${error.message}`)
  }
  return (data ?? []) as CatalogCategory[]
}

export async function fetchCatalogFilterMeta(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("products").select("sizes, colors, price")
  if (error) {
    throw new Error(`Failed to load filter metadata: ${error.message}`)
  }

  const rows = data ?? []
  const allSizes = Array.from(new Set(rows.flatMap((item) => item.sizes || []))).sort()
  const allColors = Array.from(new Set(rows.flatMap((item) => item.colors || []))).sort()
  const prices = rows.map((item) => Number(item.price)).filter((value) => Number.isFinite(value))

  return {
    allSizes,
    allColors,
    minPrice: prices.length > 0 ? Math.min(...prices) : 0,
    maxPrice: prices.length > 0 ? Math.max(...prices) : 10000,
  }
}

export async function fetchCatalogProducts(
  supabase: SupabaseClient,
  filters: CatalogFilterParams
): Promise<CatalogProduct[]> {
  let query = supabase
    .from("products")
    .select("id, name, price, colors, sizes, images, categories(name, slug)")

  if (filters.q) {
    query = query.ilike("name", `%${filters.q}%`)
  }

  if (filters.category && filters.category !== "all") {
    const { data: categoryData } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .single()

    if (categoryData) {
      query = query.eq("category_id", categoryData.id)
    }
  }

  if (filters.sizes.length > 0) {
    query = query.overlaps("sizes", filters.sizes)
  }

  if (filters.colors.length > 0) {
    query = query.overlaps("colors", filters.colors)
  }

  if (typeof filters.minPrice === "number") {
    query = query.gte("price", filters.minPrice)
  }

  if (typeof filters.maxPrice === "number") {
    query = query.lte("price", filters.maxPrice)
  }

  if (filters.sort === "price-asc") {
    query = query.order("price", { ascending: true })
  } else if (filters.sort === "price-desc") {
    query = query.order("price", { ascending: false })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  const { data, error } = await query
  if (error) {
    throw new Error(`Failed to load products: ${error.message}`)
  }

  return (data ?? []) as CatalogProduct[]
}

