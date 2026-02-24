"use server"

import { revalidatePath } from "next/cache"
import { requireAdminUser } from "@/src/shared/lib/auth/require-admin"
import { isAttributeOptionUsed } from "@/src/domains/product-attributes/services/attribute-options-service"
import { normalizeAttributeValue } from "@/src/domains/product-attributes/types"

type AttributeKind = "size" | "color"

function tableName(kind: AttributeKind) {
  return kind === "size" ? "product_sizes" : "product_colors"
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
  const value = String(formData.get("value") ?? "").trim().replace(/\s+/g, " ")
  const sortOrder = Number(String(formData.get("sortOrder") ?? "100").trim())
  const isActive = String(formData.get("isActive") ?? "") === "on"

  if (!value) {
    throw new Error("Укажите значение.")
  }
  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new Error("Порядок сортировки должен быть целым числом >= 0.")
  }

  return { kind, value, sortOrder, isActive }
}

function revalidatePaths() {
  revalidatePath("/admin/attributes")
  revalidatePath("/admin/products")
}

export async function createAttributeOption(formData: FormData): Promise<void> {
  const payload = parsePayload(formData)
  const { supabase } = await requireAdminUser()
  const table = tableName(payload.kind)

  const { error } = await supabase.from(table).upsert(
    {
      value: payload.value,
      value_normalized: normalizeAttributeValue(payload.value),
      sort_order: payload.sortOrder,
      is_active: payload.isActive,
    },
    { onConflict: "value_normalized" }
  )

  if (error) {
    throw new Error(`Не удалось создать значение: ${error.message}`)
  }
  revalidatePaths()
}

export async function updateAttributeOption(formData: FormData): Promise<void> {
  const id = Number(String(formData.get("id") ?? "").trim())
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Некорректный ID.")
  }

  const payload = parsePayload(formData)
  const { supabase } = await requireAdminUser()
  const table = tableName(payload.kind)

  const { error } = await supabase
    .from(table)
    .update({
      value: payload.value,
      value_normalized: normalizeAttributeValue(payload.value),
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
