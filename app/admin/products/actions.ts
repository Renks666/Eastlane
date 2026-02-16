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

type ActionResult = {
  ok: boolean
  error?: string
}

type ProductPayload = {
  name: string
  description: string | null
  price: number
  categoryId: number
  sizes: string[]
  colors: string[]
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
  const categoryIdRaw = String(formData.get("categoryId") ?? "").trim()
  const sizes = parseJsonStringArray(formData.get("sizes"), "sizes")
  const colors = parseJsonStringArray(formData.get("colors"), "colors")

  const price = Number(priceRaw)
  const categoryId = Number(categoryIdRaw)

  if (!name) {
    throw new Error("Product name is required.")
  }
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Price must be a positive number.")
  }
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new Error("Category is required.")
  }

  return {
    name,
    description: descriptionRaw ? descriptionRaw : null,
    price,
    categoryId,
    sizes,
    colors,
  }
}

function revalidateProductPaths() {
  revalidatePath("/admin/products")
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

    const { error } = await supabase.from("products").insert({
      name: payload.name,
      description: payload.description,
      price: payload.price,
      category_id: payload.categoryId,
      sizes: payload.sizes,
      colors: payload.colors,
      images: finalImages,
    })

    if (error) {
      if (uploadedUrls.length > 0) {
        await removeProductImagesByUrls(uploadedUrls)
      }
      throw new Error(`Failed to create product: ${error.message}`)
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
      throw new Error("Invalid product ID.")
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
      throw new Error("Product not found.")
    }

    const currentImages = (currentProduct.images ?? []) as string[]
    const removedSet = new Set(removedImages)
    const keptImages = currentImages.filter((url) => !removedSet.has(url))

    const { uploadedUrls, uploadedByKey } = await uploadProductImages(newImages, userId)
    const mainImageUrl = resolveMainImageUrl(mainImageKey, keptImages, uploadedByKey)
    const finalImages = reorderImagesWithMain([...keptImages, ...uploadedUrls], mainImageUrl)

    const { error: updateError } = await supabase
      .from("products")
      .update({
        name: payload.name,
        description: payload.description,
        price: payload.price,
        category_id: payload.categoryId,
        sizes: payload.sizes,
        colors: payload.colors,
        images: finalImages,
      })
      .eq("id", id)

    if (updateError) {
      if (uploadedUrls.length > 0) {
        await removeProductImagesByUrls(uploadedUrls)
      }
      throw new Error(`Failed to update product: ${updateError.message}`)
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
      throw new Error("Invalid product ID.")
    }

    const { supabase } = await requireAdminUser()
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("images")
      .eq("id", id)
      .single()

    if (productError || !product) {
      throw new Error("Product not found.")
    }

    const images = (product.images ?? []) as string[]
    if (images.length > 0) {
      await removeProductImagesByUrls(images)
    }

    const { error: deleteError } = await supabase.from("products").delete().eq("id", id)
    if (deleteError) {
      throw new Error(`Failed to delete product: ${deleteError.message}`)
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
