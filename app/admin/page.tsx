import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"
import { listAdminOrders } from "@/src/domains/order/services/order-service"
import { requireAdminUserOrRedirect } from "@/src/shared/lib/auth/require-admin"

export default async function AdminPage() {
  const user = await requireAdminUserOrRedirect()
  const supabase = await createServerSupabaseClient()

  const [{ count: productsCount }, { count: categoriesCount }, orders] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    listAdminOrders().catch(() => []),
  ])

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0)
  const newOrders = orders.filter((order) => order.status === "new").length

  const statusLabels: Record<string, string> = {
    new: "Новый",
    confirmed: "Подтверждён",
    processing: "В работе",
    done: "Выполнен",
    cancelled: "Отменён",
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Обзор</h2>
        <p className="mt-1 text-sm text-muted-foreground">Вход выполнен: {user.email}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Товары</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{productsCount ?? 0}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Категории</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{categoriesCount ?? 0}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Заказы</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{orders.length}</p>
            <p className="text-xs text-muted-foreground">{newOrders} новых</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Выручка</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-price tabular-nums text-2xl font-semibold text-black">
              {new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(Math.round(totalRevenue))} ₽
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/products">Товары</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/admin/categories">Категории</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/admin/orders">Заказы</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold">Последние заказы</h3>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {orders.slice(0, 6).map((order) => (
            <Card key={order.id} className="rounded-lg border-border shadow-none">
              <CardContent className="space-y-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground">#{order.id}</p>
                  <span className="text-xs text-muted-foreground">{statusLabels[order.status] ?? order.status}</span>
                </div>
                <p className="text-sm text-muted-foreground">{order.contact_value || order.contact_channel}</p>
                <p className="font-price tabular-nums text-right text-sm font-semibold text-black">
                  {new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(Math.round(Number(order.total_amount)))} ₽
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Контакт</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map((order) => (
                <tr key={order.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">#{order.id}</td>
                  <td className="px-4 py-3">{statusLabels[order.status] ?? order.status}</td>
                  <td className="px-4 py-3 text-muted-foreground">{order.contact_value || order.contact_channel}</td>
                  <td className="font-price tabular-nums px-4 py-3 text-right font-medium text-black">
                    {new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(Math.round(Number(order.total_amount)))} ₽
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
