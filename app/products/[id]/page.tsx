import { notFound } from "next/navigation"
import { StoreShell } from "@/components/store/StoreShell"
import { ProductGallery } from "@/components/store/ProductGallery"
import { ProductPurchasePanel } from "@/components/store/ProductPurchasePanel"
import { Breadcrumbs } from "@/components/store/Breadcrumbs"
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
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-12 md:px-12">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Каталог", href: "/catalog" },
            { label: product.name },
          ]}
        />
        <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          <ProductGallery images={product.images ?? []} name={product.name} />
          <article className="rounded-2xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/90 p-5 md:p-6">
            <p className="inline-flex rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-accent)] px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-[color:var(--color-text-tertiary)]">
              Коллекция: {product.categories?.[0]?.name ?? "EASTLANE"}
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-[color:var(--color-brand-forest-light)]">{product.name}</h1>
            <p className="font-price tabular-nums mt-4 text-3xl font-semibold text-black">{Math.round(Number(product.price))} ₽</p>

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
                <p className="mb-2 text-sm font-medium text-[color:var(--color-brand-forest-light)]">Цвет</p>
                <div className="flex flex-wrap gap-2">
                  {colors.length > 0 ? (
                    colors.map((color) => (
                      <span key={color} className="rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-3 py-1 text-sm text-[color:var(--color-text-secondary)]">
                        {color}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[color:var(--color-text-secondary)]">Уточните у менеджера</span>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-[color:var(--color-brand-forest-light)]">Наличие</p>
                <span className={`inline-flex rounded-full border px-3 py-1 text-sm ${inStock ? "border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-image)] text-[color:var(--color-brand-forest)]" : "border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-tertiary)] text-[color:var(--color-brand-beige-dark)]"}`}>
                  {inStock ? "В наличии" : "Под заказ"}
                </span>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-[color:var(--color-brand-forest-light)]">Описание товара</p>
                <p className="text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
                  {product.description || "Минималистичный силуэт и комфортная посадка для повседневного гардероба."}
                </p>
              </div>
            </div>

            <div className="mt-7 rounded-2xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-tertiary)] p-4">
              <p className="text-sm text-[color:var(--color-text-secondary)]">
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
