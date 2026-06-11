const mockBouquetComponents = [
  // ==========================================
  // БУКЕТ 1: Весенний микс (_id: 1n)
  // ==========================================
  {
    _id: 1n,
    bouquet_id: 1n,
    component_id: 10n, // Желтый тюльпан
    quantity: 11.00
  },
  {
    _id: 2n,
    bouquet_id: 1n,
    component_id: 11n, // Белый тюльпан
    quantity: 10.00
  },
  {
    _id: 3n,
    bouquet_id: 1n,
    component_id: 33n, // Атласная лента розовая
    quantity: 1.50
  },
  {
    _id: 4n,
    bouquet_id: 1n,
    component_id: 62n, // Матовая пленка розовая
    quantity: 2.00
  },

  // ==========================================
  // БУКЕТ 2: Классический рубин (_id: 2n)
  // ==========================================
  {
    _id: 5n,
    bouquet_id: 2n,
    component_id: 2n, // Красная роза 70см
    quantity: 25.00
  },
  {
    _id: 6n,
    bouquet_id: 2n,
    component_id: 31n, // Атласная лента красная
    quantity: 2.00
  },
  {
    _id: 7n,
    bouquet_id: 2n,
    component_id: 63n, // Матовая пленка черная
    quantity: 2.50
  },

  // ==========================================
  // БУКЕТ 3: Нежное облако (_id: 3n)
  // ==========================================
  {
    _id: 8n,
    bouquet_id: 3n,
    component_id: 5n, // Белый пион
    quantity: 7.00
  },
  {
    _id: 9n,
    bouquet_id: 3n,
    component_id: 17n, // Ветка розовой гипсофилы
    quantity: 5.00
  },
  {
    _id: 10n,
    bouquet_id: 3n,
    component_id: 32n, // Атласная лента белая
    quantity: 1.50
  },
  {
    _id: 11n,
    bouquet_id: 3n,
    component_id: 64n, // Матовая пленка белая
    quantity: 3.00
  },

  // ==========================================
  // БУКЕТ 4: Синева океана (_id: 4n)
  // ==========================================
  {
    _id: 12n,
    bouquet_id: 4n,
    component_id: 7n, // Голубая гортензия
    quantity: 3.00
  },
  {
    _id: 13n,
    bouquet_id: 4n,
    component_id: 24n, // Синий ирис
    quantity: 9.00
  },
  {
    _id: 14n,
    bouquet_id: 4n,
    component_id: 35n, // Джутовый шпагат
    quantity: 1.00
  },
  {
    _id: 15n,
    bouquet_id: 4n,
    component_id: 61n, // Крафт-бумага
    quantity: 2.00
  },

  // ==========================================
  // БУКЕТ 5: Солнечный день (_id: 5n)
  // ==========================================
  {
    _id: 16n,
    bouquet_id: 5n,
    component_id: 28n, // Подсолнух декоративный
    quantity: 5.00
  },
  {
    _id: 17n,
    bouquet_id: 5n,
    component_id: 13n, // Белая хризантема кустовая
    quantity: 7.00
  },
  {
    _id: 18n,
    bouquet_id: 5n,
    component_id: 36n, // Топпер С Днем Рождения
    quantity: 1.00
  },
  {
    _id: 19n,
    bouquet_id: 5n,
    component_id: 61n, // Крафт-бумага
    quantity: 1.50
  },

  // ==========================================
  // БУКЕТ 6: Ароматная фрезия (_id: 6n)
  // ==========================================
  {
    _id: 20n,
    bouquet_id: 6n,
    component_id: 23n, // Белая фрезия
    quantity: 15.00
  },
  {
    _id: 21n,
    bouquet_id: 6n,
    component_id: 34n, // Кружевная лента бежевая
    quantity: 1.20
  },
  {
    _id: 22n,
    bouquet_id: 6n,
    component_id: 65n, // Прозрачная слюда
    quantity: 1.50
  },

  // ==========================================
  // БУКЕТ 7: Утро в Париже (_id: 7n)
  // ==========================================
  {
    _id: 23n,
    bouquet_id: 7n,
    component_id: 4n, // Пионовидная роза Джульетта
    quantity: 9.00
  },
  {
    _id: 24n,
    bouquet_id: 7n,
    component_id: 41n, // Флористическая губка Оазис
    quantity: 1.00
  },
  {
    _id: 25n,
    bouquet_id: 7n,
    component_id: 33n, // Атласная лента розовая
    quantity: 1.00
  },

  // ==========================================
  // БУКЕТ 8: Белоснежная нежность (_id: 8n)
  // ==========================================
  {
    _id: 26n,
    bouquet_id: 8n,
    component_id: 1n, // Белая роза 60см
    quantity: 15.00
  },
  {
    _id: 27n,
    bouquet_id: 8n,
    component_id: 26n, // Белая калла
    quantity: 7.00
  },
  {
    _id: 28n,
    bouquet_id: 8n,
    component_id: 20n, // Ветка эвкалипта Парвифолия
    quantity: 4.00
  },
  {
    _id: 29n,
    bouquet_id: 8n,
    component_id: 32n, // Атласная лента белая
    quantity: 2.00
  },
  {
    _id: 30n,
    bouquet_id: 8n,
    component_id: 64n, // Матовая пленка белая
    quantity: 2.00
  },

  // ==========================================
  // БУКЕТ 9: Лавандовое поле (_id: 9n)
  // ==========================================
  {
    _id: 31n,
    bouquet_id: 9n,
    component_id: 30n, // Сухоцвет Лаванда
    quantity: 30.00
  },
  {
    _id: 32n,
    bouquet_id: 9n,
    component_id: 35n, // Джутовый шпагат
    quantity: 1.50
  },
  {
    _id: 33n,
    bouquet_id: 9n,
    component_id: 61n, // Крафт-бумага
    quantity: 1.00
  },

  // ==========================================
  // БУКЕТ 10: Кастомная сборка №1 (_id: 10n)
  // ==========================================
  {
    _id: 34n,
    bouquet_id: 10n,
    component_id: 3n, // Розовая роза 50см
    quantity: 11.00
  },
  {
    _id: 35n,
    bouquet_id: 10n,
    component_id: 39n, // Мини-открытка "Для тебя"
    quantity: 1.00
  },
  {
    _id: 36n,
    bouquet_id: 10n,
    component_id: 62n, // Матовая пленка розовая
    quantity: 1.50
  },

  // ==========================================
  // БУКЕТ 11: Кастомная сборка №2 (_id: 11n)
  // ==========================================
  {
    _id: 37n,
    bouquet_id: 11n,
    component_id: 6n, // Розовый пион Сара Бернар
    quantity: 9.00
  },
  {
    _id: 38n,
    bouquet_id: 11n,
    component_id: 40n, // Мини-открытка "С любовью"
    quantity: 1.00
  },
  {
    _id: 39n,
    bouquet_id: 11n,
    component_id: 64n, // Матовая пленка белая
    quantity: 2.00
  },

  // ==========================================
  // БУКЕТ 12: Кастомная сборка №3 (_id: 12n)
  // ==========================================
  {
    _id: 40n,
    bouquet_id: 12n,
    component_id: 14n, // Сиреневая эустома
    quantity: 15.00
  },
  {
    _id: 41n,
    bouquet_id: 12n,
    component_id: 42n, // Декоративная бабочка
    quantity: 2.00
  },
  {
    _id: 42n,
    bouquet_id: 12n,
    component_id: 65n, // Прозрачная слюда
    quantity: 2.00
  },

  // ==========================================
  // БУКЕТ 13: Кастомная сборка №4 (_id: 13n)
  // ==========================================
  {
    _id: 43n,
    bouquet_id: 13n,
    component_id: 18n, // Синя гвоздинка
    quantity: 19.00
  },
  {
    _id: 44n,
    bouquet_id: 13n,
    component_id: 45n, // Наклейка Hand Made
    quantity: 1.00
  },
  {
    _id: 45n,
    bouquet_id: 13n,
    component_id: 63n, // Матовая пленка черная
    quantity: 1.50
  },

  // ==========================================
  // БУКЕТ 14: Кастомная сборка №5 (_id: 14n)
  // ==========================================
  {
    _id: 46n,
    bouquet_id: 14n,
    component_id: 27n, // Ветка кустовой розы Бомбастик
    quantity: 7.00
  },
  {
    _id: 47n,
    bouquet_id: 14n,
    component_id: 21n, // Ветка эвкалипта Цинерия
    quantity: 3.00
  },
  {
    _id: 48n,
    bouquet_id: 14n,
    component_id: 37n, // Топпер Любимой
    quantity: 1.00
  },
  {
    _id: 49n,
    bouquet_id: 14n,
    component_id: 64n, // Матовая пленка белая
    quantity: 2.00
  },

  // ==========================================
  // БУКЕТ 15: Кастомная сборка №6 (_id: 15n)
  // ==========================================
  {
    _id: 50n,
    bouquet_id: 15n,
    component_id: 22n, // Красный анемон
    quantity: 21.00
  },
  {
    _id: 51n,
    bouquet_id: 15n,
    component_id: 16n, // Ветка белой гипсофилы
    quantity: 4.00
  },
  {
    _id: 52n,
    bouquet_id: 15n,
    component_id: 31n, // Атласная лента красная
    quantity: 1.50
  },
  {
    _id: 53n,
    bouquet_id: 15n,
    component_id: 61n, // Крафт-бумага
    quantity: 2.50
  },

  // ==========================================
  // БУКЕТ 16: Кастомная сборка №7 (_id: 16n)
  // ==========================================
  {
    _id: 54n,
    bouquet_id: 16n,
    component_id: 15n, // Белая эустома
    quantity: 11.00
  },
  {
    _id: 55n,
    bouquet_id: 16n,
    component_id: 19n, // Розовая гвоздика
    quantity: 10.00
  },
  {
    _id: 56n,
    bouquet_id: 16n,
    component_id: 43n, // Блестки серебро
    quantity: 10.00
  },
  {
    _id: 57n,
    bouquet_id: 16n,
    component_id: 46n, // Наклейка Для тебя
    quantity: 1.00
  },
  {
    _id: 58n,
    bouquet_id: 16n,
    component_id: 32n, // Атласная лента белая
    quantity: 2.00
  },
  {
    _id: 59n,
    bouquet_id: 16n,
    component_id: 62n, // Матовая пленка розовая
    quantity: 1.50
  },
  {
    _id: 60n,
    bouquet_id: 16n,
    component_id: 64n, // Матовая пленка белая
    quantity: 1.50
  }
];

export default mockBouquetComponents;