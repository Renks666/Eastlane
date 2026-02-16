import { CategoryForm } from "@/components/CategoryForm"
import { requireAdminUserOrRedirect } from "@/src/shared/lib/auth/require-admin"

export default async function NewCategoryPage() {
  await requireAdminUserOrRedirect()

  return (
    <div className="mx-auto w-full max-w-3xl">
      <CategoryForm mode="create" />
    </div>
  )
}
