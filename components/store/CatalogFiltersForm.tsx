import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CatalogBrand, CatalogCategory, CatalogFilterParams } from "@/src/domains/catalog/types"
import { BRAND_GROUP_LABELS, BRAND_GROUP_ORDER, type BrandGroupKey } from "@/src/domains/brand/types"
import { SEASON_LABELS_RU, type SeasonKey } from "@/src/domains/product-attributes/seasons"

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
  groupedBrands: Record<BrandGroupKey, CatalogBrand[]>
  meta: CatalogFilterMeta
}

export function CatalogFiltersForm({
  filters,
  categories,
  groupedBrands,
  meta,
}: CatalogFiltersFormProps) {
  const hasBrandSelection = filters.brands.length > 0
  const hasSizeSelection = filters.sizes.length > 0
  const hasColorSelection = filters.colors.length > 0
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
            <div className="space-y-3 p-3">
              {BRAND_GROUP_ORDER.map((groupKey) => {
                const items = groupedBrands[groupKey]
                if (!items || items.length === 0) return null
                const hasSelectedInGroup = items.some((brand) => filters.brands.includes(brand.slug))
                return (
                  <details
                    key={groupKey}
                    open={hasSelectedInGroup}
                    className="group/subsection overflow-hidden rounded-xl border border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-primary)] open:border-[color:var(--color-border-accent)]"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-left marker:content-none">
                      <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-tertiary)]">
                        {BRAND_GROUP_LABELS[groupKey]}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-brand-beige-dark)] transition-transform duration-300 ease-out group-open/subsection:rotate-180" />
                    </summary>
                    <div className="grid grid-rows-[0fr] border-t border-[color:var(--color-border-secondary)] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-open/subsection:grid-rows-[1fr]">
                      <div className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] opacity-0 -translate-y-1 group-open/subsection:translate-y-0 group-open/subsection:opacity-100">
                        <div className="grid grid-cols-1 gap-1.5 p-2.5">
                          {items.map((brand) => (
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
                )
              })}
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
            <div className="grid grid-cols-3 gap-2 p-3">
              {meta.allSizes.map((size) => (
                <label key={size} className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-2 py-1.5 text-xs text-[color:var(--color-text-secondary)]">
                  <input type="checkbox" name="size" value={size} defaultChecked={filters.sizes.includes(size)} />
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
            <div className="grid grid-cols-2 gap-2 p-3">
              {meta.allColors.map((color) => (
                <label key={color} className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-2 py-1.5 text-xs text-[color:var(--color-text-secondary)]">
                  <input type="checkbox" name="color" value={color} defaultChecked={filters.colors.includes(color)} />
                  {color}
                </label>
              ))}
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

