import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

const PopularBouquets = ({ bouquets }) => {
    const navigate = useNavigate();

    // Я исправил твою ошибку с нулем.
    const standardBouquets = bouquets.filter(
        (bq) =>
            !bq.deletedAt && !bq.deleted_at && !bq.isCustom && !bq.is_custom,
    );

    const handleAddToCart = async (e, bouquetId) => {
        e.stopPropagation();
        try {
            await api.post("/me/cart", { bouquetId, quantity: 1 });
            alert("Букет в корзине. Отличный выбор.");
        } catch (error) {
            alert("Авторизуйся. Я требую, чтобы ты представилась.");
        }
    };

    return (
        <section className="popular-bouquets-section">
            <h2>Весь наш каталог</h2>
            <div className="grid">
                {standardBouquets.length > 0 ? (
                    standardBouquets.map((bouquet) => (
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
                    ))
                ) : (
                    <p
                        style={{
                            color: "var(--color-text-muted)",
                            gridColumn: "1 / -1",
                            textAlign: "center",
                        }}
                    >
                        Я пока не вижу букетов. Но это временно. Я всё настрою.
                    </p>
                )}
            </div>
        </section>
    );
};

export default PopularBouquets;
