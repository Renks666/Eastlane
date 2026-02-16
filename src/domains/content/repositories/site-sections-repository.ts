import type { SupabaseClient } from "@supabase/supabase-js"
import type { ContentSection, ContentSectionKey } from "@/src/domains/content/types"

type SiteSectionRow = {
  section_key: ContentSectionKey
  title: string | null
  payload: unknown
  is_published: boolean | null
  updated_at: string | null
}

export async function loadSiteSectionsByKeys(
  supabase: SupabaseClient,
  keys: ContentSectionKey[]
): Promise<Partial<Record<ContentSectionKey, ContentSection>>> {
  const { data, error } = await supabase
    .from("site_sections")
    .select("section_key,title,payload,is_published,updated_at")
    .in("section_key", keys)

  if (error) {
    if (error.message.toLowerCase().includes("site_sections")) {
      return {}
    }
    throw new Error(`Failed to load site content: ${error.message}`)
  }

  const rows = (data ?? []) as SiteSectionRow[]
  return rows.reduce((acc, row) => {
    acc[row.section_key] = {
      key: row.section_key,
      title: row.title ?? row.section_key,
      payload: row.payload,
      isPublished: Boolean(row.is_published ?? true),
      updatedAt: row.updated_at,
    }
    return acc
  }, {} as Partial<Record<ContentSectionKey, ContentSection>>)
}

