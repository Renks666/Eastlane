"use client"

import { useEffect, type ReactNode } from "react"

function scrollToHowWeWork() {
  const el = document.getElementById("how-we-work")
  if (!el) return
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768
  el.scrollIntoView({
    block: isMobile ? "start" : "center",
    behavior: "smooth",
  })
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
