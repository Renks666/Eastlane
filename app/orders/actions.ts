"use server"

import { revalidatePath } from "next/cache"
import type { CartItem } from "@/components/store/cart-types"
import { createOrderFromCart } from "@/src/domains/order/services/order-service"
import type { ContactChannel } from "@/src/domains/order/types"
import { logger } from "@/src/shared/lib/logger"
import { toActionError } from "@/src/shared/lib/action-result"

type CheckoutPayload = {
  items: CartItem[]
  comment?: string
  customerName: string
  contactChannel: ContactChannel
  contactValue: string
}

type CheckoutResult = {
  ok: boolean
  orderId?: number
  error?: string
}

export async function createOrder(payload: CheckoutPayload): Promise<CheckoutResult> {
  try {
    const orderId = await createOrderFromCart({
      items: payload.items,
      comment: payload.comment,
      customerName: payload.customerName,
      contactChannel: payload.contactChannel,
      contactValue: payload.contactValue,
    })

    revalidatePath("/admin/orders")
    return { ok: true, orderId }
  } catch (error) {
    logger.error("orders.createOrder", "Checkout failed", error)
    return {
      ok: false,
      error: toActionError(error),
    }
  }
}

