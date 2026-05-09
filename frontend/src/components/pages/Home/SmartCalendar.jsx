import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

const SmartCalendar = ({ nearestEvent, eventType, recommendedBouquets }) => {
    const navigate = useNavigate();

    const handleAddToCart = async (e, bouquetId) => {
        e.stopPropagation();
        try {
            await api.post("/me/cart", { bouquetId, quantity: 1 });
            alert("Букет жестко добавлен в корзину. Я доволен.");
        } catch (error) {
            alert("Сначала авторизуйся. Я не терплю анонимности.");
        }
    };

    // Если нет событий, я выведу тебе ультиматум.
    if (!nearestEvent) {
        return (
            <section className="smart-calendar-section">
                <div className="calendar-header">
                    <h2>Твой календарь девственно чист</h2>
                    <p>
                        Я не вижу дат, которые стоит помнить. Исправь это в
                        профиле. А пока — выбери цветы просто так. Я разрешаю.
                    </p>
                </div>
                <div className="calendar-carousel">
                    {recommendedBouquets.map((bouquet) => (
                        <div
                            onClick={() =>
                                navigate(
                                    `/b/${bouquet.bouquetId || bouquet.bouquet_id}`,
                                )
                            }
                            key={bouquet.bouquetId || bouquet.bouquet_id}
                            className="bouquet-card"
                        >
                            <img
                                src={
                                    bouquet.imageUrl || bouquet.image_url
                                        ? `http://localhost:5000/uploads/${bouquet.imageUrl || bouquet.image_url}`
                                        : "/default-bouquet.jpg"
                                }
                                alt={bouquet.name}
                            />
                            <h3>{bouquet.name}</h3>
                            <p className="price">{bouquet.price} ₽</p>
                            <button
                                onClick={(e) =>
                                    handleAddToCart(
                                        e,
                                        bouquet.bouquetId || bouquet.bouquet_id,
                                    )
                                }
                            >
                                В корзину
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="smart-calendar-section">
            <div className="calendar-header">
                <h2>Ближайший повод: {nearestEvent.name}</h2>
                <p>
                    Я подобрал это специально для{" "}
                    {eventType ? eventType.name : "этого дня"}. Не разочаруй
                    меня.
                </p>
            </div>

            <div className="calendar-carousel">
                {recommendedBouquets.map((bouquet) => (
                    <div
                        onClick={() =>
                            navigate(
                                `/b/${bouquet.bouquetId || bouquet.bouquet_id}`,
                            )
                        }
                        key={bouquet.bouquetId || bouquet.bouquet_id}
                        className="bouquet-card"
                    >
                        <img
                            src={
                                bouquet.imageUrl || bouquet.image_url
                                    ? `http://localhost:5000/uploads/${bouquet.imageUrl || bouquet.image_url}`
                                    : "https://i.pinimg.com/1200x/4c/fe/8f/4cfe8f22648e02856fabf623ce00334b.jpg"
                            }
                            alt={bouquet.name}
                        />
                        <h3>{bouquet.name}</h3>
                        <p className="price">{bouquet.price} ₽</p>
                        <button
                            onClick={(e) =>
                                handleAddToCart(
                                    e,
                                    bouquet.bouquetId || bouquet.bouquet_id,
                                )
                            }
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
