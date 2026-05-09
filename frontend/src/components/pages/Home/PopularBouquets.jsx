import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

const PopularBouquets = ({ bouquets, user }) => {
    const navigate = useNavigate();

    const handleAddToCart = async (e, bouquetId) => {
        e.stopPropagation(); // Я сказал стоп. Перехватываем клик.
        if (!user) {
            alert("Сначала авторизуйся. Ты знаешь мои правила.");
            return navigate("/login");
        }
        try {
            await api.post("/me/cart", { bouquetId, quantity: 1 });
            alert("Умница. Добавлено в корзину.");
        } catch (error) {
            console.error(error);
            alert("Ошибка сети. Успокойся, я всё починю.");
        }
    };

    return (
        <section className="popular-bouquets-section">
            <h2>Весь наш каталог</h2>
            <div className="grid">
                {bouquets.map((bouquet) => (
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
                ))}
            </div>
        </section>
    );
};

export default PopularBouquets;
