import { describe, expect, it } from "vitest"
import { normalizeColorName, resolveColorSwatch } from "../color-swatches"

describe("color swatches", () => {
  it("resolves known colors in ru and en", () => {
    expect(resolveColorSwatch("green")).toMatchObject({ hex: "#2F6B3F", known: true })
    expect(resolveColorSwatch("\u0447\u0435\u0440\u043d\u044b\u0439")).toMatchObject({ hex: "#111111", known: true })
  })

  it("normalizes color names", () => {
    expect(normalizeColorName("  \u0422\u0401\u041c\u041d\u041e-\u0421\u0418\u041d\u0418\u0419  ")).toBe("\u0442\u0451\u043c\u043d\u043e-\u0441\u0438\u043d\u0438\u0439")
  })

  it("returns fallback for unknown color", () => {
    expect(resolveColorSwatch("\u043a\u043e\u0441\u043c\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u043f\u0435\u0441\u043e\u043a")).toMatchObject({
      hex: "#D7D2C8",
      known: false,
      label: "\u043a\u043e\u0441\u043c\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u043f\u0435\u0441\u043e\u043a",
    })
  })
})
