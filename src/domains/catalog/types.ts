import type { BrandGroupKey } from "@/src/domains/brand/types"
import type { PriceCurrency } from "@/src/shared/lib/format-price"

export type CatalogCategory = {
  id: number
  name: string
  slug: string
}

export type CatalogBrand = {
  id: number
  name: string
  slug: string
  group_key: BrandGroupKey
  sort_order: number
  is_active: boolean
}

export type CatalogProduct = {
  id: number
  name: string
  price: number
  price_currency: PriceCurrency
  colors: string[] | null
  sizes: string[] | null
  seasons: string[] | null
  images: string[] | null
  created_at?: string
  categories: { name: string; slug?: string }[] | null
  brands: { name: string; slug?: string; group_key?: BrandGroupKey }[] | null
}

export type CatalogFilterParams = {
  q: string
  category: string[]
  brands: string[]
  sizes: string[]
  colors: string[]
  seasons: string[]
  minPrice?: number
  maxPrice?: number
  sort: "newest" | "price-asc" | "price-desc"
}
