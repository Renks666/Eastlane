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
    return <p className="text-red-600">Не удалось загрузить товары: {error.message}</p>
  }

  const products = (data ?? []) as ProductRow[]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Товары</h2>
          <p className="text-sm text-muted-foreground">Создание, редактирование и удаление товаров.</p>
          {queryText ? <p className="mt-1 text-xs text-muted-foreground">Фильтр: {queryText}</p> : null}
        </div>
        <Button
          asChild
          className="w-full !bg-[color:var(--color-brand-forest)] !text-white hover:!bg-[color:var(--color-brand-forest-dark)] sm:w-auto"
        >
          <Link href="/admin/products/new">Создать товар</Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="rounded-xl border-border shadow-sm">
          <CardContent className="p-8 text-center text-muted-foreground">Товары не найдены.</CardContent>
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
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Нет фото</div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.categories?.[0]?.name ?? "Без категории"}</p>
                    <p className="font-price tabular-nums text-sm font-semibold text-black">{Math.round(Number(product.price))} ₽</p>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                    <Link href={`/admin/products/${product.id}/edit`}>Изменить</Link>
                  </Button>
                  <ProductDeleteButton productId={product.id} productName={product.name} className="w-full sm:w-auto" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
