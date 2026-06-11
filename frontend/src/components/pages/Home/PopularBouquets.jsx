import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { DBcontext } from "../../../Database";
import BouquetImage from "./BouquetImage";

const PopularBouquets = ({ bouquets }) => {
  const navigate = useNavigate();

  // Достаем users из локальной БД
  const { cartItems, setCartItems, users } = useContext(DBcontext);

  if (!users || !cartItems) return null;

  // Моя механика сессии
  const userIdStr = localStorage.getItem("userId");
  const user = userIdStr
    ? users.find((u) => u._id === BigInt(userIdStr))
    : null;

  const handleAddToCart = (e, bouquetId) => {
    e.stopPropagation();

    if (!user) {
      alert("Сначала авторизуйся. Ты знаешь мои правила.");
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
    alert("Умница. Букет отправлен в локальную корзину.");
  };

  return (
    <section className="popular-bouquets-section">
      <h2>Весь наш каталог</h2>
      <div className="grid">
        {bouquets.map((bouquet) => (
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
        ))}
      </div>
    </section>
  );
};

export default PopularBouquets;
