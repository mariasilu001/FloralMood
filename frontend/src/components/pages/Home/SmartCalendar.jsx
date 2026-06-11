import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { DBcontext } from "../../../Database";
import BouquetImage from "./BouquetImage";

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

const SmartCalendar = ({ closestEvent, recommendedBouquets }) => {
  const navigate = useNavigate();

  // Достаем users из нашей базы
  const { cartItems, setCartItems, users } = useContext(DBcontext);

  // Ждем, пока пропсы и база инициализируются
  if (!closestEvent || !users || !cartItems) return null;

  // Читаем сессию
  const userIdStr = localStorage.getItem("userId");
  const user = userIdStr
    ? users.find((u) => u._id === BigInt(userIdStr))
    : null;

  const day = closestEvent.fullDate.getDate();
  const monthIndex = closestEvent.fullDate.getMonth();
  const formattedDate = `${day} ${MONTHS[monthIndex]}`;

  const handleAddToCart = (e, bouquetId) => {
    e.stopPropagation();

    // Проверка авторизации
    if (!user) {
      alert("Чтобы добавить товар, необходимо войти в аккаунт");
      return navigate("/auth/login");
    }

    const maxId = cartItems.reduce(
      (max, item) => (item._id > max ? item._id : max),
      0n,
    );

    const newItem = {
      _id: maxId + 1n,
      user_id: user._id, // Уверенно берем BigInt _id
      bouquet_id: bouquetId,
      quantity: 1,
      created_at: new Date(),
    };

    setCartItems([...cartItems, newItem]);
    alert("Добавлено в твою корзину.");
  };

  return (
    <section className="smart-calendar-section">
      <div className="calendar-header">
        <h2>
          Ближайший повод: {closestEvent.name} ({formattedDate})
        </h2>
        <p>Я подобрал это специально для тебя</p>
      </div>

      <div className="calendar-carousel">
        {recommendedBouquets.length > 0 ? (
          recommendedBouquets.map((bouquet) => (
            <div
              key={bouquet._id}
              className="bouquet-card"
              onClick={() => navigate(`/bouquet/${bouquet._id}`)}
              style={{ cursor: "pointer" }}
            >
              <BouquetImage
                imageBlob={bouquet.image_url}
                altText={bouquet.name}
              />
              <h3>{bouquet.name}</h3>
              <p className="price">{bouquet.calculatedPrice} ₽</p>
              <button onClick={(e) => handleAddToCart(e, bouquet._id)}>
                В корзину
              </button>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", width: "100%", color: "#aaa" }}>
            Я не нашел букетов для этого события.
          </p>
        )}
      </div>
    </section>
  );
};

export default SmartCalendar;
