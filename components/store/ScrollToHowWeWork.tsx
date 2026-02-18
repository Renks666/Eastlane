"use client"

import { useEffect, type ReactNode } from "react"

const HEADER_HEIGHT = 80 // sticky header h-20 ≈ 80px

function scrollToHowWeWork() {
  const el = document.getElementById("how-we-work")
  if (!el) return
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  if (isMobile) {
    // Центрируем блок в видимой области под хедером, чтобы не обрезало сверху
    const rect = el.getBoundingClientRect()
    const visibleCenter = HEADER_HEIGHT + (window.innerHeight - HEADER_HEIGHT) / 2
    const desiredTop = visibleCenter - rect.height / 2
    const scrollDelta = rect.top - desiredTop
    window.scrollTo({ top: window.scrollY + scrollDelta, behavior: "smooth" })
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

/** Начальная прокрутка при загрузке с хешем #how-we-work (например, из другой страницы) */
export function ScrollToHowWeWorkOnMount() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#how-we-work") {
      scrollToHowWeWork()
    }
  }, [])
  return null
}
