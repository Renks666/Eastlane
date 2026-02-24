export const BRAND_GROUP_KEYS = [
  "sport-streetwear",
  "mass-market-casual",
  "premium-designer",
  "outdoor",
] as const

export type BrandGroupKey = (typeof BRAND_GROUP_KEYS)[number]

export const BRAND_GROUP_LABELS: Record<BrandGroupKey, string> = {
  "sport-streetwear": "Спорт и streetwear",
  "mass-market-casual": "Mass market / Casual",
  "premium-designer": "Premium / Designer",
  outdoor: "Outdoor",
}

export const BRAND_GROUP_ORDER: BrandGroupKey[] = [
  "sport-streetwear",
  "mass-market-casual",
  "premium-designer",
  "outdoor",
]

export function isBrandGroupKey(value: string): value is BrandGroupKey {
  return (BRAND_GROUP_KEYS as readonly string[]).includes(value)
}

export function compareBrandGroupKeys(a: BrandGroupKey, b: BrandGroupKey) {
  return BRAND_GROUP_ORDER.indexOf(a) - BRAND_GROUP_ORDER.indexOf(b)
}
