"use client"

import { ShoppingCart } from "lucide-react"
import { useCart } from "@/components/store/CartProvider"
import { cn } from "@/lib/utils"

type AddToCartButtonProps = {
  product: {
    id: number
    name: string
    price: number
    image?: string
    sizes?: string[] | null
    colors?: string[] | null
    selectedSize?: string
    selectedColor?: string
  }
  className?: string
  disabled?: boolean
}

export function AddToCartButton({ product, className, disabled }: AddToCartButtonProps) {
  const { addItem } = useCart()

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) return
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          sizes: product.sizes ?? [],
          colors: product.colors ?? [],
          selectedSize: product.selectedSize,
          selectedColor: product.selectedColor,
        })
        window.dispatchEvent(new Event("cart:item-added"))
      }}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        "bg-brand-gold-500 text-brand-dark hover:bg-brand-gold-400",
        className
      )}
    >
      <ShoppingCart className="h-4 w-4 shrink-0" />
      В корзину
    </button>
  )
}
