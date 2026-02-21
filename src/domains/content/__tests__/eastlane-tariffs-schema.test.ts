import { describe, expect, it } from "vitest"
import { defaultEastlaneTariffsSection } from "../default-content"
import {
  eastlaneTariffsSectionSchema,
  parseEastlaneTariffsSectionPayload,
} from "../eastlane-tariffs-schema"

function cloneDefaultPayload() {
  return JSON.parse(JSON.stringify(defaultEastlaneTariffsSection))
}

describe("eastlaneTariffsSectionSchema", () => {
  it("accepts default payload", () => {
    const result = eastlaneTariffsSectionSchema.safeParse(defaultEastlaneTariffsSection)
    expect(result.success).toBe(true)
  })

  it("rejects negative service fees", () => {
    const payload = cloneDefaultPayload()
    payload.tiers[0].serviceFeeCny = -1

    const result = eastlaneTariffsSectionSchema.safeParse(payload)
    expect(result.success).toBe(false)
  })

  it("rejects empty required text", () => {
    const payload = cloneDefaultPayload()
    payload.formulaText = ""

    const result = eastlaneTariffsSectionSchema.safeParse(payload)
    expect(result.success).toBe(false)
  })
})

describe("parseEastlaneTariffsSectionPayload", () => {
  it("returns fallback for invalid payload", () => {
    const fallback = cloneDefaultPayload()
    const payload = cloneDefaultPayload()
    payload.importantItems = []

    const parsed = parseEastlaneTariffsSectionPayload(payload, fallback)
    expect(parsed).toEqual(fallback)
  })

  it("returns parsed payload for valid object", () => {
    const fallback = cloneDefaultPayload()
    const payload = cloneDefaultPayload()
    payload.title = "Тарифы EASTLANE v2"

    const parsed = parseEastlaneTariffsSectionPayload(payload, fallback)
    expect(parsed.title).toBe("Тарифы EASTLANE v2")
  })
})
