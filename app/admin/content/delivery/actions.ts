"use server"

import { revalidatePath } from "next/cache"
import { deliveryRatesSectionSchema } from "@/src/domains/content/delivery-rates-schema"
import { upsertSiteSection } from "@/src/domains/content/repositories/site-sections-repository"
import { requireAdminUser } from "@/src/shared/lib/auth/require-admin"
import { toActionError } from "@/src/shared/lib/action-result"
import { logger } from "@/src/shared/lib/logger"

type ActionResult = {
  ok: boolean
  error?: string
}

function parsePayload(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim()
  const payloadRaw = String(formData.get("payload") ?? "")
  const isPublishedRaw = String(formData.get("isPublished") ?? "true")

  if (!title) {
    throw new Error("Укажите заголовок секции.")
  }

  let parsedPayload: unknown
  try {
    parsedPayload = JSON.parse(payloadRaw)
  } catch {
    throw new Error("Некорректный формат данных тарифов.")
  }

  const payloadResult = deliveryRatesSectionSchema.safeParse(parsedPayload)
  if (!payloadResult.success) {
    throw new Error("Проверьте заполнение тарифов: часть полей некорректна.")
  }

  return {
    title,
    payload: payloadResult.data,
    isPublished: isPublishedRaw === "true",
  }
}

export async function saveDeliveryRatesSection(formData: FormData): Promise<ActionResult> {
  try {
    const payload = parsePayload(formData)
    const { supabase } = await requireAdminUser()

    await upsertSiteSection(supabase, {
      key: "delivery_rates",
      title: payload.title,
      payload: payload.payload,
      isPublished: payload.isPublished,
    })

    revalidatePath("/delivery")
    revalidatePath("/admin/content/delivery")
    return { ok: true }
  } catch (error) {
    logger.error("admin.content.delivery.save", "Failed to save delivery rates section", error)
    return {
      ok: false,
      error: toActionError(error),
    }
  }
}
