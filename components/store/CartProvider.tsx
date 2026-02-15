"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { CartItem } from "@/components/store/cart-types"

type AddToCartInput = Omit<CartItem, "quantity" | "lineId">

type CartContextValue = {
  items: CartItem[]
  total: number
  addItem: (item: AddToCartInput, quantity?: number) => void
  removeItem: (lineId: string) => void
  increment: (lineId: string) => void
  decrement: (lineId: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)
const CART_STORAGE_KEY = "eastlane-cart-v1"

function buildLineId(productId: number, selectedSize?: string, selectedColor?: string) {
  return `${productId}::${selectedSize || "nosize"}::${selectedColor || "nocolor"}`
}

type CartProviderProps = {
  children: React.ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isStorageReady, setIsStorageReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY)
      if (!raw) {
        setItems([])
      } else {
        const parsed = JSON.parse(raw) as CartItem[]
        if (Array.isArray(parsed)) {
          setItems(
            parsed.filter(
              (item) =>
                item &&
                typeof item.id === "number" &&
                typeof item.lineId === "string" &&
                item.quantity > 0
            )
          )
        } else {
          setItems([])
        }
      }
    } catch {
      setItems([])
    } finally {
      setIsStorageReady(true)
    }
  }, [])

  useEffect(() => {
    if (!isStorageReady) return
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items, isStorageReady])

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )

  const addItem = (item: AddToCartInput, quantity = 1) => {
    setItems((prev) => {
      const lineId = buildLineId(item.id, item.selectedSize, item.selectedColor)
      const existing = prev.find((p) => p.lineId === lineId)
      if (existing) {
        return prev.map((p) =>
          p.lineId === lineId ? { ...p, quantity: p.quantity + quantity } : p
        )
      }
      return [...prev, { ...item, lineId, quantity }]
    })
  }

  const removeItem = (lineId: string) => {
    setItems((prev) => prev.filter((item) => item.lineId !== lineId))
  }

  const increment = (lineId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.lineId === lineId ? { ...item, quantity: item.quantity + 1 } : item
      )
    )
  }

  const decrement = (lineId: string) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.lineId === lineId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const clear = () => setItems([])

  return (
    <CartContext.Provider
      value={{ items, total, addItem, removeItem, increment, decrement, clear }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
