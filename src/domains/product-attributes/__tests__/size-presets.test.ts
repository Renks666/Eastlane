import { describe, expect, it } from "vitest"
import { buildSizeOptionsForCategory, resolveCategorySizeGroup } from "../size-presets"

describe("size presets", () => {
  it("resolves category groups by slug", () => {
    expect(resolveCategorySizeGroup("clothing")).toBe("clothing")
    expect(resolveCategorySizeGroup("shoes")).toBe("shoes")
    expect(resolveCategorySizeGroup("accessories")).toBe("accessories")
    expect(resolveCategorySizeGroup("unknown")).toBe("other")
  })

  it("builds clothing options with preset priority and active text sizes", () => {
    const result = buildSizeOptionsForCategory({
      categorySlug: "clothing",
      activeSizes: ["M", "onesize", "40", "XXS"],
    })

    expect(result.slice(0, 7)).toEqual(["XXS", "XS", "S", "M", "L", "XL", "XXL"])
    expect(result).toContain("onesize")
    expect(result).not.toContain("40")
  })

  it("builds shoe options with numeric sorting and active half sizes", () => {
    const result = buildSizeOptionsForCategory({
      categorySlug: "shoes",
      activeSizes: ["43", "41.5", "M", "40"],
    })

    expect(result).toContain("36")
    expect(result).toContain("46")
    expect(result.indexOf("41")).toBeLessThan(result.indexOf("41.5"))
    expect(result).not.toContain("M")
  })

  it("returns all active sizes for accessories", () => {
    const result = buildSizeOptionsForCategory({
      categorySlug: "accessories",
      activeSizes: ["M", "40", "onesize"],
    })

    expect(result).toEqual(["M", "40", "onesize"])
  })
})

