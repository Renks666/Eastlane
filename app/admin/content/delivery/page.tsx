import { DeliveryRatesForm } from "@/components/DeliveryRatesForm"
import { loadSiteSectionsByKeys } from "@/src/domains/content/repositories/site-sections-repository"
import { resolveStorefrontContentSections } from "@/src/domains/content/services/storefront-content-service"
import { requireAdminUserOrRedirect } from "@/src/shared/lib/auth/require-admin"
import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"

export default async function AdminDeliveryRatesPage() {
  await requireAdminUserOrRedirect()
  const supabase = await createServerSupabaseClient()

  const sections = await loadSiteSectionsByKeys(supabase, ["delivery_rates"])
  const { deliveryRates } = resolveStorefrontContentSections(sections)
  const section = sections.delivery_rates

  return (
    <div className="mx-auto w-full max-w-6xl">
      <DeliveryRatesForm
        initialTitle={section?.title ?? "Тарифы и доставка"}
        initialPayload={deliveryRates}
        initialIsPublished={section?.isPublished ?? true}
      />
    </div>
  )
}
