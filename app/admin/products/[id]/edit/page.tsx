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
  slug: string
}

type Brand = {
  id: number
  name: string
  slug: string
}

type AttributeOption = {
  value: string
}

export default async function EditProductPage({ params }: EditPageProps) {
  const { id } = await params
  const productId = Number(id)
  if (!Number.isInteger(productId) || productId <= 0) {
    notFound()
  }

  await requireAdminUserOrRedirect()
  const supabase = await createServerSupabaseClient()

  const [
    { data: categories, error: categoriesError },
    { data: brands, error: brandsError },
    { data: sizeOptions, error: sizesError },
    { data: colorOptions, error: colorsError },
    { data: product, error: productError },
  ] = await Promise.all([
    supabase.from("categories").select("id, name, slug").order("name", { ascending: true }),
    supabase.from("brands").select("id, name, slug").order("name", { ascending: true }),
    supabase.from("product_sizes").select("value").eq("is_active", true).order("sort_order", { ascending: true }).order("value", { ascending: true }),
    supabase.from("product_colors").select("value").eq("is_active", true).order("sort_order", { ascending: true }).order("value", { ascending: true }),
    supabase
      .from("products")
      .select("id, name, description, price, price_currency, category_id, brand_id, sizes, colors, seasons, images")
      .eq("id", productId)
      .single(),
  ])

  if (categoriesError) {
    return <p className="text-red-600">Не удалось загрузить категории: {categoriesError.message}</p>
  }
  if (brandsError) {
    return <p className="text-red-600">Не удалось загрузить бренды: {brandsError.message}</p>
  }
  if (sizesError) {
    return <p className="text-red-600">Не удалось загрузить размеры: {sizesError.message}</p>
  }
  if (colorsError) {
    return <p className="text-red-600">Не удалось загрузить цвета: {colorsError.message}</p>
  }
  if (productError || !product) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <ProductForm
        mode="edit"
        categories={(categories ?? []) as Category[]}
        brands={(brands ?? []) as Brand[]}
        sizeOptionsFromDb={((sizeOptions ?? []) as AttributeOption[]).map((item) => item.value)}
        colorOptionsFromDb={((colorOptions ?? []) as AttributeOption[]).map((item) => item.value)}
        product={{ ...product, price: Number(product.price), price_currency: (product.price_currency ?? "RUB") as "RUB" | "CNY" }}
      />
    </div>
  )
}
