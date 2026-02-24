import Link from "next/link"
import Image from "next/image"
import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"
import { requireAdminUserOrRedirect } from "@/src/shared/lib/auth/require-admin"
import { getStorefrontContent } from "@/src/domains/content/services/storefront-content-service"
import { formatDualPrice, normalizePriceCurrency } from "@/src/shared/lib/format-price"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProductDeleteButton } from "@/app/admin/products/ProductDeleteButton"

type ProductRow = {
  id: number
  name: string
  price: number
  price_currency: "RUB" | "CNY"
  created_at: string
  images: string[] | null
  categories: { name: string }[] | null
  brands: { name: string }[] | null
}

type AdminProductsPageProps = {
  searchParams: Promise<{ q?: string }>
}

function mapProducts(rows: ProductRow[]) {
  return [...rows].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  await requireAdminUserOrRedirect()
  const { q } = await searchParams
  const queryText = q?.trim() ?? ""

  const supabase = await createServerSupabaseClient()
  const content = await getStorefrontContent()
  const selectColumns = "id, name, price, price_currency, created_at, images, categories(name), brands(name), brand_id"

  let products: ProductRow[] = []
  let pageError: string | null = null

  if (!queryText) {
    const { data, error } = await supabase.from("products").select(selectColumns).order("created_at", { ascending: false })
    if (error) {
      pageError = error.message
    } else {
      products = (data ?? []) as ProductRow[]
    }
  } else {
    const [{ data: nameData, error: nameError }, { data: brandMatches, error: brandMatchError }] = await Promise.all([
      supabase
        .from("products")
        .select(selectColumns)
        .ilike("name", `%${queryText}%`)
        .order("created_at", { ascending: false }),
      supabase.from("brands").select("id").ilike("name", `%${queryText}%`),
    ])

    if (nameError) {
      pageError = nameError.message
    } else if (brandMatchError) {
      pageError = brandMatchError.message
    } else {
      const byId = new Map<number, ProductRow>()
      for (const product of (nameData ?? []) as ProductRow[]) {
        byId.set(product.id, product)
      }

      const brandIds = (brandMatches ?? []).map((item) => Number(item.id)).filter((id) => Number.isInteger(id))
      if (brandIds.length > 0) {
        const { data: byBrandData, error: byBrandError } = await supabase
          .from("products")
          .select(selectColumns)
          .in("brand_id", brandIds)
          .order("created_at", { ascending: false })

        if (byBrandError) {
          pageError = byBrandError.message
        } else {
          for (const product of (byBrandData ?? []) as ProductRow[]) {
            byId.set(product.id, product)
          }
        }
      }

      if (!pageError) {
        products = mapProducts(Array.from(byId.values()))
      }
    }
  }

  if (pageError) {
    return <p className="text-red-600">Не удалось загрузить товары: {pageError}</p>
  }

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
                    <p className="text-xs text-muted-foreground">{product.brands?.[0]?.name ?? "Без бренда"}</p>
                    <p className="font-price tabular-nums text-sm font-semibold text-black">
                      {formatDualPrice({
                        amount: Number(product.price),
                        currency: normalizePriceCurrency(product.price_currency),
                        cnyPerRub: content.exchangeRate.cnyPerRub,
                      })}
                    </p>
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

