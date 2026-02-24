import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"
import { loadSiteSectionsByKeys } from "@/src/domains/content/repositories/site-sections-repository"
import { resolveStorefrontContentSections } from "@/src/domains/content/services/storefront-content-resolver"

export { resolveStorefrontContentSections } from "@/src/domains/content/services/storefront-content-resolver"

export async function getStorefrontContent() {
  const supabase = await createServerSupabaseClient()
  const sections = await loadSiteSectionsByKeys(supabase, [
    "hero",
    "benefits",
    "lookbook",
    "faq",
    "contacts",
    "about",
    "delivery_rates",
    "eastlane_tariffs",
    "exchange_rate",
  ])

  return resolveStorefrontContentSections(sections)
}

export async function getExchangeRateCnyPerRub() {
  const { exchangeRate } = await getStorefrontContent()
  return exchangeRate.cnyPerRub
}
