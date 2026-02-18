"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

type MobileMenuProps = {
  className?: string
}

export function MobileMenu({ className }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  const menuItems = [
    { href: "/", label: "Главная" },
    { href: "/catalog", label: "Каталог" },
    { href: "/about", label: "О нас" },
    { href: "/contacts", label: "Контакты" },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-accent)] md:hidden ${className}`}
              aria-label="Открыть меню"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[350px]">
            <SheetHeader>
              <SheetTitle className="text-left text-[color:var(--color-brand-forest-light)]">Меню</SheetTitle>
            </SheetHeader>
            <nav className="mt-8 flex flex-col gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-3 text-base font-medium text-[color:var(--color-text-primary)] transition hover:bg-[color:var(--color-bg-accent)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
    </Sheet>
  )
}
