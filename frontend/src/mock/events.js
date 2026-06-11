const mockEvents = [
  // Пользователь 1 (sacha)
  {
    _id: 1n,
    user_id: 1n,
    event_type_id: 1n,
    name: "День рождения мамы",
    event_date: "12-05",
  },
  {
    _id: 2n,
    user_id: 1n,
    event_type_id: 2n,
    name: "Годовщина свадьбы родителей",
    event_date: "20-08",
  },

  // Пользователь 2 (alex_backend)
  {
    _id: 3n,
    user_id: 2n,
    event_type_id: 1n,
    name: "День рождения сестры",
    event_date: "04-03",
  },
  {
    _id: 4n,
    user_id: 2n,
    event_type_id: 3n,
    name: "Годовщина отношений",
    event_date: "15-10",
  },

  // Пользователь 3 (marina_flowers)
  {
    _id: 5n,
    user_id: 3n,
    event_type_id: 1n,
    name: "День рождения лучшей подруги",
    event_date: "22-01",
  },
  {
    _id: 6n,
    user_id: 3n,
    event_type_id: 4n,
    name: "Новоселье брата",
    event_date: "11-07",
  },

  // Пользователь 4 (dmitry_node)
  {
    _id: 7n,
    user_id: 4n,
    event_type_id: 1n,
    name: "День рождения отца",
    event_date: "18-09",
  },
  {
    _id: 8n,
    user_id: 4n,
    event_type_id: 2n,
    name: "Собственная годовщина свадьбы",
    event_date: "05-06",
  },

  // Пользователь 5 (elena_design)
  {
    _id: 9n,
    user_id: 5n,
    event_type_id: 1n,
    name: "День рождения бабушки",
    event_date: "30-04",
  },
  {
    _id: 10n,
    user_id: 5n,
    event_type_id: 5n,
    name: "День рождения племянника",
    event_date: "14-11",
  },

  // Пользователь 6 (sergey_tech)
  {
    _id: 11n,
    user_id: 6n,
    event_type_id: 1n,
    name: "День рождения жены",
    event_date: "25-12",
  },
  {
    _id: 12n,
    user_id: 6n,
    event_type_id: 9n,
    name: "Профессиональный день программиста",
    event_date: "13-09",
  },

  // Пользователь 7 (anna_rose)
  {
    _id: 13n,
    user_id: 7n,
    event_type_id: 1n,
    name: "День рождения мамы",
    event_date: "07-02",
  },
  {
    _id: 14n,
    user_id: 7n,
    event_type_id: 7n,
    name: "Помолвка сестры",
    event_date: "19-05",
  },

  // Пользователь 8 (vlad_qa)
  {
    _id: 15n,
    user_id: 8n,
    event_type_id: 1n,
    name: "День рождения брата",
    event_date: "10-10",
  },
  {
    _id: 16n,
    user_id: 8n,
    event_type_id: 3n,
    name: "Романтический юбилей знакомства",
    event_date: "28-03",
  },

  // Пользователь 9 (olga_manager)
  {
    _id: 17n,
    user_id: 9n,
    event_type_id: 1n,
    name: "День рождения дочери",
    event_date: "03-08",
  },
  {
    _id: 18n,
    user_id: 9n,
    event_type_id: 6n,
    name: "Выпускной сына",
    event_date: "24-06",
  },

  // Пользователь 10 (kostya_code)
  {
    _id: 19n,
    user_id: 10n,
    event_type_id: 1n,
    name: "День рождения дедушки",
    event_date: "15-04",
  },
  {
    _id: 20n,
    user_id: 10n,
    event_type_id: 4n,
    name: "Покупка квартиры (Новоселье)",
    event_date: "01-12",
  },
];

export default mockEvents;
