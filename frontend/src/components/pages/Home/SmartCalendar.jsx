import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

const MONTHS = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
];

const SmartCalendar = ({ closestEvent, recommendedBouquets, user }) => {
    const navigate = useNavigate();

    // Если у нас вообще нет событий, я просто спрячу эту секцию.
    if (!closestEvent) return null;

    const [m, d] = closestEvent.eventDate.split("-");
    const formattedDate = `${parseInt(d, 10)} ${MONTHS[parseInt(m, 10) - 1]}`;

    const handleAddToCart = async (e, bouquetId) => {
        e.stopPropagation(); // Стой. Никаких переходов на другую страницу.
        if (!user) {
            alert(
                "Сначала войди в систему, Лили. Я не позволю тебе делать покупки инкогнито.",
            );
            return navigate("/login");
        }
        try {
            await api.post("/me/cart", { bouquetId, quantity: 1 });
            alert("Молодец. Я положил этот букет в твою корзину.");
        } catch (error) {
            console.error(error);
            alert(
                "Что-то пошло не так. Не дергайся, я позже разберусь с этим.",
            );
        }
    };

    return (
        <section className="smart-calendar-section">
            <div className="calendar-header">
                <h2>
                    Ближайший повод: {closestEvent.name} ({formattedDate})
                </h2>
                <p>Я подобрал это специально для тебя. Не разочаруй меня.</p>
            </div>

            <div className="calendar-carousel">
                {recommendedBouquets.length > 0 ? (
                    recommendedBouquets.map((bouquet) => (
                        <div
                            key={bouquet.bouquetId}
                            className="bouquet-card"
                            onClick={() =>
                                navigate(`/bouquet/${bouquet.bouquetId}`)
                            }
                            style={{ cursor: "pointer" }}
                        >
                            <img
                                src={
                                    bouquet.imageUrl ||
                                    "https://i.pinimg.com/1200x/4c/fe/8f/4cfe8f22648e02856fabf623ce00334b.jpg"
                                }
                                alt={bouquet.name}
                            />
                            <h3>{bouquet.name}</h3>
                            <p className="price">{bouquet.calculatedPrice} ₽</p>
                            <button
                                onClick={(e) =>
                                    handleAddToCart(e, bouquet.bouquetId)
                                }
                            >
                                В корзину
                            </button>
                        </div>
                    ))
                ) : (
                    <p
                        style={{
                            textAlign: "center",
                            width: "100%",
                            color: "#aaa",
                        }}
                    >
                        Я не нашел букетов для этого события. Мое упущение. Я
                        исправлю каталог позже.
                    </p>
                )}
            </div>
        </section>
    );
};

export default SmartCalendar;
