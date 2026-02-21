-- EASTLANE delivery rates seed
-- Run after docs/sql/site_sections.sql

insert into public.site_sections (section_key, title, payload, is_published)
values (
  'delivery_rates',
  'Тарифы и доставка',
  $${
    "title": "Тарифы и доставка",
    "backgroundWatermark": "eastlane.ru",
    "groups": [
      {
        "title": "Страны",
        "destination": "Москва",
        "rows": [
          {
            "country": "Россия",
            "flag": "🇷🇺",
            "rates": { "kg1": 7, "kg2": 7, "kg3": 7, "kg5": 7, "kg10": 6.5, "kg20Plus": 6 }
          },
          {
            "country": "Россия (авиа)",
            "flag": "🇷🇺",
            "rates": { "kg1": 40, "kg2": 40, "kg3": 40, "kg5": 36, "kg10": 36, "kg20Plus": 36 }
          },
          {
            "country": "Беларусь",
            "flag": "🇧🇾",
            "rates": { "kg1": 7, "kg2": 7, "kg3": 7, "kg5": 7, "kg10": 6.5, "kg20Plus": 6 }
          }
        ],
        "notes": [
          { "icon": "clock", "text": "Доставка авто 25-45 дней | доставка авиа 4-9 дней" },
          { "icon": "dollar-sign", "text": "Цены указаны за 1 кг в $" },
          { "icon": "truck", "text": "Тарифы указаны с доставкой до Москвы" },
          { "icon": "package", "text": "Стоимость упаковки и оформления 1.5$" }
        ],
        "transportNote": "Оплата доставки транспортной компанией (СДЭК) оплачивается отдельно."
      },
      {
        "title": "Страны",
        "destination": "Алматы",
        "rows": [
          {
            "country": "Казахстан",
            "flag": "🇰🇿",
            "rates": { "kg1": 5, "kg2": 5, "kg3": 5, "kg5": 4.5, "kg10": 4, "kg20Plus": 4 }
          }
        ],
        "notes": [
          { "icon": "clock", "text": "Доставка 12-14 дней от нашего склада" },
          { "icon": "dollar-sign", "text": "Цены указаны за 1 кг в $" },
          { "icon": "truck", "text": "Тарифы указаны с доставкой до Алматы" }
        ],
        "transportNote": "Оплата доставки транспортной компанией (СДЭК) оплачивается отдельно."
      }
    ]
  }$$::jsonb,
  true
)
on conflict (section_key) do update
set
  title = excluded.title,
  payload = excluded.payload,
  is_published = excluded.is_published;
