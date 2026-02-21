import {
  AlertTriangle,
  Building2,
  Calculator,
  CircleDot,
  Search,
  ShieldCheck,
  Sigma,
  Wrench,
} from "lucide-react"
import type { EastlaneTariffsSectionContent, EastlaneTariffsTier } from "@/src/domains/content/types"

type EastlaneTariffsSectionProps = {
  content: EastlaneTariffsSectionContent
}

const IMPORTANT_ITEM_ICONS = [Building2, CircleDot, CircleDot, Search, ShieldCheck]

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",")
}

function TierCard({ tier }: { tier: EastlaneTariffsTier }) {
  return (
    <article className="rounded-2xl border border-[color:var(--color-brand-forest-light)]/35 bg-[linear-gradient(160deg,#091a16_0%,#0b201a_58%,#0d251f_100%)] p-3 text-white sm:p-4 md:p-5">

      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300/90">Тариф</p>
          <h3 className="mt-1 text-lg font-semibold text-cyan-100 sm:text-xl md:text-2xl">
            {tier.title} <span className="text-cyan-300/90">(от {tier.minItems} позиции)</span>
          </h3>
        </div>
        <span className="inline-flex self-start shrink-0 items-center rounded-full border border-cyan-300/35 bg-cyan-600/15 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-200">
          EASTLANE
        </span>
      </header>

      <div className="mt-3.5 rounded-xl border border-cyan-300/35 bg-[#071915]/70 p-3 md:mt-4 md:p-4">
        <p className="flex items-start gap-2.5 text-cyan-50/95">
          <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
          <span className="break-words leading-snug">
            Сервис/обработка заказа:{" "}
            <span className="font-price text-cyan-100 tabular-nums">{formatNumber(tier.serviceFeeCny)} ¥</span>{" "}
            (~<span className="font-price text-cyan-100 tabular-nums">{formatNumber(tier.serviceFeeRubApprox)} ₽</span>) за позицию
          </span>
        </p>
      </div>

      <div className="mt-3.5 rounded-xl border border-cyan-300/25 bg-cyan-900/15 p-3 md:mt-4 md:p-4">
        <p className="mb-2 flex items-center gap-2 text-sm uppercase tracking-[0.12em] text-cyan-300/95">
          <Calculator className="h-4 w-4" />
          Пример расчета
        </p>
        <ul className="space-y-1.5 text-sm text-cyan-50/95">
          {tier.example.lines.map((line) => (
            <li key={line} className="break-words leading-snug md:leading-relaxed">
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-2 break-words border-t border-cyan-300/25 pt-2 font-price text-base text-cyan-100 tabular-nums md:text-lg">{tier.example.resultLine}</p>
      </div>

      <p className="mt-3.5 flex items-start gap-2.5 rounded-lg border border-amber-300/35 bg-amber-400/14 p-3 text-sm text-amber-50 md:mt-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
        <span className="break-words leading-snug">{tier.warning}</span>
      </p>
    </article>
  )
}

export function EastlaneTariffsSection({ content }: EastlaneTariffsSectionProps) {
  const importantItems = [...content.importantItems, content.returnPolicy]

  return (
    <section className="mx-auto max-w-7xl px-3 pb-12 sm:px-4 md:px-12 md:pb-20">
      <div className="relative overflow-hidden rounded-2xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] p-4 shadow-[0_20px_60px_-40px_rgba(15,63,51,0.28)] sm:p-5 md:rounded-3xl md:p-8">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <span
              key={`eastlane-tariff-wm-${index}`}
              className="absolute whitespace-nowrap text-2xl font-semibold uppercase tracking-[0.05em] text-[color:var(--color-text-primary)]/5 sm:text-3xl md:text-4xl"
              style={{
                left: `${(index % 2) * 48 - 6}%`,
                top: `${Math.floor(index / 2) * 30 + 8}%`,
                transform: "rotate(-13deg)",
              }}
            >
              eastlane
            </span>
          ))}
        </div>

        <div className="relative">
          <h2 className="text-2xl font-semibold leading-tight text-[color:var(--color-brand-forest-light)] sm:text-3xl md:text-5xl">{content.title}</h2>
          <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-[color:var(--color-text-secondary)] md:mt-3 md:text-base">{content.subtitle}</p>
        </div>

        <div className="relative mt-6 grid gap-3.5 sm:mt-7 sm:gap-4 md:mt-8 md:grid-cols-2 md:gap-5">
          {content.tiers.map((tier) => (
            <TierCard key={tier.id} tier={tier} />
          ))}
        </div>

        <div className="relative mt-4 overflow-hidden rounded-xl border border-cyan-300/30 bg-[linear-gradient(160deg,rgba(8,28,23,0.92)_0%,rgba(11,34,28,0.92)_100%)] p-3.5 text-cyan-50 sm:mt-5 sm:p-4 md:p-5">
          <span
            className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-cyan-300/55"
            aria-hidden="true"
          />
          <p className="mb-2 flex items-center gap-2 text-sm uppercase tracking-[0.12em] text-cyan-300/95">
            <Sigma className="h-4 w-4" />
            {content.formulaTitle}
          </p>
          <p className="break-words font-medium leading-snug text-cyan-50 md:text-[15px]">{content.formulaText}</p>
        </div>

        <div className="relative mt-4 rounded-xl border border-[color:var(--color-brand-forest-light)]/35 bg-[linear-gradient(160deg,#07120f_0%,#0b221c_60%,#102f27_100%)] p-3.5 text-cyan-50 sm:mt-5 sm:p-4 md:p-5">
          <h3 className="text-base font-semibold uppercase tracking-[0.08em] text-cyan-200">{content.importantTitle}</h3>
          <ul className="mt-3 space-y-2.5 text-sm md:space-y-3">
            {importantItems.map((item, index) => {
              const isReturnPolicy = index === importantItems.length - 1
              const Icon = isReturnPolicy ? AlertTriangle : IMPORTANT_ITEM_ICONS[index] ?? CircleDot
              return (
                <li key={`${item}-${index}`} className="flex items-start gap-2.5">
                  <Icon
                    className={`mt-0.5 h-4 w-4 shrink-0 ${isReturnPolicy ? "text-amber-200" : "text-cyan-300"}`}
                  />
                  <span className={`break-words leading-snug md:leading-relaxed ${isReturnPolicy ? "text-amber-50" : ""}`}>
                    {item}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
