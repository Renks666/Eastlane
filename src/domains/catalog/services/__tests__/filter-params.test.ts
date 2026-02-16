import { describe, expect, it } from "vitest"
import { parseCatalogFilterParams, serializeCatalogFilterParams } from "../filter-params"

describe("parseCatalogFilterParams", () => {
  it("normalizes scalar and array values", () => {
    const parsed = parseCatalogFilterParams({
      q: "  coat ",
      category: "outerwear",
      size: ["M", "L"],
      color: "black",
      minPrice: "1000",
      maxPrice: "9000",
      sort: "price-desc",
    })

    expect(parsed).toEqual({
      q: "coat",
      category: "outerwear",
      sizes: ["M", "L"],
      colors: ["black"],
      minPrice: 1000,
      maxPrice: 9000,
      sort: "price-desc",
    })
  })

  it("serializes to URLSearchParams", () => {
    const query = serializeCatalogFilterParams({
      q: "coat",
      category: "outerwear",
      sizes: ["M"],
      colors: ["black"],
      minPrice: 1000,
      maxPrice: 9000,
      sort: "price-asc",
    })

    expect(query.get("q")).toBe("coat")
    expect(query.get("category")).toBe("outerwear")
    expect(query.get("size")).toBe("M")
    expect(query.get("color")).toBe("black")
    expect(query.get("sort")).toBe("price-asc")
  })
})
