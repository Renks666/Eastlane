"use client"

import { useEffect } from "react"

/**
 * При обновлении страницы (F5, pull-to-refresh) — прокрутка вверх.
 * При переходе по ссылке с хешем — браузер сам прокрутит к якорю.
 * Предотвращает нежелательную прокрутку вниз на мобильных после refresh.
 */
export function ScrollRestoration() {
  useEffect(() => {
    if (typeof window === "undefined") return

    const navEntry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined
    const isReload = navEntry?.type === "reload"

    if (isReload) {
      window.scrollTo(0, 0)
    }
  }, [])
  return null
}
