import { notFound, redirect } from "next/navigation"
import { ProductForm } from "@/components/ProductForm"
import { createClient } from "@/lib/supabase/server"

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

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  const [{ data: categories, error: categoriesError }, { data: product, error: productError }] =
    await Promise.all([
      supabase.from("categories").select("id, name").order("name", { ascending: true }),
      supabase
        .from("products")
        .select("id, name, description, price, category_id, sizes, colors, images")
        .eq("id", productId)
        .single(),
    ])

  if (categoriesError) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-600">Failed to load categories: {categoriesError.message}</p>
      </div>
    )
  }

  if (productError || !product) {
    notFound()
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
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
