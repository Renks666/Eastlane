import Link from "next/link"
import { Instagram, MessageCircle, Search, Send } from "lucide-react"
import { EastlaneLogo } from "@/components/store/EastlaneLogo"
import { MobileMenu } from "@/components/store/MobileMenu"
import { CartProvider } from "@/components/store/CartProvider"
import { FloatingCart } from "@/components/store/FloatingCart"

type StoreShellProps = {
  children: React.ReactNode
}

export function StoreShell({ children }: StoreShellProps) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-[color:var(--color-bg-secondary)] text-[color:var(--color-text-primary)] font-eastlane">
        <header className="sticky top-0 z-50 border-b border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/95 backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 md:px-8">
            <MobileMenu />
            <EastlaneLogo compact />
            <nav className="hidden items-center gap-6 text-sm text-[color:var(--color-text-primary)]/80 md:flex">
              <Link href="/" className="hover:text-[color:var(--color-brand-forest-light)]">Главная</Link>
              <Link href="/catalog" className="hover:text-[color:var(--color-brand-forest-light)]">Каталог</Link>
              <Link href="/delivery" className="hover:text-[color:var(--color-brand-forest-light)]">Тарифы и доставка</Link>
              <Link href="/about" className="hover:text-[color:var(--color-brand-forest-light)]">О нас</Link>
              <Link href="/contacts" className="hover:text-[color:var(--color-brand-forest-light)]">Контакты</Link>
            </nav>
            <form action="/catalog" className="ml-auto flex w-full max-w-xs items-center gap-2 rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-4 shadow-sm transition focus-within:border-[color:var(--color-brand-beige-dark)] focus-within:shadow-md md:max-w-sm">
              <Search className="h-4 w-4 text-[color:var(--color-text-placeholder)]" />
              <input
                name="q"
                placeholder="Поиск..."
                className="h-10 w-full bg-transparent text-sm text-[color:var(--color-text-primary)] placeholder:text-[color:var(--color-text-placeholder)] outline-none"
              />
            </form>
          </div>
        </header>

        <main>{children}</main>
        <FloatingCart />

        <footer className="mt-14 border-t border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/95">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 md:px-8">
            <p className="text-sm text-[color:var(--color-text-tertiary)]">EASTLANE. Одежда и обувь. Без онлайн-оплаты.</p>
            <div className="flex items-center gap-3">
              <Link href="https://instagram.com" target="_blank" className="social-btn" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </Link>
              <Link href="https://t.me" target="_blank" className="social-btn" aria-label="Telegram">
                <Send className="h-4 w-4" />
              </Link>
              <Link href="https://wa.me" target="_blank" className="social-btn" aria-label="WhatsApp">
                <MessageCircle className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  )
}
