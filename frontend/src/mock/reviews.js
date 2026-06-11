const mockReviews = [
  // ==========================================
  // ЗАКАЗ 1 (Пользователь: 1n, Доставлен: 2026-04-16)
  // ==========================================
  {
    _id: 1n,
    user_id: 1n,
    bouquet_id: 1n,
    order_id: 1n,
    rating: 5,
    text: "Весенний микс просто супер! Очень свежие тюльпаны, стояли больше недели.",
    created_at: new Date("2026-04-18T12:00:00"),
    changed_at: null,
    deleted_at: null,
  },
  {
    _id: 2n,
    user_id: 1n,
    bouquet_id: 2n,
    order_id: 1n,
    rating: 5,
    text: "Классический рубин выглядит дорого и солидно. Розы крупные, аромат шикарный.",
    created_at: new Date("2026-04-17T19:30:00"),
    changed_at: null,
    deleted_at: null,
  },

  // ==========================================
  // ЗАКАЗ 2 (Пользователь: 1n, Оплачен — отзыв оставлен после получения в будущем/альтернативно)
  // ==========================================
  {
    _id: 3n,
    user_id: 1n,
    bouquet_id: 3n,
    order_id: 2n,
    rating: 4,
    text: "Пионы красивые, но один бутон приехал немного помятым. В целом композиция отличная.",
    created_at: new Date("2026-06-12T15:00:00"),
    changed_at: null,
    deleted_at: null,
  },
  {
    _id: 4n,
    user_id: 1n,
    bouquet_id: 10n,
    order_id: 2n,
    rating: 5,
    text: "Собирал сам в конструкторе, флористы реализовали все в точности как я хотел!",
    created_at: new Date("2026-06-12T16:20:00"),
    changed_at: null,
    deleted_at: null,
  },

  // ==========================================
  // ЗАКАЗ 3 (Пользователь: 2n, Доставлен: 2026-04-23)
  // ==========================================
  {
    _id: 5n,
    user_id: 2n,
    bouquet_id: 1n,
    order_id: 3n,
    rating: 5,
    text: "Брал коллеге на работу, весь офис оценил. Спасибо за быструю доставку.",
    created_at: new Date("2026-04-24T10:00:00"),
    changed_at: null,
    deleted_at: null,
  },
  {
    _id: 6n,
    user_id: 2n,
    bouquet_id: 6n,
    order_id: 3n,
    rating: 5,
    text: "Фрезии пахнут на всю квартиру! Очень нежный монобукет.",
    created_at: new Date("2026-04-25T11:40:00"),
    changed_at: null,
    deleted_at: null,
  },

  // ==========================================
  // ЗАКАЗ 4 (Пользователь: 2n, В сборке/Получен: 2026-06-12)
  // ==========================================
  {
    _id: 7n,
    user_id: 2n,
    bouquet_id: 2n,
    order_id: 4n,
    rating: 5,
    text: "Красные розы — это бессмертная классика. Качество исполнения на высоте.",
    created_at: new Date("2026-06-12T19:00:00"),
    changed_at: null,
    deleted_at: null,
  },
  {
    _id: 8n,
    user_id: 2n,
    bouquet_id: 15n,
    order_id: 4n,
    rating: 5,
    text: "Мой кастомный букет получился огромным и очень ярким. Обязательно соберу еще что-нибудь.",
    created_at: new Date("2026-06-12T20:15:00"),
    changed_at: null,
    deleted_at: null,
  },

  // ==========================================
  // ЗАКАЗ 5 (Пользователь: 3n, Доставлен: 2026-05-03)
  // ==========================================
  {
    _id: 9n,
    user_id: 3n,
    bouquet_id: 3n,
    order_id: 5n,
    rating: 5,
    text: "Обожаю сочетание пионов и гипсофилы, букет получился воздушным, как облако.",
    created_at: new Date("2026-05-04T14:30:00"),
    changed_at: null,
    deleted_at: null,
  },
  {
    _id: 10n,
    user_id: 3n,
    bouquet_id: 11n,
    order_id: 5n,
    rating: 5,
    text: "Собрала букет из любимых розовых пионов. Доставили вовремя, именинница в восторге.",
    created_at: new Date("2026-05-05T09:10:00"),
    changed_at: null,
    deleted_at: null,
  },

  // ==========================================
  // ЗАКАЗ 6 (Пользователь: 3n, Новый/Доставлен: 2026-06-11)
  // ==========================================
  {
    _id: 11n,
    user_id: 3n,
    bouquet_id: 5n,
    order_id: 6n,
    rating: 4,
    text: "Подсолнухи очень жизнерадостные, но упаковка немного помялась при транспортировке.",
    created_at: new Date("2026-06-11T18:00:00"),
    changed_at: null,
    deleted_at: null,
  },
  {
    _id: 12n,
    user_id: 3n,
    bouquet_id: 1n,
    order_id: 6n,
    rating: 5,
    text: "Опять заказала весенний микс, сборка немного отличается от прошлого раза, но даже лучше.",
    created_at: new Date("2026-06-11T18:30:00"),
    changed_at: null,
    deleted_at: null,
  },

  // ==========================================
  // ЗАКАЗ 7 (Пользователь: 4n, Доставлен: 2026-05-09)
  // ==========================================
  {
    _id: 13n,
    user_id: 4n,
    bouquet_id: 4n,
    order_id: 7n,
    rating: 5,
    text: "Синие гортензии выглядят нереально космически! Очень необычный подарок.",
    created_at: new Date("2026-05-10T11:00:00"),
    changed_at: null,
    deleted_at: null,
  },
  {
    _id: 14n,
    user_id: 4n,
    bouquet_id: 12n,
    order_id: 7n,
    rating: 4,
    text: "Мой личный дизайн из эустом. Собрали хорошо, но думал, что он будет чуть больше по размеру.",
    created_at: new Date("2026-05-10T13:45:00"),
    changed_at: null,
    deleted_at: null,
  },

  // ==========================================
  // ЗАКАЗ 8 (Пользователь: 4n, Оплачен/Получен: 2026-06-12)
  // ==========================================
  {
    _id: 15n,
    user_id: 4n,
    bouquet_id: 6n,
    order_id: 8n,
    rating: 5,
    text: "Запах фрезий потрясающий, букет стоит и радует глаз.",
    created_at: new Date("2026-06-12T14:00:00"),
    changed_at: null,
    deleted_at: null,
  },
  {
    _id: 16n,
    user_id: 4n,
    bouquet_id: 9n,
    order_id: 8n,
    rating: 5,
    text: "Лаванда пахнет невероятно. Огромный плюс, что это сухоцвет и он простоит вечно.",
    created_at: new Date("2026-06-12T14:15:00"),
    changed_at: null,
    deleted_at: null,
  },

  // ==========================================
  // ЗАКАЗ 9 (Пользователь: 5n, Доставлен: 2026-04-29)
  // ==========================================
  {
    _id: 17n,
    user_id: 5n,
    bouquet_id: 7n,
    order_id: 9n,
    rating: 5,
    text: "Коробка с пионовидными розами шикарная, очень стильный французский дизайн.",
    created_at: new Date("2026-04-30T10:30:00"),
    changed_at: null,
    deleted_at: null,
  },
  {
    _id: 18n,
    user_id: 5n,
    bouquet_id: 8n,
    order_id: 9n,
    rating: 5,
    text: "Свадебный букет с каллами превзошел все ожидания, невеста была счастлива.",
    created_at: new Date("2026-04-30T11:00:00"),
    changed_at: null,
    deleted_at: null,
  },

  // ==========================================
  // ЗАКАЗ 10 (Пользователь: 5n, Отменен — отзыв пишется на возвращенный/измененный опыт)
  // ==========================================
  {
    _id: 19n,
    user_id: 5n,
    bouquet_id: 1n,
    order_id: 10n,
    rating: 3,
    text: "Сам букет хороший, но пришлось отменить из-за личных обстоятельств, деньги возвращали долго.",
    created_at: new Date("2026-05-28T16:00:00"),
    changed_at: null,
    deleted_at: null,
  },
  {
    _id: 20n,
    user_id: 5n,
    bouquet_id: 2n,
    order_id: 10n,
    rating: 4,
    text: "Розы красивые, но сервис отмены заказа работает медленно.",
    created_at: new Date("2026-05-28T16:30:00"),
    changed_at: null,
    deleted_at: null,
  },

  // ==========================================
  // ЗАКАЗ 11 (Пользователь: 6n, Доставлен: 2026-05-13)
  // ==========================================
  {
    _id: 21n,
    user_id: 6n,
    bouquet_id: 6n,
    order_id: 11n,
    rating: 5,
    text: "Отличный монобукет, лаконично и со вкусом.",
    created_at: new Date("2026-05-14T12:00:00"),
    changed_at: null,
    deleted_at: null,
  },
  {
    _id: 22n,
    user_id: 6n,
    bouquet_id: 9n,
    order_id: 11n,
    rating: 4,
    text: "Лаванда хорошая, но осыпалось несколько веточек при распаковке.",
    created_at: new Date("2026-05-15T13:40:00"),
    changed_at: null,
    deleted_at: null,
  },

  // ==========================================
  // ЗАКАЗ 12 (Пользователь: 6n, Оплачен/Получен: 2026-06-12)
  // ==========================================
  {
    _id: 23n,
    user_id: 6n,
    bouquet_id: 5n,
    order_id: 12n,
    rating: 5,
    text: "Яркие подсолнухи, добавили солнца в дождливый день.",
    created_at: new Date("2026-06-12T16:00:00"),
    changed_at: null,
    deleted_at: null,
  },
  {
    _id: 24n,
    user_id: 6n,
    bouquet_id: 4n,
    order_id: 12n,
    rating: 5,
    text: "Гортензии свежайшие, стоят в вазе уже третий день и как новые.",
    created_at: new Date("2026-06-12T16:15:00"),
    changed_at: null,
    deleted_at: null,
  },

  // ==========================================
  // ЗАКАЗ 13 (Пользователь: 7n, Доставлен: 2026-04-19)
  // ==========================================
  {
    _id: 25n,
    user_id: 7n,
    bouquet_id: 1n,
    order_id: 13n,
    rating: 5,
    text: "Замечательный весенний микс, очень нежная цветовая гамма.",
    created_at: new Date("2026-04-20T11:00:00"),
    changed_at: null,
    deleted_at: null,
  },
  {
    _id: 26n,
    user_id: 7n,
    bouquet_id: 4n,
    order_id: 13n,
    rating: 4,
    text: "Красивый синий букет, но курьер опоздал на 10 минут.",
    created_at: new Date("2026-04-20T11:30:00"),
    changed_at: null,
    deleted_at: null,
  },

  // ==========================================
  // ЗАКАЗ 14 (Пользователь: 7n, Оплачен/Получен: 2026-06-12)
  // ==========================================
  {
    _id: 27n,
    user_id: 7n,
    bouquet_id: 8n,
    order_id: 14n,
    rating: 5,
    text: "Белоснежный букет выглядит невероятно благородно. Каллы идеальной формы.",
    created_at: new Date("2026-06-12T17:00:00"),
    changed_at: null,
    deleted_at: null,
  },
  {
    _id: 28n,
    user_id: 7n,
    bouquet_id: 1n,
    order_id: 14n,
    rating: 5,
    text: "Покупаю этот микс уже третий раз, качество сборки стабильно высокое.",
    created_at: new Date("2026-06-12T17:30:00"),
    changed_at: null,
    deleted_at: null,
  },

  // ==========================================
  // ЗАКАЗ 15 (Пользователь: 8n, Доставлен: 2026-05-15)
  // ==========================================
  {
    _id: 29n,
    user_id: 8n,
    bouquet_id: 6n,
    order_id: 15n,
    rating: 5,
    text: "Тонкий, ненавязчивый аромат фрезий. Стойкость порадовала.",
    created_at: new Date("2026-05-16T12:00:00"),
    changed_at: null,
    deleted_at: null,
  },
  {
    _id: 30n,
    user_id: 8n,
    bouquet_id: 1n,
    order_id: 15n,
    rating: 4,
    text: "Хороший букет, но некоторые бутоны тюльпанов были слишком закрытыми.",
    created_at: new Date("2026-05-16T13:00:00"),
    changed_at: null,
    deleted_at: null,
  },

  // ==========================================
  // ЗАКАЗ 16 (Пользователь: 8n, Оплачен/Получен: 2026-06-12)
  // ==========================================
  {
    _id: 31n,
    user_id: 8n,
    bouquet_id: 5n,
    order_id: 16n,
    rating: 5,
    text: "Прекрасные солнечные подсолнухи, очень поднимают настроение.",
    created_at: new Date("2026-06-12T14:30:00"),
    changed_at: null,
    deleted_at: null,
  },
  {
    _id: 32n,
    user_id: 8n,
    bouquet_id: 9n,
    order_id: 16n,
    rating: 5,
    text: "Идеальный интерьерный букет из лаванды, стоит теперь на рабочем столе.",
    created_at: new Date("2026-06-12T14:45:00"),
    changed_at: null,
    deleted_at: null,
  },

  // ==========================================
  // ЗАКАЗ 17 (Пользователь: 9n, Доставлен: 2026-05-06)
  // ==========================================
  {
    _id: 33n,
    user_id: 9n,
    bouquet_id: 7n,
    order_id: 17n,
    rating: 5,
    text: "Розы в коробке — это восторг. Получатель была счастлива.",
    created_at: new Date("2026-05-07T11:00:00"),
    changed_at: null,
    deleted_at: null,
  },
  {
    _id: 34n,
    user_id: 9n,
    bouquet_id: 3n,
    order_id: 17n,
    rating: 5,
    text: "Пышные пионы, прекрасная сборка. Спасибо флористу.",
    created_at: new Date("2026-05-07T11:30:00"),
    changed_at: null,
    deleted_at: null,
  },

  // ==========================================
  // ЗАКАЗ 18 (Пользователь: 9n, Оплачен/Получен: 2026-06-12)
  // ==========================================
  {
    _id: 35n,
    user_id: 9n,
    bouquet_id: 8n,
    order_id: 18n,
    rating: 5,
    text: "Элегантное сочетание белых цветов и сочной зелени эвкалипта.",
    created_at: new Date("2026-06-12T15:20:00"),
    changed_at: null,
    deleted_at: null,
  },
  {
    _id: 36n,
    user_id: 9n,
    bouquet_id: 1n,
    order_id: 18n,
    rating: 4,
    text: "Цветы свежие, но ленту завязали не совсем аккуратно.",
    created_at: new Date("2026-06-12T15:50:00"),
    changed_at: null,
    deleted_at: null,
  },

  // ==========================================
  // ЗАКАЗ 19 (Пользователь: 10n, Доставлен: 2026-05-21)
  // ==========================================
  {
    _id: 37n,
    user_id: 10n,
    bouquet_id: 2n,
    order_id: 19n,
    rating: 5,
    text: "Бордовые розы просто огонь! Стебли длинные, бутоны крепкие.",
    created_at: new Date("2026-05-22T13:00:00"),
    changed_at: null,
    deleted_at: null,
  },
  {
    _id: 38n,
    user_id: 10n,
    bouquet_id: 1n,
    order_id: 19n,
    rating: 5,
    text: "Классический весенний букет, все на высшем уровне.",
    created_at: new Date("2026-05-22T13:30:00"),
    changed_at: null,
    deleted_at: null,
  },

  // ==========================================
  // ЗАКАЗ 20 (Пользователь: 10n, Оплачен/Получен: 2026-06-12)
  // ==========================================
  {
    _id: 39n,
    user_id: 10n,
    bouquet_id: 3n,
    order_id: 20n,
    rating: 5,
    text: "Белоснежные пионы выглядят очень нежно. Качественная работа.",
    created_at: new Date("2026-06-12T18:00:00"),
    changed_at: null,
    deleted_at: null,
  },
  {
    _id: 40n,
    user_id: 10n,
    bouquet_id: 2n,
    order_id: 20n,
    rating: 5,
    text: "В очередной раз убеждаюсь, что розы здесь лучшие в городе.",
    created_at: new Date("2026-06-12T18:45:00"),
    changed_at: null,
    deleted_at: null,
  },
];

export default mockReviews;
