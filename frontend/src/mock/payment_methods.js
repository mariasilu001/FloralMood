const mockPaymentMethods = [
  // Активные методы оплаты (5 штук)
  {
    _id: 1n,
    name: "Карта онлайн",
    is_active: true
  },
  {
    _id: 2n,
    name: "Система быстрых платежей (СБП)",
    is_active: true
  },
  {
    _id: 3n,
    name: "Yandex Pay",
    is_active: true
  },
  {
    _id: 4n,
    name: "Оплата наличными курьеру",
    is_active: true
  },
  {
    _id: 5n,
    name: "Оплата картой курьеру через терминал",
    is_active: true
  },

  // Неактивные методы оплаты (3 штуки)
  {
    _id: 6n,
    name: "QIWI Кошелек",
    is_active: false
  },
  {
    _id: 7n,
    name: "WebMoney",
    is_active: false
  },
  {
    _id: 8n,
    name: "Криптовалюта (USDT)",
    is_active: false
  }
];

export default mockPaymentMethods;