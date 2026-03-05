import { Heart } from "lucide-react"
import { StoreShell } from "@/components/store/StoreShell"
import { FavoritesPageClient } from "@/components/store/FavoritesPageClient"

export default function FavoritesPage() {
  return (
    <StoreShell>
      <section className="store-section pb-14 pt-8 md:pt-10">
        <div className="mb-5 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] text-[color:var(--color-brand-forest-light)]">
            <Heart className="h-4 w-4" />
          </span>
          <div>
            <h1 className="text-3xl font-semibold text-[color:var(--color-brand-forest)] md:text-4xl">Избранное</h1>
            <p className="mt-1 text-sm text-[color:var(--color-text-tertiary)]">
              Сохраненные товары EASTLANE.
            </p>
          </div>
        </div>
        <FavoritesPageClient />
      </section>
    </StoreShell>
  )
}
