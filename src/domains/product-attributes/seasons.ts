export const SEASON_KEYS = ["winter", "spring", "summer", "autumn"] as const

export type SeasonKey = (typeof SEASON_KEYS)[number]

export const SEASON_LABELS_RU: Record<SeasonKey, string> = {
  winter: "Зима",
  spring: "Весна",
  summer: "Лето",
  autumn: "Осень",
}

export function normalizeSeason(value: string) {
  return value.trim().toLowerCase()
}

export function isSeasonKey(value: string): value is SeasonKey {
  return (SEASON_KEYS as readonly string[]).includes(value)
}
