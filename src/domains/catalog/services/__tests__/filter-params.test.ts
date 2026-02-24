import { describe, expect, it } from "vitest"
import { parseCatalogFilterParams, serializeCatalogFilterParams } from "../filter-params"

describe("parseCatalogFilterParams", () => {
  it("normalizes scalar and array values", () => {
    const parsed = parseCatalogFilterParams({
      q: "  coat ",
      category: ["outerwear", "shoes"],
      brand: ["nike", "adidas"],
      size: ["M", "L"],
      color: "black",
      season: ["summer", "winter", "unknown"],
      minPrice: "1000",
      maxPrice: "9000",
      sort: "price-desc",
    })

    expect(parsed).toEqual({
      q: "coat",
      category: ["outerwear", "shoes"],
      brands: ["nike", "adidas"],
      sizes: ["M", "L"],
      colors: ["black"],
      seasons: ["summer", "winter"],
      minPrice: 1000,
      maxPrice: 9000,
      sort: "price-desc",
    })
  })

  it("serializes to URLSearchParams", () => {
    const query = serializeCatalogFilterParams({
      q: "coat",
      category: ["outerwear", "shoes"],
      brands: ["nike"],
      sizes: ["M"],
      colors: ["black"],
      seasons: ["summer", "autumn"],
      minPrice: 1000,
      maxPrice: 9000,
      sort: "price-asc",
    })

    expect(query.get("q")).toBe("coat")
    expect(query.getAll("category")).toEqual(["outerwear", "shoes"])
    expect(query.get("brand")).toBe("nike")
    expect(query.get("size")).toBe("M")
    expect(query.get("color")).toBe("black")
    expect(query.getAll("season")).toEqual(["summer", "autumn"])
    expect(query.get("sort")).toBe("price-asc")
  })

  it("drops invalid and empty season values", () => {
    const parsed = parseCatalogFilterParams({
      season: ["", "  ", "SUMMER", "unknown", "winter"],
    })

    expect(parsed.seasons).toEqual(["summer", "winter"])
  })
})
