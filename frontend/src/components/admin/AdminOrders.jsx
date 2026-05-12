import React, { useState, useEffect } from "react";
import AdminOrderModal from "./AdminOrderModal";
import "../admin-orders-styles.css";

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        
        Promise.all([
            fetch("/api/admin/orders", { headers }).then((res) => res.json()),
            fetch("/api/admin/order-statuses", { headers }).then((res) =>
                res.json(),
            ),
        ])
            .then(([ordersData, statusesData]) => {
                if (ordersData.orders) setOrders(ordersData.orders);
                if (statusesData.statuses) setStatuses(statusesData.statuses);
            })
            .catch((err) =>
                console.error("Ошибка загрузки данных заказов:", err),
            );
    }, []);

    const handleOpenDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleModalClose = (updatedOrderId, newStatusObj) => {
        setIsModalOpen(false);
        if (updatedOrderId && newStatusObj) {
            
            setOrders((prev) =>
                prev.map((o) =>
                    o.orderId === updatedOrderId
                        ? {
                              ...o,
                              statusId: newStatusObj.statusId,
                              status: newStatusObj,
                          }
                        : o,
                ),
            );
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleString("ru-RU");
    };

    return (
        <section className="admin-orders-root">
            <div className="admin-orders-header-row">
                <div>
                    <h2 className="admin-orders-header">Управление заказами</h2>
                    <p className="admin-orders-subtitle">
                        Контроль логистики и выполнения ({orders.length}{" "}
                        заказов)
                    </p>
                </div>
            </div>

            <div className="admin-orders-table-wrapper">
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
                        {orders.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="6"
                                    style={{
                                        textAlign: "center",
                                        padding: "20px",
                                    }}
                                >
                                    Заказов пока нет.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.orderId}>
                                    <td className="font-monospace">
                                        #{order.orderId}
                                    </td>
                                    <td className="font-bold">
                                        {order.user?.username ||
                                            "Удаленный юзер"}
                                    </td>
                                    <td>{formatDate(order.createdAt)}</td>
                                    <td>
                                        <span
                                            className={`badge-status status-${order.statusId}`}
                                        >
                                            {order.status?.name || "Неизвестно"}
                                        </span>
                                    </td>
                                    <td className="font-bold">
                                        {order.totalPrice || order.totalAmount}{" "}
                                        ₽
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="admin-btn-details"
                                            onClick={() =>
                                                handleOpenDetails(order)
                                            }
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
                    statuses={statuses}
                />
            )}
        </section>
    );
}

export default AdminOrders;
