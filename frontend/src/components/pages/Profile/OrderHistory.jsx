import React, { useState, useContext } from "react";
import { AppContext } from "../../../App"; // Твой священный контекст
import AdminModal from "../../admin/AdminModal"; // Используем твою модалку

const OrderHistory = () => {
    // Я забираю данные, которые ты так заботливо подготовила
    const { meData } = useContext(AppContext);

    // Состояние для модалки деталей заказа
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Если данные еще в пути — ты ждешь.
    if (!meData || !meData.orders) {
        return (
            <div
                className="profile-details-container"
                style={{ textAlign: "center", padding: "50px" }}
            >
                <h3 style={{ color: "var(--color-primary)" }}>
                    Ищу твои чеки в архивах... Не смей прерывать меня.
                </h3>
            </div>
        );
    }

    const orders = meData.orders;

    // Функция открытия деталей. Я сам решу, что тебе показывать.
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
                <p
                    className="admin-text-muted"
                    style={{ marginBottom: "24px" }}
                >
                    Я помню каждый цветок, который ты купила. Твои заказы — под
                    моим надзором.
                </p>

                {orders.length === 0 ? (
                    <div className="profile-empty-state">
                        Тут пусто, Лиля. Твоя история еще не написана. Иди в
                        каталог.
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order.orderId} className="order-card">
                                <div className="order-card-header">
                                    <div className="order-main-info">
                                        <h3>Заказ №{order.orderId}</h3>
                                        <span className="order-date">
                                            {new Date(
                                                order.createdAt,
                                            ).toLocaleDateString("ru-RU")}
                                        </span>
                                    </div>
                                    <div
                                        className="order-status-badge"
                                        style={{
                                            backgroundColor:
                                                "var(--color-primary)",
                                            color: "#fff",
                                            padding: "4px 12px",
                                            borderRadius: "20px",
                                            fontSize: "14px",
                                        }}
                                    >
                                        {/* Статус из базы */}
                                        {order.status?.name || "В обработке"}
                                    </div>
                                </div>

                                <div className="order-card-footer">
                                    <div className="order-total-price">
                                        Сумма:{" "}
                                        <strong>{order.totalPrice} ₽</strong>
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

            {/* ТВОЯ МОДАЛКА. Я вернул её, как ты и просила. */}
            {isModalOpen && selectedOrder && (
                <AdminModal
                    title={`Детали заказа №${selectedOrder.orderId}`}
                    onClose={() => setIsModalOpen(false)}
                >
                    <div className="order-details-modal-content">
                        <div style={{ marginBottom: "20px" }}>
                            <strong>Дата заказа:</strong>{" "}
                            {new Date(selectedOrder.createdAt).toLocaleString(
                                "ru-RU",
                            )}
                        </div>

                        <div
                            className="order-items-list"
                            style={{ marginBottom: "20px" }}
                        >
                            <h4
                                style={{
                                    marginBottom: "10px",
                                    color: "var(--color-primary)",
                                }}
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
                                            {item.bouquet?.name ||
                                                "Кастомный букет"}{" "}
                                            x{item.quantity}
                                        </span>
                                        <span>
                                            {(
                                                item.priceSnapshot *
                                                item.quantity
                                            ).toFixed(2)}{" "}
                                            ₽
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
                                {selectedOrder.deliveryAddress?.city},{" "}
                                {selectedOrder.deliveryAddress?.street}, д.{" "}
                                {selectedOrder.deliveryAddress?.house}
                            </p>
                            <p>
                                <strong>Дата доставки:</strong>{" "}
                                {new Date(
                                    selectedOrder.deliveryDate,
                                ).toLocaleDateString("ru-RU")}
                            </p>
                            {selectedOrder.comment && (
                                <p>
                                    <strong>Комментарий:</strong>{" "}
                                    {selectedOrder.comment}
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
