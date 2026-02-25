import { ChevronDown } from "lucide-react"

type FaqItem = {
  question: string
  answer: string[]
}

const faqItems: FaqItem[] = [
  {
    question: "Как оформить заказ?",
    answer: [
      "Определитесь с товаром или обратитесь к менеджеру - он поможет найти нужный товар и рассчитает стоимость доставки.",
      "Отправляйте ссылки или фотографии товара, чтобы менеджер уточнил детали.",
    ],
  },
  {
    question: "С каких площадок вы выкупаете?",
    answer: ["Мы работаем с любыми китайскими маркетплейсами: TaoBao, 1688, Pinduoduo, Weidian, Poizon и др."],
  },
  {
    question: "Как происходит доставка?",
    answer: [
      "После выкупа товара нашим сервисом, товар поступает на международную доставку. Учитывается вес, объемный вес и формируется оптимальный способ доставки. Чем больше посылка, тем выгоднее цена за кг.",
    ],
  },
  {
    question: "Страховка посылки",
    answer: [
      "Рекомендуется оформлять страховку: она покрывает стоимость товара; частично может покрывать стоимость доставки, зависит от перевозчика и страны.",
    ],
  },
  {
    question: "Сроки и фотоотчёт",
    answer: [
      "Как только весь заказ поступает на склад, готовится фотоотчёт. После подтверждения фотоотчета товар отправляется в международную доставку.",
    ],
  },
  {
    question: "Возврат товара",
    answer: ["Возможен только в пределах Китая и по уважительной причине. После отправки товара в Россию возврат невозможен."],
  },
  {
    question: "Хранение товара",
    answer: ["Товар хранится на складе до отправки, стандартно 60 дней."],
  },
  {
    question: "Контакты",
    answer: ["Все вопросы и оформление - через менеджера: @argenoev"],
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="mx-auto max-w-7xl px-6 pb-16 md:px-12">
      <div className="rounded-3xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/90 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-text-accent)]">FAQ</p>
        <h2 className="mt-2 text-2xl font-semibold text-[color:var(--color-brand-forest-light)] md:text-3xl">
          Ответы на ключевые вопросы
        </h2>
        <div className="mt-6 space-y-3">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group overflow-hidden rounded-2xl border border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-tertiary)] open:border-[color:var(--color-border-accent)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-left marker:content-none [&::-webkit-details-marker]:hidden [&::marker]:hidden md:px-5">
                <span className="flex-1 text-left text-sm font-medium text-[color:var(--color-brand-forest-light)] md:text-base">{item.question}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-[color:var(--color-brand-beige-dark)] transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="space-y-2 border-t border-[color:var(--color-border-secondary)] px-4 pb-4 pt-3 text-sm leading-relaxed text-[color:var(--color-text-secondary)] md:px-5">
                {item.answer.map((line, index) => {
                  const hasManagerHandle = line.includes("@argenoev")
                  if (!hasManagerHandle) {
                    return <p key={`${item.question}-${index}`}>{line}</p>
                  }

                  return (
                    <p key={`${item.question}-${index}`}>
                      Все вопросы и оформление - через менеджера:{" "}
                      <a
                        href="https://t.me/argenoev"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-[color:var(--color-brand-beige-dark)] hover:text-[color:var(--color-brand-gold-700)]"
                      >
                        @argenoev
                      </a>
                    </p>
                  )
                })}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
