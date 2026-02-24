"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { saveExchangeRateSection } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ExchangeRateCardProps = {
  initialCnyPerRub: number
}

export function ExchangeRateCard({ initialCnyPerRub }: ExchangeRateCardProps) {
  const [cnyPerRub, setCnyPerRub] = useState(String(initialCnyPerRub))
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    const formData = new FormData()
    formData.set("cnyPerRub", cnyPerRub)

    startTransition(async () => {
      const result = await saveExchangeRateSection(formData)
      if (!result.ok) {
        toast.error(result.error ?? "Не удалось сохранить курс")
        return
      }

      toast.success("Курс сохранен")
    })
  }

  return (
    <Card className="rounded-xl border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Курс CNY/RUB</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="exchange-rate">1 RUB = X CNY</Label>
          <Input
            id="exchange-rate"
            type="number"
            step="0.000001"
            min="0.000001"
            value={cnyPerRub}
            onChange={(event) => setCnyPerRub(event.target.value)}
          />
        </div>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="bg-[color:var(--color-brand-forest)] text-white hover:bg-[color:var(--color-brand-forest-dark)]"
        >
          {isPending ? "Сохранение..." : "Сохранить курс"}
        </Button>
      </CardContent>
    </Card>
  )
}

