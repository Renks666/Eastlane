import { describe, expect, it } from "vitest"
import { buildOrderItems, validateCheckoutPayload } from "../checkout-service"

describe("validateCheckoutPayload", () => {
  it("rejects empty cart", () => {
    expect(() =>
      validateCheckoutPayload({
        items: [],
        customerName: "Иван",
        contactChannel: "telegram",
        contactValue: "@eastlane",
      })
    ).toThrow("Корзина пуста")
  })

  it("rejects invalid telegram", () => {
    expect(() =>
      validateCheckoutPayload({
        items: [{ id: 1, quantity: 1 }],
        customerName: "Иван",
        contactChannel: "telegram",
        contactValue: "eastlane",
      })
    ).toThrow("Telegram")
  })

  it("rejects invalid phone", () => {
    expect(() =>
      validateCheckoutPayload({
        items: [{ id: 1, quantity: 1 }],
        customerName: "Иван",
        contactChannel: "phone",
        contactValue: "123",
      })
    ).toThrow("телефона")
  })

  it("rejects empty customer name", () => {
    expect(() =>
      validateCheckoutPayload({
        items: [{ id: 1, quantity: 1 }],
        customerName: "   ",
        contactChannel: "telegram",
        contactValue: "@eastlane",
      })
    ).toThrow("имя")
  })
})

describe("buildOrderItems", () => {
  it("calculates totals for RUB-only cart", () => {
    const payload = {
      items: [{ id: 11, quantity: 2, selectedSize: "M", priceCurrency: "RUB" as const }],
      customerName: "Иван",
      contactChannel: "telegram" as const,
      contactValue: "@eastlane",
    }

    const { normalizedItems, totalAmount, totalCurrency, totalAmountRubApprox } = buildOrderItems(
      payload,
      [{ id: 11, name: "Пальто", price: 3500, price_currency: "RUB" as const }],
      0.09
    )

    expect(normalizedItems[0].line_total).toBe(7000)
    expect(normalizedItems[0].size_snapshot).toBe("M")
    expect(totalAmount).toBe(7000)
    expect(totalCurrency).toBe("RUB")
    expect(totalAmountRubApprox).toBe(7000)
  })

  it("keeps CNY as base when at least one item is CNY", () => {
    const payload = {
      items: [
        { id: 1, quantity: 1, priceCurrency: "CNY" as const },
        { id: 2, quantity: 1, priceCurrency: "RUB" as const },
      ],
      customerName: "Иван",
      contactChannel: "telegram" as const,
      contactValue: "@eastlane",
    }

    const result = buildOrderItems(
      payload,
      [
        { id: 1, name: "Куртка", price: 500, price_currency: "CNY" as const },
        { id: 2, name: "Штаны", price: 900, price_currency: "RUB" as const },
      ],
      0.09
    )

    expect(result.totalCurrency).toBe("CNY")
    expect(result.totalAmount).toBeGreaterThan(500)
    expect(result.totalAmountRubApprox).toBeGreaterThan(0)
  })
})

