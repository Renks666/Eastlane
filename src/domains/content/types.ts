export type HeroSectionContent = {
  badge: string
  title: string
  accent: string
  description: string
  primaryCtaLabel: string
  primaryCtaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
}

export type BenefitsSectionContent = {
  title: string
  items: Array<{ title: string; description: string }>
}

export type LookbookSectionContent = {
  title: string
  subtitle: string
}

export type FaqSectionContent = {
  title: string
  items: Array<{ question: string; answer: string }>
}

export type ContactsSectionContent = {
  title: string
  subtitle: string
  phone: string
  email: string
  hours: string
  telegramUrl: string
  instagramUrl: string
  whatsappUrl: string
}

export type AboutSectionContent = {
  eyebrow: string
  title: string
  paragraphs: string[]
}

export type DeliveryRateValue = {
  kg1: number
  kg2: number
  kg3: number
  kg5: number
  kg10: number
  kg20Plus: number
}

export type DeliveryRateRow = {
  country: string
  flag: string
  rates: DeliveryRateValue
}

export type DeliveryRateNoteIcon = "clock" | "dollar-sign" | "truck" | "package" | "info"

export type DeliveryRateNote = {
  icon: DeliveryRateNoteIcon
  text: string
}

export type DeliveryRateGroup = {
  title: string
  destination: string
  rows: DeliveryRateRow[]
  notes: DeliveryRateNote[]
  transportNote: string
}

export type DeliveryRatesSectionContent = {
  title: string
  backgroundWatermark: string
  groups: [DeliveryRateGroup, DeliveryRateGroup]
}

export type EastlaneTariffsExample = {
  lines: string[]
  resultLine: string
}

export type EastlaneTariffsTier = {
  id: "retail" | "wholesale"
  title: string
  minItems: number
  serviceFeeCny: number
  serviceFeeRubApprox: number
  example: EastlaneTariffsExample
  warning: string
}

export type EastlaneTariffsSectionContent = {
  title: string
  subtitle: string
  tiers: [EastlaneTariffsTier, EastlaneTariffsTier]
  formulaTitle: string
  formulaText: string
  importantTitle: string
  importantItems: string[]
  returnPolicy: string
}

export type ContentSectionKey =
  | "hero"
  | "benefits"
  | "lookbook"
  | "faq"
  | "contacts"
  | "about"
  | "delivery_rates"
  | "eastlane_tariffs"

export type ContentSection<T = unknown> = {
  key: ContentSectionKey
  title: string
  payload: T
  isPublished: boolean
  updatedAt: string | null
}

