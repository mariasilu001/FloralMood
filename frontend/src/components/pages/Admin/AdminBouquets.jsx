import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../../App";
import api from "../../../api/axios";
import AdminModal from "../../admin/AdminModal";

const AdminBouquets = () => {
    // Я забираю данные напрямую из твоего провайдера
    const { adminData, publicData, fetchAdminData } = useContext(AppContext);

    const bouquets = adminData.allBouquets || [];
    const components = adminData.allComponents || [];
    const tags = publicData.tags || [];

    const [selectedBouquet, setSelectedBouquet] = useState(null);
    const [isAddBouquetOpen, setIsAddBouquetOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(null);
    const [isAddTagOpen, setIsAddTagOpen] = useState(false);

    const [isCompModalOpen, setIsCompModalOpen] = useState(false);
    const [compModalTarget, setCompModalTarget] = useState(null);
    const [tempSelections, setTempSelections] = useState({});

    // Добавил поле imageFile для отправки на сервер
    const [newBouquet, setNewBouquet] = useState({
        name: "",
        description: "",
        image_url: "",
        imageFile: null,
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

    // Жесткая заглушка, пока я не получу свои данные
    if (!adminData.allBouquets || adminData.allBouquets.length === 0) {
        return (
            <div className="admin-bouquets-container">
                <div className="admin-dashboard-header">
                    <h2>Я подгружаю данные базы букетов. Сиди и жди, Лили.</h2>
                </div>
            </div>
        );
    }

    // Мой инструмент подсчета себестоимости с учетом актуальных цен
    const calculateBouquetPrice = (bouquet) => {
        let total = 0;
        if (!bouquet.components) return total;

        bouquet.components.forEach((bc) => {
            // Находим компонент в глобальном стейте
            const compInDb = components.find(
                (c) =>
                    c.componentId === bc.componentId ||
                    c.component_id === bc.component_id,
            );
            if (compInDb && compInDb.prices) {
                // Ищем актуальную цену
                const activePriceObj = compInDb.prices.find(
                    (p) => new Date(p.endDate) > new Date(),
                );
                const price = activePriceObj
                    ? parseFloat(activePriceObj.price)
                    : 0;
                // Достаем количество из промежуточной таблицы
                const quantity =
                    bc.BouquetComponent?.quantity ||
                    bc.bouquet_component?.quantity ||
                    1;
                total += price * quantity;
            }
        });
        return total.toFixed(2);
    };

    const toggleDeleteStatus = async (bouquetId, isCurrentlyDeleted) => {
        try {
            // Восстанавливаем или удаляем через update
            await api.put(`/admin/bouquets/${bouquetId}`, {
                isDeleted: !isCurrentlyDeleted,
            });
            await fetchAdminData();
        } catch (error) {
            console.error(error);
            alert("Ошибка при смене статуса. Смотри в консоль.");
        }
    };

    const confirmDeleteBouquet = async () => {
        try {
            await api.delete(`/admin/bouquets/${isConfirmDeleteOpen}`);
            await fetchAdminData();
            setIsConfirmDeleteOpen(null);
            setSelectedBouquet(null);
        } catch (error) {
            console.error(error);
            alert("Я не смог удалить этот букет.");
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewBouquet((prev) => ({
                    ...prev,
                    image_url: reader.result,
                    imageFile: file,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("image", file);

            const bId = selectedBouquet.bouquetId || selectedBouquet.bouquet_id;
            try {
                await api.put(`/admin/bouquets/${bId}`, formData);
                await fetchAdminData();

                const reader = new FileReader();
                reader.onloadend = () => {
                    setSelectedBouquet((prev) => ({
                        ...prev,
                        image_url: reader.result,
                    }));
                };
                reader.readAsDataURL(file);

                alert(
                    "Изображение безжалостно заменено. Я контролирую каждый пиксель.",
                );
            } catch (error) {
                console.error(error);
                alert("Ошибка при загрузке картинки.");
            }
        }
    };

    const handleAddBouquet = async (e) => {
        e.preventDefault();
        if (!newBouquet.name) {
            alert(
                "Имя букета обязательно, Лили. Хватит испытывать мое терпение.",
            );
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", newBouquet.name);
            formData.append("description", newBouquet.description);
            formData.append("isCustom", newBouquet.is_custom);
            if (newBouquet.imageFile) {
                formData.append("image", newBouquet.imageFile);
            }

            const response = await api.post("/admin/bouquets", formData);
            const createdBouquetId =
                response.data.bouquet.bouquetId ||
                response.data.bouquet.bouquet_id;

            // Если были выбраны компоненты, сразу привязываем их
            const selectedComps = Object.entries(newBouquet.selectedComponents);
            if (selectedComps.length > 0) {
                const payload = {
                    components: selectedComps.map(([compId, qty]) => ({
                        componentId: parseInt(compId),
                        quantity: parseFloat(qty),
                    })),
                };
                await api.put(
                    `/admin/bouquets/${createdBouquetId}/components`,
                    payload,
                );
            }

            await fetchAdminData();
            setIsAddBouquetOpen(false);
            setNewBouquet({
                name: "",
                description: "",
                image_url: "",
                imageFile: null,
                is_custom: 0,
                selectedComponents: {},
            });
        } catch (error) {
            console.error(error);
            alert("Ошибка создания. Проверь сеть.");
        }
    };

    const handleSaveDescription = async () => {
        const bId = selectedBouquet.bouquetId || selectedBouquet.bouquet_id;
        try {
            await api.put(`/admin/bouquets/${bId}`, {
                description: editDesc,
            });
            await fetchAdminData();
            alert("Описание подчинилось моей воле и было сохранено.");
        } catch (error) {
            console.error(error);
        }
    };

    const removeComponentFromBouquet = async (componentIdToRemove) => {
        const bId = selectedBouquet.bouquetId || selectedBouquet.bouquet_id;
        try {
            const currentComps = selectedBouquet.components || [];
            // Фильтруем старые компоненты, убираем удаленный
            const updatedPayload = currentComps
                .filter(
                    (c) =>
                        (c.componentId || c.component_id) !==
                        componentIdToRemove,
                )
                .map((c) => ({
                    componentId: c.componentId || c.component_id,
                    quantity:
                        c.BouquetComponent?.quantity ||
                        c.bouquet_component?.quantity ||
                        1,
                }));

            await api.put(`/admin/bouquets/${bId}/components`, {
                components: updatedPayload,
            });

            // Обновляем локально для мгновенной реакции
            setSelectedBouquet((prev) => ({
                ...prev,
                components: prev.components.filter(
                    (c) =>
                        (c.componentId || c.component_id) !==
                        componentIdToRemove,
                ),
            }));
            await fetchAdminData();
        } catch (error) {
            console.error(error);
        }
    };

    const removeTagFromBouquet = async (tagIdToRemove) => {
        const bId = selectedBouquet.bouquetId || selectedBouquet.bouquet_id;
        try {
            await api.delete(`/admin/bouquets/${bId}/tags/${tagIdToRemove}`);

            setSelectedBouquet((prev) => ({
                ...prev,
                tags: prev.tags.filter(
                    (t) => (t.tagId || t.tag_id) !== tagIdToRemove,
                ),
            }));
            await fetchAdminData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddTagToExisting = async () => {
        if (!addTagId) return;
        const bId = selectedBouquet.bouquetId || selectedBouquet.bouquet_id;

        try {
            await api.post(`/admin/bouquets/${bId}/tags`, {
                tagId: parseInt(addTagId),
            });
            await fetchAdminData();

            // Легкое локальное обновление
            const addedTag = tags.find(
                (t) =>
                    t.tagId === parseInt(addTagId) ||
                    t.tag_id === parseInt(addTagId),
            );
            if (addedTag) {
                setSelectedBouquet((prev) => ({
                    ...prev,
                    tags: [...(prev.tags || []), addedTag],
                }));
            }
            setIsAddTagOpen(false);
            setAddTagId("");
        } catch (error) {
            console.error(error);
            alert("Ошибка привязки тега. Возможно, он уже висит.");
        }
    };

    // ==========================================
    // ЖЕСТКАЯ ЛОГИКА МАССОВОГО ВЫБОРА КОМПОНЕНТОВ
    // ==========================================
    const openCompModal = (target) => {
        setCompModalTarget(target);
        if (target === "new") {
            setTempSelections({ ...newBouquet.selectedComponents });
        } else {
            const currentComps = selectedBouquet.components || [];
            const selections = {};
            currentComps.forEach((c) => {
                const cId = c.componentId || c.component_id;
                selections[cId] =
                    c.BouquetComponent?.quantity ||
                    c.bouquet_component?.quantity ||
                    1;
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

    const saveCompSelections = async () => {
        if (compModalTarget === "new") {
            setNewBouquet((prev) => ({
                ...prev,
                selectedComponents: tempSelections,
            }));
            setIsCompModalOpen(false);
        } else {
            try {
                const payload = {
                    components: Object.entries(tempSelections).map(
                        ([id, qty]) => ({
                            componentId: parseInt(id),
                            quantity: parseFloat(qty),
                        }),
                    ),
                };
                await api.put(
                    `/admin/bouquets/${compModalTarget}/components`,
                    payload,
                );
                await fetchAdminData();
                setIsCompModalOpen(false);
                // Закрываем модалку деталей, чтобы при открытии подтянулись свежие данные
                setSelectedBouquet(null);
            } catch (error) {
                console.error(error);
                alert("Не удалось сохранить состав букета.");
            }
        }
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
                        <th>Удален / Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {bouquets.map((b) => {
                        const bId = b.bouquetId || b.bouquet_id;
                        const isDeleted = !!(b.deletedAt || b.deleted_at);

                        // Проверка на удаленные компоненты внутри букета
                        const hasDeletedComponents =
                            b.components &&
                            b.components.some(
                                (c) => !!(c.deletedAt || c.deleted_at),
                            );

                        return (
                            <tr
                                key={bId}
                                className={
                                    isDeleted || hasDeletedComponents
                                        ? "admin-bouquets-row-deleted"
                                        : ""
                                }
                            >
                                <td>{bId}</td>
                                <td>
                                    {b.imageUrl || b.image_url ? (
                                        <img
                                            src={
                                                b.imageUrl?.startsWith("http")
                                                    ? b.imageUrl
                                                    : `/uploads/${b.imageUrl || b.image_url}`
                                            }
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
                                <td>
                                    {b.isCustom || b.is_custom
                                        ? "Кастомный"
                                        : "Стандарт"}
                                </td>
                                <td>
                                    {hasDeletedComponents ? (
                                        <span
                                            style={{
                                                color: "var(--color-error)",
                                                fontWeight: "bold",
                                                fontSize: "12px",
                                            }}
                                        >
                                            Отсутствуют некоторые компоненты
                                        </span>
                                    ) : (
                                        <input
                                            type="checkbox"
                                            checked={isDeleted}
                                            onChange={() =>
                                                toggleDeleteStatus(
                                                    bId,
                                                    isDeleted,
                                                )
                                            }
                                        />
                                    )}
                                </td>
                                <td>
                                    <button
                                        className="admin-bouquets-btn-delete"
                                        onClick={() =>
                                            setIsConfirmDeleteOpen(bId)
                                        }
                                    >
                                        Удалить
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* МОДАЛКА: Детали букета */}
            {selectedBouquet && (
                <AdminModal
                    title={`Детали: ${selectedBouquet.name}`}
                    onClose={() => setSelectedBouquet(null)}
                >
                    <div className="admin-desc-edit-group">
                        <label>Изображение букета:</label>
                        {(selectedBouquet.imageUrl ||
                            selectedBouquet.image_url) && (
                            <img
                                src={
                                    selectedBouquet.imageUrl?.startsWith("http")
                                        ? selectedBouquet.imageUrl
                                        : `/uploads/${selectedBouquet.imageUrl || selectedBouquet.image_url}`
                                }
                                alt="Текущее фото"
                                className="admin-bouquets-preview-large"
                                style={{
                                    marginBottom: "12px",
                                    maxHeight: "150px",
                                }}
                            />
                        )}
                        <label className="admin-file-upload-label">
                            <span className="admin-file-upload-text">
                                Загрузить новое фото
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleEditImageUpload}
                                className="admin-file-upload-input"
                            />
                        </label>
                    </div>

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
                                openCompModal(
                                    selectedBouquet.bouquetId ||
                                        selectedBouquet.bouquet_id,
                                )
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
                            {calculateBouquetPrice(selectedBouquet)} ₽
                        </strong>
                    </p>

                    <h3 className="admin-subsection-title">Теги букета:</h3>
                    <div className="admin-tags-list">
                        {(selectedBouquet.tags || []).map((t) => (
                            <span
                                key={t.tagId || t.tag_id}
                                className="admin-tag-badge"
                            >
                                {t.name}
                                <button
                                    onClick={() =>
                                        removeTagFromBouquet(
                                            t.tagId || t.tag_id,
                                        )
                                    }
                                >
                                    &times;
                                </button>
                            </span>
                        ))}
                        {(!selectedBouquet.tags ||
                            selectedBouquet.tags.length === 0) && (
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
                            {(selectedBouquet.components || []).map((c) => {
                                const cId = c.componentId || c.component_id;
                                const qty =
                                    c.BouquetComponent?.quantity ||
                                    c.bouquet_component?.quantity ||
                                    1;
                                const isCompDeleted = !!(
                                    c.deletedAt || c.deleted_at
                                );

                                return (
                                    <tr key={cId}>
                                        <td
                                            style={
                                                isCompDeleted
                                                    ? {
                                                          color: "var(--color-error)",
                                                          textDecoration:
                                                              "line-through",
                                                      }
                                                    : {}
                                            }
                                        >
                                            {c.name}{" "}
                                            {isCompDeleted && "(Удален)"}
                                        </td>
                                        <td>
                                            {qty} {c.unit}
                                        </td>
                                        <td>
                                            <button
                                                className="admin-bouquets-icon-btn"
                                                onClick={() =>
                                                    removeComponentFromBouquet(
                                                        cId,
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
                            const cId = c.componentId || c.component_id;
                            const isSelected = !!tempSelections[cId];
                            const qty = tempSelections[cId] || "";
                            return (
                                <label
                                    key={cId}
                                    className={`admin-comp-card ${isSelected ? "admin-comp-card--selected" : ""}`}
                                >
                                    <input
                                        type="checkbox"
                                        className="admin-hidden-checkbox"
                                        checked={isSelected}
                                        onChange={(e) =>
                                            handleCompSelectionToggle(
                                                cId,
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    <div className="admin-comp-card-image">
                                        {c.imageUrl || c.image_url ? (
                                            <img
                                                src={
                                                    c.imageUrl?.startsWith(
                                                        "http",
                                                    )
                                                        ? c.imageUrl
                                                        : `/uploads/${c.imageUrl || c.image_url}`
                                                }
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
                                                            cId,
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
                                <option
                                    key={t.tagId || t.tag_id}
                                    value={t.tagId || t.tag_id}
                                >
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
                                                (comp.componentId ||
                                                    comp.component_id) ===
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
                            Это действие отправит букет (ID:{" "}
                            {isConfirmDeleteOpen}) в архив.
                        </p>
                        <div className="admin-bouquets-modal-controls">
                            <button
                                className="admin-bouquets-btn-delete"
                                onClick={confirmDeleteBouquet}
                            >
                                Да, убрать его
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
