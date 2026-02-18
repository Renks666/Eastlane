import { ProductForm } from "@/components/ProductForm"
import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"
import { requireAdminUserOrRedirect } from "@/src/shared/lib/auth/require-admin"

type Category = {
  id: number
  name: string
}

export default async function NewProductPage() {
  await requireAdminUserOrRedirect()
  const supabase = await createServerSupabaseClient()

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true })

  if (error) {
    return <p className="text-red-600">Не удалось загрузить категории: {error.message}</p>
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <ProductForm mode="create" categories={(categories ?? []) as Category[]} />
    </div>
  )
}
