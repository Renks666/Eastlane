import { StoreShell } from "@/components/store/StoreShell"

export default function AboutPage() {
  return (
    <StoreShell>
      <section className="mx-auto max-w-4xl px-4 pb-14 pt-10 md:px-8">
        <div className="rounded-3xl border border-[#d8cfb7] bg-white/90 p-7 md:p-10">
          <p className="text-xs uppercase tracking-[0.22em] text-[#8b7a55]">О бренде</p>
          <h1 className="mt-3 text-4xl font-semibold text-[#0f2d25]">EASTLANE</h1>
          <p className="mt-5 text-base leading-relaxed text-[#355448]">
            EASTLANE - современный интернет-магазин одежды и обуви с фокусом на чистый стиль,
            удобство и выразительные детали. Мы собираем капсульные коллекции, где каждую вещь
            легко сочетать между собой.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#355448]">
            Наш подход: лаконичный дизайн, понятный каталог, честная коммуникация и персональное
            сопровождение заказа. Мы не используем онлайн-оплату - оформление и подтверждение заказа
            происходят через менеджера.
          </p>
        </div>
      </section>
    </StoreShell>
  )
}
