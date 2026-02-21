import { z } from "zod"
import type { DeliveryRatesSectionContent } from "@/src/domains/content/types"

const nonEmptyText = z.string().trim().min(1)
const rateSchema = z.coerce.number().finite().min(0)
const flagCodeSchema = nonEmptyText.transform((value) => value.toUpperCase())

const deliveryRateValueSchema = z.object({
  kg1: rateSchema,
  kg2: rateSchema,
  kg3: rateSchema,
  kg5: rateSchema,
  kg10: rateSchema,
  kg20Plus: rateSchema,
})

const deliveryRateRowSchema = z.object({
  country: nonEmptyText,
  flag: flagCodeSchema,
  rates: deliveryRateValueSchema,
})

const deliveryRateNoteSchema = z.object({
  icon: z.enum(["clock", "dollar-sign", "truck", "package", "info"]),
  text: nonEmptyText,
})

const deliveryRateGroupSchema = z.object({
  title: nonEmptyText,
  destination: nonEmptyText,
  rows: z.array(deliveryRateRowSchema).min(1),
  notes: z.array(deliveryRateNoteSchema).min(1),
  transportNote: nonEmptyText,
})

export const deliveryRatesSectionSchema = z.object({
  title: nonEmptyText,
  backgroundWatermark: nonEmptyText,
  groups: z.tuple([deliveryRateGroupSchema, deliveryRateGroupSchema]),
})

export function parseDeliveryRatesSectionPayload(
  payload: unknown,
  fallback: DeliveryRatesSectionContent
): DeliveryRatesSectionContent {
  if (!payload || typeof payload !== "object") {
    return fallback
  }

  const parsed = deliveryRatesSectionSchema.safeParse(payload)
  return parsed.success ? parsed.data : fallback
}
