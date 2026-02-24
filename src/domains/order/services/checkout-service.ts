import type { CheckoutPayload, OrderItemRecord } from "@/src/domains/order/types"
import { convertCnyToRubApprox, convertRubToCnyApprox, normalizePriceCurrency } from "../../../shared/lib/format-price"

export function validateCheckoutPayload(payload: CheckoutPayload) {
  if (!payload.items || payload.items.length === 0) {
    throw new Error("Корзина пуста.")
  }

  if (!payload.customerName?.trim()) {
    throw new Error("Укажите имя для оформления заказа.")
  }

  if (!payload.contactChannel) {
    throw new Error("Не выбран канал связи.")
  }

  if (!payload.contactValue?.trim()) {
    throw new Error("Укажите контакт для связи.")
  }

  if (payload.contactChannel === "telegram") {
    const value = payload.contactValue.trim()
    if (!value.startsWith("@") && !value.includes("t.me/")) {
      throw new Error("Для Telegram укажите @username или ссылку t.me/...")
    }
  }

  if (payload.contactChannel === "phone") {
    const digits = payload.contactValue.replace(/\D/g, "")
    if (digits.length < 10) {
      throw new Error("Для телефона укажите корректный номер.")
    }
  }
}

export function buildOrderItems(
  payload: CheckoutPayload,
  products: Array<{ id: number; name: string; price: number; price_currency?: "RUB" | "CNY" }>,
  cnyPerRub: number
): {
  normalizedItems: OrderItemRecord[]
  totalAmount: number
  totalCurrency: "RUB" | "CNY"
  totalAmountRubApprox: number
} {
  const productMap = new Map(products.map((product) => [product.id, product]))
  const totalCurrency: "RUB" | "CNY" = payload.items.some((item) => item.priceCurrency === "CNY") ? "CNY" : "RUB"

  const normalizedItems = payload.items.map((item) => {
    const product = productMap.get(item.id)

    if (!product) {
      throw new Error(`Товар #${item.id} не найден.`)
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error(`Некорректное количество для товара ${product.name}.`)
    }

    const price = Number(product.price)
    const priceCurrency = normalizePriceCurrency(item.priceCurrency ?? product.price_currency)
    const lineTotal = price * item.quantity

    const lineTotalRubApprox =
      priceCurrency === "RUB" ? lineTotal : (convertCnyToRubApprox(lineTotal, cnyPerRub) ?? 0)

    return {
      product_id: product.id,
      product_name_snapshot: product.name,
      size_snapshot: item.selectedSize ?? null,
      price_snapshot: price,
      price_currency_snapshot: priceCurrency,
      quantity: item.quantity,
      line_total: lineTotal,
      line_total_rub_approx: lineTotalRubApprox,
    }
  })

  const totalAmount = normalizedItems.reduce((sum, item) => {
    if (totalCurrency === item.price_currency_snapshot) {
      return sum + item.line_total
    }

    if (totalCurrency === "CNY") {
      return sum + (convertRubToCnyApprox(item.line_total, cnyPerRub) ?? 0)
    }

    return sum + (convertCnyToRubApprox(item.line_total, cnyPerRub) ?? 0)
  }, 0)

  const totalAmountRubApprox = normalizedItems.reduce((sum, item) => sum + item.line_total_rub_approx, 0)

  return { normalizedItems, totalAmount, totalCurrency, totalAmountRubApprox }
}



