import { notFound, redirect } from "next/navigation"
import { CategoryForm } from "@/components/CategoryForm"
import { createClient } from "@/lib/supabase/server"

type EditCategoryPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params
  const categoryId = Number(id)

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  const { data: category, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("id", categoryId)
    .single()

  if (error || !category) {
    notFound()
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <CategoryForm mode="edit" category={category} />
    </div>
  )
}
