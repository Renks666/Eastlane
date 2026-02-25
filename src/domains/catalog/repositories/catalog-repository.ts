import type { SupabaseClient } from "@supabase/supabase-js"
import type { CatalogBrand, CatalogCategory, CatalogFilterParams, CatalogProduct } from "@/src/domains/catalog/types"
import { SEASON_KEYS } from "@/src/domains/product-attributes/seasons"
import { normalizeAttributeValue, sanitizeAttributeValues } from "@/src/domains/product-attributes/types"
import { convertRubToCnyApprox } from "@/src/shared/lib/format-price"

type CatalogProductRow = CatalogProduct & {
  created_at: string
  brand_id?: number | null
  category_id?: number | null
}

const LETTER_SIZE_ORDER: Record<string, number> = {
  "3XS": 0,
  "XXXS": 0,
  "2XS": 1,
  "XXS": 1,
  XS: 2,
  S: 3,
  M: 4,
  L: 5,
  XL: 6,
  "2XL": 7,
  XXL: 7,
  "3XL": 8,
  XXXL: 8,
  "4XL": 9,
  XXXXL: 9,
  "5XL": 10,
  XXXXXL: 10,
}

function normalizeSizeToken(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "")
}

function extractNumericSize(value: string) {
  const match = value.replace(",", ".").match(/\d+(?:\.\d+)?/)
  if (!match) return null
  const parsed = Number(match[0])
  return Number.isFinite(parsed) ? parsed : null
}

function compareSizesAsc(a: string, b: string) {
  const aToken = normalizeSizeToken(a)
  const bToken = normalizeSizeToken(b)

  const aLetterRank = LETTER_SIZE_ORDER[aToken]
  const bLetterRank = LETTER_SIZE_ORDER[bToken]
  const aHasLetterRank = Number.isInteger(aLetterRank)
  const bHasLetterRank = Number.isInteger(bLetterRank)

  if (aHasLetterRank && bHasLetterRank && aLetterRank !== bLetterRank) {
    return aLetterRank - bLetterRank
  }

  const aNumeric = extractNumericSize(aToken)
  const bNumeric = extractNumericSize(bToken)
  const aHasNumeric = typeof aNumeric === "number"
  const bHasNumeric = typeof bNumeric === "number"

  if (aHasNumeric && bHasNumeric && aNumeric !== bNumeric) {
    return aNumeric - bNumeric
  }

  return a.localeCompare(b, "ru-RU", { numeric: true, sensitivity: "base" })
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

async function fetchActiveAttributeValues(
  supabase: SupabaseClient,
  kind: "sizes" | "colors"
) {
  const table = kind === "sizes" ? "product_sizes" : "product_colors"
  const { data, error } = await supabase
    .from(table)
    .select("value")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("value", { ascending: true })

  if (error) {
    throw new Error(`Failed to load ${kind} dictionary: ${error.message}`)
  }

  return (data ?? []).map((item) => item.value as string)
}

async function canonicalizeSelectedAttributeFilter(
  supabase: SupabaseClient,
  kind: "sizes" | "colors",
  values: string[]
) {
  const sanitized = sanitizeAttributeValues(values)
  if (sanitized.length === 0) return sanitized

  const table = kind === "sizes" ? "product_sizes" : "product_colors"
  const normalized = Array.from(new Set(sanitized.map((value) => normalizeAttributeValue(value))))
  const { data, error } = await supabase
    .from(table)
    .select("value, value_normalized")
    .in("value_normalized", normalized)

  if (error) {
    throw new Error(`Failed to canonicalize ${kind} filter values: ${error.message}`)
  }

  const map = new Map<string, string>(((data ?? []) as { value: string; value_normalized: string }[]).map((row) => [row.value_normalized, row.value]))
  return sanitized.map((value) => map.get(normalizeAttributeValue(value)) ?? value)
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
    .select("id, name, slug, sort_order, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    throw new Error(`Failed to load brands: ${error.message}`)
  }

  return (data ?? []) as CatalogBrand[]
}

export async function fetchCatalogFilterMeta(
  supabase: SupabaseClient,
  filters: CatalogFilterParams,
  cnyPerRub: number
) {
  const rows = await fetchCatalogProducts(supabase, { ...filters, minPrice: undefined, maxPrice: undefined }, cnyPerRub)
  const [allSizesRaw, allColorsRaw] = await Promise.all([
    fetchActiveAttributeValues(supabase, "sizes"),
    fetchActiveAttributeValues(supabase, "colors"),
  ])
  const allSizes = sanitizeAttributeValues(allSizesRaw).sort(compareSizesAsc)
  const allColors = sanitizeAttributeValues(allColorsRaw).sort((left, right) =>
    left.localeCompare(right, "ru-RU", { sensitivity: "base", numeric: true })
  )
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
  const [canonicalSizesFilter, canonicalColorsFilter] = await Promise.all([
    canonicalizeSelectedAttributeFilter(supabase, "sizes", filters.sizes),
    canonicalizeSelectedAttributeFilter(supabase, "colors", filters.colors),
  ])

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
      .select("id, name, price, price_currency, colors, sizes, seasons, images, created_at, categories(name, slug), brands(name, slug)")

    if (categoryIds.length > 0) {
      query = query.in("category_id", categoryIds)
    }

    if (brandFilterIds.length > 0) {
      query = query.in("brand_id", brandFilterIds)
    }

    if (canonicalSizesFilter.length > 0) {
      query = query.overlaps("sizes", canonicalSizesFilter)
    }

    if (canonicalColorsFilter.length > 0) {
      query = query.overlaps("colors", canonicalColorsFilter)
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
