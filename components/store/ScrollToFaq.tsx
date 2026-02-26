"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, type ReactNode } from "react"

const HEADER_OFFSET = 92
const PENDING_FAQ_SCROLL_KEY = "eastlane:pending-faq-scroll"
const PENDING_FAQ_SCROLL_MODE_KEY = "eastlane:pending-faq-scroll-mode"
const MAX_SCROLL_ATTEMPTS = 24

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

    if (pathname !== "/") {
      e.preventDefault()
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(PENDING_FAQ_SCROLL_KEY, "1")
          window.sessionStorage.setItem(PENDING_FAQ_SCROLL_MODE_KEY, "smooth")
        } catch {
          // ignore
        }
        // Navigate to home without hash to avoid native anchor jump/flicker.
        window.location.assign("/")
      }
      return
    }

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
    if (typeof window === "undefined") return

    const navEntry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined
    if (navEntry?.type === "reload") return

    const hasHashTarget = window.location.hash === "#faq"
    let hasPendingFlag = false
    let pendingMode: ScrollBehavior = "auto"
    try {
      hasPendingFlag = window.sessionStorage.getItem(PENDING_FAQ_SCROLL_KEY) === "1"
      pendingMode = window.sessionStorage.getItem(PENDING_FAQ_SCROLL_MODE_KEY) === "smooth" ? "smooth" : "auto"
    } catch {
      hasPendingFlag = false
      pendingMode = "auto"
    }

    if (!hasHashTarget && !hasPendingFlag) return

    let attempts = 0
    const behavior: ScrollBehavior = hasPendingFlag ? pendingMode : "auto"
    const tryScroll = () => {
      const didScroll = scrollToFaq(behavior)
      if (didScroll || attempts >= MAX_SCROLL_ATTEMPTS) {
        try {
          window.sessionStorage.removeItem(PENDING_FAQ_SCROLL_KEY)
          window.sessionStorage.removeItem(PENDING_FAQ_SCROLL_MODE_KEY)
        } catch {
          // ignore
        }
        if (didScroll && window.location.hash !== "#faq") {
          window.history.replaceState(null, "", "/#faq")
        }
        return
      }
      attempts += 1
      requestAnimationFrame(tryScroll)
    }

    requestAnimationFrame(tryScroll)
  }, [])

  return null
}
