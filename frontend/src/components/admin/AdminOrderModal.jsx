import React, { useState } from "react";
import ReactDOM from "react-dom";

function AdminOrderModal({ isOpen, onClose, order, statuses }) {
    
    const [selectedStatusId, setSelectedStatusId] = useState(order?.statusId || "");
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen || !order) return null;

    const handleSaveStatus = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/admin/orders/${order.orderId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ statusId: selectedStatusId })
            });

            if (res.ok) {
                const data = await res.json();
                alert(data.message);
                onClose(order.orderId, data.status); 
            } else {
                const err = await res.json();
                alert(err.message || "Ошибка обновления статуса.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleString("ru-RU");
    };

    
    return ReactDOM.createPortal(
        <div className="admin-modal-overlay" onClick={() => onClose()}>
            <div className="admin-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="admin-modal-header">
                    <h2>Детали заказа #{order.orderId}</h2>
                    <button className="admin-modal-close" onClick={() => onClose()}>✕</button>
                </div>

                <div className="admin-order-modal-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                    
                    <div style={{ padding: '15px', backgroundColor: 'var(--color-cream, #fff8ea)', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Информация о покупателе:</p>
                        <p style={{ margin: '5px 0' }}>Имя: {order.user?.username || "—"}</p>
                        <p style={{ margin: '5px 0' }}>Email: {order.user?.email || "—"}</p>
                        <p style={{ margin: '5px 0' }}>Телефон: {order.user?.phoneNumber || "—"}</p>
                        <p style={{ margin: '5px 0', fontSize: '12px', color: '#777' }}>Оформлен: {formatDate(order.createdAt)}</p>
                    </div>

                    <div>
                        <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Состав заказа:</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {order.orderItems && order.orderItems.length > 0 ? (
                                order.orderItems.map(item => (
                                    <div key={item.orderItemId} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', border: '1px solid #eee', borderRadius: '6px' }}>
                                        <span>{item.bouquet?.name || "Неизвестный букет"} x{item.quantity}</span>
                                        <span style={{ fontWeight: 'bold' }}>{item.priceSnapshot || item.bouquet?.price} ₽</span>
                                    </div>
                                ))
                            ) : (
                                <p>Товары не найдены.</p>
                            )}
                        </div>
                        <p style={{ textAlign: 'right', marginTop: '10px', fontSize: '18px', fontWeight: 'bold' }}>
                            Итого: {order.totalPrice || order.totalAmount} ₽
                        </p>
                    </div>

                    <div style={{ borderTop: '1px solid #ccc', paddingTop: '20px' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Изменение статуса:</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <select 
                                value={selectedStatusId} 
                                onChange={(e) => setSelectedStatusId(e.target.value)}
                                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                            >
                                {statuses.map(s => (
                                    <option key={s.statusId || s.id} value={s.statusId || s.id}>{s.name}</option>
                                ))}
                            </select>
                            <button 
                                onClick={handleSaveStatus} 
                                disabled={isSaving || Number(selectedStatusId) === Number(order.statusId)}
                                style={{ 
                                    padding: '10px 20px', 
                                    backgroundColor: (isSaving || Number(selectedStatusId) === Number(order.statusId)) ? '#ccc' : 'var(--color-dark-brown, #594545)', 
                                    color: '#fff', 
                                    border: 'none', 
                                    borderRadius: '6px', 
                                    cursor: 'pointer' 
                                }}
                            >
                                {isSaving ? "Сохраняю..." : "Применить"}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>,
        document.body
    );
}

export default AdminOrderModal;