import type { SupabaseClient } from "@supabase/supabase-js"
import type { CatalogBrand, CatalogCategory, CatalogFilterParams, CatalogProduct } from "@/src/domains/catalog/types"
import { compareBrandGroupKeys } from "@/src/domains/brand/types"
import { SEASON_KEYS } from "@/src/domains/product-attributes/seasons"
import { convertRubToCnyApprox } from "@/src/shared/lib/format-price"

type CatalogProductRow = CatalogProduct & {
  created_at: string
  brand_id?: number | null
  category_id?: number | null
}

function toDisplayCnyAmount(product: Pick<CatalogProduct, "price" | "price_currency">, cnyPerRub: number) {
  if (product.price_currency === "CNY") return Number(product.price)
  return convertRubToCnyApprox(Number(product.price), cnyPerRub) ?? Number(product.price)
}

function sortRows(rows: CatalogProductRow[], sort: CatalogFilterParams["sort"], cnyPerRub: number) {
  const ordered = [...rows]
  if (sort === "price-asc") {
    return ordered.sort((a, b) => toDisplayCnyAmount(a, cnyPerRub) - toDisplayCnyAmount(b, cnyPerRub))
  }
  if (sort === "price-desc") {
    return ordered.sort((a, b) => toDisplayCnyAmount(b, cnyPerRub) - toDisplayCnyAmount(a, cnyPerRub))
  }
  return ordered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

function applyAppLevelPriceFilter(rows: CatalogProductRow[], filters: CatalogFilterParams, cnyPerRub: number) {
  return rows.filter((row) => {
    const cnyAmount = toDisplayCnyAmount(row, cnyPerRub)

    if (typeof filters.minPrice === "number" && cnyAmount < filters.minPrice) return false
    if (typeof filters.maxPrice === "number" && cnyAmount > filters.maxPrice) return false

    return true
  })
}

export async function fetchCatalogCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("categories").select("id, name, slug").order("name")
  if (error) {
    throw new Error(`Failed to load categories: ${error.message}`)
  }
  return (data ?? []) as CatalogCategory[]
}

export async function fetchCatalogBrands(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("brands")
    .select("id, name, slug, group_key, sort_order, is_active")
    .eq("is_active", true)
    .order("group_key", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    throw new Error(`Failed to load brands: ${error.message}`)
  }

  return [...((data ?? []) as CatalogBrand[])].sort((a, b) => {
    const byGroup = compareBrandGroupKeys(a.group_key, b.group_key)
    if (byGroup !== 0) return byGroup
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
    return a.name.localeCompare(b.name)
  })
}

export async function fetchCatalogFilterMeta(
  supabase: SupabaseClient,
  filters: CatalogFilterParams,
  cnyPerRub: number
) {
  const rows = await fetchCatalogProducts(supabase, { ...filters, minPrice: undefined, maxPrice: undefined }, cnyPerRub)
  const allSizes = Array.from(new Set(rows.flatMap((item) => item.sizes || []))).sort()
  const allColors = Array.from(new Set(rows.flatMap((item) => item.colors || []))).sort()
  const prices = rows.map((item) => toDisplayCnyAmount(item, cnyPerRub)).filter((value) => Number.isFinite(value))

  return {
    allSizes,
    allColors,
    allSeasons: [...SEASON_KEYS],
    minPrice: prices.length > 0 ? Math.floor(Math.min(...prices)) : 0,
    maxPrice: prices.length > 0 ? Math.ceil(Math.max(...prices)) : 10000,
  }
}

export async function fetchCatalogProducts(
  supabase: SupabaseClient,
  filters: CatalogFilterParams,
  cnyPerRub: number
): Promise<CatalogProduct[]> {
  let categoryIds: number[] = []
  if (filters.category.length > 0) {
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .in("slug", filters.category)

    if (categoryError) {
      throw new Error(`Failed to resolve category: ${categoryError.message}`)
    }

    categoryIds = (categoryData ?? []).map((item) => Number(item.id)).filter((id) => Number.isInteger(id))
    if (categoryIds.length === 0) {
      return []
    }
  }

  let brandFilterIds: number[] = []
  if (filters.brands.length > 0) {
    const { data: brandData, error: brandError } = await supabase
      .from("brands")
      .select("id")
      .in("slug", filters.brands)
      .eq("is_active", true)

    if (brandError) {
      throw new Error(`Failed to resolve brands: ${brandError.message}`)
    }

    brandFilterIds = (brandData ?? []).map((item) => Number(item.id)).filter((id) => Number.isInteger(id))
    if (brandFilterIds.length === 0) {
      return []
    }
  }

  const buildBaseQuery = () => {
    let query = supabase
      .from("products")
      .select("id, name, price, price_currency, colors, sizes, seasons, images, created_at, categories(name, slug), brands(name, slug, group_key)")

    if (categoryIds.length > 0) {
      query = query.in("category_id", categoryIds)
    }

    if (brandFilterIds.length > 0) {
      query = query.in("brand_id", brandFilterIds)
    }

    if (filters.sizes.length > 0) {
      query = query.overlaps("sizes", filters.sizes)
    }

    if (filters.colors.length > 0) {
      query = query.overlaps("colors", filters.colors)
    }

    if (filters.seasons.length > 0) {
      query = query.overlaps("seasons", filters.seasons)
    }

    return query
  }

  let rows: CatalogProductRow[] = []

  if (!filters.q) {
    const { data, error } = await buildBaseQuery()
    if (error) {
      throw new Error(`Failed to load products: ${error.message}`)
    }
    rows = (data ?? []) as CatalogProductRow[]
  } else {
    const { data: matchedBrands, error: matchedBrandsError } = await supabase
      .from("brands")
      .select("id")
      .ilike("name", `%${filters.q}%`)
      .eq("is_active", true)

    if (matchedBrandsError) {
      throw new Error(`Failed to search brands: ${matchedBrandsError.message}`)
    }

    const brandSearchIds = (matchedBrands ?? []).map((item) => Number(item.id)).filter((id) => Number.isInteger(id))

    const [byNameResult, byBrandResult] = await Promise.all([
      buildBaseQuery().ilike("name", `%${filters.q}%`),
      brandSearchIds.length > 0 ? buildBaseQuery().in("brand_id", brandSearchIds) : Promise.resolve({ data: [], error: null }),
    ])

    if (byNameResult.error) {
      throw new Error(`Failed to load products by name: ${byNameResult.error.message}`)
    }
    if (byBrandResult.error) {
      throw new Error(`Failed to load products by brand: ${byBrandResult.error.message}`)
    }

    const merged = new Map<number, CatalogProductRow>()
    for (const row of (byNameResult.data ?? []) as CatalogProductRow[]) {
      merged.set(row.id, row)
    }
    for (const row of (byBrandResult.data ?? []) as CatalogProductRow[]) {
      merged.set(row.id, row)
    }

    rows = Array.from(merged.values())
  }

  const filtered = applyAppLevelPriceFilter(rows, filters, cnyPerRub)
  return sortRows(filtered, filters.sort, cnyPerRub)
}
