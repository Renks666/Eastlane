import { BrandForm } from "@/components/BrandForm"
import { requireAdminUserOrRedirect } from "@/src/shared/lib/auth/require-admin"

export default async function NewBrandPage() {
  await requireAdminUserOrRedirect()

  return (
    <div className="mx-auto w-full max-w-3xl">
      <BrandForm mode="create" />
    </div>
  )
}
