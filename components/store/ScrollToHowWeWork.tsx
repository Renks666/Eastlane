"use client"

import { useEffect, type ReactNode } from "react"

const HEADER_HEIGHT = 80 // sticky header h-20 ≈ 80px
const CART_BAR_HEIGHT = 64 // свёрнутая панель корзины на мобильном

function scrollToHowWeWork() {
  const el = document.getElementById("how-we-work")
  if (!el) return
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  if (isMobile) {
    // Центрируем блок между хедером и корзиной, чтобы корзина не накладывалась на рамку
    const rect = el.getBoundingClientRect()
    const visibleTop = HEADER_HEIGHT
    const visibleBottom = window.innerHeight - CART_BAR_HEIGHT
    const visibleCenter = visibleTop + (visibleBottom - visibleTop) / 2
    const desiredTop = visibleCenter - rect.height / 2
    const scrollDelta = rect.top - desiredTop
    window.scrollTo({ top: Math.max(0, window.scrollY + scrollDelta), behavior: "smooth" })
  } else {
    el.scrollIntoView({ block: "center", behavior: "smooth" })
  }
}

export function ScrollToHowWeWorkLink({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    scrollToHowWeWork()
    window.history.pushState(null, "", "/#how-we-work")
  }

  return (
    <a href="/#how-we-work" onClick={handleClick} className={className}>
      {children}
    </a>
  )
}

/** Начальная прокрутка при переходе с другой страницы с хешем #how-we-work. При refresh — не прокручиваем (страница вверху). */
export function ScrollToHowWeWorkOnMount() {
  useEffect(() => {
    if (typeof window === "undefined" || window.location.hash !== "#how-we-work") return

    const navEntry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined
    if (navEntry?.type === "reload") return // при обновлении — не трогаем, ScrollRestoration скроллит вверх

    scrollToHowWeWork()
  }, [])
  return null
}
