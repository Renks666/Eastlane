import Link from "next/link"
import { Instagram, MessageCircle, Send } from "lucide-react"
import { CartProvider } from "@/components/store/CartProvider"
import { FavoritesProvider } from "@/components/store/FavoritesProvider"
import { FloatingCart } from "@/components/store/FloatingCart"
import { StoreHeaderClient } from "@/components/store/StoreHeaderClient"
import { getStorefrontContent } from "@/src/domains/content/services/storefront-content-service"

type StoreShellProps = {
  children: React.ReactNode
}

export async function StoreShell({ children }: StoreShellProps) {
  const content = await getStorefrontContent()

  return (
    <CartProvider>
      <FavoritesProvider>
        <div className="min-h-screen bg-[color:var(--color-bg-secondary)] font-eastlane text-[color:var(--color-text-primary)]">
          <header className="sticky top-0 z-50 border-b border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/95 backdrop-blur-xl">
            <StoreHeaderClient />
          </header>

          <main className="pb-28 md:pb-0">{children}</main>
          <FloatingCart cnyPerRub={content.exchangeRate.cnyPerRub} />

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
      </FavoritesProvider>
    </CartProvider>
  )
}
