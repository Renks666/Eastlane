"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Search, ShoppingCart, ZoomIn, ZoomOut, X } from "lucide-react"
import { toast } from "sonner"
import { AddToCartButton } from "@/components/store/AddToCartButton"
import { useCart } from "@/components/store/CartProvider"
import { ExchangeRateTooltip } from "@/components/store/ExchangeRateTooltip"
import { useSwipeCarousel } from "@/components/store/useSwipeCarousel"
import {
  convertCnyToRubApprox,
  convertRubToCnyApprox,
  formatCny,
  formatRub,
  type PriceCurrency,
} from "@/src/shared/lib/format-price"
import { resolveColorSwatch } from "@/src/domains/product-attributes/color-swatches"

type StoreProductCardProps = {
  product: {
    id: number
    name: string
    price: number
    priceCurrency: PriceCurrency
    images?: string[] | null
    sizes?: string[] | null
    colors?: string[] | null
    categoryName?: string | null
    brandName?: string | null
  }
  cnyPerRub: number
}

const FALLBACK_IMAGE = "https://placehold.co/600x800/f1efe7/18362e?text=EASTLANE"

export function StoreProductCard({ product, cnyPerRub }: StoreProductCardProps) {
  const sizes = useMemo(() => product.sizes ?? [], [product.sizes])
  const colors = useMemo(() => product.colors ?? [], [product.colors])
  const images = useMemo(() => {
    const normalizedImages = Array.isArray(product.images)
      ? product.images.filter((image): image is string => typeof image === "string" && image.trim().length > 0)
      : []
    return normalizedImages.length > 0 ? normalizedImages : [FALLBACK_IMAGE]
  }, [product.images])
  const { addItem } = useCart()

  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [canHover, setCanHover] = useState(false)
  const [isRateDetailsOpen, setIsRateDetailsOpen] = useState(false)
  const quickAddRef = useRef<HTMLDivElement>(null)

  const {
    emblaRef: cardEmblaRef,
    selectedIndex: cardSelectedIndex,
    scrollPrev: scrollCardPrev,
    scrollNext: scrollCardNext,
    scrollTo: scrollCardTo,
  } = useSwipeCarousel({ slideCount: images.length, loop: true })
  const {
    emblaRef: viewerEmblaRef,
    emblaApi: viewerEmblaApi,
    selectedIndex: viewerSelectedIndex,
    scrollPrev: scrollViewerPrev,
    scrollNext: scrollViewerNext,
  } = useSwipeCarousel({ slideCount: images.length, loop: true })

  const hasVariants = sizes.length > 1 || colors.length > 1
  const visibleColors = colors.slice(0, 5)
  const hiddenColorsCount = Math.max(colors.length - visibleColors.length, 0)
  const hasValidRate = Number.isFinite(cnyPerRub) && cnyPerRub > 0

  const primaryPrice = useMemo(() => {
    if (product.priceCurrency === "CNY") {
      return formatCny(product.price, 0)
    }
    return formatRub(product.price, 0)
  }, [product.price, product.priceCurrency])

  const secondaryApprox = useMemo(() => {
    if (!hasValidRate) return null

    if (product.priceCurrency === "CNY") {
      const rubApprox = convertCnyToRubApprox(product.price, cnyPerRub)
      return rubApprox === null ? null : `≈ ${formatRub(rubApprox, 0)}`
    }

    const cnyApprox = convertRubToCnyApprox(product.price, cnyPerRub)
    return cnyApprox === null ? null : `≈ ${formatCny(cnyApprox, 0)}`
  }, [cnyPerRub, hasValidRate, product.price, product.priceCurrency])

  const displayRateRubPerCny = useMemo(() => {
    if (!hasValidRate) return null
    return 1 / cnyPerRub
  }, [cnyPerRub, hasValidRate])

  const displayRateText = useMemo(() => {
    if (displayRateRubPerCny === null || !Number.isFinite(displayRateRubPerCny)) return null
    return new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(displayRateRubPerCny)
  }, [displayRateRubPerCny])

  const hasRateDetails = secondaryApprox !== null && displayRateText !== null

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

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)")
    const sync = () => {
      const supportsHover = media.matches
      setCanHover(supportsHover)
      setIsRateDetailsOpen(false)
    }

    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  const openViewer = () => {
    setZoom(1)
    setIsViewerOpen(true)
  }

  const closeViewer = () => {
    if (images.length > 1) {
      scrollCardTo(viewerSelectedIndex)
    }
    setIsViewerOpen(false)
    setZoom(1)
  }

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3))
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 1))

  const handleQuickAdd = (selectedSize: string) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      priceCurrency: product.priceCurrency,
      image: product.images?.[0],
      sizes,
      colors,
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

  const handleRateLineClick = () => {
    if (!hasRateDetails) return
    if (canHover) {
      setIsRateDetailsOpen(true)
      return
    }
    setIsRateDetailsOpen((prev) => !prev)
  }

  const handleRateMouseEnter = () => {
    if (!hasRateDetails || !canHover) return
    setIsRateDetailsOpen(true)
  }

  const handleRateMouseLeave = () => {
    if (!canHover) return
    setIsRateDetailsOpen(false)
  }

  useEffect(() => {
    if (!isViewerOpen || !viewerEmblaApi) return
    viewerEmblaApi.scrollTo(cardSelectedIndex, true)
  }, [cardSelectedIndex, isViewerOpen, viewerEmblaApi])

  return (
    <>
      <article className="group rounded-2xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/90 p-3 transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-28px_rgba(15,63,51,0.8)]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-image)]">
          <div className="h-full overflow-hidden touch-pan-y" ref={cardEmblaRef}>
            <div className="flex h-full">
              {images.map((image, idx) => (
                <div key={`${product.id}-${idx}-${image}`} className="relative min-w-0 flex-[0_0_100%]">
                  <Link href={`/products/${product.id}`} className="block h-full w-full" aria-label={`Открыть товар ${product.name}`}>
                    <Image
                      src={image}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain transition duration-300 group-hover:scale-105"
                    />
                  </Link>
                </div>
              ))}
            </div>
          </div>

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
                onClick={scrollCardPrev}
                className="absolute left-2 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/90 text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-primary)]"
                aria-label="Предыдущее фото"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={scrollCardNext}
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
                onClick={() => scrollCardTo(idx)}
                className={`h-1.5 rounded-full transition ${idx === cardSelectedIndex ? "w-5 bg-[color:var(--color-brand-forest)]" : "w-1.5 bg-[color:var(--color-border-primary)] hover:bg-[color:var(--color-brand-beige-dark)]"}`}
                aria-label={`Открыть фото ${idx + 1}`}
                aria-pressed={idx === cardSelectedIndex}
              />
            ))}
          </div>
        )}

        <div className="mt-3">
          <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--color-text-accent)]">{product.categoryName ?? "Каталог"}</p>
          {product.brandName ? (
            <p className="mt-1 text-sm font-semibold text-[color:var(--color-brand-forest-light)]">{product.brandName}</p>
          ) : null}
          <Link href={`/products/${product.id}`} className="mt-1 block line-clamp-2 text-base font-medium leading-snug text-[color:var(--color-text-primary)] hover:text-[color:var(--color-brand-forest-light)]">
            {product.name}
          </Link>

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

          {colors.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              {visibleColors.map((color) => {
                const swatch = resolveColorSwatch(color)
                return (
                  <span
                    key={color}
                    role="img"
                    title={swatch.label}
                    aria-label={swatch.label}
                    className="inline-flex h-4 w-4 rounded-full border border-[color:var(--color-border-primary)]"
                    style={{ backgroundColor: swatch.hex }}
                  />
                )
              })}
              {hiddenColorsCount > 0 ? (
                <span className="text-xs font-medium text-[color:var(--color-text-secondary)]">
                  +{hiddenColorsCount}
                </span>
              ) : null}
            </div>
          )}

          <div className="mt-3 flex items-start justify-between gap-2 sm:gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-price tabular-nums truncate text-lg font-semibold text-black">{primaryPrice}</p>

              {hasRateDetails ? (
                <ExchangeRateTooltip isOpen={isRateDetailsOpen} rateText={displayRateText} align="left">
                  {({ describedBy }) => (
                    <button
                      type="button"
                      onClick={handleRateLineClick}
                      onMouseEnter={handleRateMouseEnter}
                      onMouseLeave={handleRateMouseLeave}
                      onFocus={() => setIsRateDetailsOpen(true)}
                      onBlur={() => setIsRateDetailsOpen(false)}
                      className={`w-full py-0 text-left text-xs leading-tight text-[color:var(--color-text-secondary)] transition-opacity ${canHover ? "cursor-pointer hover:opacity-85" : ""}`}
                      aria-expanded={isRateDetailsOpen}
                      aria-describedby={describedBy}
                    >
                      <span className="font-price tabular-nums block truncate leading-none">{secondaryApprox}</span>
                    </button>
                  )}
                </ExchangeRateTooltip>
              ) : null}

            </div>

            {hasVariants ? (
              <div className="flex items-center gap-1.5 sm:gap-2" ref={quickAddRef}>
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
                        className="absolute bottom-full left-0 z-[90] mb-1.5 min-w-[120px] rounded-xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] p-2 shadow-lg"
                        aria-label="Выберите размер"
                      >
                        <p className="mb-2 text-center text-sm font-medium text-[color:var(--color-text-primary)]">Размер:</p>
                        <div className="flex flex-col">
                          {sizes.map((size) => (
                            <button
                              key={size}
                              type="button"
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
                  className="inline-flex min-h-[44px] min-w-[84px] whitespace-nowrap items-center justify-center gap-1 rounded-lg bg-[color:var(--color-brand-forest)] px-2 py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--color-brand-forest-dark)] sm:min-w-[92px] sm:px-3"
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
                  priceCurrency: product.priceCurrency,
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
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4" onClick={closeViewer}>
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
              <div className="h-full overflow-hidden touch-pan-y" ref={viewerEmblaRef}>
                <div className="flex h-full">
                  {images.map((image, idx) => (
                    <div key={`viewer-${product.id}-${idx}-${image}`} className="relative min-w-0 flex-[0_0_100%]">
                      <Image
                        src={image}
                        alt={`${product.name} ${idx + 1}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 900px"
                        className="object-contain transition-transform duration-200"
                        style={{ transform: `scale(${zoom})` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={scrollViewerPrev}
                    className="absolute left-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/90 text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-primary)]"
                    aria-label="Предыдущее фото"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={scrollViewerNext}
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
