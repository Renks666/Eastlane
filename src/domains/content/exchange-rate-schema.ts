import { z } from "zod"
import type { ExchangeRateSectionContent } from "@/src/domains/content/types"

const cnyPerRubSchema = z.coerce.number().finite().positive().max(10)

export const exchangeRateSectionSchema = z.object({
  cnyPerRub: cnyPerRubSchema,
})

export function parseExchangeRateSectionPayload(
  payload: unknown,
  fallback: ExchangeRateSectionContent
): ExchangeRateSectionContent {
  if (!payload || typeof payload !== "object") {
    return fallback
  }

  const parsed = exchangeRateSectionSchema.safeParse(payload)
  return parsed.success ? parsed.data : fallback
}

