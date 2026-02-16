import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"
import {
  defaultAboutSection,
  defaultBenefitsSection,
  defaultContactsSection,
  defaultFaqSection,
  defaultHeroSection,
  defaultLookbookSection,
} from "@/src/domains/content/default-content"
import { loadSiteSectionsByKeys } from "@/src/domains/content/repositories/site-sections-repository"
import type {
  AboutSectionContent,
  BenefitsSectionContent,
  ContactsSectionContent,
  FaqSectionContent,
  HeroSectionContent,
  LookbookSectionContent,
} from "@/src/domains/content/types"

function selectPayload<T>(value: unknown, fallback: T): T {
  if (!value || typeof value !== "object") {
    return fallback
  }
  return { ...fallback, ...(value as Partial<T>) }
}

export async function getStorefrontContent() {
  const supabase = await createServerSupabaseClient()
  const sections = await loadSiteSectionsByKeys(supabase, ["hero", "benefits", "lookbook", "faq", "contacts", "about"])

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

  return { hero, benefits, lookbook, faq, contacts, about }
}

