import {
  createAttributeOption,
  updateAttributeOption,
} from "@/app/admin/attributes/actions"
import { AttributeDeleteButton } from "@/app/admin/attributes/AttributeDeleteButton"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { requireAdminUserOrRedirect } from "@/src/shared/lib/auth/require-admin"
import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

type AttributeRow = {
  id: number
  value: string
  value_normalized: string
  sort_order: number
  is_active: boolean
}

type AdminAttributesPageProps = {
  searchParams: Promise<{ q?: string; error?: string }>
}

type AttributeKind = "size" | "color"

type AttributeColumnProps = {
  kind: AttributeKind
  title: string
  replacementLabel: string
  list: AttributeRow[]
}

function filterList(list: AttributeRow[], queryText: string) {
  if (!queryText) return list
  return list.filter((item) => item.value.toLowerCase().includes(queryText))
}

function AttributeColumn({ kind, title, replacementLabel, list }: AttributeColumnProps) {
  const activeCount = list.filter((item) => item.is_active).length
  const inactiveCount = Math.max(list.length - activeCount, 0)

  return (
    <Card className="rounded-xl border-border shadow-sm">
      <CardContent className="space-y-3 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground sm:text-base">{title}</h3>
          <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">{list.length}</span>
        </div>

        <form action={createAttributeOption} className="space-y-2 rounded-lg border border-border p-2.5">
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="sortOrder" value={100} />
          <Input name="value" placeholder={`Новое значение (${replacementLabel})`} required className="h-9" />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <input type="checkbox" name="isActive" defaultChecked />
              Активно
            </label>
            <Button type="submit" size="sm" className="w-full sm:w-auto">
              Добавить
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border px-2 py-0.5">Активных: {activeCount}</span>
          <span className="rounded-full border px-2 py-0.5">Скрытых: {inactiveCount}</span>
        </div>

        {list.length === 0 ? (
          <p className="text-xs text-muted-foreground">Ничего не найдено.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border md:max-h-[480px] md:overflow-y-auto">
            <div className="divide-y divide-border">
              {list.map((item) => (
                <form key={item.id} action={updateAttributeOption} className="space-y-2 p-2.5">
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="kind" value={kind} />
                  <input type="hidden" name="sortOrder" value={item.sort_order} />
                  <Input name="value" defaultValue={item.value} required className="h-9" />
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <input type="checkbox" name="isActive" defaultChecked={item.is_active} />
                      Активно
                    </label>
                    <div className="flex items-center gap-2">
                      <Button type="submit" variant="outline" size="sm" className="flex-1 sm:flex-none">
                        Сохранить
                      </Button>
                      <AttributeDeleteButton
                        attributeId={item.id}
                        kind={kind}
                        value={item.value}
                        valueNormalized={item.value_normalized}
                        className="flex-1 sm:flex-none"
                      />
                    </div>
                  </div>
                </form>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default async function AdminAttributesPage({ searchParams }: AdminAttributesPageProps) {
  await requireAdminUserOrRedirect()
  const { q, error } = await searchParams
  const queryRaw = (q ?? "").trim()
  const queryText = queryRaw.toLowerCase()

  const supabase = await createServerSupabaseClient()
  const [{ data: sizes, error: sizesError }, { data: colors, error: colorsError }] = await Promise.all([
    supabase
      .from("product_sizes")
      .select("id, value, value_normalized, sort_order, is_active")
      .order("sort_order", { ascending: true })
      .order("value", { ascending: true }),
    supabase
      .from("product_colors")
      .select("id, value, value_normalized, sort_order, is_active")
      .order("sort_order", { ascending: true })
      .order("value", { ascending: true }),
  ])

  if (sizesError) {
    return <p className="text-red-600">Не удалось загрузить размеры: {sizesError.message}</p>
  }
  if (colorsError) {
    return <p className="text-red-600">Не удалось загрузить цвета: {colorsError.message}</p>
  }

  const sizeList = filterList((sizes ?? []) as AttributeRow[], queryText)
  const colorList = filterList((colors ?? []) as AttributeRow[], queryText)

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Размеры и цвета</h2>
        <p className="text-sm text-muted-foreground">
          Компактный справочник значений для формы товара: редактирование и управление активностью.
        </p>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <form className="flex flex-col gap-2 sm:flex-row" action="/admin/attributes">
        <Input name="q" defaultValue={queryRaw} placeholder="Поиск по размерам и цветам..." className="h-9" />
        <Button type="submit" variant="outline" size="sm" className="w-full sm:w-auto">
          Найти
        </Button>
      </form>

      <div className="grid gap-3 lg:grid-cols-2">
        <AttributeColumn kind="size" title="Размеры" replacementLabel="размер" list={sizeList} />
        <AttributeColumn kind="color" title="Цвета" replacementLabel="цвет" list={colorList} />
      </div>
    </div>
  )
}
