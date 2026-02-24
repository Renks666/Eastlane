import type { SupabaseClient } from "@supabase/supabase-js"
import { normalizeAttributeValue, sanitizeAttributeValues } from "@/src/domains/product-attributes/types"

type AttributeTable = "product_sizes" | "product_colors"

function tableFromKind(kind: "sizes" | "colors"): AttributeTable {
  return kind === "sizes" ? "product_sizes" : "product_colors"
}

export async function upsertAttributeOptions(
  supabase: SupabaseClient,
  kind: "sizes" | "colors",
  values: string[]
) {
  const table = tableFromKind(kind)
  const sanitized = sanitizeAttributeValues(values)
  if (sanitized.length === 0) return

  const payload = sanitized.map((value) => ({
    value,
    value_normalized: normalizeAttributeValue(value),
    is_active: true,
  }))

  const { error } = await supabase.from(table).upsert(payload, { onConflict: "value_normalized" })
  if (error) {
    throw new Error(`Failed to upsert ${kind} options: ${error.message}`)
  }
}

export async function isAttributeOptionUsed(
  supabase: SupabaseClient,
  kind: "sizes" | "colors",
  normalizedValue: string
) {
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
