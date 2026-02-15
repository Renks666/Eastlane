import { redirect } from "next/navigation"
import { ProductForm } from "@/components/ProductForm"
import { createClient } from "@/lib/supabase/server"

type Category = {
  id: number
  name: string
}

export default async function NewProductPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true })

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-600">Failed to load categories: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <ProductForm mode="create" categories={(categories ?? []) as Category[]} />
    </div>
  )
}
