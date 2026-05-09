import React from "react";
import { useNavigate } from "react-router-dom";

// Вспомогательная функция для расчета цены букета
export const calculateBouquetPrice = (
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

const SmartCalendar = ({
    globalEvents,
    events,
    eventTypes,
    eventTypeTags,
    bouquets,
    bouquetTags,
    bouquetComponents,
    componentPrices,
    cartItems,
    setCartItems,
    components,
}) => {
    const currentUserStr = localStorage.getItem("currentUser");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    const navigate = useNavigate();

    const nearestEvent = globalEvents[0];
    const eventType = eventTypes.find(
        (et) => et.event_type_id === nearestEvent.event_type_id,
    );

    const relevantTagIds = eventTypeTags
        .filter((ett) => ett.event_type_id === nearestEvent.event_type_id)
        .map((ett) => ett.tag_id);

    // Жесткий фильтр Сильвера
    const recommendedBouquets = bouquets
        .filter((bq) => {
            // Отсекаем удаленные букеты
            if (bq.deleted_at) return false;

            // Отсекаем кастомные букеты
            if (bq.is_custom !== 0) return false;

            // Отсекаем букеты с удаленными компонентами
            const bComps = bouquetComponents.filter(
                (bc) => bc.bouquet_id === bq.bouquet_id,
            );
            const hasDeletedComponent = bComps.some((bc) => {
                const comp = components.find(
                    (c) => c.component_id === bc.component_id,
                );
                return comp && comp.deleted_at; // Если компонент удален, возвращаем true
            });
            if (hasDeletedComponent) return false;

            // Проверяем соответствие тегам
            const bTags = bouquetTags
                .filter((bt) => bt.bouquet_id === bq.bouquet_id)
                .map((bt) => bt.tag_id);
            return bTags.some((tag) => relevantTagIds.includes(tag));
        })
        .slice(0, 5); // Оставляем только топ 5

    const handleAddToCart = (bouquetId) => {
        if (!currentUser) {
            alert("Я требую, чтобы ты сначала авторизовалась.");
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
        alert("Букет жестко добавлен в корзину.");
    };

    return (
        <section className="smart-calendar-section">
            <div className="calendar-header">
                <h2>
                    Ближайший повод:{" "}
                    {nearestEvent ? nearestEvent.name : "Неизвестно"}
                </h2>
                <p>
                    Я подобрал это специально для{" "}
                    {eventType ? eventType.name : "этого дня"}. Не разочаруй
                    меня.
                </p>
            </div>

            <div className="calendar-carousel">
                {recommendedBouquets.map((bouquet) => (
                    <div
                        onClick={() => navigate(`/b/${bouquet.bouquet_id}`)}
                        key={bouquet.bouquet_id}
                        className="bouquet-card"
                    >
                        <img src={bouquet.image_url} alt={bouquet.name} />
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
                            onClick={() => handleAddToCart(bouquet.bouquet_id)}
                        >
                            В корзину
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default SmartCalendar;
