import React, { useState } from "react";
import AdminModal from "../../admin/AdminModal";

const OrderHistory = ({
    orders,
    orderItems,
    bouquets,
    orderStatuses,
    deliverTimeSlots = [],
}) => {
    const currentUserStr = localStorage.getItem("currentUser");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    const [selectedOrderId, setSelectedOrderId] = useState(null);

    if (!currentUser) return null;

    // Вытягиваем только заказы текущего пользователя и сортируем: новые сверху
    const userOrders = orders
        .filter(
            (o) =>
                o.user_id === currentUser.userId ||
                o.user_id === currentUser.id,
        )
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Выбранный заказ для модалки
    const selectedOrder = userOrders.find(
        (o) => o.order_id === selectedOrderId,
    );
    const currentOrderItems = selectedOrder
        ? orderItems.filter((item) => item.order_id === selectedOrder.order_id)
        : [];

    const getStatusInfo = (statusId) => {
        const status = orderStatuses.find((s) => s.status_id === statusId);
        return status ? status.name : "Неизвестно";
    };

    const getOrderTotalItems = (orderId) => {
        const items = orderItems.filter((item) => item.order_id === orderId);
        return items.reduce((sum, current) => sum + current.quantity, 0);
    };

    const getTimeSlotInfo = (slotId) => {
        const slot = deliverTimeSlots.find((s) => s.time_slot_id === slotId);
        if (!slot) return "";
        return ` (${slot.name}: с ${slot.start_time.substring(0, 5)} до ${slot.end_time.substring(0, 5)})`;
    };

    return (
        <div className="profile-details-container">
            <div className="profile-section">
                <div className="profile-section-header">
                    <h2>История заказов</h2>
                </div>
                <p
                    className="admin-text-muted"
                    style={{ marginBottom: "24px" }}
                >
                    Здесь хранится история всех твоих покупок. Я ничего не
                    забываю.
                </p>

                {userOrders.length === 0 ? (
                    <div className="profile-empty-state">
                        Ты еще ничего не заказала. Чего ты ждешь? Иди и выбери
                        букет.
                    </div>
                ) : (
                    <div className="order-history-list">
                        {userOrders.map((order) => (
                            <div
                                key={order.order_id}
                                className="order-card"
                                onClick={() =>
                                    setSelectedOrderId(order.order_id)
                                }
                            >
                                <div className="order-card-header">
                                    <span className="order-number">
                                        Заказ #{order.order_id}
                                    </span>
                                    <span className="order-date">
                                        {new Date(
                                            order.created_at,
                                        ).toLocaleDateString()}{" "}
                                        в{" "}
                                        {new Date(
                                            order.created_at,
                                        ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                                <div className="order-card-body">
                                    <div className="order-info-column">
                                        <span className="order-label">
                                            Статус:
                                        </span>
                                        <span
                                            className={`order-status-badge status-${order.status_id}`}
                                        >
                                            {getStatusInfo(order.status_id)}
                                        </span>
                                    </div>
                                    <div className="order-info-column">
                                        <span className="order-label">
                                            Позиций:
                                        </span>
                                        <span className="order-value">
                                            {getOrderTotalItems(order.order_id)}{" "}
                                            шт.
                                        </span>
                                    </div>
                                    <div
                                        className="order-info-column"
                                        style={{ textAlign: "right" }}
                                    >
                                        <span className="order-label">
                                            Сумма:
                                        </span>
                                        <span className="order-value order-total">
                                            {order.total_price} ₽
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* МОДАЛКА: Детали заказа */}
            {selectedOrder && (
                <AdminModal
                    title={`Заказ #${selectedOrder.order_id}`}
                    onClose={() => setSelectedOrderId(null)}
                >
                    <div className="order-modal-details">
                        <div className="order-modal-info-grid">
                            <div>
                                <span className="admin-text-muted">
                                    Дата оформления:
                                </span>
                                <strong>
                                    {new Date(
                                        selectedOrder.created_at,
                                    ).toLocaleString()}
                                </strong>
                            </div>
                            <div>
                                <span className="admin-text-muted">
                                    Статус:
                                </span>
                                <strong
                                    className={`order-status-badge status-${selectedOrder.status_id}`}
                                    style={{
                                        display: "inline-block",
                                        marginTop: "4px",
                                    }}
                                >
                                    {getStatusInfo(selectedOrder.status_id)}
                                </strong>
                            </div>
                            <div>
                                <span className="admin-text-muted">
                                    Дата и время доставки:
                                </span>
                                <strong>
                                    {selectedOrder.delivery_date}
                                    {getTimeSlotInfo(
                                        selectedOrder.time_slot_id,
                                    )}
                                </strong>
                            </div>
                            <div>
                                <span className="admin-text-muted">
                                    Итоговая сумма:
                                </span>
                                <strong
                                    className="order-total"
                                    style={{ fontSize: "1.2rem" }}
                                >
                                    {selectedOrder.total_price} ₽
                                </strong>
                            </div>
                        </div>

                        <h3 className="admin-subsection-title">
                            Состав заказа:
                        </h3>
                        <table className="admin-bouquets-table">
                            <thead>
                                <tr>
                                    <th>Фото</th>
                                    <th>Название</th>
                                    <th>Цена за шт.</th>
                                    <th>Кол-во</th>
                                    <th>Сумма</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentOrderItems.map((item) => {
                                    const bouquet = bouquets.find(
                                        (b) => b.bouquet_id === item.bouquet_id,
                                    );
                                    return (
                                        <tr key={item.order_item_id}>
                                            <td>
                                                <img
                                                    src={
                                                        bouquet?.image_url ||
                                                        "https://via.placeholder.com/60"
                                                    }
                                                    alt={
                                                        bouquet?.name ||
                                                        "Удаленный букет"
                                                    }
                                                    className="admin-bouquets-preview"
                                                />
                                            </td>
                                            <td
                                                style={{
                                                    fontWeight: "600",
                                                    color: "var(--color-text-dark)",
                                                }}
                                            >
                                                {bouquet
                                                    ? bouquet.name
                                                    : "Букет удален из базы"}
                                            </td>
                                            <td>{item.price_snapshot} ₽</td>
                                            <td>{item.quantity} шт.</td>
                                            <td
                                                style={{
                                                    fontWeight: "bold",
                                                    color: "var(--color-blue)",
                                                }}
                                            >
                                                {item.price_snapshot *
                                                    item.quantity}{" "}
                                                ₽
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </AdminModal>
            )}
        </div>
    );
};

export default OrderHistory;
