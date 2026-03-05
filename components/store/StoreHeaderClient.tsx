"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Heart, Search, ShoppingCart, X } from "lucide-react"
import { EastlaneLogo } from "@/components/store/EastlaneLogo"
import { MobileMenu } from "@/components/store/MobileMenu"
import { ScrollToFaqLink } from "@/components/store/ScrollToFaq"
import { useCart } from "@/components/store/CartProvider"
import { useFavorites } from "@/components/store/FavoritesProvider"

function CountBadge({ count }: { count: number }) {
  return (
    <span className="absolute -right-1 -top-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[color:var(--color-brand-forest)] px-1 text-[10px] font-semibold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  )
}

export function StoreHeaderClient() {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null)
  const { items, isHydrated: isCartHydrated } = useCart()
  const { favoritesCount, isHydrated: isFavoritesHydrated } = useFavorites()

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  useEffect(() => {
    if (!isMobileSearchOpen) return
    mobileSearchInputRef.current?.focus()
  }, [isMobileSearchOpen])

  const openCart = () => {
    window.dispatchEvent(new CustomEvent("cart:open"))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <div className="flex h-20 items-center gap-2 md:gap-4">
        <div className="flex shrink-0 items-center gap-1 md:hidden">
          <MobileMenu />
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen((prev) => !prev)}
            className="store-focus inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-accent)]"
            aria-label={isMobileSearchOpen ? "Скрыть поиск" : "Открыть поиск"}
            aria-expanded={isMobileSearchOpen}
          >
            {isMobileSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </button>
        </div>

        <div className="min-w-0 shrink md:shrink-0">
          <EastlaneLogo compact className="max-w-full" />
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-6 text-sm text-[color:var(--color-text-primary)]/80 md:flex">
          <Link href="/" className="hover:text-[color:var(--color-brand-forest-light)]">Главная</Link>
          <Link href="/catalog" className="hover:text-[color:var(--color-brand-forest-light)]">Каталог</Link>
          <Link href="/delivery" className="hover:text-[color:var(--color-brand-forest-light)]">Тарифы и доставка</Link>
          <ScrollToFaqLink className="hover:text-[color:var(--color-brand-forest-light)]">FAQ</ScrollToFaqLink>
          <Link href="/about" className="hover:text-[color:var(--color-brand-forest-light)]">О нас</Link>
          <Link href="/contacts" className="hover:text-[color:var(--color-brand-forest-light)]">Контакты</Link>
        </nav>

        <form action="/catalog" className="ml-auto hidden min-w-0 flex-1 items-center gap-2 rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-4 shadow-sm transition focus-within:border-[color:var(--color-brand-beige-dark)] focus-within:shadow-md md:flex md:ml-0 md:w-full md:max-w-sm md:flex-none">
          <Search className="h-4 w-4 text-[color:var(--color-text-placeholder)]" />
          <input
            name="q"
            placeholder="Поиск: товар или бренд"
            className="h-10 w-full bg-transparent text-sm text-[color:var(--color-text-primary)] placeholder:text-[color:var(--color-text-placeholder)] outline-none"
          />
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-0 md:gap-2">
          <Link
            href="/favorites"
            className="store-focus relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-accent)]"
            aria-label="Открыть избранное"
          >
            <Heart className="h-4 w-4" />
            {isFavoritesHydrated && favoritesCount > 0 ? <CountBadge count={favoritesCount} /> : null}
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="store-focus relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-accent)]"
            aria-label="Открыть корзину"
          >
            <ShoppingCart className="h-4 w-4" />
            {isCartHydrated && cartCount > 0 ? <CountBadge count={cartCount} /> : null}
          </button>
        </div>
      </div>

      <div
        data-testid="mobile-search-panel"
        className={`overflow-hidden transition-all duration-300 ease-out md:hidden ${
          isMobileSearchOpen ? "max-h-20 pb-3 opacity-100" : "max-h-0 pb-0 opacity-0"
        }`}
      >
        <form
          action="/catalog"
          className="flex items-center gap-2 rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-4 shadow-sm transition focus-within:border-[color:var(--color-brand-beige-dark)] focus-within:shadow-md"
        >
          <Search className="h-4 w-4 text-[color:var(--color-text-placeholder)]" />
          <input
            ref={mobileSearchInputRef}
            name="q"
            placeholder="Поиск: товар или бренд"
            className="h-10 w-full bg-transparent text-sm text-[color:var(--color-text-primary)] placeholder:text-[color:var(--color-text-placeholder)] outline-none"
          />
          <button
            type="submit"
            className="store-focus rounded-full bg-[color:var(--color-brand-forest)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[color:var(--color-brand-forest-dark)]"
          >
            Найти
          </button>
        </form>
      </div>
    </div>
  )
}
