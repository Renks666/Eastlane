import Link from "next/link"
import { CategoryDeleteButton } from "@/app/admin/categories/CategoryDeleteButton"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"
import { requireAdminUserOrRedirect } from "@/src/shared/lib/auth/require-admin"

type CategoryRow = {
  id: number
  name: string
  slug: string
}

type AdminCategoriesPageProps = {
  searchParams: Promise<{ q?: string }>
}

export default async function AdminCategoriesPage({ searchParams }: AdminCategoriesPageProps) {
  await requireAdminUserOrRedirect()
  const { q } = await searchParams
  const queryText = q?.trim().toLowerCase() ?? ""

  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true })

  if (error) {
    return <p className="text-red-600">Не удалось загрузить категории: {error.message}</p>
  }

  const categories = ((data ?? []) as CategoryRow[]).filter((category) => {
    if (!queryText) return true
    return (
      category.name.toLowerCase().includes(queryText) ||
      category.slug.toLowerCase().includes(queryText)
    )
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Категории</h2>
          <p className="text-sm text-muted-foreground">Управление категориями товаров.</p>
          {queryText ? <p className="mt-1 text-xs text-muted-foreground">Фильтр: {queryText}</p> : null}
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">Создать категорию</Link>
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card className="rounded-xl border-border shadow-sm">
          <CardContent className="p-8 text-center text-muted-foreground">Категории не найдены.</CardContent>
        </Card>
      ) : (
        <Card className="rounded-xl border-border shadow-sm">
          <CardContent className="p-0">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-3 border-b border-border px-4 py-3 text-sm font-medium">
              <span>Название</span>
              <span>Slug</span>
              <span className="text-right">Действия</span>
            </div>

            {categories.map((category) => (
              <div
                key={category.id}
                className="grid grid-cols-[1fr_1fr_auto] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
              >
                <span className="font-medium">{category.name}</span>
                <span className="text-sm text-muted-foreground">{category.slug}</span>
                <div className="flex justify-end gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/categories/${category.id}/edit`}>Изменить</Link>
                  </Button>
                  <CategoryDeleteButton categoryId={category.id} categoryName={category.name} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
