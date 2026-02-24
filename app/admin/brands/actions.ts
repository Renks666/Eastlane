"use server"

import { revalidatePath } from "next/cache"
import { requireAdminUser } from "@/src/shared/lib/auth/require-admin"
import { logger } from "@/src/shared/lib/logger"
import { toActionError } from "@/src/shared/lib/action-result"
import { isBrandGroupKey } from "@/src/domains/brand/types"

type ActionResult = {
  ok: boolean
  error?: string
}

type BrandPayload = {
  name: string
  slug: string
  groupKey: string
  sortOrder: number
  isActive: boolean
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

function parseBoolean(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return false
  return value === "true" || value === "1" || value === "on"
}

function parsePayload(formData: FormData): BrandPayload {
  const name = String(formData.get("name") ?? "").trim()
  const slugRaw = String(formData.get("slug") ?? "").trim()
  const groupKeyRaw = String(formData.get("groupKey") ?? "").trim()
  const sortOrderRaw = String(formData.get("sortOrder") ?? "").trim()
  const isActive = parseBoolean(formData.get("isActive"))

  const slug = slugify(slugRaw || name)
  const sortOrder = Number(sortOrderRaw || "100")

  if (!name) {
    throw new Error("Укажите название бренда.")
  }
  if (!slug) {
    throw new Error("Укажите slug.")
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("Slug может содержать только строчные латинские буквы, цифры и дефис.")
  }
  if (!isBrandGroupKey(groupKeyRaw)) {
    throw new Error("Некорректная группа бренда.")
  }
  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new Error("Порядок сортировки должен быть целым числом больше или равным 0.")
  }

  return {
    name,
    slug,
    groupKey: groupKeyRaw,
    sortOrder,
    isActive,
  }
}

async function ensureUnique(
  supabase: Awaited<ReturnType<typeof requireAdminUser>>["supabase"],
  payload: BrandPayload,
  excludeId?: number
) {
  const slugQuery = supabase.from("brands").select("id").eq("slug", payload.slug)
  const nameQuery = supabase.from("brands").select("id").eq("name", payload.name)

  const [slugResult, nameResult] = await Promise.all([
    excludeId ? slugQuery.neq("id", excludeId).limit(1) : slugQuery.limit(1),
    excludeId ? nameQuery.neq("id", excludeId).limit(1) : nameQuery.limit(1),
  ])

  if (slugResult.error) {
    throw new Error(`Ошибка проверки slug: ${slugResult.error.message}`)
  }
  if (nameResult.error) {
    throw new Error(`Ошибка проверки названия: ${nameResult.error.message}`)
  }
  if ((slugResult.data?.length ?? 0) > 0) {
    throw new Error("Бренд с таким slug уже существует.")
  }
  if ((nameResult.data?.length ?? 0) > 0) {
    throw new Error("Бренд с таким названием уже существует.")
  }
}

function revalidateBrandPaths() {
  revalidatePath("/admin/brands")
  revalidatePath("/admin/products")
  revalidatePath("/catalog")
  revalidatePath("/")
}

export async function createBrand(formData: FormData): Promise<ActionResult> {
  try {
    const payload = parsePayload(formData)
    const { supabase } = await requireAdminUser()

    await ensureUnique(supabase, payload)

    const { error } = await supabase.from("brands").insert({
      name: payload.name,
      slug: payload.slug,
      group_key: payload.groupKey,
      sort_order: payload.sortOrder,
      is_active: payload.isActive,
    })

    if (error) {
      throw new Error(`Не удалось создать бренд: ${error.message}`)
    }

    revalidateBrandPaths()
    return { ok: true }
  } catch (error) {
    logger.error("admin.brands.create", "Failed to create brand", error)
    return {
      ok: false,
      error: toActionError(error),
    }
  }
}

export async function updateBrand(id: number, formData: FormData): Promise<ActionResult> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Некорректный ID бренда.")
    }

    const payload = parsePayload(formData)
    const { supabase } = await requireAdminUser()

    await ensureUnique(supabase, payload, id)

    const { error } = await supabase
      .from("brands")
      .update({
        name: payload.name,
        slug: payload.slug,
        group_key: payload.groupKey,
        sort_order: payload.sortOrder,
        is_active: payload.isActive,
      })
      .eq("id", id)

    if (error) {
      throw new Error(`Не удалось обновить бренд: ${error.message}`)
    }

    revalidateBrandPaths()
    return { ok: true }
  } catch (error) {
    logger.error("admin.brands.update", "Failed to update brand", { id, error })
    return {
      ok: false,
      error: toActionError(error),
    }
  }
}

export async function deleteBrand(id: number): Promise<ActionResult> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Некорректный ID бренда.")
    }

    const { supabase } = await requireAdminUser()

    const { count, error: countError } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("brand_id", id)

    if (countError) {
      throw new Error(`Не удалось проверить использование бренда: ${countError.message}`)
    }
    if ((count ?? 0) > 0) {
      throw new Error("Нельзя удалить бренд: он используется товарами.")
    }

    const { error } = await supabase.from("brands").delete().eq("id", id)
    if (error) {
      throw new Error(`Не удалось удалить бренд: ${error.message}`)
    }

    revalidateBrandPaths()
    return { ok: true }
  } catch (error) {
    logger.error("admin.brands.delete", "Failed to delete brand", { id, error })
    return {
      ok: false,
      error: toActionError(error),
    }
  }
}
