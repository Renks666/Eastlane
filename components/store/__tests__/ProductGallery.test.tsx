/* eslint-disable @next/next/no-img-element */
/* @vitest-environment jsdom */

import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ProductGallery } from "@/components/store/ProductGallery"

type SwipeParams = {
  slideCount: number
  loop?: boolean
  canDrag?: boolean
}

const hookParams: SwipeParams[] = []
const viewerCanDragValues: boolean[] = []
const mainScrollTo = vi.fn()
const viewerScrollTo = vi.fn()

let hookCallIndex = 0

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => {
    const imgProps = { ...props }
    delete imgProps.fill
    return <img {...imgProps} alt={imgProps.alt ?? ""} />
  },
}))

vi.mock("@/components/store/useSwipeCarousel", () => ({
  useSwipeCarousel: (params: SwipeParams) => {
    hookCallIndex += 1
    hookParams.push(params)

    const isMainCarousel = hookCallIndex % 2 === 1

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
  beforeEach(() => {
    hookParams.length = 0
    viewerCanDragValues.length = 0
    hookCallIndex = 0
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

  it("disables viewer swipe drag when zoom becomes greater than 1", async () => {
    render(<ProductGallery name="Zoom Product" images={["/1.jpg", "/2.jpg"]} />)

    fireEvent.click(screen.getAllByRole("button", { name: "Открыть фото" })[0])

    const scaleText = await screen.findByText(/Масштаб:/)
    const viewerFrame = scaleText.previousElementSibling
    const zoomSurface = viewerFrame?.querySelector('div[style*="cursor"]')
    expect(zoomSurface).not.toBeNull()

    fireEvent.wheel(zoomSurface as Element, {
      deltaY: -120,
      clientX: 20,
      clientY: 20,
    })

    await waitFor(() => {
      expect(viewerCanDragValues).toContain(false)
    })
  })
})
