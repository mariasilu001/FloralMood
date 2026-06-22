import React, { useState, useEffect } from "react";
import AdminModal from "./AdminModal"; // Проверь путь к твоей универсальной модалке

const AdminOrderModal = ({ isOpen, onClose, order, statuses }) => {
  // Локальный стейт для выпадающего списка
  const [statusId, setStatusId] = useState("");

  // При открытии модалки подтягиваем текущий статус заказа
  useEffect(() => {
    if (order && order.statusId) {
      setStatusId(String(order.statusId));
    }
  }, [order]);

  if (!isOpen || !order) return null;

  // Экшен сохранения
  const handleSave = () => {
    // Находим полный объект статуса по выбранному ID
    const selectedStatusObj = statuses.find(
      (s) => String(s.statusId) === String(statusId),
    );

    // Передаем данные ОБРАТНО в AdminOrders.jsx, чтобы он обновил базу!
    onClose(order.orderId, selectedStatusObj);
  };

  return (
    <AdminModal title="Управление заказом" onClose={() => onClose()}>
      <div className="admin-bouquets-form">
        <div
          style={{ marginBottom: "20px", fontSize: "14px", lineHeight: "1.6" }}
        >
          <p>
            <strong>Покупатель:</strong> {order.user?.username || "Неизвестен"}
          </p>
          <p>
            <strong>Дата оформления:</strong>{" "}
            {new Date(order.createdAt).toLocaleString("ru-RU")}
          </p>
          <p>
            <strong>Сумма:</strong>{" "}
            <span style={{ color: "var(--color-primary)", fontWeight: "bold" }}>
              {order.totalPrice} ₽
            </span>
          </p>
        </div>

        <label>Изменить статус заказа:</label>
        <select
          className="admin-styled-select"
          value={statusId}
          onChange={(e) => setStatusId(e.target.value)}
        >
          {statuses.map((s) => (
            <option key={s.statusId} value={s.statusId}>
              {s.name}
            </option>
          ))}
        </select>

        <button
          className="admin-bouquets-btn-primary"
          style={{ marginTop: "24px" }}
          onClick={handleSave}
        >
          Сохранить новый статус
        </button>
      </div>
    </AdminModal>
  );
};

export default AdminOrderModal;
