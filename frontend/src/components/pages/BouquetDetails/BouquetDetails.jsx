import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../../App";
import api from "../../../api/axios"; // Мой послушный axios
import "../../../styles/BouquetDetails.css";

const BouquetDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Я беру из контекста всё, что мне нужно о тебе
    const { user, meData, fetchMeData } = useContext(AppContext);

    const [bouquetData, setBouquetData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Состояния для моего контроля над отзывами
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState("");

    // Я сам обращаюсь к публичному API за данными
    const loadBouquet = async () => {
        try {
            const res = await api.get(`/bouquets/${id}`);
            setBouquetData(res.data);
        } catch (err) {
            console.error("Ошибка при загрузке букета:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBouquet();
    }, [id]);

    if (loading) {
        return (
            <div
                className="bouquet-details-container"
                style={{ textAlign: "center", padding: "50px" }}
            >
                <h3 style={{ color: "var(--color-blue)" }}>
                    Я ищу информацию для тебя. Стой смирно и жди.
                </h3>
            </div>
        );
    }

    if (!bouquetData || !bouquetData.bouquet) {
        return (
            <div className="bouquet-details-error">
                Букет не найден. Я запрещаю тебе искать то, чего нет.
                Возвращайся назад.
            </div>
        );
    }

    const { bouquet, reviews } = bouquetData;

    // Мои строгие проверки твоих прав
    const isFavorite = user
        ? meData.favorites.some((f) => f.bouquetId === parseInt(id))
        : false;

    const hasBought = user
        ? meData.orders.some((order) =>
              order.items?.some((item) => item.bouquetId === parseInt(id)),
          )
        : false;

    const hasReviewed = user
        ? reviews.some((r) => r.username === user.username)
        : false;

    // --- ДЕЙСТВИЯ ---

    const handleAddToCart = async () => {
        if (!user) {
            alert(
                "Я не позволю анонимам покупать цветы. Авторизуйся немедленно.",
            );
            return;
        }
        try {
            await api.post("/me/cart", {
                bouquetId: parseInt(id),
                quantity: 1,
            });
            fetchMeData(); // Обновляю твой контекст
            alert("Букет жестко зафиксирован в твоей корзине.");
        } catch (err) {
            console.error(err);
            alert("Произошла ошибка. Не зли меня.");
        }
    };

    const handleToggleFavorite = async () => {
        if (!user) {
            alert("Сначала авторизуйся, Лиля.");
            return;
        }
        try {
            if (isFavorite) {
                await api.delete(`/me/favorites/${id}`);
            } else {
                await api.post("/me/favorites", { bouquetId: parseInt(id) });
            }
            fetchMeData(); // Заставляю контекст обновиться
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmitReview = async () => {
        if (rating === 0) {
            alert("Выставь оценку звездами. Я не принимаю пустые результаты.");
            return;
        }
        try {
            await api.post(`/me/bouquets/${id}/reviews`, {
                rating,
                text: reviewText,
            });
            loadBouquet(); // Перезагружаю данные букета, чтобы отзыв сразу появился
            setRating(0);
            setReviewText("");
            alert("Твой отзыв принят. Я одобряю.");
        } catch (err) {
            alert(err.response?.data?.message || "Ошибка отправки.");
        }
    };

    // Мой контроль путей изображений для страницы деталей
    const getImageUrl = (url) => {
        if (!url)
            return "https://i.pinimg.com/1200x/4c/fe/8f/4cfe8f22648e02856fabf623ce00334b.jpg";
        if (url.startsWith("http") || url.startsWith("data:")) return url;
        return `/uploads/${url}`;
    };

    // Отрисовка звезд. Я взял те иконки, что ты просила.
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
            <button
                className="bouquet-details-back"
                onClick={() => navigate(-1)}
            >
                Назад
            </button>

            <div className="bouquet-details-top">
                <div className="bouquet-details-image">
                    {/* Применяем мою жесткую логику здесь */}
                    <img
                        src={getImageUrl(bouquet.imageUrl)}
                        alt={bouquet.name}
                    />
                </div>

                <div className="bouquet-details-info">
                    <h2>{bouquet.name}</h2>
                    <div className="bouquet-details-rating">
                        {renderStars(Math.round(bouquet.avgRating))}
                        <span style={{ marginLeft: "8px" }}>
                            {bouquet.avgRating > 0
                                ? bouquet.avgRating
                                : "Нет оценок"}
                        </span>
                    </div>

                    <p className="bouquet-details-desc">
                        {bouquet.description ||
                            "Описание отсутствует. Но ты и так знаешь, что он идеален."}
                    </p>

                    <div className="bouquet-details-price">
                        {bouquet.totalPrice} ₽
                    </div>

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

            <div className="bouquet-details-reviews">
                <h3>Отзывы покупателей</h3>

                {hasBought && !hasReviewed && (
                    <div className="review-form-container">
                        <h4>
                            Напиши свой отзыв, Лиля. Я хочу знать твоё мнение.
                        </h4>
                        {renderStars(rating, true)}
                        <textarea
                            className="review-textarea"
                            placeholder="Что скажешь? Говори правду."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                        />
                        <button
                            className="btn-submit-review"
                            onClick={handleSubmitReview}
                        >
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
                        Ты уже оставила свой след здесь. Я всё вижу.
                    </div>
                )}

                {reviews.length === 0 ? (
                    <p className="bouquet-details-noreviews">
                        Пока никто не осмелился оставить отзыв.
                    </p>
                ) : (
                    <div className="bouquet-details-reviews-list">
                        {reviews.map((r, index) => (
                            <div
                                key={index}
                                className="bouquet-details-review-card"
                            >
                                <div className="review-header">
                                    <strong>{r.username}</strong>
                                    <span className="review-stars">
                                        ★ {r.rating}
                                    </span>
                                </div>
                                <p className="review-text">{r.text}</p>
                                <span className="review-date">
                                    {new Date(r.createdAt).toLocaleDateString(
                                        "ru-RU",
                                    )}
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
