import React, { useState, useMemo, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DBcontext } from "../../../Database"; // НАША ЛОКАЛЬНАЯ БАЗА!
import BouquetImage from "../Home/BouquetImage";
import "../../../styles/BouquetDetails.css";

const BouquetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. Достаем все необходимые таблицы из БД
  const {
    users,
    bouquets,
    components,
    bouquetComponents,
    componentPrices,
    favorites,
    setFavorites,
    cartItems,
    setCartItems,
    reviews,
    setReviews,
    orders,
    orderItems,
  } = useContext(DBcontext);

  // Локальные стейты
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [showComponents, setShowComponents] = useState(false);

  // ==========================================
  // ХУКИ ДОЛЖНЫ БЫТЬ НАВЕРХУ! (До любых return)
  // ==========================================

  // Безопасно вычисляем ID и сам букет
  const targetBouquetId = id ? BigInt(id) : null;
  const bouquet =
    bouquets && targetBouquetId
      ? bouquets.find((b) => b._id === targetBouquetId)
      : null;

  // Безопасно формируем полные данные о составе букета ВНУТРИ useMemo
  const fullComponentsData = useMemo(() => {
    // Если базы еще нет или букет не найден - возвращаем пустой массив
    if (!bouquetComponents || !components || !bouquet) return [];

    // Ищем связи для ЭТОГО букета
    const bComps = bouquetComponents.filter(
      (bc) => bc.bouquet_id === bouquet._id,
    );

    return bComps.map((bc) => {
      // Ищем сам объект цветка/упаковки
      const compDef = components.find((c) => c._id === bc.component_id);
      // Возвращаем склеенный объект
      return {
        ...compDef,
        quantity: bc.quantity,
      };
    });
  }, [bouquetComponents, components, bouquet]); // Зависимости корректны

  // ==========================================
  // 2. ЖЕСТКАЯ ЗАГЛУШКА БЕЗОПАСНОСТИ
  // ==========================================
  if (
    !users ||
    !bouquets ||
    !components ||
    !bouquetComponents ||
    !componentPrices ||
    !favorites ||
    !cartItems ||
    !reviews ||
    !orders ||
    !orderItems
  ) {
    return (
      <div
        className="bouquet-details-container"
        style={{ textAlign: "center", padding: "50px" }}
      >
        <h3 style={{ color: "var(--color-blue)" }}>
          Собираю информацию о букете...
        </h3>
      </div>
    );
  }

  // 3. ПРОВЕРКА НА СУЩЕСТВОВАНИЕ БУКЕТА
  if (!bouquet) {
    return (
      <div
        className="bouquet-details-error"
        style={{ textAlign: "center", padding: "50px" }}
      >
        Такого букета не существует.
      </div>
    );
  }

  // 4. ИДЕНТИФИКАЦИЯ СЕССИИ
  const userIdStr = localStorage.getItem("userId");
  const user = userIdStr
    ? users.find((u) => u._id === BigInt(userIdStr))
    : null;

  // 5. ВЫЧИСЛЯЕМ ЦЕНУ БУКЕТА
  let cost = 0;
  const bCompsForPrice = bouquetComponents.filter(
    (bc) => bc.bouquet_id === bouquet._id,
  );
  bCompsForPrice.forEach((bc) => {
    const prices = componentPrices.filter(
      (cp) => cp.component_id === bc.component_id,
    );
    prices.sort((a, b) => b.start_date.getTime() - a.start_date.getTime());
    const currentPrice = prices.length > 0 ? prices[0].price : 0;
    cost += currentPrice * bc.quantity;
  });
  const calculatedPrice = (cost * 1.06).toFixed(2);

  // 6. РАБОТА С ОТЗЫВАМИ И РЕЙТИНГОМ
  const bouquetReviews = reviews.filter((r) => r.bouquet_id === bouquet._id);
  const reviewsWithUsers = bouquetReviews.map((r) => {
    const reviewer = users.find((u) => u._id === r.user_id);
    return {
      ...r,
      username: reviewer ? reviewer.username : "Анонимный покупатель",
    };
  });

  const avgRating =
    bouquetReviews.length > 0
      ? (
          bouquetReviews.reduce((sum, r) => sum + r.rating, 0) /
          bouquetReviews.length
        ).toFixed(1)
      : 0;

  // 7. СВЯЗКИ С ТЕКУЩИМ ПОЛЬЗОВАТЕЛЕМ
  const isFavorite = user
    ? favorites.some(
        (f) => f.user_id === user._id && f.bouquet_id === bouquet._id,
      )
    : false;

  const hasReviewed = user
    ? bouquetReviews.some((r) => r.user_id === user._id)
    : false;

  let hasBought = false;
  if (user) {
    const userOrders = orders.filter((o) => o.user_id === user._id);
    const userOrderIds = userOrders.map((o) => o._id);
    hasBought = orderItems.some(
      (oi) =>
        userOrderIds.includes(oi.order_id) && oi.bouquet_id === bouquet._id,
    );
  }

  // ==========================================
  // ЭКШЕНЫ
  // ==========================================

  const handleAddToCart = () => {
    if (!user) {
      alert("Сначала авторизуйся или зарегистрируйся. Мои правила.");
      return navigate("/login");
    }

    const maxId = cartItems.reduce(
      (max, item) => (item._id > max ? item._id : max),
      0n,
    );
    const newItem = {
      _id: maxId + 1n,
      user_id: user._id,
      bouquet_id: bouquet._id,
      quantity: 1,
      created_at: new Date(),
    };

    setCartItems([...cartItems, newItem]);
    alert("Добавлено в твою локальную корзину.");
  };

  const handleToggleFavorite = () => {
    if (!user) {
      alert("Сначала авторизуйся или зарегистрируйся.");
      return navigate("/login");
    }

    if (isFavorite) {
      const newFavorites = favorites.filter(
        (f) => !(f.user_id === user._id && f.bouquet_id === bouquet._id),
      );
      setFavorites(newFavorites);
    } else {
      const maxId = favorites.reduce(
        (max, f) => (f._id > max ? f._id : max),
        0n,
      );
      const newFav = {
        _id: maxId + 1n,
        user_id: user._id,
        bouquet_id: bouquet._id,
        created_at: new Date(),
      };
      setFavorites([...favorites, newFav]);
    }
  };

  const handleSubmitReview = () => {
    if (rating === 0) {
      alert("Выставь оценку звездами. Я не принимаю пустые оценки.");
      return;
    }

    const maxId = reviews.reduce((max, r) => (r._id > max ? r._id : max), 0n);
    const newReview = {
      _id: maxId + 1n,
      user_id: user._id,
      bouquet_id: bouquet._id,
      order_id: null,
      rating: rating,
      text: reviewText.trim(),
      created_at: new Date(),
      changed_at: null,
      deleted_at: null,
    };

    setReviews([...reviews, newReview]);
    setRating(0);
    setReviewText("");
    alert("Твой отзыв опубликован!");
  };

  const renderStars = (currentRating, interactive = false) => {
    return (
      <div
        className="review-stars-select"
        style={{ display: "flex", gap: "4px" }}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => interactive && setRating(star)}
            style={{
              cursor: interactive ? "pointer" : "default",
              color: "var(--color-blue)",
            }}
          >
            {star <= currentRating ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-star-fill"
                viewBox="0 0 16 16"
              >
                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-star"
                viewBox="0 0 16 16"
              >
                <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z" />
              </svg>
            )}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="bouquet-details-container">
      <button className="bouquet-details-back" onClick={() => navigate(-1)}>
        Назад
      </button>

      <div className="bouquet-details-top">
        <div className="bouquet-details-image">
          <BouquetImage imageBlob={bouquet.image_url} altText={bouquet.name} />
        </div>

        <div className="bouquet-details-info">
          <h2>{bouquet.name}</h2>
          <div className="bouquet-details-rating">
            {renderStars(Math.round(avgRating))}
            <span style={{ marginLeft: "8px" }}>
              {avgRating > 0 ? avgRating : "Нет оценок"}
            </span>
          </div>

          <p className="bouquet-details-desc">
            {bouquet.description || "Описание отсутствует."}
          </p>

          <div className="bouquet-details-price">{calculatedPrice} ₽</div>

          <div className="bouquet-details-actions">
            <button
              className={`btn-favorite ${isFavorite ? "active" : ""}`}
              onClick={handleToggleFavorite}
              title="В избранное"
            >
              {isFavorite ? "❤️ В избранном" : "🤍 В избранное"}
            </button>
            <button
              className="btn-primary bouquet-details-buy"
              onClick={handleAddToCart}
            >
              Добавить в корзину
            </button>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* ТАБЛИЦА СОСТАВА БУКЕТА */}
      {/* ========================================== */}
      <div
        className="bouquet-details-composition"
        style={{ marginTop: "30px", marginBottom: "30px" }}
      >
        <button
          onClick={() => setShowComponents(!showComponents)}
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: "#f9f9f9",
            border: "1px solid #ddd",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            color: "var(--color-blue)",
            transition: "all 0.3s ease",
          }}
        >
          {showComponents
            ? "Скрыть состав букета ▲"
            : "Показать состав букета ▼"}
        </button>

        {showComponents && (
          <div style={{ marginTop: "15px", overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                background: "#fff",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <thead style={{ backgroundColor: "#f0f0f0" }}>
                <tr>
                  <th
                    style={{ padding: "12px", borderBottom: "2px solid #ddd" }}
                  >
                    Фото
                  </th>
                  <th
                    style={{ padding: "12px", borderBottom: "2px solid #ddd" }}
                  >
                    Название
                  </th>
                  <th
                    style={{ padding: "12px", borderBottom: "2px solid #ddd" }}
                  >
                    Описание
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      borderBottom: "2px solid #ddd",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Кол-во
                  </th>
                </tr>
              </thead>
              <tbody>
                {fullComponentsData.map((item) => (
                  <tr key={item._id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px", width: "80px" }}>
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#f5f5f5",
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                          }}
                        >
                          <BouquetImage
                            imageBlob={item.image_url}
                            altText={item.name}
                          />
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      {item.name}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        fontSize: "14px",
                        color: "#666",
                      }}
                    >
                      {item.description}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        fontWeight: "bold",
                        color: "var(--color-blue)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.quantity} {item.unit || "шт."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* ОТЗЫВЫ */}
      {/* ========================================== */}
      <div className="bouquet-details-reviews">
        <h3>Отзывы покупателей</h3>

        {hasBought && !hasReviewed && (
          <div className="review-form-container">
            <h4>Напиши свой отзыв</h4>
            {renderStars(rating, true)}
            <textarea
              className="review-textarea"
              placeholder="Что скажешь?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <button className="btn-submit-review" onClick={handleSubmitReview}>
              Опубликовать
            </button>
          </div>
        )}

        {hasBought && hasReviewed && (
          <div
            style={{
              marginBottom: "20px",
              color: "var(--color-blue)",
              fontWeight: "bold",
            }}
          >
            Твой отзыв тут уже оставлен
          </div>
        )}

        {reviewsWithUsers.length === 0 ? (
          <p className="bouquet-details-noreviews">
            Пока никто не захотел оставить отзыв.
          </p>
        ) : (
          <div className="bouquet-details-reviews-list">
            {reviewsWithUsers.map((r) => (
              <div key={r._id} className="bouquet-details-review-card">
                <div className="review-header">
                  <strong>{r.username}</strong>
                  <span className="review-stars">★ {r.rating}</span>
                </div>
                <p className="review-text">{r.text}</p>
                <span className="review-date">
                  {new Date(r.created_at).toLocaleDateString("ru-RU")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BouquetDetails;
