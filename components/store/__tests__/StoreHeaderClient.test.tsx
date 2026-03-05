/* @vitest-environment jsdom */

import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { StoreHeaderClient } from "@/components/store/StoreHeaderClient"

const useCartMock = vi.fn()
const useFavoritesMock = vi.fn()

vi.mock("@/components/store/CartProvider", () => ({
  useCart: () => useCartMock(),
}))

vi.mock("@/components/store/FavoritesProvider", () => ({
  useFavorites: () => useFavoritesMock(),
}))

vi.mock("@/components/store/MobileMenu", () => ({
  MobileMenu: ({ className }: { className?: string }) => (
    <button type="button" aria-label="Открыть меню" className={className}>menu</button>
  ),
}))

vi.mock("@/components/store/EastlaneLogo", () => ({
  EastlaneLogo: () => <span data-testid="logo">EASTLANE</span>,
}))

vi.mock("@/components/store/ScrollToFaq", () => ({
  ScrollToFaqLink: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <a className={className}>{children}</a>
  ),
}))

describe("StoreHeaderClient", () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    useCartMock.mockReturnValue({
      items: [
        { lineId: "1::M::Black", id: 1, name: "A", price: 10, priceCurrency: "CNY", quantity: 2 },
      ],
      isHydrated: true,
    })
    useFavoritesMock.mockReturnValue({
      favoritesCount: 3,
      isHydrated: true,
    })

    Object.defineProperty(window, "scrollY", {
      value: 0,
      writable: true,
      configurable: true,
    })

    Object.defineProperty(window, "requestAnimationFrame", {
      value: (callback: FrameRequestCallback) => {
        callback(0)
        return 1
      },
      writable: true,
      configurable: true,
    })

    Object.defineProperty(window, "cancelAnimationFrame", {
      value: () => undefined,
      writable: true,
      configurable: true,
    })
  })

  it("renders mobile controls in required order", () => {
    render(<StoreHeaderClient />)

    const menuButton = screen.getByRole("button", { name: "Открыть меню" })
    const searchButton = screen.getByRole("button", { name: "Открыть поиск" })
    const logo = screen.getByTestId("logo")
    const favoritesLink = screen.getByRole("link", { name: "Открыть избранное" })
    const cartButton = screen.getByRole("button", { name: "Открыть корзину" })

    expect(menuButton.compareDocumentPosition(searchButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(searchButton.compareDocumentPosition(logo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(logo.compareDocumentPosition(favoritesLink) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(favoritesLink.compareDocumentPosition(cartButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("toggles mobile search panel animation classes", () => {
    render(<StoreHeaderClient />)

    const searchButton = screen.getByRole("button", { name: "Открыть поиск" })
    const panel = screen.getByTestId("mobile-search-panel")
    expect(panel.className).toContain("max-h-0")

    fireEvent.click(searchButton)
    expect(panel.className).toContain("max-h-20")
    expect(searchButton.getAttribute("aria-expanded")).toBe("true")
  })

  it("shows favorites and cart badges when counters are positive", () => {
    render(<StoreHeaderClient />)

    expect(screen.getByText("3")).toBeTruthy()
    expect(screen.getByText("2")).toBeTruthy()
  })

  it("renders transparent mobile icon controls without white backgrounds", () => {
    render(<StoreHeaderClient />)

    const menuButton = screen.getByRole("button", { name: "Открыть меню" })
    const searchButton = screen.getByTestId("mobile-search-toggle")
    const favoritesLink = screen.getByTestId("mobile-favorites-link")
    const cartButton = screen.getByTestId("mobile-cart-toggle")

    expect(menuButton.className).toContain("!bg-transparent")
    expect(searchButton.className).toContain("bg-transparent")
    expect(favoritesLink.className).toContain("bg-transparent")
    expect(cartButton.className).toContain("bg-transparent")
  })

  it("switches mobile header to compact height on scroll", async () => {
    render(<StoreHeaderClient />)

    const row = screen.getByTestId("mobile-header-row")
    expect(row.className).toContain("h-20")

    window.scrollY = 20
    window.dispatchEvent(new Event("scroll"))

    await waitFor(() => {
      expect(row.className).toContain("h-[68px]")
    })
  })

  it("restores default height when returning to top", async () => {
    render(<StoreHeaderClient />)
    const row = screen.getByTestId("mobile-header-row")

    window.scrollY = 20
    window.dispatchEvent(new Event("scroll"))

    await waitFor(() => {
      expect(row.className).toContain("h-[68px]")
    })

    window.scrollY = 0
    window.dispatchEvent(new Event("scroll"))

    await waitFor(() => {
      expect(row.className).toContain("h-20")
    })
  })

  it("keeps icon sizes unchanged on scroll", async () => {
    render(<StoreHeaderClient />)

    const searchButton = screen.getByTestId("mobile-search-toggle")
    const favoritesLink = screen.getByTestId("mobile-favorites-link")
    const cartButton = screen.getByTestId("mobile-cart-toggle")

    expect(searchButton.className).toContain("h-10 w-10")
    expect(favoritesLink.className).toContain("h-10 w-10")
    expect(cartButton.className).toContain("h-10 w-10")

    window.scrollY = 20
    window.dispatchEvent(new Event("scroll"))

    await waitFor(() => {
      expect(searchButton.className).toContain("h-10 w-10")
      expect(favoritesLink.className).toContain("h-10 w-10")
      expect(cartButton.className).toContain("h-10 w-10")
    })
  })
})
