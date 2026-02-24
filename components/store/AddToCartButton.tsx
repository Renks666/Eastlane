"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useCart } from "@/components/store/CartProvider"
import { cn } from "@/lib/utils"
import type { PriceCurrency } from "@/src/shared/lib/format-price"

type AddToCartButtonProps = {
  product: {
    id: number
    name: string
    price: number
    priceCurrency: PriceCurrency
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
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    if (disabled || isAdding) return

    setIsAdding(true)

    await new Promise((resolve) => setTimeout(resolve, 200))

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      priceCurrency: product.priceCurrency,
      image: product.image,
      sizes: product.sizes ?? [],
      colors: product.colors ?? [],
      selectedSize: product.selectedSize,
      selectedColor: product.selectedColor,
    })

    toast.success("Товар добавлен в корзину", {
      description: product.name,
      action: {
        label: "Открыть корзину",
        onClick: () => {
          window.dispatchEvent(new CustomEvent("cart:open"))
        },
      },
      duration: 3000,
    })

    setIsAdding(false)
  }

  return (
    <button
      type="button"
      disabled={disabled || isAdding}
      onClick={handleAddToCart}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        "bg-[color:var(--color-brand-forest)] text-white hover:bg-[color:var(--color-brand-forest-dark)]",
        className
      )}
    >
      {isAdding ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Добавление...
        </>
      ) : (
        "В корзину"
      )}
    </button>
  )
}
