"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Image from "next/image"
import { ChevronDown, ChevronUp, Loader2, Minus, Plus, Send, ShoppingCart, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useCart } from "@/components/store/CartProvider"
import { createOrder } from "@/app/orders/actions"

function formatRub(price: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(Math.round(price)) + " ₽"
}

export function FloatingCart() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [contactChannel, setContactChannel] = useState<"telegram" | "phone">("telegram")
  const [contactValue, setContactValue] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [isPending, startTransition] = useTransition()
  const { items, total, increment, decrement, removeItem, clear } = useCart()

  const itemsCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  useEffect(() => {
    const handleCartOpen = () => setIsOpen(true)
    window.addEventListener("cart:open", handleCartOpen)
    return () => window.removeEventListener("cart:open", handleCartOpen)
  }, [])

  const submitOrder = () => {
    startTransition(async () => {
      const result = await createOrder({
        items,
        comment: "",
        customerName: customerName.trim(),
        contactChannel,
        contactValue: contactValue.trim(),
      })

      if (!result.ok) {
        toast.error(result.error ?? "Не удалось оформить заказ.")
        return
      }

      toast.success(`Заказ #${result.orderId} оформлен`)
      clear()
      setIsCheckoutOpen(false)
      setIsOpen(false)
      setCustomerName("")
      setContactValue("")
      setContactChannel("telegram")

      const telegramUrl = "https://t.me/fearr666"
      if (contactChannel === "telegram") {
        window.open(telegramUrl, "_blank", "noopener,noreferrer")
      }
    })
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-[420px] sm:w-[390px]">
      <div className="rounded-2xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] text-[color:var(--color-text-primary)] shadow-2xl max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-[color:var(--color-bg-accent)]"
            aria-label="Открыть корзину"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-bg-image)]">
                <ShoppingCart className="h-5 w-5 text-[color:var(--color-brand-forest)]" />
              </span>
              <span className="text-sm text-[color:var(--color-text-secondary)]" suppressHydrationWarning>
                Корзина{itemsCount > 0 ? ` (${itemsCount})` : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-price tabular-nums text-base font-semibold text-black" suppressHydrationWarning>{formatRub(total)}</span>
              <ChevronUp className="h-4 w-4 text-[color:var(--color-text-tertiary)]" />
            </div>
          </button>
        )}

        {isOpen && (
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[color:var(--color-brand-forest-light)]">Корзина</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-[color:var(--color-bg-image)]"
                aria-label="Свернуть корзину"
              >
                <ChevronDown className="h-5 w-5 text-[color:var(--color-text-tertiary)]" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="mb-4 rounded-xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-tertiary)] p-4 text-sm text-[color:var(--color-text-secondary)]">
                Ваша корзина пуста. Добавьте товары из каталога.
              </div>
            ) : (
              <div className="mb-4 max-h-[400px] space-y-3 overflow-auto pr-1">
                {items.map((item) => (
                  <div key={item.lineId} className="rounded-xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-tertiary)] p-3">
                    <div className="flex gap-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-md bg-[color:var(--color-bg-image)]">
                        <Image
                          src={item.image || "https://placehold.co/300x300/1a3d31/e7dcc6?text=E"}
                          alt={item.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[color:var(--color-text-primary)]">{item.name}</p>
                        {item.selectedSize ? (
                          <p className="text-xs text-[color:var(--color-text-secondary)]">Размер: {item.selectedSize}</p>
                        ) : item.sizes && item.sizes.length > 0 ? (
                          <p className="text-xs text-[color:var(--color-text-secondary)]">Размеры: {item.sizes.join(", ")}</p>
                        ) : null}
                        {item.selectedColor ? (
                          <p className="text-xs text-[color:var(--color-text-secondary)]">Цвет: {item.selectedColor}</p>
                        ) : item.colors && item.colors.length > 0 ? (
                          <p className="text-xs text-[color:var(--color-text-secondary)]">Цвета: {item.colors.join(", ")}</p>
                        ) : null}
                        <p className="font-price tabular-nums mt-1 text-sm font-semibold text-black">
                          {formatRub(item.price * item.quantity)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.lineId)}
                        className="self-start rounded-md p-1.5 text-[color:var(--color-text-tertiary)] transition hover:bg-[color:var(--color-bg-image)] hover:text-[color:var(--color-brand-beige-dark)]"
                        aria-label={`Удалить ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => decrement(item.lineId)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[color:var(--color-border-primary)] text-[color:var(--color-text-primary)] transition hover:bg-[color:var(--color-bg-image)]"
                        aria-label={`Уменьшить количество ${item.name}`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold text-[color:var(--color-text-primary)]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => increment(item.lineId)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[color:var(--color-border-primary)] text-[color:var(--color-text-primary)] transition hover:bg-[color:var(--color-bg-image)]"
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
                className="rounded-md border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-2.5 py-1 text-xs text-[color:var(--color-text-secondary)] transition hover:bg-[color:var(--color-bg-accent)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Очистить корзину
              </button>
            </div>

            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-[color:var(--color-text-secondary)]">Заказ на сумму</span>
              <span className="font-price tabular-nums text-lg font-bold text-black" suppressHydrationWarning>{formatRub(total)}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full rounded-xl bg-[color:var(--color-brand-forest)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-forest-dark)]"
            >
              Оформить заказ
            </button>
          </div>
        )}
      </div>

      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] p-5 text-[color:var(--color-text-primary)] shadow-2xl">
            <h4 className="text-lg font-semibold text-[color:var(--color-brand-forest-light)]">Выберите удобный способ связи</h4>
            <p className="mt-2 text-sm text-[color:var(--color-text-tertiary)]">
              Мы свяжемся с вами для подтверждения заказа и деталей.
            </p>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Ваше имя"
                className="h-10 w-full rounded-xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-3 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-brand-beige-dark)]"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setContactChannel("telegram")}
                  className={`rounded-xl border px-3 py-2 text-sm transition ${contactChannel === "telegram" ? "border-[color:var(--color-brand-beige-dark)] bg-[color:var(--color-bg-tertiary)] text-[color:var(--color-brand-forest-light)]" : "border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] text-[color:var(--color-text-tertiary)]"}`}
                >
                  Telegram
                </button>
                <button
                  type="button"
                  onClick={() => setContactChannel("phone")}
                  className={`rounded-xl border px-3 py-2 text-sm transition ${contactChannel === "phone" ? "border-[color:var(--color-brand-beige-dark)] bg-[color:var(--color-bg-tertiary)] text-[color:var(--color-brand-forest-light)]" : "border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] text-[color:var(--color-text-tertiary)]"}`}
                >
                  Телефон
                </button>
              </div>

              <input
                type="text"
                value={contactValue}
                onChange={(event) => setContactValue(event.target.value)}
                placeholder={contactChannel === "telegram" ? "@username или t.me/..." : "+7 (900) 000-00-00"}
                className="h-10 w-full rounded-xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-3 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-brand-beige-dark)]"
              />
            </div>

            <button
              type="button"
              onClick={submitOrder}
              disabled={isPending || items.length === 0 || !contactValue.trim() || !customerName.trim()}
              className="mt-5 flex w-full items-center gap-3 rounded-xl bg-[color:var(--color-brand-forest)] p-3 text-left transition hover:bg-[color:var(--color-brand-forest-dark)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white">
                {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </span>
              <span className="text-sm font-semibold text-white">
                {isPending ? "Отправка заказа..." : "Подтвердить заказ"}
              </span>
            </button>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="w-full rounded-xl border border-[color:var(--color-border-primary)] px-4 py-2.5 text-sm text-[color:var(--color-text-tertiary)] transition hover:bg-[color:var(--color-bg-accent)]"
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
