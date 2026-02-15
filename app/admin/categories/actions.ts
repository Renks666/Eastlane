"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

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
    throw new Error("Category name is required.")
  }
  if (!slug) {
    throw new Error("Slug is required.")
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("Slug may contain only lowercase letters, numbers and hyphens.")
  }

  return { name, slug }
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

  return supabase
}

async function ensureSlugUnique(supabase: Awaited<ReturnType<typeof createClient>>, slug: string, excludeId?: number) {
  const query = supabase.from("categories").select("id").eq("slug", slug)
  const { data, error } = excludeId
    ? await query.neq("id", excludeId).limit(1)
    : await query.limit(1)

  if (error) {
    throw new Error(`Failed to validate slug: ${error.message}`)
  }

  if ((data?.length ?? 0) > 0) {
    throw new Error("Category with this slug already exists.")
  }
}

function revalidateCategoryPaths() {
  revalidatePath("/admin/categories")
  revalidatePath("/admin/products")
  revalidatePath("/")
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  try {
    const payload = parsePayload(formData)
    const supabase = await requireAuthenticatedUser()

    await ensureSlugUnique(supabase, payload.slug)

    const { error } = await supabase.from("categories").insert({
      name: payload.name,
      slug: payload.slug,
    })

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`)
    }

    revalidateCategoryPaths()
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unexpected error.",
    }
  }
}

export async function updateCategory(id: number, formData: FormData): Promise<ActionResult> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid category ID.")
    }

    const payload = parsePayload(formData)
    const supabase = await requireAuthenticatedUser()
    await ensureSlugUnique(supabase, payload.slug, id)

    const { error } = await supabase
      .from("categories")
      .update({
        name: payload.name,
        slug: payload.slug,
      })
      .eq("id", id)

    if (error) {
      throw new Error(`Failed to update category: ${error.message}`)
    }

    revalidateCategoryPaths()
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unexpected error.",
    }
  }
}

export async function deleteCategory(id: number): Promise<ActionResult> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid category ID.")
    }

    const supabase = await requireAuthenticatedUser()

    const { count, error: countError } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id)

    if (countError) {
      throw new Error(`Failed to check category usage: ${countError.message}`)
    }

    if ((count ?? 0) > 0) {
      throw new Error("Cannot delete category because it is used by products.")
    }

    const { error } = await supabase.from("categories").delete().eq("id", id)
    if (error) {
      throw new Error(`Failed to delete category: ${error.message}`)
    }

    revalidateCategoryPaths()
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unexpected error.",
    }
  }
}
