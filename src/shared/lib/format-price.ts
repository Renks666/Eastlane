export type PriceCurrency = "RUB" | "CNY"

const RUB_FALLBACK = "--"

function toFiniteNumber(value: number) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

export function formatRub(value: number, fractionDigits = 2) {
  const numeric = toFiniteNumber(value)
  if (numeric === null) return RUB_FALLBACK

  return `${new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(numeric)} ₽`
}

export function formatCny(value: number, fractionDigits = 2) {
  const numeric = toFiniteNumber(value)
  if (numeric === null) return RUB_FALLBACK

  return `${new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(numeric)} ¥`
}

export function convertCnyToRubApprox(cny: number, cnyPerRub: number) {
  const cnyValue = toFiniteNumber(cny)
  const rate = toFiniteNumber(cnyPerRub)
  if (cnyValue === null || rate === null || rate <= 0) return null
  return cnyValue / rate
}

export function convertRubToCnyApprox(rub: number, cnyPerRub: number) {
  const rubValue = toFiniteNumber(rub)
  const rate = toFiniteNumber(cnyPerRub)
  if (rubValue === null || rate === null || rate <= 0) return null
  return rubValue * rate
}

export function formatDualPrice(input: {
  amount: number
  currency: PriceCurrency
  cnyPerRub: number
  includeApproxPrefix?: boolean
}) {
  const includeApproxPrefix = input.includeApproxPrefix ?? true
  const prefix = includeApproxPrefix ? "~" : ""

  if (input.currency === "CNY") {
    const rubApprox = convertCnyToRubApprox(input.amount, input.cnyPerRub)
    if (rubApprox === null) {
      return formatCny(input.amount)
    }
    return `${formatCny(input.amount)} (${prefix}${formatRub(rubApprox)})`
  }

  const cnyApprox = convertRubToCnyApprox(input.amount, input.cnyPerRub)
  if (cnyApprox === null) {
    return formatRub(input.amount)
  }
  return `${formatRub(input.amount)} (${prefix}${formatCny(cnyApprox)})`
}

export function normalizePriceCurrency(value: unknown, fallback: PriceCurrency = "RUB"): PriceCurrency {
  return value === "CNY" || value === "RUB" ? value : fallback
}

