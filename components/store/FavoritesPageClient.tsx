"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, Trash2 } from "lucide-react"
import { AddToCartButton } from "@/components/store/AddToCartButton"
import { useFavorites } from "@/components/store/FavoritesProvider"
import { formatCny, formatRub } from "@/src/shared/lib/format-price"

const FALLBACK_IMAGE = "https://placehold.co/600x800/f1efe7/18362e?text=EASTLANE"

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
              <AddToCartButton
                product={{
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  priceCurrency: item.priceCurrency,
                  image: item.image,
                  sizes: item.sizes ?? [],
                  colors: item.colors ?? [],
                  selectedSize: item.selectedSize,
                  selectedColor: item.selectedColor,
                }}
                className="h-10 w-full rounded-lg px-3 text-sm"
              />
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
