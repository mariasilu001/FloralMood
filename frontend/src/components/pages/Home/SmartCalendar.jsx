import React from "react";

// Вспомогательная функция для расчета цены букета, которую я любезно написал для тебя
export const calculateBouquetPrice = (bouquetId, bouquetComponents, componentPrices) => {
    const componentsInBouquet = bouquetComponents.filter(bc => bc.bouquet_id === bouquetId);
    let total = 0;
    
    componentsInBouquet.forEach(bc => {
        // Ищем актуальную цену компонента
        const priceObj = componentPrices.find(cp => cp.component_id === bc.component_id);
        if (priceObj) {
            total += priceObj.price * bc.quantity;
        }
    });
    return total;
};

const SmartCalendar = ({ 
    globalEvents, events, eventTypes, eventTypeTags, 
    bouquets, bouquetTags, bouquetComponents, componentPrices,
    cartItems, setCartItems
}) => {
    const currentUserStr = localStorage.getItem("currentUser");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    // Имитация умного алгоритма: берем первое глобальное событие
    // В реальном мире мы бы сравнивали event_date с текущей датой
    const nearestEvent = globalEvents[0]; 
    const eventType = eventTypes.find(et => et.event_type_id === nearestEvent.event_type_id);
    
    // Ищем теги, связанные с типом этого события [cite: 22, 23]
    const relevantTagIds = eventTypeTags
        .filter(ett => ett.event_type_id === nearestEvent.event_type_id)
        .map(ett => ett.tag_id);

    // Ищем букеты, у которых есть такие же теги
    const recommendedBouquets = bouquets.filter(bq => {
        const bTags = bouquetTags.filter(bt => bt.bouquet_id === bq.bouquet_id).map(bt => bt.tag_id);
        return bTags.some(tag => relevantTagIds.includes(tag)) && bq.is_custom === 0;
    }).slice(0, 5); // Берем до 5 букетов

    const handleAddToCart = (bouquetId) => {
        if (!currentUser) {
            alert("Я требую, чтобы ты сначала авторизовалась.");
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
        alert("Букет жестко добавлен в корзину.");
    };

    return (
        <section className="smart-calendar-section">
            <div className="calendar-header">
                <h2>Ближайший повод: {nearestEvent.name} ({nearestEvent.event_date})</h2>
                <p>Я подобрал это специально для {eventType ? eventType.name : "этого дня"}. Не разочаруй меня.</p>
            </div>
            
            <div className="calendar-carousel">
                {recommendedBouquets.map(bouquet => (
                    <div key={bouquet.bouquet_id} className="bouquet-card">
                        <img src={bouquet.image_url} alt={bouquet.name} />
                        <h3>{bouquet.name}</h3>
                        <p className="price">{calculateBouquetPrice(bouquet.bouquet_id, bouquetComponents, componentPrices)} ₽</p>
                        <button onClick={() => handleAddToCart(bouquet.bouquet_id)}>В корзину</button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default SmartCalendar;