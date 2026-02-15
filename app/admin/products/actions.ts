"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const PRODUCT_IMAGES_BUCKET = "product-images"

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

function buildNewImageKey(file: File) {
  return `new:${file.name}:${file.size}:${file.lastModified}`
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

function extractStoragePathFromPublicUrl(url: string): string | null {
  if (!url) return null

  const marker = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`
  const markerIndex = url.indexOf(marker)
  if (markerIndex === -1) return null

  const path = url.slice(markerIndex + marker.length)
  if (!path) return null

  return decodeURIComponent(path)
}

async function requireAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Unauthorized.")
  }

  return { supabase, user }
}

async function uploadFiles(files: File[], userId: string) {
  const adminSupabase = createAdminClient()
  const uploadedPaths: string[] = []
  const uploadedUrls: string[] = []
  const uploadedByKey = new Map<string, string>()

  for (const file of files) {
    const extension = file.name.includes(".") ? file.name.split(".").pop() : undefined
    const safeExt = extension ? extension.toLowerCase() : "bin"
    const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${safeExt}`

    const { error: uploadError } = await adminSupabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, file, {
        upsert: false,
        contentType: file.type || undefined,
      })

    if (uploadError) {
      if (uploadedPaths.length > 0) {
        await adminSupabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(uploadedPaths)
      }
      throw new Error(`Image upload failed: ${uploadError.message}`)
    }

    uploadedPaths.push(path)
    const { data } = adminSupabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path)
    uploadedUrls.push(data.publicUrl)
    uploadedByKey.set(buildNewImageKey(file), data.publicUrl)
  }

  return { uploadedPaths, uploadedUrls, uploadedByKey }
}

async function removeImageUrls(urls: string[]) {
  if (!urls.length) return
  const adminSupabase = createAdminClient()
  const paths = urls
    .map(extractStoragePathFromPublicUrl)
    .filter((path): path is string => Boolean(path))

  if (!paths.length) return

  const { error } = await adminSupabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths)
  if (error) {
    throw new Error(`Failed to remove images: ${error.message}`)
  }
}

function resolveMainImageUrl(
  mainImageKey: string | null,
  keptImages: string[],
  uploadedByKey: Map<string, string>
) {
  if (!mainImageKey) return null

  if (mainImageKey.startsWith("existing:")) {
    const existingUrl = mainImageKey.slice("existing:".length)
    return keptImages.includes(existingUrl) ? existingUrl : null
  }

  if (mainImageKey.startsWith("new:")) {
    return uploadedByKey.get(mainImageKey) ?? null
  }

  return null
}

function reorderImagesWithMain(images: string[], mainImageUrl: string | null) {
  if (!mainImageUrl) return images
  if (!images.includes(mainImageUrl)) return images

  return [mainImageUrl, ...images.filter((url) => url !== mainImageUrl)]
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
    } = await requireAuthenticatedUser()

    const { uploadedUrls, uploadedByKey } = await uploadFiles(newImages, userId)
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
        await removeImageUrls(uploadedUrls)
      }
      throw new Error(`Failed to create product: ${error.message}`)
    }

    revalidatePath("/admin/products")
    revalidatePath("/")
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unexpected error.",
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
    } = await requireAuthenticatedUser()

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

    const { uploadedUrls, uploadedByKey } = await uploadFiles(newImages, userId)
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
        await removeImageUrls(uploadedUrls)
      }
      throw new Error(`Failed to update product: ${updateError.message}`)
    }

    if (removedImages.length > 0) {
      await removeImageUrls(removedImages)
    }

    revalidatePath("/admin/products")
    revalidatePath("/")
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unexpected error.",
    }
  }
}

export async function deleteProduct(id: number): Promise<ActionResult> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid product ID.")
    }

    const { supabase } = await requireAuthenticatedUser()
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
      await removeImageUrls(images)
    }

    const { error: deleteError } = await supabase.from("products").delete().eq("id", id)
    if (deleteError) {
      throw new Error(`Failed to delete product: ${deleteError.message}`)
    }

    revalidatePath("/admin/products")
    revalidatePath("/")
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unexpected error.",
    }
  }
}
