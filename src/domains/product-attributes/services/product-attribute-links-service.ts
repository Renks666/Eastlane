import type { SupabaseClient } from "@supabase/supabase-js"
import { normalizeAttributeValue, sanitizeAttributeValues } from "@/src/domains/product-attributes/types"

type SizeRow = { id: number; value_normalized: string }
type ColorRow = { id: number; value_normalized: string }

function withMigrationHint(message: string) {
  if (/relation .* does not exist|Could not find the table|schema cache/i.test(message)) {
    return `${message}. Apply docs/sql/product_attribute_values.sql and docs/sql/product_attribute_values_rls.sql.`
  }
  return message
}

export async function syncProductAttributeLinks(
  supabase: SupabaseClient,
  productId: number,
  payload: {
    sizes: string[]
    colors: string[]
  }
) {
  const sizes = sanitizeAttributeValues(payload.sizes)
  const colors = sanitizeAttributeValues(payload.colors)
  const sizeNormalized = Array.from(new Set(sizes.map((value) => normalizeAttributeValue(value))))
  const colorNormalized = Array.from(new Set(colors.map((value) => normalizeAttributeValue(value))))

  const [sizeRowsResult, colorRowsResult] = await Promise.all([
    sizeNormalized.length > 0
      ? supabase.from("product_sizes").select("id, value_normalized").in("value_normalized", sizeNormalized)
      : Promise.resolve({ data: [] as SizeRow[], error: null }),
    colorNormalized.length > 0
      ? supabase.from("product_colors").select("id, value_normalized").in("value_normalized", colorNormalized)
      : Promise.resolve({ data: [] as ColorRow[], error: null }),
  ])

  if (sizeRowsResult.error) {
    throw new Error(`Failed to resolve size links: ${sizeRowsResult.error.message}`)
  }
  if (colorRowsResult.error) {
    throw new Error(`Failed to resolve color links: ${colorRowsResult.error.message}`)
  }

  const sizeRows = (sizeRowsResult.data ?? []) as SizeRow[]
  const colorRows = (colorRowsResult.data ?? []) as ColorRow[]
  const sizeIds = sizeNormalized
    .map((normalized) => sizeRows.find((row) => row.value_normalized === normalized)?.id)
    .filter((id): id is number => Number.isInteger(id))
  const colorIds = colorNormalized
    .map((normalized) => colorRows.find((row) => row.value_normalized === normalized)?.id)
    .filter((id): id is number => Number.isInteger(id))

  const { error: deleteSizesError } = await supabase.from("product_size_values").delete().eq("product_id", productId)
  if (deleteSizesError) {
    throw new Error(`Failed to reset product size links: ${withMigrationHint(deleteSizesError.message)}`)
  }
  const { error: deleteColorsError } = await supabase.from("product_color_values").delete().eq("product_id", productId)
  if (deleteColorsError) {
    throw new Error(`Failed to reset product color links: ${withMigrationHint(deleteColorsError.message)}`)
  }

  if (sizeIds.length > 0) {
    const { error } = await supabase
      .from("product_size_values")
      .insert(sizeIds.map((sizeId) => ({ product_id: productId, size_id: sizeId })))
    if (error) {
      throw new Error(`Failed to create product size links: ${withMigrationHint(error.message)}`)
    }
  }

  if (colorIds.length > 0) {
    const { error } = await supabase
      .from("product_color_values")
      .insert(colorIds.map((colorId) => ({ product_id: productId, color_id: colorId })))
    if (error) {
      throw new Error(`Failed to create product color links: ${withMigrationHint(error.message)}`)
    }
  }
}
