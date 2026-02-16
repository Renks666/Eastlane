import Link from "next/link"
import Image from "next/image"
import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"
import { requireAdminUserOrRedirect } from "@/src/shared/lib/auth/require-admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProductDeleteButton } from "@/app/admin/products/ProductDeleteButton"

type ProductRow = {
  id: number
  name: string
  price: number
  images: string[] | null
  categories: { name: string }[] | null
}

type AdminProductsPageProps = {
  searchParams: Promise<{ q?: string }>
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  await requireAdminUserOrRedirect()
  const { q } = await searchParams
  const queryText = q?.trim() ?? ""

  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from("products")
    .select("id, name, price, images, categories(name)")
    .order("created_at", { ascending: false })

  if (queryText) {
    query = query.ilike("name", `%${queryText}%`)
  }

  const { data, error } = await query

  if (error) {
    return <p className="text-red-600">Failed to load products: {error.message}</p>
  }

  const products = (data ?? []) as ProductRow[]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Products</h2>
          <p className="text-sm text-muted-foreground">Create, edit and delete products.</p>
          {queryText ? <p className="mt-1 text-xs text-muted-foreground">Filter: {queryText}</p> : null}
        </div>
        <Button asChild>
          <Link href="/admin/products/new">Add product</Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="rounded-xl border-border shadow-sm">
          <CardContent className="p-8 text-center text-muted-foreground">No products found.</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <Card key={product.id} className="rounded-xl border-border shadow-sm">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded border bg-muted">
                    {product.images?.[0] ? (
                      <Image src={product.images[0]} alt={product.name} fill sizes="64px" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.categories?.[0]?.name ?? "No category"}</p>
                    <p className="text-sm font-semibold">{Number(product.price).toFixed(2)} ₽</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
                  </Button>
                  <ProductDeleteButton productId={product.id} productName={product.name} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
