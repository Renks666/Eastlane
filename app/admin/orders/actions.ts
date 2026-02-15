"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type ActionResult = {
  ok: boolean
  error?: string
}

const ALLOWED_STATUSES = ["new", "confirmed", "processing", "done", "cancelled"] as const
type OrderStatus = (typeof ALLOWED_STATUSES)[number]

async function requireAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Unauthorized.")
  }
}

export async function updateOrderStatus(orderId: number, status: OrderStatus): Promise<ActionResult> {
  try {
    await requireAuthenticatedUser()
    if (!Number.isInteger(orderId) || orderId <= 0) {
      throw new Error("Invalid order ID.")
    }
    if (!ALLOWED_STATUSES.includes(status)) {
      throw new Error("Invalid status.")
    }

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)

    if (error) {
      throw new Error(`Failed to update order status: ${error.message}`)
    }

    revalidatePath("/admin/orders")
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unexpected error.",
    }
  }
}

export { ALLOWED_STATUSES }
export type { OrderStatus }
