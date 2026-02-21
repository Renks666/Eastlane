import { describe, expect, it } from "vitest"
import { defaultDeliveryRatesSection } from "../default-content"
import { deliveryRatesSectionSchema, parseDeliveryRatesSectionPayload } from "../delivery-rates-schema"

function cloneDefaultPayload() {
  return JSON.parse(JSON.stringify(defaultDeliveryRatesSection))
}

describe("deliveryRatesSectionSchema", () => {
  it("accepts default payload", () => {
    const result = deliveryRatesSectionSchema.safeParse(defaultDeliveryRatesSection)
    expect(result.success).toBe(true)
  })

  it("rejects negative rates", () => {
    const payload = cloneDefaultPayload()
    payload.groups[0].rows[0].rates.kg1 = -1

    const result = deliveryRatesSectionSchema.safeParse(payload)
    expect(result.success).toBe(false)
  })

  it("requires all fixed weight columns", () => {
    const payload = cloneDefaultPayload()
    delete payload.groups[0].rows[0].rates.kg10

    const result = deliveryRatesSectionSchema.safeParse(payload)
    expect(result.success).toBe(false)
  })
})

describe("parseDeliveryRatesSectionPayload", () => {
  it("returns fallback for invalid payload", () => {
    const fallback = cloneDefaultPayload()
    const payload = cloneDefaultPayload()
    payload.groups[0].notes = []

    const parsed = parseDeliveryRatesSectionPayload(payload, fallback)
    expect(parsed).toEqual(fallback)
  })

  it("returns parsed payload for valid object", () => {
    const fallback = cloneDefaultPayload()
    const payload = cloneDefaultPayload()
    payload.title = "Новые тарифы"

    const parsed = parseDeliveryRatesSectionPayload(payload, fallback)
    expect(parsed.title).toBe("Новые тарифы")
  })

  it("normalizes flag codes to uppercase", () => {
    const fallback = cloneDefaultPayload()
    const payload = cloneDefaultPayload()
    payload.groups[0].rows[0].flag = "ru"

    const parsed = parseDeliveryRatesSectionPayload(payload, fallback)
    expect(parsed.groups[0].rows[0].flag).toBe("RU")
  })
})
