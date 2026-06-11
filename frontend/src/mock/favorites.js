const mockFavorites = [
  // Пользователь 1 (sacha)
  {
    _id: 1n,
    user_id: 1n,
    bouquet_id: 10n, // Его кастомная сборка №1
    created_at: new Date("2026-06-02T10:15:00")
  },
  {
    _id: 2n,
    user_id: 1n,
    bouquet_id: 2n,  // Готовый букет "Классический рубин"
    created_at: new Date("2026-06-05T18:30:00")
  },

  // Пользователь 2 (alex_backend)
  {
    _id: 3n,
    user_id: 2n,
    bouquet_id: 15n, // Его кастомная сборка №6
    created_at: new Date("2026-06-10T19:00:00")
  },
  {
    _id: 4n,
    user_id: 2n,
    bouquet_id: 4n,  // Готовый букет "Синева океана"
    created_at: new Date("2026-06-11T01:20:00")
  },

  // Пользователь 3 (marina_flowers)
  {
    _id: 5n,
    user_id: 3n,
    bouquet_id: 11n, // Ее кастомная сборка №2
    created_at: new Date("2026-06-06T12:00:00")
  },
  {
    _id: 6n,
    user_id: 3n,
    bouquet_id: 3n,  // Готовый букет "Нежное облако"
    created_at: new Date("2026-06-08T14:45:00")
  },

  // Пользователь 4 (dmitry_node)
  {
    _id: 7n,
    user_id: 4n,
    bouquet_id: 12n, // Его кастомная сборка №3
    created_at: new Date("2026-06-10T12:30:00")
  },
  {
    _id: 8n,
    user_id: 4n,
    bouquet_id: 1n,  // Готовый букет "Весенний микс"
    created_at: new Date("2026-06-10T15:10:00")
  },

  // Пользователь 5 (elena_design)
  {
    _id: 9n,
    user_id: 5n,
    bouquet_id: 3n,  // Готовый букет "Нежное облако"
    created_at: new Date("2026-05-20T09:40:00")
  },
  {
    _id: 10n,
    user_id: 5n,
    bouquet_id: 7n,  // Готовый букет "Утро в Париже"
    created_at: new Date("2026-06-01T11:15:00")
  },

  // Пользователь 6 (sergey_tech)
  {
    _id: 11n,
    user_id: 6n,
    bouquet_id: 2n,  // Готовый букет "Классический рубин"
    created_at: new Date("2026-05-15T16:20:00")
  },
  {
    _id: 12n,
    user_id: 6n,
    bouquet_id: 9n,  // Готовый букет "Лавандовое поле"
    created_at: new Date("2026-06-03T10:05:00")
  },

  // Пользователь 7 (anna_rose)
  {
    _id: 13n,
    user_id: 7n,
    bouquet_id: 6n,  // Готовый букет "Ароматная фрезия"
    created_at: new Date("2026-05-28T13:50:00")
  },
  {
    _id: 14n,
    user_id: 7n,
    bouquet_id: 8n,  // Готовый букет "Белоснежная нежность"
    created_at: new Date("2026-06-04T17:10:00")
  },

  // Пользователь 8 (vlad_qa)
  {
    _id: 15n,
    user_id: 8n,
    bouquet_id: 1n,  // Готовый букет "Весенний микс"
    created_at: new Date("2026-05-12T11:00:00")
  },
  {
    _id: 16n,
    user_id: 8n,
    bouquet_id: 5n,  // Готовый букет "Солнечный день"
    created_at: new Date("2026-05-25T14:35:00")
  },

  // Пользователь 9 (olga_manager)
  {
    _id: 17n,
    user_id: 9n,
    bouquet_id: 7n,  // Готовый букет "Утро в Париже"
    created_at: new Date("2026-05-18T10:12:00")
  },
  {
    _id: 18n,
    user_id: 9n,
    bouquet_id: 3n,  // Готовый букет "Нежное облако"
    created_at: new Date("2026-06-05T19:40:00")
  },

  // Пользователь 10 (kostya_code)
  {
    _id: 19n,
    user_id: 10n,
    bouquet_id: 2n,  // Готовый букет "Классический рубин"
    created_at: new Date("2026-05-30T15:22:00")
  },
  {
    _id: 20n,
    user_id: 10n,
    bouquet_id: 5n,  // Готовый букет "Солнечный день"
    created_at: new Date("2026-06-09T11:50:00")
  }
];

export default mockFavorites;