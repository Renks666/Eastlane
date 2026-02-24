import Link from "next/link"
import { BrandDeleteButton } from "@/app/admin/brands/BrandDeleteButton"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"
import { requireAdminUserOrRedirect } from "@/src/shared/lib/auth/require-admin"
import { BRAND_GROUP_LABELS, compareBrandGroupKeys, type BrandGroupKey, isBrandGroupKey } from "@/src/domains/brand/types"

type BrandRow = {
  id: number
  name: string
  slug: string
  group_key: string
  sort_order: number
  is_active: boolean
}

type AdminBrandsPageProps = {
  searchParams: Promise<{ q?: string }>
}

export default async function AdminBrandsPage({ searchParams }: AdminBrandsPageProps) {
  await requireAdminUserOrRedirect()
  const { q } = await searchParams
  const queryText = q?.trim().toLowerCase() ?? ""

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("brands")
    .select("id, name, slug, group_key, sort_order, is_active")
    .order("group_key", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    return <p className="text-red-600">Не удалось загрузить бренды: {error.message}</p>
  }

  const brands = ((data ?? []) as BrandRow[])
    .filter((brand) => {
      if (!queryText) return true
      const groupLabel = isBrandGroupKey(brand.group_key) ? BRAND_GROUP_LABELS[brand.group_key] : brand.group_key
      return (
        brand.name.toLowerCase().includes(queryText) ||
        brand.slug.toLowerCase().includes(queryText) ||
        brand.group_key.toLowerCase().includes(queryText) ||
        groupLabel.toLowerCase().includes(queryText)
      )
    })
    .sort((a, b) => {
      const aGroup = isBrandGroupKey(a.group_key) ? a.group_key : "outdoor"
      const bGroup = isBrandGroupKey(b.group_key) ? b.group_key : "outdoor"
      const byGroup = compareBrandGroupKeys(aGroup as BrandGroupKey, bGroup as BrandGroupKey)
      if (byGroup !== 0) return byGroup
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
      return a.name.localeCompare(b.name)
    })

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Бренды</h2>
          <p className="text-sm text-muted-foreground">Управление брендами для каталога и фильтров.</p>
          {queryText ? <p className="mt-1 text-xs text-muted-foreground">Фильтр: {queryText}</p> : null}
        </div>
        <Button
          asChild
          className="w-full !bg-[color:var(--color-brand-forest)] !text-white hover:!bg-[color:var(--color-brand-forest-dark)] sm:w-auto"
        >
          <Link href="/admin/brands/new">Создать бренд</Link>
        </Button>
      </div>

      {brands.length === 0 ? (
        <Card className="rounded-xl border-border shadow-sm">
          <CardContent className="p-8 text-center text-muted-foreground">Бренды не найдены.</CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {brands.map((brand) => (
              <Card key={brand.id} className="rounded-xl border-border shadow-sm">
                <CardContent className="space-y-3 p-4">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{brand.name}</p>
                    <p className="text-sm text-muted-foreground">{brand.slug}</p>
                    <p className="text-xs text-muted-foreground">
                      {isBrandGroupKey(brand.group_key) ? BRAND_GROUP_LABELS[brand.group_key] : brand.group_key}
                    </p>
                    <p className="text-xs text-muted-foreground">Сортировка: {brand.sort_order}</p>
                    <p className={`text-xs font-medium ${brand.is_active ? "text-emerald-700" : "text-amber-700"}`}>
                      {brand.is_active ? "Активен" : "Скрыт"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                      <Link href={`/admin/brands/${brand.id}/edit`}>Изменить</Link>
                    </Button>
                    <BrandDeleteButton brandId={brand.id} brandName={brand.name} className="w-full sm:w-auto" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="hidden rounded-xl border-border shadow-sm md:block">
            <CardContent className="p-0">
              <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto_auto] gap-3 border-b border-border px-4 py-3 text-sm font-medium">
                <span>Название</span>
                <span>Slug</span>
                <span>Группа</span>
                <span className="text-center">Порядок</span>
                <span className="text-center">Статус</span>
                <span className="text-right">Действия</span>
              </div>

              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="grid grid-cols-[1fr_1fr_1fr_auto_auto_auto] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
                >
                  <span className="font-medium">{brand.name}</span>
                  <span className="text-sm text-muted-foreground">{brand.slug}</span>
                  <span className="text-sm text-muted-foreground">
                    {isBrandGroupKey(brand.group_key) ? BRAND_GROUP_LABELS[brand.group_key] : brand.group_key}
                  </span>
                  <span className="text-center text-sm">{brand.sort_order}</span>
                  <span className={`text-center text-xs font-medium ${brand.is_active ? "text-emerald-700" : "text-amber-700"}`}>
                    {brand.is_active ? "Активен" : "Скрыт"}
                  </span>
                  <div className="flex justify-end gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/brands/${brand.id}/edit`}>Изменить</Link>
                    </Button>
                    <BrandDeleteButton brandId={brand.id} brandName={brand.name} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
