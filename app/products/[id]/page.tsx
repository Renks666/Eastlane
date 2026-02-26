import { notFound } from "next/navigation"
import { StoreShell } from "@/components/store/StoreShell"
import { ProductGallery } from "@/components/store/ProductGallery"
import { ProductPurchasePanel } from "@/components/store/ProductPurchasePanel"
import { ProductPriceWithTooltip } from "@/components/store/ProductPriceWithTooltip"
import { Breadcrumbs } from "@/components/store/Breadcrumbs"
import { createClient } from "@/lib/supabase/server"
import { getStorefrontContent } from "@/src/domains/content/services/storefront-content-service"
import { isSeasonKey, normalizeSeason, SEASON_LABELS_RU, type SeasonKey } from "@/src/domains/product-attributes/seasons"
import {
  convertCnyToRubApprox,
  convertRubToCnyApprox,
  formatCny,
  formatRub,
  normalizePriceCurrency,
} from "@/src/shared/lib/format-price"

type ProductPageProps = {
  params: Promise<{ id: string }>
}

type ProductData = {
  id: number
  name: string
  description: string | null
  price: number
  price_currency: "RUB" | "CNY"
  sizes: string[] | null
  colors: string[] | null
  seasons: string[] | null
  images: string[] | null
  categories: { name: string }[] | null
  brands: { name: string }[] | null
}

function resolveRelationName(relation: unknown): string | null {
  if (!relation) return null
  if (Array.isArray(relation)) {
    const first = relation[0] as { name?: string } | undefined
    return typeof first?.name === "string" ? first.name : null
  }
  if (typeof relation === "object") {
    const single = relation as { name?: string }
    return typeof single.name === "string" ? single.name : null
  }
  return null
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const productId = Number(id)
  if (!Number.isInteger(productId) || productId <= 0) {
    notFound()
  }

  const supabase = await createClient()
  const content = await getStorefrontContent()
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, price_currency, sizes, colors, seasons, images, categories(name), brands(name)")
    .eq("id", productId)
    .single()

  if (error || !data) {
    notFound()
  }

  const product = data as ProductData
  const sizes = product.sizes ?? []
  const colors = product.colors ?? []
  const brandName = resolveRelationName(product.brands)
  const seasons = Array.from(
    new Set(
      (product.seasons ?? [])
        .map((value) => normalizeSeason(value))
        .filter((value): value is SeasonKey => isSeasonKey(value))
    )
  )
  const inStock = sizes.length > 0
  const priceCurrency = normalizePriceCurrency(product.price_currency)
  const hasValidRate = Number.isFinite(content.exchangeRate.cnyPerRub) && content.exchangeRate.cnyPerRub > 0
  const rateRubPerCnyText = hasValidRate
    ? new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(1 / content.exchangeRate.cnyPerRub)
    : null

  const displayPriceCny = priceCurrency === "CNY"
    ? product.price
    : (hasValidRate ? (convertRubToCnyApprox(product.price, content.exchangeRate.cnyPerRub) ?? null) : null)

  const displayPriceRubApprox = hasValidRate
    ? (priceCurrency === "CNY"
      ? (convertCnyToRubApprox(product.price, content.exchangeRate.cnyPerRub) ?? null)
      : product.price)
    : null

  const primaryPriceText = displayPriceCny !== null ? formatCny(displayPriceCny) : formatRub(product.price)
  const secondaryPriceText = displayPriceRubApprox !== null ? `≈ ${formatRub(displayPriceRubApprox)}` : null

  return (
    <StoreShell>
      <section className="store-section pb-14 pt-7 md:pt-8">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Каталог", href: "/catalog" },
            { label: product.name },
          ]}
        />
        <div className="mt-3 grid gap-5 xl:mt-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] xl:gap-6">
          <ProductGallery images={product.images ?? []} name={product.name} zoomMode="wb-hybrid" />
          <article className="h-fit rounded-2xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/95 p-4 shadow-[0_12px_36px_-28px_rgba(15,63,51,0.55)] md:p-5">
            {brandName ? <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brand-beige-dark)]">{brandName}</p> : null}
            <h1 className="mt-2 text-2xl font-semibold leading-tight text-[color:var(--color-brand-forest-light)] md:text-3xl">{product.name}</h1>
            <ProductPriceWithTooltip
              primaryPrice={primaryPriceText}
              secondaryPrice={secondaryPriceText}
              rateText={rateRubPerCnyText}
            />

            <div className="mt-4 rounded-xl border border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-tertiary)] p-3.5 md:p-4">
              <ProductPurchasePanel
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  priceCurrency,
                  image: product.images?.[0],
                  sizes,
                  colors,
                }}
              />
            </div>

            <div className="mt-4 space-y-3.5 md:space-y-4">
              <div className="rounded-xl border border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-primary)] p-3.5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.11em] text-[color:var(--color-brand-forest-light)]">Сезонность</p>
                <div className="flex flex-wrap gap-2">
                  {seasons.length > 0 ? (
                    seasons.map((season) => (
                      <span key={season} className="rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-tertiary)] px-3 py-1 text-sm text-[color:var(--color-text-secondary)]">
                        {SEASON_LABELS_RU[season]}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[color:var(--color-text-secondary)]">Уточните у менеджера</span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-primary)] p-3.5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.11em] text-[color:var(--color-brand-forest-light)]">Наличие</p>
                <span className={`inline-flex rounded-full border px-3 py-1 text-sm ${inStock ? "border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-image)] text-[color:var(--color-brand-forest)]" : "border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-tertiary)] text-[color:var(--color-brand-beige-dark)]"}`}>
                  {inStock ? "В наличии" : "Под заказ"}
                </span>
              </div>

              <div className="rounded-xl border border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-primary)] p-3.5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.11em] text-[color:var(--color-brand-forest-light)]">Описание товара</p>
                <p className="text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
                  {product.description || "Минималистичный силуэт и комфортная посадка для повседневного гардероба."}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[color:var(--color-border-primary)] bg-[linear-gradient(140deg,rgba(250,248,242,0.95)_0%,rgba(255,255,255,0.9)_100%)] p-3.5 md:p-4">
              <p className="text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
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

