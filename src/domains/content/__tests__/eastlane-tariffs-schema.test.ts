import { describe, expect, it } from "vitest"
import { defaultEastlaneTariffsSection } from "../default-content"
import {
  eastlaneTariffsEditableSchema,
  extractEastlaneTariffsEditablePayload,
  parseEastlaneTariffsSectionPayload,
} from "../eastlane-tariffs-schema"

function cloneDefaultPayload() {
  return JSON.parse(JSON.stringify(defaultEastlaneTariffsSection))
}

describe("eastlaneTariffsEditableSchema", () => {
  it("accepts editable payload extracted from default content", () => {
    const result = eastlaneTariffsEditableSchema.safeParse(
      extractEastlaneTariffsEditablePayload(defaultEastlaneTariffsSection)
    )
    expect(result.success).toBe(true)
  })

  it("rejects negative service fees", () => {
    const payload = extractEastlaneTariffsEditablePayload(defaultEastlaneTariffsSection)
    payload.tiers[0].serviceFeeCny = -1

    const result = eastlaneTariffsEditableSchema.safeParse(payload)
    expect(result.success).toBe(false)
  })
})

describe("parseEastlaneTariffsSectionPayload", () => {
  it("returns fallback for invalid payload", () => {
    const fallback = cloneDefaultPayload()
    const payload = {
      tiers: [
        {
          id: "retail",
          minItems: 1,
          serviceFeeCny: -1,
          serviceFeeRubApprox: 100,
        },
        {
          id: "wholesale",
          minItems: 5,
          serviceFeeCny: 50,
          serviceFeeRubApprox: 500,
        },
      ],
    }

    const parsed = parseEastlaneTariffsSectionPayload(payload, fallback)
    expect(parsed).toEqual(fallback)
  })

  it("merges only editable numeric fields and ignores text from payload", () => {
    const fallback = cloneDefaultPayload()
    const payload = {
      title: "Будет проигнорирован",
      formulaText: "Будет проигнорирован",
      tiers: [
        {
          id: "retail",
          minItems: 3,
          serviceFeeCny: 88,
          serviceFeeRubApprox: 999,
        },
        {
          id: "wholesale",
          minItems: 9,
          serviceFeeCny: 44,
          serviceFeeRubApprox: 666,
        },
      ],
    }

    const parsed = parseEastlaneTariffsSectionPayload(payload, fallback)
    expect(parsed.title).toBe(fallback.title)
    expect(parsed.formulaText).toBe(fallback.formulaText)
    expect(parsed.tiers[0].minItems).toBe(3)
    expect(parsed.tiers[0].serviceFeeCny).toBe(88)
    expect(parsed.tiers[0].serviceFeeRubApprox).toBe(999)
    expect(parsed.tiers[1].minItems).toBe(9)
    expect(parsed.tiers[1].serviceFeeCny).toBe(44)
    expect(parsed.tiers[1].serviceFeeRubApprox).toBe(666)
  })
})
