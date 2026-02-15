"use client"

import { useState } from "react"
import { AddToCartButton } from "@/components/store/AddToCartButton"

type ProductPurchasePanelProps = {
  product: {
    id: number
    name: string
    price: number
    image?: string
    sizes: string[]
    colors: string[]
  }
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [activeSize, setActiveSize] = useState<string | null>(null)
  const hasSizes = product.sizes.length > 0
  const addDisabled = hasSizes && !activeSize

  return (
    <div className="mt-5 space-y-3">
      {hasSizes && (
        <div>
          <p className="mb-2 text-sm font-medium text-[#0f3f33]">Выберите размер</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setActiveSize(size)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                  activeSize === size
                    ? "border-[#b29152] bg-[#b29152] text-white"
                    : "border-[#d8cfb7] bg-white text-[#0f3f33] hover:border-[#b29152]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-[#5f6e65]">
            Сначала выберите размер, затем нажмите кнопку <strong>В корзину</strong>.
          </p>
        </div>
      )}

      <AddToCartButton
        product={{
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          sizes: product.sizes,
          colors: product.colors,
          selectedSize: activeSize ?? undefined,
        }}
        disabled={addDisabled}
        className="w-full rounded-xl bg-[#0f5a49] px-4 py-3 text-sm font-semibold text-[#f2ece0] transition hover:bg-[#0b4a3c]"
      />
    </div>
  )
}
