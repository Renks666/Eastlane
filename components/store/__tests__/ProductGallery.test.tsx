/* eslint-disable @next/next/no-img-element */
/* @vitest-environment jsdom */

import React from "react"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ProductGallery } from "@/components/store/ProductGallery"

type SwipeParams = {
  slideCount: number
  loop?: boolean
  canDrag?: boolean
}

const viewerCanDragValues: boolean[] = []
const mainScrollTo = vi.fn()
const viewerScrollTo = vi.fn()

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => {
    const imgProps = { ...props }
    delete imgProps.fill
    return <img {...imgProps} alt={imgProps.alt ?? ""} />
  },
}))

vi.mock("@/components/store/useSwipeCarousel", () => ({
  useSwipeCarousel: (params: SwipeParams) => {
    const isMainCarousel = typeof params.canDrag === "undefined"

    if (isMainCarousel) {
      return {
        emblaRef: vi.fn(),
        emblaApi: {},
        selectedIndex: 2,
        canScrollPrev: true,
        canScrollNext: true,
        scrollPrev: vi.fn(),
        scrollNext: vi.fn(),
        scrollTo: mainScrollTo,
      }
    }

    viewerCanDragValues.push(Boolean(params.canDrag))
    return {
      emblaRef: vi.fn(),
      emblaApi: {},
      selectedIndex: 1,
      canScrollPrev: true,
      canScrollNext: true,
      scrollPrev: vi.fn(),
      scrollNext: vi.fn(),
      scrollTo: viewerScrollTo,
    }
  },
}))

describe("ProductGallery", () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    viewerCanDragValues.length = 0
    mainScrollTo.mockReset()
    viewerScrollTo.mockReset()
  })

  it("syncs current image index to viewer on open and back to main on close", async () => {
    render(<ProductGallery name="Test Product" images={["/1.jpg", "/2.jpg", "/3.jpg"]} />)

    fireEvent.click(screen.getAllByRole("button", { name: "Открыть фото" })[0])

    await waitFor(() => {
      expect(viewerScrollTo).toHaveBeenCalledWith(2)
    })

    fireEvent.click(screen.getByRole("button", { name: "Закрыть фото" }))

    expect(mainScrollTo).toHaveBeenCalledWith(1)
  })

  it("toggles zoom by double tap in fullscreen viewer", async () => {
    render(<ProductGallery name="Zoom Product" images={["/1.jpg", "/2.jpg"]} />)

    fireEvent.click(screen.getAllByRole("button", { name: "Открыть фото" })[0])

    const zoomSurface = await screen.findAllByTestId("viewer-zoom-surface")
    const activeSurface = zoomSurface[0]
    vi.spyOn(activeSurface, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 300,
      bottom: 400,
      width: 300,
      height: 400,
      toJSON: () => ({}),
    } as DOMRect)

    fireEvent.touchEnd(activeSurface, { touches: [], changedTouches: [{ clientX: 80, clientY: 100 }] })
    fireEvent.touchEnd(activeSurface, { touches: [], changedTouches: [{ clientX: 80, clientY: 100 }] })

    await screen.findByText(/Масштаб: 200%/)

    fireEvent.touchEnd(activeSurface, { touches: [], changedTouches: [{ clientX: 80, clientY: 100 }] })
    fireEvent.touchEnd(activeSurface, { touches: [], changedTouches: [{ clientX: 80, clientY: 100 }] })

    await screen.findByText(/Масштаб: 100%/)
  })

  it("disables viewer swipe drag when zoom is greater than 1 and re-enables at 1x", async () => {
    render(<ProductGallery name="Drag Toggle" images={["/1.jpg", "/2.jpg"]} />)

    fireEvent.click(screen.getAllByRole("button", { name: "Открыть фото" })[0])

    const zoomSurface = await screen.findAllByTestId("viewer-zoom-surface")
    const activeSurface = zoomSurface[0]
    vi.spyOn(activeSurface, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 300,
      bottom: 400,
      width: 300,
      height: 400,
      toJSON: () => ({}),
    } as DOMRect)

    fireEvent.touchEnd(activeSurface, { touches: [], changedTouches: [{ clientX: 80, clientY: 100 }] })
    fireEvent.touchEnd(activeSurface, { touches: [], changedTouches: [{ clientX: 80, clientY: 100 }] })

    await waitFor(() => {
      expect(viewerCanDragValues).toContain(false)
    })

    fireEvent.touchEnd(activeSurface, { touches: [], changedTouches: [{ clientX: 80, clientY: 100 }] })
    fireEvent.touchEnd(activeSurface, { touches: [], changedTouches: [{ clientX: 80, clientY: 100 }] })

    await waitFor(() => {
      expect(viewerCanDragValues).toContain(true)
    })
  })

  it("resets zoom and pan state after viewer close", async () => {
    render(<ProductGallery name="Reset State" images={["/1.jpg", "/2.jpg"]} />)

    fireEvent.click(screen.getAllByRole("button", { name: "Открыть фото" })[0])

    const zoomSurface = await screen.findAllByTestId("viewer-zoom-surface")
    const activeSurface = zoomSurface[0]
    vi.spyOn(activeSurface, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 300,
      bottom: 400,
      width: 300,
      height: 400,
      toJSON: () => ({}),
    } as DOMRect)

    fireEvent.touchEnd(activeSurface, { touches: [], changedTouches: [{ clientX: 80, clientY: 100 }] })
    fireEvent.touchEnd(activeSurface, { touches: [], changedTouches: [{ clientX: 80, clientY: 100 }] })

    await screen.findByText(/Масштаб: 200%/)

    fireEvent.click(screen.getByRole("button", { name: "Закрыть фото" }))
    fireEvent.click(screen.getAllByRole("button", { name: "Открыть фото" })[0])

    await screen.findByText(/Масштаб: 100%/)
  })
})
