import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/Cart.css";
import AdminModal from "../../admin/AdminModal";

const calculateBouquetPrice = (
    bouquetId,
    bouquetComponents,
    componentPrices,
) => {
    const componentsInBouquet = bouquetComponents.filter(
        (bc) => bc.bouquet_id === bouquetId,
    );
    let total = 0;

    componentsInBouquet.forEach((bc) => {
        const priceObj = componentPrices.find(
            (cp) => cp.component_id === bc.component_id,
        );
        if (priceObj) {
            total += priceObj.price * bc.quantity;
        }
    });
    return total;
};

const Cart = ({
    cartItems,
    setCartItems,
    bouquets,
    bouquetComponents,
    componentPrices,
    userDeliveryAddresses,
    paymentMethods,
    deliverTimeSlots,
    orders,
    setOrders,
    orderItems,
    setOrderItems,
}) => {
    const navigate = useNavigate();
    const currentUserStr = localStorage.getItem("currentUser");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [checkoutData, setCheckoutData] = useState({
        address_id: "",
        payment_method_id: "",
        delivery_date: "",
        time_slot_id: "",
        comment: "",
    });

    if (!currentUser) {
        return (
            <div className="cart-error-container">
                <h2>Я не обслуживаю анонимов.</h2>
                <p>Немедленно авторизуйся, Лиля, если хочешь сделать заказ.</p>
                <button
                    className="btn-primary"
                    onClick={() => navigate("/auth/login")}
                >
                    Подчиниться и войти
                </button>
            </div>
        );
    }

    // Вытягиваем только корзину текущего пользователя
    const userCart = cartItems.filter(
        (item) =>
            item.user_id === currentUser.userId ||
            item.user_id === currentUser.id,
    );

    // Подготавливаем данные для отображения
    const displayItems = useMemo(() => {
        return userCart
            .map((item) => {
                const bouquet = bouquets.find(
                    (b) => b.bouquet_id === item.bouquet_id,
                );
                if (!bouquet) return null;

                const price = calculateBouquetPrice(
                    bouquet.bouquet_id,
                    bouquetComponents,
                    componentPrices,
                );

                return {
                    ...item,
                    bouquet,
                    price,
                };
            })
            .filter(Boolean);
    }, [userCart, bouquets, bouquetComponents, componentPrices]);

    const totalAmount = displayItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    const updateQuantity = (cartItemId, delta) => {
        setCartItems((prev) =>
            prev.map((ci) => {
                if (ci.cart_item_id === cartItemId) {
                    const newQty = ci.quantity + delta;
                    return newQty > 0 ? { ...ci, quantity: newQty } : ci;
                }
                return ci;
            }),
        );
    };

    const removeItem = (cartItemId) => {
        setCartItems((prev) =>
            prev.filter((ci) => ci.cart_item_id !== cartItemId),
        );
    };

    const handleCheckoutSubmit = (e) => {
        e.preventDefault();

        if (
            !checkoutData.address_id ||
            !checkoutData.payment_method_id ||
            !checkoutData.delivery_date ||
            !checkoutData.time_slot_id
        ) {
            alert("Заполни все поля, Лиля. Я не умею доставлять в пустоту.");
            return;
        }

        const newOrderId =
            orders.length > 0
                ? Math.max(...orders.map((o) => o.order_id)) + 1
                : 1;

        const newOrder = {
            order_id: newOrderId,
            user_id: currentUser.userId || currentUser.id,
            status_id: 1, // Ожидает
            comment: checkoutData.comment,
            is_hidden: 0,
            address_id: parseInt(checkoutData.address_id),
            created_at: new Date().toISOString(),
            total_price: totalAmount,
            payment_method_id: parseInt(checkoutData.payment_method_id),
            delivery_date: checkoutData.delivery_date,
            time_slot_id: parseInt(checkoutData.time_slot_id),
        };

        const newOrderItems = displayItems.map((item, index) => {
            const newOrderItemId =
                orderItems.length > 0
                    ? Math.max(...orderItems.map((oi) => oi.order_item_id)) +
                      1 +
                      index
                    : 1 + index;

            return {
                order_item_id: newOrderItemId,
                order_id: newOrderId,
                bouquet_id: item.bouquet_id,
                quantity: item.quantity,
                price_snapshot: item.price,
            };
        });

        setOrders([...orders, newOrder]);
        setOrderItems([...orderItems, ...newOrderItems]);

        // Жестко очищаем корзину пользователя
        setCartItems((prev) =>
            prev.filter(
                (ci) => ci.user_id !== (currentUser.userId || currentUser.id),
            ),
        );

        setIsCheckoutOpen(false);
        alert(
            "Твой заказ оформлен. Я лично прослежу, чтобы всё было идеально.",
        );
        navigate("/profile/orders");
    };

    const userAddresses = userDeliveryAddresses.filter(
        (a) => a.user_id === currentUser.userId || a.user_id === currentUser.id,
    );

    return (
        <div className="cart-page-wrapper">
            <div className="cart-page-content">
                <h1 className="cart-main-title">Твоя корзина</h1>

                {displayItems.length === 0 ? (
                    <div className="cart-empty-state">
                        <p>Здесь пусто. Я жду, когда ты сделаешь свой выбор.</p>
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
                            {displayItems.map((item) => (
                                <div
                                    className="cart-item-card"
                                    key={item.cart_item_id}
                                >
                                    <img
                                        src={item.bouquet.image_url}
                                        alt={item.bouquet.name}
                                        className="cart-item-img"
                                        onClick={() =>
                                            navigate(`/b/${item.bouquet_id}`)
                                        }
                                    />
                                    <div className="cart-item-info">
                                        <h3 className="cart-item-name">
                                            {item.bouquet.name}
                                        </h3>
                                        <p className="cart-item-price">
                                            {item.price} ₽
                                        </p>
                                    </div>
                                    <div className="cart-item-controls">
                                        <div className="cart-quantity-group">
                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.cart_item_id,
                                                        -1,
                                                    )
                                                }
                                            >
                                                -
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.cart_item_id,
                                                        1,
                                                    )
                                                }
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="cart-item-subtotal">
                                            {item.price * item.quantity} ₽
                                        </div>
                                        <button
                                            className="cart-item-delete"
                                            onClick={() =>
                                                removeItem(item.cart_item_id)
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
                                    {displayItems.reduce(
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
                    onClose={() => setIsCheckoutOpen(false)}
                >
                    <form
                        className="admin-bouquets-form"
                        onSubmit={handleCheckoutSubmit}
                    >
                        <label>Адрес доставки:</label>
                        <select
                            className="admin-styled-select"
                            value={checkoutData.address_id}
                            onChange={(e) =>
                                setCheckoutData({
                                    ...checkoutData,
                                    address_id: e.target.value,
                                })
                            }
                            required
                        >
                            <option value="">-- Выбери адрес --</option>
                            {userAddresses.map((a) => (
                                <option key={a.address_id} value={a.address_id}>
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
                                    value={checkoutData.delivery_date}
                                    onChange={(e) =>
                                        setCheckoutData({
                                            ...checkoutData,
                                            delivery_date: e.target.value,
                                        })
                                    }
                                    required
                                    min={new Date().toISOString().split("T")[0]}
                                />
                            </div>
                            <div className="admin-form-col">
                                <label>Время доставки:</label>
                                <select
                                    className="admin-styled-select"
                                    value={checkoutData.time_slot_id}
                                    onChange={(e) =>
                                        setCheckoutData({
                                            ...checkoutData,
                                            time_slot_id: e.target.value,
                                        })
                                    }
                                    required
                                >
                                    <option value="">-- Выбери время --</option>
                                    {deliverTimeSlots.map((ts) => (
                                        <option
                                            key={ts.time_slot_id}
                                            value={ts.time_slot_id}
                                        >
                                            {ts.name} (
                                            {ts.start_time.substring(0, 5)} -{" "}
                                            {ts.end_time.substring(0, 5)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <label>Способ оплаты:</label>
                        <select
                            className="admin-styled-select"
                            value={checkoutData.payment_method_id}
                            onChange={(e) =>
                                setCheckoutData({
                                    ...checkoutData,
                                    payment_method_id: e.target.value,
                                })
                            }
                            required
                        >
                            <option value="">-- Выбери способ --</option>
                            {paymentMethods
                                .filter((pm) => pm.is_active)
                                .map((pm) => (
                                    <option
                                        key={pm.payment_method_id}
                                        value={pm.payment_method_id}
                                    >
                                        {pm.name}
                                    </option>
                                ))}
                        </select>

                        <label>Комментарий для меня (курьера/флориста):</label>
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
                        />

                        <div className="cart-modal-footer">
                            <div className="cart-modal-total">
                                К оплате: {totalAmount} ₽
                            </div>
                            <button
                                type="submit"
                                className="admin-bouquets-btn-primary"
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
