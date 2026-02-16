export type CatalogCategory = {
  id: number
  name: string
  slug: string
}

export type CatalogProduct = {
  id: number
  name: string
  price: number
  colors: string[] | null
  sizes: string[] | null
  images: string[] | null
  categories: { name: string; slug?: string }[] | null
}

export type CatalogFilterParams = {
  q: string
  category: string
  sizes: string[]
  colors: string[]
  minPrice?: number
  maxPrice?: number
  sort: "newest" | "price-asc" | "price-desc"
}

