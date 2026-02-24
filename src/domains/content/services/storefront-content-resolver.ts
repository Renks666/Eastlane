import {
  defaultAboutSection,
  defaultBenefitsSection,
  defaultContactsSection,
  defaultDeliveryRatesSection,
  defaultEastlaneTariffsSection,
  defaultExchangeRateSection,
  defaultFaqSection,
  defaultHeroSection,
  defaultLookbookSection,
} from "../default-content"
import { parseDeliveryRatesSectionPayload } from "../delivery-rates-schema"
import { parseExchangeRateSectionPayload } from "../exchange-rate-schema"
import { parseEastlaneTariffsSectionPayload } from "../eastlane-tariffs-schema"
import type {
  AboutSectionContent,
  BenefitsSectionContent,
  ContentSection,
  ContentSectionKey,
  ContactsSectionContent,
  DeliveryRatesSectionContent,
  EastlaneTariffsSectionContent,
  ExchangeRateSectionContent,
  FaqSectionContent,
  HeroSectionContent,
  LookbookSectionContent,
} from "../types"

function selectPayload<T>(value: unknown, fallback: T): T {
  if (!value || typeof value !== "object") {
    return fallback
  }
  return { ...fallback, ...(value as Partial<T>) }
}

type SiteContentSections = Partial<Record<ContentSectionKey, ContentSection>>

const LEGACY_FORMULA_TITLE = "Итоговая формула расчета"
const LEGACY_FORMULA_TEXT = "Итоговая стоимость = цена товара × количество + сервис × количество + доставка"
const UPDATED_FORMULA_TITLE = "Формула / Как формируется цена"
const UPDATED_FORMULA_TEXT = "Итоговая сумма = Стоимость товара + Сервис + Доставка по Китаю + Международная доставка"

function normalizeEastlaneTariffs(content: EastlaneTariffsSectionContent): EastlaneTariffsSectionContent {
  const formulaTitle =
    content.formulaTitle.trim() === LEGACY_FORMULA_TITLE ? UPDATED_FORMULA_TITLE : content.formulaTitle
  const formulaText =
    content.formulaText.trim() === LEGACY_FORMULA_TEXT ? UPDATED_FORMULA_TEXT : content.formulaText

  return { ...content, formulaTitle, formulaText }
}

export function resolveStorefrontContentSections(sections: SiteContentSections) {
  const hero = sections.hero?.isPublished
    ? selectPayload<HeroSectionContent>(sections.hero.payload, defaultHeroSection)
    : defaultHeroSection
  const benefits = sections.benefits?.isPublished
    ? selectPayload<BenefitsSectionContent>(sections.benefits.payload, defaultBenefitsSection)
    : defaultBenefitsSection
  const lookbook = sections.lookbook?.isPublished
    ? selectPayload<LookbookSectionContent>(sections.lookbook.payload, defaultLookbookSection)
    : defaultLookbookSection
  const faq = sections.faq?.isPublished
    ? selectPayload<FaqSectionContent>(sections.faq.payload, defaultFaqSection)
    : defaultFaqSection
  const contacts = sections.contacts?.isPublished
    ? selectPayload<ContactsSectionContent>(sections.contacts.payload, defaultContactsSection)
    : defaultContactsSection
  const about = sections.about?.isPublished
    ? selectPayload<AboutSectionContent>(sections.about.payload, defaultAboutSection)
    : defaultAboutSection
  const deliveryRates: DeliveryRatesSectionContent = sections.delivery_rates?.isPublished
    ? parseDeliveryRatesSectionPayload(sections.delivery_rates.payload, defaultDeliveryRatesSection)
    : defaultDeliveryRatesSection
  const eastlaneTariffsRaw: EastlaneTariffsSectionContent = sections.eastlane_tariffs?.isPublished
    ? parseEastlaneTariffsSectionPayload(sections.eastlane_tariffs.payload, defaultEastlaneTariffsSection)
    : defaultEastlaneTariffsSection
  const eastlaneTariffs = normalizeEastlaneTariffs(eastlaneTariffsRaw)
  const exchangeRate: ExchangeRateSectionContent = sections.exchange_rate?.isPublished
    ? parseExchangeRateSectionPayload(sections.exchange_rate.payload, defaultExchangeRateSection)
    : defaultExchangeRateSection

  return { hero, benefits, lookbook, faq, contacts, about, deliveryRates, eastlaneTariffs, exchangeRate }
}
