import React from "react";
import { Link } from "react-router-dom";
import { calculateBouquetPrice } from "../Home/SmartCalendar";

const MyFavorites = ({
    favorites,
    setFavorites,
    bouquets,
    bouquetComponents,
    componentPrices,
    components,
    cartItems,
    setCartItems,
}) => {
    const currentUserStr = localStorage.getItem("currentUser");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    if (!currentUser) return null;

    // Жестко отбираем связи из таблицы favorites
    const userFavorites = favorites.filter(
        (f) => f.user_id === currentUser.userId || f.user_id === currentUser.id,
    );

    // Связываем с букетами и пропускаем через мой фильтр качества
    const favoriteBouquets = userFavorites
        .map((fav) => {
            const bq = bouquets.find((b) => b.bouquet_id === fav.bouquet_id);
            if (!bq) return null;

            // Отсекаем удаленные
            if (bq.deleted_at) return null;

            // Отсекаем букеты с удаленными компонентами
            const bComps = bouquetComponents.filter(
                (bc) => bc.bouquet_id === bq.bouquet_id,
            );
            const hasDeletedComponent = bComps.some((bc) => {
                const comp = components.find(
                    (c) => c.component_id === bc.component_id,
                );
                return comp && comp.deleted_at;
            });

            if (hasDeletedComponent) return null;

            return { ...bq, favorite_id: fav.favorite_id }; // Прокидываем ID связи для удаления
        })
        .filter(Boolean);

    const handleRemoveFavorite = (favoriteId) => {
        setFavorites((prev) =>
            prev.filter((f) => f.favorite_id !== favoriteId),
        );
        alert("Букет безжалостно вычеркнут из твоих желаний.");
    };

    const handleAddToCart = (bouquetId) => {
        const newItem = {
            cart_item_id:
                cartItems.length > 0
                    ? Math.max(...cartItems.map((c) => c.cart_item_id)) + 1
                    : 1,
            user_id: currentUser.userId || currentUser.id,
            bouquet_id: bouquetId,
            quantity: 1,
            created_at: new Date().toISOString(),
        };
        setCartItems([...cartItems, newItem]);
        alert("Букет жестко добавлен в корзину.");
    };

    return (
        <div className="profile-details-container">
            <div className="profile-section">
                <div className="profile-section-header">
                    <h2>Мое избранное</h2>
                </div>
                <p
                    className="admin-text-muted"
                    style={{ marginBottom: "24px" }}
                >
                    Список твоих слабостей. Смотри, выбирай, покупай.
                </p>

                {favoriteBouquets.length === 0 ? (
                    <div className="profile-empty-state">
                        Твой список пуст. У тебя совсем нет желаний, Лили?
                    </div>
                ) : (
                    <div className="favorites-grid">
                        {favoriteBouquets.map((bouquet) => (
                            <div
                                key={bouquet.favorite_id}
                                className="bouquet-card favorite-card"
                            >
                                <img
                                    src={
                                        bouquet.image_url ||
                                        "https://via.placeholder.com/250"
                                    }
                                    alt={bouquet.name}
                                />
                                <h3>{bouquet.name}</h3>
                                <p className="price">
                                    {calculateBouquetPrice(
                                        bouquet.bouquet_id,
                                        bouquetComponents,
                                        componentPrices,
                                    )}{" "}
                                    ₽
                                </p>
                                <div className="favorite-actions">
                                    <button
                                        className="profile-btn-primary"
                                        onClick={() =>
                                            handleAddToCart(bouquet.bouquet_id)
                                        }
                                    >
                                        В корзину
                                    </button>
                                    <button
                                        className="btn-remove-favorite"
                                        onClick={() =>
                                            handleRemoveFavorite(
                                                bouquet.favorite_id,
                                            )
                                        }
                                    >
                                        Удалить из избранного
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyFavorites;
