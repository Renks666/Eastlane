import { redirect } from "next/navigation"
import { CategoryForm } from "@/components/CategoryForm"
import { createClient } from "@/lib/supabase/server"

export default async function NewCategoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <CategoryForm mode="create" />
    </div>
  )
}
