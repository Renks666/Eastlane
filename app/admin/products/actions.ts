"use server"

import { revalidatePath } from "next/cache"
import { requireAdminUser } from "@/src/shared/lib/auth/require-admin"
import { logger } from "@/src/shared/lib/logger"
import { toActionError } from "@/src/shared/lib/action-result"
import {
  removeProductImagesByUrls,
  reorderImagesWithMain,
  resolveMainImageUrl,
  uploadProductImages,
} from "@/src/domains/product/services/product-image-service"
import { upsertAttributeOptions } from "@/src/domains/product-attributes/services/attribute-options-service"
import { sanitizeAttributeValues } from "@/src/domains/product-attributes/types"
import { isSeasonKey, normalizeSeason, type SeasonKey } from "@/src/domains/product-attributes/seasons"
import { normalizePriceCurrency, type PriceCurrency } from "@/src/shared/lib/format-price"

type ActionResult = {
  ok: boolean
  error?: string
}

type ProductPayload = {
  name: string
  description: string | null
  price: number
  priceCurrency: PriceCurrency
  categoryId: number
  brandId: number
  sizes: string[]
  colors: string[]
  seasons: SeasonKey[]
}

function parseJsonStringArray(value: FormDataEntryValue | null, field: string): string[] {
  if (!value) return []
  if (typeof value !== "string") {
    throw new Error(`Invalid ${field} format.`)
  }

  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
      throw new Error()
    }
    return parsed
  } catch {
    throw new Error(`Invalid ${field} format.`)
  }
}

function parsePayload(formData: FormData): ProductPayload {
  const name = String(formData.get("name") ?? "").trim()
  const descriptionRaw = String(formData.get("description") ?? "").trim()
  const priceRaw = String(formData.get("price") ?? "").trim()
  const priceCurrencyRaw = String(formData.get("priceCurrency") ?? "CNY").trim()
  const categoryIdRaw = String(formData.get("categoryId") ?? "").trim()
  const brandIdRaw = String(formData.get("brandId") ?? "").trim()
  const sizes = parseJsonStringArray(formData.get("sizes"), "sizes")
  const colors = parseJsonStringArray(formData.get("colors"), "colors")
  const seasons = parseJsonStringArray(formData.get("seasons"), "seasons")
    .map((value) => normalizeSeason(value))
    .filter((value): value is SeasonKey => isSeasonKey(value))

  const price = Number(priceRaw)
  const priceCurrency = normalizePriceCurrency(priceCurrencyRaw, "CNY")
  const categoryId = Number(categoryIdRaw)
  const brandId = Number(brandIdRaw)

  if (!name) {
    throw new Error("Укажите название товара.")
  }
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Цена должна быть положительным числом.")
  }
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new Error("Выберите категорию.")
  }
  if (!Number.isInteger(brandId) || brandId <= 0) {
    throw new Error("Выберите бренд.")
  }

  return {
    name,
    description: descriptionRaw ? descriptionRaw : null,
    price,
    priceCurrency,
    categoryId,
    brandId,
    sizes: sanitizeAttributeValues(sizes),
    colors: sanitizeAttributeValues(colors),
    seasons: Array.from(new Set(seasons)),
  }
}

function revalidateProductPaths() {
  revalidatePath("/admin/products")
  revalidatePath("/admin/brands")
  revalidatePath("/")
  revalidatePath("/catalog")
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  try {
    const payload = parsePayload(formData)
    const mainImageKeyRaw = formData.get("mainImageKey")
    const mainImageKey = typeof mainImageKeyRaw === "string" && mainImageKeyRaw ? mainImageKeyRaw : null
    const newImages = formData
      .getAll("newImages")
      .filter((value): value is File => value instanceof File && value.size > 0)

    const {
      supabase,
      user: { id: userId },
    } = await requireAdminUser()

    const { uploadedUrls, uploadedByKey } = await uploadProductImages(newImages, userId)
    const mainImageUrl = resolveMainImageUrl(mainImageKey, [], uploadedByKey)
    const finalImages = reorderImagesWithMain(uploadedUrls, mainImageUrl)
    await Promise.all([
      upsertAttributeOptions(supabase, "sizes", payload.sizes),
      upsertAttributeOptions(supabase, "colors", payload.colors),
    ])

    const { error } = await supabase.from("products").insert({
      name: payload.name,
      description: payload.description,
      price: payload.price,
      price_currency: payload.priceCurrency,
      category_id: payload.categoryId,
      brand_id: payload.brandId,
      sizes: payload.sizes,
      colors: payload.colors,
      seasons: payload.seasons,
      images: finalImages,
    })

    if (error) {
      if (uploadedUrls.length > 0) {
        await removeProductImagesByUrls(uploadedUrls)
      }
      throw new Error(`Не удалось создать товар: ${error.message}`)
    }

    revalidateProductPaths()
    return { ok: true }
  } catch (error) {
    logger.error("admin.products.create", "Failed to create product", error)
    return {
      ok: false,
      error: toActionError(error),
    }
  }
}

export async function updateProduct(id: number, formData: FormData): Promise<ActionResult> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Некорректный ID товара.")
    }

    const payload = parsePayload(formData)
    const removedImages = parseJsonStringArray(formData.get("removedImages"), "removedImages")
    const mainImageKeyRaw = formData.get("mainImageKey")
    const mainImageKey = typeof mainImageKeyRaw === "string" && mainImageKeyRaw ? mainImageKeyRaw : null
    const newImages = formData
      .getAll("newImages")
      .filter((value): value is File => value instanceof File && value.size > 0)

    const {
      supabase,
      user: { id: userId },
    } = await requireAdminUser()

    const { data: currentProduct, error: currentError } = await supabase
      .from("products")
      .select("images")
      .eq("id", id)
      .single()

    if (currentError || !currentProduct) {
      throw new Error("Товар не найден.")
    }

    const currentImages = (currentProduct.images ?? []) as string[]
    const removedSet = new Set(removedImages)
    const keptImages = currentImages.filter((url) => !removedSet.has(url))

    const { uploadedUrls, uploadedByKey } = await uploadProductImages(newImages, userId)
    const mainImageUrl = resolveMainImageUrl(mainImageKey, keptImages, uploadedByKey)
    const finalImages = reorderImagesWithMain([...keptImages, ...uploadedUrls], mainImageUrl)
    await Promise.all([
      upsertAttributeOptions(supabase, "sizes", payload.sizes),
      upsertAttributeOptions(supabase, "colors", payload.colors),
    ])

    const { error: updateError } = await supabase
      .from("products")
      .update({
        name: payload.name,
        description: payload.description,
        price: payload.price,
        price_currency: payload.priceCurrency,
        category_id: payload.categoryId,
        brand_id: payload.brandId,
        sizes: payload.sizes,
        colors: payload.colors,
        seasons: payload.seasons,
        images: finalImages,
      })
      .eq("id", id)

    if (updateError) {
      if (uploadedUrls.length > 0) {
        await removeProductImagesByUrls(uploadedUrls)
      }
      throw new Error(`Не удалось обновить товар: ${updateError.message}`)
    }

    if (removedImages.length > 0) {
      await removeProductImagesByUrls(removedImages)
    }

    revalidateProductPaths()
    return { ok: true }
  } catch (error) {
    logger.error("admin.products.update", "Failed to update product", { id, error })
    return {
      ok: false,
      error: toActionError(error),
    }
  }
}

export async function deleteProduct(id: number): Promise<ActionResult> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Некорректный ID товара.")
    }

    const { supabase } = await requireAdminUser()
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("images")
      .eq("id", id)
      .single()

    if (productError || !product) {
      throw new Error("Товар не найден.")
    }

    const images = (product.images ?? []) as string[]
    if (images.length > 0) {
      await removeProductImagesByUrls(images)
    }

    const { error: deleteError } = await supabase.from("products").delete().eq("id", id)
    if (deleteError) {
      throw new Error(`Не удалось удалить товар: ${deleteError.message}`)
    }

    revalidateProductPaths()
    return { ok: true }
  } catch (error) {
    logger.error("admin.products.delete", "Failed to delete product", { id, error })
    return {
      ok: false,
      error: toActionError(error),
    }
  }
}
