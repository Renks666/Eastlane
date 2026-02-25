"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSwipeCarousel } from "@/components/store/useSwipeCarousel"

type ProductGalleryProps = {
  images: string[]
  name: string
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const gallery = useMemo(() => {
    const normalizedImages = Array.isArray(images)
      ? images.filter((image): image is string => typeof image === "string" && image.trim().length > 0)
      : []
    return normalizedImages.length > 0
      ? normalizedImages
      : ["https://placehold.co/1000x1200/efefe8/1f3d32?text=EASTLANE"]
  }, [images])

  const {
    emblaRef: mainEmblaRef,
    selectedIndex: index,
    scrollPrev: prev,
    scrollNext: next,
    scrollTo,
  } = useSwipeCarousel({ slideCount: gallery.length, loop: true })

  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const {
    emblaRef: viewerEmblaRef,
    emblaApi: viewerEmblaApi,
    selectedIndex: viewerIndex,
    scrollPrev: viewerPrev,
    scrollNext: viewerNext,
    scrollTo: viewerScrollTo,
  } = useSwipeCarousel({ slideCount: gallery.length, loop: true, canDrag: zoom <= 1 })

  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const zoomRef = useRef(1)
  const panRef = useRef({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)

  const resetViewerTransform = useCallback(() => {
    setZoom(1)
    zoomRef.current = 1
    setPan({ x: 0, y: 0 })
    panRef.current = { x: 0, y: 0 }
    setIsDragging(false)
    isDraggingRef.current = false
    dragStartRef.current = { x: 0, y: 0, panX: 0, panY: 0 }
  }, [])

  const closeViewer = useCallback(() => {
    if (gallery.length > 1) {
      scrollTo(viewerIndex)
    }
    setIsViewerOpen(false)
    resetViewerTransform()
  }, [gallery.length, resetViewerTransform, scrollTo, viewerIndex])

  const openViewer = useCallback(() => {
    resetViewerTransform()
    setIsViewerOpen(true)
  }, [resetViewerTransform])

  const handleWheelZoom = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    const cursorX = event.clientX - rect.left
    const cursorY = event.clientY - rect.top
    const oldZoom = zoomRef.current
    const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12
    const nextZoom = Math.min(4, Math.max(1, Number((oldZoom * factor).toFixed(3))))

    if (nextZoom <= 1) {
      zoomRef.current = 1
      panRef.current = { x: 0, y: 0 }
      setZoom(1)
      setPan({ x: 0, y: 0 })
      return
    }

    const oldPan = panRef.current
    const scale = nextZoom / oldZoom
    const nextPan = {
      x: cursorX - (cursorX - oldPan.x) * scale,
      y: cursorY - (cursorY - oldPan.y) * scale,
    }

    zoomRef.current = nextZoom
    panRef.current = nextPan
    setZoom(nextZoom)
    setPan(nextPan)
  }

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (zoom <= 1) return
    if (event.button !== 2 && event.button !== 0) return
    event.preventDefault()
    isDraggingRef.current = true
    setIsDragging(true)
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    event.preventDefault()
    const dx = event.clientX - dragStartRef.current.x
    const dy = event.clientY - dragStartRef.current.y
    const nextPan = {
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    }
    panRef.current = nextPan
    setPan(nextPan)
  }

  const stopDragging = () => {
    isDraggingRef.current = false
    setIsDragging(false)
  }

  useEffect(() => {
    panRef.current = pan
  }, [pan])

  useEffect(() => {
    zoomRef.current = zoom
  }, [zoom])

  useEffect(() => {
    if (!isViewerOpen || !viewerEmblaApi) return
    viewerScrollTo(index)
  }, [index, isViewerOpen, viewerEmblaApi, viewerScrollTo])

  useEffect(() => {
    if (!isViewerOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeViewer()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [closeViewer, isViewerOpen])

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]">
        <div className="h-full overflow-hidden touch-pan-y" ref={mainEmblaRef}>
          <div className="flex h-full">
            {gallery.map((image, i) => (
              <div key={`${image}-${i}`} className="relative min-w-0 flex-[0_0_100%]">
                <button type="button" className="relative h-full w-full" onClick={openViewer} aria-label="Открыть фото">
                  <Image
                    src={image}
                    alt={`${name} ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {gallery.length > 1 && (
          <>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90"
              onClick={prev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90"
              onClick={next}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {gallery.map((image, i) => (
            <button
              key={`${image}-${i}`}
              onClick={() => scrollTo(i)}
              className={`relative aspect-square overflow-hidden rounded-xl border ${index === i ? "border-[color:var(--color-brand-gold-600)]" : "border-[color:var(--color-border-primary)]"}`}
              type="button"
              aria-label={`Открыть фото ${i + 1}`}
              aria-pressed={index === i}
            >
              <Image src={image} alt={`${name} превью ${i + 1}`} fill sizes="120px" className="object-contain" />
            </button>
          ))}
        </div>
      )}

      {isViewerOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-4"
          onClick={closeViewer}
        >
          <div className="relative w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-black/65 text-white transition hover:bg-black/80"
              onClick={closeViewer}
              aria-label="Закрыть фото"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[color:var(--color-bg-primary)]">
              <div className="h-full overflow-hidden touch-pan-y" ref={viewerEmblaRef}>
                <div className="flex h-full">
                  {gallery.map((image, i) => (
                    <div key={`viewer-${image}-${i}`} className="relative min-w-0 flex-[0_0_100%]">
                      <div
                        className="relative h-full w-full"
                        onWheel={handleWheelZoom}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={stopDragging}
                        onPointerCancel={stopDragging}
                        onContextMenu={(event) => {
                          if (zoom > 1) event.preventDefault()
                        }}
                        style={{ cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
                      >
                        <Image
                          src={image}
                          alt={`${name} ${i + 1}`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 1000px"
                          className={`pointer-events-none select-none object-contain ${isDragging ? "transition-none" : "transition-transform duration-200 ease-out"}`}
                          draggable={false}
                          style={{
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            transformOrigin: "0 0",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {gallery.length > 1 && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90"
                    onClick={viewerPrev}
                    aria-label="Предыдущее фото"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90"
                    onClick={viewerNext}
                    aria-label="Следующее фото"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            <p className="mt-2 text-center text-xs text-white/85">
              Масштаб: {Math.round(zoom * 100)}% • Колесико: zoom • ПКМ/ЛКМ + движение: переместить
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
