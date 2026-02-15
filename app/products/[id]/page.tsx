import { notFound } from "next/navigation"
import { StoreShell } from "@/components/store/StoreShell"
import { ProductGallery } from "@/components/store/ProductGallery"
import { ProductPurchasePanel } from "@/components/store/ProductPurchasePanel"
import { createClient } from "@/lib/supabase/server"

type ProductPageProps = {
  params: Promise<{ id: string }>
}

type ProductData = {
  id: number
  name: string
  description: string | null
  price: number
  sizes: string[] | null
  colors: string[] | null
  images: string[] | null
  categories: { name: string }[] | null
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const productId = Number(id)
  if (!Number.isInteger(productId) || productId <= 0) {
    notFound()
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, sizes, colors, images, categories(name)")
    .eq("id", productId)
    .single()

  if (error || !data) {
    notFound()
  }

  const product = data as ProductData
  const sizes = product.sizes ?? []
  const colors = product.colors ?? []
  const inStock = sizes.length > 0

  return (
    <StoreShell>
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-8 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          <ProductGallery images={product.images ?? []} name={product.name} />
          <article className="rounded-2xl border border-[#d8cfb7] bg-white/90 p-5 md:p-6">
            <p className="inline-flex rounded-full border border-[#d8cfb7] bg-[#f7f4ea] px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-[#6f634a]">
              Коллекция: {product.categories?.[0]?.name ?? "EASTLANE"}
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-[#0f3f33]">{product.name}</h1>
            <p className="mt-4 text-3xl font-semibold text-[#0f3f33]">{Number(product.price).toFixed(2)} ₽</p>

            <ProductPurchasePanel
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0],
                sizes,
                colors,
              }}
            />

            <div className="mt-6 space-y-5">
              <div>
                <p className="mb-2 text-sm font-medium text-[#0f3f33]">Цвет</p>
                <div className="flex flex-wrap gap-2">
                  {colors.length > 0 ? (
                    colors.map((color) => (
                      <span key={color} className="rounded-full border border-[#d8cfb7] bg-white px-3 py-1 text-sm text-[#5f6e65]">
                        {color}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[#5f6e65]">Уточните у менеджера</span>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-[#0f3f33]">Наличие</p>
                <span className={`inline-flex rounded-full border px-3 py-1 text-sm ${inStock ? "border-[#c8dacd] bg-[#eef4f1] text-[#0f5a49]" : "border-[#e5d6b3] bg-[#faf8f2] text-[#b29152]"}`}>
                  {inStock ? "В наличии" : "Под заказ"}
                </span>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-[#0f3f33]">Описание товара</p>
                <p className="text-sm leading-relaxed text-[#5f6e65]">
                  {product.description || "Минималистичный силуэт и комфортная посадка для повседневного гардероба."}
                </p>
              </div>
            </div>

            <div className="mt-7 rounded-2xl border border-[#d8cfb7] bg-[#faf8f2] p-4">
              <p className="text-sm text-[#5f6e65]">
                Оформление заказа через менеджера в Instagram / Telegram / WhatsApp.
                Онлайн-оплата на сайте не используется.
              </p>
            </div>
          </article>
        </div>
      </section>
    </StoreShell>
  )
}
