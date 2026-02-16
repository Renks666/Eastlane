import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"
import { getStorefrontContent } from "@/src/domains/content/services/storefront-content-service"
import { StoreShell } from "@/components/store/StoreShell"
import { StoreProductCard } from "@/components/store/StoreProductCard"
import HeroShutterText from "@/components/ui/hero-shutter-text"

type ProductPreview = {
  id: number
  name: string
  price: number
  images: string[] | null
  sizes: string[] | null
  colors: string[] | null
  categories: { name: string }[] | null
}

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()
  const content = await getStorefrontContent()

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, price, images, sizes, colors, categories(name)")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("categories").select("id, name, slug").order("name").limit(6),
  ])

  const productItems = (products ?? []) as ProductPreview[]

  return (
    <StoreShell>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-8 pt-10 md:grid-cols-[1.15fr_1fr] md:px-8 md:pt-14">
        <div className="rounded-3xl border border-[#d8cfb7] bg-white/90 p-7 shadow-[0_18px_48px_-34px_rgba(18,39,33,0.25)]">
          <div className="max-w-xl">
            <HeroShutterText text={content.hero.badge} />
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] text-[#0f3f33] md:text-6xl">
            {content.hero.title}
            <span className="block text-[#b29152]">{content.hero.accent}</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm text-[#5f6e65] md:text-base">{content.hero.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={content.hero.primaryCtaHref} className="inline-flex items-center gap-2 rounded-full bg-[#0f5a49] px-5 py-3 text-sm font-medium text-[#f2ece0] transition hover:bg-[#0b4a3c]">
              {content.hero.primaryCtaLabel} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={content.hero.secondaryCtaHref} className="inline-flex items-center rounded-full border border-[#d8cfb7] bg-white px-5 py-3 text-sm font-medium text-[#6f634a] transition hover:bg-[#f8f4ea]">
              {content.hero.secondaryCtaLabel}
            </Link>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-[#0f3f33] bg-[#0f3f33] p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(198,161,91,0.34),transparent_45%)]" />
          <p className="relative text-xs uppercase tracking-[0.26em] text-[#d9bd7e]">{content.lookbook.title}</p>
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

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#0f3f33] md:text-3xl">Категории</h2>
          <Link href="/catalog" className="text-sm font-medium text-[#b29152] hover:text-[#9e7d42]">Смотреть все</Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {(categories ?? []).map((category) => (
            <Link
              key={category.id}
              href={`/catalog?category=${category.slug}`}
              className="rounded-full border border-[#d8cfb7] bg-white/90 px-4 py-2 text-sm text-[#5f6e65] transition hover:border-[#b29152] hover:text-[#0f3f33]"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 md:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#0f3f33] md:text-3xl">Товары</h2>
          <Link href="/catalog" className="text-sm font-medium text-[#b29152] hover:text-[#9e7d42]">В каталог</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productItems.map((product) => (
            <StoreProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                images: product.images,
                sizes: product.sizes,
                colors: product.colors,
                categoryName: product.categories?.[0]?.name ?? "Каталог",
              }}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 md:px-8">
        <div className="rounded-3xl border border-[#d8cfb7] bg-white/90 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-[#0f3f33]">{content.benefits.title}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {content.benefits.items.map((item) => (
              <div key={item.title} className="rounded-xl border border-[#e4dcc6] bg-[#faf8f2] p-4">
                <p className="font-medium text-[#0f3f33]">{item.title}</p>
                <p className="mt-2 text-sm text-[#5f6e65]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </StoreShell>
  )
}

