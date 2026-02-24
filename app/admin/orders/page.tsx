import Link from "next/link"
import { Fragment } from "react"
import { listAdminOrders } from "@/src/domains/order/services/order-service"
import { getStorefrontContent } from "@/src/domains/content/services/storefront-content-service"
import type { OrderStatus } from "@/src/domains/order/types"
import { requireAdminUserOrRedirect } from "@/src/shared/lib/auth/require-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderStatusSelect } from "@/app/admin/orders/OrderStatusSelect"
import { formatDualPrice } from "@/src/shared/lib/format-price"

type OrderItem = {
  id: number
  product_name_snapshot: string
  size_snapshot: string | null
  price_snapshot: number
  price_currency_snapshot: "RUB" | "CNY"
  quantity: number
  line_total: number
  line_total_rub_approx: number
}

type Order = {
  id: number
  created_at: string
  status: OrderStatus
  total_amount: number
  total_currency: "RUB" | "CNY"
  exchange_rate_snapshot: number | null
  total_amount_rub_approx: number | null
  contact_channel: string
  contact_value: string | null
  comment: string | null
  customer_name: string | null
  order_items: OrderItem[]
}

type AdminOrdersPageProps = {
  searchParams: Promise<{
    q?: string
    status?: string
    sort?: string
    page?: string
  }>
}

const PAGE_SIZE = 8

const statusFilterOptions: Array<{ value: "all" | OrderStatus; label: string }> = [
  { value: "all", label: "Все" },
  { value: "new", label: "Новые" },
  { value: "confirmed", label: "Подтверждённые" },
  { value: "processing", label: "В работе" },
  { value: "done", label: "Выполненные" },
  { value: "cancelled", label: "Отменённые" },
]

const sortOptions = [
  { value: "created_desc", label: "Сначала новые" },
  { value: "created_asc", label: "Сначала старые" },
  { value: "total_desc", label: "Сумма: по убыванию" },
  { value: "total_asc", label: "Сумма: по возрастанию" },
] as const

type SortValue = (typeof sortOptions)[number]["value"]

function statusMeta(status: OrderStatus) {
  if (status === "done") {
    return { label: "Выполнен", className: "border-emerald-200 bg-emerald-50 text-emerald-700" }
  }
  if (status === "processing") {
    return { label: "В работе", className: "border-blue-200 bg-blue-50 text-blue-700" }
  }
  if (status === "confirmed") {
    return { label: "Подтверждён", className: "border-indigo-200 bg-indigo-50 text-indigo-700" }
  }
  if (status === "cancelled") {
    return { label: "Отменён", className: "border-rose-200 bg-rose-50 text-rose-700" }
  }

  return { label: "Новый", className: "border-amber-200 bg-amber-50 text-amber-700" }
}

function channelLabel(channel: string) {
  if (channel === "telegram") return "Telegram"
  if (channel === "phone") return "Телефон"
  return channel
}

function isOrderStatus(value: string): value is OrderStatus {
  return ["new", "confirmed", "processing", "done", "cancelled"].includes(value)
}

function toSortValue(value: string | undefined): SortValue {
  if (!value) return "created_desc"
  if (sortOptions.some((option) => option.value === value)) {
    return value as SortValue
  }
  return "created_desc"
}

function buildQueryString(input: {
  q: string
  status: "all" | OrderStatus
  sort: SortValue
  page: number
}) {
  const params = new URLSearchParams()
  if (input.q) params.set("q", input.q)
  if (input.status !== "all") params.set("status", input.status)
  if (input.sort !== "created_desc") params.set("sort", input.sort)
  if (input.page > 1) params.set("page", String(input.page))
  return params.toString()
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  await requireAdminUserOrRedirect()
  const { q, status, sort, page } = await searchParams
  const content = await getStorefrontContent()

  const queryText = q?.trim().toLowerCase() ?? ""
  const statusFilter: "all" | OrderStatus = status && isOrderStatus(status) ? status : "all"
  const sortValue = toSortValue(sort)
  const requestedPage = Number.parseInt(page ?? "1", 10)

  const listResult = await listAdminOrders()
    .then((orders) => ({ orders: orders as Order[], error: null as string | null }))
    .catch((error: unknown) => ({
      orders: [] as Order[],
      error: error instanceof Error ? error.message : "Unknown error",
    }))

  if (listResult.error) {
    return <p className="text-red-600">Не удалось загрузить заказы: {listResult.error}</p>
  }

  let filtered = listResult.orders.filter((order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false
    }

    if (!queryText) return true

    const text = [
      String(order.id),
      order.status,
      order.contact_channel,
      order.contact_value ?? "",
      order.customer_name ?? "",
      order.comment ?? "",
      ...order.order_items.map((item) => item.product_name_snapshot),
    ]
      .join(" ")
      .toLowerCase()

    return text.includes(queryText)
  })

  filtered = [...filtered].sort((a, b) => {
    if (sortValue === "created_asc") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
    if (sortValue === "total_desc") {
      return Number(b.total_amount_rub_approx ?? 0) - Number(a.total_amount_rub_approx ?? 0)
    }
    if (sortValue === "total_asc") {
      return Number(a.total_amount_rub_approx ?? 0) - Number(b.total_amount_rub_approx ?? 0)
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const totalOrders = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalOrders / PAGE_SIZE))
  const currentPage = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), totalPages) : 1
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const pageOrders = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  const totalRevenueRub = filtered.reduce((sum, order) => {
    const rubApprox = Number(order.total_amount_rub_approx ?? 0)
    if (Number.isFinite(rubApprox) && rubApprox > 0) return sum + rubApprox
    if (order.total_currency === "RUB") return sum + Number(order.total_amount)
    return sum + Number(order.total_amount) / Number(order.exchange_rate_snapshot ?? content.exchangeRate.cnyPerRub)
  }, 0)

  const newCount = filtered.filter((order) => order.status === "new").length
  const processingCount = filtered.filter((order) => order.status === "processing").length
  const doneCount = filtered.filter((order) => order.status === "done").length

  const prevQuery = buildQueryString({ q: queryText, status: statusFilter, sort: sortValue, page: currentPage - 1 })
  const nextQuery = buildQueryString({ q: queryText, status: statusFilter, sort: sortValue, page: currentPage + 1 })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Заказы</h2>
        <p className="text-sm text-muted-foreground">Просмотр и управление заказами.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Заказов в выборке</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalOrders}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Новые</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{newCount}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">В работе</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{processingCount}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Выручка</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-price tabular-nums text-2xl font-semibold text-black">
              {formatDualPrice({ amount: totalRevenueRub, currency: "RUB", cnyPerRub: content.exchangeRate.cnyPerRub })}
            </p>
            <p className="text-xs text-muted-foreground">Выполнено: {doneCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 whitespace-nowrap md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
          {statusFilterOptions.map((option) => {
            const queryString = buildQueryString({ q: queryText, status: option.value, sort: sortValue, page: 1 })
            const isActive = option.value === statusFilter
            return (
              <Link
                key={option.value}
                href={`/admin/orders${queryString ? `?${queryString}` : ""}`}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {option.label}
              </Link>
            )
          })}
        </div>

        <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 text-xs text-muted-foreground whitespace-nowrap md:mx-0 md:overflow-visible md:px-0 md:pb-0">
          <span className="shrink-0">Сортировка:</span>
          {sortOptions.map((option) => {
            const queryString = buildQueryString({ q: queryText, status: statusFilter, sort: option.value, page: 1 })
            const isActive = option.value === sortValue
            return (
              <Link
                key={option.value}
                href={`/admin/orders${queryString ? `?${queryString}` : ""}`}
                className={`shrink-0 rounded-md border px-2 py-1 transition ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {option.label}
              </Link>
            )
          })}
        </div>
      </div>

      {pageOrders.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-sm sm:p-8">
          Заказы не найдены.
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {pageOrders.map((order) => {
              const meta = statusMeta(order.status)
              const rate = Number(order.exchange_rate_snapshot ?? content.exchangeRate.cnyPerRub)

              return (
                <Card key={order.id} className="rounded-xl border-border shadow-sm">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">#{order.id}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString("ru-RU")}</p>
                      </div>
                      <span className={`rounded-full border px-2 py-1 text-xs font-medium ${meta.className}`}>{meta.label}</span>
                    </div>

                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-foreground">{order.customer_name || "Без имени"}</p>
                      <p className="text-muted-foreground">{order.contact_value || "Нет контакта"}</p>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full border border-border bg-muted px-2 py-1 text-foreground">
                        {channelLabel(order.contact_channel)}
                      </span>
                      <span>{order.order_items.length} позиций</span>
                    </div>

                    <p className="font-price tabular-nums text-right text-lg font-semibold text-black">
                      {formatDualPrice({ amount: order.total_amount, currency: order.total_currency, cnyPerRub: rate })}
                    </p>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Статус</p>
                      <OrderStatusSelect orderId={order.id} status={order.status} className="w-full" />
                    </div>

                    <details className="rounded-lg border border-border bg-muted/20 p-3">
                      <summary className="cursor-pointer text-xs font-medium text-foreground">Состав заказа</summary>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {order.order_items.map((item) => (
                          <span key={item.id} className="rounded-md border border-border bg-background px-2 py-1">
                            {item.product_name_snapshot}
                            {item.size_snapshot ? ` (${item.size_snapshot})` : ""} x{item.quantity} · {formatDualPrice({
                              amount: item.line_total,
                              currency: item.price_currency_snapshot,
                              cnyPerRub: rate,
                            })}
                          </span>
                        ))}
                        {order.comment ? (
                          <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-indigo-700">
                            Комментарий: {order.comment}
                          </span>
                        ) : null}
                      </div>
                    </details>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm md:block">
            <div className="border-b border-border px-5 py-4">
              <h3 className="text-sm font-semibold text-foreground">Список заказов</h3>
            </div>

            <div className="max-h-[62vh] overflow-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="sticky top-0 z-10 bg-muted/90 text-muted-foreground backdrop-blur">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium">Заказ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium">Клиент</th>
                    <th className="px-4 py-3 text-left text-xs font-medium">Канал</th>
                    <th className="px-4 py-3 text-left text-xs font-medium">Статус</th>
                    <th className="px-4 py-3 text-left text-xs font-medium">Дата</th>
                    <th className="px-4 py-3 text-right text-xs font-medium">Сумма</th>
                    <th className="px-4 py-3 text-right text-xs font-medium">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {pageOrders.map((order) => {
                    const meta = statusMeta(order.status)
                    const rate = Number(order.exchange_rate_snapshot ?? content.exchangeRate.cnyPerRub)

                    return (
                      <Fragment key={order.id}>
                        <tr className="border-t border-border align-top hover:bg-muted/20">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-foreground">#{order.id}</p>
                            <p className="text-xs text-muted-foreground">{order.order_items.length} позиций</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-foreground">{order.customer_name || "Без имени"}</p>
                            <p className="text-xs text-muted-foreground">{order.contact_value || "Нет контакта"}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full border border-border bg-muted px-2 py-1 text-xs font-medium text-foreground">
                              {channelLabel(order.contact_channel)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full border px-2 py-1 text-xs font-medium ${meta.className}`}>
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(order.created_at).toLocaleString("ru-RU")}
                          </td>
                          <td className="font-price tabular-nums px-4 py-3 text-right font-semibold text-black">
                            {formatDualPrice({ amount: order.total_amount, currency: order.total_currency, cnyPerRub: rate })}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <OrderStatusSelect orderId={order.id} status={order.status} />
                          </td>
                        </tr>

                        <tr className="border-t border-border/70 bg-muted/10">
                          <td colSpan={7} className="px-4 py-3">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              {order.order_items.map((item) => (
                                <span key={item.id} className="rounded-md border border-border bg-background px-2 py-1">
                                  {item.product_name_snapshot}
                                  {item.size_snapshot ? ` (${item.size_snapshot})` : ""} x{item.quantity}
                                  {" · "}
                                  {formatDualPrice({ amount: item.line_total, currency: item.price_currency_snapshot, cnyPerRub: rate })}
                                </span>
                              ))}
                              {order.comment ? (
                                <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-indigo-700">
                                  Комментарий: {order.comment}
                                </span>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <span>
              Страница {currentPage} из {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/orders${prevQuery ? `?${prevQuery}` : ""}`}
                className={`inline-flex h-9 items-center rounded-md border px-3 py-1 transition ${
                  currentPage <= 1
                    ? "pointer-events-none border-border/60 text-muted-foreground/40"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                Назад
              </Link>
              <Link
                href={`/admin/orders${nextQuery ? `?${nextQuery}` : ""}`}
                className={`inline-flex h-9 items-center rounded-md border px-3 py-1 transition ${
                  currentPage >= totalPages
                    ? "pointer-events-none border-border/60 text-muted-foreground/40"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                Вперёд
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

