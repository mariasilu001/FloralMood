const mockOrders = [
  // Пользователь 1 (sacha) - адреса 1n, 2n, 3n
  {
    _id: 1n,
    user_id: 1n,
    status_id: 6n, // Доставлен
    comment: "Пожалуйста, позвоните за 15 минут до доставки.",
    is_hidden: false,
    address_id: 1n,
    created_at: new Date("2026-04-15T14:20:00"),
    total_price: 3500.00,
    payment_method_id: 1n,
    delivery_date: new Date("2026-04-16"),
    time_slot_id: 2n
  },
  {
    _id: 2n,
    user_id: 1n,
    status_id: 2n, // Оплачен
    comment: "Оставить у двери, если меня не будет дома.",
    is_hidden: false,
    address_id: 2n,
    created_at: new Date("2026-06-09T10:15:00"),
    total_price: 4800.00,
    payment_method_id: 2n,
    delivery_date: new Date("2026-06-12"),
    time_slot_id: 3n
  },

  // Пользователь 2 (alex_backend) - адреса 4n, 5n, 6n
  {
    _id: 3n,
    user_id: 2n,
    status_id: 6n, // Доставлен
    comment: "Доставка в офис, спросить Александра.",
    is_hidden: false,
    address_id: 4n,
    created_at: new Date("2026-04-22T09:00:00"),
    total_price: 2500.00,
    payment_method_id: 3n,
    delivery_date: new Date("2026-04-23"),
    time_slot_id: 4n
  },
  {
    _id: 4n,
    user_id: 2n,
    status_id: 3n, // В сборке
    comment: "Нужна очень свежая зелень в букете.",
    is_hidden: false,
    address_id: 5n,
    created_at: new Date("2026-06-10T16:40:00"),
    total_price: 6200.00,
    payment_method_id: 1n,
    delivery_date: new Date("2026-06-12"),
    time_slot_id: 2n
  },

  // Пользователь 3 (marina_flowers) - адреса 7n, 8n, 9n
  {
    _id: 5n,
    user_id: 3n,
    status_id: 6n, // Доставлен
    comment: "Передать лично в руки получателю, это сюрприз!",
    is_hidden: false,
    address_id: 7n,
    created_at: new Date("2026-05-02T11:30:00"),
    total_price: 5100.00,
    payment_method_id: 2n,
    delivery_date: new Date("2026-05-03"),
    time_slot_id: 5n
  },
  {
    _id: 6n,
    user_id: 3n,
    status_id: 1n, // Новый
    comment: null,
    is_hidden: false,
    address_id: 8n,
    created_at: new Date("2026-06-11T05:00:00"),
    total_price: 3200.00,
    payment_method_id: 4n,
    delivery_date: new Date("2026-06-11"),
    time_slot_id: 6n
  },

  // Пользователь 4 (dmitry_node) - адреса 10n, 11n, 12n
  {
    _id: 7n,
    user_id: 4n,
    status_id: 6n, // Доставлен
    comment: "Код домофона 432К3211.",
    is_hidden: false,
    address_id: 10n,
    created_at: new Date("2026-05-08T18:10:00"),
    total_price: 4300.00,
    payment_method_id: 1n,
    delivery_date: new Date("2026-05-09"),
    time_slot_id: 1n
  },
  {
    _id: 8n,
    user_id: 4n,
    status_id: 2n, // Оплачен
    comment: "Привезите как можно ближе к началу тайм-слота.",
    is_hidden: false,
    address_id: 11n,
    created_at: new Date("2026-06-10T12:00:00"),
    total_price: 2900.00,
    payment_method_id: 2n,
    delivery_date: new Date("2026-06-12"),
    time_slot_id: 5n
  },

  // Пользователь 5 (elena_design) - адреса 13n, 14n, 15n
  {
    _id: 9n,
    user_id: 5n,
    status_id: 6n, // Доставлен
    comment: null,
    is_hidden: false,
    address_id: 13n,
    created_at: new Date("2026-04-28T13:15:00"),
    total_price: 7500.00,
    payment_method_id: 5n,
    delivery_date: new Date("2026-04-29"),
    time_slot_id: 3n
  },
  {
    _id: 10n,
    user_id: 5n,
    status_id: 7n, // Отменен
    comment: "Ошиблась с датой, переоформлю заново.",
    is_hidden: true,
    address_id: 14n,
    created_at: new Date("2026-05-25T14:00:00"),
    total_price: 3500.00,
    payment_method_id: 1n,
    delivery_date: new Date("2026-05-26"),
    time_slot_id: 2n
  },

  // Пользователь 6 (sergey_tech) - адреса 16n, 17n, 18n
  {
    _id: 11n,
    user_id: 6n,
    status_id: 6n, // Доставлен
    comment: "Шлагбаум открывается по звонку.",
    is_hidden: false,
    address_id: 16n,
    created_at: new Date("2026-05-12T10:45:00"),
    total_price: 1800.00,
    payment_method_id: 1n,
    delivery_date: new Date("2026-05-13"),
    time_slot_id: 4n
  },
  {
    _id: 12n,
    user_id: 6n,
    status_id: 2n, // Оплачен
    comment: "Не звонить в звонок, спит ребенок.",
    is_hidden: false,
    address_id: 17n,
    created_at: new Date("2026-06-09T21:30:00"),
    total_price: 4100.00,
    payment_method_id: 3n,
    delivery_date: new Date("2026-06-12"),
    time_slot_id: 2n
  },

  // Пользователь 7 (anna_rose) - адреса 19n, 20n, 21n
  {
    _id: 13n,
    user_id: 7n,
    status_id: 6n, // Доставлен
    comment: null,
    is_hidden: false,
    address_id: 19n,
    created_at: new Date("2026-04-18T16:00:00"),
    total_price: 3900.00,
    payment_method_id: 1n,
    delivery_date: new Date("2026-04-19"),
    time_slot_id: 5n
  },
  {
    _id: 14n,
    user_id: 7n,
    status_id: 2n, // Оплачен
    comment: "Положите открытку с текстом из вложения.",
    is_hidden: false,
    address_id: 20n,
    created_at: new Date("2026-06-10T11:20:00"),
    total_price: 5500.00,
    payment_method_id: 2n,
    delivery_date: new Date("2026-06-12"),
    time_slot_id: 9n
  },

  // Пользователь 8 (vlad_qa) - адреса 22n, 23n, 24n
  {
    _id: 15n,
    user_id: 8n,
    status_id: 6n, // Доставлен
    comment: "Предварительно наберите на мобильный.",
    is_hidden: false,
    address_id: 22n,
    created_at: new Date("2026-05-14T15:50:00"),
    total_price: 2800.00,
    payment_method_id: 4n,
    delivery_date: new Date("2026-05-15"),
    time_slot_id: 3n
  },
  {
    _id: 16n,
    user_id: 8n,
    status_id: 2n, // Оплачен
    comment: null,
    is_hidden: false,
    address_id: 23n,
    created_at: new Date("2026-06-08T13:10:00"),
    total_price: 3400.00,
    payment_method_id: 1n,
    delivery_date: new Date("2026-06-12"),
    time_slot_id: 5n
  },

  // Пользователь 9 (olga_manager) - адреса 25n, 26n, 27n
  {
    _id: 17n,
    user_id: 9n,
    status_id: 6n, // Доставлен
    comment: "Доставка до рецепшена отеля.",
    is_hidden: false,
    address_id: 25n,
    created_at: new Date("2026-05-05T12:25:00"),
    total_price: 6700.00,
    payment_method_id: 1n,
    delivery_date: new Date("2026-05-06"),
    time_slot_id: 2n
  },
  {
    _id: 18n,
    user_id: 9n,
    status_id: 2n, // Оплачен
    comment: null,
    is_hidden: false,
    address_id: 26n,
    created_at: new Date("2026-06-09T09:40:00"),
    total_price: 4900.00,
    payment_method_id: 2n,
    delivery_date: new Date("2026-06-12"),
    time_slot_id: 3n
  },

  // Пользователь 10 (kostya_code) - адреса 28n, 29n, 30n
  {
    _id: 19n,
    user_id: 10n,
    status_id: 6n, // Доставлен
    comment: "Вход со двора через арку.",
    is_hidden: false,
    address_id: 28n,
    created_at: new Date("2026-05-20T17:00:00"),
    total_price: 3100.00,
    payment_method_id: 5n,
    delivery_date: new Date("2026-05-21"),
    time_slot_id: 5n
  },
  {
    _id: 20n,
    user_id: 10n,
    status_id: 2n, // Оплачен
    comment: "Срочный заказ к празднику.",
    is_hidden: false,
    address_id: 29n,
    created_at: new Date("2026-06-10T14:55:00"),
    total_price: 5800.00,
    payment_method_id: 1n,
    delivery_date: new Date("2026-06-12"),
    time_slot_id: 10n
  }
];

export default mockOrders;