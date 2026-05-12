import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/Cart.css";
import AdminModal from "../../admin/AdminModal";
import { AppContext } from "../../../App";
import api from "../../../api/axios"; // Мой послушный инструмент для связи с сервером

const Cart = () => {
    const navigate = useNavigate();
    
    // Я забираю всю власть и данные из контекста
    const { user, meData, publicData, fetchMeData } = useContext(AppContext);

    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Я переименовал поля так, как их ждет МОЙ бэкенд в me.js
    const [checkoutData, setCheckoutData] = useState({
        deliveryAddressId: "",
        paymentMethodId: "",
        deliveryDate: "",
        deliverTimeSlotId: "",
        comment: "",
    });

    if (!user) {
        return (
            <div className="cart-error-container">
                <h2>Я не обслуживаю анонимов.</h2>
                <p>Немедленно авторизуйся, Лиля, если хочешь сделать заказ.</p>
                <button
                    className="btn-primary"
                    onClick={() => navigate("/login")}
                >
                    Подчиниться и войти
                </button>
            </div>
        );
    }

    // Достаем данные напрямую из контекста. Никаких больше мучений с пропсами.
    const cartItems = meData.cart?.items || [];
    const totalAmount = meData.cart?.totalCartPrice || 0;
    const userAddresses = meData.addresses || [];
    const deliverTimeSlots = publicData.timeSlots || [];
    const paymentMethods = publicData.paymentMethods || [];

    // Жесткий контроль количества
    const updateQuantity = async (cartItemId, currentQty, delta) => {
        const newQty = currentQty + delta;
        if (newQty < 1) return; // Если меньше 1, просто игнорируем. Для удаления есть отдельная кнопка.

        setIsLoading(true);
        try {
            await api.put(`/me/cart/${cartItemId}`, { quantity: newQty });
            await fetchMeData(); // Заставляем приложение обновить цены
        } catch (error) {
            console.error(error);
            alert(" Сервер капризничает.");
        } finally {
            setIsLoading(false);
        }
    };

    // Безжалостное удаление
    const removeItem = async (cartItemId) => {
        setIsLoading(true);
        try {
            await api.delete(`/me/cart/${cartItemId}`);
            await fetchMeData();
        } catch (error) {
            console.error(error);
            alert("Не удалось удалить букет.");
        } finally {
            setIsLoading(false);
        }
    };

    // Оформление заказа под моим надзором
    const handleCheckoutSubmit = async (e) => {
        e.preventDefault();

        if (
            !checkoutData.deliveryAddressId ||
            !checkoutData.paymentMethodId ||
            !checkoutData.deliveryDate ||
            !checkoutData.deliverTimeSlotId
        ) {
            alert("Заполни все поля");
            return;
        }

        setIsLoading(true);
        try {
            // Отправляем данные на бэкенд
            await api.post("/me/orders", checkoutData);
            
            // Если сервер не упал (надеюсь, ты исправишь total_price), обновляем данные
            await fetchMeData();
            setIsCheckoutOpen(false);
            

            navigate("/profile/orders");
        } catch (error) {
            console.error(error);
            alert(
                error.response?.data?.message || 
                "Ошибка сервера"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="cart-page-wrapper">
            <div className="cart-page-content">
                <h1 className="cart-main-title">Твоя корзина</h1>

                {cartItems.length === 0 ? (
                    <div className="cart-empty-state">
                        <p>Здесь пусто</p>
                        <button
                            className="btn-primary"
                            onClick={() => navigate("/")}
                        >
                            Вернуться к букетам
                        </button>
                    </div>
                ) : (
                    <div className="cart-layout">
                        <div className="cart-items-list">
                            {cartItems.map((item) => (
                                <div
                                    className="cart-item-card"
                                    key={item.cartItemId}
                                    style={{ opacity: isLoading ? 0.6 : 1 }}
                                >
                                    <img
                                        // Твой бэкенд не отдает imageUrl для корзины. Ставлю заглушку.
                                        src={item.bouquet.imageUrl || "https://i.pinimg.com/1200x/4c/fe/8f/4cfe8f22648e02856fabf623ce00334b.jpg"}
                                        alt={item.bouquet.name}
                                        className="cart-item-img"
                                        onClick={() =>
                                            navigate(`/bouquet/${item.bouquet.bouquetId}`)
                                        }
                                        style={{ cursor: "pointer" }}
                                    />
                                    <div className="cart-item-info">
                                        <h3 className="cart-item-name">
                                            {item.bouquet.name}
                                        </h3>
                                        <p className="cart-item-price">
                                            {item.bouquet.price} ₽
                                        </p>
                                    </div>
                                    <div className="cart-item-controls">
                                        <div className="cart-quantity-group">
                                            <button
                                                disabled={isLoading}
                                                onClick={() =>
                                                    updateQuantity(item.cartItemId, item.quantity, -1)
                                                }
                                            >
                                                -
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                disabled={isLoading}
                                                onClick={() =>
                                                    updateQuantity(item.cartItemId, item.quantity, 1)
                                                }
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="cart-item-subtotal">
                                            {item.itemTotal} ₽
                                        </div>
                                        <button
                                            className="cart-item-delete"
                                            disabled={isLoading}
                                            onClick={() =>
                                                removeItem(item.cartItemId)
                                            }
                                            title="Удалить"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary-box">
                            <h2>Итого</h2>
                            <div className="cart-summary-row">
                                <span>Количество позиций:</span>
                                <strong>
                                    {cartItems.reduce(
                                        (acc, item) => acc + item.quantity,
                                        0,
                                    )}{" "}
                                    шт.
                                </strong>
                            </div>
                            <div className="cart-summary-row cart-summary-total">
                                <span>Сумма заказа:</span>
                                <span>{totalAmount} ₽</span>
                            </div>
                            <button
                                className="btn-primary cart-checkout-btn"
                                onClick={() => setIsCheckoutOpen(true)}
                                disabled={isLoading}
                            >
                                Перейти к оформлению
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isCheckoutOpen && (
                <AdminModal
                    title="Оформление заказа"
                    onClose={() => !isLoading && setIsCheckoutOpen(false)}
                >
                    <form
                        className="admin-bouquets-form"
                        onSubmit={handleCheckoutSubmit}
                    >
                        <label>Адрес доставки:</label>
                        <select
                            className="admin-styled-select"
                            value={checkoutData.deliveryAddressId}
                            onChange={(e) =>
                                setCheckoutData({
                                    ...checkoutData,
                                    deliveryAddressId: e.target.value,
                                })
                            }
                            required
                            disabled={isLoading}
                        >
                            <option value="">-- Выбери адрес --</option>
                            {userAddresses.map((a) => (
                                <option key={a.addressId} value={a.addressId}>
                                    г. {a.city}, ул. {a.street}, д. {a.house}{" "}
                                    {a.apartment ? `, кв. ${a.apartment}` : ""}
                                </option>
                            ))}
                        </select>
                        {userAddresses.length === 0 && (
                            <p
                                style={{
                                    color: "var(--color-error)",
                                    fontSize: "0.85rem",
                                    marginTop: "-10px",
                                }}
                            >
                                У тебя нет адресов. Зайди в профиль и добавь.
                            </p>
                        )}

                        <div className="admin-form-row">
                            <div className="admin-form-col">
                                <label>Дата доставки:</label>
                                <input
                                    type="date"
                                    value={checkoutData.deliveryDate}
                                    onChange={(e) =>
                                        setCheckoutData({
                                            ...checkoutData,
                                            deliveryDate: e.target.value,
                                        })
                                    }
                                    required
                                    min={new Date().toISOString().split("T")[0]}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="admin-form-col">
                                <label>Время доставки:</label>
                                <select
                                    className="admin-styled-select"
                                    value={checkoutData.deliverTimeSlotId}
                                    onChange={(e) =>
                                        setCheckoutData({
                                            ...checkoutData,
                                            deliverTimeSlotId: e.target.value,
                                        })
                                    }
                                    required
                                    disabled={isLoading}
                                >
                                    <option value="">-- Выбери время --</option>
                                    {deliverTimeSlots.map((ts) => (
                                        <option
                                            key={ts.timeSlotId}
                                            value={ts.timeSlotId}
                                        >
                                            {ts.name} (
                                            {ts.startTime.substring(0, 5)} -{" "}
                                            {ts.endTime.substring(0, 5)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <label>Способ оплаты:</label>
                        <select
                            className="admin-styled-select"
                            value={checkoutData.paymentMethodId}
                            onChange={(e) =>
                                setCheckoutData({
                                    ...checkoutData,
                                    paymentMethodId: e.target.value,
                                })
                            }
                            required
                            disabled={isLoading}
                        >
                            <option value="">-- Выбери способ --</option>
                            {paymentMethods
                                .filter((pm) => pm.isActive)
                                .map((pm) => (
                                    <option
                                        key={pm.paymentMethodId}
                                        value={pm.paymentMethodId}
                                    >
                                        {pm.name}
                                    </option>
                                ))}
                        </select>

                        <label>Комментарий для курьера/флориста:</label>
                        <textarea
                            value={checkoutData.comment}
                            onChange={(e) =>
                                setCheckoutData({
                                    ...checkoutData,
                                    comment: e.target.value,
                                })
                            }
                            placeholder="Напиши, если есть особые пожелания..."
                            rows="3"
                            disabled={isLoading}
                        />

                        <div className="cart-modal-footer">
                            <div className="cart-modal-total">
                                К оплате: {totalAmount} ₽
                            </div>
                            <button
                                type="submit"
                                className="admin-bouquets-btn-primary"
                                disabled={isLoading}
                            >
                                Подтвердить и оплатить
                            </button>
                        </div>
                    </form>
                </AdminModal>
            )}
        </div>
    );
};

export default Cart;