import { DeliveryRatesSection } from "@/components/store/DeliveryRatesSection"
import { EastlaneTariffsSection } from "@/components/store/EastlaneTariffsSection"
import { StoreShell } from "@/components/store/StoreShell"
import { getStorefrontContent } from "@/src/domains/content/services/storefront-content-service"

export default async function DeliveryPage() {
  const { deliveryRates, eastlaneTariffs } = await getStorefrontContent()

  return (
    <StoreShell>
      <div className="pt-12 md:pt-16">
        <DeliveryRatesSection content={deliveryRates} />
        <EastlaneTariffsSection content={eastlaneTariffs} />
      </div>
    </StoreShell>
  )
}
