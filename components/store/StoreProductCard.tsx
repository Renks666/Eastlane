"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Search, ShoppingCart, ZoomIn, ZoomOut, X } from "lucide-react"
import { toast } from "sonner"
import { AddToCartButton } from "@/components/store/AddToCartButton"
import { useCart } from "@/components/store/CartProvider"

type StoreProductCardProps = {
  product: {
    id: number
    name: string
    price: number
    images?: string[] | null
    sizes?: string[] | null
    colors?: string[] | null
    categoryName?: string | null
  }
}

const FALLBACK_IMAGE = "https://placehold.co/600x800/f1efe7/18362e?text=EASTLANE"

export function StoreProductCard({ product }: StoreProductCardProps) {
  const sizes = useMemo(() => product.sizes ?? [], [product.sizes])
  const colors = useMemo(() => product.colors ?? [], [product.colors])
  const images = useMemo(() => {
    const normalizedImages = Array.isArray(product.images)
      ? product.images.filter((image): image is string => typeof image === "string" && image.trim().length > 0)
      : []
    return normalizedImages.length > 0 ? normalizedImages : [FALLBACK_IMAGE]
  }, [product.images])
  const { addItem } = useCart()

  const [imageIndex, setImageIndex] = useState(0)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  // Состояние быстрого добавления в корзину: открыт ли dropdown выбора размера
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const quickAddRef = useRef<HTMLDivElement>(null)

  // Определяем, есть ли варианты товара (несколько размеров или цветов)
  const hasVariants = sizes.length > 1 || colors.length > 1
  const activeImage = images[imageIndex] || FALLBACK_IMAGE

  // Закрытие dropdown при клике вне области карточки/меню
  useEffect(() => {
    if (!quickAddOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (quickAddRef.current && !quickAddRef.current.contains(e.target as Node)) {
        setQuickAddOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [quickAddOpen])

  const nextImage = () => {
    setImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const openViewer = () => {
    setZoom(1)
    setIsViewerOpen(true)
  }

  const closeViewer = () => {
    setIsViewerOpen(false)
    setZoom(1)
  }

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3))
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 1))

  // Быстрое добавление в корзину с выбранным размером (без перехода на страницу товара)
  const handleQuickAdd = (selectedSize: string) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0],
      sizes: sizes,
      colors: colors,
      selectedSize,
      selectedColor: colors.length === 1 ? colors[0] : undefined,
    })
    toast.success("Товар добавлен в корзину", {
      description: product.name,
      action: {
        label: "Открыть корзину",
        onClick: () => window.dispatchEvent(new CustomEvent("cart:open")),
      },
      duration: 3000,
    })
    setQuickAddOpen(false)
  }

  return (
    <>
      <article className="group rounded-2xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/90 p-3 transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-28px_rgba(15,63,51,0.8)]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-image)]">
          <Link href={`/products/${product.id}`} className="block h-full w-full" aria-label={`Открыть товар ${product.name}`}>
            <Image
              src={activeImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-contain transition duration-300 group-hover:scale-105"
            />
          </Link>

          <button
            type="button"
            onClick={openViewer}
            className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/90 text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-primary)]"
            aria-label="Открыть фото"
          >
            <Search className="h-4 w-4" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                className="absolute left-2 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/90 text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-primary)]"
                aria-label="Предыдущее фото"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-2 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/90 text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-primary)]"
                aria-label="Следующее фото"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-2 flex items-center justify-center gap-1.5">
            {images.map((_, idx) => (
              <button
                key={`${product.id}-${idx}`}
                type="button"
                onClick={() => setImageIndex(idx)}
                className={`h-1.5 rounded-full transition ${idx === imageIndex ? "w-5 bg-[color:var(--color-brand-forest)]" : "w-1.5 bg-[color:var(--color-border-primary)] hover:bg-[color:var(--color-brand-beige-dark)]"}`}
                aria-label={`Открыть фото ${idx + 1}`}
              />
            ))}
          </div>
        )}

        <div className="mt-3">
          <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--color-text-accent)]">{product.categoryName ?? "Каталог"}</p>
          <Link href={`/products/${product.id}`} className="mt-1 block line-clamp-2 text-base font-medium leading-snug text-[color:var(--color-text-primary)] hover:text-[color:var(--color-brand-forest-light)]">
            {product.name}
          </Link>
          {/* Размеры под названием — в квадратиках (чипы) */}
          {sizes.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {sizes.map((size) => (
                <span
                  key={size}
                  className="inline-flex h-6 min-w-[28px] items-center justify-center rounded border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-2 text-xs font-medium text-[color:var(--color-text-secondary)]"
                >
                  {size}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between gap-2 sm:gap-3">
            <p className="font-price tabular-nums text-lg font-semibold text-black">{Math.round(Number(product.price))} ₽</p>
            
            {hasVariants ? (
              <div className="flex items-center gap-1.5 sm:gap-2" ref={quickAddRef}>
                {/* Иконка корзины слева от кнопки; по клику — выбор размера и добавление в корзину */}
                {sizes.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setQuickAddOpen((v) => !v)}
                    className="inline-flex h-10 w-10 min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-center rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-accent)] sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0"
                    aria-label="Быстро добавить в корзину"
                    aria-expanded={quickAddOpen}
                  >
                    <ShoppingCart className="h-4 w-4 sm:h-4 sm:w-4" />
                  </button>
                  {quickAddOpen && (
                    <div
                      className="absolute left-0 top-full z-20 mt-1.5 min-w-[120px] rounded-xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] p-2 shadow-lg"
                      role="listbox"
                      aria-label="Выберите размер"
                    >
                      <p className="mb-2 text-center text-sm font-medium text-[color:var(--color-text-primary)]">Размер:</p>
                      <div className="flex flex-col">
                        {sizes.map((size) => (
                          <button
                            key={size}
                            type="button"
                            role="option"
                            onClick={() => handleQuickAdd(size)}
                            className="w-full border-t border-b border-[color:var(--color-border-secondary)] py-2 text-center text-xs font-medium text-[color:var(--color-text-secondary)] transition first:border-t-[color:var(--color-border-secondary)] hover:bg-[color:var(--color-bg-accent)] hover:text-[color:var(--color-brand-forest-light)] hover:border-2 hover:border-[color:var(--color-brand-beige-dark)] focus:outline-none focus:bg-[color:var(--color-bg-accent)] focus:text-[color:var(--color-brand-forest-light)] focus:border-2 focus:border-[color:var(--color-brand-beige-dark)]"
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                )}
                <Link
                  href={`/products/${product.id}`}
                  className="inline-flex min-h-[44px] min-w-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-[color:var(--color-brand-forest)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--color-brand-forest-dark)] sm:flex-initial sm:px-4"
                >
                  К товару
                </Link>
              </div>
            ) : (
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.images?.[0],
                  sizes: sizes.length === 1 ? sizes : [],
                  colors: colors.length === 1 ? colors : [],
                  selectedSize: sizes.length === 1 ? sizes[0] : undefined,
                  selectedColor: colors.length === 1 ? colors[0] : undefined,
                }}
                className="rounded-lg bg-[color:var(--color-brand-forest)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--color-brand-forest-dark)]"
              />
            )}
          </div>
        </div>
      </article>

      {isViewerOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4"
          onClick={closeViewer}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] p-3 shadow-2xl md:p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeViewer}
              className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/95 text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-accent)]"
              aria-label="Закрыть фото"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-[color:var(--color-brand-forest-light)]">{product.name}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={zoomOut}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[color:var(--color-border-primary)] text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-accent)]"
                  aria-label="Отдалить"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={zoomIn}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[color:var(--color-border-primary)] text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-accent)]"
                  aria-label="Приблизить"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={closeViewer}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[color:var(--color-border-primary)] text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-accent)]"
                  aria-label="Закрыть"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[color:var(--color-bg-image)]">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-contain transition-transform duration-200"
                style={{ transform: `scale(${zoom})` }}
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/90 text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-primary)]"
                    aria-label="Предыдущее фото"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/90 text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-primary)]"
                    aria-label="Следующее фото"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
