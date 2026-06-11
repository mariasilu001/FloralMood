import React, { useState, useContext, useMemo } from "react";
import { DBcontext } from "../../../Database"; // НАША локальная база данных
import AdminModal from "../../admin/AdminModal";

const OrderHistory = () => {
  // 1. Достаем все необходимые таблицы из локального контекста базы данных
  const {
    users,
    orders,
    orderStatuses,
    orderItems,
    deliveryAddresses,
    bouquets,
  } = useContext(DBcontext);

  // Состояние для модалки деталей заказа
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ==========================================
  // ХУКИ ДАННЫХ И СЕССИИ (Строго на самом верху!)
  // ==========================================

  // Ищем тебя в базе данных по сохраненному BigInt ID
  const userIdStr = localStorage.getItem("userId");
  const user = useMemo(() => {
    if (!users || !userIdStr) return null;
    return users.find((u) => u._id === BigInt(userIdStr));
  }, [users, userIdStr]);

  // МОЩНЕЙШИЙ РЕЛЯЦИОННЫЙ ЗАПРОС (Сборка истории заказов со всеми связями)
  const processedOrders = useMemo(() => {
    // Если базы еще нет или пользователь не авторизован — возвращаем пустой массив
    if (
      !orders ||
      !orderStatuses ||
      !orderItems ||
      !deliveryAddresses ||
      !bouquets ||
      !user
    ) {
      return [];
    }

    // Шаг A: Фильтруем заказы, оставляя только те, которые принадлежат ТЕБЕ и не скрыты
    const userOrders = orders.filter(
      (o) => o.user_id === user._id && o.is_hidden === false,
    );

    // Шаг B: Проходимся по каждому заказу и приклеиваем данные из других таблиц
    return userOrders.map((order) => {
      // Ищем текстовый статус заказа в таблице mockOrderStatuses
      const statusObj = orderStatuses.find((s) => s._id === order.status_id);

      // Ищем адрес доставки для этого заказа в таблице deliveryAddresses
      const addressObj = deliveryAddresses.find(
        (a) => a._id === order.address_id,
      );

      // Находим все купленные товары, привязанные к этому заказу, в таблице mockOrderItems
      const itemsForOrder = orderItems.filter(
        (item) => item.order_id === order._id,
      );

      // Для каждого товара находим его человеческое название из таблицы букетов
      const mappedItems = itemsForOrder.map((item) => {
        const bq = bouquets.find((b) => b._id === item.bouquet_id);
        return {
          orderItemId: String(item._id), // Защита: превращаем BigInt ID в строку для ключа key
          quantity: item.quantity,
          priceSnapshot: item.price_snapshot,
          bouquet: bq ? { name: bq.name } : { name: "Кастомный букет" },
        };
      });

      // Возвращаем трансформированный объект, который идеально сядет в твою верстку
      return {
        orderId: String(order._id), // ЖЕСТКАЯ ЗАЩИТА: конвертируем BigInt в String, чтобы React не упал!
        createdAt: order.created_at,
        deliveryDate: order.delivery_date,
        totalPrice: order.total_price,
        comment: order.comment,
        status: statusObj ? { name: statusObj.name } : { name: "В обработке" },
        address: addressObj
          ? {
              city: addressObj.city,
              street: addressObj.street,
              house: addressObj.house,
            }
          : null,
        items: mappedItems,
      };
    });
  }, [orders, orderStatuses, orderItems, deliveryAddresses, bouquets, user]);

  // ==========================================
  // ЗАГЛУШКИ БЕЗОПАСНОСТИ (После всех хуков!)
  // ==========================================
  if (
    !users ||
    !orders ||
    !orderStatuses ||
    !orderItems ||
    !deliveryAddresses ||
    !bouquets
  ) {
    return (
      <div
        className="profile-details-container"
        style={{ textAlign: "center", padding: "50px" }}
      >
        <h3 style={{ color: "var(--color-primary)" }}>
          Жди, я загружаю историю твоих заказов...
        </h3>
      </div>
    );
  }

  if (!user) return null; // Если сессии нет, Layout сам перенаправит на страницу логина

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="profile-details-container">
      <div className="profile-section">
        <div className="profile-section-header">
          <h2>История заказов</h2>
        </div>
        <p className="admin-text-muted" style={{ marginBottom: "24px" }}>
          Здесь хранится история ваших заказов
        </p>

        {processedOrders.length === 0 ? (
          <div className="profile-empty-state">
            У тебя еще нет оформленных заказов, Лили.
          </div>
        ) : (
          <div className="orders-list">
            {processedOrders.map((order) => (
              <div key={order.orderId} className="order-card">
                <div className="order-card-header">
                  <div className="order-main-info">
                    <h3>Заказ №{order.orderId}</h3>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  <div
                    className="order-status-badge"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "#fff",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "14px",
                    }}
                  >
                    {order.status?.name || "В обработке"}
                  </div>
                </div>

                <div className="order-card-footer">
                  <div className="order-total-price">
                    Сумма: <strong>{order.totalPrice} ₽</strong>
                  </div>
                  <button
                    className="profile-btn-primary"
                    onClick={() => handleViewDetails(order)}
                    style={{
                      padding: "8px 16px",
                      fontSize: "13px",
                    }}
                  >
                    Детали заказа
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && selectedOrder && (
        <AdminModal
          title={`Детали заказа №${selectedOrder.orderId}`}
          onClose={() => setIsModalOpen(false)}
        >
          <div className="order-details-modal-content">
            <div style={{ marginBottom: "20px" }}>
              <strong>Дата заказа:</strong>{" "}
              {new Date(selectedOrder.createdAt).toLocaleString("ru-RU")}
            </div>

            <div className="order-items-list" style={{ marginBottom: "20px" }}>
              <h4
                style={{ marginBottom: "10px", color: "var(--color-primary)" }}
              >
                Состав букета:
              </h4>
              {selectedOrder.items &&
                selectedOrder.items.map((item) => (
                  <div
                    key={item.orderItemId}
                    className="order-item-row"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <span>
                      {item.bouquet?.name || "Кастомный букет"}{" "}
                      <strong>x{item.quantity}</strong>
                    </span>
                    <span>
                      {(item.priceSnapshot * item.quantity).toFixed(2)} ₽
                    </span>
                  </div>
                ))}
            </div>

            <div
              className="order-delivery-info"
              style={{
                backgroundColor: "#f9f9f9",
                padding: "15px",
                borderRadius: "8px",
              }}
            >
              <p>
                <strong>Адрес доставки:</strong>{" "}
                {selectedOrder.address
                  ? `г. ${selectedOrder.address.city}, ул. ${selectedOrder.address.street}, д. ${selectedOrder.address.house}`
                  : "Адрес удален"}
              </p>
              <p>
                <strong>Дата доставки:</strong>{" "}
                {new Date(selectedOrder.deliveryDate).toLocaleDateString(
                  "ru-RU",
                )}
              </p>
              {selectedOrder.comment && (
                <p>
                  <strong>Комментарий:</strong> {selectedOrder.comment}
                </p>
              )}
            </div>

            <div
              style={{
                marginTop: "20px",
                textAlign: "right",
                fontSize: "18px",
              }}
            >
              <strong>Итого: {selectedOrder.totalPrice} ₽</strong>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
};

export default OrderHistory;
