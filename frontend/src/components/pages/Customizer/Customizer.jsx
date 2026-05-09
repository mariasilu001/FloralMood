import React, { useState, useMemo } from "react";
import "../../../styles/Customizer.css";
import Header from "../../layout/Header";
import AdminModal from "../../admin/AdminModal";

const Customizer = ({
    componentCategories = [],
    components = [],
    componentPrices = [],
    bouquets = [],
    bouquetComponents = [],
    setBouquets,
    setBouquetComponents,
    users = [],
    searchHistory = [],
    setSearchHistory,
}) => {
    const [activeCategoryId, setActiveCategoryId] = useState(
        componentCategories.length > 0
            ? componentCategories[0].category_id
            : null,
    );

    const [selectedComps, setSelectedComps] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bouquetName, setBouquetName] = useState("");
    const [bouquetDesc, setBouquetDesc] = useState("");

    const getCurrentPrice = (compId) => {
        const prices = componentPrices.filter((p) => p.component_id === compId);
        if (prices.length === 0) return 0;
        return prices[prices.length - 1].price;
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

    const activeComponents = components.filter(
        (c) => c.category_id === activeCategoryId && !c.deleted_at,
    );

    const selectedComponentsList = components.filter(
        (c) => selectedComps[c.component_id] > 0,
    );

    const groupedSelectedComps = selectedComponentsList.reduce((acc, comp) => {
        if (!acc[comp.category_id]) acc[comp.category_id] = [];
        acc[comp.category_id].push(comp);
        return acc;
    }, {});

    let totalBasePrice = 0;
    let totalSelectedCount = 0;

    selectedComponentsList.forEach((c) => {
        const qty = selectedComps[c.component_id];
        totalBasePrice += getCurrentPrice(c.component_id) * qty;
        totalSelectedCount += qty;
    });

    const finalPrice = Math.round(totalBasePrice * 1.06);

    const matchedBouquets = useMemo(() => {
        const selectedIds = selectedComponentsList.map((c) => c.component_id);
        if (selectedIds.length === 0) return [];

        const scores = bouquets
            .map((bq) => {
                if (bq.is_custom !== 0 || bq.deleted_at) return null;

                const bqComps = bouquetComponents.filter(
                    (bc) => bc.bouquet_id === bq.bouquet_id,
                );
                let matchCount = 0;

                bqComps.forEach((bc) => {
                    if (selectedIds.includes(bc.component_id)) matchCount++;
                });

                return { ...bq, matchCount };
            })
            .filter(Boolean);

        return scores
            .sort((a, b) => b.matchCount - a.matchCount)
            .filter((b) => b.matchCount > 0)
            .slice(0, 4);
    }, [selectedComps, bouquets, bouquetComponents, selectedComponentsList]);

    const handleNext = () => {
        if (totalSelectedCount === 0) {
            alert(
                "Ты не выбрала ни одного компонента. Я не позволю тебе идти дальше с пустыми руками, Лиля.",
            );
            return;
        }
        setIsModalOpen(true);
    };

    const handleSaveBouquet = () => {
        if (!bouquetName.trim()) {
            alert("Дай букету имя, Лиля. Я не терплю безымянных вещей.");
            return;
        }

        if (!bouquetDesc.trim()) {
            alert("Опиши букет. Я же сказал, флористу нужны твои указания.");
            return;
        }

        const newBouquetId =
            bouquets.length > 0
                ? Math.max(...bouquets.map((b) => b.bouquet_id)) + 1
                : 1;

        const customBouquet = {
            bouquet_id: newBouquetId,
            name: bouquetName.trim(),
            description: bouquetDesc,
            image_url: "",
            created_at: new Date().toISOString(),
            deleted_at: null,
            is_custom: 1,
        };

        const newComponents = selectedComponentsList.map((comp, index) => {
            const newBcId =
                bouquetComponents.length > 0
                    ? Math.max(
                          ...bouquetComponents.map(
                              (bc) => bc.bouquet_component_id,
                          ),
                      ) +
                      1 +
                      index
                    : 1 + index;

            return {
                bouquet_component_id: newBcId,
                component_id: comp.component_id,
                bouquet_id: newBouquetId,
                quantity: selectedComps[comp.component_id],
            };
        });

        setBouquets([...bouquets, customBouquet]);
        setBouquetComponents([...bouquetComponents, ...newComponents]);

        setSelectedComps({});
        setBouquetName("");
        setBouquetDesc("");
        setIsModalOpen(false);
        alert("Букет жестко зафиксирован в базе. Твоя работа выполнена.");
    };

    return (
        <div className="layout-wrapper">
            <Header
                users={users}
                searchHistory={searchHistory}
                setSearchHistory={setSearchHistory}
            />
            <main className="main-content">
                <div className="customizer-wrapper">
                    <div className="customizer-main-left">
                        <div className="customizer-components-panel">
                            <div className="customizer-nav-menu">
                                {componentCategories.map((cat) => (
                                    <button
                                        key={cat.category_id}
                                        className={`customizer-nav-btn ${activeCategoryId === cat.category_id ? "active" : ""}`}
                                        onClick={() =>
                                            setActiveCategoryId(cat.category_id)
                                        }
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            <div className="customizer-components-grid">
                                {activeComponents.map((comp) => (
                                    <label
                                        key={comp.component_id}
                                        className={`customizer-comp-card ${selectedComps[comp.component_id] ? "selected" : ""}`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="customizer-hidden-checkbox"
                                            checked={
                                                !!selectedComps[
                                                    comp.component_id
                                                ]
                                            }
                                            onChange={() =>
                                                handleCheckboxToggle(
                                                    comp.component_id,
                                                )
                                            }
                                        />
                                        <div className="customizer-comp-image">
                                            {comp.image_url ? (
                                                <img
                                                    src={comp.image_url}
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
                                                {getCurrentPrice(
                                                    comp.component_id,
                                                )}{" "}
                                                ₽
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="customizer-matched-panel">
                            <h3 className="customizer-panel-title">
                                Похожие готовые букеты из базы
                            </h3>
                            <div className="customizer-matched-grid">
                                {matchedBouquets.length === 0 ? (
                                    <p
                                        className="customizer-empty-text"
                                        style={{ gridColumn: "1 / -1" }}
                                    >
                                        Пока ты ничего не выбрала или я не нашел
                                        совпадений в базе.
                                    </p>
                                ) : (
                                    matchedBouquets.map((bq) => (
                                        <div
                                            key={bq.bouquet_id}
                                            className="bouquet-card"
                                        >
                                            <img
                                                src={bq.image_url}
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

                    <div className="customizer-main-right">
                        <h3 className="customizer-panel-title">Твой выбор</h3>
                        <div className="customizer-selected-list">
                            {Object.keys(groupedSelectedComps).length === 0 ? (
                                <p className="customizer-empty-text">
                                    Выбери цветы слева. Не заставляй меня ждать.
                                </p>
                            ) : (
                                Object.entries(groupedSelectedComps).map(
                                    ([catId, comps]) => {
                                        const catName =
                                            componentCategories.find(
                                                (c) =>
                                                    c.category_id ===
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
                                                            key={c.component_id}
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
                                                                            c.component_id,
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
                                                                                .component_id
                                                                        ]
                                                                    }
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleQuantityChange(
                                                                            c.component_id,
                                                                            1,
                                                                        )
                                                                    }
                                                                >
                                                                    +
                                                                </button>
                                                                <span className="customizer-item-price">
                                                                    {getCurrentPrice(
                                                                        c.component_id,
                                                                    ) *
                                                                        selectedComps[
                                                                            c
                                                                                .component_id
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
                                Далее
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {isModalOpen && (
                <AdminModal
                    title="Оформление композиции"
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
                            placeholder="Опиши форму, упаковку, акценты... Я хочу знать всё."
                            rows="5"
                        />
                        <button
                            className="admin-bouquets-btn-primary"
                            onClick={handleSaveBouquet}
                            style={{ marginTop: "16px" }}
                        >
                            Сохранить мой букет
                        </button>
                    </div>
                </AdminModal>
            )}
        </div>
    );
};

export default Customizer;
