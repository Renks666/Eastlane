/* @vitest-environment jsdom */
/* eslint-disable @next/next/no-img-element */

import React from "react"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { FloatingCart } from "@/components/store/FloatingCart"
import type { CartItem } from "@/components/store/cart-types"

type MockCartState = {
  items: CartItem[]
  isHydrated: boolean
}

const useCartMock = vi.fn()
const createOrderMock = vi.fn()

const actions = {
  addItem: vi.fn(),
  removeItem: vi.fn(),
  increment: vi.fn(),
  decrement: vi.fn(),
  clear: vi.fn(),
}

let cartState: MockCartState = {
  items: [],
  isHydrated: true,
}

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => {
    const imageProps = { ...props }
    delete imageProps.fill
    return <img {...imageProps} alt={imageProps.alt ?? ""} />
  },
}))

vi.mock("@/components/store/CartProvider", () => ({
  useCart: () => useCartMock(),
}))

vi.mock("@/app/orders/actions", () => ({
  createOrder: (...args: unknown[]) => createOrderMock(...args),
}))

vi.mock("@/components/store/ExchangeRateTooltip", () => ({
  ExchangeRateTooltip: ({ children }: { children: (params: { describedBy?: string }) => React.ReactNode }) =>
    <>{children({ describedBy: undefined })}</>,
}))

describe("FloatingCart", () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    cartState = { items: [], isHydrated: true }
    useCartMock.mockImplementation(() => ({
      ...actions,
      items: cartState.items,
      isHydrated: cartState.isHydrated,
      total: 0,
    }))
    createOrderMock.mockResolvedValue({ ok: true, orderId: 1 })

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: "",
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it("does not render empty floating trigger when cart is empty", () => {
    render(<FloatingCart cnyPerRub={0.12} />)

    expect(screen.queryByRole("button", { name: "Открыть корзину" })).toBeNull()
    expect(screen.queryByText(/Корзина \(\d+\)/)).toBeNull()
  })

  it("opens empty cart panel via cart:open event", async () => {
    render(<FloatingCart cnyPerRub={0.12} />)

    window.dispatchEvent(new CustomEvent("cart:open"))
    await waitFor(() => {
      expect(screen.getByText("Ваша корзина пуста. Добавьте товары из каталога.")).toBeTruthy()
    })
  })

  it("renders mobile capsule and desktop bar when cart has items", () => {
    cartState = {
      isHydrated: true,
      items: [
        {
          lineId: "1::M::Black",
          id: 1,
          name: "Тестовый товар",
          price: 100,
          priceCurrency: "CNY",
          quantity: 1,
        },
      ],
    }

    render(<FloatingCart cnyPerRub={0.12} />)

    const openButtons = screen.getAllByRole("button", { name: "Открыть корзину" })
    const mobileButton = openButtons.find((button) => button.className.includes("sm:hidden"))
    expect(mobileButton).toBeDefined()
    expect(mobileButton?.textContent).toContain("100")

    const desktopWrapper = document.querySelector("div.sm\\:block")
    expect(desktopWrapper).toBeTruthy()
    expect(screen.getByText("Корзина (1)")).toBeTruthy()
  })

  it("does not show empty panel before cart hydration", () => {
    cartState = { items: [], isHydrated: false }
    render(<FloatingCart cnyPerRub={0.12} />)

    expect(screen.queryByText("Ваша корзина пуста. Добавьте товары из каталога.")).toBeNull()
  })

  it("switches from empty to non-empty closed state without auto-opening", () => {
    const { rerender } = render(<FloatingCart cnyPerRub={0.12} />)

    cartState = {
      isHydrated: true,
      items: [
        {
          lineId: "1::M::Black",
          id: 1,
          name: "Тестовый товар",
          price: 100,
          priceCurrency: "CNY",
          quantity: 1,
        },
      ],
    }

    rerender(<FloatingCart cnyPerRub={0.12} />)

    expect(screen.getByText("Корзина (1)")).toBeTruthy()
    expect(screen.queryByRole("button", { name: "Свернуть корзину" })).toBeNull()
  })

  it("hides mobile capsule when hideMobileCollapsedTrigger is enabled", () => {
    cartState = {
      isHydrated: true,
      items: [
        {
          lineId: "1::M::Black",
          id: 1,
          name: "Тестовый товар",
          price: 100,
          priceCurrency: "CNY",
          quantity: 1,
        },
      ],
    }
    render(<FloatingCart cnyPerRub={0.12} hideMobileCollapsedTrigger />)

    const openButtons = screen.getAllByRole("button", { name: "Открыть корзину" })
    const mobileButton = openButtons.find((button) => button.className.includes("sm:hidden"))
    expect(mobileButton).toBeUndefined()
  })
})
