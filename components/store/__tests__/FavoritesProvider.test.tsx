/* @vitest-environment jsdom */

import React from "react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { FavoritesProvider, useFavorites } from "@/components/store/FavoritesProvider"

const STORAGE_KEY = "eastlane-favorites-v1"

const SAMPLE_ITEM = {
  id: 101,
  name: "Тестовый товар",
  price: 1200,
  priceCurrency: "CNY" as const,
  image: "https://example.com/image.jpg",
  brandName: "Nike",
  categoryName: "Кроссовки",
}

function Harness() {
  const { items, favoritesCount, isHydrated, hasItem, toggleItem, removeItem, clear } = useFavorites()

  return (
    <div>
      <p data-testid="hydrated">{String(isHydrated)}</p>
      <p data-testid="count">{favoritesCount}</p>
      <p data-testid="has-item">{String(hasItem(SAMPLE_ITEM.id))}</p>
      <p data-testid="items-json">{JSON.stringify(items)}</p>
      <button type="button" onClick={() => toggleItem(SAMPLE_ITEM)}>toggle</button>
      <button type="button" onClick={() => removeItem(SAMPLE_ITEM.id)}>remove</button>
      <button type="button" onClick={clear}>clear</button>
    </div>
  )
}

describe("FavoritesProvider", () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    localStorage.clear()
  })

  it("hydrates valid favorites from localStorage", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([SAMPLE_ITEM]))

    render(
      <FavoritesProvider>
        <Harness />
      </FavoritesProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId("hydrated").textContent).toBe("true")
    })

    expect(screen.getByTestId("count").textContent).toBe("1")
    expect(screen.getByTestId("has-item").textContent).toBe("true")
  })

  it("filters invalid localStorage payload", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ invalid: true }]))

    render(
      <FavoritesProvider>
        <Harness />
      </FavoritesProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId("hydrated").textContent).toBe("true")
    })

    expect(screen.getByTestId("count").textContent).toBe("0")
    expect(screen.getByTestId("has-item").textContent).toBe("false")
  })

  it("toggles, removes, and clears favorites", async () => {
    render(
      <FavoritesProvider>
        <Harness />
      </FavoritesProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId("hydrated").textContent).toBe("true")
    })

    fireEvent.click(screen.getByRole("button", { name: "toggle" }))
    expect(screen.getByTestId("count").textContent).toBe("1")
    expect(screen.getByTestId("has-item").textContent).toBe("true")

    fireEvent.click(screen.getByRole("button", { name: "toggle" }))
    expect(screen.getByTestId("count").textContent).toBe("0")
    expect(screen.getByTestId("has-item").textContent).toBe("false")

    fireEvent.click(screen.getByRole("button", { name: "toggle" }))
    expect(screen.getByTestId("count").textContent).toBe("1")

    fireEvent.click(screen.getByRole("button", { name: "remove" }))
    expect(screen.getByTestId("count").textContent).toBe("0")

    fireEvent.click(screen.getByRole("button", { name: "toggle" }))
    expect(screen.getByTestId("count").textContent).toBe("1")

    fireEvent.click(screen.getByRole("button", { name: "clear" }))
    expect(screen.getByTestId("count").textContent).toBe("0")
  })
})
