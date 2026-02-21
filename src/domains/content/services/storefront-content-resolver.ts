import {
  defaultAboutSection,
  defaultBenefitsSection,
  defaultContactsSection,
  defaultDeliveryRatesSection,
  defaultEastlaneTariffsSection,
  defaultFaqSection,
  defaultHeroSection,
  defaultLookbookSection,
} from "../default-content"
import { parseDeliveryRatesSectionPayload } from "../delivery-rates-schema"
import { parseEastlaneTariffsSectionPayload } from "../eastlane-tariffs-schema"
import type {
  AboutSectionContent,
  BenefitsSectionContent,
  ContentSection,
  ContentSectionKey,
  ContactsSectionContent,
  DeliveryRatesSectionContent,
  EastlaneTariffsSectionContent,
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
  const eastlaneTariffs: EastlaneTariffsSectionContent = sections.eastlane_tariffs?.isPublished
    ? parseEastlaneTariffsSectionPayload(sections.eastlane_tariffs.payload, defaultEastlaneTariffsSection)
    : defaultEastlaneTariffsSection

  return { hero, benefits, lookbook, faq, contacts, about, deliveryRates, eastlaneTariffs }
}
