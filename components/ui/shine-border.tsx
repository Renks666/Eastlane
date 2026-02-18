"use client"

import * as React from "react"
import Link from "next/link"
import {
  ShoppingBag,
  Search,
  Truck,
  ShieldCheck,
  Gift,
  ArrowRight,
} from "lucide-react"

import { cn } from "@/lib/utils"

// ─── ShineBorder ─────────────────────────────────────────────────────────────

interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Ширина анимированной рамки в пикселях */
  borderWidth?: number
  /** Длительность анимации в секундах */
  duration?: number
  /** Цвет или массив цветов для градиента рамки */
  shineColor?: string | string[]
}

export function ShineBorder({
  borderWidth = 1,
  duration = 16,
  shineColor = ["#FF2D9A", "#7B61FF", "#00E0FF"],
  className,
  style,
  ...props
}: ShineBorderProps) {
  return (
    <div
      style={
        {
          "--border-width": `${borderWidth}px`,
          "--duration": `${duration}s`,
          backgroundImage: `radial-gradient(transparent, transparent, ${
            Array.isArray(shineColor) ? shineColor.join(",") : shineColor
          }, transparent, transparent)`,
          backgroundSize: "300% 300%",
          mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "var(--border-width)",
          ...style,
        } as React.CSSProperties
      }
      className={cn(
        "motion-safe:animate-shine pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position]",
        className
      )}
      {...props}
    />
  )
}

// ─── Timeline Steps ───────────────────────────────────────────────────────────

const STEPS = [
  {
    icon: ShoppingBag,
    label: "Выбор",
    text: "Вы выбираете товар или отправляете ссылку",
  },
  {
    icon: Search,
    label: "Проверка",
    text: "Мы проверяем поставщика и качество",
  },
  {
    icon: Truck,
    label: "Доставка",
    text: "Выкупаем и организуем доставку",
  },
  {
    icon: ShieldCheck,
    label: "Контроль",
    text: "Контролируем логистику",
  },
  {
    icon: Gift,
    label: "Получение",
    text: "Вы получаете заказ",
  },
]

// ─── HowWeWorkTimeline ────────────────────────────────────────────────────────

export function HowWeWorkTimeline() {
  return (
    <div className="rounded-2xl bg-[color:var(--color-bg-primary)] p-4 md:rounded-3xl md:p-10">
      {/* Заголовок секции */}
      <div className="mb-5 text-center md:mb-10">
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--color-text-accent)] md:mb-2 md:text-xs md:tracking-[0.22em]">
          Как мы работаем
        </p>
        <h2 className="text-xl font-semibold leading-tight text-[color:var(--color-brand-forest-light)] md:text-3xl">
          Привезём твою вещь без риска
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-xs text-[color:var(--color-text-secondary)] md:mt-3 md:text-sm">
          Проверяем поставщиков. Контролируем доставку. Работаем под ключ.
        </p>
      </div>

      {/* Шаги таймлайна */}
      <ol className="relative flex flex-col gap-0 md:flex-row md:items-start md:justify-between">
        {STEPS.map((step, index) => {
          const Icon = step.icon
          const isLast = index === STEPS.length - 1

          return (
            <li
              key={step.label}
              className="relative flex flex-row items-start gap-3 pb-5 md:flex-1 md:flex-col md:items-center md:gap-0 md:pb-0 md:text-center"
            >
              {/* Соединительная линия — вертикальная (mob) / горизонтальная (desktop) */}
              {!isLast && (
                <>
                  {/* Мобильная: вертикальная линия */}
                  <span
                    aria-hidden="true"
                    className="absolute left-[15px] top-8 h-full w-px bg-[color:var(--color-border-primary)] md:hidden"
                  />
                  {/* Десктоп: горизонтальная линия */}
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-[19px] hidden h-px w-full bg-[color:var(--color-border-primary)] md:block"
                  />
                </>
              )}

              {/* Иконка */}
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-tertiary)] text-[color:var(--color-brand-forest)] md:h-10 md:w-10">
                <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </div>

              {/* Текст */}
              <div className="pt-0.5 md:pt-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text-accent)] md:mb-0.5 md:text-[10px]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-0.5 text-sm leading-snug text-[color:var(--color-text-primary)] md:mt-1 md:text-sm md:max-w-[120px]">
                  {step.text}
                </p>
              </div>
            </li>
          )
        })}
      </ol>

      {/* CTA */}
      <div className="mt-6 flex flex-col items-center gap-2 border-t border-[color:var(--color-border-secondary)] pt-5 sm:flex-row sm:justify-center sm:gap-3 md:mt-10 md:pt-8">
        <Link
          href="/contacts"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--color-brand-forest)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[color:var(--color-brand-forest-dark)]"
        >
          Оставить заявку
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/contacts"
          className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-6 py-3 text-sm font-medium text-[color:var(--color-text-tertiary)] transition hover:border-[color:var(--color-brand-beige-dark)] hover:text-[color:var(--color-brand-forest-light)]"
        >
          Задать вопрос
        </Link>
      </div>
    </div>
  )
}
