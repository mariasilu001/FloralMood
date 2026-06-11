const mockEventTypeTags = [
  // ==========================================
  // 1: День рождения (event_type_id: 1n)
  // ==========================================
  { _id: 1n, event_type_id: 1n, tag_id: 2n },   // День рождения
  { _id: 2n, event_type_id: 1n, tag_id: 29n },  // Яркий микс
  { _id: 3n, event_type_id: 1n, tag_id: 27n },  // Авторский дизайн
  { _id: 4n, event_type_id: 1n, tag_id: 45n },  // Крупные бутоны

  // ==========================================
  // 2: Годовщина свадьбы (event_type_id: 2n)
  // ==========================================
  { _id: 5n, event_type_id: 2n, tag_id: 3n },   // Свадьба
  { _id: 6n, event_type_id: 2n, tag_id: 4n },   // Юбилей
  { _id: 7n, event_type_id: 2n, tag_id: 20n },  // Классика
  { _id: 8n, event_type_id: 2n, tag_id: 43n },  // Премиум

  // ==========================================
  // 3: Свидание (event_type_id: 3n)
  // ==========================================
  { _id: 9n, event_type_id: 3n, tag_id: 1n },   // Романтика
  { _id: 10n, event_type_id: 3n, tag_id: 11n }, // Любимой
  { _id: 11n, event_type_id: 3n, tag_id: 19n }, // Минимализм
  { _id: 12n, event_type_id: 3n, tag_id: 32n }, // Нежно-розовый

  // ==========================================
  // 4: Новоселье (event_type_id: 4n)
  // ==========================================
  { _id: 13n, event_type_id: 4n, tag_id: 10n }, // Новоселье
  { _id: 14n, event_type_id: 4n, tag_id: 21n }, // Эко-стиль
  { _id: 15n, event_type_id: 4n, tag_id: 25n }, // В корзине
  { _id: 16n, event_type_id: 4n, tag_id: 42n }, // Сухоцветы

  // ==========================================
  // 5: Рождение ребенка (event_type_id: 5n)
  // ==========================================
  { _id: 17n, event_type_id: 5n, tag_id: 17n }, // Ребенку
  { _id: 18n, event_type_id: 5n, tag_id: 28n }, // Пастельные тона
  { _id: 19n, event_type_id: 5n, tag_id: 39n }, // Без запаха
  { _id: 20n, event_type_id: 5n, tag_id: 40n }, // Гипоаллергенный

  // ==========================================
  // 6: Выпускной (event_type_id: 6n)
  // ==========================================
  { _id: 21n, event_type_id: 6n, tag_id: 8n },   // Выпускной
  { _id: 22n, event_type_id: 6n, tag_id: 14n },  // Учителю
  { _id: 23n, event_type_id: 6n, tag_id: 15n },  // Подруге
  { _id: 24n, event_type_id: 6n, tag_id: 44n },  // Бюджетный

  // ==========================================
  // 7: Помолвка (event_type_id: 7n)
  // ==========================================
  { _id: 25n, event_type_id: 7n, tag_id: 1n },   // Романтика
  { _id: 26n, event_type_id: 7n, tag_id: 11n },  // Любимой
  { _id: 27n, event_type_id: 7n, tag_id: 31n },  // Белоснежный
  { _id: 28n, event_type_id: 7n, tag_id: 43n },  // Премиум

  // ==========================================
  // 8: Извинение (event_type_id: 8n)
  // ==========================================
  { _id: 29n, event_type_id: 8n, tag_id: 1n },   // Романтика
  { _id: 30n, event_type_id: 8n, tag_id: 11n },  // Любимой
  { _id: 31n, event_type_id: 8n, tag_id: 26n },  // Монобукет
  { _id: 32n, event_type_id: 8n, tag_id: 30n },  // Красно-бордовый

  // ==========================================
  // 9: Профессиональный праздник (event_type_id: 9n)
  // ==========================================
  { _id: 33n, event_type_id: 9n, tag_id: 13n },  // Коллеге
  { _id: 34n, event_type_id: 9n, tag_id: 18n },  // Руководителю
  { _id: 35n, event_type_id: 9n, tag_id: 24n },  // В шляпной коробке
  { _id: 36n, event_type_id: 9n, tag_id: 35n },  // Строгий темный

  // ==========================================
  // 10: Выздоровление (event_type_id: 10n)
  // ==========================================
  { _id: 37n, event_type_id: 10n, tag_id: 29n }, // Яркий микс
  { _id: 38n, event_type_id: 10n, tag_id: 33n }, // Солнечный желтый
  { _id: 39n, event_type_id: 10n, tag_id: 37n }, // Стойкие цветы
  { _id: 40n, event_type_id: 10n, tag_id: 39n }, // Без запаха

  // ==========================================
  // 11: Благодарность (event_type_id: 11n)
  // ==========================================
  { _id: 41n, event_type_id: 11n, tag_id: 13n }, // Коллеге
  { _id: 42n, event_type_id: 11n, tag_id: 15n }, // Подруге
  { _id: 43n, event_type_id: 11n, tag_id: 19n }, // Минимализм
  { _id: 44n, event_type_id: 11n, tag_id: 37n }, // Стойкие цветы

  // ==========================================
  // 12: Государственный / Международный праздник (event_type_id: 12n)
  // ==========================================
  { _id: 45n, event_type_id: 12n, tag_id: 5n },  // 8 марта
  { _id: 46n, event_type_id: 12n, tag_id: 6n },  // 14 февраля
  { _id: 47n, event_type_id: 12n, tag_id: 7n },  // День матери
  { _id: 48n, event_type_id: 12n, tag_id: 9n }   // Новый год
];

export default mockEventTypeTags;