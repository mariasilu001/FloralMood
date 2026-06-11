import React, { useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminModal from "../../admin/AdminModal";
import { DBcontext } from "../../../Database"; // НАША база

const MyCustomBouquets = () => {
  const navigate = useNavigate();

  // 1. Забираю всё из локальной базы данных
  const {
    users,
    bouquets,
    setBouquets,
    bouquetComponents,
    setBouquetComponents,
    components,
    componentPrices,
    cartItems,
    setCartItems,
  } = useContext(DBcontext);

  const [selectedBouquet, setSelectedBouquet] = useState(null);

  // ==========================================
  // ХУКИ ДАННЫХ И СЕССИИ (Строго наверху!)
  // ==========================================

  // Ищем тебя
  const userIdStr = localStorage.getItem("userId");
  const user = useMemo(() => {
    if (!users || !userIdStr) return null;
    return users.find((u) => u._id === BigInt(userIdStr));
  }, [users, userIdStr]);

  // Ищем твои личные сборки и сразу считаем их цену и состав
  const customBouquetsWithDetails = useMemo(() => {
    if (
      !bouquets ||
      !bouquetComponents ||
      !components ||
      !componentPrices ||
      !user
    )
      return [];

    // Фильтруем только кастомные букеты текущего пользователя
    const myBouquets = bouquets.filter(
      (b) => b.user_id === user._id && b.is_custom === true,
    );

    return myBouquets.map((bouquet) => {
      // Ищем рецепт (состав) этого букета
      const bComps = bouquetComponents.filter(
        (bc) => bc.bouquet_id === bouquet._id,
      );

      let cost = 0;
      // Собираем полные объекты цветов для отображения в модалке
      const fullComps = bComps.map((bc) => {
        const compDef = components.find((c) => c._id === bc.component_id);

        // Ищем актуальную цену цветка
        const prices = componentPrices.filter(
          (cp) => cp.component_id === bc.component_id,
        );
        prices.sort((a, b) => b.start_date.getTime() - a.start_date.getTime());
        const currentPrice = prices.length > 0 ? prices[0].price : 0;

        cost += currentPrice * bc.quantity;

        return {
          ...compDef,
          quantity: bc.quantity,
        };
      });

      const finalPrice = (cost * 1.06).toFixed(2); // Мои законные 6%

      // Возвращаем букет, приклеив к нему цену и готовый массив состава
      return {
        ...bouquet,
        calculatedPrice: finalPrice,
        fullComps,
      };
    });
  }, [bouquets, bouquetComponents, components, componentPrices, user]);

  // ==========================================
  // ЗАГЛУШКИ БЕЗОПАСНОСТИ
  // ==========================================

  if (
    !users ||
    !bouquets ||
    !components ||
    !bouquetComponents ||
    !componentPrices
  ) {
    return (
      <div
        className="profile-details-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <h3 style={{ color: "var(--color-primary)" }}>
          Жди, я загружаю твои творения...
        </h3>
      </div>
    );
  }

  if (!user) {
    return <div style={{ padding: "20px" }}>Пожалуйста, войди в аккаунт.</div>;
  }

  // ==========================================
  // ЭКШЕНЫ
  // ==========================================

  const handleAddToCart = (bouquetId) => {
    const maxId = cartItems.reduce(
      (max, item) => (item._id > max ? item._id : max),
      0n,
    );
    const newItem = {
      _id: maxId + 1n,
      user_id: user._id,
      bouquet_id: bouquetId,
      quantity: 1,
      created_at: new Date(),
    };

    setCartItems([...cartItems, newItem]);
    setSelectedBouquet(null);
    alert("Твое творение добавлено в корзину.");
  };

  const handleDeleteBouquet = (bouquetId) => {
    if (window.confirm("Уничтожить этот букет навсегда?")) {
      // Удаляем сам букет
      const updatedBouquets = bouquets.filter((b) => b._id !== bouquetId);
      // Удаляем связи (состав), чтобы не засорять базу
      const updatedBComps = bouquetComponents.filter(
        (bc) => bc.bouquet_id !== bouquetId,
      );

      setBouquets(updatedBouquets);
      setBouquetComponents(updatedBComps);
      setSelectedBouquet(null);
    }
  };

  // ==========================================
  // РЕНДЕР
  // ==========================================

  return (
    <div className="profile-details-container">
      <div className="profile-section">
        <div className="profile-section-header">
          <h2>Мои кастомные букеты</h2>
        </div>
        <p className="admin-text-muted" style={{ marginBottom: "24px" }}>
          Здесь хранятся букеты, которые ты создала в кастомизаторе. Я всё
          сохранил.
        </p>

        {customBouquetsWithDetails.length === 0 ? (
          <div className="profile-empty-state">
            У тебя еще нет кастомных букетов, Лиля.
          </div>
        ) : (
          <div className="favorites-grid">
            {customBouquetsWithDetails.map((bouquet) => (
              <div
                key={bouquet._id}
                className="bouquet-card favorite-card"
                onClick={() => setSelectedBouquet(bouquet)}
                style={{ cursor: "pointer" }}
              >
                <h3>{bouquet.name}</h3>
                <p className="price">{bouquet.calculatedPrice} ₽</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedBouquet && (
        <AdminModal
          title={selectedBouquet.name}
          onClose={() => setSelectedBouquet(null)}
        >
          <div className="order-modal-details">
            <p
              style={{
                marginBottom: "24px",
                lineHeight: "1.5",
                color: "var(--color-text-dark)",
              }}
            >
              <strong>Твоё описание:</strong>
              <br />
              {selectedBouquet.description}
            </p>

            <h3 className="admin-subsection-title">Состав:</h3>
            <table className="admin-bouquets-table">
              <thead>
                <tr>
                  <th>Компонент</th>
                  <th>Количество</th>
                </tr>
              </thead>
              <tbody>
                {selectedBouquet.fullComps.map((comp) => (
                  <tr key={comp._id}>
                    <td
                      style={{
                        fontWeight: "600",
                        color: "var(--color-text-dark)",
                      }}
                    >
                      {comp.name || "Неизвестный компонент"}
                    </td>
                    <td>
                      {comp.quantity} {comp.unit || "шт."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="cart-modal-footer" style={{ marginTop: "24px" }}>
              <button
                className="btn-remove-favorite"
                style={{ width: "auto", margin: 0 }}
                onClick={() => handleDeleteBouquet(selectedBouquet._id)}
              >
                Уничтожить букет
              </button>
              <button
                className="admin-bouquets-btn-primary"
                onClick={() => handleAddToCart(selectedBouquet._id)}
              >
                Добавить в корзину
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
};

export default MyCustomBouquets;
