const mockCartItems = [
  // Пользователь 1 (sacha)
  {
    _id: 1n,
    user_id: 1n,
    bouquet_id: 1n,  // Весенний микс
    quantity: 1,
    created_at: new Date("2026-06-11T02:00:00")
  },
  {
    _id: 2n,
    user_id: 1n,
    bouquet_id: 13n, // Его кастомная сборка №4
    quantity: 3,
    created_at: new Date("2026-06-11T02:05:00")
  },

  // Пользователь 2 (alex_backend)
  {
    _id: 3n,
    user_id: 2n,
    bouquet_id: 2n,  // Классический рубин
    quantity: 1,
    created_at: new Date("2026-06-11T03:10:00")
  },
  {
    _id: 4n,
    user_id: 2n,
    bouquet_id: 16n, // Его кастомная сборка №7
    quantity: 3,
    created_at: new Date("2026-06-11T03:12:00")
  },

  // Пользователь 3 (marina_flowers)
  {
    _id: 5n,
    user_id: 3n,
    bouquet_id: 3n,  // Нежное облако
    quantity: 1,
    created_at: new Date("2026-06-10T18:40:00")
  },
  {
    _id: 6n,
    user_id: 3n,
    bouquet_id: 5n,  // Солнечный день
    quantity: 3,
    created_at: new Date("2026-06-10T18:45:00")
  },

  // Пользователь 4 (dmitry_node)
  {
    _id: 7n,
    user_id: 4n,
    bouquet_id: 4n,  // Синева океана
    quantity: 1,
    created_at: new Date("2026-06-11T01:15:00")
  },
  {
    _id: 8n,
    user_id: 4n,
    bouquet_id: 6n,  // Ароматная фрезия
    quantity: 3,
    created_at: new Date("2026-06-11T01:20:00")
  },

  // Пользователь 5 (elena_design)
  {
    _id: 9n,
    user_id: 5n,
    bouquet_id: 7n,  // Утро в Париже
    quantity: 1,
    created_at: new Date("2026-06-10T14:30:00")
  },
  {
    _id: 10n,
    user_id: 5n,
    bouquet_id: 8n,  // Белоснежная нежность
    quantity: 3,
    created_at: new Date("2026-06-10T14:35:00")
  },

  // Пользователь 6 (sergey_tech)
  {
    _id: 11n,
    user_id: 6n,
    bouquet_id: 9n,  // Лавандовое поле
    quantity: 1,
    created_at: new Date("2026-06-09T11:22:00")
  },
  {
    _id: 12n,
    user_id: 6n,
    bouquet_id: 1n,  // Весенний микс
    quantity: 3,
    created_at: new Date("2026-06-09T11:25:00")
  },

  // Пользователь 7 (anna_rose)
  {
    _id: 13n,
    user_id: 7n,
    bouquet_id: 2n,  // Классический рубин
    quantity: 1,
    created_at: new Date("2026-06-10T19:50:00")
  },
  {
    _id: 14n,
    user_id: 7n,
    bouquet_id: 3n,  // Нежное облако
    quantity: 3,
    created_at: new Date("2026-06-10T19:55:00")
  },

  // Пользователь 8 (vlad_qa)
  {
    _id: 15n,
    user_id: 8n,
    bouquet_id: 4n,  // Синева океана
    quantity: 1,
    created_at: new Date("2026-06-11T05:10:00")
  },
  {
    _id: 16n,
    user_id: 8n,
    bouquet_id: 7n,  // Утро в Париже
    quantity: 3,
    created_at: new Date("2026-06-11T05:15:00")
  },

  // Пользователь 9 (olga_manager)
  {
    _id: 17n,
    user_id: 9n,
    bouquet_id: 8n,  // Белоснежная нежность
    quantity: 1,
    created_at: new Date("2026-06-10T12:00:00")
  },
  {
    _id: 18n,
    user_id: 9n,
    bouquet_id: 5n,  // Солнечный день
    quantity: 3,
    created_at: new Date("2026-06-10T12:05:00")
  },

  // Пользователь 10 (kostya_code)
  {
    _id: 19n,
    user_id: 10n,
    bouquet_id: 6n,  // Ароматная фрезия
    quantity: 1,
    created_at: new Date("2026-06-11T00:40:00")
  },
  {
    _id: 20n,
    user_id: 10n,
    bouquet_id: 9n,  // Лавандовое поле
    quantity: 3,
    created_at: new Date("2026-06-11T00:45:00")
  }
];

export default mockCartItems;