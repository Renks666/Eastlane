insert into site_sections (section_key, title, payload, is_published)
values (
  'eastlane_tariffs',
  'Тарифы EASTLANE',
  jsonb_build_object(
    'title', 'Тарифы EASTLANE',
    'subtitle', 'Прозрачный расчет для розницы и опта с учетом сервиса и доставки.',
    'tiers', jsonb_build_array(
      jsonb_build_object(
        'id', 'retail',
        'title', 'Розница',
        'minItems', 1,
        'serviceFeeCny', 50,
        'serviceFeeRubApprox', 600,
        'example', jsonb_build_object(
          'lines', jsonb_build_array('Пример: куртка 250 ¥ + сервис 50 ¥ + доставка 8,5 $'),
          'resultLine', 'Итог: ≈ 340 ¥ (~4 000 ₽)'
        ),
        'warning', 'Цены в рублях указаны примерно, курс юаня к рублю может меняться.'
      ),
      jsonb_build_object(
        'id', 'wholesale',
        'title', 'Опт',
        'minItems', 5,
        'serviceFeeCny', 30,
        'serviceFeeRubApprox', 360,
        'example', jsonb_build_object(
          'lines', jsonb_build_array(
            'Пример: 5 курток по 250 ¥',
            'Сервис: 5 × 30 ¥ = 150 ¥',
            'Доставка: 5 × 8,5 $ ≈ 42,5 $'
          ),
          'resultLine', 'Итог: 1 600 ¥ (~19 200 ₽)'
        ),
        'warning', 'Оптовые расчеты итогово подтверждаются после проверки поставщика и логистики.'
      )
    ),
    'formulaTitle', 'Итоговая формула расчета',
    'formulaText', 'Итоговая стоимость = цена товара × количество + сервис × количество + доставка',
    'importantTitle', 'Важные моменты',
    'importantItems', jsonb_build_array(
      'Нет собственного склада — заказы идут напрямую от поставщика.',
      'Минимальный заказ не обязателен — можно брать единичные позиции.',
      'Оптовые заказы рассчитываются индивидуально.',
      'Возможен поиск любых товаров по вашей просьбе.',
      'Страховка посылки рекомендуется, покрывает стоимость товара и доставки.'
    ),
    'returnPolicy', 'В случае брака или ошибки поставщика возврат товара возможен, если причина уважительная (брак, неправильный цвет/размер).'
  ),
  true
)
on conflict (section_key) do update set
  title = excluded.title,
  payload = excluded.payload,
  is_published = excluded.is_published,
  updated_at = timezone('utc', now());
