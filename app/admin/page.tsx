import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExchangeRateCard } from "@/components/admin/ExchangeRateCard"
import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"
import { getStorefrontContent } from "@/src/domains/content/services/storefront-content-service"
import { listAdminOrders } from "@/src/domains/order/services/order-service"
import { requireAdminUserOrRedirect } from "@/src/shared/lib/auth/require-admin"
import { formatDualPrice, formatRub } from "@/src/shared/lib/format-price"
import { formatCny } from "@/src/shared/lib/format-price"

export default async function AdminPage() {
  const user = await requireAdminUserOrRedirect()
  const supabase = await createServerSupabaseClient()

  const [{ count: productsCount }, { count: categoriesCount }, orders, content] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    listAdminOrders().catch(() => []),
    getStorefrontContent(),
  ])

  const completedOrders = orders.filter((order) => order.status === "done")
  const totalRevenueCny = completedOrders.reduce((sum, order) => {
    const amount = Number(order.total_amount)
    if (!Number.isFinite(amount) || amount <= 0) return sum
    if (order.total_currency === "CNY") return sum + amount

    const rate = Number(order.exchange_rate_snapshot ?? content.exchangeRate.cnyPerRub)
    if (!Number.isFinite(rate) || rate <= 0) return sum
    return sum + amount * rate
  }, 0)

  const totalRevenueRubApprox = completedOrders.reduce((sum, order) => {
    const amount = Number(order.total_amount)
    if (!Number.isFinite(amount) || amount <= 0) return sum
    if (order.total_currency === "RUB") return sum + amount

    const rubApprox = Number(order.total_amount_rub_approx ?? 0)
    if (Number.isFinite(rubApprox) && rubApprox > 0) return sum + rubApprox

    const rate = Number(order.exchange_rate_snapshot ?? content.exchangeRate.cnyPerRub)
    if (!Number.isFinite(rate) || rate <= 0) return sum
    return sum + amount / rate
  }, 0)
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[max-content_max-content] lg:items-start lg:justify-start lg:gap-8">
        <div className="grid grid-cols-2 gap-3">
          <Card className="h-40 w-40 gap-1 rounded-xl border-border py-2 shadow-sm sm:h-44 sm:w-44">
            <CardHeader className="px-3 pb-0 pt-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Товары</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-0 pt-0">
              <p className="text-2xl font-semibold leading-none">{productsCount ?? 0}</p>
            </CardContent>
          </Card>

          <Card className="h-40 w-40 gap-1 rounded-xl border-border py-2 shadow-sm sm:h-44 sm:w-44">
            <CardHeader className="px-3 pb-0 pt-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Заказы</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-0 pt-0">
              <p className="text-2xl font-semibold leading-none">{orders.length}</p>
              <p className="text-xs text-muted-foreground">{newOrders} новых</p>
            </CardContent>
          </Card>

          <Card className="h-40 w-40 gap-1 rounded-xl border-border py-2 shadow-sm sm:h-44 sm:w-44">
            <CardHeader className="px-3 pb-0 pt-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Категории</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-0 pt-0">
              <p className="text-2xl font-semibold leading-none">{categoriesCount ?? 0}</p>
            </CardContent>
          </Card>

          <Card className="h-40 w-40 gap-1 rounded-xl border-border py-2 shadow-sm sm:h-44 sm:w-44">
            <CardHeader className="px-3 pb-0 pt-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Выручка</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-0 pt-0">
              <p className="font-price tabular-nums text-2xl font-semibold leading-none text-black">
                {formatCny(totalRevenueCny, 0)}
                <span className="ml-1 text-sm font-medium text-muted-foreground">
                  (≈ {formatRub(totalRevenueRubApprox, 0)})
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:ml-2 lg:border-l lg:border-border lg:pl-6 xl:grid-cols-1">
          <Card className="h-40 w-40 gap-2 self-start rounded-xl border-border py-2 shadow-sm sm:h-44 sm:w-44">
            <CardHeader className="px-3 pb-0 pt-0">
              <CardTitle className="text-sm font-semibold">Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className="grid h-full content-center gap-2 px-3 pb-0 pt-0">
              <Button asChild className="h-8 w-full text-xs">
                <Link href="/admin/products/new">Создать товар</Link>
              </Button>
              <Button asChild variant="outline" className="h-8 w-full text-xs">
                <Link href="/admin/orders">Заказы</Link>
              </Button>
            </CardContent>
          </Card>
          <ExchangeRateCard
            initialCnyPerRub={content.exchangeRate.cnyPerRub}
            compact
            className="h-40 w-40 self-start sm:h-44 sm:w-44"
          />
        </div>
      </div>

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
                  {formatDualPrice({
                    amount: Number(order.total_amount),
                    currency: order.total_currency,
                    cnyPerRub: Number(order.exchange_rate_snapshot ?? content.exchangeRate.cnyPerRub),
                  })}
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
                    {formatDualPrice({
                      amount: Number(order.total_amount),
                      currency: order.total_currency,
                      cnyPerRub: Number(order.exchange_rate_snapshot ?? content.exchangeRate.cnyPerRub),
                    })}
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

