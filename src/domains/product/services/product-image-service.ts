import { createAdminClient } from "@/src/shared/lib/supabase/admin"

const PRODUCT_IMAGES_BUCKET = "product-images"

function extractStoragePathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`
  const markerIndex = url.indexOf(marker)
  if (markerIndex === -1) return null

  const path = url.slice(markerIndex + marker.length)
  return path ? decodeURIComponent(path) : null
}

export function buildNewImageKey(file: File) {
  return `new:${file.name}:${file.size}:${file.lastModified}`
}

export async function uploadProductImages(files: File[], userId: string) {
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

  return { uploadedUrls, uploadedByKey }
}

export async function removeProductImagesByUrls(urls: string[]) {
  if (!urls.length) return

  const adminSupabase = createAdminClient()
  const paths = urls.map(extractStoragePathFromPublicUrl).filter((path): path is string => Boolean(path))

  if (!paths.length) return

  const { error } = await adminSupabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths)
  if (error) {
    throw new Error(`Failed to remove images: ${error.message}`)
  }
}

export function resolveMainImageUrl(
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

export function reorderImagesWithMain(images: string[], mainImageUrl: string | null) {
  if (!mainImageUrl || !images.includes(mainImageUrl)) {
    return images
  }

  return [mainImageUrl, ...images.filter((url) => url !== mainImageUrl)]
}

