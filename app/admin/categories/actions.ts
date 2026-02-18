"use server"

import { revalidatePath } from "next/cache"
import { requireAdminUser } from "@/src/shared/lib/auth/require-admin"
import { logger } from "@/src/shared/lib/logger"
import { toActionError } from "@/src/shared/lib/action-result"

type ActionResult = {
  ok: boolean
  error?: string
}

type CategoryPayload = {
  name: string
  slug: string
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

function parsePayload(formData: FormData): CategoryPayload {
  const name = String(formData.get("name") ?? "").trim()
  const slugRaw = String(formData.get("slug") ?? "").trim()
  const slug = slugify(slugRaw || name)

  if (!name) {
    throw new Error("Укажите название категории.")
  }
  if (!slug) {
    throw new Error("Укажите slug.")
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("Slug может содержать только строчные латинские буквы, цифры и дефис.")
  }

  return { name, slug }
}

async function ensureSlugUnique(supabase: Awaited<ReturnType<typeof requireAdminUser>>["supabase"], slug: string, excludeId?: number) {
  const query = supabase.from("categories").select("id").eq("slug", slug)
  const { data, error } = excludeId ? await query.neq("id", excludeId).limit(1) : await query.limit(1)

  if (error) {
    throw new Error(`Ошибка проверки slug: ${error.message}`)
  }

  if ((data?.length ?? 0) > 0) {
    throw new Error("Категория с таким slug уже существует.")
  }
}

function revalidateCategoryPaths() {
  revalidatePath("/admin/categories")
  revalidatePath("/admin/products")
  revalidatePath("/")
  revalidatePath("/catalog")
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  try {
    const payload = parsePayload(formData)
    const { supabase } = await requireAdminUser()

    await ensureSlugUnique(supabase, payload.slug)

    const { error } = await supabase.from("categories").insert({
      name: payload.name,
      slug: payload.slug,
    })

    if (error) {
      throw new Error(`Не удалось создать категорию: ${error.message}`)
    }

    revalidateCategoryPaths()
    return { ok: true }
  } catch (error) {
    logger.error("admin.categories.create", "Failed to create category", error)
    return {
      ok: false,
      error: toActionError(error),
    }
  }
}

export async function updateCategory(id: number, formData: FormData): Promise<ActionResult> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Некорректный ID категории.")
    }

    const payload = parsePayload(formData)
    const { supabase } = await requireAdminUser()
    await ensureSlugUnique(supabase, payload.slug, id)

    const { error } = await supabase
      .from("categories")
      .update({
        name: payload.name,
        slug: payload.slug,
      })
      .eq("id", id)

    if (error) {
      throw new Error(`Не удалось обновить категорию: ${error.message}`)
    }

    revalidateCategoryPaths()
    return { ok: true }
  } catch (error) {
    logger.error("admin.categories.update", "Failed to update category", { id, error })
    return {
      ok: false,
      error: toActionError(error),
    }
  }
}

export async function deleteCategory(id: number): Promise<ActionResult> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Некорректный ID категории.")
    }

    const { supabase } = await requireAdminUser()

    const { count, error: countError } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id)

    if (countError) {
      throw new Error(`Не удалось проверить использование категории: ${countError.message}`)
    }

    if ((count ?? 0) > 0) {
      throw new Error("Нельзя удалить категорию: она используется товарами.")
    }

    const { error } = await supabase.from("categories").delete().eq("id", id)
    if (error) {
      throw new Error(`Не удалось удалить категорию: ${error.message}`)
    }

    revalidateCategoryPaths()
    return { ok: true }
  } catch (error) {
    logger.error("admin.categories.delete", "Failed to delete category", { id, error })
    return {
      ok: false,
      error: toActionError(error),
    }
  }
}
