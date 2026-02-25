"use client"

import { type Dispatch, type FormEvent, type SetStateAction, useEffect, useMemo, useState, useTransition } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronDownIcon } from "lucide-react"
import { z } from "zod"
import { toast } from "sonner"
import { createProduct, updateProduct } from "@/app/admin/products/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { buildSizeOptionsForCategory } from "@/src/domains/product-attributes/size-presets"
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
  slug: string
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

function orderSelectedSizes(
  values: string[],
  categorySlug: string | undefined,
  activeSizes: string[]
) {
  const sanitized = sanitizeAttributeValues(values)
  const orderedOptions = buildSizeOptionsForCategory({
    categorySlug,
    activeSizes,
    selectedSizes: sanitized,
    includeSelected: true,
  })
  const orderMap = new Map<string, number>(
    orderedOptions.map((value, index) => [normalizeAttributeValue(value), index])
  )

  return [...sanitized].sort((left, right) => {
    const leftOrder = orderMap.get(normalizeAttributeValue(left)) ?? Number.MAX_SAFE_INTEGER
    const rightOrder = orderMap.get(normalizeAttributeValue(right)) ?? Number.MAX_SAFE_INTEGER
    if (leftOrder !== rightOrder) return leftOrder - rightOrder
    return left.localeCompare(right, "ru", { sensitivity: "base", numeric: true })
  })
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

  const selectedCategory = useMemo(
    () => categories.find((category) => String(category.id) === categoryId) ?? null,
    [categories, categoryId]
  )

  const sizeOptions = useMemo(
    () =>
      buildSizeOptionsForCategory({
        categorySlug: selectedCategory?.slug,
        activeSizes: sizeOptionsFromDb,
        selectedSizes: sizes,
        includeSelected: true,
      }),
    [selectedCategory?.slug, sizeOptionsFromDb, sizes]
  )
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
  const selectedBrand = useMemo(
    () => brands.find((brand) => String(brand.id) === brandId) ?? null,
    [brands, brandId]
  )

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

  const normalizeAndSortSizes = (values: string[], categorySlugOverride?: string) =>
    orderSelectedSizes(values, categorySlugOverride ?? selectedCategory?.slug, sizeOptionsFromDb)

  const toggleSizeValue = (value: string) => {
    setSizes((prev) => {
      const hasValue = prev.some((item) => normalizeAttributeValue(item) === normalizeAttributeValue(value))
      const nextValues = hasValue
        ? prev.filter((item) => normalizeAttributeValue(item) !== normalizeAttributeValue(value))
        : [...prev, value]
      return normalizeAndSortSizes(nextValues)
    })
  }

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

  const onCategoryChange = (nextCategoryId: string) => {
    setCategoryId(nextCategoryId)
    if (!nextCategoryId) {
      if (sizes.length > 0) {
        setSizes([])
      }
      return
    }

    const nextCategory = categories.find((category) => String(category.id) === nextCategoryId)
    const allowedSizes = buildSizeOptionsForCategory({
      categorySlug: nextCategory?.slug,
      activeSizes: sizeOptionsFromDb,
      selectedSizes: [],
      includeSelected: false,
    })
    const allowedSet = new Set(allowedSizes.map((value) => normalizeAttributeValue(value)))
    const filteredSizes = sizes.filter((value) => allowedSet.has(normalizeAttributeValue(value)))
    if (filteredSizes.length !== sizes.length) {
      setSizes(normalizeAndSortSizes(filteredSizes, nextCategory?.slug))
      toast.info("Несовместимые размеры удалены после смены категории.")
    }
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
          <div className={`grid gap-4 ${mode === "create" ? "grid-cols-1" : "md:grid-cols-3"}`}>
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="name">Название *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="description">Описание</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Необязательное описание товара" />
            </div>

            {mode === "create" ? (
              <>
                <div className="w-full max-w-[500px] space-y-4 md:col-span-3">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid grid-rows-[20px_36px] gap-2">
                      <Label htmlFor="price" className="!block h-5 leading-5">Цена *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="h-9 w-full"
                        required
                      />
                    </div>

                    <div className="grid grid-rows-[20px_36px] gap-2">
                      <Label className="!block h-5 leading-5">Валюта цены *</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" variant="outline" className="h-9 w-full justify-between touch-pan-y rounded-md px-3 text-sm">
                            {priceCurrency === "CNY" ? "Юань (¥)" : "Рубль (₽)"}
                            <ChevronDownIcon className="size-4 opacity-60" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" side="bottom" align="start" avoidCollisions={false}>
                          <DropdownMenuItem onSelect={() => {
                            setPriceCurrency("CNY")
                          }}>Юань (¥)</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => {
                            setPriceCurrency("RUB")
                          }}>Рубль (₽)</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Категория *</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="outline" className="h-9 w-full justify-between touch-pan-y rounded-md px-3 text-sm font-normal">
                          <span className="truncate">{selectedCategory?.name ?? "Выберите категорию"}</span>
                          <ChevronDownIcon className="size-4 opacity-60" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" side="bottom" align="start" avoidCollisions={false}>
                        {categories.map((category) => (
                          <DropdownMenuItem key={category.id} onSelect={() => {
                            onCategoryChange(String(category.id))
                          }}>
                            {category.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <Label>Бренд *</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="outline" className="h-9 w-full justify-between touch-pan-y rounded-md px-3 text-sm font-normal">
                          <span className="truncate">{selectedBrand?.name ?? "Выберите бренд"}</span>
                          <ChevronDownIcon className="size-4 opacity-60" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="max-h-72 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto overscroll-contain" side="bottom" align="start" avoidCollisions={false}>
                        {primaryBrands.map((brand) => (
                          <DropdownMenuItem key={brand.id} onSelect={() => {
                            setBrandId(String(brand.id))
                          }}>
                            {brand.name}
                          </DropdownMenuItem>
                        ))}
                        {fallbackBrands.length > 0 ? <DropdownMenuSeparator /> : null}
                        {fallbackBrands.map((brand) => (
                          <DropdownMenuItem key={brand.id} onSelect={() => {
                            setBrandId(String(brand.id))
                          }}>
                            {brand.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="price">Цена *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="max-w-[220px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Категория *</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="outline" className="h-9 w-full justify-between touch-pan-y rounded-md px-3 text-sm font-normal">
                        <span className="truncate">{selectedCategory?.name ?? "Выберите категорию"}</span>
                        <ChevronDownIcon className="size-4 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" side="bottom" align="start" avoidCollisions={false}>
                      {categories.map((category) => (
                        <DropdownMenuItem key={category.id} onSelect={() => {
                          onCategoryChange(String(category.id))
                        }}>
                          {category.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <Label>Бренд *</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="outline" className="h-9 w-full justify-between touch-pan-y rounded-md px-3 text-sm font-normal">
                        <span className="truncate">{selectedBrand?.name ?? "Выберите бренд"}</span>
                        <ChevronDownIcon className="size-4 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-h-72 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto overscroll-contain" side="bottom" align="start" avoidCollisions={false}>
                      {primaryBrands.map((brand) => (
                        <DropdownMenuItem key={brand.id} onSelect={() => {
                          setBrandId(String(brand.id))
                        }}>
                          {brand.name}
                        </DropdownMenuItem>
                      ))}
                      {fallbackBrands.length > 0 ? <DropdownMenuSeparator /> : null}
                      {fallbackBrands.map((brand) => (
                        <DropdownMenuItem key={brand.id} onSelect={() => {
                          setBrandId(String(brand.id))
                        }}>
                          {brand.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <Label>Валюта цены *</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="outline" className="h-9 w-full justify-between touch-pan-y rounded-md px-3 text-sm font-normal">
                        {priceCurrency === "CNY" ? "Юань (¥)" : "Рубль (₽)"}
                        <ChevronDownIcon className="size-4 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" side="bottom" align="start" avoidCollisions={false}>
                      <DropdownMenuItem onSelect={() => {
                        setPriceCurrency("CNY")
                      }}>Юань (¥)</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => {
                        setPriceCurrency("RUB")
                      }}>Рубль (₽)</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            <Label>Размеры</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={!categoryId}>
                <Button type="button" variant="outline" className="w-full justify-between touch-pan-y sm:w-auto">
                  {categoryId ? "Выбрать размеры" : "Сначала выберите категорию"}
                  <ChevronDownIcon className="size-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-72 w-64 overflow-y-auto overscroll-contain" side="bottom" align="start" avoidCollisions={false}>
                {sizeOptions.length === 0 ? (
                  <p className="px-2 py-1.5 text-sm text-muted-foreground">Нет доступных размеров</p>
                ) : (
                  sizeOptions.map((size) => (
                    <DropdownMenuCheckboxItem
                      key={size}
                      checked={sizes.some((item) => normalizeAttributeValue(item) === normalizeAttributeValue(size))}
                      onCheckedChange={() => toggleSizeValue(size)}
                    >
                      {size}
                    </DropdownMenuCheckboxItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <p className="text-sm text-muted-foreground">
              {categoryId ? `Выбрано размеров: ${sizes.length}` : "Сначала выберите категорию, чтобы увидеть доступные размеры."}
            </p>

            <div className="flex gap-2">
              <Input
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                disabled={!categoryId}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    const value = customSizeInput.trim().replace(/\s+/g, " ")
                    if (!value) return
                    setSizes((prev) => normalizeAndSortSizes([...prev, value]))
                    setCustomSizeInput("")
                  }
                }}
                placeholder="Добавить размер вручную"
              />
              <Button
                type="button"
                variant="outline"
                disabled={!categoryId}
                onClick={() => {
                  const value = customSizeInput.trim().replace(/\s+/g, " ")
                  if (!value) return
                  setSizes((prev) => normalizeAndSortSizes([...prev, value]))
                  setCustomSizeInput("")
                }}
              >
                Добавить
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Цвета</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" className="w-full justify-between touch-pan-y sm:w-auto">
                  Выбрать цвета
                  <ChevronDownIcon className="size-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-72 w-64 overflow-y-auto overscroll-contain" side="bottom" align="start" avoidCollisions={false}>
                {colorOptions.length === 0 ? (
                  <p className="px-2 py-1.5 text-sm text-muted-foreground">Нет доступных цветов</p>
                ) : (
                  colorOptions.map((color) => (
                    <DropdownMenuCheckboxItem
                      key={color}
                      checked={colors.some((item) => normalizeAttributeValue(item) === normalizeAttributeValue(color))}
                      onCheckedChange={() => toggleArrayValue(color, setColors)}
                    >
                      {color}
                    </DropdownMenuCheckboxItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <p className="text-sm text-muted-foreground">Выбрано цветов: {colors.length}</p>

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
