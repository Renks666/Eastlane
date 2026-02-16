export const ORDER_STATUSES = ["new", "confirmed", "processing", "done", "cancelled"] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const CONTACT_CHANNELS = ["telegram", "phone"] as const
export type ContactChannel = (typeof CONTACT_CHANNELS)[number]

export type CheckoutPayload = {
  items: {
    id: number
    quantity: number
    selectedSize?: string
  }[]
  comment?: string
  customerName: string
  contactChannel: ContactChannel
  contactValue: string
}

export type CheckoutResult = {
  ok: boolean
  orderId?: number
  error?: string
}

export type OrderItemRecord = {
  product_id: number
  product_name_snapshot: string
  size_snapshot: string | null
  price_snapshot: number
  quantity: number
  line_total: number
}

export type AdminOrderListItem = {
  id: number
  created_at: string
  status: OrderStatus
  total_amount: number
  contact_channel: ContactChannel
  contact_value: string | null
  comment: string | null
  customer_name: string | null
  order_items: {
    id: number
    product_name_snapshot: string
    size_snapshot: string | null
    price_snapshot: number
    quantity: number
    line_total: number
  }[]
}

