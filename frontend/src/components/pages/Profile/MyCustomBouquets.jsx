import React, { useState } from "react";
import AdminModal from "../../admin/AdminModal";
import { calculateBouquetPrice } from "../Home/SmartCalendar";

const MyCustomBouquets = ({
    bouquets,
    setBouquets,
    bouquetComponents,
    componentPrices,
    components,
    cartItems,
    setCartItems,
}) => {
    const currentUserStr = localStorage.getItem("currentUser");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
    const [selectedBouquet, setSelectedBouquet] = useState(null);

    if (!currentUser) return null;

    const customBouquets = bouquets.filter(
        (bq) => bq.is_custom === 1 && !bq.deleted_at,
    );

    const handleAddToCart = (bouquetId) => {
        const newItem = {
            cart_item_id:
                cartItems.length > 0
                    ? Math.max(...cartItems.map((c) => c.cart_item_id)) + 1
                    : 1,
            user_id: currentUser.userId,
            bouquet_id: bouquetId,
            quantity: 1,
            created_at: new Date().toISOString(),
        };
        setCartItems([...cartItems, newItem]);
        alert("Твое творение добавлено в корзину.");
        setSelectedBouquet(null);
    };

    const handleDeleteBouquet = (bouquetId) => {
        if (window.confirm("Уничтожить этот букет? Я сотру его из базы.")) {
            setBouquets((prev) =>
                prev.map((b) =>
                    b.bouquet_id === bouquetId
                        ? { ...b, deleted_at: new Date().toISOString() }
                        : b,
                ),
            );
            setSelectedBouquet(null);
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
                    Здесь хранятся букеты, которые ты собрала своими руками.
                </p>

                {customBouquets.length === 0 ? (
                    <div className="profile-empty-state">
                        Ты еще ничего не создала. Конструктор ждет тебя.
                    </div>
                ) : (
                    <div className="favorites-grid">
                        {customBouquets.map((bouquet) => (
                            <div
                                key={bouquet.bouquet_id}
                                className="bouquet-card favorite-card"
                                onClick={() => setSelectedBouquet(bouquet)}
                                style={{ cursor: "pointer" }}
                            >
                                <h3>{bouquet.name}</h3>
                                <p className="price">
                                    {calculateBouquetPrice(
                                        bouquet.bouquet_id,
                                        bouquetComponents,
                                        componentPrices,
                                    )}{" "}
                                    ₽
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedBouquet && (
                <AdminModal
                    title={selectedBouquet.name}
                    onClose={() => setSelectedBouquet(null)}
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
                                {bouquetComponents
                                    .filter(
                                        (bc) =>
                                            bc.bouquet_id ===
                                            selectedBouquet.bouquet_id,
                                    )
                                    .map((bc) => {
                                        const comp = components.find(
                                            (c) =>
                                                c.component_id ===
                                                bc.component_id,
                                        );
                                        return (
                                            <tr key={bc.bouquet_component_id}>
                                                <td
                                                    style={{
                                                        fontWeight: "600",
                                                        color: "var(--color-text-dark)",
                                                    }}
                                                >
                                                    {comp
                                                        ? comp.name
                                                        : "Удаленный компонент"}
                                                </td>
                                                <td>{bc.quantity} шт.</td>
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
                                        selectedBouquet.bouquet_id,
                                    )
                                }
                            >
                                Удалить букет
                            </button>
                            <button
                                className="admin-bouquets-btn-primary"
                                onClick={() =>
                                    handleAddToCart(selectedBouquet.bouquet_id)
                                }
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
