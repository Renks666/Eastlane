"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAdminUser } from "@/src/shared/lib/auth/require-admin"
import { isAttributeOptionUsed } from "@/src/domains/product-attributes/services/attribute-options-service"
import { looksLikeSizeValue, normalizeAttributeValue } from "@/src/domains/product-attributes/types"

type AttributeKind = "size" | "color"
type AttributeTable = "product_sizes" | "product_colors"

function tableName(kind: AttributeKind): AttributeTable {
  return kind === "size" ? "product_sizes" : "product_colors"
}

function capitalizeFirstLetter(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`
}

async function assertNoDuplicateOption(
  supabase: Awaited<ReturnType<typeof requireAdminUser>>["supabase"],
  table: AttributeTable,
  normalizedValue: string,
  excludeId?: number
) {
  let query = supabase.from(table).select("id").eq("value_normalized", normalizedValue).limit(1)
  if (excludeId) {
    query = query.neq("id", excludeId)
  }

  const { data, error } = await query
  if (error) {
    throw new Error(`Не удалось проверить дубликаты: ${error.message}`)
  }
  if ((data ?? []).length > 0) {
    throw new Error("Такое значение уже существует.")
  }
}

function parseKind(value: FormDataEntryValue | null): AttributeKind {
  const kind = String(value ?? "").trim()
  if (kind !== "size" && kind !== "color") {
    throw new Error("Некорректный тип атрибута.")
  }
  return kind
}

function parsePayload(formData: FormData) {
  const kind = parseKind(formData.get("kind"))
  const rawValue = String(formData.get("value") ?? "").trim().replace(/\s+/g, " ")
  const value = kind === "color" ? capitalizeFirstLetter(rawValue) : rawValue
  const sortOrder = Number(String(formData.get("sortOrder") ?? "100").trim())
  const isActive = String(formData.get("isActive") ?? "") === "on"

  if (!value) {
    throw new Error("Укажите значение.")
  }
  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new Error("Порядок сортировки должен быть целым числом >= 0.")
  }
  if (kind === "color" && looksLikeSizeValue(value)) {
    throw new Error("Цвет не может быть похож на размер.")
  }

  return { kind, value, sortOrder, isActive }
}

function revalidatePaths() {
  revalidatePath("/admin/attributes")
  revalidatePath("/admin/products")
  revalidatePath("/catalog")
}

function tabFromKind(kind: AttributeKind): "sizes" | "colors" {
  return kind === "size" ? "sizes" : "colors"
}

function encodeErrorRedirect(tab: "sizes" | "colors", message: string) {
  const params = new URLSearchParams()
  params.set("tab", tab)
  params.set("error", message)
  return `/admin/attributes?${params.toString()}`
}

export async function createAttributeOption(formData: FormData): Promise<void> {
  let tab: "sizes" | "colors" = "sizes"

  try {
    const payload = parsePayload(formData)
    tab = tabFromKind(payload.kind)
    const { supabase } = await requireAdminUser()
    const table = tableName(payload.kind)
    const normalizedValue = normalizeAttributeValue(payload.value)

    await assertNoDuplicateOption(supabase, table, normalizedValue)

    const { error } = await supabase.from(table).insert({
      value: payload.value,
      value_normalized: normalizedValue,
      sort_order: payload.sortOrder,
      is_active: payload.isActive,
    })

    if (error) {
      throw new Error(`Не удалось создать значение: ${error.message}`)
    }
    revalidatePaths()
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось создать значение."
    redirect(encodeErrorRedirect(tab, message))
  }
}

export async function updateAttributeOption(formData: FormData): Promise<void> {
  const id = Number(String(formData.get("id") ?? "").trim())
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Некорректный ID.")
  }

  const payload = parsePayload(formData)
  const { supabase } = await requireAdminUser()
  const table = tableName(payload.kind)
  const normalizedValue = normalizeAttributeValue(payload.value)

  await assertNoDuplicateOption(supabase, table, normalizedValue, id)

  const { error } = await supabase
    .from(table)
    .update({
      value: payload.value,
      value_normalized: normalizedValue,
      sort_order: payload.sortOrder,
      is_active: payload.isActive,
    })
    .eq("id", id)

  if (error) {
    throw new Error(`Не удалось обновить значение: ${error.message}`)
  }
  revalidatePaths()
}

export async function deleteAttributeOption(formData: FormData): Promise<void> {
  const id = Number(String(formData.get("id") ?? "").trim())
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Некорректный ID.")
  }

  const kind = parseKind(formData.get("kind"))
  const normalizedValue = String(formData.get("valueNormalized") ?? "").trim()
  if (!normalizedValue) {
    throw new Error("Некорректное нормализованное значение.")
  }

  const { supabase } = await requireAdminUser()
  const used = await isAttributeOptionUsed(supabase, kind === "size" ? "sizes" : "colors", normalizedValue)
  if (used) {
    throw new Error("Нельзя удалить значение: оно используется в товарах.")
  }

  const table = tableName(kind)
  const { error } = await supabase.from(table).delete().eq("id", id)
  if (error) {
    throw new Error(`Не удалось удалить значение: ${error.message}`)
  }
  revalidatePaths()
}
