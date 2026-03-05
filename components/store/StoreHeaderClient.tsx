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
  const [isScrolled, setIsScrolled] = useState(false)
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

  useEffect(() => {
    let frame = 0

    const syncScrolled = () => {
      frame = 0
      const next = window.scrollY > 8
      setIsScrolled((prev) => (prev === next ? prev : next))
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(syncScrolled)
    }

    syncScrolled()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  const openCart = () => {
    window.dispatchEvent(new CustomEvent("cart:open"))
  }

  const mobileIconButtonSize = isScrolled ? "h-9 w-9" : "h-10 w-10"
  const mobileHeaderHeight = isScrolled ? "h-[68px]" : "h-20"

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <div
        data-testid="mobile-header-row"
        className={`relative flex items-center gap-2 transition-[height,padding] duration-200 ease-out md:h-20 md:gap-4 ${mobileHeaderHeight}`}
      >
        <div className="flex shrink-0 items-center gap-1 md:hidden">
          <MobileMenu
            className={`${mobileIconButtonSize} !border-0 !bg-transparent hover:!bg-[color:var(--color-bg-accent)]`}
          />
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen((prev) => !prev)}
            className={`store-focus inline-flex items-center justify-center rounded-lg border-0 bg-transparent text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-accent)] md:h-10 md:w-10 ${mobileIconButtonSize}`}
            aria-label={isMobileSearchOpen ? "Скрыть поиск" : "Открыть поиск"}
            aria-expanded={isMobileSearchOpen}
            data-testid="mobile-search-toggle"
          >
            {isMobileSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </button>
        </div>

        <div
          className={`absolute left-1/2 z-10 min-w-0 -translate-x-1/2 transition-transform duration-200 ease-out md:static md:left-auto md:translate-x-0 md:shrink-0 ${isScrolled ? "max-md:scale-95" : ""}`}
        >
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
            className={`store-focus relative inline-flex items-center justify-center rounded-lg border-0 bg-transparent text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-accent)] md:h-10 md:w-10 md:border md:border-[color:var(--color-border-primary)] md:bg-[color:var(--color-bg-primary)] ${mobileIconButtonSize}`}
            aria-label="Открыть избранное"
            data-testid="mobile-favorites-link"
          >
            <Heart className="h-4 w-4" />
            {isFavoritesHydrated && favoritesCount > 0 ? <CountBadge count={favoritesCount} /> : null}
          </Link>

          <button
            type="button"
            onClick={openCart}
            className={`store-focus relative inline-flex items-center justify-center rounded-lg border-0 bg-transparent text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-accent)] md:h-10 md:w-10 md:border md:border-[color:var(--color-border-primary)] md:bg-[color:var(--color-bg-primary)] ${mobileIconButtonSize}`}
            aria-label="Открыть корзину"
            data-testid="mobile-cart-toggle"
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
