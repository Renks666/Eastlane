import Image from "next/image"
import { readdir } from "node:fs/promises"
import path from "node:path"
import { cn } from "@/lib/utils"

type BrandLogo = {
  slug: string
  alt: string
}

function toTitleCaseWord(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function toBrandLabel(slug: string) {
  const cleaned = slug
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  if (!cleaned) return "Brand"

  return cleaned
    .split(" ")
    .map((part) => toTitleCaseWord(part.toLowerCase()))
    .join(" ")
}

async function getPublicBrandSlugs() {
  const brandsDir = path.join(process.cwd(), "public", "brands")

  try {
    const entries = await readdir(brandsDir, { withFileTypes: true })

    return entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".svg"))
      .map((entry) => entry.name.replace(/\.svg$/i, ""))
      .sort((a, b) => a.localeCompare(b))
  } catch {
    return []
  }
}

function BrandRow({ brands }: { brands: BrandLogo[] }) {
  const minItemsPerTrack = 12
  const repeatsNeeded = Math.max(1, Math.ceil(minItemsPerTrack / brands.length))
  const baseTrack = Array.from({ length: repeatsNeeded }, () => brands).flat()
  const repeatedBrands = baseTrack.concat(baseTrack)

  return (
    <div
      className={cn(
        "flex w-max items-center gap-6 sm:gap-8 [will-change:transform] motion-reduce:animate-none",
        "animate-marquee [animation-duration:30s] md:[animation-duration:40s]"
      )}
    >
      {repeatedBrands.map((brand, index) => {
        const isDuplicate = index >= baseTrack.length

        return (
          <div key={`${brand.slug}-${index}`} aria-hidden={isDuplicate} className="group shrink-0">
            <Image
              src={`/brands/${brand.slug}.svg`}
              alt={isDuplicate ? "" : brand.alt}
              width={120}
              height={32}
              sizes="(max-width: 768px) 96px, 120px"
              className="h-6 w-auto opacity-70 grayscale transition duration-300 ease-out group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0 md:h-8"
            />
          </div>
        )
      })}
    </div>
  )
}

export async function BrandsMarquee({ className }: { className?: string }) {
  const slugs = await getPublicBrandSlugs()
  const brands = slugs.map((slug) => ({
    slug,
    alt: `${toBrandLabel(slug)} logo`,
  }))

  if (brands.length === 0) {
    return null
  }

  return (
    <div className={cn("relative max-w-full overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[color:var(--color-bg-primary)] to-transparent md:w-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[color:var(--color-bg-primary)] to-transparent md:w-20" />
      <BrandRow brands={brands} />
    </div>
  )
}
