import { describe, expect, it } from "vitest"
import { defaultExchangeRateSection } from "../default-content"
import { exchangeRateSectionSchema, parseExchangeRateSectionPayload } from "../exchange-rate-schema"

describe("exchangeRateSectionSchema", () => {
  it("accepts valid payload", () => {
    const result = exchangeRateSectionSchema.safeParse({ cnyPerRub: 0.09 })
    expect(result.success).toBe(true)
  })

  it("rejects zero and negative values", () => {
    expect(exchangeRateSectionSchema.safeParse({ cnyPerRub: 0 }).success).toBe(false)
    expect(exchangeRateSectionSchema.safeParse({ cnyPerRub: -0.1 }).success).toBe(false)
  })
})

describe("parseExchangeRateSectionPayload", () => {
  it("returns fallback for invalid payload", () => {
    const parsed = parseExchangeRateSectionPayload({ cnyPerRub: -1 }, defaultExchangeRateSection)
    expect(parsed).toEqual(defaultExchangeRateSection)
  })

  it("returns parsed payload when valid", () => {
    const parsed = parseExchangeRateSectionPayload({ cnyPerRub: 0.12 }, defaultExchangeRateSection)
    expect(parsed.cnyPerRub).toBe(0.12)
  })
})
