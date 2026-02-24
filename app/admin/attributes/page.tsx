import Link from "next/link"
import { createAttributeOption, deleteAttributeOption, updateAttributeOption } from "@/app/admin/attributes/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"
import { requireAdminUserOrRedirect } from "@/src/shared/lib/auth/require-admin"

type AttributeRow = {
  id: number
  value: string
  value_normalized: string
  sort_order: number
  is_active: boolean
}

type AdminAttributesPageProps = {
  searchParams: Promise<{ q?: string; tab?: string }>
}

function buildQuery(tab: "sizes" | "colors", q: string) {
  const params = new URLSearchParams()
  params.set("tab", tab)
  if (q) params.set("q", q)
  return params.toString()
}

export default async function AdminAttributesPage({ searchParams }: AdminAttributesPageProps) {
  await requireAdminUserOrRedirect()
  const { q, tab } = await searchParams
  const queryText = (q ?? "").trim().toLowerCase()
  const currentTab: "sizes" | "colors" = tab === "colors" ? "colors" : "sizes"

  const supabase = await createServerSupabaseClient()
  const [{ data: sizes, error: sizesError }, { data: colors, error: colorsError }] = await Promise.all([
    supabase.from("product_sizes").select("id, value, value_normalized, sort_order, is_active").order("sort_order", { ascending: true }).order("value", { ascending: true }),
    supabase.from("product_colors").select("id, value, value_normalized, sort_order, is_active").order("sort_order", { ascending: true }).order("value", { ascending: true }),
  ])

  if (sizesError) {
    return <p className="text-red-600">Не удалось загрузить размеры: {sizesError.message}</p>
  }
  if (colorsError) {
    return <p className="text-red-600">Не удалось загрузить цвета: {colorsError.message}</p>
  }

  const sizeList = ((sizes ?? []) as AttributeRow[]).filter((item) => (!queryText ? true : item.value.toLowerCase().includes(queryText)))
  const colorList = ((colors ?? []) as AttributeRow[]).filter((item) => (!queryText ? true : item.value.toLowerCase().includes(queryText)))
  const list = currentTab === "sizes" ? sizeList : colorList
  const kind = currentTab === "sizes" ? "size" : "color"

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Размеры и цвета</h2>
        <p className="text-sm text-muted-foreground">Справочник значений для формы товара. Можно добавлять вручную, деактивировать и удалять неиспользуемые.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/admin/attributes?${buildQuery("sizes", queryText)}`}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${currentTab === "sizes" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
        >
          Размеры
        </Link>
        <Link
          href={`/admin/attributes?${buildQuery("colors", queryText)}`}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${currentTab === "colors" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
        >
          Цвета
        </Link>
      </div>

      <Card className="rounded-xl border-border shadow-sm">
        <CardContent className="space-y-4 p-4">
          <form className="flex gap-2" action="/admin/attributes">
            <input type="hidden" name="tab" value={currentTab} />
            <Input name="q" defaultValue={queryText} placeholder={`Поиск по ${currentTab === "sizes" ? "размерам" : "цветам"}...`} />
            <Button type="submit" variant="outline">Найти</Button>
          </form>

          <form action={createAttributeOption} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_150px_auto_auto]">
            <input type="hidden" name="kind" value={kind} />
            <Input name="value" placeholder={`Новое значение (${currentTab === "sizes" ? "размер" : "цвет"})`} required />
            <Input name="sortOrder" type="number" min={0} defaultValue={100} required />
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked />
              Активно
            </label>
            <Button type="submit">Добавить</Button>
          </form>

          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ничего не найдено.</p>
          ) : (
            <div className="space-y-2">
              {list.map((item) => (
                <div key={item.id} className="rounded-lg border p-3">
                  <form action={updateAttributeOption} className="grid gap-2 md:grid-cols-[1fr_150px_auto_auto]">
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="kind" value={kind} />
                    <Input name="value" defaultValue={item.value} required />
                    <Input name="sortOrder" type="number" min={0} defaultValue={item.sort_order} required />
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" name="isActive" defaultChecked={item.is_active} />
                      Активно
                    </label>
                    <Button type="submit" variant="outline">Сохранить</Button>
                  </form>
                  <form action={deleteAttributeOption} className="mt-2">
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="kind" value={kind} />
                    <input type="hidden" name="valueNormalized" value={item.value_normalized} />
                    <Button type="submit" variant="destructive" size="sm">Удалить</Button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
