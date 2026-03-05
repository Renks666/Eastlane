import { z } from "zod"
import type {
  EastlaneTariffsEditablePayload,
  EastlaneTariffsSectionContent,
} from "@/src/domains/content/types"

const positiveInteger = z.coerce.number().int().min(1)
const nonNegativeNumber = z.coerce.number().finite().min(0)

const eastlaneTariffEditableTierSchema = z.object({
  id: z.enum(["retail", "wholesale"]),
  minItems: positiveInteger,
  serviceFeeCny: nonNegativeNumber,
  serviceFeeRubApprox: nonNegativeNumber,
})

export const eastlaneTariffsEditableSchema = z.object({
  tiers: z.tuple([eastlaneTariffEditableTierSchema, eastlaneTariffEditableTierSchema]),
})

export function extractEastlaneTariffsEditablePayload(
  content: EastlaneTariffsSectionContent
): EastlaneTariffsEditablePayload {
  return {
    tiers: content.tiers.map((tier) => ({
      id: tier.id,
      minItems: tier.minItems,
      serviceFeeCny: tier.serviceFeeCny,
      serviceFeeRubApprox: tier.serviceFeeRubApprox,
    })) as EastlaneTariffsEditablePayload["tiers"],
  }
}

export function mergeEastlaneTariffsWithEditablePayload(
  fallback: EastlaneTariffsSectionContent,
  editablePayload: EastlaneTariffsEditablePayload
): EastlaneTariffsSectionContent {
  const editableById = new Map(
    editablePayload.tiers.map((tier) => [tier.id, tier] as const)
  )

  return {
    ...fallback,
    tiers: fallback.tiers.map((tier) => {
      const editableTier = editableById.get(tier.id)
      if (!editableTier) return tier
      return {
        ...tier,
        minItems: editableTier.minItems,
        serviceFeeCny: editableTier.serviceFeeCny,
        serviceFeeRubApprox: editableTier.serviceFeeRubApprox,
      }
    }) as EastlaneTariffsSectionContent["tiers"],
  }
}

export function parseEastlaneTariffsSectionPayload(
  payload: unknown,
  fallback: EastlaneTariffsSectionContent
): EastlaneTariffsSectionContent {
  if (!payload || typeof payload !== "object") {
    return fallback
  }

  const parsed = eastlaneTariffsEditableSchema.safeParse(payload)
  if (!parsed.success) {
    return fallback
  }

  const ids = parsed.data.tiers.map((tier) => tier.id)
  if (ids[0] === ids[1]) {
    return fallback
  }

  return mergeEastlaneTariffsWithEditablePayload(fallback, parsed.data)
}
