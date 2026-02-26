"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { AddToCartButton } from "@/components/store/AddToCartButton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { resolveColorSwatch } from "@/src/domains/product-attributes/color-swatches"
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

const TEXT = {
  chooseSize: "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u0430\u0437\u043c\u0435\u0440",
  pickSizeFirst: "\u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u0430\u0437\u043c\u0435\u0440, \u0437\u0430\u0442\u0435\u043c \u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u043a\u043d\u043e\u043f\u043a\u0443 \u0412 \u043a\u043e\u0440\u0437\u0438\u043d\u0443.",
  availableColors: "\u0414\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0435 \u0446\u0432\u0435\u0442\u0430",
  noColors: "\u0423\u0442\u043e\u0447\u043d\u0438\u0442\u0435 \u0443 \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u0430",
} as const

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [activeSize, setActiveSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null)
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false)

  const requiresSize = product.sizes.length > 0
  const addDisabled = requiresSize && !activeSize
  const visibleColors = product.colors.slice(0, 8)
  const hiddenColorsCount = Math.max(product.colors.length - visibleColors.length, 0)

  const helperText = (() => {
    if (requiresSize) return TEXT.pickSizeFirst
    return null
  })()

  return (
    <div className="space-y-3.5">
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.11em] text-[color:var(--color-brand-forest-light)]">{TEXT.availableColors}</p>
        {product.colors.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {visibleColors.map((color) => {
              const swatch = resolveColorSwatch(color)
              return (
                <span
                  key={color}
                  role="img"
                  title={swatch.label}
                  aria-label={swatch.label}
                  className="inline-flex h-6 w-6 rounded-full border border-[color:var(--color-border-primary)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"
                  style={{ backgroundColor: swatch.hex }}
                />
              )
            })}
            {hiddenColorsCount > 0 ? (
              <span className="text-xs font-medium text-[color:var(--color-text-secondary)]">+{hiddenColorsCount}</span>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-[color:var(--color-text-secondary)]">{TEXT.noColors}</p>
        )}
      </div>

      {requiresSize && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.11em] text-[color:var(--color-brand-forest-light)]">{TEXT.chooseSize}</p>
          <DropdownMenu open={sizeMenuOpen} onOpenChange={setSizeMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="store-focus inline-flex h-10 w-full items-center justify-between rounded-xl border border-[color:var(--color-border-primary)] bg-white px-3 text-sm font-medium text-[color:var(--color-text-primary)] transition hover:border-[color:var(--color-brand-beige-dark)]"
                aria-label={TEXT.chooseSize}
              >
                <span>{activeSize ?? TEXT.chooseSize}</span>
                <ChevronDown className="h-4 w-4 text-[color:var(--color-text-secondary)]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] p-2"
            >
              {product.sizes.map((size) => {
                const isActive = activeSize === size
                return (
                  <DropdownMenuItem
                    key={size}
                    onSelect={(event) => {
                      event.preventDefault()
                      setActiveSize(size)
                      setSizeMenuOpen(false)
                    }}
                    className="mb-1 last:mb-0 cursor-pointer rounded-lg border border-[color:var(--color-border-primary)] px-2 py-2 text-[color:var(--color-text-primary)] hover:border-[color:var(--color-brand-beige-dark)] hover:bg-[color:var(--color-bg-tertiary)]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center rounded border ${
                          isActive
                            ? "border-[color:var(--color-brand-beige-dark)] bg-[color:var(--color-bg-tertiary)]"
                            : "border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]"
                        }`}
                        aria-hidden="true"
                      >
                        {isActive ? <Check className="h-3.5 w-3.5 text-[color:var(--color-brand-forest-light)]" /> : null}
                      </span>
                      <span className="text-sm font-medium">{size}</span>
                    </span>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {helperText ? <p className="text-xs leading-snug text-[color:var(--color-text-tertiary)]">{helperText}</p> : null}

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
          selectedColor: product.colors.length === 1 ? product.colors[0] : undefined,
        }}
        disabled={addDisabled}
        className="w-full rounded-xl bg-[color:var(--color-brand-forest)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_-16px_rgba(10,61,49,0.7)] transition hover:bg-[color:var(--color-brand-forest-dark)]"
      />
    </div>
  )
}
