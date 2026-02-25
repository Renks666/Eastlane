"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { saveExchangeRateSection } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type ExchangeRateCardProps = {
  initialCnyPerRub: number
  compact?: boolean
  className?: string
}

export function ExchangeRateCard({ initialCnyPerRub, compact = false, className }: ExchangeRateCardProps) {
  const initialRubPerCny = initialCnyPerRub > 0 ? 1 / initialCnyPerRub : null
  const [rubPerCny, setRubPerCny] = useState(
    initialRubPerCny !== null ? String(Number(initialRubPerCny.toFixed(6))) : ""
  )
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    const rubPerCnyValue = Number(rubPerCny)
    if (!Number.isFinite(rubPerCnyValue) || rubPerCnyValue <= 0) {
      toast.error("Укажите корректный курс юаня к рублю.")
      return
    }

    const formData = new FormData()
    formData.set("cnyPerRub", String(1 / rubPerCnyValue))

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
    <Card className={cn("rounded-xl border-border shadow-sm", compact ? "gap-2 py-3" : "", className)}>
      <CardHeader className={cn(compact ? "px-3 pb-0 pt-0" : "pb-2")}>
        <CardTitle className="text-sm font-semibold text-foreground">Курс CNY/RUB</CardTitle>
      </CardHeader>
      <CardContent
        className={cn(
          compact ? "flex h-full flex-col justify-center gap-3 px-3 pb-0 pt-0" : "space-y-3"
        )}
      >
        <div className={cn(compact ? "space-y-1.5" : "space-y-2")}>
          <Label htmlFor="exchange-rate" className={cn(compact ? "text-xs" : "")}>1 CNY = X RUB</Label>
          <Input
            id="exchange-rate"
            type="number"
            step="0.01"
            min="0.01"
            value={rubPerCny}
            onChange={(event) => setRubPerCny(event.target.value)}
            className={cn(compact ? "h-8 text-sm" : "")}
          />
        </div>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className={cn(
            "bg-[color:var(--color-brand-forest)] text-white hover:bg-[color:var(--color-brand-forest-dark)]",
            compact ? "h-8 w-[92%] self-center text-xs" : ""
          )}
        >
          {isPending ? "Сохранение..." : "Сохранить курс"}
        </Button>
      </CardContent>
    </Card>
  )
}

