export type ProductSizeOption = {
  id: number
  value: string
  value_normalized: string
  sort_order: number
  is_active: boolean
}

export type ProductColorOption = {
  id: number
  value: string
  value_normalized: string
  sort_order: number
  is_active: boolean
}

export function normalizeAttributeValue(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase()
}

const SIZE_LIKE_PATTERN = /^(?:\d+(?:[.,]\d+)?|xxxs|xxs|xs|s|m|l|xl|xxl|xxxl|xxxxl|xxxxxl|2xs|2xl|3xl|4xl|5xl|one[\s-]?size|onesize)$/i

export function looksLikeSizeValue(value: string) {
  return SIZE_LIKE_PATTERN.test(value.trim())
}

export function sanitizeAttributeValues(values: string[]) {
  const seen = new Set<string>()
  const result: string[] = []

  for (const raw of values) {
    if (typeof raw !== "string") continue
    const trimmed = raw.trim().replace(/\s+/g, " ")
    if (!trimmed) continue
    const normalized = normalizeAttributeValue(trimmed)
    if (seen.has(normalized)) continue
    seen.add(normalized)
    result.push(trimmed)
  }

  return result
}
