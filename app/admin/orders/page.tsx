import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { OrderStatusSelect } from "@/app/admin/orders/OrderStatusSelect"
import type { OrderStatus } from "@/app/admin/orders/actions"

type OrderItem = {
  id: number
  product_name_snapshot: string
  size_snapshot: string | null
  price_snapshot: number
  quantity: number
  line_total: number
}

type Order = {
  id: number
  created_at: string
  status: OrderStatus
  total_amount: number
  contact_channel: string
  contact_value: string | null
  comment: string | null
  order_items: OrderItem[]
}

function formatRub(price: number) {
  return new Intl.NumberFormat("ru-RU").format(price) + " ₽"
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    .from("orders")
    .select("id,created_at,status,total_amount,contact_channel,contact_value,comment,order_items(id,product_name_snapshot,size_snapshot,price_snapshot,quantity,line_total)")
    .order("created_at", { ascending: false })

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-600">Не удалось загрузить заказы: {error.message}</p>
      </div>
    )
  }

  const orders = (data ?? []) as Order[]

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Заказы</h1>
        <p className="text-sm text-muted-foreground">Управление заявками клиентов.</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          Пока нет заказов.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border bg-card p-4">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">Заказ #{order.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleString("ru-RU")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold">{formatRub(order.total_amount)}</p>
                  <OrderStatusSelect orderId={order.id} status={order.status} />
                </div>
              </div>

              <div className="mb-3 space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Канал:</span> {order.contact_channel}
                </p>
                {order.contact_value && (
                  <p>
                    <span className="text-muted-foreground">Контакт:</span> {order.contact_value}
                  </p>
                )}
                {order.comment && (
                  <p>
                    <span className="text-muted-foreground">Комментарий:</span> {order.comment}
                  </p>
                )}
              </div>

              <div className="overflow-x-auto rounded-md border">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="p-2 text-left">Товар</th>
                      <th className="p-2 text-left">Размер</th>
                      <th className="p-2 text-right">Цена</th>
                      <th className="p-2 text-right">Кол-во</th>
                      <th className="p-2 text-right">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.order_items.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-2">{item.product_name_snapshot}</td>
                        <td className="p-2">{item.size_snapshot || "-"}</td>
                        <td className="p-2 text-right">{formatRub(item.price_snapshot)}</td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">{formatRub(item.line_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
