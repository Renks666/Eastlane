"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import type { CartItem } from "@/components/store/cart-types"

type ContactChannel = "telegram"

type CheckoutPayload = {
  items: CartItem[]
  comment?: string
  contactChannel: ContactChannel
  contactValue?: string
}

type CheckoutResult = {
  ok: boolean
  orderId?: number
  error?: string
}

function validatePayload(payload: CheckoutPayload) {
  if (!payload.items || payload.items.length === 0) {
    throw new Error("Корзина пуста.")
  }
  if (!payload.contactChannel) {
    throw new Error("Не выбран канал связи.")
  }
}

export async function createOrder(payload: CheckoutPayload): Promise<CheckoutResult> {
  try {
    validatePayload(payload)
    const supabase = createAdminClient()

    const productIds = Array.from(new Set(payload.items.map((item) => item.id)))
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price")
      .in("id", productIds)

    if (productsError) {
      throw new Error(`Не удалось получить товары: ${productsError.message}`)
    }

    const productMap = new Map((products ?? []).map((p) => [p.id, p]))
    const normalizedItems = payload.items.map((item) => {
      const product = productMap.get(item.id)
      if (!product) {
        throw new Error(`Товар #${item.id} не найден.`)
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new Error(`Некорректное количество для товара ${product.name}.`)
      }

      const price = Number(product.price)
      return {
        product_id: product.id,
        product_name_snapshot: product.name,
        size_snapshot: item.selectedSize ?? null,
        price_snapshot: price,
        quantity: item.quantity,
        line_total: price * item.quantity,
      }
    })

    const totalAmount = normalizedItems.reduce((sum, item) => sum + item.line_total, 0)

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        contact_channel: payload.contactChannel,
        contact_value: payload.contactValue ?? null,
        comment: payload.comment?.trim() || null,
        total_amount: totalAmount,
        status: "new",
      })
      .select("id")
      .single()

    if (orderError || !order) {
      throw new Error(`Не удалось создать заказ: ${orderError?.message || "unknown error"}`)
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      normalizedItems.map((item) => ({
        order_id: order.id,
        ...item,
      }))
    )

    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id)
      throw new Error(`Не удалось сохранить товары заказа: ${itemsError.message}`)
    }

    revalidatePath("/admin/orders")
    return { ok: true, orderId: order.id }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unexpected error.",
    }
  }
}
