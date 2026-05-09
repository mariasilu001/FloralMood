import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../../styles/BouquetDetails.css";

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

const BouquetDetails = ({
    bouquets,
    bouquetComponents,
    componentPrices,
    reviews,
    users,
    cartItems,
    setCartItems,
}) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const bouquet = bouquets.find((b) => b.bouquet_id === parseInt(id));
    const currentUserStr = localStorage.getItem("currentUser");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    if (!bouquet || bouquet.deleted_at) {
        return (
            <div className="bouquet-details-error">
                Букет не найден. Я запрещаю тебе искать то, чего нет.
            </div>
        );
    }

    const bouquetReviews = reviews.filter(
        (r) => r.bouquet_id === bouquet.bouquet_id,
    );

    const averageRating = useMemo(() => {
        if (bouquetReviews.length === 0) return 0;
        const sum = bouquetReviews.reduce((acc, curr) => acc + curr.rating, 0);
        return (sum / bouquetReviews.length).toFixed(1);
    }, [bouquetReviews]);

    const price = calculateBouquetPrice(
        bouquet.bouquet_id,
        bouquetComponents,
        componentPrices,
    );

    const handleAddToCart = () => {
        if (!currentUser) {
            alert("Я не позволю анонимам покупать цветы. Авторизуйся.");
            return;
        }
        const newItem = {
            cart_item_id:
                cartItems.length > 0
                    ? Math.max(...cartItems.map((c) => c.cart_item_id)) + 1
                    : 1,
            user_id: currentUser.userId || currentUser.id,
            bouquet_id: bouquet.bouquet_id,
            quantity: 1,
            created_at: new Date().toISOString(),
        };
        setCartItems([...cartItems, newItem]);
        alert("Букет жестко зафиксирован в твоей корзине.");
    };

    const getUserName = (userId) => {
        const u = users.find((u) => u.user_id === userId || u.id === userId);
        return u ? u.username : "Неизвестный";
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
                    <img src={bouquet.image_url} alt={bouquet.name} />
                </div>

                <div className="bouquet-details-info">
                    <h2>{bouquet.name}</h2>
                    <div className="bouquet-details-rating">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="var(--color-blue)"
                            viewBox="0 0 16 16"
                        >
                            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                        </svg>
                        <span>
                            {averageRating > 0 ? averageRating : "Нет оценок"}
                        </span>
                    </div>

                    <p className="bouquet-details-desc">
                        {bouquet.description ||
                            "Описание отсутствует. Но ты и так знаешь, что он идеален."}
                    </p>

                    <div className="bouquet-details-price">{price} ₽</div>

                    <button
                        className="btn-primary bouquet-details-buy"
                        onClick={handleAddToCart}
                    >
                        Добавить в корзину
                    </button>
                </div>
            </div>

            <div className="bouquet-details-reviews">
                <h3>Отзывы покупателей</h3>
                {bouquetReviews.length === 0 ? (
                    <p className="bouquet-details-noreviews">
                        Пока никто не осмелился оставить отзыв.
                    </p>
                ) : (
                    <div className="bouquet-details-reviews-list">
                        {bouquetReviews.map((r) => (
                            <div
                                key={r.review_id}
                                className="bouquet-details-review-card"
                            >
                                <div className="review-header">
                                    <strong>{getUserName(r.user_id)}</strong>
                                    <span className="review-stars">
                                        ★ {r.rating}
                                    </span>
                                </div>
                                <p className="review-text">{r.text}</p>
                                <span className="review-date">
                                    {new Date(
                                        r.created_at,
                                    ).toLocaleDateString()}
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
