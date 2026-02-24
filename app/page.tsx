import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"
import { getStorefrontContent } from "@/src/domains/content/services/storefront-content-service"
import { StoreShell } from "@/components/store/StoreShell"
import { BrandsMarquee } from "@/components/store/BrandsMarquee"
import { AnimatedProductGrid } from "@/components/store/AnimatedProductGrid"
import { FaqSection } from "@/components/store/FaqSection"
import { ScrollToFaqOnMount } from "@/components/store/ScrollToFaq"
import HeroShutterText from "@/components/ui/hero-shutter-text"
import { ShineBorder, HowWeWorkTimeline } from "@/components/ui/shine-border"
import { ScrollToHowWeWorkLink, ScrollToHowWeWorkOnMount } from "@/components/store/ScrollToHowWeWork"

type ProductPreview = {
  id: number
  name: string
  price: number
  price_currency: "RUB" | "CNY"
  images: string[] | null
  sizes: string[] | null
  colors: string[] | null
  seasons: string[] | null
  categories: { name: string }[] | { name: string } | null
  brands: { name: string }[] | { name: string } | null
}

function resolveRelationName(
  relation: { name: string }[] | { name: string } | null
) {
  if (!relation) return null
  if (Array.isArray(relation)) return relation[0]?.name ?? null
  return relation.name ?? null
}

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()
  const content = await getStorefrontContent()

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, price_currency, images, sizes, colors, seasons, categories(name), brands(name)")
    .order("created_at", { ascending: false })
    .limit(6)

  const productItems = (products ?? []) as ProductPreview[]

  return (
    <StoreShell>
      <ScrollToHowWeWorkOnMount />
      <ScrollToFaqOnMount />
      <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-16 pt-12 md:grid-cols-[1.15fr_1fr] md:px-12 md:pt-20">
        <div className="min-w-0 rounded-3xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/90 p-6 shadow-[0_18px_48px_-34px_rgba(18,39,33,0.25)] md:p-7">
          <div className="max-w-xl">
            <HeroShutterText text={content.hero.badge} />
          </div>
          <h1 className="mt-6 text-3xl font-semibold leading-[1.1] text-[color:var(--color-brand-forest-light)] md:text-5xl lg:text-6xl">
            {content.hero.title}
            <span className="block text-[color:var(--color-brand-beige-dark)]">{content.hero.accent}</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm text-[color:var(--color-text-secondary)] md:text-base">{content.hero.description}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row md:mt-8">
            <Link href={content.hero.primaryCtaHref} className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--color-brand-forest)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[color:var(--color-brand-forest-dark)]">
              {content.hero.primaryCtaLabel} <ArrowRight className="h-4 w-4" />
            </Link>
            <ScrollToHowWeWorkLink className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-5 py-3 text-sm font-medium text-[color:var(--color-text-tertiary)] transition hover:bg-[color:var(--color-bg-accent)]">
              {content.hero.secondaryCtaLabel}
            </ScrollToHowWeWorkLink>
          </div>
          <BrandsMarquee className="mt-7 md:mt-8" />
        </div>
        <div className="relative hidden overflow-hidden rounded-3xl border border-[color:var(--color-brand-forest-light)] bg-[color:var(--color-brand-forest-light)] p-6 md:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(198,161,91,0.34),transparent_45%)]" />
          <p className="relative text-xs uppercase tracking-[0.26em] text-[color:var(--color-brand-gold-400)]">{content.lookbook.title}</p>
          <div className="relative mt-4 grid grid-cols-2 gap-3">
            {productItems.slice(0, 4).map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group rounded-2xl bg-white/95 p-2">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
                  <Image
                    src={product.images?.[0] || "https://placehold.co/600x800/f1efe7/18362e?text=EASTLANE"}
                    alt={product.name}
                    fill
                    sizes="220px"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[color:var(--color-brand-forest-light)] md:text-3xl">Товары</h2>
          <Link href="/catalog" className="text-sm font-medium text-[color:var(--color-brand-beige-dark)] hover:text-[color:var(--color-brand-gold-700)]">В каталог</Link>
        </div>
        <AnimatedProductGrid
          products={productItems.map((product) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            priceCurrency: product.price_currency ?? "RUB",
            images: product.images,
            sizes: product.sizes,
            colors: product.colors,
            categoryName: resolveRelationName(product.categories) ?? "Каталог",
            brandName: resolveRelationName(product.brands),
          }))}
          cnyPerRub={content.exchangeRate.cnyPerRub}
        />
      </section>

      {/* Как мы работаем */}
      <section id="how-we-work" className="mx-auto max-w-7xl px-4 pb-10 md:px-12 md:pb-16">
        <div className="mx-auto max-w-[900px]">
          <div className="relative rounded-xl md:rounded-3xl">
            <ShineBorder
              borderWidth={1}
              duration={16}
              shineColor={["#FF2D9A", "#7B61FF", "#00E0FF"]}
            />
            <HowWeWorkTimeline />
          </div>
        </div>
      </section>

      <FaqSection />

      <section className="mx-auto max-w-7xl px-6 pb-20 md:px-12">
        <div className="rounded-3xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/90 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-[color:var(--color-brand-forest-light)]">{content.benefits.title}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {content.benefits.items.map((item) => (
              <div key={item.title} className="rounded-xl border border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-tertiary)] p-4">
                <p className="font-medium text-[color:var(--color-brand-forest-light)]">{item.title}</p>
                <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </StoreShell>
  )
}
