import type {
  AboutSectionContent,
  BenefitsSectionContent,
  ContactsSectionContent,
  DeliveryRatesSectionContent,
  EastlaneTariffsSectionContent,
  ExchangeRateSectionContent,
  FaqSectionContent,
  HeroSectionContent,
  LookbookSectionContent,
} from "@/src/domains/content/types"

export const defaultHeroSection: HeroSectionContent = {
  badge: "EASTLANE",
  title: "Товары из Китая",
  accent: "напрямую",
  description:
    "Прямой выкуп из официальных магазинов и фабрик. Работаем под задачу клиента. Индивидуальный подход, контроль на всех этапах.",
  primaryCtaLabel: "Перейти в каталог",
  primaryCtaHref: "/catalog",
  secondaryCtaLabel: "Как мы работаем",
  secondaryCtaHref: "/#how-we-work",
}

export const defaultBenefitsSection: BenefitsSectionContent = {
  title: "Почему EASTLANE",
  items: [
    {
      title: "Капсульный ассортимент",
      description: "Подбираем вещи, которые легко сочетаются между собой.",
    },
    {
      title: "Акцент на посадку",
      description: "Фокусируемся на удобстве и понятных размерах.",
    },
    {
      title: "Подтверждение с менеджером",
      description: "Оформление заказа и детали доставки через контактный канал.",
    },
  ],
}

export const defaultLookbookSection: LookbookSectionContent = {
  title: "Новинки из Китая",
  subtitle: "Свежая подборка образов сезона.",
}

export const defaultFaqSection: FaqSectionContent = {
  title: "FAQ",
  items: [
    {
      question: "Как оформить заказ?",
      answer: "Добавьте товары в корзину, оставьте контакт, менеджер свяжется для подтверждения.",
    },
    {
      question: "Есть ли онлайн-оплата?",
      answer: "Нет, подтверждение заказа и оплата согласуются с менеджером.",
    },
  ],
}

export const defaultContactsSection: ContactsSectionContent = {
  title: "Свяжитесь с EASTLANE",
  subtitle: "Мы ответим по заказу, наличию и размерной сетке.",
  phone: "+7 (900) 000-00-00",
  email: "hello@eastlane.store",
  hours: "10:00 - 22:00",
  telegramUrl: "https://t.me/fearr666",
  instagramUrl: "https://instagram.com",
  whatsappUrl: "https://wa.me",
}

export const defaultAboutSection: AboutSectionContent = {
  eyebrow: "О бренде",
  title: "EASTLANE",
  paragraphs: [
    "EASTLANE - современный интернет-магазин одежды и обуви с фокусом на чистый стиль, удобство и выразительные детали.",
    "Наш подход: лаконичный дизайн, понятный каталог, честная коммуникация и персональное сопровождение заказа.",
  ],
}

export const defaultDeliveryRatesSection: DeliveryRatesSectionContent = {
  title: "Тарифы и доставка",
  backgroundWatermark: "eastlane.ru",
  groups: [
    {
      title: "Страны",
      destination: "Москва",
      rows: [
        {
          country: "Россия",
          flag: "RU",
          rates: {
            kg1: 7,
            kg2: 7,
            kg3: 7,
            kg5: 7,
            kg10: 6.5,
            kg20Plus: 6,
          },
        },
        {
          country: "Россия (авиа)",
          flag: "RU",
          rates: {
            kg1: 40,
            kg2: 40,
            kg3: 40,
            kg5: 36,
            kg10: 36,
            kg20Plus: 36,
          },
        },
        {
          country: "Беларусь",
          flag: "BY",
          rates: {
            kg1: 7,
            kg2: 7,
            kg3: 7,
            kg5: 7,
            kg10: 6.5,
            kg20Plus: 6,
          },
        },
      ],
      notes: [
        { icon: "clock", text: "Доставка авто 25-45 дней | доставка авиа 4-9 дней" },
        { icon: "dollar-sign", text: "Цены указаны за 1 кг в $" },
        { icon: "truck", text: "Тарифы указаны с доставкой до Москвы" },
        { icon: "package", text: "Стоимость упаковки и оформления 1.5$" },
      ],
      transportNote: "Оплата доставки транспортной компанией (СДЭК) оплачивается отдельно.",
    },
    {
      title: "Страны",
      destination: "Алматы",
      rows: [
        {
          country: "Казахстан",
          flag: "KZ",
          rates: {
            kg1: 5,
            kg2: 5,
            kg3: 5,
            kg5: 4.5,
            kg10: 4,
            kg20Plus: 4,
          },
        },
      ],
      notes: [
        { icon: "clock", text: "Доставка 12-14 дней от нашего склада" },
        { icon: "dollar-sign", text: "Цены указаны за 1 кг в $" },
        { icon: "truck", text: "Тарифы указаны с доставкой до Алматы" },
      ],
      transportNote: "Оплата доставки транспортной компанией (СДЭК) оплачивается отдельно.",
    },
  ],
}

export const defaultEastlaneTariffsSection: EastlaneTariffsSectionContent = {
  title: "Тарифы EASTLANE",
  subtitle: "Прозрачный расчет для розницы и опта с учетом сервиса и доставки.",
  tiers: [
    {
      id: "retail",
      title: "Розница",
      minItems: 1,
      serviceFeeCny: 50,
      serviceFeeRubApprox: 600,
      example: {
        lines: [
          "Пример: куртка 250 ¥ + сервис 50 ¥ + доставка 8,5 $",
        ],
        resultLine: "Итог: ≈ 340 ¥ (~4 000 ₽)",
      },
      warning: "Цены в рублях указаны примерно, курс юаня к рублю может меняться.",
    },
    {
      id: "wholesale",
      title: "Опт",
      minItems: 5,
      serviceFeeCny: 30,
      serviceFeeRubApprox: 360,
      example: {
        lines: [
          "Пример: 5 курток по 250 ¥",
          "Сервис: 5 × 30 ¥ = 150 ¥",
          "Доставка: 5 × 8,5 $ ≈ 42,5 $",
        ],
        resultLine: "Итог: 1 600 ¥ (~19 200 ₽)",
      },
      warning: "Оптовые расчеты итогово подтверждаются после проверки поставщика и логистики.",
    },
  ],
  formulaTitle: "Формула / Как формируется цена",
  formulaText: "Итоговая сумма = Стоимость товара + Сервис + Доставка по Китаю + Международная доставка",
  importantTitle: "Важные моменты",
  importantItems: [
    "Нет собственного склада — заказы идут напрямую от поставщика.",
    "Минимальный заказ не обязателен — можно брать единичные позиции.",
    "Оптовые заказы рассчитываются индивидуально.",
    "Возможен поиск любых товаров по вашей просьбе.",
    "Страховка посылки рекомендуется, покрывает стоимость товара и доставки.",
  ],
  returnPolicy:
    "В случае брака или ошибки поставщика возврат товара возможен, если причина уважительная (брак, неправильный цвет/размер).",
}


export const defaultExchangeRateSection: ExchangeRateSectionContent = {
  cnyPerRub: 0.09,
}

