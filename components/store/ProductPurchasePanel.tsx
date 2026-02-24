"use client"

import { useState } from "react"
import { AddToCartButton } from "@/components/store/AddToCartButton"
import type { PriceCurrency } from "@/src/shared/lib/format-price"

type ProductPurchasePanelProps = {
  product: {
    id: number
    name: string
    price: number
    priceCurrency: PriceCurrency
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
          <p className="mb-2 text-sm font-medium text-[color:var(--color-brand-forest-light)]">Выберите размер</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setActiveSize(size)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                  activeSize === size
                    ? "border-[color:var(--color-brand-beige-dark)] bg-[color:var(--color-brand-beige-dark)] text-white"
                    : "border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] text-[color:var(--color-brand-forest-light)] hover:border-[color:var(--color-brand-beige-dark)]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-[color:var(--color-text-tertiary)]">
            Сначала выберите размер, затем нажмите кнопку <strong>В корзину</strong>.
          </p>
        </div>
      )}

      <AddToCartButton
        product={{
          id: product.id,
          name: product.name,
          price: product.price,
          priceCurrency: product.priceCurrency,
          image: product.image,
          sizes: product.sizes,
          colors: product.colors,
          selectedSize: activeSize ?? undefined,
        }}
        disabled={addDisabled}
        className="w-full rounded-xl bg-[color:var(--color-brand-forest)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-forest-dark)]"
      />
    </div>
  )
}
