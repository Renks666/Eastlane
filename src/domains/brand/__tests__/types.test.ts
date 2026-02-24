import { describe, expect, it } from "vitest"
import { BRAND_GROUP_LABELS, BRAND_GROUP_ORDER, compareBrandGroupKeys, isBrandGroupKey } from "../types"

describe("brand group types", () => {
  it("validates group key", () => {
    expect(isBrandGroupKey("sport-streetwear")).toBe(true)
    expect(isBrandGroupKey("unknown-group")).toBe(false)
  })

  it("contains all labels for ordered keys", () => {
    for (const key of BRAND_GROUP_ORDER) {
      expect(BRAND_GROUP_LABELS[key]).toBeTruthy()
    }
  })

  it("sorts in declared group order", () => {
    expect(compareBrandGroupKeys("outdoor", "sport-streetwear")).toBeGreaterThan(0)
    expect(compareBrandGroupKeys("sport-streetwear", "outdoor")).toBeLessThan(0)
  })
})
