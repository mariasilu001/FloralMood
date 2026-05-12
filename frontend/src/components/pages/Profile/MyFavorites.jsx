import React, { useContext, useState } from "react";
import { AppContext } from "../../../App"; // Твой глобальный контроль
import api from "../../../api/axios";

const MyFavorites = () => {
    // Я забираю данные, которые ты уже получила в App.jsx
    const { meData, fetchMeData } = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(false);

    // Если данные еще не соизволили загрузиться — жди.
    if (!meData || !meData.favorites) {
        return (
            <div
                className="profile-details-container"
                style={{ textAlign: "center", padding: "50px" }}
            >
                <h3 style={{ color: "var(--color-primary)" }}>
                   Загрузка
                </h3>
            </div>
        );
    }

    const favorites = meData.favorites;

    const handleRemoveFavorite = async (bouquetId) => {
        // Твоя неуверенность мне не нужна, но я спрошу
        if (
            true
        )
            return;

        setIsLoading(true);
        try {
            // Я обращаюсь к своему контроллеру по bouquet_id
            await api.delete(`/me/favorites/${bouquetId}`);
            // Заставляю фронтенд синхронизироваться с моими данными
            await fetchMeData();
        } catch (error) {
            console.error("Ошибка при удалении из избранного:", error);
            alert(
                "Не удалось убрать букет.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="profile-details-container">
            <div className="profile-section">
                <div className="profile-section-header">
                    <h2>Избранное</h2>
                </div>
                <p
                    className="admin-text-muted"
                    style={{ marginBottom: "24px" }}
                >
                Тут хранятся букеты, которые вам понравились
                </p>

                {favorites.length === 0 ? (
                    <div className="profile-empty-state">
                       У вас ни одного избраннгого букета
                    </div>
                ) : (
                    <div
                        className="favorites-grid"
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fill, minmax(260px, 1fr))",
                            gap: "24px",
                        }}
                    >
                        {favorites.map((fav) => (
                            <div
                                key={fav.favoriteId}
                                className="bouquet-card" // Твой класс для карточек
                                style={{
                                    opacity: isLoading ? 0.6 : 1,
                                    position: "relative",
                                    border: "1px solid #eee",
                                    borderRadius: "12px",
                                    overflow: "hidden",
                                    transition: "transform 0.3s",
                                }}
                            >
                                <img
                                    src={
                                        fav.bouquet?.imageUrl
                                            ? `http://localhost:5000/uploads/${fav.bouquet.imageUrl}`
                                            : "/default-bouquet.jpg"
                                    }
                                    alt={fav.bouquet?.name}
                                    style={{
                                        width: "100%",
                                        height: "220px",
                                        objectFit: "cover",
                                    }}
                                />
                                <div
                                    className="bouquet-info"
                                    style={{ padding: "16px" }}
                                >
                                    <h3
                                        style={{
                                            margin: "0 0 8px 0",
                                            fontSize: "18px",
                                        }}
                                    >
                                        {fav.bouquet?.name}
                                    </h3>
                                    <p
                                        className="admin-text-muted"
                                        style={{
                                            fontSize: "14px",
                                            marginBottom: "16px",
                                            height: "40px",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {fav.bouquet?.description}
                                    </p>
                                    <button
                                        className="profile-btn-outline"
                                        onClick={() =>
                                            handleRemoveFavorite(
                                                fav.bouquet?.bouquetId,
                                            )
                                        }
                                        disabled={isLoading}
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            cursor: "pointer",
                                            backgroundColor: "transparent",
                                            border: "1px solid var(--color-primary)",
                                            color: "var(--color-primary)",
                                            borderRadius: "8px",
                                        }}
                                    >
                                        {isLoading
                                            ? "Убираю..."
                                            : "Убрать из списка"}
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
