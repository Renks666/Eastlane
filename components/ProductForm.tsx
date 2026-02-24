"use client"

import { type Dispatch, type FormEvent, type SetStateAction, useEffect, useMemo, useState, useTransition } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { toast } from "sonner"
import { createProduct, updateProduct } from "@/app/admin/products/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { normalizeAttributeValue, sanitizeAttributeValues } from "@/src/domains/product-attributes/types"
import { isSeasonKey, normalizeSeason, SEASON_KEYS, SEASON_LABELS_RU, type SeasonKey } from "@/src/domains/product-attributes/seasons"
import type { PriceCurrency } from "@/src/shared/lib/format-price"

const MAX_SINGLE_IMAGE_BYTES = 3 * 1024 * 1024
const MAX_TOTAL_UPLOAD_BYTES = 4 * 1024 * 1024

const formSchema = z.object({
  name: z.string().trim().min(1, "Укажите название."),
  description: z.string().optional(),
  price: z.coerce.number().positive("Цена должна быть больше 0."),
  priceCurrency: z.enum(["RUB", "CNY"]),
  categoryId: z.coerce.number().int().positive("Выберите категорию."),
  brandId: z.coerce.number().int().positive("Выберите бренд."),
  sizes: z.array(z.string()),
  colors: z.array(z.string()),
  seasons: z.array(z.enum(SEASON_KEYS)),
})

export type ProductFormCategory = {
  id: number
  name: string
}

export type ProductFormBrand = {
  id: number
  name: string
  slug?: string
}

export type EditableProduct = {
  id: number
  name: string
  description: string | null
  price: number
  price_currency: PriceCurrency
  category_id: number
  brand_id: number | null
  sizes: string[] | null
  colors: string[] | null
  seasons: string[] | null
  images: string[] | null
}

type ProductFormProps = {
  mode: "create" | "edit"
  categories: ProductFormCategory[]
  brands: ProductFormBrand[]
  sizeOptionsFromDb: string[]
  colorOptionsFromDb: string[]
  product?: EditableProduct
}

function buildNewImageKey(file: File) {
  return `new:${file.name}:${file.size}:${file.lastModified}`
}

function resolveFallbackMainImageKey(existing: string[], files: File[]) {
  if (existing.length > 0) {
    return `existing:${existing[0]}`
  }
  if (files.length > 0) {
    return buildNewImageKey(files[0])
  }
  return null
}

function formatMb(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function mergeWithOptions(baseOptions: string[], selectedValues: string[]) {
  const map = new Map<string, string>()
  for (const value of sanitizeAttributeValues(baseOptions)) {
    map.set(normalizeAttributeValue(value), value)
  }
  for (const value of sanitizeAttributeValues(selectedValues)) {
    if (!map.has(normalizeAttributeValue(value))) {
      map.set(normalizeAttributeValue(value), value)
    }
  }
  return Array.from(map.values())
}

export function ProductForm({
  mode,
  categories,
  brands,
  sizeOptionsFromDb,
  colorOptionsFromDb,
  product,
}: ProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState(product?.name ?? "")
  const [description, setDescription] = useState(product?.description ?? "")
  const [price, setPrice] = useState(product?.price?.toString() ?? "")
  const [priceCurrency, setPriceCurrency] = useState<PriceCurrency>(product?.price_currency ?? "CNY")
  const [categoryId, setCategoryId] = useState(product?.category_id?.toString() ?? "")
  const [brandId, setBrandId] = useState(product?.brand_id?.toString() ?? "")
  const [sizes, setSizes] = useState<string[]>(sanitizeAttributeValues(product?.sizes ?? []))
  const [colors, setColors] = useState<string[]>(sanitizeAttributeValues(product?.colors ?? []))
  const [seasons, setSeasons] = useState<SeasonKey[]>(
    Array.from(
      new Set(
        (product?.seasons ?? [])
          .map((value) => normalizeSeason(value))
          .filter((value): value is SeasonKey => isSeasonKey(value))
      )
    )
  )
  const [customSizeInput, setCustomSizeInput] = useState("")
  const [customColorInput, setCustomColorInput] = useState("")
  const [existingImages, setExistingImages] = useState<string[]>(product?.images ?? [])
  const [removedImages, setRemovedImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [mainImageKey, setMainImageKey] = useState<string | null>(product?.images?.[0] ? `existing:${product.images[0]}` : null)
  const [formError, setFormError] = useState<string | null>(null)

  const sizeOptions = useMemo(() => mergeWithOptions(sizeOptionsFromDb, sizes), [sizeOptionsFromDb, sizes])
  const colorOptions = useMemo(() => mergeWithOptions(colorOptionsFromDb, colors), [colorOptionsFromDb, colors])

  const [primaryBrands, fallbackBrands] = useMemo(() => {
    const isOther = (brand: ProductFormBrand) => {
      const slug = (brand.slug ?? "").trim().toLowerCase()
      const displayName = brand.name.trim().toLowerCase()
      return slug === "other" || displayName.includes("other")
    }
    const regular = brands.filter((brand) => !isOther(brand))
    const other = brands.filter(isOther)
    return [regular, other]
  }, [brands])

  const previewUrls = useMemo(
    () =>
      newImages.map((file) => ({
        fileName: file.name,
        key: buildNewImageKey(file),
        url: URL.createObjectURL(file),
      })),
    [newImages]
  )

  useEffect(() => {
    return () => {
      previewUrls.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [previewUrls])

  const toggleArrayValue = (value: string, setValues: Dispatch<SetStateAction<string[]>>) => {
    setValues((prev) => {
      const hasValue = prev.some((item) => normalizeAttributeValue(item) === normalizeAttributeValue(value))
      if (hasValue) {
        return prev.filter((item) => normalizeAttributeValue(item) !== normalizeAttributeValue(value))
      }
      return sanitizeAttributeValues([...prev, value])
    })
  }

  const toggleSeason = (season: SeasonKey) => {
    setSeasons((prev) => (prev.includes(season) ? prev.filter((item) => item !== season) : [...prev, season]))
  }

  const addCustomValue = (
    inputValue: string,
    setInputValue: Dispatch<SetStateAction<string>>,
    setValues: Dispatch<SetStateAction<string[]>>
  ) => {
    const value = inputValue.trim().replace(/\s+/g, " ")
    if (!value) return
    setValues((prev) => sanitizeAttributeValues([...prev, value]))
    setInputValue("")
  }

  const removeExistingImage = (url: string) => {
    const nextExistingImages = existingImages.filter((item) => item !== url)
    setExistingImages(nextExistingImages)
    setRemovedImages((prev) => (prev.includes(url) ? prev : [...prev, url]))
    if (mainImageKey === `existing:${url}`) {
      setMainImageKey(resolveFallbackMainImageKey(nextExistingImages, newImages))
    }
  }

  const removeNewImage = (fileKey: string) => {
    const nextNewImages = newImages.filter((file) => buildNewImageKey(file) !== fileKey)
    setNewImages(nextNewImages)
    if (mainImageKey === fileKey) {
      setMainImageKey(resolveFallbackMainImageKey(existingImages, nextNewImages))
    }
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const normalizedSizes = sanitizeAttributeValues(sizes)
    const normalizedColors = sanitizeAttributeValues(colors)
    const parsed = formSchema.safeParse({
      name,
      description,
      price,
      priceCurrency,
      categoryId,
      brandId,
      sizes: normalizedSizes,
      colors: normalizedColors,
      seasons,
    })

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Ошибка проверки данных.")
      return
    }

    const formData = new FormData()
    formData.set("name", parsed.data.name)
    formData.set("description", parsed.data.description ?? "")
    formData.set("price", String(parsed.data.price))
    formData.set("priceCurrency", parsed.data.priceCurrency)
    formData.set("categoryId", String(parsed.data.categoryId))
    formData.set("brandId", String(parsed.data.brandId))
    formData.set("sizes", JSON.stringify(parsed.data.sizes))
    formData.set("colors", JSON.stringify(parsed.data.colors))
    formData.set("seasons", JSON.stringify(parsed.data.seasons))
    formData.set("removedImages", JSON.stringify(removedImages))
    formData.set("mainImageKey", mainImageKey ?? "")

    for (const file of newImages) {
      formData.append("newImages", file)
    }

    startTransition(async () => {
      const result = mode === "create" ? await createProduct(formData) : await updateProduct(product!.id, formData)
      if (!result.ok) {
        setFormError(result.error ?? "Операция не выполнена.")
        toast.error(result.error ?? "Операция не выполнена.")
        return
      }

      toast.success(mode === "create" ? "Товар создан." : "Товар обновлен.")
      router.push("/admin/products")
      router.refresh()
    })
  }

  return (
    <Card className="w-full rounded-xl border-border shadow-sm">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Новый товар" : "Редактирование товара"}</CardTitle>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="name">Название *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="description">Описание</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Необязательное описание товара" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Цена (₽) *</Label>
              <Input id="price" type="number" min="0.01" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Валюта цены *</Label>
              <Select value={priceCurrency} onValueChange={(value) => setPriceCurrency(value as PriceCurrency)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите валюту" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CNY">Юань (¥)</SelectItem>
                  <SelectItem value="RUB">Рубль (₽)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Категория *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Бренд *</Label>
              <Select value={brandId} onValueChange={setBrandId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите бренд" />
                </SelectTrigger>
                <SelectContent>
                  {primaryBrands.map((brand) => (
                    <SelectItem key={brand.id} value={String(brand.id)}>
                      {brand.name}
                    </SelectItem>
                  ))}
                  {fallbackBrands.length > 0 ? <SelectSeparator /> : null}
                  {fallbackBrands.map((brand) => (
                    <SelectItem key={brand.id} value={String(brand.id)}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Размеры</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              {sizeOptions.map((size) => (
                <label key={size} className="flex items-center gap-2 rounded border p-2 text-sm">
                  <Checkbox checked={sizes.some((item) => normalizeAttributeValue(item) === normalizeAttributeValue(size))} onCheckedChange={() => toggleArrayValue(size, setSizes)} />
                  {size}
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    addCustomValue(customSizeInput, setCustomSizeInput, setSizes)
                  }
                }}
                placeholder="Добавить размер вручную"
              />
              <Button type="button" variant="outline" onClick={() => addCustomValue(customSizeInput, setCustomSizeInput, setSizes)}>
                Добавить
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Цвета</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {colorOptions.map((color) => (
                <label key={color} className="flex items-center gap-2 rounded border p-2 text-sm">
                  <Checkbox checked={colors.some((item) => normalizeAttributeValue(item) === normalizeAttributeValue(color))} onCheckedChange={() => toggleArrayValue(color, setColors)} />
                  {color}
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={customColorInput}
                onChange={(e) => setCustomColorInput(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    addCustomValue(customColorInput, setCustomColorInput, setColors)
                  }
                }}
                placeholder="Добавить цвет вручную"
              />
              <Button type="button" variant="outline" onClick={() => addCustomValue(customColorInput, setCustomColorInput, setColors)}>
                Добавить
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Сезонность</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SEASON_KEYS.map((season) => (
                <label key={season} className="flex items-center gap-2 rounded border p-2 text-sm">
                  <Checkbox checked={seasons.includes(season)} onCheckedChange={() => toggleSeason(season)} />
                  {SEASON_LABELS_RU[season]}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="images">Изображения</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files ?? [])
                if (files.length === 0) return
                const invalidType = files.find((file) => !file.type.startsWith("image/"))
                if (invalidType) {
                  const message = "Можно загружать только изображения."
                  setFormError(message)
                  toast.error(message)
                  e.currentTarget.value = ""
                  return
                }

                const tooLarge = files.find((file) => file.size > MAX_SINGLE_IMAGE_BYTES)
                if (tooLarge) {
                  const message = `Файл "${tooLarge.name}" больше ${formatMb(MAX_SINGLE_IMAGE_BYTES)}.`
                  setFormError(message)
                  toast.error(message)
                  e.currentTarget.value = ""
                  return
                }

                const currentTotal = newImages.reduce((sum, file) => sum + file.size, 0)
                const pickedTotal = files.reduce((sum, file) => sum + file.size, 0)
                if (currentTotal + pickedTotal > MAX_TOTAL_UPLOAD_BYTES) {
                  const message = `Суммарный размер новых изображений не должен превышать ${formatMb(MAX_TOTAL_UPLOAD_BYTES)}.`
                  setFormError(message)
                  toast.error(message)
                  e.currentTarget.value = ""
                  return
                }

                setNewImages((prev) => {
                  const next = [...prev, ...files]
                  if (!mainImageKey) {
                    setMainImageKey(resolveFallbackMainImageKey(existingImages, next))
                  }
                  return next
                })
                setFormError(null)
                e.currentTarget.value = ""
              }}
            />
            <p className="text-xs text-muted-foreground">
              До {formatMb(MAX_SINGLE_IMAGE_BYTES)} на файл и до {formatMb(MAX_TOTAL_UPLOAD_BYTES)} суммарно за одно сохранение.
            </p>

            {existingImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Текущие изображения</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {existingImages.map((url) => (
                    <div key={url} className="rounded border p-2">
                      <div className="relative h-28 w-full overflow-hidden rounded">
                        <Image src={url} alt="Изображение товара" fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
                      </div>
                      <Button type="button" variant={mainImageKey === `existing:${url}` ? "default" : "outline"} size="sm" className="mt-2 w-full" onClick={() => setMainImageKey(`existing:${url}`)}>
                        {mainImageKey === `existing:${url}` ? "Главное" : "Сделать главным"}
                      </Button>
                      <Button type="button" variant="outline" size="sm" className="mt-2 w-full" onClick={() => removeExistingImage(url)}>
                        Удалить
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {previewUrls.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Новые изображения</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {previewUrls.map((preview) => (
                    <div key={preview.key} className="rounded border p-2">
                      <div className="relative h-28 w-full overflow-hidden rounded">
                        {/* next/image does not reliably support blob: preview URLs on mobile Safari */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview.url} alt={`New image preview: ${preview.fileName}`} className="h-full w-full object-cover" />
                      </div>
                      <Button type="button" variant={mainImageKey === preview.key ? "default" : "outline"} size="sm" className="mt-2 w-full" onClick={() => setMainImageKey(preview.key)}>
                        {mainImageKey === preview.key ? "Главное" : "Сделать главным"}
                      </Button>
                      <Button type="button" variant="outline" size="sm" className="mt-2 w-full" onClick={() => removeNewImage(preview.key)}>
                        Удалить
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}
        </CardContent>
        <CardFooter className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-end sm:gap-4">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/products")} disabled={isPending} className="w-full sm:w-auto sm:mr-4">
            Отмена
          </Button>
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto min-w-0 bg-[var(--color-brand-forest)] text-white hover:bg-[var(--color-brand-forest-dark)] focus-visible:ring-[var(--color-brand-forest)]">
            {isPending ? "Сохранение..." : mode === "create" ? "Создать товар" : "Сохранить"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
