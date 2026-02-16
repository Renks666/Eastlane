import { notFound } from "next/navigation"
import { CategoryForm } from "@/components/CategoryForm"
import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"
import { requireAdminUserOrRedirect } from "@/src/shared/lib/auth/require-admin"

type EditCategoryPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params
  const categoryId = Number(id)

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    notFound()
  }

  await requireAdminUserOrRedirect()
  const supabase = await createServerSupabaseClient()

  const { data: category, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("id", categoryId)
    .single()

  if (error || !category) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <CategoryForm mode="edit" category={category} />
    </div>
  )
}
