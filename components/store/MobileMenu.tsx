"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollToFaqLink } from "@/components/store/ScrollToFaq"

type MobileMenuProps = {
  className?: string
}

export function MobileMenu({ className }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  const menuItems = [
    { href: "/", label: "Главная" },
    { href: "/catalog", label: "Каталог" },
    { href: "/delivery", label: "Тарифы и доставка" },
    { href: "/#faq", label: "FAQ" },
    { href: "/about", label: "О нас" },
    { href: "/contacts", label: "Контакты" },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className={`store-focus inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--color-bg-primary)] text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-accent)] md:hidden ${className}`}
          aria-label="Открыть меню"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-[350px]">
        <SheetHeader>
          <SheetTitle className="text-left text-[color:var(--color-brand-forest-light)]">Меню</SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-2">
          {menuItems.map((item) => (
            item.href === "/#faq" ? (
              <ScrollToFaqLink
                key={item.href}
                onNavigate={() => setOpen(false)}
                className="store-focus rounded-lg px-4 py-3 text-base font-medium text-[color:var(--color-text-primary)] transition hover:bg-[color:var(--color-bg-accent)]"
              >
                {item.label}
              </ScrollToFaqLink>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="store-focus rounded-lg px-4 py-3 text-base font-medium text-[color:var(--color-text-primary)] transition hover:bg-[color:var(--color-bg-accent)]"
              >
                {item.label}
              </Link>
            )
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
