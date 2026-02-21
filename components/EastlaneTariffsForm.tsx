"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { saveEastlaneTariffsSection } from "@/app/admin/content/eastlane-tariffs/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type {
  EastlaneTariffsSectionContent,
  EastlaneTariffsTier,
} from "@/src/domains/content/types"

type EastlaneTariffsFormProps = {
  initialTitle: string
  initialPayload: EastlaneTariffsSectionContent
  initialIsPublished: boolean
}

function normalizeNumber(value: string, min = 0) {
  if (!value.trim()) return min
  const next = Number(value.replace(",", "."))
  if (!Number.isFinite(next)) return min
  return Math.max(min, next)
}

function normalizeInteger(value: string, min = 1) {
  const rounded = Math.round(normalizeNumber(value, min))
  return Math.max(min, rounded)
}

export function EastlaneTariffsForm({
  initialTitle,
  initialPayload,
  initialIsPublished,
}: EastlaneTariffsFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(initialTitle || initialPayload.title)
  const [isPublished, setIsPublished] = useState(initialIsPublished)
  const [payload, setPayload] = useState<EastlaneTariffsSectionContent>(initialPayload)
  const [formError, setFormError] = useState<string | null>(null)

  const updateTier = (
    tierIndex: number,
    updater: (tier: EastlaneTariffsTier) => EastlaneTariffsTier
  ) => {
    setPayload((prev) => {
      const tiers = prev.tiers.map((tier, index) =>
        index === tierIndex ? updater(tier) : tier
      ) as EastlaneTariffsSectionContent["tiers"]
      return { ...prev, tiers }
    })
  }

  const onSubmit = () => {
    setFormError(null)

    const formData = new FormData()
    formData.set("title", title.trim())
    formData.set("isPublished", String(isPublished))
    formData.set("payload", JSON.stringify(payload))

    startTransition(async () => {
      const result = await saveEastlaneTariffsSection(formData)

      if (!result.ok) {
        const errorMessage = result.error ?? "Не удалось сохранить тарифы EASTLANE."
        setFormError(errorMessage)
        toast.error(errorMessage)
        return
      }

      toast.success("Тарифы EASTLANE сохранены.")
      router.refresh()
    })
  }

  return (
    <Card className="w-full rounded-xl border-border shadow-sm">
      <CardHeader>
        <CardTitle>Тарифы EASTLANE</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="section-title">Заголовок записи в site_sections</Label>
              <Input
                id="section-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Тарифы EASTLANE"
              />
            </div>
            <div className="flex items-end gap-2 rounded-lg border border-border bg-background p-3">
              <Checkbox
                id="section-published"
                checked={isPublished}
                onCheckedChange={(checked) => setIsPublished(checked === true)}
              />
              <Label htmlFor="section-published" className="cursor-pointer">
                Использовать кастомные тарифы EASTLANE на витрине
              </Label>
            </div>
          </div>

          <div className="mt-4">
            <div className="space-y-2">
              <Label htmlFor="payload-title">Заголовок блока</Label>
              <Input
                id="payload-title"
                value={payload.title}
                onChange={(event) =>
                  setPayload((prev) => ({ ...prev, title: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="payload-subtitle">Подзаголовок</Label>
            <Textarea
              id="payload-subtitle"
              value={payload.subtitle}
              className="min-h-20"
              onChange={(event) =>
                setPayload((prev) => ({ ...prev, subtitle: event.target.value }))
              }
            />
          </div>
        </div>

        {payload.tiers.map((tier, tierIndex) => (
          <section key={tier.id} className="rounded-lg border border-border p-4">
            <h3 className="text-base font-semibold text-foreground">{tier.id === "retail" ? "Розница" : "Опт"}</h3>

            <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Название тарифа</span>
                <Input
                  value={tier.title}
                  onChange={(event) =>
                    updateTier(tierIndex, (current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Мин. позиций</span>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={tier.minItems}
                  onChange={(event) =>
                    updateTier(tierIndex, (current) => ({
                      ...current,
                      minItems: normalizeInteger(event.target.value, 1),
                    }))
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Сервис (¥)</span>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={tier.serviceFeeCny}
                  onChange={(event) =>
                    updateTier(tierIndex, (current) => ({
                      ...current,
                      serviceFeeCny: normalizeNumber(event.target.value),
                    }))
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Сервис (~₽)</span>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={tier.serviceFeeRubApprox}
                  onChange={(event) =>
                    updateTier(tierIndex, (current) => ({
                      ...current,
                      serviceFeeRubApprox: normalizeNumber(event.target.value),
                    }))
                  }
                />
              </label>
            </div>

            <div className="mt-4 space-y-2">
              <Label>Строки примера расчета</Label>
              {tier.example.lines.map((line, lineIndex) => (
                <Input
                  key={`${tier.id}-line-${lineIndex}`}
                  value={line}
                  onChange={(event) =>
                    updateTier(tierIndex, (current) => ({
                      ...current,
                      example: {
                        ...current.example,
                        lines: current.example.lines.map((item, index) =>
                          index === lineIndex ? event.target.value : item
                        ),
                      },
                    }))
                  }
                />
              ))}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Итоговая строка примера</Label>
                <Input
                  value={tier.example.resultLine}
                  onChange={(event) =>
                    updateTier(tierIndex, (current) => ({
                      ...current,
                      example: {
                        ...current.example,
                        resultLine: event.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Предупреждение</Label>
                <Textarea
                  className="min-h-20"
                  value={tier.warning}
                  onChange={(event) =>
                    updateTier(tierIndex, (current) => ({
                      ...current,
                      warning: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </section>
        ))}

        <section className="rounded-lg border border-border p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="formula-title">Заголовок формулы</Label>
              <Input
                id="formula-title"
                value={payload.formulaTitle}
                onChange={(event) =>
                  setPayload((prev) => ({ ...prev, formulaTitle: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="formula-text">Текст формулы</Label>
              <Input
                id="formula-text"
                value={payload.formulaText}
                onChange={(event) =>
                  setPayload((prev) => ({ ...prev, formulaText: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="important-title">Заголовок важных моментов</Label>
            <Input
              id="important-title"
              value={payload.importantTitle}
              onChange={(event) =>
                setPayload((prev) => ({ ...prev, importantTitle: event.target.value }))
              }
            />
          </div>

          <div className="mt-4 space-y-2">
            <Label>Важные моменты</Label>
            {payload.importantItems.map((item, index) => (
              <Input
                key={`important-item-${index}`}
                value={item}
                onChange={(event) =>
                  setPayload((prev) => ({
                    ...prev,
                    importantItems: prev.importantItems.map((line, lineIndex) =>
                      lineIndex === index ? event.target.value : line
                    ),
                  }))
                }
              />
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="return-policy">Условия возврата</Label>
            <Textarea
              id="return-policy"
              className="min-h-20"
              value={payload.returnPolicy}
              onChange={(event) =>
                setPayload((prev) => ({ ...prev, returnPolicy: event.target.value }))
              }
            />
          </div>
        </section>

        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
      </CardContent>

      <CardFooter className="sticky bottom-0 z-20 border-t border-border/70 bg-card/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-card/85 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-accent)] hover:text-[color:var(--color-brand-forest-light)]"
          disabled={isPending}
          onClick={() => router.refresh()}
        >
          Сбросить изменения
        </Button>
        <Button
          type="button"
          className="bg-[color:var(--color-brand-forest)] text-white hover:bg-[color:var(--color-brand-forest-dark)]"
          disabled={isPending}
          onClick={onSubmit}
        >
          {isPending ? "Сохраняем..." : "Сохранить изменения"}
        </Button>
      </CardFooter>
    </Card>
  )
}
