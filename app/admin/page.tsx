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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Overview</h2>
        <p className="mt-1 text-sm text-muted-foreground">Signed in as {user.email}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{productsCount ?? 0}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{categoriesCount ?? 0}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{orders.length}</p>
            <p className="text-xs text-muted-foreground">{newOrders} new</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{new Intl.NumberFormat("ru-RU").format(totalRevenue)} ₽</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/admin/products">Manage products</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/categories">Manage categories</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/orders">Manage orders</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Contact</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map((order) => (
                <tr key={order.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">#{order.id}</td>
                  <td className="px-4 py-3 capitalize">{order.status}</td>
                  <td className="px-4 py-3 text-muted-foreground">{order.contact_value || order.contact_channel}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {new Intl.NumberFormat("ru-RU").format(Number(order.total_amount))} ₽
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
