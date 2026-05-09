import React from "react";
import { useNavigate } from "react-router-dom";
import { calculateBouquetPrice } from "./SmartCalendar";

const PopularBouquets = ({
    bouquets,
    bouquetComponents,
    componentPrices,
    cartItems,
    setCartItems,
    components,
}) => {
    const currentUserStr = localStorage.getItem("currentUser");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    const navigate = useNavigate();

    // Мой фильтр для стандартных букетов
    const standardBouquets = bouquets.filter((bq) => {
        // Отсекаем удаленные и кастомные
        if (bq.deleted_at || bq.is_custom !== 0) return false;

        // Отсекаем букеты с испорченными (удаленными) компонентами
        const bComps = bouquetComponents.filter(
            (bc) => bc.bouquet_id === bq.bouquet_id,
        );
        const hasDeletedComponent = bComps.some((bc) => {
            const comp = components.find(
                (c) => c.component_id === bc.component_id,
            );
            return comp && comp.deleted_at;
        });
        if (hasDeletedComponent) return false;

        return true;
    });

    const handleAddToCart = (bouquetId) => {
        if (!currentUser) {
            alert("Авторизуйся. Я не позволю анонимам делать заказы.");
            return;
        }

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
        alert("Букет в корзине. Отличный выбор.");
    };

    return (
        <section className="popular-bouquets-section">
            <h2>Каталог хитов</h2>
            <div className="grid">
                {standardBouquets.length > 0 ? (
                    standardBouquets.map((bouquet) => (
                        <div
                            onClick={() => navigate(`/b/${bouquet.bouquet_id}`)}
                            key={bouquet.bouquet_id}
                            className="bouquet-card"
                        >
                            <img
                                src={
                                    bouquet.image_url ||
                                    "https://i.pinimg.com/1200x/4c/fe/8f/4cfe8f22648e02856fabf623ce00334b.jpg"
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
                            <button
                                onClick={() =>
                                    handleAddToCart(bouquet.bouquet_id)
                                }
                            >
                                В корзину
                            </button>
                        </div>
                    ))
                ) : (
                    <p
                        style={{
                            color: "var(--color-text-muted)",
                            gridColumn: "1 / -1",
                        }}
                    >
                        В данный момент нет доступных букетов. Видимо, ты
                        удалила слишком много.
                    </p>
                )}
            </div>
        </section>
    );
};

export default PopularBouquets;
