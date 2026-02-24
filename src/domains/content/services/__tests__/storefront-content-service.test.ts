import { describe, expect, it } from "vitest"
import {
  defaultDeliveryRatesSection,
  defaultEastlaneTariffsSection,
  defaultExchangeRateSection,
} from "../../default-content"
import { resolveStorefrontContentSections } from "../storefront-content-resolver"
import type { ContentSection, ContentSectionKey } from "../../types"

function section<K extends ContentSectionKey>(input: {
  key: K
  payload: unknown
  isPublished: boolean
  title?: string
}): ContentSection {
  return {
    key: input.key,
    title: input.title ?? input.key,
    payload: input.payload,
    isPublished: input.isPublished,
    updatedAt: null,
  }
}

describe("resolveStorefrontContentSections", () => {
  it("uses default delivery rates when section is missing", () => {
    const result = resolveStorefrontContentSections({})
    expect(result.deliveryRates).toEqual(defaultDeliveryRatesSection)
  })

  it("uses default delivery rates when section is unpublished", () => {
    const result = resolveStorefrontContentSections({
      delivery_rates: section({
        key: "delivery_rates",
        payload: {
          ...defaultDeliveryRatesSection,
          title: "Черновик",
        },
        isPublished: false,
      }),
    })

    expect(result.deliveryRates).toEqual(defaultDeliveryRatesSection)
  })

  it("uses delivery rates from payload when section is published", () => {
    const result = resolveStorefrontContentSections({
      delivery_rates: section({
        key: "delivery_rates",
        payload: {
          ...defaultDeliveryRatesSection,
          title: "Актуальные тарифы",
        },
        isPublished: true,
      }),
    })

    expect(result.deliveryRates.title).toBe("Актуальные тарифы")
  })

  it("uses default eastlane tariffs when section is missing", () => {
    const result = resolveStorefrontContentSections({})
    expect(result.eastlaneTariffs).toEqual(defaultEastlaneTariffsSection)
  })

  it("uses default eastlane tariffs when section is unpublished", () => {
    const result = resolveStorefrontContentSections({
      eastlane_tariffs: section({
        key: "eastlane_tariffs",
        payload: {
          ...defaultEastlaneTariffsSection,
          title: "Черновой EASTLANE",
        },
        isPublished: false,
      }),
    })

    expect(result.eastlaneTariffs).toEqual(defaultEastlaneTariffsSection)
  })

  it("uses eastlane tariffs from payload when section is published", () => {
    const result = resolveStorefrontContentSections({
      eastlane_tariffs: section({
        key: "eastlane_tariffs",
        payload: {
          ...defaultEastlaneTariffsSection,
          title: "Тарифы EASTLANE NEW",
        },
        isPublished: true,
      }),
    })

    expect(result.eastlaneTariffs.title).toBe("Тарифы EASTLANE NEW")
  })

  it("uses default exchange rate when section is missing", () => {
    const result = resolveStorefrontContentSections({})
    expect(result.exchangeRate).toEqual(defaultExchangeRateSection)
  })

  it("uses exchange rate from payload when section is published", () => {
    const result = resolveStorefrontContentSections({
      exchange_rate: section({
        key: "exchange_rate",
        payload: { cnyPerRub: 0.12 },
        isPublished: true,
      }),
    })

    expect(result.exchangeRate.cnyPerRub).toBe(0.12)
  })
})

