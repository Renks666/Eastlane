import { createAdminClient } from "@/src/shared/lib/supabase/admin"
import {
  deleteOrderById,
  fetchAdminOrders,
  fetchProductsForCheckout,
  insertOrder,
  insertOrderItems,
  updateAdminOrderStatus,
} from "@/src/domains/order/repositories/order-repository"
import { buildOrderItems, validateCheckoutPayload } from "@/src/domains/order/services/checkout-service"
import { ORDER_STATUSES, type CheckoutPayload, type OrderStatus } from "@/src/domains/order/types"

export async function createOrderFromCart(payload: CheckoutPayload) {
  validateCheckoutPayload(payload)

  const supabase = createAdminClient()
  const productIds = Array.from(new Set(payload.items.map((item) => item.id)))
  const products = await fetchProductsForCheckout(supabase, productIds)
  const { normalizedItems, totalAmount } = buildOrderItems(payload, products)

  const orderId = await insertOrder(supabase, {
    contactChannel: payload.contactChannel,
    contactValue: payload.contactValue,
    customerName: payload.customerName,
    comment: payload.comment,
    totalAmount,
  })

  try {
    await insertOrderItems(supabase, orderId, normalizedItems)
  } catch (error) {
    await deleteOrderById(supabase, orderId)
    throw error
  }

  return orderId
}

export async function listAdminOrders() {
  const supabase = createAdminClient()
  const orders = await fetchAdminOrders(supabase)
  return orders.filter((order) => Boolean(order.customer_name && order.customer_name.trim()))
}

export async function changeAdminOrderStatus(orderId: number, status: OrderStatus) {
  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw new Error("Invalid order ID.")
  }

  if (!ORDER_STATUSES.includes(status)) {
    throw new Error("Invalid status.")
  }

  const supabase = createAdminClient()
  await updateAdminOrderStatus(supabase, orderId, status)
}

