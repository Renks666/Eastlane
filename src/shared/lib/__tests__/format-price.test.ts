import { describe, expect, it } from "vitest"
import {
  convertCnyToRubApprox,
  convertRubToCnyApprox,
  formatDualPrice,
} from "../format-price"

describe("format-price helpers", () => {
  it("converts CNY to RUB with cnyPerRub", () => {
    expect(convertCnyToRubApprox(500, 0.09)).toBeCloseTo(5555.5556, 4)
  })

  it("converts RUB to CNY with cnyPerRub", () => {
    expect(convertRubToCnyApprox(5500, 0.09)).toBeCloseTo(495, 2)
  })

  it("formats dual CNY price", () => {
    const result = formatDualPrice({ amount: 500, currency: "CNY", cnyPerRub: 0.09 })
    expect(result).toContain("500,00 ?")
    expect(result).toContain("~5")
    expect(result).toContain("?")
  })
})


