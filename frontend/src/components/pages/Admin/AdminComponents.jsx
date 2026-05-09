import React, { useState, useEffect } from "react";
import AdminModal from "../../admin/AdminModal";

const AdminComponents = ({
    components,
    setComponents,
    componentCategories,
    componentPrices,
    setComponentPrices,
}) => {
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isPricesOpen, setIsPricesOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(null);
    const [isConfirmPriceDeleteOpen, setIsConfirmPriceDeleteOpen] =
        useState(null);

    // Стейт для редактирования (чтобы не мутировать оригинал до сохранения)
    const [editData, setEditData] = useState({});

    // Стейт для создания нового компонента
    const [newComp, setNewComp] = useState({
        name: "",
        description: "",
        category_id: "",
        image_url: "",
        unit: "шт",
        initial_price: "",
    });

    // Стейт для добавления новой цены в историю
    const [newPriceVal, setNewPriceVal] = useState("");

    // Подтягиваем данные при открытии модалки редактирования
    useEffect(() => {
        if (selectedComponent) {
            setEditData({ ...selectedComponent });
        }
    }, [selectedComponent]);

    // ==========================================
    // ЛОГИКА СОЗДАНИЯ КОМПОНЕНТА
    // ==========================================
    const handleNewImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () =>
                setNewComp((prev) => ({ ...prev, image_url: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    const handleCreateComponent = (e) => {
        e.preventDefault();
        if (!newComp.name || !newComp.category_id || !newComp.initial_price) {
            alert(
                "Имя, категория и первая цена обязательны, Лили. Я не работаю с пустотой.",
            );
            return;
        }

        const newCompId =
            components.length > 0
                ? Math.max(...components.map((c) => c.component_id)) + 1
                : 1;

        const componentToAdd = {
            component_id: newCompId,
            name: newComp.name,
            description: newComp.description,
            category_id: parseInt(newComp.category_id),
            image_url: newComp.image_url,
            unit: newComp.unit,
            created_at: new Date().toISOString(),
            deleted_at: null,
        };

        const newPriceId =
            componentPrices.length > 0
                ? Math.max(...componentPrices.map((p) => p.price_id)) + 1
                : 1;
        const priceToAdd = {
            price_id: newPriceId,
            component_id: newCompId,
            price: parseFloat(newComp.initial_price),
            start_date: new Date().toISOString().split("T")[0],
            end_date: "2099-12-31",
        };

        setComponents([...components, componentToAdd]);
        setComponentPrices([...componentPrices, priceToAdd]);

        setIsAddOpen(false);
        setNewComp({
            name: "",
            description: "",
            category_id: "",
            image_url: "",
            unit: "шт",
            initial_price: "",
        });
    };

    // ==========================================
    // ЛОГИКА РЕДАКТИРОВАНИЯ И УДАЛЕНИЯ КОМПОНЕНТА
    // ==========================================
    const handleEditImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () =>
                setEditData((prev) => ({ ...prev, image_url: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    const handleSaveEdit = () => {
        if (!editData.name || !editData.category_id) {
            alert("Имя и категория не могут быть пустыми.");
            return;
        }
        setComponents((prev) =>
            prev.map((c) =>
                c.component_id === editData.component_id
                    ? {
                          ...editData,
                          category_id: parseInt(editData.category_id),
                      }
                    : c,
            ),
        );
        setSelectedComponent({
            ...editData,
            category_id: parseInt(editData.category_id),
        });
        alert("Компонент жестко обновлен. Твои изменения сохранены.");
    };

    const toggleDeleteStatus = (compId) => {
        setComponents((prev) =>
            prev.map((c) =>
                c.component_id === compId
                    ? {
                          ...c,
                          deleted_at: c.deleted_at
                              ? null
                              : new Date().toISOString(),
                      }
                    : c,
            ),
        );
        if (selectedComponent && selectedComponent.component_id === compId) {
            setEditData((prev) => ({
                ...prev,
                deleted_at: prev.deleted_at ? null : new Date().toISOString(),
            }));
        }
    };

    const confirmHardDelete = () => {
        setComponents((prev) =>
            prev.filter((c) => c.component_id !== isConfirmDeleteOpen),
        );
        if (
            selectedComponent &&
            selectedComponent.component_id === isConfirmDeleteOpen
        ) {
            setSelectedComponent(null);
        }
        setIsConfirmDeleteOpen(null);
    };

    // ==========================================
    // ЛОГИКА ИСТОРИИ ЦЕН
    // ==========================================
    const handleAddPrice = () => {
        if (!newPriceVal || isNaN(newPriceVal) || newPriceVal <= 0) {
            alert("Введи корректную цену.");
            return;
        }
        const newPriceId =
            componentPrices.length > 0
                ? Math.max(...componentPrices.map((p) => p.price_id)) + 1
                : 1;
        setComponentPrices([
            ...componentPrices,
            {
                price_id: newPriceId,
                component_id: selectedComponent.component_id,
                price: parseFloat(newPriceVal),
                start_date: new Date().toISOString().split("T")[0],
                end_date: "2099-12-31",
            },
        ]);
        setNewPriceVal("");
    };

    const confirmDeletePrice = () => {
        setComponentPrices((prev) =>
            prev.filter((p) => p.price_id !== isConfirmPriceDeleteOpen),
        );
        setIsConfirmPriceDeleteOpen(null);
    };

    // Вычисляем текущую цену для таблицы
    const getCurrentPrice = (compId) => {
        const prices = componentPrices.filter((p) => p.component_id === compId);
        if (prices.length === 0) return 0;
        // Берем последнюю добавленную цену (упрощенно)
        return prices[prices.length - 1].price;
    };

    return (
        <div className="admin-bouquets-container">
            <div className="admin-bouquets-header">
                <h2>Склад Компонентов</h2>
                <button
                    className="admin-bouquets-btn-primary"
                    onClick={() => setIsAddOpen(true)}
                >
                    Добавить новый компонент
                </button>
            </div>

            <table className="admin-bouquets-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Фото</th>
                        <th>Название</th>
                        <th>Категория</th>
                        <th>Цена</th>
                        <th>Удален</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {components.map((c) => {
                        const category = componentCategories.find(
                            (cat) => cat.category_id === c.category_id,
                        );
                        return (
                            <tr
                                key={c.component_id}
                                className={
                                    c.deleted_at
                                        ? "admin-bouquets-row-deleted"
                                        : ""
                                }
                            >
                                <td>{c.component_id}</td>
                                <td>
                                    {c.image_url ? (
                                        <img
                                            src={c.image_url}
                                            alt="img"
                                            className="admin-bouquets-preview"
                                        />
                                    ) : (
                                        "Нет"
                                    )}
                                </td>
                                <td
                                    className="admin-bouquets-cell-clickable"
                                    onClick={() => setSelectedComponent(c)}
                                >
                                    {c.name}
                                </td>
                                <td>{category ? category.name : "—"}</td>
                                <td>
                                    {getCurrentPrice(c.component_id)} ₽/{c.unit}
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={!!c.deleted_at}
                                        onChange={() =>
                                            toggleDeleteStatus(c.component_id)
                                        }
                                    />
                                </td>
                                <td>
                                    <button
                                        className="admin-bouquets-btn-delete"
                                        onClick={() =>
                                            setIsConfirmDeleteOpen(
                                                c.component_id,
                                            )
                                        }
                                    >
                                        Уничтожить
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* МОДАЛКА: СОЗДАНИЕ КОМПОНЕНТА */}
            {isAddOpen && (
                <AdminModal
                    title="Регистрация компонента"
                    onClose={() => setIsAddOpen(false)}
                >
                    <form
                        className="admin-bouquets-form"
                        onSubmit={handleCreateComponent}
                    >
                        <div className="admin-form-row">
                            <div className="admin-form-col">
                                <label>Название:</label>
                                <input
                                    type="text"
                                    value={newComp.name}
                                    onChange={(e) =>
                                        setNewComp({
                                            ...newComp,
                                            name: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="admin-form-col">
                                <label>Категория:</label>
                                <select
                                    value={newComp.category_id}
                                    onChange={(e) =>
                                        setNewComp({
                                            ...newComp,
                                            category_id: e.target.value,
                                        })
                                    }
                                    className="admin-styled-select"
                                    required
                                >
                                    <option value="">-- Выбери --</option>
                                    {componentCategories.map((cat) => (
                                        <option
                                            key={cat.category_id}
                                            value={cat.category_id}
                                        >
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="admin-form-row">
                            <div className="admin-form-col">
                                <label>Единицы (шт, м, ветка):</label>
                                <input
                                    type="text"
                                    value={newComp.unit}
                                    onChange={(e) =>
                                        setNewComp({
                                            ...newComp,
                                            unit: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="admin-form-col">
                                <label>Стартовая цена (₽):</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={newComp.initial_price}
                                    onChange={(e) =>
                                        setNewComp({
                                            ...newComp,
                                            initial_price: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <label>Описание:</label>
                        <textarea
                            value={newComp.description}
                            onChange={(e) =>
                                setNewComp({
                                    ...newComp,
                                    description: e.target.value,
                                })
                            }
                        />

                        <label>Изображение:</label>
                        <label className="admin-file-upload-label">
                            <span className="admin-file-upload-text">
                                Загрузить фото компонента
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleNewImageUpload}
                                className="admin-file-upload-input"
                            />
                        </label>
                        {newComp.image_url && (
                            <img
                                src={newComp.image_url}
                                alt="Preview"
                                className="admin-bouquets-preview-large"
                            />
                        )}

                        <button
                            type="submit"
                            className="admin-bouquets-btn-primary"
                            style={{ marginTop: "24px" }}
                        >
                            Зафиксировать в базе
                        </button>
                    </form>
                </AdminModal>
            )}

            {/* МОДАЛКА: РЕДАКТИРОВАНИЕ КОМПОНЕНТА */}
            {selectedComponent && (
                <AdminModal
                    title={`Редактор: ${selectedComponent.name}`}
                    onClose={() => setSelectedComponent(null)}
                >
                    <div className="admin-bouquets-form">
                        <div className="admin-form-row">
                            <div className="admin-form-col">
                                <label>Название:</label>
                                <input
                                    type="text"
                                    value={editData.name || ""}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="admin-form-col">
                                <label>Категория:</label>
                                <select
                                    value={editData.category_id || ""}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            category_id: e.target.value,
                                        })
                                    }
                                    className="admin-styled-select"
                                >
                                    {componentCategories.map((cat) => (
                                        <option
                                            key={cat.category_id}
                                            value={cat.category_id}
                                        >
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="admin-form-row">
                            <div className="admin-form-col">
                                <label>Единицы измерения:</label>
                                <input
                                    type="text"
                                    value={editData.unit || ""}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            unit: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="admin-form-col">
                                <label
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        height: "100%",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={!!editData.deleted_at}
                                        onChange={() =>
                                            toggleDeleteStatus(
                                                editData.component_id,
                                            )
                                        }
                                        style={{ marginRight: "8px" }}
                                    />
                                    Пометить удаленным
                                </label>
                            </div>
                        </div>

                        <label>Описание:</label>
                        <div
                            className="admin-desc-edit-wrapper"
                            style={{ marginTop: 0 }}
                        >
                            <textarea
                                value={editData.description || ""}
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div
                            className="admin-desc-edit-group"
                            style={{ marginTop: "16px" }}
                        >
                            <label>Фотография компонента:</label>
                            {editData.image_url && (
                                <img
                                    src={editData.image_url}
                                    alt="Текущее"
                                    className="admin-bouquets-preview-large"
                                    style={{
                                        marginBottom: "12px",
                                        maxHeight: "150px",
                                    }}
                                />
                            )}
                            <label className="admin-file-upload-label">
                                <span className="admin-file-upload-text">
                                    Заменить фотографию
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleEditImageUpload}
                                    className="admin-file-upload-input"
                                />
                            </label>
                        </div>

                        <div
                            className="admin-bouquets-modal-controls"
                            style={{ marginTop: "24px" }}
                        >
                            <button
                                className="admin-bouquets-btn-primary"
                                onClick={handleSaveEdit}
                            >
                                Сохранить изменения
                            </button>
                            <button
                                className="admin-bouquets-btn-secondary"
                                onClick={() => setIsPricesOpen(true)}
                            >
                                Управление ценами
                            </button>
                        </div>
                    </div>
                </AdminModal>
            )}

            {/* ВЛОЖЕННАЯ МОДАЛКА: ИСТОРИЯ ЦЕН */}
            {isPricesOpen && selectedComponent && (
                <AdminModal
                    title={`История цен: ${selectedComponent.name}`}
                    onClose={() => setIsPricesOpen(false)}
                >
                    <div className="admin-add-price-box">
                        <label>Новая цена (₽):</label>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={newPriceVal}
                                onChange={(e) => setNewPriceVal(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    borderRadius: "4px",
                                    border: "1px solid #e0e0eb",
                                }}
                            />
                            <button
                                className="admin-bouquets-btn-primary"
                                style={{ margin: 0 }}
                                onClick={handleAddPrice}
                            >
                                Добавить
                            </button>
                        </div>
                    </div>

                    <table
                        className="admin-bouquets-table"
                        style={{ marginTop: "24px" }}
                    >
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Цена</th>
                                <th>Дата установки</th>
                                <th>Удалить</th>
                            </tr>
                        </thead>
                        <tbody>
                            {componentPrices
                                .filter(
                                    (p) =>
                                        p.component_id ===
                                        selectedComponent.component_id,
                                )
                                .sort(
                                    (a, b) =>
                                        new Date(b.start_date) -
                                        new Date(a.start_date),
                                )
                                .map((p) => (
                                    <tr key={p.price_id}>
                                        <td>{p.price_id}</td>
                                        <td
                                            style={{
                                                fontWeight: "bold",
                                                color: "var(--color-blue)",
                                            }}
                                        >
                                            {p.price} ₽
                                        </td>
                                        <td>{p.start_date}</td>
                                        <td>
                                            <button
                                                className="admin-bouquets-icon-btn"
                                                onClick={() =>
                                                    setIsConfirmPriceDeleteOpen(
                                                        p.price_id,
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
                                ))}
                        </tbody>
                    </table>
                </AdminModal>
            )}

            {/* МОДАЛКА: ПОДТВЕРЖДЕНИЕ УДАЛЕНИЯ КОМПОНЕНТА */}
            {isConfirmDeleteOpen !== null && (
                <AdminModal
                    title="Ты уверена, Лили?"
                    onClose={() => setIsConfirmDeleteOpen(null)}
                >
                    <div className="admin-bouquets-confirm">
                        <p>
                            Это действие уничтожит компонент навсегда. Я
                            предупредил.
                        </p>
                        <div className="admin-bouquets-modal-controls">
                            <button
                                className="admin-bouquets-btn-delete"
                                onClick={confirmHardDelete}
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

            {/* МОДАЛКА: ПОДТВЕРЖДЕНИЕ УДАЛЕНИЯ ЦЕНЫ */}
            {isConfirmPriceDeleteOpen !== null && (
                <AdminModal
                    title="Удалить запись о цене?"
                    onClose={() => setIsConfirmPriceDeleteOpen(null)}
                >
                    <div className="admin-bouquets-confirm">
                        <p>Ты хочешь стереть эту цену из истории? Уверена?</p>
                        <div className="admin-bouquets-modal-controls">
                            <button
                                className="admin-bouquets-btn-delete"
                                onClick={confirmDeletePrice}
                            >
                                Да, стереть
                            </button>
                            <button
                                className="admin-bouquets-btn-secondary"
                                onClick={() =>
                                    setIsConfirmPriceDeleteOpen(null)
                                }
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </AdminModal>
            )}
        </div>
    );
};

export default AdminComponents;
