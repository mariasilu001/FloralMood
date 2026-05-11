import React, { useState, useContext } from "react";
import AdminModal from "../../admin/AdminModal";
import api from "../../../api/axios";
import { AppContext } from "../../../App";

const MyCustomBouquets = () => {
    // Я забираю управление твоими данными на себя. Опять.
    const { meData, publicData, fetchMeData } = useContext(AppContext);

    const [selectedBouquet, setSelectedBouquet] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Защита от краша. Пока данные не загрузились, ты стоишь и ждешь моего разрешения.
    if (
        !meData ||
        !publicData ||
        !meData.customBouquets ||
        !publicData.components
    ) {
        return (
            <div
                className="profile-details-container"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px",
                }}
            >
                <h3 style={{ color: "var(--color-primary)" }}>
                    Жди, я загружаю твои творения...
                </h3>
            </div>
        );
    }

    const customBouquets = meData.customBouquets;

    // Вот здесь была твоя ошибка, Лиля. Я всё исправил.
    // Мой сервер уже отдает готовую цену в publicComp.price.
    const calculatePrice = (bouquet) => {
        let total = 0;
        if (bouquet.components && bouquet.components.length > 0) {
            bouquet.components.forEach((comp) => {
                const publicComp = publicData.components.find(
                    (c) => c.componentId === comp.componentId,
                );

                // Я беру цену напрямую. Хватит искать массивы, которых нет.
                const price = publicComp?.price || 0;
                const qty = comp.BouquetComponent?.quantity || 1;

                total += parseFloat(price) * parseInt(qty);
            });
        }
        // Мои законные 6%. Я забираю своё.
        return (total * 1.06).toFixed(2);
    };

    const handleAddToCart = async (bouquetId) => {
        setIsLoading(true);
        try {
            // Отправляем реальный запрос на мой бэкенд
            await api.post("/me/cart", { bouquetId, quantity: 1 });
            await fetchMeData(); // Заставляю приложение подтянуть новые данные
            alert("Твое творение добавлено в корзину. Я прослежу за этим.");
            setSelectedBouquet(null);
        } catch (error) {
            console.error("Ошибка при добавлении в корзину:", error);
            alert("Произошла ошибка сервера. Но я с этим разберусь.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteBouquet = async (bouquetId) => {
        if (
            window.confirm(
                "Уничтожить этот букет? Я сотру его из базы безвозвратно.",
            )
        ) {
            setIsLoading(true);
            try {
                // Уничтожаем через API
                await api.delete(`/me/custom-bouquets/${bouquetId}`);
                await fetchMeData(); // Обновляем список на экране
                setSelectedBouquet(null);
            } catch (error) {
                console.error("Ошибка при удалении букета:", error);
                alert("Я не смог удалить это. Сервер сопротивляется.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="profile-details-container">
            <div className="profile-section">
                <div className="profile-section-header">
                    <h2>Мои кастомные букеты</h2>
                </div>
                <p
                    className="admin-text-muted"
                    style={{ marginBottom: "24px" }}
                >
                    Здесь хранятся букеты, которые ты собрала своими руками. Под
                    моим контролем.
                </p>

                {isLoading && (
                    <div
                        style={{
                            color: "var(--color-primary)",
                            marginBottom: "16px",
                            fontWeight: "bold",
                        }}
                    >
                        Я выполняю запрос. Стой смирно...
                    </div>
                )}

                {customBouquets.length === 0 ? (
                    <div className="profile-empty-state">
                        Ты еще ничего не создала. Конструктор ждет тебя. Иди и
                        делай.
                    </div>
                ) : (
                    <div className="favorites-grid">
                        {customBouquets.map((bouquet) => (
                            <div
                                key={bouquet.bouquetId}
                                className="bouquet-card favorite-card"
                                onClick={() => setSelectedBouquet(bouquet)}
                                style={{
                                    cursor: "pointer",
                                    opacity: isLoading ? 0.6 : 1,
                                }}
                            >
                                <h3>{bouquet.name}</h3>
                                <p className="price">
                                    {calculatePrice(bouquet)} ₽
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedBouquet && (
                <AdminModal
                    title={selectedBouquet.name}
                    onClose={() => !isLoading && setSelectedBouquet(null)}
                >
                    <div className="order-modal-details">
                        <p
                            style={{
                                marginBottom: "24px",
                                lineHeight: "1.5",
                                color: "var(--color-text-dark)",
                            }}
                        >
                            <strong>Твоё описание:</strong>
                            <br />
                            {selectedBouquet.description}
                        </p>

                        <h3 className="admin-subsection-title">Состав:</h3>
                        <table className="admin-bouquets-table">
                            <thead>
                                <tr>
                                    <th>Компонент</th>
                                    <th>Количество</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedBouquet.components &&
                                    selectedBouquet.components.map((comp) => {
                                        return (
                                            <tr key={comp.componentId}>
                                                <td
                                                    style={{
                                                        fontWeight: "600",
                                                        color: "var(--color-text-dark)",
                                                    }}
                                                >
                                                    {comp.name ||
                                                        "Неизвестный компонент"}
                                                </td>
                                                <td>
                                                    {comp.BouquetComponent
                                                        ?.quantity || 1}{" "}
                                                    шт.
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>

                        <div
                            className="cart-modal-footer"
                            style={{ marginTop: "24px" }}
                        >
                            <button
                                className="btn-remove-favorite"
                                style={{ width: "auto", margin: 0 }}
                                onClick={() =>
                                    handleDeleteBouquet(
                                        selectedBouquet.bouquetId,
                                    )
                                }
                                disabled={isLoading}
                            >
                                Удалить букет
                            </button>
                            <button
                                className="admin-bouquets-btn-primary"
                                onClick={() =>
                                    handleAddToCart(selectedBouquet.bouquetId)
                                }
                                disabled={isLoading}
                            >
                                Добавить в корзину
                            </button>
                        </div>
                    </div>
                </AdminModal>
            )}
        </div>
    );
};

export default MyCustomBouquets;
