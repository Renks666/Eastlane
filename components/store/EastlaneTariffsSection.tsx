import {
  AlertTriangle,
  Building2,
  CircleDot,
  Search,
  ShieldCheck,
  Sigma,
  Truck,
} from "lucide-react"
import type { EastlaneTariffsSectionContent } from "@/src/domains/content/types"

type EastlaneTariffsSectionProps = {
  content: EastlaneTariffsSectionContent
}

const IMPORTANT_ITEM_ICONS = [CircleDot, Building2, Search, ShieldCheck, Truck]
const IMPORTANT_ITEMS = [
  "Минимальный заказ не обязателен — можно брать единичные позиции.",
  "Оптовые заказы рассчитываются индивидуально.",
  "Возможен поиск любых товаров по вашей просьбе.",
  "Рекомендуется страховка. Покрывает стоимость товара. Частично может покрывать стоимость доставки в зависимости от перевозчика.",
  "Международная доставка включает транспортировку до страны получателя. Доставка до конкретного адреса или пункта выдачи оформляется через курьерскую службу дополнительно.",
  "Возврат возможен только на территории Китая и только по уважительной причине (брак, неправильный цвет/размер). После отправки товара к вам возврат невозможен.",
]

const CALC_ROWS = [
  { priceRange: "0 - 500", percent: "-", commission: "50" },
  { priceRange: "501 - 1 000", percent: "10", commission: "-" },
  { priceRange: "1 001 - 2 000", percent: "9", commission: "-" },
  { priceRange: "2 001 - 3 000", percent: "8", commission: "-" },
  { priceRange: "3 001 - 4 000", percent: "7", commission: "-" },
  { priceRange: "4 001 - 5 000", percent: "6", commission: "-" },
  { priceRange: "5 001+", percent: "5", commission: "-" },
]

export function EastlaneTariffsSection({ content }: EastlaneTariffsSectionProps) {
  const importantItems = IMPORTANT_ITEMS

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
          <h2 className="text-2xl font-semibold leading-tight text-[color:var(--color-brand-forest-light)] sm:text-3xl md:text-5xl">
            Модуль расчета
            <span className="block">Eastlane</span>
          </h2>
        </div>

        <div className="relative mt-6 sm:mt-7 md:mt-8">
          <article className="rounded-2xl border border-[color:var(--color-brand-forest-light)]/35 bg-[linear-gradient(160deg,#091a16_0%,#0b201a_58%,#0d251f_100%)] p-3 text-white sm:p-4 md:p-5">
            <div className="overflow-x-auto overscroll-x-contain rounded-xl border border-cyan-300/35 bg-[#071915]/50">
              <table className="min-w-[640px] w-full border-collapse text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-cyan-100/90">
                    <th className="border border-cyan-300/25 bg-cyan-600/10 px-3 py-2 text-left">Цена товара (CNY)</th>
                    <th className="border border-cyan-300/25 bg-cyan-600/10 px-3 py-2 text-center">Процент (%)</th>
                    <th className="border border-cyan-300/25 bg-cyan-600/10 px-3 py-2 text-center">Комиссия (CNY)</th>
                  </tr>
                </thead>
                <tbody>
                  {CALC_ROWS.map((row) => (
                    <tr key={row.priceRange} className="text-cyan-50">
                      <th className="border border-cyan-300/20 px-3 py-2 text-left font-medium">{row.priceRange}</th>
                      <td className="font-price border border-cyan-300/20 px-3 py-2 text-center tabular-nums">{row.percent}</td>
                      <td className="font-price border border-cyan-300/20 px-3 py-2 text-center tabular-nums">{row.commission}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
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
