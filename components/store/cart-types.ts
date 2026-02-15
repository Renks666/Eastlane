export type CartItem = {
  lineId: string
  id: number
  name: string
  price: number
  image?: string
  sizes?: string[]
  colors?: string[]
  selectedSize?: string
  selectedColor?: string
  quantity: number
}
