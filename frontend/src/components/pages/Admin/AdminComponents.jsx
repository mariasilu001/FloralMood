import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../../App";
import api from "../../../api/axios";
import AdminModal from "../../admin/AdminModal";

const AdminComponents = () => {
    const { adminData, publicData, fetchAdminData } = useContext(AppContext);

    const components = adminData.allComponents || [];
    const componentCategories = publicData.categories || [];

    const [selectedComponent, setSelectedComponent] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isPricesOpen, setIsPricesOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(null);
    const [isConfirmPriceDeleteOpen, setIsConfirmPriceDeleteOpen] =
        useState(null);

    const [editData, setEditData] = useState({});

    const [newComp, setNewComp] = useState({
        name: "",
        description: "",
        category_id: "",
        image_url: "",
        imageFile: null,
        unit: "шт",
        initial_price: "",
    });

    const [newPriceVal, setNewPriceVal] = useState("");

    useEffect(() => {
        if (selectedComponent) {
            setEditData({ ...selectedComponent });
        }
    }, [selectedComponent]);

    if (!components || components.length === 0) {
        return (
            <div className="admin-bouquets-container">
                <div className="admin-dashboard-header">
                    <h2>Загрузка</h2>
                </div>
            </div>
        );
    }

    const getImageUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("http") || url.startsWith("data:")) return url;
        return `/uploads/${url}`;
    };

    const handleNewImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () =>
                setNewComp((prev) => ({
                    ...prev,
                    image_url: reader.result,
                    imageFile: file,
                }));
            reader.readAsDataURL(file);
        }
    };

    const handleCreateComponent = async (e) => {
        e.preventDefault();
        if (!newComp.name || !newComp.category_id || !newComp.initial_price) {
            alert(
                "Имя, категория и первая цена обязательны",
            );
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", newComp.name);
            formData.append("categoryId", newComp.category_id);
            formData.append("unit", newComp.unit);
            formData.append("price", newComp.initial_price);
            if (newComp.description)
                formData.append("description", newComp.description);
            if (newComp.imageFile) formData.append("image", newComp.imageFile);

            await api.post("/admin/components", formData);
            await fetchAdminData();

            setIsAddOpen(false);
            setNewComp({
                name: "",
                description: "",
                category_id: "",
                image_url: "",
                imageFile: null,
                unit: "шт",
                initial_price: "",
            });
  
        } catch (error) {
            console.error(error);
            alert("Ошибка сети.");
        }
    };


    const handleEditImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () =>
                setEditData((prev) => ({
                    ...prev,
                    image_url: reader.result,
                    imageFile: file,
                }));
            reader.readAsDataURL(file);
        }
    };

    const handleSaveEdit = async () => {
        if (!editData.name || (!editData.category_id && !editData.categoryId)) {
            alert("Имя и категория не могут быть пустыми.");
            return;
        }

        const compId = editData.componentId || editData.component_id;
        try {
            const formData = new FormData();
            formData.append("name", editData.name);
            formData.append(
                "categoryId",
                editData.category_id || editData.categoryId,
            );
            formData.append("unit", editData.unit);
            if (editData.description)
                formData.append("description", editData.description);
            if (editData.imageFile)
                formData.append("image", editData.imageFile);

            await api.put(`/admin/components/${compId}`, formData);
            await fetchAdminData();
        } catch (error) {
            console.error(error);
            alert("Ошибка сохранения.");
        }
    };

    const toggleDeleteStatus = async (compId, isDeleted) => {
        try {
            await api.put(`/admin/components/${compId}`, {
                isDeleted: !isDeleted,
            });
            await fetchAdminData();

            if (
                selectedComponent &&
                (selectedComponent.componentId ||
                    selectedComponent.component_id) === compId
            ) {
                setEditData((prev) => ({
                    ...prev,
                    deletedAt: isDeleted ? null : new Date().toISOString(),
                    deleted_at: isDeleted ? null : new Date().toISOString(),
                }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const confirmSoftDelete = async () => {
        try {
            await api.delete(`/admin/components/${isConfirmDeleteOpen}`);
            await fetchAdminData();
            setIsConfirmDeleteOpen(null);
            setSelectedComponent(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddPrice = async () => {
        if (!newPriceVal || isNaN(newPriceVal) || newPriceVal <= 0) {
            alert("Введи корректную цену.");
            return;
        }

        const compId =
            selectedComponent.componentId || selectedComponent.component_id;
        try {
            await api.post(`/admin/components/${compId}/prices`, {
                price: parseFloat(newPriceVal),
            });
            await fetchAdminData();
            setNewPriceVal("");
        } catch (error) {
            console.error(error);
            alert("Ошибка при добавлении цены.");
        }
    };

    const confirmDeletePrice = async () => {
        try {
            await api.delete(
                `/admin/components/prices/${isConfirmPriceDeleteOpen}`,
            );
            await fetchAdminData();
            setIsConfirmPriceDeleteOpen(null);
        } catch (error) {
            console.error(error);
            alert("Ошибка при удалении записи цены.");
        }
    };

    const getCurrentPrice = (comp) => {
        if (!comp.prices || comp.prices.length === 0) return 0;
        const today = new Date();
        const activePrice = comp.prices.find(
            (p) =>
                new Date(p.endDate) >= today && new Date(p.startDate) <= today,
        );
        return activePrice ? activePrice.price : comp.prices[0].price;
    };

    const selectedCompInDb = selectedComponent
        ? components.find(
              (c) =>
                  (c.componentId || c.component_id) ===
                  (selectedComponent.componentId ||
                      selectedComponent.component_id),
          )
        : null;
    const selectedCompPrices = selectedCompInDb
        ? selectedCompInDb.prices || []
        : [];

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
                        const compId = c.componentId || c.component_id;
                        const catId = c.categoryId || c.category_id;
                        const isDeleted = !!(c.deletedAt || c.deleted_at);
                        const category = componentCategories.find(
                            (cat) =>
                                (cat.categoryId || cat.category_id) === catId,
                        );

                        return (
                            <tr
                                key={compId}
                                className={
                                    isDeleted
                                        ? "admin-bouquets-row-deleted"
                                        : ""
                                }
                            >
                                <td>{compId}</td>
                                <td>
                                    {c.imageUrl || c.image_url ? (
                                        <img
                                            src={getImageUrl(
                                                c.imageUrl || c.image_url,
                                            )}
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
                                    {getCurrentPrice(c)} ₽/{c.unit}
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={isDeleted}
                                        onChange={() =>
                                            toggleDeleteStatus(
                                                compId,
                                                isDeleted,
                                            )
                                        }
                                    />
                                </td>
                                <td>
                                    <button
                                        className="admin-bouquets-btn-delete"
                                        onClick={() =>
                                            setIsConfirmDeleteOpen(compId)
                                        }
                                    >
                                        Списать
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
                                            key={
                                                cat.categoryId ||
                                                cat.category_id
                                            }
                                            value={
                                                cat.categoryId ||
                                                cat.category_id
                                            }
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
                    title={`Редактор: ${editData.name}`}
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
                                    value={
                                        editData.category_id ||
                                        editData.categoryId ||
                                        ""
                                    }
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
                                            key={
                                                cat.categoryId ||
                                                cat.category_id
                                            }
                                            value={
                                                cat.categoryId ||
                                                cat.category_id
                                            }
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
                                        checked={
                                            !!(
                                                editData.deletedAt ||
                                                editData.deleted_at
                                            )
                                        }
                                        onChange={() =>
                                            toggleDeleteStatus(
                                                editData.componentId ||
                                                    editData.component_id,
                                                !!(
                                                    editData.deletedAt ||
                                                    editData.deleted_at
                                                ),
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
                            {(editData.imageUrl || editData.image_url) && (
                                <img
                                    src={getImageUrl(
                                        editData.imageUrl || editData.image_url,
                                    )}
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
            {isPricesOpen && selectedCompInDb && (
                <AdminModal
                    title={`История цен: ${selectedCompInDb.name}`}
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
                            {selectedCompPrices
                                .sort(
                                    (a, b) =>
                                        new Date(b.startDate) -
                                        new Date(a.startDate),
                                )
                                .map((p) => {
                                    const pId = p.priceId || p.price_id;
                                    return (
                                        <tr key={pId}>
                                            <td>{pId}</td>
                                            <td
                                                style={{
                                                    fontWeight: "bold",
                                                    color: "var(--color-blue)",
                                                }}
                                            >
                                                {p.price} ₽
                                            </td>
                                            <td>
                                                {p.startDate
                                                    ? p.startDate.split("T")[0]
                                                    : ""}
                                            </td>
                                            <td>
                                                <button
                                                    className="admin-bouquets-icon-btn"
                                                    onClick={() =>
                                                        setIsConfirmPriceDeleteOpen(
                                                            pId,
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

            {/* МОДАЛКА: ПОДТВЕРЖДЕНИЕ СМЯГЧЕННОГО УДАЛЕНИЯ КОМПОНЕНТА */}
            {isConfirmDeleteOpen !== null && (
                <AdminModal
                    title="Ты уверена, Лили?"
                    onClose={() => setIsConfirmDeleteOpen(null)}
                >
                    <div className="admin-bouquets-confirm">
                        <p>
                            Это действие спишет компонент и переведет его в
                            архив.
                        </p>
                        <div className="admin-bouquets-modal-controls">
                            <button
                                className="admin-bouquets-btn-delete"
                                onClick={confirmSoftDelete}
                            >
                                Да, списать
                            </button>
                            <button
                                className="admin-bouquets-btn-secondary"
                                onClick={() => setIsConfirmDeleteOpen(null)}
                            >
                               Отмена
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
                        <p>Ты хочешь стереть цену?</p>
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
