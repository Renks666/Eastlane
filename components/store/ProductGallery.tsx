"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSwipeCarousel } from "@/components/store/useSwipeCarousel"

type PointerKind = "mouse" | "touch" | "pen"
type GalleryMode = "idle" | "fullscreen" | "panning" | "pinching"

type ProductGalleryProps = {
  images: string[]
  name: string
  zoomMode?: "wb-hybrid" | "fullscreen-only"
  maxZoomDesktop?: number
  maxZoomMobile?: number
}

type Point = { x: number; y: number }
const DEFAULT_MOBILE_ZOOM = 4
const DOUBLE_TAP_DELAY = 280
const DOUBLE_TAP_DISTANCE = 24

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function clampPanToBounds(pan: Point, zoom: number, width: number, height: number): Point {
  if (zoom <= 1 || width <= 0 || height <= 0) return { x: 0, y: 0 }

  const minX = width - width * zoom
  const minY = height - height * zoom

  return {
    x: clamp(pan.x, minX, 0),
    y: clamp(pan.y, minY, 0),
  }
}

export function ProductGallery({
  images,
  name,
  zoomMode = "wb-hybrid",
  maxZoomDesktop = 2.5,
  maxZoomMobile = DEFAULT_MOBILE_ZOOM,
}: ProductGalleryProps) {
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

  const [mode, setMode] = useState<GalleryMode>("idle")
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const viewerSurfaceRef = useRef<HTMLDivElement | null>(null)
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const zoomRef = useRef(1)
  const panRef = useRef<Point>({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)
  const pinchStartDistanceRef = useRef<number | null>(null)
  const pinchStartZoomRef = useRef(1)
  const touchPanStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null)

  const {
    emblaRef: viewerEmblaRef,
    emblaApi: viewerEmblaApi,
    selectedIndex: viewerIndex,
    scrollPrev: viewerPrev,
    scrollNext: viewerNext,
    scrollTo: viewerScrollTo,
  } = useSwipeCarousel({ slideCount: gallery.length, loop: true, canDrag: zoom <= 1 })

  const resetViewerTransform = useCallback(() => {
    setZoom(1)
    zoomRef.current = 1
    setPan({ x: 0, y: 0 })
    panRef.current = { x: 0, y: 0 }
    setIsDragging(false)
    isDraggingRef.current = false
    pinchStartDistanceRef.current = null
    touchPanStartRef.current = null
    dragStartRef.current = { x: 0, y: 0, panX: 0, panY: 0 }
    lastTapRef.current = null
  }, [])

  const applyZoomAtPoint = useCallback(
    (nextZoom: number, pointX: number, pointY: number) => {
      const clampedZoom = clamp(Number(nextZoom.toFixed(3)), 1, maxZoomMobile)
      const oldZoom = zoomRef.current

      if (clampedZoom <= 1) {
        resetViewerTransform()
        return
      }

      const target = viewerSurfaceRef.current
      const rect = target?.getBoundingClientRect()
      const width = rect?.width ?? 0
      const height = rect?.height ?? 0

      const oldPan = panRef.current
      const scale = clampedZoom / oldZoom
      const nextPan = {
        x: pointX - (pointX - oldPan.x) * scale,
        y: pointY - (pointY - oldPan.y) * scale,
      }

      const boundedPan = clampPanToBounds(nextPan, clampedZoom, width, height)

      zoomRef.current = clampedZoom
      panRef.current = boundedPan
      setZoom(clampedZoom)
      setPan(boundedPan)
    },
    [maxZoomMobile, resetViewerTransform]
  )

  const closeViewer = useCallback(() => {
    if (gallery.length > 1) {
      scrollTo(viewerIndex)
    }
    setIsViewerOpen(false)
    setMode("idle")
    resetViewerTransform()
  }, [gallery.length, resetViewerTransform, scrollTo, viewerIndex])

  const openViewer = useCallback(() => {
    resetViewerTransform()
    setIsViewerOpen(true)
    setMode("fullscreen")
  }, [resetViewerTransform])

  const handleWheelZoom = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    const cursorX = event.clientX - rect.left
    const cursorY = event.clientY - rect.top
    const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12
    applyZoomAtPoint(zoomRef.current * factor, cursorX, cursorY)
  }

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointerKind = (event.pointerType || "mouse") as PointerKind
    if (pointerKind !== "mouse" && pointerKind !== "touch" && pointerKind !== "pen") return
    if (zoom <= 1) return
    if (event.button !== 2 && event.button !== 0) return

    event.preventDefault()
    isDraggingRef.current = true
    setIsDragging(true)
    setMode("panning")
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

    const target = viewerSurfaceRef.current
    const rect = target?.getBoundingClientRect()

    const dx = event.clientX - dragStartRef.current.x
    const dy = event.clientY - dragStartRef.current.y
    const nextPan = {
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    }

    const boundedPan = clampPanToBounds(nextPan, zoomRef.current, rect?.width ?? 0, rect?.height ?? 0)
    panRef.current = boundedPan
    setPan(boundedPan)
  }

  const stopDragging = () => {
    isDraggingRef.current = false
    setIsDragging(false)
    setMode(isViewerOpen ? "fullscreen" : "idle")
  }

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (zoomRef.current > 1 && event.touches.length === 1) {
      const touch = event.touches[0]
      touchPanStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        panX: panRef.current.x,
        panY: panRef.current.y,
      }
      setMode("panning")
      return
    }

    if (event.touches.length !== 2) {
      pinchStartDistanceRef.current = null
      return
    }

    const [first, second] = [event.touches[0], event.touches[1]]
    const dx = second.clientX - first.clientX
    const dy = second.clientY - first.clientY
    pinchStartDistanceRef.current = Math.hypot(dx, dy)
    pinchStartZoomRef.current = zoomRef.current
    setMode("pinching")
  }

  const onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (zoomRef.current > 1 && event.touches.length === 1 && touchPanStartRef.current) {
      event.preventDefault()
      const touch = event.touches[0]
      const start = touchPanStartRef.current
      const target = viewerSurfaceRef.current
      const rect = target?.getBoundingClientRect()
      const nextPan = {
        x: start.panX + (touch.clientX - start.x),
        y: start.panY + (touch.clientY - start.y),
      }
      const boundedPan = clampPanToBounds(nextPan, zoomRef.current, rect?.width ?? 0, rect?.height ?? 0)
      panRef.current = boundedPan
      setPan(boundedPan)
      return
    }

    if (event.touches.length !== 2 || pinchStartDistanceRef.current === null) return
    event.preventDefault()

    const [first, second] = [event.touches[0], event.touches[1]]
    const dx = second.clientX - first.clientX
    const dy = second.clientY - first.clientY
    const currentDistance = Math.hypot(dx, dy)
    if (!Number.isFinite(currentDistance) || currentDistance <= 0) return

    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = (first.clientX + second.clientX) / 2 - rect.left
    const centerY = (first.clientY + second.clientY) / 2 - rect.top
    const scale = currentDistance / pinchStartDistanceRef.current
    applyZoomAtPoint(pinchStartZoomRef.current * scale, centerX, centerY)
  }

  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length < 2) {
      pinchStartDistanceRef.current = null
    }
    if (event.touches.length === 0) {
      touchPanStartRef.current = null
    }

    if (event.touches.length === 0 && event.changedTouches.length === 1) {
      const touch = event.changedTouches[0]
      const now = Date.now()
      const lastTap = lastTapRef.current

      if (lastTap) {
        const elapsed = now - lastTap.time
        const distance = Math.hypot(lastTap.x - touch.clientX, lastTap.y - touch.clientY)

        if (elapsed <= DOUBLE_TAP_DELAY && distance <= DOUBLE_TAP_DISTANCE) {
          const rect = event.currentTarget.getBoundingClientRect()
          const x = touch.clientX - rect.left
          const y = touch.clientY - rect.top
          const targetZoom = zoomRef.current > 1 ? 1 : Math.min(2, maxZoomMobile)
          applyZoomAtPoint(targetZoom, x, y)
          lastTapRef.current = null
          return
        }
      }

      lastTapRef.current = {
        time: now,
        x: touch.clientX,
        y: touch.clientY,
      }
    }

    if (event.touches.length === 0) {
      setMode(isViewerOpen ? "fullscreen" : "idle")
    }
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
                <button
                  type="button"
                  className="relative h-full w-full"
                  onClick={openViewer}
                  aria-label="Открыть фото"
                >
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
                        data-testid="viewer-zoom-surface"
                        ref={i === viewerIndex ? viewerSurfaceRef : null}
                        onWheel={handleWheelZoom}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={stopDragging}
                        onPointerCancel={stopDragging}
                        onContextMenu={(event) => {
                          if (zoom > 1) event.preventDefault()
                        }}
                        style={{
                          cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
                          touchAction: zoom > 1 ? "none" : "pan-y",
                        }}
                      >
                        <Image
                          src={image}
                          alt={`${name} ${i + 1}`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 1000px"
                          className={`pointer-events-none select-none object-contain product-viewer-image ${isDragging ? "transition-none" : "transition-transform duration-200 ease-out"}`}
                          draggable={false}
                          style={{
                            transform: i === viewerIndex
                              ? `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`
                              : "translate3d(0, 0, 0) scale(1)",
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
              Масштаб: {Math.round(zoom * 100)}% • Режим: {mode} • Колесико/Pinch: zoom • Double-tap: 1x/2x
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
