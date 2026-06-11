import React, { useState, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { DBcontext } from "../../../Database"; // НАША автономная локальная база данных
import BouquetImage from "../Home/BouquetImage"; // Наш безопасный рендерер Blob-фото
import AdminModal from "../../admin/AdminModal";
import "../../../styles/Cart.css";

const Cart = () => {
  const navigate = useNavigate();

  // 1. Достаем все необходимые реактивные таблицы и функции их обновления из БД
  const {
    users,
    cartItems,
    setCartItems,
    bouquets,
    bouquetComponents,
    componentPrices,
    deliveryAddresses,
    deliverTimeSlots,
    paymentMethods,
    orders,
    setOrders,
    orderItems,
    setOrderItems,
  } = useContext(DBcontext);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Стейт формы оформления
  const [checkoutData, setCheckoutData] = useState({
    deliveryAddressId: "",
    paymentMethodId: "",
    deliveryDate: "",
    deliverTimeSlotId: "",
    comment: "",
  });

  // ==========================================
  // ХУКИ ДАННЫХ И СЕССИИ (Строго на самом верху!)
  // ==========================================

  // Идентификация сессии через BigInt
  const userIdStr = localStorage.getItem("userId");
  const user = useMemo(() => {
    if (!users || !userIdStr) return null;
    return users.find((u) => u._id === BigInt(userIdStr));
  }, [users, userIdStr]);

  // МОЩНЫЙ РЕЛЯЦИОННЫЙ СБОР КОРЗИНЫ (Расчет цен на лету для каждой позиции)
  const processedCart = useMemo(() => {
    if (
      !cartItems ||
      !bouquets ||
      !bouquetComponents ||
      !componentPrices ||
      !user
    ) {
      return { items: [], totalCartPrice: "0.00" };
    }

    // Фильтруем позиции корзины строго для ТЕКУЩЕГО пользователя
    const userCartItems = cartItems.filter((item) => item.user_id === user._id);

    let totalCartPriceSum = 0;

    const items = userCartItems.map((item) => {
      // Ищем объект букета в таблице bouquets
      const bouquetObj = bouquets.find((b) => b._id === item.bouquet_id);

      // Считаем актуальную цену этого букета из компонентов
      let bouquetCost = 0;
      if (bouquetObj) {
        const bComps = bouquetComponents.filter(
          (bc) => bc.bouquet_id === bouquetObj._id,
        );
        bComps.forEach((bc) => {
          const prices = componentPrices.filter(
            (cp) => cp.component_id === bc.component_id,
          );
          prices.sort(
            (a, b) => b.start_date.getTime() - a.start_date.getTime(),
          );
          const currentPrice = prices.length > 0 ? prices[0].price : 0;
          bouquetCost += currentPrice * bc.quantity;
        });
      }

      // Финальная базовая цена одного букета с нашей 6% наценкой
      const singleBouquetPrice = Math.round(bouquetCost * 1.06);
      const itemTotalSum = singleBouquetPrice * item.quantity;

      totalCartPriceSum += itemTotalSum;

      return {
        cartItemId: String(item._id), // ЖЕСТКАЯ ЗАЩИТА: конвертируем BigInt в String для key
        quantity: item.quantity,
        itemTotal: itemTotalSum.toFixed(2),
        bouquet: {
          bouquetId: bouquetObj ? String(bouquetObj._id) : "",
          name: bouquetObj ? bouquetObj.name : "Неизвестный букет",
          price: singleBouquetPrice.toFixed(2),
          image_url: bouquetObj ? bouquetObj.image_url : null,
        },
      };
    });

    return {
      items,
      totalCartPrice: totalCartPriceSum.toFixed(2),
    };
  }, [cartItems, bouquets, bouquetComponents, componentPrices, user]);

  // ==========================================
  // ЗАГЛУШКИ БЕЗОПАСНОСТИ РЕНДЕРА (После всех хуков!)
  // ==========================================
  if (
    !users ||
    !cartItems ||
    !bouquets ||
    !bouquetComponents ||
    !componentPrices ||
    !deliveryAddresses ||
    !deliverTimeSlots ||
    !paymentMethods
  ) {
    return (
      <div
        className="cart-page-wrapper"
        style={{ textAlign: "center", padding: "50px" }}
      >
        <h3 style={{ color: "var(--color-primary)" }}>
          Синхронизирую финансовые шлюзы корзины...
        </h3>
      </div>
    );
  }

  // Защита от анонимов
  if (!user) {
    return (
      <div className="cart-error-container">
        <h2>Я не обслуживаю анонимов.</h2>
        <p>Немедленно авторизуйся, Лиля, если хочешь сделать заказ.</p>
        <button className="btn-primary" onClick={() => navigate("/login")}>
          Подчиниться и войти
        </button>
      </div>
    );
  }

  const { items: displayCartItems, totalCartPrice: totalAmount } =
    processedCart;

  // Фильтруем адреса доставки для текущего юзера
  const userAddresses = deliveryAddresses.filter(
    (addr) => addr.user_id === user._id,
  );

  // ==========================================
  // ЭКШЕНЫ УПРАВЛЕНИЯ КОРЗИНОЙ
  // ==========================================

  const updateQuantity = (cItemIdStr, currentQty, delta) => {
    const targetId = BigInt(cItemIdStr);
    const newQty = currentQty + delta;
    if (newQty < 1) return;

    const updatedItems = cartItems.map((item) => {
      if (item._id === targetId) {
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(updatedItems);
  };

  const removeItem = (cItemIdStr) => {
    const targetId = BigInt(cItemIdStr);
    const filteredItems = cartItems.filter((item) => item._id !== targetId);
    setCartItems(filteredItems);
  };

  // ОФОРМЛЕНИЕ ЗАКАЗА (Симуляция полноценного сервера транзакций)
  const handleCheckoutSubmit = (e) => {
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

    // A. Генерируем новый BigInt ID для заказа в таблице orders
    const maxOrderId = orders.reduce(
      (max, o) => (o._id > max ? o._id : max),
      0n,
    );
    const newOrderId = maxOrderId + 1n;

    // B. Создаем объект нового заказа
    const newOrderObj = {
      _id: newOrderId,
      user_id: user._id,
      status_id: 1n, // Статус: "Новый" (BigInt)
      comment: checkoutData.comment.trim() || null,
      is_hidden: false,
      address_id: BigInt(checkoutData.deliveryAddressId),
      created_at: new Date(),
      total_price: parseFloat(totalAmount),
      payment_method_id: BigInt(checkoutData.paymentMethodId),
      delivery_date: new Date(checkoutData.deliveryDate),
      time_slot_id: BigInt(checkoutData.deliverTimeSlotId),
    };

    // C. Переносим позиции из корзины текущего юзера в таблицу orderItems (снимки цен)
    let maxOrderItemId = orderItems.reduce(
      (max, oi) => (oi._id > max ? oi._id : max),
      0n,
    );

    // Фильтруем сырые элементы корзины этого юзера, которые мы сейчас покупаем
    const userRawCart = cartItems.filter((item) => item.user_id === user._id);

    const newOrderItemsList = userRawCart.map((cartItem) => {
      maxOrderItemId += 1n;

      // Находим вычисленную цену для снимка (price snapshot) из нашего обработанного массива displayCartItems
      const calculatedSinglePrice =
        displayCartItems.find((d) => d.cartItemId === String(cartItem._id))
          ?.bouquet.price || 0;

      return {
        _id: maxOrderItemId,
        order_id: newOrderId, // Привязываем к нашему новому созданному заказу
        bouquet_id: cartItem.bouquet_id,
        quantity: cartItem.quantity,
        price_snapshot: parseFloat(calculatedSinglePrice),
      };
    });

    // D. БЕЗЖАЛОСТНО ОЧИЩАЕМ КОРЗИНУ ЮЗЕРА (Оставляем в базе только чужие товары)
    const remainsCartItems = cartItems.filter(
      (item) => item.user_id !== user._id,
    );

    // E. Синхронно обновляем ВСЕ три таблицы в нашей базе данных!
    setOrders([...orders, newOrderObj]);
    setOrderItems([...orderItems, ...newOrderItemsList]);
    setCartItems(remainsCartItems); // Корзина пуста!

    // Закрываем модалку и перенаправляем в историю
    setIsCheckoutOpen(false);
    setCheckoutData({
      deliveryAddressId: "",
      paymentMethodId: "",
      deliveryDate: "",
      deliverTimeSlotId: "",
      comment: "",
    });

    alert("Заказ успешно зафиксирован курьерской службой Сильвера.");
    navigate("/profile/orders");
  };

  return (
    <div className="cart-page-wrapper">
      <div className="cart-page-content">
        <h1 className="cart-main-title">Твоя корзина</h1>

        {displayCartItems.length === 0 ? (
          <div className="cart-empty-state">
            <p>Здесь пусто, Лили. Твоя корзина ждёт цветов.</p>
            <button className="btn-primary" onClick={() => navigate("/")}>
              Вернуться к букетам
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-list">
              {displayCartItems.map((item) => (
                <div className="cart-item-card" key={item.cartItemId}>
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      display: "flex",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    {/* НАШ БЕЗОПАСНЫЙ РЕНДЕРЕР КАРТИНОК */}
                    <BouquetImage
                      imageBlob={item.bouquet.image_url}
                      altText={item.bouquet.name}
                    />
                  </div>
                  <div className="cart-item-info">
                    <h3
                      className="cart-item-name"
                      onClick={() =>
                        navigate(`/bouquet/${item.bouquet.bouquetId}`)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      {item.bouquet.name}
                    </h3>
                    <p className="cart-item-price">{item.bouquet.price} ₽</p>
                  </div>
                  <div className="cart-item-controls">
                    <div className="cart-quantity-group">
                      <button
                        onClick={() =>
                          updateQuantity(item.cartItemId, item.quantity, -1)
                        }
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.cartItemId, item.quantity, 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <div className="cart-item-subtotal">{item.itemTotal} ₽</div>
                    <button
                      className="cart-item-delete"
                      onClick={() => removeItem(item.cartItemId)}
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
                <span>Количество товаров:</span>
                <strong>
                  {displayCartItems.reduce(
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
          <form className="admin-bouquets-form" onSubmit={handleCheckoutSubmit}>
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
            >
              <option value="">-- Выбери адрес --</option>
              {userAddresses.map((a) => (
                <option key={String(a._id)} value={String(a._id)}>
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
                У тебя нет сохраненных адресов. Зайди в настройки профиля и
                добавь адрес.
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
                >
                  <option value="">-- Выбери время --</option>
                  {deliverTimeSlots.map((ts) => (
                    <option key={String(ts._id)} value={String(ts._id)}>
                      {ts.name} ({ts.start_time.substring(0, 5)} -{" "}
                      {ts.end_time.substring(0, 5)})
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
            >
              <option value="">-- Выбери способ --</option>
              {paymentMethods
                .filter((pm) => pm.is_active === true)
                .map((pm) => (
                  <option key={String(pm._id)} value={String(pm._id)}>
                    {pm.name}
                  </option>
                ))}
            </select>

            <label>Комментарий для курьера/флориста:</label>
            <textarea
              value={checkoutData.comment}
              onChange={(e) =>
                setCheckoutData({ ...checkoutData, comment: e.target.value })
              }
              placeholder="Напиши, если есть особые пожелания..."
              rows="3"
            />

            <div className="cart-modal-footer">
              <div className="cart-modal-total">К оплате: {totalAmount} ₽</div>
              <button type="submit" className="admin-bouquets-btn-primary">
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
