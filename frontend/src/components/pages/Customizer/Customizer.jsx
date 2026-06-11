import React, { useState, useMemo, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DBcontext } from "../../../Database"; // НАША локальная база
import "../../../styles/Customizer.css";
import AdminModal from "../../admin/AdminModal";
import BouquetImage from "../Home/BouquetImage";

const Customizer = () => {
  const navigate = useNavigate();

  // Достаем все необходимые таблицы (и обращаем внимание на ПРАВИЛЬНЫЕ имена!)
  const {
    componentCategories, // Вот оно! Не categories!
    components,
    componentPrices,
    bouquets,
    bouquetComponents,
    setBouquets,
    setBouquetComponents,
    users, // Достали пользователей для сессии
  } = useContext(DBcontext);

  // Локальные стейты
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [selectedComps, setSelectedComps] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bouquetName, setBouquetName] = useState("");
  const [bouquetDesc, setBouquetDesc] = useState("");

  // ==========================================
  // ХУКИ ДАННЫХ И СЕССИИ
  // ==========================================

  // Устанавливаем первую категорию по умолчанию
  useEffect(() => {
    if (
      componentCategories &&
      componentCategories.length > 0 &&
      !activeCategoryId
    ) {
      setActiveCategoryId(componentCategories[0]._id); // ID категории в формате BigInt
    }
  }, [componentCategories, activeCategoryId]);

  // Склеиваем компоненты с их актуальными ценами
  const componentsWithPrices = useMemo(() => {
    if (!components || !componentPrices) return [];

    return components.map((c) => {
      const prices = componentPrices.filter((cp) => cp.component_id === c._id);
      prices.sort((a, b) => b.start_date.getTime() - a.start_date.getTime());
      const price = prices.length > 0 ? prices[0].price : 0;
      return { ...c, price };
    });
  }, [components, componentPrices]);

  // Умный поиск похожих готовых букетов
  const matchedBouquets = useMemo(() => {
    if (!bouquets || !bouquetComponents) return [];

    const selectedIds = Object.keys(selectedComps).map((idStr) =>
      BigInt(idStr),
    );
    if (selectedIds.length === 0) return [];

    const publicBouquets = bouquets.filter((b) => b.is_custom === false);

    const scores = publicBouquets
      .map((bq) => {
        const bqComps = bouquetComponents.filter(
          (bc) => bc.bouquet_id === bq._id,
        );
        const bqCompIds = bqComps.map((bc) => bc.component_id);

        let matchCount = 0;
        bqCompIds.forEach((compId) => {
          if (selectedIds.includes(compId)) matchCount++;
        });

        return { ...bq, matchCount };
      })
      .filter((b) => b.matchCount > 0);

    return scores.sort((a, b) => b.matchCount - a.matchCount).slice(0, 4);
  }, [selectedComps, bouquets, bouquetComponents]);

  // ==========================================
  // ЗАГЛУШКА БЕЗОПАСНОСТИ
  // ==========================================
  if (
    !componentCategories ||
    !components ||
    !componentPrices ||
    !bouquets ||
    !bouquetComponents ||
    !users
  ) {
    return (
      <div
        className="layout-wrapper"
        style={{ padding: "50px", textAlign: "center", color: "#f26076" }}
      >
        <h2>Собираю флористический цех... Сильвер настраивает базу.</h2>
      </div>
    );
  }

  // ==========================================
  // ИДЕНТИФИКАЦИЯ ПОЛЬЗОВАТЕЛЯ (Локальная сессия)
  // ==========================================
  const userIdStr = localStorage.getItem("userId");
  const user = userIdStr
    ? users.find((u) => u._id === BigInt(userIdStr))
    : null;

  // ==========================================
  // ФУНКЦИИ УПРАВЛЕНИЯ
  // ==========================================

  const handleCheckboxToggle = (compId) => {
    const idStr = String(compId);
    setSelectedComps((prev) => {
      const newComps = { ...prev };
      if (newComps[idStr]) {
        delete newComps[idStr];
      } else {
        newComps[idStr] = 1;
      }
      return newComps;
    });
  };

  const handleQuantityChange = (compIdStr, delta) => {
    setSelectedComps((prev) => {
      const newComps = { ...prev };
      if (!newComps[compIdStr]) return prev;

      const newQty = newComps[compIdStr] + delta;
      if (newQty < 1) {
        delete newComps[compIdStr];
      } else {
        newComps[compIdStr] = newQty;
      }
      return newComps;
    });
  };

  const handleNext = () => {
    if (!user) {
      alert("Чтобы сохранить букет, нужно войти в аккаунт. Мои правила, Лили.");
      navigate("/login");
      return;
    }
    if (Object.keys(selectedComps).length === 0) {
      alert("Букет пустой. Выбери хотя бы один цветок.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleSaveBouquet = () => {
    if (!bouquetName.trim()) {
      alert("Дай букету имя.");
      return;
    }

    if (!bouquetDesc.trim()) {
      alert("Опиши букет.");
      return;
    }

    // Генерируем новый ID для букета (BigInt)
    const maxBouquetId = bouquets.reduce(
      (max, b) => (b._id > max ? b._id : max),
      0n,
    );
    const newBouquetId = maxBouquetId + 1n;

    // Создаем объект нового кастомного букета
    const newBouquet = {
      _id: newBouquetId,
      name: bouquetName.trim(),
      description: bouquetDesc.trim(),
      image_url: null, // У кастомных букетов пока нет фото
      created_at: new Date(),
      deleted_at: null,
      user_id: user._id, // Привязываем к нашему найденному юзеру
      is_custom: true,
    };

    // Создаем связи (состав букета)
    let maxBcId = bouquetComponents.reduce(
      (max, bc) => (bc._id > max ? bc._id : max),
      0n,
    );

    const newRelations = Object.entries(selectedComps).map(
      ([compIdStr, qty]) => {
        maxBcId += 1n;
        return {
          _id: maxBcId,
          bouquet_id: newBouquetId,
          component_id: BigInt(compIdStr),
          quantity: parseFloat(qty),
        };
      },
    );

    // Перезаписываем глобальные стейты базы данных!
    setBouquets([...bouquets, newBouquet]);
    setBouquetComponents([...bouquetComponents, ...newRelations]);

    setSelectedComps({});
    setBouquetName("");
    setBouquetDesc("");
    setIsModalOpen(false);

    alert("Умница. Твой кастомный букет сохранен в базу.");
    navigate("/");
  };

  // ==========================================
  // ПОДГОТОВКА ДАННЫХ ДЛЯ РЕНДЕРА
  // ==========================================

  const activeComponentsList = componentsWithPrices.filter(
    (c) => c.category_id === activeCategoryId,
  );

  const selectedComponentsList = componentsWithPrices.filter(
    (c) => !!selectedComps[String(c._id)],
  );

  const groupedSelectedComps = selectedComponentsList.reduce((acc, comp) => {
    const catIdStr = String(comp.category_id);
    if (!acc[catIdStr]) acc[catIdStr] = [];
    acc[catIdStr].push(comp);
    return acc;
  }, {});

  let totalBasePrice = 0;
  let totalSelectedCount = 0;

  selectedComponentsList.forEach((c) => {
    const qty = selectedComps[String(c._id)];
    totalBasePrice += c.price * qty;
    totalSelectedCount += qty;
  });

  const finalPrice = Math.round(totalBasePrice * 1.06);

  // ==========================================
  // РЕНДЕР
  // ==========================================
  return (
    <div className="layout-wrapper" style={{ padding: "24px 0" }}>
      <main className="main-content" style={{ margin: "0 auto" }}>
        <div className="customizer-wrapper">
          {/* ЛЕВАЯ ЧАСТЬ */}
          <div className="customizer-main-left">
            {/* Панель выбора компонентов */}
            <div className="customizer-components-panel">
              <div className="customizer-nav-menu">
                {componentCategories.map((cat) => (
                  <button
                    key={cat._id}
                    className={`customizer-nav-btn ${activeCategoryId === cat._id ? "active" : ""}`}
                    onClick={() => setActiveCategoryId(cat._id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="customizer-components-grid">
                {activeComponentsList.map((comp) => {
                  const isSelected = !!selectedComps[String(comp._id)];
                  return (
                    <label
                      key={comp._id}
                      className={`customizer-comp-card ${isSelected ? "selected" : ""}`}
                    >
                      <input
                        type="checkbox"
                        className="customizer-hidden-checkbox"
                        checked={isSelected}
                        onChange={() => handleCheckboxToggle(comp._id)}
                      />
                      <div className="customizer-comp-image">
                        <BouquetImage
                          imageBlob={comp.image_url}
                          altText={comp.name}
                        />
                      </div>
                      <div className="customizer-comp-info">
                        <span className="customizer-comp-name">
                          {comp.name}
                        </span>
                        <span className="customizer-comp-price">
                          {comp.price} ₽
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Панель похожих букетов */}
            <div className="customizer-matched-panel">
              <h3 className="customizer-panel-title">Похожие готовые букеты</h3>
              <div className="customizer-matched-grid">
                {matchedBouquets.length === 0 ? (
                  <p
                    className="customizer-empty-text"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    Начни выбирать цветы, чтобы я нашел совпадения.
                  </p>
                ) : (
                  matchedBouquets.map((bq) => (
                    <div
                      key={bq._id}
                      className="bouquet-card"
                      onClick={() => navigate(`/bouquet/${bq._id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <BouquetImage
                        imageBlob={bq.image_url}
                        altText={bq.name}
                      />
                      <h3>{bq.name}</h3>
                      <p className="customizer-match-hint">
                        Совпадений: {bq.matchCount}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ПРАВАЯ ЧАСТЬ */}
          <div className="customizer-main-right">
            <h3 className="customizer-panel-title">Выбранные компоненты</h3>
            <div className="customizer-selected-list">
              {Object.keys(groupedSelectedComps).length === 0 ? (
                <p className="customizer-empty-text">Выбери цветы слева.</p>
              ) : (
                Object.entries(groupedSelectedComps).map(
                  ([catIdStr, comps]) => {
                    const catName = componentCategories.find(
                      (c) => String(c._id) === catIdStr,
                    )?.name;

                    return (
                      <div
                        key={catIdStr}
                        className="customizer-selected-category"
                      >
                        <h4 className="customizer-cat-title">{catName}</h4>
                        <div className="customizer-cat-items">
                          {comps.map((c) => {
                            const idStr = String(c._id);
                            const qty = selectedComps[idStr];
                            return (
                              <div
                                key={c._id}
                                className="customizer-selected-item"
                              >
                                <span className="customizer-item-name">
                                  {c.name}
                                </span>
                                <div className="customizer-item-controls">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleQuantityChange(idStr, -1)
                                    }
                                  >
                                    -
                                  </button>
                                  <span className="customizer-item-qty">
                                    {qty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleQuantityChange(idStr, 1)
                                    }
                                  >
                                    +
                                  </button>
                                  <span className="customizer-item-price">
                                    {c.price * qty} ₽
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  },
                )
              )}
            </div>

            <div className="customizer-summary-box">
              <div className="customizer-summary-row">
                <span>Всего компонентов:</span>
                <strong>{totalSelectedCount} шт.</strong>
              </div>
              <div className="customizer-summary-row">
                <span>Наценка за сборку:</span>
                <strong>6%</strong>
              </div>
              <div className="customizer-summary-total">
                <span>Итоговая стоимость:</span>
                <span className="customizer-total-price">{finalPrice} ₽</span>
              </div>
              <button className="customizer-save-btn" onClick={handleNext}>
                Сохранить букет
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* МОДАЛКА ОФОРМЛЕНИЯ */}
      {isModalOpen && (
        <AdminModal
          title="Оформление твоей композиции"
          onClose={() => setIsModalOpen(false)}
        >
          <div className="admin-bouquets-form">
            <label>Название твоего букета:</label>
            <input
              type="text"
              value={bouquetName}
              onChange={(e) => setBouquetName(e.target.value)}
              placeholder="Дай ему имя..."
            />
            <label>Расскажи флористу, как должен выглядеть этот букет:</label>
            <textarea
              value={bouquetDesc}
              onChange={(e) => setBouquetDesc(e.target.value)}
              placeholder="Опиши форму, упаковку, акценты..."
              rows="5"
            />
            <button
              className="admin-bouquets-btn-primary"
              onClick={handleSaveBouquet}
              style={{ marginTop: "16px" }}
            >
              Сохранить
            </button>
          </div>
        </AdminModal>
      )}
    </div>
  );
};

export default Customizer;
