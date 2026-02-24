"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, type ReactNode } from "react"

const HEADER_OFFSET = 92

function scrollToFaq(behavior: ScrollBehavior = "smooth") {
  const el = document.getElementById("faq")
  if (!el) return false

  const top = window.scrollY + el.getBoundingClientRect().top - HEADER_OFFSET
  window.scrollTo({ top: Math.max(0, top), behavior })
  return true
}

export function ScrollToFaqLink({
  children,
  className,
  onNavigate,
}: {
  children: ReactNode
  className?: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  const handleClick = (e: React.MouseEvent) => {
    onNavigate?.()

    if (pathname !== "/") return

    e.preventDefault()
    scrollToFaq()
    window.history.pushState(null, "", "/#faq")
  }

  return (
    <Link href="/#faq" onClick={handleClick} className={className}>
      {children}
    </Link>
  )
}

export function ScrollToFaqOnMount() {
  useEffect(() => {
    if (typeof window === "undefined" || window.location.hash !== "#faq") return

    const navEntry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined
    if (navEntry?.type === "reload") return

    // Use non-animated positioning on mount to avoid overshoot/flicker.
    requestAnimationFrame(() => {
      scrollToFaq("auto")
      requestAnimationFrame(() => {
        scrollToFaq("auto")
      })
    })
  }, [])

  return null
}
