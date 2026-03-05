"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { FavoriteItem } from "@/components/store/favorite-types"

type FavoritesContextValue = {
  items: FavoriteItem[]
  isHydrated: boolean
  favoritesCount: number
  hasItem: (productId: number) => boolean
  toggleItem: (item: FavoriteItem) => void
  removeItem: (productId: number) => void
  clear: () => void
}

const FAVORITES_STORAGE_KEY = "eastlane-favorites-v1"
const FavoritesContext = createContext<FavoritesContextValue | null>(null)

function isValidFavoriteItem(value: unknown): value is FavoriteItem {
  if (!value || typeof value !== "object") return false

  const candidate = value as Partial<FavoriteItem>
  return (
    typeof candidate.id === "number" &&
    Number.isFinite(candidate.id) &&
    typeof candidate.name === "string" &&
    candidate.name.length > 0 &&
    typeof candidate.price === "number" &&
    Number.isFinite(candidate.price) &&
    (candidate.priceCurrency === "RUB" || candidate.priceCurrency === "CNY")
  )
}

type FavoritesProviderProps = {
  children: React.ReactNode
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [items, setItems] = useState<FavoriteItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY)
      if (!raw) {
        setItems([])
      } else {
        const parsed = JSON.parse(raw) as unknown
        if (Array.isArray(parsed)) {
          setItems(parsed.filter(isValidFavoriteItem))
        } else {
          setItems([])
        }
      }
    } catch {
      setItems([])
    } finally {
      setIsHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items))
  }, [isHydrated, items])

  const favoritesCount = items.length

  const hasItem = useCallback(
    (productId: number) => items.some((item) => item.id === productId),
    [items]
  )

  const toggleItem = useCallback((item: FavoriteItem) => {
    setItems((prev) => {
      const exists = prev.some((favorite) => favorite.id === item.id)
      if (exists) {
        return prev.filter((favorite) => favorite.id !== item.id)
      }

      return [item, ...prev]
    })
  }, [])

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((item) => item.id !== productId))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<FavoritesContextValue>(
    () => ({
      items,
      isHydrated,
      favoritesCount,
      hasItem,
      toggleItem,
      removeItem,
      clear,
    }),
    [clear, favoritesCount, hasItem, isHydrated, items, removeItem, toggleItem]
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider")
  }
  return context
}
