import React, { useState, useEffect } from "react";
import AdminModal from "../../admin/AdminModal";
import { calculateBouquetPrice } from "../Home/SmartCalendar";

const AdminBouquets = ({
    bouquets,
    setBouquets,
    components,
    componentPrices,
    bouquetComponents,
    setBouquetComponents,
    tags = [],
    bouquetTags = [],
    setBouquetTags,
}) => {
    const [selectedBouquet, setSelectedBouquet] = useState(null);
    const [isAddBouquetOpen, setIsAddBouquetOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(null);
    const [isAddTagOpen, setIsAddTagOpen] = useState(false);

    // Моя универсальная модалка для компонентов
    const [isCompModalOpen, setIsCompModalOpen] = useState(false);
    const [compModalTarget, setCompModalTarget] = useState(null); // 'new' или bouquet_id
    const [tempSelections, setTempSelections] = useState({}); // { component_id: quantity }

    // Стейт для формы нового букета
    const [newBouquet, setNewBouquet] = useState({
        name: "",
        description: "",
        image_url: "",
        is_custom: 0,
        selectedComponents: {},
    });

    const [editDesc, setEditDesc] = useState("");
    const [addTagId, setAddTagId] = useState("");

    useEffect(() => {
        if (selectedBouquet) {
            setEditDesc(selectedBouquet.description || "");
        }
    }, [selectedBouquet]);

    const toggleDeleteStatus = (bouquetId) => {
        setBouquets((prev) =>
            prev.map((b) =>
                b.bouquet_id === bouquetId
                    ? {
                          ...b,
                          deleted_at: b.deleted_at
                              ? null
                              : new Date().toISOString(),
                      }
                    : b,
            ),
        );
    };

    const confirmDeleteBouquet = () => {
        setBouquets((prev) =>
            prev.filter((b) => b.bouquet_id !== isConfirmDeleteOpen),
        );
        setIsConfirmDeleteOpen(null);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewBouquet((prev) => ({
                    ...prev,
                    image_url: reader.result,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddBouquet = (e) => {
        e.preventDefault();
        if (!newBouquet.name) {
            alert(
                "Имя букета обязательно, Лили. Хватит испытывать мое терпение.",
            );
            return;
        }

        const newBouquetId =
            bouquets.length > 0
                ? Math.max(...bouquets.map((b) => b.bouquet_id)) + 1
                : 1;

        const bouquetToAdd = {
            bouquet_id: newBouquetId,
            name: newBouquet.name,
            description: newBouquet.description,
            image_url: newBouquet.image_url,
            created_at: new Date().toISOString(),
            deleted_at: null,
            is_custom: newBouquet.is_custom,
        };

        setBouquets([...bouquets, bouquetToAdd]);

        const newComponents = Object.entries(newBouquet.selectedComponents).map(
            ([compId, qty], index) => ({
                bouquet_component_id:
                    bouquetComponents.length > 0
                        ? Math.max(
                              ...bouquetComponents.map(
                                  (bc) => bc.bouquet_component_id,
                              ),
                          ) +
                          1 +
                          index
                        : 1 + index,
                component_id: parseInt(compId),
                bouquet_id: newBouquetId,
                quantity: parseFloat(qty),
            }),
        );

        if (newComponents.length > 0) {
            setBouquetComponents((prev) => [...prev, ...newComponents]);
        }

        setIsAddBouquetOpen(false);
        setNewBouquet({
            name: "",
            description: "",
            image_url: "",
            is_custom: 0,
            selectedComponents: {},
        });
    };

    const handleSaveDescription = () => {
        setBouquets((prev) =>
            prev.map((b) =>
                b.bouquet_id === selectedBouquet.bouquet_id
                    ? { ...b, description: editDesc }
                    : b,
            ),
        );
        setSelectedBouquet((prev) => ({ ...prev, description: editDesc }));
        alert("Описание подчинилось моей воле и было сохранено.");
    };

    const removeComponentFromBouquet = (bouquetComponentId) => {
        setBouquetComponents((prev) =>
            prev.filter((bc) => bc.bouquet_component_id !== bouquetComponentId),
        );
    };

    const removeTagFromBouquet = (bouquetTagId) => {
        setBouquetTags((prev) =>
            prev.filter((bt) => bt.bouquet_tag_id !== bouquetTagId),
        );
    };

    const handleAddTagToExisting = () => {
        if (!addTagId) return;
        if (
            bouquetTags.some(
                (bt) =>
                    bt.bouquet_id === selectedBouquet.bouquet_id &&
                    bt.tag_id === parseInt(addTagId),
            )
        ) {
            alert("Этот тег уже привязан. Я не позволю дублировать данные.");
            return;
        }

        const newBtId =
            bouquetTags.length > 0
                ? Math.max(...bouquetTags.map((bt) => bt.bouquet_tag_id)) + 1
                : 1;
        if (setBouquetTags) {
            setBouquetTags([
                ...bouquetTags,
                {
                    bouquet_tag_id: newBtId,
                    bouquet_id: selectedBouquet.bouquet_id,
                    tag_id: parseInt(addTagId),
                },
            ]);
        }
        setIsAddTagOpen(false);
        setAddTagId("");
    };

    // ==========================================
    // ЖЕСТКАЯ ЛОГИКА МАССОВОГО ВЫБОРА КОМПОНЕНТОВ
    // ==========================================
    const openCompModal = (target) => {
        setCompModalTarget(target);
        if (target === "new") {
            setTempSelections({ ...newBouquet.selectedComponents });
        } else {
            // Я заставил код подтягивать текущие компоненты букета.
            const currentComps = bouquetComponents.filter(
                (bc) => bc.bouquet_id === target,
            );
            const selections = {};
            currentComps.forEach((bc) => {
                selections[bc.component_id] = bc.quantity;
            });
            setTempSelections(selections);
        }
        setIsCompModalOpen(true);
    };

    const handleCompSelectionToggle = (compId, isChecked) => {
        setTempSelections((prev) => {
            const updated = { ...prev };
            if (isChecked) {
                updated[compId] = 1;
            } else {
                delete updated[compId];
            }
            return updated;
        });
    };

    const handleCompQtyChange = (compId, qty) => {
        setTempSelections((prev) => {
            if (!prev[compId] && qty > 0) return prev;
            return { ...prev, [compId]: qty };
        });
    };

    const saveCompSelections = () => {
        if (compModalTarget === "new") {
            setNewBouquet((prev) => ({
                ...prev,
                selectedComponents: tempSelections,
            }));
        } else {
            // Я забираю все компоненты от других букетов, чтобы не трогать их
            const otherBcs = bouquetComponents.filter(
                (bc) => bc.bouquet_id !== compModalTarget,
            );

            let maxId =
                bouquetComponents.length > 0
                    ? Math.max(
                          ...bouquetComponents.map(
                              (bc) => bc.bouquet_component_id,
                          ),
                      )
                    : 0;
            const updatedCurrentBcs = [];

            // Безжалостно перезаписываем связи для текущего букета
            Object.entries(tempSelections).forEach(([compIdStr, qty]) => {
                const compId = parseInt(compIdStr);
                const quantity = parseFloat(qty);

                if (quantity > 0) {
                    const existingBc = bouquetComponents.find(
                        (bc) =>
                            bc.bouquet_id === compModalTarget &&
                            bc.component_id === compId,
                    );

                    if (existingBc) {
                        // Обновляем количество, если компонент уже был
                        updatedCurrentBcs.push({ ...existingBc, quantity });
                    } else {
                        // Создаем новую связь
                        maxId++;
                        updatedCurrentBcs.push({
                            bouquet_component_id: maxId,
                            component_id: compId,
                            bouquet_id: compModalTarget,
                            quantity: quantity,
                        });
                    }
                }
            });

            // Жестко склеиваем чужие компоненты с нашими обновленными
            setBouquetComponents([...otherBcs, ...updatedCurrentBcs]);
        }
        setIsCompModalOpen(false);
    };

    return (
        <div className="admin-bouquets-container">
            <div className="admin-bouquets-header">
                <h2>База Букетов</h2>
                <button
                    className="admin-bouquets-btn-primary"
                    onClick={() => setIsAddBouquetOpen(true)}
                >
                    Создать новый букет
                </button>
            </div>

            <table className="admin-bouquets-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Изображение</th>
                        <th>Название</th>
                        <th>Тип</th>
                        <th>Удален</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {bouquets.map((b) => (
                        <tr
                            key={b.bouquet_id}
                            className={
                                b.deleted_at ? "admin-bouquets-row-deleted" : ""
                            }
                        >
                            <td>{b.bouquet_id}</td>
                            <td>
                                {b.image_url ? (
                                    <img
                                        src={b.image_url}
                                        alt="img"
                                        className="admin-bouquets-preview"
                                    />
                                ) : (
                                    "Нет фото"
                                )}
                            </td>
                            <td
                                className="admin-bouquets-cell-clickable"
                                onClick={() => setSelectedBouquet(b)}
                            >
                                {b.name}
                            </td>
                            <td>{b.is_custom ? "Кастомный" : "Стандарт"}</td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={!!b.deleted_at}
                                    onChange={() =>
                                        toggleDeleteStatus(b.bouquet_id)
                                    }
                                />
                            </td>
                            <td>
                                <button
                                    className="admin-bouquets-btn-delete"
                                    onClick={() =>
                                        setIsConfirmDeleteOpen(b.bouquet_id)
                                    }
                                >
                                    Удалить
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* МОДАЛКА: Детали букета */}
            {selectedBouquet && (
                <AdminModal
                    title={`Детали: ${selectedBouquet.name}`}
                    onClose={() => setSelectedBouquet(null)}
                >
                    <div className="admin-desc-edit-group">
                        <label>Описание букета:</label>
                        <div className="admin-desc-edit-wrapper">
                            <textarea
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                            />
                            <button
                                className="admin-bouquets-btn-primary"
                                onClick={handleSaveDescription}
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>

                    <div className="admin-bouquets-modal-controls">
                        <button
                            className="admin-bouquets-btn-secondary"
                            onClick={() =>
                                openCompModal(selectedBouquet.bouquet_id)
                            }
                        >
                            Редактировать компоненты букета
                        </button>
                        <button
                            className="admin-bouquets-btn-secondary"
                            onClick={() => setIsAddTagOpen(true)}
                        >
                            Установить теги
                        </button>
                    </div>

                    <p className="admin-bouquets-total-price">
                        Себестоимость:{" "}
                        <strong>
                            {calculateBouquetPrice(
                                selectedBouquet.bouquet_id,
                                bouquetComponents,
                                componentPrices,
                            )}{" "}
                            ₽
                        </strong>
                    </p>

                    <h3 className="admin-subsection-title">Теги букета:</h3>
                    <div className="admin-tags-list">
                        {bouquetTags
                            .filter(
                                (bt) =>
                                    bt.bouquet_id ===
                                    selectedBouquet.bouquet_id,
                            )
                            .map((bt) => {
                                const tagObj = tags.find(
                                    (t) => t.tag_id === bt.tag_id,
                                );
                                return (
                                    <span
                                        key={bt.bouquet_tag_id}
                                        className="admin-tag-badge"
                                    >
                                        {tagObj ? tagObj.name : "Неизвестно"}
                                        <button
                                            onClick={() =>
                                                removeTagFromBouquet(
                                                    bt.bouquet_tag_id,
                                                )
                                            }
                                        >
                                            &times;
                                        </button>
                                    </span>
                                );
                            })}
                        {bouquetTags.filter(
                            (bt) =>
                                bt.bouquet_id === selectedBouquet.bouquet_id,
                        ).length === 0 && (
                            <span className="admin-text-muted">Нет тегов</span>
                        )}
                    </div>

                    <h3 className="admin-subsection-title">Состав:</h3>
                    <table className="admin-bouquets-table">
                        <thead>
                            <tr>
                                <th>Компонент</th>
                                <th>Количество</th>
                                <th>Удалить</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bouquetComponents
                                .filter(
                                    (bc) =>
                                        bc.bouquet_id ===
                                        selectedBouquet.bouquet_id,
                                )
                                .map((bc) => {
                                    const comp = components.find(
                                        (c) =>
                                            c.component_id === bc.component_id,
                                    );
                                    return (
                                        <tr key={bc.bouquet_component_id}>
                                            <td>
                                                {comp
                                                    ? comp.name
                                                    : "Неизвестно"}
                                            </td>
                                            <td>
                                                {bc.quantity}{" "}
                                                {comp ? comp.unit : ""}
                                            </td>
                                            <td>
                                                <button
                                                    className="admin-bouquets-icon-btn"
                                                    onClick={() =>
                                                        removeComponentFromBouquet(
                                                            bc.bouquet_component_id,
                                                        )
                                                    }
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        fill="currentColor"
                                                        viewBox="0 0 16 16"
                                                    >
                                                        <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </AdminModal>
            )}

            {/* УНИВЕРСАЛЬНАЯ МОДАЛКА ВЫБОРА КОМПОНЕНТОВ */}
            {isCompModalOpen && (
                <AdminModal
                    title="Выбор компонентов"
                    onClose={() => setIsCompModalOpen(false)}
                >
                    <div className="admin-comp-grid">
                        {components.map((c) => {
                            const isSelected = !!tempSelections[c.component_id];
                            const qty = tempSelections[c.component_id] || "";
                            return (
                                <label
                                    key={c.component_id}
                                    className={`admin-comp-card ${isSelected ? "admin-comp-card--selected" : ""}`}
                                >
                                    <input
                                        type="checkbox"
                                        className="admin-hidden-checkbox"
                                        checked={isSelected}
                                        onChange={(e) =>
                                            handleCompSelectionToggle(
                                                c.component_id,
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    <div className="admin-comp-card-image">
                                        {c.image_url ? (
                                            <img
                                                src={c.image_url}
                                                alt={c.name}
                                            />
                                        ) : (
                                            <div className="admin-comp-no-img">
                                                Нет фото
                                            </div>
                                        )}
                                    </div>
                                    <div className="admin-comp-card-info">
                                        <h4 className="admin-comp-card-title">
                                            {c.name}
                                        </h4>
                                        <div className="admin-comp-card-action">
                                            {isSelected ? (
                                                <input
                                                    type="number"
                                                    min="0.1"
                                                    step="0.1"
                                                    value={qty}
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                    onChange={(e) =>
                                                        handleCompQtyChange(
                                                            c.component_id,
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="admin-comp-qty-input"
                                                />
                                            ) : (
                                                <span className="admin-comp-card-hint">
                                                    Кликни, чтобы выбрать
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                    <button
                        className="admin-bouquets-btn-primary admin-btn-full-width"
                        onClick={saveCompSelections}
                    >
                        Жестко закрепить выбор
                    </button>
                </AdminModal>
            )}

            {/* ВЛОЖЕННАЯ МОДАЛКА: Добавить тег в существующий букет */}
            {isAddTagOpen && selectedBouquet && (
                <AdminModal
                    title="Привязать тег"
                    onClose={() => setIsAddTagOpen(false)}
                >
                    <div className="admin-bouquets-form">
                        <label>Выберите тег:</label>
                        <select
                            value={addTagId}
                            onChange={(e) => setAddTagId(e.target.value)}
                            className="admin-styled-select"
                        >
                            <option value="">-- Выбери --</option>
                            {tags.map((t) => (
                                <option key={t.tag_id} value={t.tag_id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                        <button
                            className="admin-bouquets-btn-primary"
                            onClick={handleAddTagToExisting}
                        >
                            Привязать
                        </button>
                    </div>
                </AdminModal>
            )}

            {/* МОДАЛКА: Создать букет */}
            {isAddBouquetOpen && (
                <AdminModal
                    title="Создание нового букета"
                    onClose={() => setIsAddBouquetOpen(false)}
                >
                    <form
                        className="admin-bouquets-form"
                        onSubmit={handleAddBouquet}
                    >
                        <label>Имя букета:</label>
                        <input
                            type="text"
                            value={newBouquet.name}
                            onChange={(e) =>
                                setNewBouquet({
                                    ...newBouquet,
                                    name: e.target.value,
                                })
                            }
                            required
                        />

                        <label>Описание:</label>
                        <textarea
                            value={newBouquet.description}
                            onChange={(e) =>
                                setNewBouquet({
                                    ...newBouquet,
                                    description: e.target.value,
                                })
                            }
                        />

                        <label>Изображение:</label>
                        <label className="admin-file-upload-label">
                            <span className="admin-file-upload-text">
                                Выбрать файл изображения
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="admin-file-upload-input"
                            />
                        </label>
                        {newBouquet.image_url && (
                            <img
                                src={newBouquet.image_url}
                                alt="Preview"
                                className="admin-bouquets-preview-large"
                            />
                        )}

                        <label className="admin-checkbox-label">
                            <input
                                type="checkbox"
                                checked={newBouquet.is_custom === 1}
                                onChange={(e) =>
                                    setNewBouquet({
                                        ...newBouquet,
                                        is_custom: e.target.checked ? 1 : 0,
                                    })
                                }
                            />
                            Это кастомный букет?
                        </label>

                        <h3 className="admin-subsection-title">
                            Состав букета:
                        </h3>
                        <div className="admin-selected-comps-preview">
                            {Object.keys(newBouquet.selectedComponents)
                                .length === 0 ? (
                                <p className="admin-text-muted">
                                    Компоненты еще не выбраны.
                                </p>
                            ) : (
                                <ul className="admin-simple-list">
                                    {Object.entries(
                                        newBouquet.selectedComponents,
                                    ).map(([id, qty]) => {
                                        const c = components.find(
                                            (comp) =>
                                                comp.component_id ===
                                                parseInt(id),
                                        );
                                        return (
                                            <li key={id}>
                                                {c ? c.name : "Неизвестно"} —{" "}
                                                {qty} {c ? c.unit : ""}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                        <button
                            type="button"
                            className="admin-bouquets-btn-secondary"
                            onClick={() => openCompModal("new")}
                        >
                            Открыть базу компонентов
                        </button>

                        <button
                            type="submit"
                            className="admin-bouquets-btn-primary"
                            style={{ marginTop: "24px" }}
                        >
                            Сохранить букет в базу
                        </button>
                    </form>
                </AdminModal>
            )}

            {/* МОДАЛКА: Подтверждение удаления */}
            {isConfirmDeleteOpen !== null && (
                <AdminModal
                    title="Ты уверена, Лили?"
                    onClose={() => setIsConfirmDeleteOpen(null)}
                >
                    <div className="admin-bouquets-confirm">
                        <p>
                            Это действие уничтожит букет (ID:{" "}
                            {isConfirmDeleteOpen}) навсегда. Я предупредил.
                        </p>
                        <div className="admin-bouquets-modal-controls">
                            <button
                                className="admin-bouquets-btn-delete"
                                onClick={confirmDeleteBouquet}
                            >
                                Да, уничтожить
                            </button>
                            <button
                                className="admin-bouquets-btn-secondary"
                                onClick={() => setIsConfirmDeleteOpen(null)}
                            >
                                Я передумала
                            </button>
                        </div>
                    </div>
                </AdminModal>
            )}
        </div>
    );
};

export default AdminBouquets;
