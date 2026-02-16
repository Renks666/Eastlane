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

export type ContentSectionKey = "hero" | "benefits" | "lookbook" | "faq" | "contacts" | "about"

export type ContentSection<T = unknown> = {
  key: ContentSectionKey
  title: string
  payload: T
  isPublished: boolean
  updatedAt: string | null
}

