import React, { useState, useEffect, useContext, useMemo } from "react";
import { DBcontext } from "../../../Database"; // НАША пуленепробиваемая база
import AdminModal from "../../admin/AdminModal";
import BouquetImage from "../Home/BouquetImage"; // Наш безопасный рендерер

const AdminComponents = () => {
  // 1. Забираем таблицы из оперативной памяти
  const {
    components,
    setComponents,
    componentCategories,
    componentPrices,
    setComponentPrices,
  } = useContext(DBcontext);

  // 2. Идеальная реактивность: храним только ID!
  const [selectedComponentId, setSelectedComponentId] = useState(null);
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
    image_url: null, // Храним сам File/Blob
    unit: "шт",
    initial_price: "",
  });

  const [newPriceVal, setNewPriceVal] = useState("");

  // Вычисляем выбранный компонент на лету
  const selectedComponent = useMemo(() => {
    if (!selectedComponentId || !components) return null;
    return components.find((c) => c._id === selectedComponentId);
  }, [components, selectedComponentId]);

  // Синхронизируем стейт редактирования при открытии модалки
  useEffect(() => {
    if (selectedComponent) {
      setEditData({
        name: selectedComponent.name || "",
        category_id: String(selectedComponent.category_id || ""),
        unit: selectedComponent.unit || "шт",
        description: selectedComponent.description || "",
        image_url: selectedComponent.image_url,
        deleted_at: selectedComponent.deleted_at,
      });
    }
  }, [selectedComponent]);

  // Вычисляем историю цен для выбранного компонента
  const selectedCompPrices = useMemo(() => {
    if (!selectedComponentId || !componentPrices) return [];
    return componentPrices.filter(
      (cp) => cp.component_id === selectedComponentId,
    );
  }, [componentPrices, selectedComponentId]);

  // ==========================================
  // ЖЕСТКАЯ ЗАГЛУШКА БЕЗОПАСНОСТИ
  // ==========================================
  if (!components || !componentCategories || !componentPrices) {
    return (
      <div className="admin-bouquets-container">
        <div className="admin-dashboard-header">
          <h2>Синхронизирую склад компонентов...</h2>
        </div>
      </div>
    );
  }

  // Вспомогательная функция для получения текущей (последней) цены
  const getCurrentPrice = (compId) => {
    const prices = componentPrices.filter((cp) => cp.component_id === compId);
    if (prices.length === 0) return "0.00";
    // Сортируем от новых к старым
    prices.sort((a, b) => b.start_date.getTime() - a.start_date.getTime());
    return parseFloat(prices[0].price).toFixed(2);
  };

  // ==========================================
  // ЭКШЕНЫ СОЗДАНИЯ / РЕДАКТИРОВАНИЯ
  // ==========================================

  const handleNewImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewComp((prev) => ({ ...prev, image_url: file }));
    }
  };

  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditData((prev) => ({ ...prev, image_url: file }));
    }
  };

  const handleCreateComponent = (e) => {
    e.preventDefault();
    if (!newComp.name || !newComp.category_id || !newComp.initial_price) {
      alert("Имя, категория и стартовая цена обязательны. Я требую порядка.");
      return;
    }

    // Генерируем BigInt ID для компонента
    const maxCompId = components.reduce(
      (max, c) => (c._id > max ? c._id : max),
      0n,
    );
    const newCompId = maxCompId + 1n;

    const newCompObj = {
      _id: newCompId,
      name: newComp.name.trim(),
      description: newComp.description.trim() || null,
      category_id: BigInt(newComp.category_id),
      image_url: newComp.image_url,
      unit: newComp.unit.trim(),
      created_at: new Date(),
      deleted_at: null,
    };

    // Генерируем BigInt ID для стартовой цены
    const maxPriceId = componentPrices.reduce(
      (max, p) => (p._id > max ? p._id : max),
      0n,
    );
    const newPriceObj = {
      _id: maxPriceId + 1n,
      component_id: newCompId,
      price: parseFloat(newComp.initial_price),
      start_date: new Date(),
    };

    // Транзакция: синхронно сохраняем и компонент, и его цену
    setComponents([...components, newCompObj]);
    setComponentPrices([...componentPrices, newPriceObj]);

    setIsAddOpen(false);
    setNewComp({
      name: "",
      description: "",
      category_id: "",
      image_url: null,
      unit: "шт",
      initial_price: "",
    });
    alert("Компонент успешно зарегистрирован на складе.");
  };

  const handleSaveEdit = () => {
    if (!editData.name || !editData.category_id) {
      alert("Имя и категория не могут быть пустыми.");
      return;
    }

    const updatedComponents = components.map((c) => {
      if (c._id === selectedComponentId) {
        return {
          ...c,
          name: editData.name.trim(),
          category_id: BigInt(editData.category_id),
          unit: editData.unit.trim(),
          description: editData.description.trim() || null,
          image_url: editData.image_url,
        };
      }
      return c;
    });

    setComponents(updatedComponents);
    alert("Изменения сохранены.");
  };

  const toggleDeleteStatus = (compId, isDeleted) => {
    setComponents(
      components.map((c) =>
        c._id === compId
          ? { ...c, deleted_at: isDeleted ? null : new Date() }
          : c,
      ),
    );
  };

  const confirmHardDelete = () => {
    // Безжалостно удаляем сам компонент
    setComponents(components.filter((c) => c._id !== isConfirmDeleteOpen));
    // Удаляем историю его цен, чтобы не засорять базу
    setComponentPrices(
      componentPrices.filter((cp) => cp.component_id !== isConfirmDeleteOpen),
    );

    setIsConfirmDeleteOpen(null);
    setSelectedComponentId(null);
  };

  // ==========================================
  // ЭКШЕНЫ ЦЕН
  // ==========================================

  const handleAddPrice = () => {
    if (!newPriceVal || isNaN(newPriceVal) || newPriceVal <= 0) {
      alert("Введи корректную цену.");
      return;
    }

    const maxPriceId = componentPrices.reduce(
      (max, p) => (p._id > max ? p._id : max),
      0n,
    );
    const newPriceObj = {
      _id: maxPriceId + 1n,
      component_id: selectedComponentId,
      price: parseFloat(newPriceVal),
      start_date: new Date(), // Цена начинает действовать прямо сейчас
    };

    setComponentPrices([...componentPrices, newPriceObj]);
    setNewPriceVal("");
  };

  const confirmDeletePrice = () => {
    setComponentPrices(
      componentPrices.filter((p) => p._id !== isConfirmPriceDeleteOpen),
    );
    setIsConfirmPriceDeleteOpen(null);
  };

  // ==========================================
  // РЕНДЕР
  // ==========================================

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
            const isDeleted = !!c.deleted_at;
            const category = componentCategories.find(
              (cat) => cat._id === c.category_id,
            );

            return (
              <tr
                key={String(c._id)}
                className={isDeleted ? "admin-bouquets-row-deleted" : ""}
              >
                <td>{String(c._id)}</td>
                <td>
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "6px",
                      overflow: "hidden",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    <BouquetImage imageBlob={c.image_url} altText={c.name} />
                  </div>
                </td>
                <td
                  className="admin-bouquets-cell-clickable"
                  onClick={() => setSelectedComponentId(c._id)}
                >
                  {c.name}
                </td>
                <td>{category ? category.name : "—"}</td>
                <td>
                  <strong>{getCurrentPrice(c._id)} ₽</strong> / {c.unit}
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={isDeleted}
                    onChange={() => toggleDeleteStatus(c._id, isDeleted)}
                  />
                </td>
                <td>
                  <button
                    className="admin-bouquets-btn-delete"
                    onClick={() => setIsConfirmDeleteOpen(c._id)}
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
                    setNewComp({ ...newComp, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="admin-form-col">
                <label>Категория:</label>
                <select
                  value={newComp.category_id}
                  onChange={(e) =>
                    setNewComp({ ...newComp, category_id: e.target.value })
                  }
                  className="admin-styled-select"
                  required
                >
                  <option value="">-- Выбери --</option>
                  {componentCategories.map((cat) => (
                    <option key={String(cat._id)} value={String(cat._id)}>
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
                    setNewComp({ ...newComp, unit: e.target.value })
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
                    setNewComp({ ...newComp, initial_price: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <label>Описание:</label>
            <textarea
              value={newComp.description}
              onChange={(e) =>
                setNewComp({ ...newComp, description: e.target.value })
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
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  marginTop: "12px",
                }}
              >
                <BouquetImage imageBlob={newComp.image_url} altText="Preview" />
              </div>
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
          onClose={() => setSelectedComponentId(null)}
        >
          <div className="admin-bouquets-form">
            <div className="admin-form-row">
              <div className="admin-form-col">
                <label>Название:</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                />
              </div>
              <div className="admin-form-col">
                <label>Категория:</label>
                <select
                  value={editData.category_id}
                  onChange={(e) =>
                    setEditData({ ...editData, category_id: e.target.value })
                  }
                  className="admin-styled-select"
                >
                  {componentCategories.map((cat) => (
                    <option key={String(cat._id)} value={String(cat._id)}>
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
                  value={editData.unit}
                  onChange={(e) =>
                    setEditData({ ...editData, unit: e.target.value })
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
                        selectedComponentId,
                        !!editData.deleted_at,
                      )
                    }
                    style={{ marginRight: "8px" }}
                  />
                  Пометить удаленным
                </label>
              </div>
            </div>

            <label>Описание:</label>
            <div className="admin-desc-edit-wrapper" style={{ marginTop: 0 }}>
              <textarea
                value={editData.description}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
              />
            </div>

            <div
              className="admin-desc-edit-group"
              style={{ marginTop: "16px" }}
            >
              <label>Фотография компонента:</label>
              {editData.image_url && (
                <div
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    marginBottom: "12px",
                  }}
                >
                  <BouquetImage
                    imageBlob={editData.image_url}
                    altText="Current"
                  />
                </div>
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

          <table className="admin-bouquets-table" style={{ marginTop: "24px" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Цена</th>
                <th>Дата установки</th>
                <th>Удалить</th>
              </tr>
            </thead>
            <tbody>
              {[...selectedCompPrices]
                .sort((a, b) => b.start_date.getTime() - a.start_date.getTime())
                .map((p) => (
                  <tr key={String(p._id)}>
                    <td>{String(p._id)}</td>
                    <td
                      style={{ fontWeight: "bold", color: "var(--color-blue)" }}
                    >
                      {p.price} ₽
                    </td>
                    <td>{p.start_date.toLocaleDateString("ru-RU")}</td>
                    <td>
                      <button
                        className="admin-bouquets-icon-btn"
                        onClick={() => setIsConfirmPriceDeleteOpen(p._id)}
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

      {/* МОДАЛКА: ПОДТВЕРЖДЕНИЕ ЖЕСТКОГО УДАЛЕНИЯ */}
      {isConfirmDeleteOpen !== null && (
        <AdminModal
          title="Ты уверена, Лили?"
          onClose={() => setIsConfirmDeleteOpen(null)}
        >
          <div className="admin-bouquets-confirm">
            <p>Это действие навсегда уничтожит компонент из базы данных.</p>
            <div className="admin-bouquets-modal-controls">
              <button
                className="admin-bouquets-btn-delete"
                onClick={confirmHardDelete}
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
            <p>Ты хочешь стереть эту цену из истории?</p>
            <div className="admin-bouquets-modal-controls">
              <button
                className="admin-bouquets-btn-delete"
                onClick={confirmDeletePrice}
              >
                Да, стереть
              </button>
              <button
                className="admin-bouquets-btn-secondary"
                onClick={() => setIsConfirmPriceDeleteOpen(null)}
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
