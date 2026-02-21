import {
  Clock3,
  DollarSign,
  Info,
  Package,
  Truck,
  type LucideIcon,
} from "lucide-react"
import type { DeliveryRatesSectionContent, DeliveryRateValue, DeliveryRateNoteIcon } from "@/src/domains/content/types"

type DeliveryRatesSectionProps = {
  content: DeliveryRatesSectionContent
}

type CountryFlagIconProps = {
  code: string
}

const RATE_COLUMNS: Array<{ key: keyof DeliveryRateValue; label: string }> = [
  { key: "kg1", label: "1 кг" },
  { key: "kg2", label: "2 кг" },
  { key: "kg3", label: "3 кг" },
  { key: "kg5", label: "5 кг" },
  { key: "kg10", label: "10 кг" },
  { key: "kg20Plus", label: "20 кг +" },
]

const NOTE_ICONS: Record<DeliveryRateNoteIcon, LucideIcon> = {
  clock: Clock3,
  "dollar-sign": DollarSign,
  truck: Truck,
  package: Package,
  info: Info,
}

function formatRate(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",")
}

function renderFlagShape(code: string) {
  switch (code) {
    case "RU":
      return (
        <svg viewBox="0 0 20 20" className="h-full w-full" aria-hidden="true">
          <rect width="20" height="20" fill="#FFFFFF" />
          <rect y="6.67" width="20" height="6.67" fill="#1C57A5" />
          <rect y="13.34" width="20" height="6.66" fill="#D52B1E" />
        </svg>
      )
    case "BY":
      return (
        <svg viewBox="0 0 20 20" className="h-full w-full" aria-hidden="true">
          <rect width="20" height="20" fill="#C8312E" />
          <rect y="13.4" width="20" height="6.6" fill="#0F8F44" />
          <rect width="4" height="20" fill="#FFFFFF" />
          <path
            d="M1 1.5L2.8 3L1 4.5L2.8 6L1 7.5L2.8 9L1 10.5L2.8 12L1 13.5L2.8 15L1 16.5L2.8 18"
            stroke="#C8312E"
            strokeWidth="0.8"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      )
    case "KZ":
      return (
        <svg viewBox="0 0 20 20" className="h-full w-full" aria-hidden="true">
          <rect width="20" height="20" fill="#2EA8DF" />
          <rect x="2" y="2" width="1.4" height="16" rx="0.7" fill="#F4C542" />
          <circle cx="11.2" cy="8.9" r="3" fill="#F4C542" />
          <path d="M8.3 14.4C9.3 13.6 10.3 13.2 11.2 13.2C12.1 13.2 13.1 13.6 14.1 14.4" stroke="#F4C542" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      )
    case "CZ":
      return (
        <svg viewBox="0 0 20 20" className="h-full w-full" aria-hidden="true">
          <rect width="20" height="10" fill="#FFFFFF" />
          <rect y="10" width="20" height="10" fill="#D7141A" />
          <path d="M0 0L9.5 10L0 20V0Z" fill="#11457E" />
        </svg>
      )
    default:
      return null
  }
}

function CountryFlagIcon({ code }: CountryFlagIconProps) {
  const normalized = code.trim().toUpperCase()
  const shape = renderFlagShape(normalized)

  if (shape) {
    return (
      <span
        className="mr-2 inline-flex h-5 w-5 shrink-0 overflow-hidden rounded-full border border-white/35 shadow-[0_0_0_1px_rgba(6,26,22,0.6)]"
        title={normalized}
        aria-hidden="true"
      >
        {shape}
      </span>
    )
  }

  if (!normalized) {
    return null
  }

  return (
    <span
      className="mr-2 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full border border-white/35 bg-cyan-500/20 px-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-100"
      title={normalized}
      aria-hidden="true"
    >
      {normalized.slice(0, 2)}
    </span>
  )
}

export function DeliveryRatesSection({ content }: DeliveryRatesSectionProps) {
  const sharedTransportNote =
    content.groups.find((group) => group.transportNote.trim().length > 0)?.transportNote ??
    "Оплата доставки транспортной компанией (СДЭК) оплачивается отдельно."

  return (
    <section className="mx-auto max-w-7xl px-3 pb-12 sm:px-4 md:px-12 md:pb-20">
      <div className="relative overflow-hidden rounded-2xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] p-4 shadow-[0_20px_60px_-40px_rgba(15,63,51,0.28)] sm:p-5 md:rounded-3xl md:p-8">
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 9 }).map((_, index) => (
            <span
              key={`wm-${index}`}
              className="absolute whitespace-nowrap text-3xl font-semibold uppercase tracking-[0.05em] text-[color:var(--color-text-primary)]/5 sm:text-4xl md:text-5xl"
              style={{
                left: `${(index % 3) * 35 - 8}%`,
                top: `${Math.floor(index / 3) * 30 + 4}%`,
                transform: "rotate(-14deg)",
              }}
              aria-hidden="true"
            >
              {content.backgroundWatermark}
            </span>
          ))}
        </div>

        <div className="relative">
          <h2 className="text-2xl font-semibold text-[color:var(--color-brand-forest-light)] sm:text-3xl md:text-5xl">{content.title}</h2>
        </div>

        <div className="relative mt-6 sm:mt-7 md:mt-8">
          <article className="overflow-hidden rounded-2xl border border-[color:var(--color-brand-forest-light)]/35 bg-[linear-gradient(160deg,#07120f_0%,#0b221c_60%,#102f27_100%)] p-2.5 text-white sm:p-3 md:p-4">
            <div className="space-y-4 md:space-y-5">
              {content.groups.map((group, index) => (
                <section
                  key={group.destination}
                  className={index === 0 ? "" : "border-t border-cyan-300/20 pt-3.5 sm:pt-4 md:pt-5"}
                >
                  <div className="overflow-x-auto overscroll-x-contain rounded-xl border border-cyan-300/35 bg-[#071915]/50">
                    <table className="min-w-[720px] w-full border-collapse text-sm">
                      <caption className="sr-only">{`Тарифы доставки до ${group.destination}`}</caption>
                      <thead>
                        <tr className="text-xs uppercase tracking-wide text-cyan-100/90">
                          <th className="border border-cyan-300/25 bg-cyan-600/10 px-3 py-2 text-left">{group.title}</th>
                          {RATE_COLUMNS.map((column) => (
                            <th key={column.key} className="border border-cyan-300/25 bg-cyan-600/10 px-3 py-2 text-center">
                              {column.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {group.rows.map((row) => (
                          <tr key={row.country} className="text-cyan-50">
                            <th className="border border-cyan-300/20 px-3 py-2 text-left font-medium">
                              <CountryFlagIcon code={row.flag} />
                              {row.country}
                            </th>
                            {RATE_COLUMNS.map((column) => (
                              <td key={`${row.country}-${column.key}`} className="font-price border border-cyan-300/20 px-3 py-2 text-center tabular-nums">
                                {formatRate(row.rates[column.key])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3.5 text-sm sm:mt-4">
                    <ul className="space-y-2 text-cyan-50/95">
                      {group.notes.map((note) => {
                        const Icon = NOTE_ICONS[note.icon]
                        return (
                          <li key={note.text} className="flex items-start gap-2.5">
                            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                            <span className="leading-snug">{note.text}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <div className="inline-flex w-full items-start gap-2.5 rounded-lg border border-cyan-300/35 bg-cyan-700/10 px-3 py-2 text-xs text-cyan-100 md:w-auto md:max-w-[320px]">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                <p className="leading-snug">{sharedTransportNote}</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
