"use client"

import { FormEvent, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { toast } from "sonner"
import { createBrand, updateBrand } from "@/app/admin/brands/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BRAND_GROUP_KEYS, BRAND_GROUP_LABELS } from "@/src/domains/brand/types"

const formSchema = z.object({
  name: z.string().trim().min(1, "Укажите название бренда."),
  slug: z
    .string()
    .trim()
    .min(1, "Укажите slug.")
    .regex(/^[a-z0-9-]+$/, "Slug может содержать только строчные латинские буквы, цифры и дефис."),
  groupKey: z.enum(BRAND_GROUP_KEYS),
  sortOrder: z.coerce.number().int().min(0, "Порядок сортировки должен быть больше или равен 0."),
  isActive: z.boolean(),
})

type BrandFormData = z.infer<typeof formSchema>

type EditableBrand = {
  id: number
  name: string
  slug: string
  group_key: (typeof BRAND_GROUP_KEYS)[number]
  sort_order: number
  is_active: boolean
}

type BrandFormProps = {
  mode: "create" | "edit"
  brand?: EditableBrand
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function BrandForm({ mode, brand }: BrandFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(brand?.name ?? "")
  const [slug, setSlug] = useState(brand?.slug ?? "")
  const [groupKey, setGroupKey] = useState<(typeof BRAND_GROUP_KEYS)[number]>(brand?.group_key ?? "sport-streetwear")
  const [sortOrder, setSortOrder] = useState(String(brand?.sort_order ?? 100))
  const [isActive, setIsActive] = useState<boolean>(brand?.is_active ?? true)
  const [slugManuallyChanged, setSlugManuallyChanged] = useState(mode === "edit")
  const [formError, setFormError] = useState<string | null>(null)

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const parsed = formSchema.safeParse({
      name,
      slug,
      groupKey,
      sortOrder,
      isActive,
    })

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Ошибка проверки данных.")
      return
    }

    const values: BrandFormData = parsed.data
    const formData = new FormData()
    formData.set("name", values.name)
    formData.set("slug", values.slug)
    formData.set("groupKey", values.groupKey)
    formData.set("sortOrder", String(values.sortOrder))
    formData.set("isActive", String(values.isActive))

    startTransition(async () => {
      const result = mode === "create" ? await createBrand(formData) : await updateBrand(brand!.id, formData)
      if (!result.ok) {
        setFormError(result.error ?? "Операция не выполнена.")
        toast.error(result.error ?? "Операция не выполнена.")
        return
      }

      toast.success(mode === "create" ? "Бренд создан." : "Бренд обновлен.")
      router.push("/admin/brands")
      router.refresh()
    })
  }

  return (
    <Card className="w-full max-w-3xl rounded-xl border-border shadow-sm">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Новый бренд" : "Редактирование бренда"}</CardTitle>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => {
                  const nextName = event.target.value
                  setName(nextName)
                  if (!slugManuallyChanged) {
                    setSlug(slugify(nextName))
                  }
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(event) => {
                  setSlugManuallyChanged(true)
                  setSlug(slugify(event.target.value))
                }}
                placeholder="new-balance"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Группа *</Label>
              <Select value={groupKey} onValueChange={(value) => setGroupKey(value as (typeof BRAND_GROUP_KEYS)[number])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BRAND_GROUP_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {BRAND_GROUP_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Порядок сортировки *</Label>
              <Input
                id="sortOrder"
                type="number"
                min={0}
                step={1}
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                required
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 rounded border p-2 text-sm">
            <Checkbox checked={isActive} onCheckedChange={(checked) => setIsActive(checked === true)} />
            Активен в каталоге
          </label>

          {formError && <p className="text-sm text-destructive">{formError}</p>}
        </CardContent>
        <CardFooter className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-end sm:gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/brands")}
            disabled={isPending}
            className="w-full sm:w-auto sm:mr-4"
          >
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto min-w-0 bg-[var(--color-brand-forest)] text-white hover:bg-[var(--color-brand-forest-dark)] focus-visible:ring-[var(--color-brand-forest)]"
          >
            {isPending ? "Сохранение..." : mode === "create" ? "Создать бренд" : "Сохранить"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
