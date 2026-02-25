import type { SupabaseClient } from "@supabase/supabase-js"
import { normalizeAttributeValue, sanitizeAttributeValues } from "@/src/domains/product-attributes/types"

type AttributeTable = "product_sizes" | "product_colors"

function tableFromKind(kind: "sizes" | "colors"): AttributeTable {
  return kind === "sizes" ? "product_sizes" : "product_colors"
}

type AttributeOptionRow = {
  id: number
  value: string
  value_normalized: string
  is_active: boolean
}

type AttributeLinkTable = "product_size_values" | "product_color_values"
type LinkColumn = "size_id" | "color_id"

function linkMetaFromKind(kind: "sizes" | "colors") {
  if (kind === "sizes") {
    return {
      optionTable: "product_sizes" as const,
      linkTable: "product_size_values" as AttributeLinkTable,
      linkColumn: "size_id" as LinkColumn,
    }
  }

  return {
    optionTable: "product_colors" as const,
    linkTable: "product_color_values" as AttributeLinkTable,
    linkColumn: "color_id" as LinkColumn,
  }
}

function isMissingRelationError(errorMessage: string) {
  return /relation .* does not exist|Could not find the table|schema cache/i.test(errorMessage)
}

export async function canonicalizeAttributeValues(
  supabase: SupabaseClient,
  kind: "sizes" | "colors",
  values: string[],
  options?: { createMissing?: boolean }
) {
  const createMissing = options?.createMissing ?? true
  const table = tableFromKind(kind)
  const sanitized = sanitizeAttributeValues(values)
  if (sanitized.length === 0) return []

  const desiredByNormalized = new Map<string, string>()
  for (const value of sanitized) {
    desiredByNormalized.set(normalizeAttributeValue(value), value)
  }

  const normalizedValues = Array.from(desiredByNormalized.keys())
  const { data: existing, error: existingError } = await supabase
    .from(table)
    .select("id, value, value_normalized, is_active")
    .in("value_normalized", normalizedValues)

  if (existingError) {
    throw new Error(`Failed to load ${kind} options: ${existingError.message}`)
  }

  const existingByNormalized = new Map(
    ((existing ?? []) as AttributeOptionRow[]).map((item) => [item.value_normalized, item] as const)
  )

  const missingPayload = normalizedValues
    .filter((normalized) => !existingByNormalized.has(normalized))
    .map((normalized) => ({
      value: desiredByNormalized.get(normalized)!,
      value_normalized: normalized,
      is_active: true,
    }))

  if (missingPayload.length > 0) {
    if (!createMissing) {
      throw new Error(`Some ${kind} values are not present in dictionary.`)
    }
    const { error: upsertError } = await supabase.from(table).upsert(missingPayload, { onConflict: "value_normalized" })
    if (upsertError) {
      throw new Error(`Failed to upsert ${kind} options: ${upsertError.message}`)
    }

    const { data: reloaded, error: reloadError } = await supabase
      .from(table)
      .select("id, value, value_normalized, is_active")
      .in("value_normalized", normalizedValues)

    if (reloadError) {
      throw new Error(`Failed to reload ${kind} options: ${reloadError.message}`)
    }

    existingByNormalized.clear()
    for (const item of (reloaded ?? []) as AttributeOptionRow[]) {
      existingByNormalized.set(item.value_normalized, item)
    }
  }

  return sanitized.map((value) => {
    const normalized = normalizeAttributeValue(value)
    const option = existingByNormalized.get(normalized)
    return option?.value ?? value
  })
}

export async function upsertAttributeOptions(
  supabase: SupabaseClient,
  kind: "sizes" | "colors",
  values: string[]
) {
  await canonicalizeAttributeValues(supabase, kind, values, { createMissing: true })
}

export async function isAttributeOptionUsed(
  supabase: SupabaseClient,
  kind: "sizes" | "colors",
  normalizedValue: string
) {
  const { optionTable, linkTable, linkColumn } = linkMetaFromKind(kind)
  const { data: optionRows, error: optionError } = await supabase
    .from(optionTable)
    .select("id")
    .eq("value_normalized", normalizedValue)
    .limit(1)

  if (optionError) {
    throw new Error(`Failed to resolve ${kind} option: ${optionError.message}`)
  }

  const optionId = Number((optionRows?.[0] as { id?: number } | undefined)?.id)
  if (!Number.isInteger(optionId) || optionId <= 0) {
    return false
  }

  const { count, error: linkError } = await supabase
    .from(linkTable)
    .select("product_id", { count: "exact", head: true })
    .eq(linkColumn, optionId)

  if (!linkError) {
    return (count ?? 0) > 0
  }

  if (!isMissingRelationError(linkError.message)) {
    throw new Error(`Failed to check ${kind} usage in links: ${linkError.message}`)
  }

  if (kind === "sizes") {
    const { data, error } = await supabase.from("products").select("sizes")
    if (error) {
      throw new Error(`Failed to check ${kind} usage: ${error.message}`)
    }
    return (data ?? []).some((row) => ((row.sizes ?? []) as string[]).some((value) => normalizeAttributeValue(value) === normalizedValue))
  }

  const { data, error } = await supabase.from("products").select("colors")
  if (error) {
    throw new Error(`Failed to check ${kind} usage: ${error.message}`)
  }
  return (data ?? []).some((row) => ((row.colors ?? []) as string[]).some((value) => normalizeAttributeValue(value) === normalizedValue))
}
