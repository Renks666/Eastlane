import Link from "next/link"
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
    <form action="/catalog" className="space-y-5">
      <input type="hidden" name="q" value={filters.q} />
      <details
        open={hasCategorySelection}
        className="group/section overflow-hidden rounded-2xl border border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-tertiary)] open:border-[color:var(--color-border-accent)]"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-left marker:content-none">
          <span className="text-sm font-medium text-[color:var(--color-brand-forest-light)]">Все категории</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-[color:var(--color-brand-beige-dark)] transition-transform duration-300 ease-out group-open/section:rotate-180" />
        </summary>
        <div className="grid grid-rows-[0fr] border-t border-[color:var(--color-border-secondary)] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-open/section:grid-rows-[1fr]">
          <div className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] opacity-0 -translate-y-1 group-open/section:translate-y-0 group-open/section:opacity-100">
            <div className="grid grid-cols-1 gap-1.5 p-3">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-2 py-1.5 text-xs text-[color:var(--color-text-secondary)]"
                >
                  <input
                    type="checkbox"
                    name="category"
                    value={category.slug}
                    defaultChecked={filters.category.includes(category.slug)}
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      </details>

      <details
        open={hasBrandSelection}
        className="group/section overflow-hidden rounded-2xl border border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-tertiary)] open:border-[color:var(--color-border-accent)]"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-left marker:content-none">
          <span className="text-sm font-medium text-[color:var(--color-brand-forest-light)]">Бренды</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-[color:var(--color-brand-beige-dark)] transition-transform duration-300 ease-out group-open/section:rotate-180" />
        </summary>
        <div className="grid grid-rows-[0fr] border-t border-[color:var(--color-border-secondary)] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-open/section:grid-rows-[1fr]">
          <div className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] opacity-0 -translate-y-1 group-open/section:translate-y-0 group-open/section:opacity-100">
            <div className="grid grid-cols-1 gap-1.5 p-3">
              {brands.map((brand) => (
                <label
                  key={brand.id}
                  className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-2 py-1.5 text-xs text-[color:var(--color-text-secondary)]"
                >
                  <input
                    type="checkbox"
                    name="brand"
                    value={brand.slug}
                    defaultChecked={filters.brands.includes(brand.slug)}
                  />
                  {brand.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      </details>

      <details
        open={hasSizeSelection}
        className="group/section overflow-hidden rounded-2xl border border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-tertiary)] open:border-[color:var(--color-border-accent)]"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-left marker:content-none">
          <span className="text-sm font-medium text-[color:var(--color-brand-forest-light)]">Размер</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-[color:var(--color-brand-beige-dark)] transition-transform duration-300 ease-out group-open/section:rotate-180" />
        </summary>
        <div className="grid grid-rows-[0fr] border-t border-[color:var(--color-border-secondary)] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-open/section:grid-rows-[1fr]">
          <div className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] opacity-0 -translate-y-1 group-open/section:translate-y-0 group-open/section:opacity-100">
            <div className="grid grid-cols-1 gap-1.5 p-3">
              {meta.allSizes.map((size) => (
                <label key={size} className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-2 py-1.5 text-xs text-[color:var(--color-text-secondary)]">
                  <input type="checkbox" name="size" value={size} defaultChecked={selectedSizeNormalized.has(normalizeAttributeValue(size))} />
                  {size}
                </label>
              ))}
            </div>
          </div>
        </div>
      </details>

      <details
        open={hasColorSelection}
        className="group/section overflow-hidden rounded-2xl border border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-tertiary)] open:border-[color:var(--color-border-accent)]"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-left marker:content-none">
          <span className="text-sm font-medium text-[color:var(--color-brand-forest-light)]">Цвет</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-[color:var(--color-brand-beige-dark)] transition-transform duration-300 ease-out group-open/section:rotate-180" />
        </summary>
        <div className="grid grid-rows-[0fr] border-t border-[color:var(--color-border-secondary)] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-open/section:grid-rows-[1fr]">
          <div className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] opacity-0 -translate-y-1 group-open/section:translate-y-0 group-open/section:opacity-100">
            <div className="grid grid-cols-1 gap-1.5 p-3">
              {meta.allColors.map((color) => {
                const swatch = resolveColorSwatch(color)
                return (
                  <label key={color} className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-2 py-1.5 text-xs text-[color:var(--color-text-secondary)]">
                    <input type="checkbox" name="color" value={color} defaultChecked={selectedColorNormalized.has(normalizeAttributeValue(color))} />
                    <span
                      aria-hidden
                      className="inline-flex h-4 w-4 rounded-full border border-[color:var(--color-border-primary)]"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    {color}
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      </details>

      <details
        open={hasSeasonSelection}
        className="group/section overflow-hidden rounded-2xl border border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-tertiary)] open:border-[color:var(--color-border-accent)]"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-left marker:content-none">
          <span className="text-sm font-medium text-[color:var(--color-brand-forest-light)]">Сезонность</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-[color:var(--color-brand-beige-dark)] transition-transform duration-300 ease-out group-open/section:rotate-180" />
        </summary>
        <div className="grid grid-rows-[0fr] border-t border-[color:var(--color-border-secondary)] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-open/section:grid-rows-[1fr]">
          <div className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] opacity-0 -translate-y-1 group-open/section:translate-y-0 group-open/section:opacity-100">
            <div className="grid grid-cols-2 gap-2 p-3">
              {meta.allSeasons.map((season) => (
                <label key={season} className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-2 py-1.5 text-xs text-[color:var(--color-text-secondary)]">
                  <input type="checkbox" name="season" value={season} defaultChecked={filters.seasons.includes(season)} />
                  {SEASON_LABELS_RU[season as SeasonKey]}
                </label>
              ))}
            </div>
          </div>
        </div>
      </details>

      <div>
        <p className="mb-2 text-sm font-medium text-[color:var(--color-brand-forest-light)]">Цена</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            name="minPrice"
            type="number"
            min={meta.minPrice}
            defaultValue={String(filters.minPrice ?? meta.minPrice)}
            className="h-10 rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-3 text-sm text-[color:var(--color-text-primary)]"
          />
          <input
            name="maxPrice"
            type="number"
            min={meta.minPrice}
            defaultValue={String(filters.maxPrice ?? meta.maxPrice)}
            className="h-10 rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-3 text-sm text-[color:var(--color-text-primary)]"
          />
        </div>
      </div>

      <details
        open={filters.sort !== "newest"}
        className="group/section overflow-hidden rounded-2xl border border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-tertiary)] open:border-[color:var(--color-border-accent)]"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-left marker:content-none">
          <span className="text-sm font-medium text-[color:var(--color-brand-forest-light)]">Сортировка</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-[color:var(--color-brand-beige-dark)] transition-transform duration-300 ease-out group-open/section:rotate-180" />
        </summary>
        <div className="grid grid-rows-[0fr] border-t border-[color:var(--color-border-secondary)] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-open/section:grid-rows-[1fr]">
          <div className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] opacity-0 -translate-y-1 group-open/section:translate-y-0 group-open/section:opacity-100">
            <div className="grid grid-cols-1 gap-1.5 p-3">
              <label className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-2 py-1.5 text-xs text-[color:var(--color-text-secondary)]">
                <input type="radio" name="sort" value="newest" defaultChecked={filters.sort === "newest"} />
                Сначала новые
              </label>
              <label className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-2 py-1.5 text-xs text-[color:var(--color-text-secondary)]">
                <input type="radio" name="sort" value="price-asc" defaultChecked={filters.sort === "price-asc"} />
                Цена: по возрастанию
              </label>
              <label className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-2 py-1.5 text-xs text-[color:var(--color-text-secondary)]">
                <input type="radio" name="sort" value="price-desc" defaultChecked={filters.sort === "price-desc"} />
                Цена: по убыванию
              </label>
            </div>
          </div>
        </div>
      </details>

      <div className="grid grid-cols-2 gap-2">
        <Button type="submit" className="rounded-xl bg-[color:var(--color-brand-forest)] text-white hover:bg-[color:var(--color-brand-forest-dark)]">
          Применить
        </Button>
        <Button asChild variant="outline">
          <Link href="/catalog" className="rounded-xl">
            Сброс
          </Link>
        </Button>
      </div>
    </form>
  )
}
