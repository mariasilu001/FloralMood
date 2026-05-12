import React, { useState, useMemo, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../App";
import api from "../../../api/axios";
import "../../../styles/Customizer.css";
import AdminModal from "../../admin/AdminModal";

const Customizer = () => {
    const navigate = useNavigate();

    const { user, publicData, fetchMeData } = useContext(AppContext);
    const { components, categories, bouquets } = publicData;

    // Установка первой категории по умолчанию
    const [activeCategoryId, setActiveCategoryId] = useState(null);
    useEffect(() => {
        if (categories.length > 0 && !activeCategoryId) {
            setActiveCategoryId(categories[0].categoryId);
        }
    }, [categories, activeCategoryId]);

    // Объект выбранных компонентов: { componentId: quantity }
    const [selectedComps, setSelectedComps] = useState({});

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bouquetName, setBouquetName] = useState("");
    const [bouquetDesc, setBouquetDesc] = useState("");

    // Мой жесткий контроль путей для изображений
    const getImageUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("http") || url.startsWith("data:")) return url;
        return `/uploads/${url}`;
    };

    const handleCheckboxToggle = (compId) => {
        setSelectedComps((prev) => {
            const newComps = { ...prev };
            if (newComps[compId]) {
                delete newComps[compId];
            } else {
                newComps[compId] = 1;
            }
            return newComps;
        });
    };

    const handleQuantityChange = (compId, delta) => {
        setSelectedComps((prev) => {
            const newComps = { ...prev };
            if (!newComps[compId]) return prev;

            const newQty = newComps[compId] + delta;
            if (newQty < 1) {
                delete newComps[compId];
            } else {
                newComps[compId] = newQty;
            }
            return newComps;
        });
    };

    // --- ФИЛЬТРАЦИЯ И СОРТИРОВКА ---

    const activeComponents = components.filter(
        (c) => c.categoryId === activeCategoryId,
    );

    const selectedComponentsList = components.filter(
        (c) => selectedComps[c.componentId] > 0,
    );

    const groupedSelectedComps = selectedComponentsList.reduce((acc, comp) => {
        if (!acc[comp.categoryId]) acc[comp.categoryId] = [];
        acc[comp.categoryId].push(comp);
        return acc;
    }, {});

    let totalBasePrice = 0;
    let totalSelectedCount = 0;

    selectedComponentsList.forEach((c) => {
        const qty = selectedComps[c.componentId];
        totalBasePrice += c.price * qty;
        totalSelectedCount += qty;
    });

    const finalPrice = Math.round(totalBasePrice * 1.06); // Мои 6%

    const matchedBouquets = useMemo(() => {
        const selectedIds = selectedComponentsList.map((c) => c.componentId);
        if (selectedIds.length === 0) return [];

        const scores = bouquets
            .map((bq) => {
                const bqComps = bq.components || [];
                let matchCount = 0;

                // Считаем пересечения
                bqComps.forEach((bc) => {
                    if (selectedIds.includes(bc.componentId)) matchCount++;
                });

                return { ...bq, matchCount };
            })
            .filter((b) => b.matchCount > 0);

        return scores.sort((a, b) => b.matchCount - a.matchCount).slice(0, 4);
    }, [selectedComps, bouquets, selectedComponentsList]);

    const handleNext = () => {
        if (!user) {
            alert("Чтобы сохранить букет нужно войти в аккаунт");
            navigate("/login");
            return;
        }
        if (totalSelectedCount === 0) {
            alert("Букет пустой");
            return;
        }
        setIsModalOpen(true);
    };

    const handleSaveBouquet = async () => {
        if (!bouquetName.trim()) {
            alert("Дай букету имя");
            return;
        }

        if (!bouquetDesc.trim()) {
            alert("Опиши букет");
            return;
        }

        // Формирую идеальный массив для моего бэкенда
        const componentsPayload = Object.entries(selectedComps).map(
            ([id, qty]) => ({
                componentId: parseInt(id),
                quantity: qty,
            }),
        );

        try {
            await api.post("/me/custom-bouquets", {
                name: bouquetName.trim(),
                description: bouquetDesc.trim(),
                components: componentsPayload,
            });

            fetchMeData();

            setSelectedComps({});
            setBouquetName("");
            setBouquetDesc("");
            setIsModalOpen(false);

            navigate("/profile/custom-bouquets");
        } catch (error) {
            console.error(error);
            alert("Произошла ошибка. ");
        }
    };

    return (
        <div className="layout-wrapper" style={{ padding: "24px 0" }}>
            <main className="main-content" style={{ margin: "0 auto" }}>
                <div className="customizer-wrapper">
                    {/* ЛЕВАЯ ЧАСТЬ */}
                    <div className="customizer-main-left">
                        {/* Панель выбора компонентов */}
                        <div className="customizer-components-panel">
                            <div className="customizer-nav-menu">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.categoryId}
                                        className={`customizer-nav-btn ${activeCategoryId === cat.categoryId ? "active" : ""}`}
                                        onClick={() =>
                                            setActiveCategoryId(cat.categoryId)
                                        }
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            <div className="customizer-components-grid">
                                {activeComponents.map((comp) => (
                                    <label
                                        key={comp.componentId}
                                        className={`customizer-comp-card ${selectedComps[comp.componentId] ? "selected" : ""}`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="customizer-hidden-checkbox"
                                            checked={
                                                !!selectedComps[
                                                    comp.componentId
                                                ]
                                            }
                                            onChange={() =>
                                                handleCheckboxToggle(
                                                    comp.componentId,
                                                )
                                            }
                                        />
                                        <div className="customizer-comp-image">
                                            {comp.imageUrl ? (
                                                <img
                                                    src={getImageUrl(
                                                        comp.imageUrl,
                                                    )}
                                                    alt={comp.name}
                                                />
                                            ) : (
                                                <span>Нет фото</span>
                                            )}
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
                                ))}
                            </div>
                        </div>

                        {/* Панель похожих букетов */}
                        <div className="customizer-matched-panel">
                            <h3 className="customizer-panel-title">
                                Похожие готовые букеты
                            </h3>
                            <div className="customizer-matched-grid">
                                {matchedBouquets.length === 0 ? (
                                    <p
                                        className="customizer-empty-text"
                                        style={{ gridColumn: "1 / -1" }}
                                    >
                                        Выбирай цветы
                                    </p>
                                ) : (
                                    matchedBouquets.map((bq) => (
                                        <div
                                            key={bq.bouquetId}
                                            className="bouquet-card"
                                            onClick={() =>
                                                navigate(
                                                    `/bouquet/${bq.bouquetId}`,
                                                )
                                            }
                                            style={{ cursor: "pointer" }}
                                        >
                                            <img
                                                src={getImageUrl(bq.imageUrl)}
                                                alt={bq.name}
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
                        <h3 className="customizer-panel-title">
                            Выбранные компоненты
                        </h3>
                        <div className="customizer-selected-list">
                            {Object.keys(groupedSelectedComps).length === 0 ? (
                                <p className="customizer-empty-text">
                                    Выбери цветы слева.
                                </p>
                            ) : (
                                Object.entries(groupedSelectedComps).map(
                                    ([catId, comps]) => {
                                        const catName = categories.find(
                                            (c) =>
                                                c.categoryId ===
                                                parseInt(catId),
                                        )?.name;
                                        return (
                                            <div
                                                key={catId}
                                                className="customizer-selected-category"
                                            >
                                                <h4 className="customizer-cat-title">
                                                    {catName}
                                                </h4>
                                                <div className="customizer-cat-items">
                                                    {comps.map((c) => (
                                                        <div
                                                            key={c.componentId}
                                                            className="customizer-selected-item"
                                                        >
                                                            <span className="customizer-item-name">
                                                                {c.name}
                                                            </span>
                                                            <div className="customizer-item-controls">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleQuantityChange(
                                                                            c.componentId,
                                                                            -1,
                                                                        )
                                                                    }
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="customizer-item-qty">
                                                                    {
                                                                        selectedComps[
                                                                            c
                                                                                .componentId
                                                                        ]
                                                                    }
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleQuantityChange(
                                                                            c.componentId,
                                                                            1,
                                                                        )
                                                                    }
                                                                >
                                                                    +
                                                                </button>
                                                                <span className="customizer-item-price">
                                                                    {c.price *
                                                                        selectedComps[
                                                                            c
                                                                                .componentId
                                                                        ]}{" "}
                                                                    ₽
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
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
                                <span className="customizer-total-price">
                                    {finalPrice} ₽
                                </span>
                            </div>
                            <button
                                className="customizer-save-btn"
                                onClick={handleNext}
                            >
                                Сохранить букет
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* МОЯ МОДАЛКА */}
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
                        <label>
                            Расскажи флористу, как должен выглядеть этот букет:
                        </label>
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
