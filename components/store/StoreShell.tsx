import Link from "next/link"
import { Instagram, MessageCircle, Send } from "lucide-react"
import { EastlaneLogo } from "@/components/store/EastlaneLogo"
import { CartProvider } from "@/components/store/CartProvider"
import { FloatingCart } from "@/components/store/FloatingCart"

type StoreShellProps = {
  children: React.ReactNode
}

export function StoreShell({ children }: StoreShellProps) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-[#f6f6f4] text-[#0f1720] font-eastlane">
        <header className="sticky top-0 z-50 border-b border-[#d8cfb7] bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 md:px-8">
            <EastlaneLogo compact />
            <nav className="hidden items-center gap-6 text-sm text-[#0f1720]/80 md:flex">
              <Link href="/" className="hover:text-[#0f3f33]">Главная</Link>
              <Link href="/catalog" className="hover:text-[#0f3f33]">Каталог</Link>
              <Link href="/about" className="hover:text-[#0f3f33]">О нас</Link>
              <Link href="/contacts" className="hover:text-[#0f3f33]">Контакты</Link>
            </nav>
            <form action="/catalog" className="ml-auto flex w-full max-w-xs items-center rounded-full border border-[#dedad0] bg-white px-3 md:max-w-sm">
              <input
                name="q"
                placeholder="Поиск одежды и обуви"
                className="h-10 w-full bg-transparent text-sm text-[#0f1720] placeholder:text-[#99a198] outline-none"
              />
            </form>
          </div>
        </header>

        <main>{children}</main>
        <FloatingCart />

        <footer className="mt-14 border-t border-[#d8cfb7] bg-white/95">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 md:px-8">
            <p className="text-sm text-[#5f6e65]">EASTLANE. Одежда и обувь. Без онлайн-оплаты.</p>
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
