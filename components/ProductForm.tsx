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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL"] as const
const SHOE_SIZE_OPTIONS = ["40", "41", "42", "43", "44", "45", "46", "47", "48", "49"] as const
const COLOR_OPTIONS = ["белый", "черный", "синий", "красный", "зеленый", "серый", "золотой"] as const

const formSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be greater than 0."),
  categoryId: z.coerce.number().int().positive("Category is required."),
  sizes: z.array(z.string()),
  colors: z.array(z.string()),
})

export type ProductFormCategory = {
  id: number
  name: string
}

export type EditableProduct = {
  id: number
  name: string
  description: string | null
  price: number
  category_id: number
  sizes: string[] | null
  colors: string[] | null
  images: string[] | null
}

type ProductFormProps = {
  mode: "create" | "edit"
  categories: ProductFormCategory[]
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

export function ProductForm({ mode, categories, product }: ProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState(product?.name ?? "")
  const [description, setDescription] = useState(product?.description ?? "")
  const [price, setPrice] = useState(product?.price?.toString() ?? "")
  const [categoryId, setCategoryId] = useState(product?.category_id?.toString() ?? "")
  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? [])
  const [colors, setColors] = useState<string[]>(product?.colors ?? [])
  const [existingImages, setExistingImages] = useState<string[]>(product?.images ?? [])
  const [removedImages, setRemovedImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [mainImageKey, setMainImageKey] = useState<string | null>(
    product?.images?.[0] ? `existing:${product.images[0]}` : null
  )
  const [formError, setFormError] = useState<string | null>(null)

  const selectedCategoryName = useMemo(() => {
    const selectedId = Number(categoryId)
    if (!Number.isInteger(selectedId)) return ""
    return categories.find((category) => category.id === selectedId)?.name ?? ""
  }, [categories, categoryId])

  const isShoeCategory = selectedCategoryName.trim().toLowerCase() === "обувь"
  const sizeOptions = isShoeCategory ? SHOE_SIZE_OPTIONS : SIZE_OPTIONS

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
    setValues((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
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

    const parsed = formSchema.safeParse({
      name,
      description,
      price,
      categoryId,
      sizes,
      colors,
    })

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Validation failed.")
      return
    }

    const formData = new FormData()
    const normalizedSizes = parsed.data.sizes.filter((size) =>
      sizeOptions.includes(size as (typeof sizeOptions)[number])
    )
    formData.set("name", parsed.data.name)
    formData.set("description", parsed.data.description ?? "")
    formData.set("price", String(parsed.data.price))
    formData.set("categoryId", String(parsed.data.categoryId))
    formData.set("sizes", JSON.stringify(normalizedSizes))
    formData.set("colors", JSON.stringify(parsed.data.colors))
    formData.set("removedImages", JSON.stringify(removedImages))
    formData.set("mainImageKey", mainImageKey ?? "")

    for (const file of newImages) {
      formData.append("newImages", file)
    }

    startTransition(async () => {
      const result = mode === "create" ? await createProduct(formData) : await updateProduct(product!.id, formData)

      if (!result.ok) {
        setFormError(result.error ?? "Operation failed.")
        toast.error(result.error ?? "Operation failed.")
        return
      }

      toast.success(mode === "create" ? "Product created." : "Product updated.")
      router.push("/admin/products")
      router.refresh()
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{mode === "create" ? "New Product" : "Edit Product"}</CardTitle>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional product description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Цена (₽) *</Label>
              <Input
                id="price"
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
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
          </div>

          <div className="space-y-2">
            <Label>Sizes</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              {sizeOptions.map((size) => (
                <label key={size} className="flex items-center gap-2 rounded border p-2 text-sm">
                  <Checkbox checked={sizes.includes(size)} onCheckedChange={() => toggleArrayValue(size, setSizes)} />
                  {size}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Colors</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {COLOR_OPTIONS.map((color) => (
                <label key={color} className="flex items-center gap-2 rounded border p-2 text-sm">
                  <Checkbox checked={colors.includes(color)} onCheckedChange={() => toggleArrayValue(color, setColors)} />
                  {color}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="images">Images</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files ?? [])
                if (files.length === 0) return
                setNewImages((prev) => {
                  const next = [...prev, ...files]
                  if (!mainImageKey) {
                    setMainImageKey(resolveFallbackMainImageKey(existingImages, next))
                  }
                  return next
                })
                e.currentTarget.value = ""
              }}
            />

            {existingImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Existing images</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {existingImages.map((url) => (
                    <div key={url} className="rounded border p-2">
                      <div className="relative h-28 w-full overflow-hidden rounded">
                        <Image
                          src={url}
                          alt="Existing product image"
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant={mainImageKey === `existing:${url}` ? "default" : "outline"}
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => setMainImageKey(`existing:${url}`)}
                      >
                        {mainImageKey === `existing:${url}` ? "Main image" : "Set as main"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => removeExistingImage(url)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {previewUrls.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">New images</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {previewUrls.map((preview) => (
                    <div key={preview.key} className="rounded border p-2">
                      <div className="relative h-28 w-full overflow-hidden rounded">
                        <Image
                          src={preview.url}
                          alt={`New image preview: ${preview.fileName}`}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant={mainImageKey === preview.key ? "default" : "outline"}
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => setMainImageKey(preview.key)}
                      >
                        {mainImageKey === preview.key ? "Main image" : "Set as main"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => removeNewImage(preview.key)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/products")} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : mode === "create" ? "Create product" : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
