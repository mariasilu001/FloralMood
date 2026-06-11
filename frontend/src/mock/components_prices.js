const mockComponentPrices = [
  // 1: Белая роза 60см
  {
    _id: 1n,
    component_id: 1n,
    price: 130.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 2n,
    component_id: 1n,
    price: 150.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 2: Красная роза 70см
  {
    _id: 3n,
    component_id: 2n,
    price: 160.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 4n,
    component_id: 2n,
    price: 180.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 3: Розовая роза 50см
  {
    _id: 5n,
    component_id: 3n,
    price: 100.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 6n,
    component_id: 3n,
    price: 120.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 4: Пионовидная роза Джульетта
  {
    _id: 7n,
    component_id: 4n,
    price: 220.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 8n,
    component_id: 4n,
    price: 250.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 5: Белый пион
  {
    _id: 9n,
    component_id: 5n,
    price: 300.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 10n,
    component_id: 5n,
    price: 350.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 6: Розовый пион Сара Бернар
  {
    _id: 11n,
    component_id: 6n,
    price: 320.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 12n,
    component_id: 6n,
    price: 380.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 7: Голубая гортензия
  {
    _id: 13n,
    component_id: 7n,
    price: 400.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 14n,
    component_id: 7n,
    price: 450.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 8: Розовая гортензия
  {
    _id: 15n,
    component_id: 8n,
    price: 380.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 16n,
    component_id: 8n,
    price: 420.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 9: Белая лилия
  {
    _id: 17n,
    component_id: 9n,
    price: 240.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 18n,
    component_id: 9n,
    price: 280.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 10: Желтый тюльпан
  {
    _id: 19n,
    component_id: 10n,
    price: 70.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 20n,
    component_id: 10n,
    price: 90.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 11: Белый тюльпан
  {
    _id: 21n,
    component_id: 11n,
    price: 70.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 22n,
    component_id: 11n,
    price: 90.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 12: Фиолетовая альстромерия
  {
    _id: 23n,
    component_id: 12n,
    price: 110.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 24n,
    component_id: 12n,
    price: 130.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 13: Белая хризантема кустовая
  {
    _id: 25n,
    component_id: 13n,
    price: 120.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 26n,
    component_id: 13n,
    price: 140.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 14: Сиреневая эустома
  {
    _id: 27n,
    component_id: 14n,
    price: 170.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 28n,
    component_id: 14n,
    price: 190.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 15: Белая эустома
  {
    _id: 29n,
    component_id: 15n,
    price: 170.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 30n,
    component_id: 15n,
    price: 190.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 16: Ветка белой гипсофилы
  {
    _id: 31n,
    component_id: 16n,
    price: 180.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 32n,
    component_id: 16n,
    price: 210.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 17: Ветка розовой гипсофилы
  {
    _id: 33n,
    component_id: 17n,
    price: 190.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 34n,
    component_id: 17n,
    price: 230.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 18: Синяя гвоздика (Диантус)
  {
    _id: 35n,
    component_id: 18n,
    price: 80.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 36n,
    component_id: 18n,
    price: 100.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 19: Розовая гвоздика (Диантус)
  {
    _id: 37n,
    component_id: 19n,
    price: 80.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 38n,
    component_id: 19n,
    price: 95.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 20: Ветка эвкалипта Парвифолия
  {
    _id: 39n,
    component_id: 20n,
    price: 130.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 40n,
    component_id: 20n,
    price: 150.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 21: Ветка эвкалипта Цинерия
  {
    _id: 41n,
    component_id: 21n,
    price: 140.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 42n,
    component_id: 21n,
    price: 165.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 22: Красный анемон
  {
    _id: 43n,
    component_id: 22n,
    price: 180.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 44n,
    component_id: 22n,
    price: 210.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 23: Белая фрезия
  {
    _id: 45n,
    component_id: 23n,
    price: 120.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 46n,
    component_id: 23n,
    price: 140.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 24: Синий ирис
  {
    _id: 47n,
    component_id: 24n,
    price: 90.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 48n,
    component_id: 24n,
    price: 110.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 25: Оранжевая гербера
  {
    _id: 49n,
    component_id: 25n,
    price: 130.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 50n,
    component_id: 25n,
    price: 150.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 26: Белая калла
  {
    _id: 51n,
    component_id: 26n,
    price: 200.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 52n,
    component_id: 26n,
    price: 230.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 27: Ветка кустовой розы Бомбастик
  {
    _id: 53n,
    component_id: 27n,
    price: 190.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 54n,
    component_id: 27n,
    price: 220.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 28: Подсолнух декоративный
  {
    _id: 55n,
    component_id: 28n,
    price: 150.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 56n,
    component_id: 28n,
    price: 180.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 29: Желтый нарцисс
  {
    _id: 57n,
    component_id: 29n,
    price: 80.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 58n,
    component_id: 29n,
    price: 100.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 30: Сухоцвет Лаванда
  {
    _id: 59n,
    component_id: 30n,
    price: 50.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 60n,
    component_id: 30n,
    price: 65.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 31: Атласная лента красная 2см
  {
    _id: 61n,
    component_id: 31n,
    price: 35.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 62n,
    component_id: 31n,
    price: 45.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 32: Атласная лента белая 2см
  {
    _id: 63n,
    component_id: 32n,
    price: 35.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 64n,
    component_id: 32n,
    price: 45.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 33: Атласная лента розовая 1.5см
  {
    _id: 65n,
    component_id: 33n,
    price: 30.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 66n,
    component_id: 33n,
    price: 40.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 34: Кружевная лента бежевая
  {
    _id: 67n,
    component_id: 34n,
    price: 55.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 68n,
    component_id: 34n,
    price: 70.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 35: Джутовый шпагат
  {
    _id: 69n,
    component_id: 35n,
    price: 15.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 70n,
    component_id: 35n,
    price: 20.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 36: Топпер С Днем Рождения
  {
    _id: 71n,
    component_id: 36n,
    price: 80.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 72n,
    component_id: 36n,
    price: 100.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 37: Топпер Любимой
  {
    _id: 73n,
    component_id: 37n,
    price: 80.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 74n,
    component_id: 37n,
    price: 100.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 38: Топпер С Юбилеем
  {
    _id: 75n,
    component_id: 38n,
    price: 90.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 76n,
    component_id: 38n,
    price: 110.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 39: Мини-открытка Для тебя
  {
    _id: 77n,
    component_id: 39n,
    price: 30.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 78n,
    component_id: 39n,
    price: 40.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 40: Мини-открытка С любовью
  {
    _id: 79n,
    component_id: 40n,
    price: 30.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 80n,
    component_id: 40n,
    price: 40.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 41: Флористическая губка Оазис
  {
    _id: 81n,
    component_id: 41n,
    price: 70.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 82n,
    component_id: 41n,
    price: 90.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 42: Декоративная бабочка на магните
  {
    _id: 83n,
    component_id: 42n,
    price: 40.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 84n,
    component_id: 42n,
    price: 50.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 43: Блестки для лепестков серебро
  {
    _id: 85n,
    component_id: 43n,
    price: 2.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 86n,
    component_id: 43n,
    price: 2.50,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 44: Блестки для лепестков золото
  {
    _id: 87n,
    component_id: 44n,
    price: 2.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 88n,
    component_id: 44n,
    price: 2.50,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 45: Наклейка Hand Made
  {
    _id: 89n,
    component_id: 45n,
    price: 5.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 90n,
    component_id: 45n,
    price: 7.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 46: Наклейка Для тебя
  {
    _id: 91n,
    component_id: 46n,
    price: 5.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 92n,
    component_id: 46n,
    price: 7.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 47: Сухоцвет Хлопок коробочка
  {
    _id: 93n,
    component_id: 47n,
    price: 45.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 94n,
    component_id: 47n,
    price: 60.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 48: Декоративные бусины на спирали
  {
    _id: 95n,
    component_id: 48n,
    price: 35.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 96n,
    component_id: 48n,
    price: 45.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 61: Крафт-бумага натуральная
  {
    _id: 97n,
    component_id: 61n,
    price: 60.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 98n,
    component_id: 61n,
    price: 80.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 62: Матовая пленка корейская розовая
  {
    _id: 99n,
    component_id: 62n,
    price: 90.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 100n,
    component_id: 62n,
    price: 110.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 63: Матовая пленка корейская черная
  {
    _id: 101n,
    component_id: 63n,
    price: 90.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 102n,
    component_id: 63n,
    price: 110.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 64: Матовая пленка корейская белая
  {
    _id: 103n,
    component_id: 64n,
    price: 90.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 104n,
    component_id: 64n,
    price: 110.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  },

  // 65: Прозрачная слюда
  {
    _id: 105n,
    component_id: 65n,
    price: 40.00,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-05-31")
  },
  {
    _id: 106n,
    component_id: 65n,
    price: 50.00,
    start_date: new Date("2026-06-01"),
    end_date: new Date("2026-12-31")
  }
];

export default mockComponentPrices;