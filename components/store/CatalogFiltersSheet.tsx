"use client"

import type { ReactNode } from "react"
import { SlidersHorizontal } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

type CatalogFiltersSheetProps = {
  children: ReactNode
}

export function CatalogFiltersSheet({ children }: CatalogFiltersSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="store-focus inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-4 text-sm font-medium text-[color:var(--color-brand-forest-light)] transition hover:bg-[color:var(--color-bg-accent)] lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Фильтры
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[92vw] max-w-[420px] overflow-y-auto p-0">
        <SheetHeader className="border-b border-[color:var(--color-border-primary)] px-4 py-3">
          <SheetTitle className="text-left text-[color:var(--color-brand-forest-light)]">Фильтры</SheetTitle>
        </SheetHeader>
        <div className="p-4">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
