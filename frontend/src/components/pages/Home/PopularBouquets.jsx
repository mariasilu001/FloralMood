import React from "react";
import { calculateBouquetPrice } from "./SmartCalendar"; // Используем мою функцию

const PopularBouquets = ({ bouquets, bouquetComponents, componentPrices, cartItems, setCartItems }) => {
    const currentUserStr = localStorage.getItem("currentUser");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    // Фильтруем только не кастомные букеты 
    const standardBouquets = bouquets.filter(bq => bq.is_custom === 0);

    const handleAddToCart = (bouquetId) => {
        if (!currentUser) {
            alert("Авторизуйся. Я не позволю анонимам делать заказы.");
            return;
        }
        
        const newItem = {
            cart_item_id: cartItems.length > 0 ? Math.max(...cartItems.map(c => c.cart_item_id)) + 1 : 1,
            user_id: currentUser.userId,
            bouquet_id: bouquetId,
            quantity: 1,
            created_at: new Date().toISOString()
        };
        setCartItems([...cartItems, newItem]);
        alert("Букет в корзине. Отличный выбор.");
    };

    return (
        <section className="popular-bouquets-section">
            <h2>Каталог хитов</h2>
            <div className="grid">
                {standardBouquets.map(bouquet => (
                    <div key={bouquet.bouquet_id} className="bouquet-card">
                        <img src={bouquet.image_url || "https://i.pinimg.com/1200x/4c/fe/8f/4cfe8f22648e02856fabf623ce00334b.jpg"} alt={bouquet.name} />
                        <h3>{bouquet.name}</h3>
                        <p className="price">{calculateBouquetPrice(bouquet.bouquet_id, bouquetComponents, componentPrices)} ₽</p>
                        <button onClick={() => handleAddToCart(bouquet.bouquet_id)}>В корзину</button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PopularBouquets;