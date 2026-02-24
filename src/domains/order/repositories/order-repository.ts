import type { SupabaseClient } from "@supabase/supabase-js"
import type { AdminOrderListItem, ContactChannel, OrderItemRecord, OrderStatus } from "@/src/domains/order/types"

export async function fetchProductsForCheckout(supabase: SupabaseClient, productIds: number[]) {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, price_currency")
    .in("id", productIds)

  if (error) {
    throw new Error(`Не удалось получить товары: ${error.message}`)
  }

  return data ?? []
}

export async function insertOrder(
  supabase: SupabaseClient,
  payload: {
    contactChannel: ContactChannel
    contactValue: string
    comment?: string
    customerName: string
    totalAmount: number
    totalCurrency: "RUB" | "CNY"
    exchangeRateSnapshot: number
    totalAmountRubApprox: number
  }
) {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      contact_channel: payload.contactChannel,
      contact_value: payload.contactValue,
      customer_name: payload.customerName.trim(),
      comment: payload.comment?.trim() || null,
      total_amount: payload.totalAmount,
      total_currency: payload.totalCurrency,
      exchange_rate_snapshot: payload.exchangeRateSnapshot,
      total_amount_rub_approx: payload.totalAmountRubApprox,
      status: "new",
    })
    .select("id")
    .single()

  if (error || !data) {
    throw new Error(`Не удалось создать заказ: ${error?.message || "unknown error"}`)
  }

  return data.id as number
}

export async function insertOrderItems(supabase: SupabaseClient, orderId: number, items: OrderItemRecord[]) {
  const { error } = await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: orderId,
      ...item,
    }))
  )

  if (error) {
    throw new Error(`Не удалось сохранить товары заказа: ${error.message}`)
  }
}

export async function deleteOrderById(supabase: SupabaseClient, orderId: number) {
  await supabase.from("orders").delete().eq("id", orderId)
}

export async function fetchAdminOrders(supabase: SupabaseClient): Promise<AdminOrderListItem[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id,created_at,status,total_amount,total_currency,exchange_rate_snapshot,total_amount_rub_approx,contact_channel,contact_value,comment,customer_name,order_items(id,product_name_snapshot,size_snapshot,price_snapshot,price_currency_snapshot,quantity,line_total,line_total_rub_approx)"
    )
    .not("customer_name", "is", null)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Не удалось загрузить заказы: ${error.message}`)
  }

  return ((data ?? []) as AdminOrderListItem[]).filter(
    (order) => Boolean(order.customer_name && order.customer_name.trim())
  )
}

export async function updateAdminOrderStatus(supabase: SupabaseClient, orderId: number, status: OrderStatus) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId)
  if (error) {
    throw new Error(`Failed to update order status: ${error.message}`)
  }
}

