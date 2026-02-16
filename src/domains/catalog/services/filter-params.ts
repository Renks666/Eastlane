import type { CatalogFilterParams } from "@/src/domains/catalog/types"

type SearchValue = string | string[] | undefined

function asArray(value: SearchValue) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function asNumber(value: SearchValue) {
  if (typeof value !== "string") return undefined
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return undefined
  return parsed
}

export function parseCatalogFilterParams(params: Record<string, SearchValue>): CatalogFilterParams {
  const sortRaw = typeof params.sort === "string" ? params.sort : "newest"
  const sort: CatalogFilterParams["sort"] =
    sortRaw === "price-asc" || sortRaw === "price-desc" ? sortRaw : "newest"

  return {
    q: typeof params.q === "string" ? params.q.trim() : "",
    category: typeof params.category === "string" ? params.category : "all",
    sizes: asArray(params.size).filter(Boolean),
    colors: asArray(params.color).filter(Boolean),
    minPrice: asNumber(params.minPrice),
    maxPrice: asNumber(params.maxPrice),
    sort,
  }
}

export function serializeCatalogFilterParams(params: CatalogFilterParams) {
  const search = new URLSearchParams()

  if (params.q) search.set("q", params.q)
  if (params.category && params.category !== "all") search.set("category", params.category)
  params.sizes.forEach((size) => search.append("size", size))
  params.colors.forEach((color) => search.append("color", color))
  if (typeof params.minPrice === "number") search.set("minPrice", String(params.minPrice))
  if (typeof params.maxPrice === "number") search.set("maxPrice", String(params.maxPrice))
  if (params.sort !== "newest") search.set("sort", params.sort)

  return search
}

