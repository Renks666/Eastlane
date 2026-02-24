import { describe, expect, it } from "vitest"
import { normalizeAttributeValue, sanitizeAttributeValues } from "../types"

describe("product attributes", () => {
  it("normalizes value", () => {
    expect(normalizeAttributeValue("  Black   ")).toBe("black")
  })

  it("sanitizes and deduplicates values case-insensitively", () => {
    const values = sanitizeAttributeValues([" Black ", "black", "  ", "WHITE"])
    expect(values).toEqual(["Black", "WHITE"])
  })
})
