import React, { useState, useEffect, useContext, useMemo } from "react";
import AdminOrderModal from "./AdminOrderModal";
import { DBcontext } from "../../Database"; // Наша автономная база данных
import "../admin-orders-styles.css";

function AdminOrders() {
  // 1. Извлекаем таблицы из нашей памяти
  const { orders, setOrders, orderStatuses, users } = useContext(DBcontext);

  // Стейты интерфейса и модалки
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // НОВЫЕ СТЕЙТЫ: Сортировка и Фильтрация
  const [sortOrder, setSortOrder] = useState("desc"); // "desc" - сначала новые, "asc" - сначала старые
  const [statusFilter, setStatusFilter] = useState("all"); // "all" или конкретный статус

  // ==========================================
  // МОЩНЫЙ ДВИЖОК ФИЛЬТРАЦИИ И СОРТИРОВКИ
  // ==========================================
  const processedOrders = useMemo(() => {
    if (!orders || !orderStatuses || !users) return [];

    // Шаг 1: Склеиваем таблицы заказов, пользователей и статусов
    let filtered = orders.map((order) => {
      const userObj = users.find((u) => u._id === order.user_id);
      const statusObj = orderStatuses.find((s) => s._id === order.status_id);

      return {
        orderId: String(order._id), // ЖЕСТКАЯ ЗАЩИТА: BigInt -> String
        createdAt: order.created_at,
        totalPrice: order.total_price,
        user: userObj ? { username: userObj.username } : null,
        statusId: String(order.status_id), // Для фильтров и модалки
        status: statusObj ? { name: statusObj.name } : null,
        rawOrder: order, // Сохраняем оригинал на всякий случай
      };
    });

    // Шаг 2: Фильтруем по статусу
    if (statusFilter !== "all") {
      filtered = filtered.filter((o) => o.statusId === statusFilter);
    }

    // Шаг 3: Сортируем по дате
    filtered.sort((a, b) => {
      const timeA = a.createdAt.getTime();
      const timeB = b.createdAt.getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });

    return filtered;
  }, [orders, orderStatuses, users, statusFilter, sortOrder]);

  // Подготавливаем справочник статусов для модалки и фильтров
  const mappedStatuses = useMemo(() => {
    if (!orderStatuses) return [];
    return orderStatuses.map((s) => ({
      statusId: String(s._id),
      name: s.name,
    }));
  }, [orderStatuses]);

  // ==========================================
  // ЖЕСТКАЯ ЗАГЛУШКА БЕЗОПАСНОСТИ РЕНДЕРА
  // ==========================================
  if (!orders || !orderStatuses || !users) {
    return (
      <div
        style={{
          padding: "50px",
          textAlign: "center",
          color: "var(--color-primary)",
        }}
      >
        <h3>Синхронизирую реестр логистики...</h3>
      </div>
    );
  }

  // ==========================================
  // ЭКШЕНЫ
  // ==========================================

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleModalClose = (updatedOrderIdStr, newStatusObj) => {
    setIsModalOpen(false);

    // Если модалка вернула обновленный статус — записываем его в глобальную базу
    if (updatedOrderIdStr && newStatusObj && newStatusObj.statusId) {
      const newStatusIdBigInt = BigInt(newStatusObj.statusId);

      const updatedOrders = orders.map((o) =>
        String(o._id) === updatedOrderIdStr
          ? { ...o, status_id: newStatusIdBigInt }
          : o,
      );

      setOrders(updatedOrders);
    }
    setSelectedOrder(null);
  };

  const formatDate = (dateObj) => {
    if (!dateObj) return "";
    return new Date(dateObj).toLocaleString("ru-RU");
  };

  return (
    <section className="admin-orders-root">
      <div className="admin-orders-header-row">
        <div>
          <h2 className="admin-orders-header">Управление заказами</h2>
          <p className="admin-orders-subtitle">
            Контроль логистики и выполнения ({processedOrders.length} найдено)
          </p>
        </div>
      </div>

      {/* ========================================== */}
      {/* НОВЫЙ БЛОК: ФИЛЬТРАЦИЯ И СОРТИРОВКА        */}
      {/* ========================================== */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "20px",
          flexWrap: "wrap",
          padding: "16px",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          border: "1px solid #eee",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            flex: "1",
            minWidth: "200px",
          }}
        >
          <label
            style={{
              fontSize: "12px",
              color: "var(--color-text-muted)",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Сортировка по дате:
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="admin-styled-select"
            style={{ border: "1px solid #ccc" }}
          >
            <option value="desc">Сначала новые</option>
            <option value="asc">Сначала старые</option>
          </select>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            flex: "1",
            minWidth: "200px",
          }}
        >
          <label
            style={{
              fontSize: "12px",
              color: "var(--color-text-muted)",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Фильтр по статусу:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-styled-select"
            style={{ border: "1px solid #ccc" }}
          >
            <option value="all">Все статусы</option>
            {mappedStatuses.map((s) => (
              <option key={s.statusId} value={s.statusId}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* ========================================== */}

      <div
        className="admin-orders-table-wrapper"
        style={{
          maxHeight: "calc(100vh - 280px)", // Жестко ограничиваем высоту таблицы, оставляя место для шапки
          overflowY: "auto", // Включаем вертикальный скролл!
          overflowX: "auto", // И горизонтальный, если таблица не влезет в экран
        }}
      >
        <table className="admin-orders-table">
          <thead>
            <tr>
              <th>№ Заказа</th>
              <th>Покупатель</th>
              <th>Дата оформления</th>
              <th>Статус</th>
              <th>Сумма</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {processedOrders.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "var(--color-text-muted)",
                  }}
                >
                  По выбранным фильтрам заказов не найдено.
                </td>
              </tr>
            ) : (
              processedOrders.map((order) => (
                <tr key={order.orderId}>
                  <td className="font-monospace">#{order.orderId}</td>
                  <td className="font-bold">
                    {order.user?.username || "Удаленный юзер"}
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <span className={`badge-status status-${order.statusId}`}>
                      {order.status?.name || "Неизвестно"}
                    </span>
                  </td>
                  <td className="font-bold">{order.totalPrice} ₽</td>
                  <td className="actions-cell">
                    <button
                      className="admin-btn-details"
                      onClick={() => handleOpenDetails(order)}
                    >
                      Детали / Статус
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <AdminOrderModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          order={selectedOrder}
          statuses={mappedStatuses}
        />
      )}
    </section>
  );
}

export default AdminOrders;
