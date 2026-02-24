import type { PriceCurrency } from "@/src/shared/lib/format-price"

export type CartItem = {
  lineId: string
  id: number
  name: string
  price: number
  priceCurrency: PriceCurrency
  image?: string
  sizes?: string[]
  colors?: string[]
  selectedSize?: string
  selectedColor?: string
  quantity: number
}
