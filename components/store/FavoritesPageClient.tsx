"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { AddToCartButton } from "@/components/store/AddToCartButton"
import { useCart } from "@/components/store/CartProvider"
import { useFavorites } from "@/components/store/FavoritesProvider"
import type { FavoriteItem } from "@/components/store/favorite-types"
import { formatCny, formatRub } from "@/src/shared/lib/format-price"

const FALLBACK_IMAGE = "https://placehold.co/600x800/f1efe7/18362e?text=EASTLANE"

type FavoriteCartActionProps = {
  item: FavoriteItem
}

function FavoriteCartAction({ item }: FavoriteCartActionProps) {
  const { addItem } = useCart()
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const quickAddRef = useRef<HTMLDivElement | null>(null)

  const sizes = useMemo(() => item.sizes ?? [], [item.sizes])
  const colors = useMemo(() => item.colors ?? [], [item.colors])
  const requiresSizeChoice = sizes.length > 1

  useEffect(() => {
    if (!quickAddOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (quickAddRef.current && !quickAddRef.current.contains(event.target as Node)) {
        setQuickAddOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [quickAddOpen])

  const selectedSizeFallback = item.selectedSize ?? (sizes.length === 1 ? sizes[0] : undefined)
  const selectedColorFallback = item.selectedColor ?? (colors.length === 1 ? colors[0] : undefined)

  const handleQuickAdd = (selectedSize: string) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      priceCurrency: item.priceCurrency,
      image: item.image,
      sizes,
      colors,
      selectedSize,
      selectedColor: selectedColorFallback,
    })

    toast.success("Товар добавлен в корзину", {
      description: item.name,
      action: {
        label: "Открыть корзину",
        onClick: () => {
          window.dispatchEvent(new CustomEvent("cart:open"))
        },
      },
      duration: 3000,
    })

    setQuickAddOpen(false)
  }

  if (!requiresSizeChoice) {
    return (
      <AddToCartButton
        product={{
          id: item.id,
          name: item.name,
          price: item.price,
          priceCurrency: item.priceCurrency,
          image: item.image,
          sizes,
          colors,
          selectedSize: selectedSizeFallback,
          selectedColor: selectedColorFallback,
        }}
        className="h-10 w-full rounded-lg px-3 text-sm"
      />
    )
  }

  return (
    <div className="relative" ref={quickAddRef}>
      <button
        type="button"
        onClick={() => setQuickAddOpen((prev) => !prev)}
        className="store-focus inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-3 text-sm font-semibold text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-accent)]"
        aria-label="Выбрать размер и добавить в корзину"
        aria-expanded={quickAddOpen}
      >
        <ShoppingCart className="h-4 w-4" />
        Выбрать размер
      </button>

      {quickAddOpen ? (
        <div className="absolute left-0 top-full z-[90] mt-1.5 min-w-[140px] rounded-xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] p-2 shadow-lg">
          <p className="mb-2 text-center text-sm font-medium text-[color:var(--color-text-primary)]">Размер:</p>
          <div className="flex flex-col">
            {sizes.map((size) => (
              <button
                key={`${item.id}-${size}`}
                type="button"
                onClick={() => handleQuickAdd(size)}
                className="store-focus w-full border-t border-b border-[color:var(--color-border-secondary)] py-2 text-center text-xs font-medium text-[color:var(--color-text-secondary)] transition first:border-t-[color:var(--color-border-secondary)] hover:bg-[color:var(--color-bg-accent)] hover:text-[color:var(--color-brand-forest-light)] hover:border-2 hover:border-[color:var(--color-brand-beige-dark)] focus:bg-[color:var(--color-bg-accent)] focus:text-[color:var(--color-brand-forest-light)] focus:border-2 focus:border-[color:var(--color-brand-beige-dark)]"
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function FavoritesPageClient() {
  const { items, isHydrated, removeItem, clear } = useFavorites()

  if (!isHydrated) {
    return (
      <div className="store-card p-6 text-sm text-[color:var(--color-text-secondary)]">
        Загружаем избранное...
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="store-card p-6 md:p-8">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-tertiary)] text-[color:var(--color-brand-forest-light)]">
            <Heart className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-xl font-semibold text-[color:var(--color-brand-forest-light)]">В избранном пока пусто</h2>
          <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
            Добавляйте товары в избранное через иконку сердечка в карточке или на странице товара.
          </p>
          <Link
            href="/catalog"
            className="store-focus mt-5 inline-flex rounded-full bg-[color:var(--color-brand-forest)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-forest-dark)]"
          >
            Перейти в каталог
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-[color:var(--color-text-tertiary)]">
          Сохранено товаров: <span className="font-semibold text-[color:var(--color-brand-forest-light)]">{items.length}</span>
        </p>
        <button
          type="button"
          onClick={clear}
          className="store-focus rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-text-secondary)] transition hover:bg-[color:var(--color-bg-accent)]"
        >
          Очистить всё
        </button>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="store-card overflow-hidden p-3">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-image)]">
              <Image
                src={item.image || FALLBACK_IMAGE}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain"
              />
            </div>

            <div className="mt-3">
              <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--color-text-accent)]">{item.categoryName || "Каталог"}</p>
              {item.brandName ? (
                <p className="mt-1 text-sm font-semibold text-[color:var(--color-brand-forest-light)]">{item.brandName}</p>
              ) : null}
              <p className="mt-1 line-clamp-2 text-base font-medium text-[color:var(--color-text-primary)]">{item.name}</p>
              <p className="font-price tabular-nums mt-2 text-lg font-semibold text-black">
                {item.priceCurrency === "CNY" ? formatCny(item.price, 0) : formatRub(item.price, 0)}
              </p>
            </div>

            <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-2">
              <FavoriteCartAction item={item} />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="store-focus inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] text-[color:var(--color-text-tertiary)] transition hover:bg-[color:var(--color-bg-accent)] hover:text-[color:var(--color-brand-beige-dark)]"
                aria-label={`Удалить ${item.name} из избранного`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <Link
                href={`/products/${item.id}`}
                className="store-focus col-span-2 inline-flex h-10 items-center justify-center rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-3 text-sm font-semibold text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-accent)]"
              >
                К товару
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
