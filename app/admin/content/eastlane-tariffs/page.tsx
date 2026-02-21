import { EastlaneTariffsForm } from "@/components/EastlaneTariffsForm"
import { loadSiteSectionsByKeys } from "@/src/domains/content/repositories/site-sections-repository"
import { resolveStorefrontContentSections } from "@/src/domains/content/services/storefront-content-service"
import { requireAdminUserOrRedirect } from "@/src/shared/lib/auth/require-admin"
import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"

export default async function AdminEastlaneTariffsPage() {
  await requireAdminUserOrRedirect()
  const supabase = await createServerSupabaseClient()

  const sections = await loadSiteSectionsByKeys(supabase, ["eastlane_tariffs"])
  const { eastlaneTariffs } = resolveStorefrontContentSections(sections)
  const section = sections.eastlane_tariffs

  return (
    <div className="mx-auto w-full max-w-6xl">
      <EastlaneTariffsForm
        initialTitle={section?.title ?? "Тарифы EASTLANE"}
        initialPayload={eastlaneTariffs}
        initialIsPublished={section?.isPublished ?? true}
      />
    </div>
  )
}
