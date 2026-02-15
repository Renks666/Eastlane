"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Search, ZoomIn, ZoomOut, X } from "lucide-react"
import { AddToCartButton } from "@/components/store/AddToCartButton"

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
  const images = useMemo(() => (product.images && product.images.length > 0 ? product.images : [FALLBACK_IMAGE]), [product.images])

  const [selectedSize, setSelectedSize] = useState<string>(sizes.length === 1 ? sizes[0] : "")
  const [selectedColor, setSelectedColor] = useState<string>(colors.length === 1 ? colors[0] : "")
  const [imageIndex, setImageIndex] = useState(0)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [zoom, setZoom] = useState(1)

  const requiresSizeSelection = sizes.length > 1
  const requiresColorSelection = colors.length > 1
  const disableAdd = (requiresSizeSelection && !selectedSize) || (requiresColorSelection && !selectedColor)

  const activeImage = images[imageIndex] || FALLBACK_IMAGE

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

  return (
    <>
      <article className="group rounded-2xl border border-[#d8cfb7] bg-white/90 p-3 transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-28px_rgba(15,63,51,0.8)]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-[#efe7d4] bg-[#f8f5ee]">
          <Link href={`/products/${product.id}`} className="block h-full w-full" aria-label={`Открыть товар ${product.name}`}>
            <Image
              src={activeImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          </Link>

          <button
            type="button"
            onClick={openViewer}
            className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d8cfb7] bg-white/90 text-[#0f3f33] transition hover:bg-white"
            aria-label="Открыть фото"
          >
            <Search className="h-4 w-4" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                className="absolute left-2 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#d8cfb7] bg-white/90 text-[#0f3f33] transition hover:bg-white"
                aria-label="Предыдущее фото"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-2 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#d8cfb7] bg-white/90 text-[#0f3f33] transition hover:bg-white"
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
                className={`h-1.5 rounded-full transition ${idx === imageIndex ? "w-5 bg-[#0f5a49]" : "w-1.5 bg-[#d8cfb7] hover:bg-[#b29152]"}`}
                aria-label={`Открыть фото ${idx + 1}`}
              />
            ))}
          </div>
        )}

        <div className="mt-3">
          <p className="text-xs uppercase tracking-[0.15em] text-[#8b7a55]">{product.categoryName ?? "Каталог"}</p>
          <Link href={`/products/${product.id}`} className="mt-1 block line-clamp-1 text-base font-medium text-[#0f1720]">
            {product.name}
          </Link>

          {(sizes.length > 1 || colors.length > 1) && (
            <div className="mt-3 grid gap-2">
              {sizes.length > 1 && (
                <select
                  value={selectedSize}
                  onChange={(event) => setSelectedSize(event.target.value)}
                  className="h-9 rounded-lg border border-[#d8cfb7] bg-white px-2 text-xs text-[#0f1720] outline-none focus:border-[#b29152]"
                >
                  <option value="">Выберите размер</option>
                  {sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              )}

              {colors.length > 1 && (
                <select
                  value={selectedColor}
                  onChange={(event) => setSelectedColor(event.target.value)}
                  className="h-9 rounded-lg border border-[#d8cfb7] bg-white px-2 text-xs text-[#0f1720] outline-none focus:border-[#b29152]"
                >
                  <option value="">Выберите цвет</option>
                  {colors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-lg font-semibold text-[#0f3f33]">{Number(product.price).toFixed(2)} ₽</p>
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0],
                sizes,
                colors,
                selectedSize: selectedSize || undefined,
                selectedColor: selectedColor || undefined,
              }}
              disabled={disableAdd}
              className="rounded-lg bg-brand-gold-500 px-3 py-1.5 text-xs font-semibold text-brand-dark transition hover:bg-brand-gold-400"
            />
          </div>

          {disableAdd && (
            <p className="mt-2 text-[11px] text-[#7a6d52]">Выберите размер и цвет перед добавлением.</p>
          )}
        </div>
      </article>

      {isViewerOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4"
          onClick={closeViewer}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl border border-[#d8cfb7] bg-white p-3 shadow-2xl md:p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeViewer}
              className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d8cfb7] bg-white/95 text-[#0f3f33] transition hover:bg-[#f7f4ea]"
              aria-label="Закрыть фото"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-[#0f3f33]">{product.name}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={zoomOut}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d8cfb7] text-[#0f3f33] transition hover:bg-[#f7f4ea]"
                  aria-label="Отдалить"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={zoomIn}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d8cfb7] text-[#0f3f33] transition hover:bg-[#f7f4ea]"
                  aria-label="Приблизить"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={closeViewer}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d8cfb7] text-[#0f3f33] transition hover:bg-[#f7f4ea]"
                  aria-label="Закрыть"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#f8f5ee]">
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
                    className="absolute left-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#d8cfb7] bg-white/90 text-[#0f3f33] transition hover:bg-white"
                    aria-label="Предыдущее фото"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#d8cfb7] bg-white/90 text-[#0f3f33] transition hover:bg-white"
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
