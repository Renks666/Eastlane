const COLOR_FALLBACK_HEX = "#D7D2C8"

const COLOR_SWATCHES: Record<string, string> = {
  black: "#111111",
  "черный": "#111111",
  "чёрный": "#111111",
  "черная": "#111111",
  "чёрная": "#111111",
  white: "#F7F7F2",
  "белый": "#F7F7F2",
  "белая": "#F7F7F2",
  green: "#2F6B3F",
  "зеленый": "#2F6B3F",
  "зелёный": "#2F6B3F",
  "зеленая": "#2F6B3F",
  "зелёная": "#2F6B3F",
  red: "#B53A2D",
  "красный": "#B53A2D",
  "красная": "#B53A2D",
  blue: "#2856A9",
  "синий": "#2856A9",
  "синяя": "#2856A9",
  navy: "#1B2A4A",
  "темно-синий": "#1B2A4A",
  "тёмно-синий": "#1B2A4A",
  "темно синий": "#1B2A4A",
  "тёмно синий": "#1B2A4A",
  beige: "#CDBA9A",
  "бежевый": "#CDBA9A",
  "бежевая": "#CDBA9A",
  brown: "#7A5230",
  "коричневый": "#7A5230",
  "коричневая": "#7A5230",
  gray: "#8F949A",
  grey: "#8F949A",
  "серый": "#8F949A",
  "серая": "#8F949A",
  yellow: "#E2B93B",
  "желтый": "#E2B93B",
  "жёлтый": "#E2B93B",
  "желтая": "#E2B93B",
  "жёлтая": "#E2B93B",
  orange: "#D77A2E",
  "оранжевый": "#D77A2E",
  "оранжевая": "#D77A2E",
  pink: "#D7839D",
  "розовый": "#D7839D",
  "розовая": "#D7839D",
  purple: "#7A4C9D",
  violet: "#7A4C9D",
  "фиолетовый": "#7A4C9D",
  "фиолетовая": "#7A4C9D",
  silver: "#B7BCC4",
  "серебристый": "#B7BCC4",
  "серебристая": "#B7BCC4",
  gold: "#BC9B46",
  "золотой": "#BC9B46",
  "золотая": "#BC9B46",
  khaki: "#9B8C63",
  "хаки": "#9B8C63",
  mint: "#7EC7B4",
  "мятный": "#7EC7B4",
  "мятная": "#7EC7B4",
  burgundy: "#6E1F35",
  maroon: "#6E1F35",
  "бордовый": "#6E1F35",
  "бордовая": "#6E1F35",
  cream: "#E8DEC8",
  "кремовый": "#E8DEC8",
  "кремовая": "#E8DEC8",
}

export function normalizeColorName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase()
}

export function resolveColorSwatch(value: string) {
  const label = value.trim().replace(/\s+/g, " ")
  const normalized = normalizeColorName(value)
  const hex = COLOR_SWATCHES[normalized]

  if (hex) {
    return {
      hex,
      label,
      known: true,
    }
  }

  return {
    hex: COLOR_FALLBACK_HEX,
    label,
    known: false,
  }
}
