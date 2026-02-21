import { z } from "zod"
import type { EastlaneTariffsSectionContent } from "@/src/domains/content/types"

const nonEmptyText = z.string().trim().min(1)
const positiveInteger = z.coerce.number().int().min(1)
const nonNegativeNumber = z.coerce.number().finite().min(0)

const eastlaneTariffExampleSchema = z.object({
  lines: z.array(nonEmptyText).min(1),
  resultLine: nonEmptyText,
})

const eastlaneTariffTierSchema = z.object({
  id: z.enum(["retail", "wholesale"]),
  title: nonEmptyText,
  minItems: positiveInteger,
  serviceFeeCny: nonNegativeNumber,
  serviceFeeRubApprox: nonNegativeNumber,
  example: eastlaneTariffExampleSchema,
  warning: nonEmptyText,
})

export const eastlaneTariffsSectionSchema = z.object({
  title: nonEmptyText,
  subtitle: nonEmptyText,
  tiers: z.tuple([eastlaneTariffTierSchema, eastlaneTariffTierSchema]),
  formulaTitle: nonEmptyText,
  formulaText: nonEmptyText,
  importantTitle: nonEmptyText,
  importantItems: z.array(nonEmptyText).min(1),
  returnPolicy: nonEmptyText,
})

export function parseEastlaneTariffsSectionPayload(
  payload: unknown,
  fallback: EastlaneTariffsSectionContent
): EastlaneTariffsSectionContent {
  if (!payload || typeof payload !== "object") {
    return fallback
  }

  const parsed = eastlaneTariffsSectionSchema.safeParse(payload)
  return parsed.success ? parsed.data : fallback
}
