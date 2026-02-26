import Link from "next/link"
import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CatalogBrand, CatalogCategory, CatalogFilterParams } from "@/src/domains/catalog/types"
import { resolveColorSwatch } from "@/src/domains/product-attributes/color-swatches"
import { SEASON_LABELS_RU, type SeasonKey } from "@/src/domains/product-attributes/seasons"
import { normalizeAttributeValue } from "@/src/domains/product-attributes/types"

type CatalogFilterMeta = {
  allSizes: string[]
  allColors: string[]
  allSeasons: string[]
  minPrice: number
  maxPrice: number
}

type CatalogFiltersFormProps = {
  filters: CatalogFilterParams
  categories: CatalogCategory[]
  brands: CatalogBrand[]
  meta: CatalogFilterMeta
}

function Section({
  title,
  isOpen,
  children,
}: {
  title: string
  isOpen: boolean
  children: ReactNode
}) {
  return (
    <details
      open={isOpen}
      className="group/section overflow-hidden rounded-xl border border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-tertiary)] open:border-[color:var(--color-border-accent)]"
    >
      <summary className="store-focus flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-2.5 text-left marker:content-none">
        <span className="text-sm font-medium text-[color:var(--color-brand-forest-light)]">{title}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-[color:var(--color-brand-beige-dark)] transition-transform duration-300 ease-out group-open/section:rotate-180" />
      </summary>
      <div className="grid grid-rows-[0fr] border-t border-[color:var(--color-border-secondary)] transition-[grid-template-rows] duration-300 ease-out group-open/section:grid-rows-[1fr]">
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 gap-1.5 p-2.5">{children}</div>
        </div>
      </div>
    </details>
  )
}

function OptionLabel({ children }: { children: ReactNode }) {
  return (
    <label className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-2.5 py-1.5 text-xs text-[color:var(--color-text-secondary)]">
      {children}
    </label>
  )
}

export function CatalogFiltersForm({
  filters,
  categories,
  brands,
  meta,
}: CatalogFiltersFormProps) {
  const selectedSizeNormalized = new Set(filters.sizes.map((value) => normalizeAttributeValue(value)))
  const selectedColorNormalized = new Set(filters.colors.map((value) => normalizeAttributeValue(value)))
  const hasBrandSelection = filters.brands.length > 0
  const hasSizeSelection = selectedSizeNormalized.size > 0
  const hasColorSelection = selectedColorNormalized.size > 0
  const hasSeasonSelection = filters.seasons.length > 0
  const hasCategorySelection = filters.category.length > 0

  return (
    <form action="/catalog" className="space-y-4">
      <input type="hidden" name="q" value={filters.q} />

      <Section title="Все категории" isOpen={hasCategorySelection}>
        {categories.map((category) => (
          <OptionLabel key={category.id}>
            <input className="store-focus" type="checkbox" name="category" value={category.slug} defaultChecked={filters.category.includes(category.slug)} />
            {category.name}
          </OptionLabel>
        ))}
      </Section>

      <Section title="Бренды" isOpen={hasBrandSelection}>
        {brands.map((brand) => (
          <OptionLabel key={brand.id}>
            <input className="store-focus" type="checkbox" name="brand" value={brand.slug} defaultChecked={filters.brands.includes(brand.slug)} />
            {brand.name}
          </OptionLabel>
        ))}
      </Section>

      <Section title="Размер" isOpen={hasSizeSelection}>
        {meta.allSizes.map((size) => (
          <OptionLabel key={size}>
            <input className="store-focus" type="checkbox" name="size" value={size} defaultChecked={selectedSizeNormalized.has(normalizeAttributeValue(size))} />
            {size}
          </OptionLabel>
        ))}
      </Section>

      <Section title="Цвет" isOpen={hasColorSelection}>
        {meta.allColors.map((color) => {
          const swatch = resolveColorSwatch(color)
          return (
            <OptionLabel key={color}>
              <input className="store-focus" type="checkbox" name="color" value={color} defaultChecked={selectedColorNormalized.has(normalizeAttributeValue(color))} />
              <span aria-hidden className="inline-flex h-4 w-4 rounded-full border border-[color:var(--color-border-primary)]" style={{ backgroundColor: swatch.hex }} />
              {color}
            </OptionLabel>
          )
        })}
      </Section>

      <Section title="Сезонность" isOpen={hasSeasonSelection}>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {meta.allSeasons.map((season) => (
            <OptionLabel key={season}>
              <input className="store-focus" type="checkbox" name="season" value={season} defaultChecked={filters.seasons.includes(season)} />
              {SEASON_LABELS_RU[season as SeasonKey]}
            </OptionLabel>
          ))}
        </div>
      </Section>

      <div>
        <p className="mb-2 text-sm font-medium text-[color:var(--color-brand-forest-light)]">Цена</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            name="minPrice"
            type="number"
            min={meta.minPrice}
            defaultValue={String(filters.minPrice ?? meta.minPrice)}
            className="store-focus h-10 rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-3 text-sm text-[color:var(--color-text-primary)]"
          />
          <input
            name="maxPrice"
            type="number"
            min={meta.minPrice}
            defaultValue={String(filters.maxPrice ?? meta.maxPrice)}
            className="store-focus h-10 rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-3 text-sm text-[color:var(--color-text-primary)]"
          />
        </div>
      </div>

      <Section title="Сортировка" isOpen={filters.sort !== "newest"}>
        <OptionLabel>
          <input className="store-focus" type="radio" name="sort" value="newest" defaultChecked={filters.sort === "newest"} />
          Сначала новые
        </OptionLabel>
        <OptionLabel>
          <input className="store-focus" type="radio" name="sort" value="price-asc" defaultChecked={filters.sort === "price-asc"} />
          Цена: по возрастанию
        </OptionLabel>
        <OptionLabel>
          <input className="store-focus" type="radio" name="sort" value="price-desc" defaultChecked={filters.sort === "price-desc"} />
          Цена: по убыванию
        </OptionLabel>
      </Section>

      <div className="grid grid-cols-2 gap-2">
        <Button type="submit" className="store-focus rounded-xl bg-[color:var(--color-brand-forest)] text-white hover:bg-[color:var(--color-brand-forest-dark)]">
          Применить
        </Button>
        <Button asChild variant="outline" className="store-focus rounded-xl">
          <Link href="/catalog">Сброс</Link>
        </Button>
      </div>
    </form>
  )
}
