const mockOrderItems = [
  // ==========================================
  // ЗАКАЗ 1 (total_price: 3500.00)
  // ==========================================
  {
    _id: 1n,
    order_id: 1n,
    bouquet_id: 1n,  // Весенний микс
    quantity: 1,
    price_snapshot: 1500.00
  },
  {
    _id: 2n,
    order_id: 1n,
    bouquet_id: 2n,  // Классический рубин
    quantity: 1,
    price_snapshot: 2000.00
  },

  // ==========================================
  // ЗАКАЗ 2 (total_price: 4800.00)
  // ==========================================
  {
    _id: 3n,
    order_id: 2n,
    bouquet_id: 3n,  // Нежное облако
    quantity: 1,
    price_snapshot: 3000.00
  },
  {
    _id: 4n,
    order_id: 2n,
    bouquet_id: 10n, // Кастомная сборка №1 (создана user_id 1)
    quantity: 1,
    price_snapshot: 1800.00
  },

  // ==========================================
  // ЗАКАЗ 3 (total_price: 2500.00)
  // ==========================================
  {
    _id: 5n,
    order_id: 3n,
    bouquet_id: 1n,  // Весенний микс
    quantity: 1,
    price_snapshot: 1500.00
  },
  {
    _id: 6n,
    order_id: 3n,
    bouquet_id: 6n,  // Ароматная фрезия
    quantity: 1,
    price_snapshot: 1000.00
  },

  // ==========================================
  // ЗАКАЗ 4 (total_price: 6200.00)
  // ==========================================
  {
    _id: 7n,
    order_id: 4n,
    bouquet_id: 2n,  // Классический рубин
    quantity: 1,
    price_snapshot: 2000.00
  },
  {
    _id: 8n,
    order_id: 4n,
    bouquet_id: 15n, // Кастомная сборка №6 (создана user_id 2)
    quantity: 1,
    price_snapshot: 4200.00
  },

  // ==========================================
  // ЗАКАЗ 5 (total_price: 5100.00)
  // ==========================================
  {
    _id: 9n,
    order_id: 5n,
    bouquet_id: 3n,  // Нежное облако
    quantity: 1,
    price_snapshot: 3000.00
  },
  {
    _id: 10n,
    order_id: 5n,
    bouquet_id: 11n, // Кастомная сборка №2 (создана user_id 3)
    quantity: 1,
    price_snapshot: 2100.00
  },

  // ==========================================
  // ЗАКАЗ 6 (total_price: 3200.00)
  // ==========================================
  {
    _id: 1n,
    order_id: 6n,
    bouquet_id: 5n,  // Солнечный день
    quantity: 1,
    price_snapshot: 1700.00
  },
  {
    _id: 12n,
    order_id: 6n,
    bouquet_id: 1n,  // Весенний микс
    quantity: 1,
    price_snapshot: 1500.00
  },

  // ==========================================
  // ЗАКАЗ 7 (total_price: 4300.00)
  // ==========================================
  {
    _id: 13n,
    order_id: 7n,
    bouquet_id: 4n,  // Синева океана
    quantity: 1,
    price_snapshot: 2500.00
  },
  {
    _id: 14n,
    order_id: 7n,
    bouquet_id: 12n, // Кастомная сборка №3 (создана user_id 4)
    quantity: 1,
    price_snapshot: 1800.00
  },

  // ==========================================
  // ЗАКАЗ 8 (total_price: 2900.00)
  // ==========================================
  {
    _id: 15n,
    order_id: 8n,
    bouquet_id: 6n,  // Ароматная фрезия
    quantity: 1,
    price_snapshot: 1000.00
  },
  {
    _id: 16n,
    order_id: 8n,
    bouquet_id: 9n,  // Лавандовое поле
    quantity: 1,
    price_snapshot: 1900.00
  },

  // ==========================================
  // ЗАКАЗ 9 (total_price: 7500.00)
  // ==========================================
  {
    _id: 17n,
    order_id: 9n,
    bouquet_id: 7n,  // Утро в Париже
    quantity: 1,
    price_snapshot: 3500.00
  },
  {
    _id: 18n,
    order_id: 9n,
    bouquet_id: 8n,  // Белоснежная нежность
    quantity: 1,
    price_snapshot: 4000.00
  },

  // ==========================================
  // ЗАКАЗ 10 (total_price: 3500.00)
  // ==========================================
  {
    _id: 19n,
    order_id: 10n,
    bouquet_id: 1n,  // Весенний микс
    quantity: 1,
    price_snapshot: 1500.00
  },
  {
    _id: 20n,
    order_id: 10n,
    bouquet_id: 2n,  // Классический рубин
    quantity: 1,
    price_snapshot: 2000.00
  },

  // ==========================================
  // ЗАКАЗ 11 (total_price: 1800.00)
  // ==========================================
  {
    _id: 21n,
    order_id: 11n,
    bouquet_id: 6n,  // Ароматная фрезия
    quantity: 1,
    price_snapshot: 1000.00
  },
  {
    _id: 22n,
    order_id: 11n,
    bouquet_id: 9n,  // Лавандовое поле
    quantity: 1,
    price_snapshot: 800.00
  },

  // ==========================================
  // ЗАКАЗ 12 (total_price: 4100.00)
  // ==========================================
  {
    _id: 23n,
    order_id: 12n,
    bouquet_id: 5n,  // Солнечный день
    quantity: 1,
    price_snapshot: 1700.00
  },
  {
    _id: 24n,
    order_id: 12n,
    bouquet_id: 4n,  // Синева океана
    quantity: 1,
    price_snapshot: 2400.00
  },

  // ==========================================
  // ЗАКАЗ 13 (total_price: 3900.00)
  // ==========================================
  {
    _id: 25n,
    order_id: 13n,
    bouquet_id: 1n,  // Весенний микс
    quantity: 1,
    price_snapshot: 1500.00
  },
  {
    _id: 26n,
    order_id: 13n,
    bouquet_id: 4n,  // Синева океана
    quantity: 1,
    price_snapshot: 2400.00
  },

  // ==========================================
  // ЗАКАЗ 14 (total_price: 5500.00)
  // ==========================================
  {
    _id: 27n,
    order_id: 14n,
    bouquet_id: 8n,  // Белоснежная нежность
    quantity: 1,
    price_snapshot: 4000.00
  },
  {
    _id: 28n,
    order_id: 14n,
    bouquet_id: 1n,  // Весенний микс
    quantity: 1,
    price_snapshot: 1500.00
  },

  // ==========================================
  // ЗАКАЗ 15 (total_price: 2800.00)
  // ==========================================
  {
    _id: 29n,
    order_id: 15n,
    bouquet_id: 6n,  // Ароматная фрезия
    quantity: 1,
    price_snapshot: 1000.00
  },
  {
    _id: 30n,
    order_id: 15n,
    bouquet_id: 1n,  // Весенний микс
    quantity: 1,
    price_snapshot: 1800.00
  },

  // ==========================================
  // ЗАКАЗ 16 (total_price: 3400.00)
  // ==========================================
  {
    _id: 31n,
    order_id: 16n,
    bouquet_id: 5n,  // Солнечный день
    quantity: 1,
    price_snapshot: 1700.00
  },
  {
    _id: 32n,
    order_id: 16n,
    bouquet_id: 5n,  // Солнечный день (повторная покупка в заказе невозможна по unique_order_item, берем другой букет)
    bouquet_id: 9n,  // Лавандовое поле
    quantity: 1,
    price_snapshot: 1700.00
  },

  // ==========================================
  // ЗАКАЗ 17 (total_price: 6700.00)
  // ==========================================
  {
    _id: 33n,
    order_id: 17n,
    bouquet_id: 7n,  // Утро в Париже
    quantity: 1,
    price_snapshot: 3500.00
  },
  {
    _id: 34n,
    order_id: 17n,
    bouquet_id: 3n,  // Нежное облако
    quantity: 1,
    price_snapshot: 3200.00
  },

  // ==========================================
  // ЗАКАЗ 18 (total_price: 4900.00)
  // ==========================================
  {
    _id: 35n,
    order_id: 18n,
    bouquet_id: 8n,  // Белоснежная нежность
    quantity: 1,
    price_snapshot: 3400.00
  },
  {
    _id: 36n,
    order_id: 18n,
    bouquet_id: 1n,  // Весенний микс
    quantity: 1,
    price_snapshot: 1500.00
  },

  // ==========================================
  // ЗАКАЗ 19 (total_price: 3100.00)
  // ==========================================
  {
    _id: 37n,
    order_id: 19n,
    bouquet_id: 2n,  // Классический рубин
    quantity: 1,
    price_snapshot: 1600.00
  },
  {
    _id: 38n,
    order_id: 19n,
    bouquet_id: 1n,  // Весенний микс
    quantity: 1,
    price_snapshot: 1500.00
  },

  // ==========================================
  // ЗАКАЗ 20 (total_price: 5800.00)
  // ==========================================
  {
    _id: 39n,
    order_id: 20n,
    bouquet_id: 3n,  // Нежное облако
    quantity: 1,
    price_snapshot: 3500.00
  },
  {
    _id: 40n,
    order_id: 20n,
    bouquet_id: 2n,  // Классический рубин
    quantity: 1,
    price_snapshot: 2300.00
  }
];

export default mockOrderItems;