import { describe, expect, it } from "vitest"
import { isSeasonKey, normalizeSeason, SEASON_KEYS, SEASON_LABELS_RU } from "../seasons"

describe("season helpers", () => {
  it("normalizes season keys", () => {
    expect(normalizeSeason("  SUMMER ")).toBe("summer")
  })

  it("validates season key values", () => {
    expect(isSeasonKey("winter")).toBe(true)
    expect(isSeasonKey("monsoon")).toBe(false)
  })

  it("has labels for every key", () => {
    for (const key of SEASON_KEYS) {
      expect(SEASON_LABELS_RU[key]).toBeTruthy()
    }
  })
})
