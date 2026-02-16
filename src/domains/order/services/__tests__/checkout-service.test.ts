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
  it("calculates line totals and order total", () => {
    const payload = {
      items: [{ id: 11, quantity: 2, selectedSize: "M" }],
      customerName: "Иван",
      contactChannel: "telegram" as const,
      contactValue: "@eastlane",
    }

    const { normalizedItems, totalAmount } = buildOrderItems(payload, [
      { id: 11, name: "Пальто", price: 3500 },
    ])

    expect(normalizedItems[0].line_total).toBe(7000)
    expect(normalizedItems[0].size_snapshot).toBe("M")
    expect(totalAmount).toBe(7000)
  })
})
