"use client"

import { useId, type ReactNode } from "react"

type ExchangeRateTooltipProps = {
  isOpen: boolean
  rateText: string
  align?: "left" | "right"
  className?: string
  children: (props: { describedBy: string }) => ReactNode
}

export function ExchangeRateTooltip({
  isOpen,
  rateText,
  align = "left",
  className,
  children,
}: ExchangeRateTooltipProps) {
  const tooltipId = useId()
  const alignmentClass = align === "right" ? "right-0" : "left-0"

  return (
    <div className={`relative ${className ?? ""}`}>
      {children({ describedBy: tooltipId })}
      <div
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute top-full mt-1.5 ${alignmentClass} z-[70] w-[min(240px,calc(100vw-24px))] rounded-xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] p-3 text-xs leading-4 text-[color:var(--color-text-secondary)] shadow-[var(--shadow-lg)] transition duration-200 ${
          isOpen ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
        }`}
      >
        <p>Расчёт выполнен по текущему курсу.</p>
        <p>Курс: 1 ¥ = {rateText} ₽</p>
        <p>Итоговая сумма может отличаться.</p>
      </div>
    </div>
  )
}
