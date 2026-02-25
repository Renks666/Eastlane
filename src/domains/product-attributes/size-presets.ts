import { normalizeAttributeValue, sanitizeAttributeValues } from "./types"

const CLOTHING_PRESET = ["XXS", "XS", "S", "M", "L", "XL", "XXL"] as const
const SHOE_PRESET = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"] as const

const CLOTHING_ORDER = new Map<string, number>(CLOTHING_PRESET.map((value, index) => [normalizeAttributeValue(value), index]))

export type CategorySizeGroup = "clothing" | "shoes" | "accessories" | "other"

type BuildSizeOptionsInput = {
  categorySlug?: string | null
  activeSizes: string[]
  selectedSizes?: string[]
  includeSelected?: boolean
}

function parseNumericSize(value: string): number | null {
  const normalized = value.trim().replace(",", ".")
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function isNumericSize(value: string) {
  return parseNumericSize(value) !== null
}

function sortClothingSizes(values: string[]) {
  return [...values].sort((left, right) => {
    const leftOrder = CLOTHING_ORDER.get(normalizeAttributeValue(left))
    const rightOrder = CLOTHING_ORDER.get(normalizeAttributeValue(right))
    const leftIsPreset = leftOrder !== undefined
    const rightIsPreset = rightOrder !== undefined

    if (leftIsPreset && rightIsPreset) return leftOrder! - rightOrder!
    if (leftIsPreset) return -1
    if (rightIsPreset) return 1
    return left.localeCompare(right, "ru", { sensitivity: "base", numeric: true })
  })
}

function sortShoeSizes(values: string[]) {
  return [...values].sort((left, right) => {
    const leftNum = parseNumericSize(left)
    const rightNum = parseNumericSize(right)
    if (leftNum !== null && rightNum !== null) return leftNum - rightNum
    if (leftNum !== null) return -1
    if (rightNum !== null) return 1
    return left.localeCompare(right, "ru", { sensitivity: "base", numeric: true })
  })
}

export function resolveCategorySizeGroup(slug: string): CategorySizeGroup {
  const normalized = slug.trim().toLowerCase()
  if (normalized === "clothing") return "clothing"
  if (normalized === "shoes") return "shoes"
  if (normalized === "accessories") return "accessories"
  return "other"
}

export function buildSizeOptionsForCategory({
  categorySlug,
  activeSizes,
  selectedSizes = [],
  includeSelected = true,
}: BuildSizeOptionsInput) {
  const group = resolveCategorySizeGroup(categorySlug ?? "")
  const normalizedActiveSizes = sanitizeAttributeValues(activeSizes)
  const normalizedSelectedSizes = includeSelected ? sanitizeAttributeValues(selectedSizes) : []

  if (group === "clothing") {
    const activeClothing = normalizedActiveSizes.filter((value) => !isNumericSize(value))
    return sortClothingSizes(sanitizeAttributeValues([...CLOTHING_PRESET, ...activeClothing, ...normalizedSelectedSizes]))
  }

  if (group === "shoes") {
    const activeShoes = normalizedActiveSizes.filter((value) => isNumericSize(value))
    return sortShoeSizes(sanitizeAttributeValues([...SHOE_PRESET, ...activeShoes, ...normalizedSelectedSizes]))
  }

  return sanitizeAttributeValues([...normalizedActiveSizes, ...normalizedSelectedSizes])
}
