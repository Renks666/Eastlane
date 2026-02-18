import { notFound } from "next/navigation"
import { ProductForm } from "@/components/ProductForm"
import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"
import { requireAdminUserOrRedirect } from "@/src/shared/lib/auth/require-admin"

type EditPageProps = {
  params: Promise<{ id: string }>
}

type Category = {
  id: number
  name: string
}

export default async function EditProductPage({ params }: EditPageProps) {
  const { id } = await params
  const productId = Number(id)

  if (!Number.isInteger(productId) || productId <= 0) {
    notFound()
  }

  await requireAdminUserOrRedirect()
  const supabase = await createServerSupabaseClient()

  const [{ data: categories, error: categoriesError }, { data: product, error: productError }] = await Promise.all([
    supabase.from("categories").select("id, name").order("name", { ascending: true }),
    supabase
      .from("products")
      .select("id, name, description, price, category_id, sizes, colors, images")
      .eq("id", productId)
      .single(),
  ])

  if (categoriesError) {
    return <p className="text-red-600">Не удалось загрузить категории: {categoriesError.message}</p>
  }

  if (productError || !product) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <ProductForm
        mode="edit"
        categories={(categories ?? []) as Category[]}
        product={{
          ...product,
          price: Number(product.price),
        }}
      />
    </div>
  )
}
