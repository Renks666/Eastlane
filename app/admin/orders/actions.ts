"use server"

import { revalidatePath } from "next/cache"
import { changeAdminOrderStatus } from "@/src/domains/order/services/order-service"
import type { OrderStatus } from "@/src/domains/order/types"
import { requireAdminUser } from "@/src/shared/lib/auth/require-admin"
import { logger } from "@/src/shared/lib/logger"
import { toActionError } from "@/src/shared/lib/action-result"

type ActionResult = {
  ok: boolean
  error?: string
}

export async function updateOrderStatus(orderId: number, status: OrderStatus): Promise<ActionResult> {
  try {
    await requireAdminUser()
    await changeAdminOrderStatus(orderId, status)

    revalidatePath("/admin/orders")
    return { ok: true }
  } catch (error) {
    logger.error("admin.orders.updateStatus", "Failed to update status", { orderId, status, error })
    return {
      ok: false,
      error: toActionError(error),
    }
  }
}

