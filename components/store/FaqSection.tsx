import { ChevronDown } from "lucide-react"

type FaqItem = {
  question: string
  answer: string[]
}

const faqItems: FaqItem[] = [
  {
    question: "Как оформить заказ?",
    answer: [
      "Определитесь с товаром или обратитесь к менеджеру — он поможет найти нужный товар и рассчитает стоимость доставки.",
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
      "После выкупа товар поступает на международную доставку. Учитываются фактический и объемный вес, затем подбирается оптимальный способ отправки.",
      "Чем больше общий объем отправки, тем выгоднее стоимость за килограмм.",
    ],
  },
  {
    question: "Страховка посылки",
    answer: [
      "Рекомендуется оформлять страховку: она покрывает стоимость товара и может частично покрывать стоимость доставки в зависимости от перевозчика и страны.",
    ],
  },
  {
    question: "Сроки и фотоотчёт",
    answer: [
      "Когда весь заказ поступает на склад, подготавливается фотоотчёт. После подтверждения фото товар отправляется в международную доставку.",
    ],
  },
  {
    question: "Возврат товара",
    answer: ["Возврат возможен только на территории Китая и по уважительной причине. После отправки товара в Россию возврат невозможен."],
  },
  {
    question: "Хранение товара",
    answer: ["Товар хранится на складе до отправки, стандартно 60 дней."],
  },
  {
    question: "Контакты",
    answer: ["Все вопросы и оформление — через менеджера: @argenoev"],
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="store-section pb-14">
      <div className="store-card p-5 md:p-6">
        <p className="store-eyebrow">FAQ</p>
        <h2 className="mt-2 text-2xl font-semibold text-[color:var(--color-brand-forest-light)] md:text-3xl">
          Ответы на ключевые вопросы
        </h2>
        <div className="mt-5 space-y-2.5">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group overflow-hidden rounded-xl border border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-tertiary)] open:border-[color:var(--color-border-accent)]"
            >
              <summary className="store-focus flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-left marker:content-none [&::-webkit-details-marker]:hidden [&::marker]:hidden">
                <span className="flex-1 text-left text-sm font-medium text-[color:var(--color-brand-forest-light)] md:text-base">{item.question}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-[color:var(--color-brand-beige-dark)] transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="space-y-1.5 border-t border-[color:var(--color-border-secondary)] px-4 pb-3.5 pt-2.5 text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
                {item.answer.map((line, index) => {
                  const hasManagerHandle = line.includes("@argenoev")
                  if (!hasManagerHandle) {
                    return <p key={`${item.question}-${index}`}>{line}</p>
                  }

                  return (
                    <p key={`${item.question}-${index}`}>
                      Все вопросы и оформление — через менеджера:{" "}
                      <a
                        href="https://t.me/argenoev"
                        target="_blank"
                        rel="noreferrer"
                        className="store-focus font-medium text-[color:var(--color-brand-beige-dark)] hover:text-[color:var(--color-brand-gold-700)]"
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
