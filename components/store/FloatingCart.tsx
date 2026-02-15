"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Image from "next/image"
import { ChevronDown, ChevronUp, Minus, Plus, Send, ShoppingCart, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useCart } from "@/components/store/CartProvider"
import { createOrder } from "@/app/orders/actions"

function formatRub(price: number) {
  return new Intl.NumberFormat("ru-RU").format(price) + " ₽"
}

export function FloatingCart() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { items, total, increment, decrement, removeItem, clear } = useCart()

  const itemsCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  useEffect(() => {
    const handleCartItemAdded = () => setIsOpen(true)
    window.addEventListener("cart:item-added", handleCartItemAdded)
    return () => window.removeEventListener("cart:item-added", handleCartItemAdded)
  }, [])

  const submitOrder = () => {
    startTransition(async () => {
      const result = await createOrder({
        items,
        comment: "",
        contactChannel: "telegram",
      })

      if (!result.ok) {
        toast.error(result.error ?? "Не удалось оформить заказ.")
        return
      }

      toast.success(`Заказ #${result.orderId} оформлен`)
      clear()
      setIsCheckoutOpen(false)
      setIsOpen(false)

      const telegramUrl = "https://t.me/fearr666"
      window.open(telegramUrl, "_blank", "noopener,noreferrer")
    })
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] sm:w-[390px]">
      <div className="rounded-2xl border border-[#d8cfb7] bg-white text-[#0f1720] shadow-2xl">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-[#f7f4ea]"
            aria-label="Открыть корзину"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#eef4f1]">
                <ShoppingCart className="h-5 w-5 text-[#0f5a49]" />
              </span>
              <span className="text-sm text-[#5f6e65]" suppressHydrationWarning>
                Корзина{itemsCount > 0 ? ` (${itemsCount})` : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-[#0f3f33]" suppressHydrationWarning>{formatRub(total)}</span>
              <ChevronUp className="h-4 w-4 text-[#7f8e85]" />
            </div>
          </button>
        )}

        {isOpen && (
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#0f3f33]">Корзина</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-[#f1f5f3]"
                aria-label="Свернуть корзину"
              >
                <ChevronDown className="h-5 w-5 text-[#7f8e85]" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="mb-4 rounded-xl border border-[#d8cfb7] bg-[#faf8f2] p-4 text-sm text-[#5f6e65]">
                Ваша корзина пуста. Добавьте товары из каталога.
              </div>
            ) : (
              <div className="mb-4 max-h-[240px] space-y-3 overflow-auto pr-1">
                {items.map((item) => (
                  <div key={item.lineId} className="rounded-xl border border-[#d8cfb7] bg-[#faf8f2] p-3">
                    <div className="flex gap-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-md bg-[#eef4f1]">
                        <Image
                          src={item.image || "https://placehold.co/300x300/1a3d31/e7dcc6?text=E"}
                          alt={item.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#0f1720]">{item.name}</p>
                        {item.selectedSize ? (
                          <p className="text-xs text-[#5f6e65]">Размер: {item.selectedSize}</p>
                        ) : item.sizes && item.sizes.length > 0 ? (
                          <p className="text-xs text-[#5f6e65]">Размеры: {item.sizes.join(", ")}</p>
                        ) : null}
                        {item.selectedColor ? (
                          <p className="text-xs text-[#5f6e65]">Цвет: {item.selectedColor}</p>
                        ) : item.colors && item.colors.length > 0 ? (
                          <p className="text-xs text-[#5f6e65]">Цвета: {item.colors.join(", ")}</p>
                        ) : null}
                        <p className="mt-1 text-sm font-semibold text-[#b29152]">
                          {formatRub(item.price * item.quantity)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.lineId)}
                        className="self-start rounded-md p-1.5 text-[#7f8e85] transition hover:bg-[#eef4f1] hover:text-[#b29152]"
                        aria-label={`Удалить ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => decrement(item.lineId)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d8cfb7] text-[#0f1720] transition hover:bg-[#eef4f1]"
                        aria-label={`Уменьшить количество ${item.name}`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold text-[#0f1720]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => increment(item.lineId)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d8cfb7] text-[#0f1720] transition hover:bg-[#eef4f1]"
                        aria-label={`Увеличить количество ${item.name}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={clear}
                disabled={items.length === 0}
                className="rounded-md border border-[#d8cfb7] bg-white px-2.5 py-1 text-xs text-[#5f6e65] transition hover:bg-[#f7f4ea] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Очистить корзину
              </button>
            </div>

            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-[#5f6e65]">Заказ на сумму</span>
              <span className="text-lg font-bold text-[#0f3f33]" suppressHydrationWarning>{formatRub(total)}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full rounded-xl bg-[#0f5a49] px-4 py-3 text-sm font-semibold text-[#f2ece0] transition hover:bg-[#0b4a3c]"
            >
              Оформить заказ
            </button>
          </div>
        )}
      </div>

      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#d8cfb7] bg-white p-5 text-[#0f1720] shadow-2xl">
            <h4 className="text-lg font-semibold text-[#0f3f33]">Выберите удобный способ связи</h4>
            <p className="mt-2 text-sm text-[#5f6e65]">
              Мы свяжемся с вами для подтверждения заказа и деталей.
            </p>

            <button
              type="button"
              onClick={submitOrder}
              disabled={isPending || items.length === 0}
              className="mt-5 flex w-full items-center gap-3 rounded-xl border border-[#d8cfb7] bg-[#faf8f2] p-3 text-left transition hover:border-[#b29152] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#b29152] text-white">
                <Send className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">Напишите нам в Telegram</span>
            </button>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="w-full rounded-xl border border-[#d8cfb7] px-4 py-2.5 text-sm text-[#5f6e65] transition hover:bg-[#f7f4ea]"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
