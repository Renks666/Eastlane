"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { saveDeliveryRatesSection } from "@/app/admin/content/delivery/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type {
  DeliveryRateGroup,
  DeliveryRateNoteIcon,
  DeliveryRateValue,
  DeliveryRatesSectionContent,
} from "@/src/domains/content/types"

type DeliveryRatesFormProps = {
  initialTitle: string
  initialPayload: DeliveryRatesSectionContent
  initialIsPublished: boolean
}

const RATE_FIELDS: Array<{ key: keyof DeliveryRateValue; label: string }> = [
  { key: "kg1", label: "1 кг" },
  { key: "kg2", label: "2 кг" },
  { key: "kg3", label: "3 кг" },
  { key: "kg5", label: "5 кг" },
  { key: "kg10", label: "10 кг" },
  { key: "kg20Plus", label: "20 кг +" },
]

const NOTE_ICON_OPTIONS: Array<{ value: DeliveryRateNoteIcon; label: string }> = [
  { value: "clock", label: "Clock" },
  { value: "dollar-sign", label: "Dollar" },
  { value: "truck", label: "Truck" },
  { value: "package", label: "Package" },
  { value: "info", label: "Info" },
]

function normalizeRate(value: string) {
  if (!value.trim()) return 0
  const next = Number(value.replace(",", "."))
  return Number.isFinite(next) && next >= 0 ? next : 0
}

export function DeliveryRatesForm({ initialTitle, initialPayload, initialIsPublished }: DeliveryRatesFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(initialTitle || initialPayload.title)
  const [isPublished, setIsPublished] = useState(initialIsPublished)
  const [payload, setPayload] = useState<DeliveryRatesSectionContent>(initialPayload)
  const [formError, setFormError] = useState<string | null>(null)

  const updateGroup = (groupIndex: number, updater: (group: DeliveryRateGroup) => DeliveryRateGroup) => {
    setPayload((prev) => {
      const groups = prev.groups.map((group, index) => (index === groupIndex ? updater(group) : group)) as DeliveryRatesSectionContent["groups"]
      return { ...prev, groups }
    })
  }

  const onSubmit = () => {
    setFormError(null)

    const formData = new FormData()
    formData.set("title", title.trim())
    formData.set("isPublished", String(isPublished))
    formData.set("payload", JSON.stringify(payload))

    startTransition(async () => {
      const result = await saveDeliveryRatesSection(formData)

      if (!result.ok) {
        const errorMessage = result.error ?? "Не удалось сохранить тарифы."
        setFormError(errorMessage)
        toast.error(errorMessage)
        return
      }

      toast.success("Тарифы и доставка сохранены.")
      router.refresh()
    })
  }

  return (
    <Card className="w-full rounded-xl border-border shadow-sm">
      <CardHeader>
        <CardTitle>Тарифы и доставка</CardTitle>
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
                placeholder="Тарифы и доставка"
              />
            </div>
            <div className="flex items-end gap-2 rounded-lg border border-border bg-background p-3">
              <Checkbox
                id="section-published"
                checked={isPublished}
                onCheckedChange={(checked) => setIsPublished(checked === true)}
              />
              <Label htmlFor="section-published" className="cursor-pointer">
                Использовать кастомные тарифы на витрине
              </Label>
            </div>
          </div>

          <div className="mt-4">
            <div className="space-y-2">
              <Label htmlFor="payload-watermark">Водяной знак</Label>
              <Input
                id="payload-watermark"
                value={payload.backgroundWatermark}
                onChange={(event) =>
                  setPayload((prev) => ({
                    ...prev,
                    backgroundWatermark: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="payload-title">Заголовок блока на сайте</Label>
            <Input
              id="payload-title"
              value={payload.title}
              onChange={(event) => setPayload((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Тарифы и доставка"
            />
          </div>
        </div>

        {payload.groups.map((group, groupIndex) => (
          <section key={`delivery-group-${groupIndex}`} className="rounded-lg border border-border p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`group-title-${groupIndex}`}>Название колонки стран</Label>
                <Input
                  id={`group-title-${groupIndex}`}
                  value={group.title}
                  onChange={(event) =>
                    updateGroup(groupIndex, (current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`group-destination-${groupIndex}`}>Город назначения</Label>
                <Input
                  id={`group-destination-${groupIndex}`}
                  value={group.destination}
                  onChange={(event) =>
                    updateGroup(groupIndex, (current) => ({
                      ...current,
                      destination: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {group.rows.map((row, rowIndex) => (
                <div key={`group-${groupIndex}-row-${rowIndex}`} className="rounded-md border border-border bg-muted/10 p-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`group-${groupIndex}-row-${rowIndex}-country`}>Страна</Label>
                      <Input
                        id={`group-${groupIndex}-row-${rowIndex}-country`}
                        value={row.country}
                        onChange={(event) =>
                          updateGroup(groupIndex, (current) => ({
                            ...current,
                            rows: current.rows.map((item, index) =>
                              index === rowIndex
                                ? {
                                    ...item,
                                    country: event.target.value,
                                  }
                                : item
                            ),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`group-${groupIndex}-row-${rowIndex}-flag`}>Код флага (RU/BY/KZ/CZ)</Label>
                      <Input
                        id={`group-${groupIndex}-row-${rowIndex}-flag`}
                        placeholder="RU"
                        value={row.flag}
                        onChange={(event) =>
                          updateGroup(groupIndex, (current) => ({
                            ...current,
                            rows: current.rows.map((item, index) =>
                              index === rowIndex
                                ? {
                                    ...item,
                                    flag: event.target.value.toUpperCase(),
                                  }
                                : item
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
                    {RATE_FIELDS.map((field) => (
                      <label key={field.key} className="space-y-1">
                        <span className="text-xs text-muted-foreground">{field.label}</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={row.rates[field.key]}
                          onChange={(event) =>
                            updateGroup(groupIndex, (current) => ({
                              ...current,
                              rows: current.rows.map((item, index) =>
                                index === rowIndex
                                  ? {
                                      ...item,
                                      rates: {
                                        ...item.rates,
                                        [field.key]: normalizeRate(event.target.value),
                                      },
                                    }
                                  : item
                              ),
                            }))
                          }
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium text-foreground">Примечания</p>
              {group.notes.map((note, noteIndex) => (
                <div
                  key={`group-${groupIndex}-note-${noteIndex}`}
                  className="grid gap-3 rounded-md border border-border bg-muted/10 p-3 md:grid-cols-[180px_1fr]"
                >
                  <label className="space-y-1">
                    <span className="text-xs text-muted-foreground">Иконка</span>
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={note.icon}
                      onChange={(event) =>
                        updateGroup(groupIndex, (current) => ({
                          ...current,
                          notes: current.notes.map((item, index) =>
                            index === noteIndex
                              ? {
                                  ...item,
                                  icon: event.target.value as DeliveryRateNoteIcon,
                                }
                              : item
                          ),
                        }))
                      }
                    >
                      {NOTE_ICON_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-muted-foreground">Текст</span>
                    <Textarea
                      value={note.text}
                      className="min-h-20"
                      onChange={(event) =>
                        updateGroup(groupIndex, (current) => ({
                          ...current,
                          notes: current.notes.map((item, index) =>
                            index === noteIndex
                              ? {
                                  ...item,
                                  text: event.target.value,
                                }
                              : item
                          ),
                        }))
                      }
                    />
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor={`group-transport-note-${groupIndex}`}>Примечание про транспортную компанию</Label>
              <Textarea
                id={`group-transport-note-${groupIndex}`}
                value={group.transportNote}
                className="min-h-20"
                onChange={(event) =>
                  updateGroup(groupIndex, (current) => ({
                    ...current,
                    transportNote: event.target.value,
                  }))
                }
              />
            </div>
          </section>
        ))}

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
