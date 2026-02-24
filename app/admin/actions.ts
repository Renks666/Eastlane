"use server"

import { revalidatePath } from "next/cache"
import { exchangeRateSectionSchema } from "@/src/domains/content/exchange-rate-schema"
import { upsertSiteSection } from "@/src/domains/content/repositories/site-sections-repository"
import { requireAdminUser } from "@/src/shared/lib/auth/require-admin"
import { toActionError } from "@/src/shared/lib/action-result"
import { logger } from "@/src/shared/lib/logger"

type ActionResult = {
  ok: boolean
  error?: string
}

export async function saveExchangeRateSection(formData: FormData): Promise<ActionResult> {
  try {
    const cnyPerRubRaw = String(formData.get("cnyPerRub") ?? "").trim()
    const parsedRate = exchangeRateSectionSchema.safeParse({ cnyPerRub: cnyPerRubRaw })

    if (!parsedRate.success) {
      throw new Error("Укажите корректный курс юаня к рублю.")
    }

    const { supabase } = await requireAdminUser()

    await upsertSiteSection(supabase, {
      key: "exchange_rate",
      title: "Курс CNY/RUB",
      payload: parsedRate.data,
      isPublished: true,
    })

    revalidatePath("/")
    revalidatePath("/catalog")
    revalidatePath("/admin")

    return { ok: true }
  } catch (error) {
    logger.error("admin.exchangeRate.save", "Failed to save exchange rate", error)
    return {
      ok: false,
      error: toActionError(error),
    }
  }
}

