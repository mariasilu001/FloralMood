import React, { useState, useMemo, useContext } from "react";
import { DBcontext } from "../../../Database"; // НАША автономная локальная база данных
import BouquetImage from "../Home/BouquetImage"; // Наш безопасный рендерер Blob-картинок

const MyFavorites = () => {
  // 1. Извлекаем нужные таблицы и функцию обновления из локального контекста базы данных
  const { users, favorites, setFavorites, bouquets } = useContext(DBcontext);
  const [isLoading, setIsLoading] = useState(false);

  // ==========================================
  // ХУКИ ДАННЫХ И СЕССИИ (Строго на самом верху!)
  // ==========================================

  // Восстанавливаем локальную сессию пользователя
  const userIdStr = localStorage.getItem("userId");

  const user = useMemo(() => {
    if (!users || !userIdStr) return null;
    return users.find((u) => u._id === BigInt(userIdStr));
  }, [users, userIdStr]);

  // МОЩНЫЙ РЕЛЯЦИОННЫЙ СБОРДАННЫХ (Склеиваем избранное с таблицей букетов)
  const myFavoritesWithBouquets = useMemo(() => {
    // Если таблицы еще не загрузились из IndexedDB или сессии нет — отдаем пустой массив
    if (!favorites || !bouquets || !user) return [];

    // Фильтруем таблицу связей избранного, оставляя только строчки текущего пользователя
    const userFavRelations = favorites.filter((f) => f.user_id === user._id);

    // Для каждой связи находим полноценный объект букета из таблицы bouquets
    return userFavRelations.map((fav) => {
      const linkedBouquet = bouquets.find((b) => b._id === fav.bouquet_id);

      // Возвращаем трансформированный объект, адаптированный под твою вёрстку
      return {
        favoriteId: String(fav._id), // ЖЕСТКАЯ ЗАЩИТА: конвертируем BigInt в String для key
        bouquetId: linkedBouquet ? String(linkedBouquet._id) : "", // Конвертируем ID букета
        name: linkedBouquet ? linkedBouquet.name : "Неизвестный букет",
        description: linkedBouquet
          ? linkedBouquet.description
          : "Описание отсутствует.",
        image_url: linkedBouquet ? linkedBouquet.image_url : null, // Передаем сырой Blob наружу
      };
    });
  }, [favorites, bouquets, user]);

  // ==========================================
  // ЗАГЛУШКИ БЕЗОПАСНОСТИ РЕНДЕРА (После всех хуков!)
  // ==========================================
  if (!users || !favorites || !bouquets) {
    return (
      <div
        className="profile-details-container"
        style={{ textAlign: "center", padding: "50px" }}
      >
        <h3 style={{ color: "var(--color-primary)" }}>
          Синхронизирую твою секретную оранжерею...
        </h3>
      </div>
    );
  }

  if (!user) return null; // Если сессии нет, Layout сам перенаправит на /login

  // ==========================================
  // ФУНКЦИИ УПРАВЛЕНИЯ ЛОКАЛЬНЫМИ ДАННЫМИ (ЭКШЕНЫ)
  // ==========================================

  const handleRemoveFavorite = (bIdStr) => {
    // Превращаем строковый ID букета обратно в BigInt для точного удаления из базы
    const targetBouquetId = BigInt(bIdStr);

    // Фильтруем массив: оставляем только те записи, которые НЕ принадлежат текущему совпадению
    const updatedFavorites = favorites.filter(
      (f) => !(f.user_id === user._id && f.bouquet_id === targetBouquetId),
    );

    // Перезаписываем стейт базы данных, триггеря фоновый useEffect для сохранения в IndexedDB
    setFavorites(updatedFavorites);
  };

  return (
    <div className="profile-details-container">
      <div className="profile-section">
        <div className="profile-section-header">
          <h2>Избранное</h2>
        </div>
        <p className="admin-text-muted" style={{ marginBottom: "24px" }}>
          Тут хранятся букеты, которые вам понравились. Я оберегаю их для тебя.
        </p>

        {myFavoritesWithBouquets.length === 0 ? (
          <div className="profile-empty-state">
            У тебя ни одного избранного букета, Лиля.
          </div>
        ) : (
          <div
            className="favorites-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "24px",
            }}
          >
            {myFavoritesWithBouquets.map((fav) => (
              <div
                key={fav.favoriteId}
                className="bouquet-card"
                style={{
                  opacity: isLoading ? 0.6 : 1,
                  position: "relative",
                  border: "1px solid #eee",
                  borderRadius: "12px",
                  overflow: "hidden",
                  transition: "transform 0.3s",
                }}
              >
                <div
                  style={{ width: "100%", height: "220px", display: "flex" }}
                >
                  {/* НАШ БЕЗОПАСНЫЙ РЕНДЕРЕР КАРТИНОК ИЗ BLOB/FILE */}
                  <BouquetImage imageBlob={fav.image_url} altText={fav.name} />
                </div>
                <div className="bouquet-info" style={{ padding: "16px" }}>
                  <h3
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "18px",
                    }}
                  >
                    {fav.name}
                  </h3>
                  <p
                    className="admin-text-muted"
                    style={{
                      fontSize: "14px",
                      marginBottom: "16px",
                      height: "40px",
                      overflow: "hidden",
                    }}
                  >
                    {fav.description}
                  </p>
                  <button
                    className="profile-btn-outline"
                    onClick={() => handleRemoveFavorite(fav.bouquetId)}
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "10px",
                      cursor: "pointer",
                      backgroundColor: "transparent",
                      border: "1px solid var(--color-primary)",
                      color: "var(--color-primary)",
                      borderRadius: "8px",
                    }}
                  >
                    Убрать из списка
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFavorites;
