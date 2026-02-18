import type {
  AboutSectionContent,
  BenefitsSectionContent,
  ContactsSectionContent,
  FaqSectionContent,
  HeroSectionContent,
  LookbookSectionContent,
} from "@/src/domains/content/types"

export const defaultHeroSection: HeroSectionContent = {
  badge: "EASTLANE",
  title: "Заказы товаров",
  accent: "из Китая под ключ",
  description:
    "Помогаем находить и привозить качественную одежду от проверенных поставщиков. Индивидуальный подход, контроль на всех этапах. Заказ через менеджера, без онлайн-оплаты.",
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

