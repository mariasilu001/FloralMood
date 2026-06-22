import React, { useState, useEffect, useContext, useMemo } from "react";
import { DBcontext } from "../../../Database"; // НАША пуленепробиваемая база
import AdminModal from "../../admin/AdminModal";
import BouquetImage from "../Home/BouquetImage";

const AdminBouquets = () => {
  // 1. Достаем все таблицы из нашей оперативной памяти
  const {
    bouquets,
    setBouquets,
    components,
    bouquetComponents,
    setBouquetComponents,
    tags,
    bouquetTags,
    setBouquetTags,
    componentPrices,
  } = useContext(DBcontext);

  // 2. Идеальная реактивность: храним только ID!
  const [selectedBouquetId, setSelectedBouquetId] = useState(null);
  const [isAddBouquetOpen, setIsAddBouquetOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(null);
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);

  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [compModalTarget, setCompModalTarget] = useState(null); // 'new' или ID букета
  const [tempSelections, setTempSelections] = useState({});

  const [newBouquet, setNewBouquet] = useState({
    name: "",
    description: "",
    image_url: null,
    is_custom: false,
    selectedComponents: {},
  });

  const [editDesc, setEditDesc] = useState("");
  const [addTagId, setAddTagId] = useState("");

  // Вычисляем выбранный букет на лету. База обновится — обновится и модалка!
  const selectedBouquet = useMemo(() => {
    if (!selectedBouquetId || !bouquets) return null;
    return bouquets.find((b) => b._id === selectedBouquetId);
  }, [bouquets, selectedBouquetId]);

  // Синхронизируем описание при открытии модалки
  useEffect(() => {
    if (selectedBouquet) {
      setEditDesc(selectedBouquet.description || "");
    }
  }, [selectedBouquetId]); // Срабатывает только при смене букета

  // ==========================================
  // ЖЕСТКАЯ ЗАГЛУШКА БЕЗОПАСНОСТИ
  // ==========================================
  if (
    !bouquets ||
    !components ||
    !tags ||
    !bouquetComponents ||
    !componentPrices ||
    !bouquetTags
  ) {
    return (
      <div className="admin-bouquets-container">
        <div className="admin-dashboard-header">
          <h2>Синхронизирую базу букетов...</h2>
        </div>
      </div>
    );
  }

  // ==========================================
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (Расчеты на лету)
  // ==========================================

  const calculateBouquetPrice = (bId) => {
    const bComps = bouquetComponents.filter((bc) => bc.bouquet_id === bId);
    let cost = 0;
    bComps.forEach((bc) => {
      const prices = componentPrices.filter(
        (cp) => cp.component_id === bc.component_id,
      );
      prices.sort((a, b) => b.start_date.getTime() - a.start_date.getTime());
      const currentPrice = prices.length > 0 ? prices[0].price : 0;
      cost += currentPrice * bc.quantity;
    });
    return cost.toFixed(2);
  };

  // ==========================================
  // ЭКШЕНЫ БУКЕТОВ
  // ==========================================

  const toggleDeleteStatus = (bouquetId, isCurrentlyDeleted) => {
    // Мы не удаляем физически, мы ставим дату удаления (Иммитация Soft Delete)
    setBouquets(
      bouquets.map((b) =>
        b._id === bouquetId
          ? { ...b, deleted_at: isCurrentlyDeleted ? null : new Date() }
          : b,
      ),
    );
  };

  const confirmDeleteBouquet = () => {
    // Безжалостное уничтожение
    setBouquets(bouquets.filter((b) => b._id !== isConfirmDeleteOpen));

    // Зачистка связей, чтобы база не пухла от мусора
    setBouquetComponents(
      bouquetComponents.filter((bc) => bc.bouquet_id !== isConfirmDeleteOpen),
    );
    setBouquetTags(
      bouquetTags.filter((bt) => bt.bouquet_id !== isConfirmDeleteOpen),
    );

    setIsConfirmDeleteOpen(null);
    setSelectedBouquetId(null);
  };

  // ==========================================
  // ЭКШЕНЫ ИЗОБРАЖЕНИЙ (Локальные Blob)
  // ==========================================

  const handleImageUploadNew = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewBouquet((prev) => ({ ...prev, image_url: file }));
    }
  };

  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && selectedBouquet) {
      setBouquets(
        bouquets.map((b) =>
          b._id === selectedBouquet._id ? { ...b, image_url: file } : b,
        ),
      );
    }
  };

  const handleSaveDescription = () => {
    setBouquets(
      bouquets.map((b) =>
        b._id === selectedBouquet._id ? { ...b, description: editDesc } : b,
      ),
    );
    alert("Описание обновлено.");
  };

  // ==========================================
  // СОЗДАНИЕ БУКЕТА
  // ==========================================

  const handleAddBouquet = (e) => {
    e.preventDefault();
    if (!newBouquet.name.trim()) return;

    // Генерируем новый BigInt ID
    const maxId = bouquets.reduce((max, b) => (b._id > max ? b._id : max), 0n);
    const newId = maxId + 1n;

    const bqObj = {
      _id: newId,
      name: newBouquet.name.trim(),
      description: newBouquet.description.trim(),
      image_url: newBouquet.image_url,
      created_at: new Date(),
      deleted_at: null,
      is_custom: newBouquet.is_custom,
    };

    // Сохраняем связи компонентов
    let maxBcId = bouquetComponents.reduce(
      (max, bc) => (bc._id > max ? bc._id : max),
      0n,
    );
    const newCompsList = Object.entries(newBouquet.selectedComponents).map(
      ([cIdStr, qty]) => {
        maxBcId += 1n;
        return {
          _id: maxBcId,
          bouquet_id: newId,
          component_id: BigInt(cIdStr),
          quantity: parseFloat(qty),
        };
      },
    );

    // Записываем всё в таблицы
    setBouquets([...bouquets, bqObj]);
    setBouquetComponents([...bouquetComponents, ...newCompsList]);

    setIsAddBouquetOpen(false);
    setNewBouquet({
      name: "",
      description: "",
      image_url: null,
      is_custom: false,
      selectedComponents: {},
    });
  };

  // ==========================================
  // ТЕГИ И КОМПОНЕНТЫ
  // ==========================================

  const removeComponentFromBouquet = (compIdToRemove) => {
    setBouquetComponents(
      bouquetComponents.filter(
        (bc) =>
          !(
            bc.bouquet_id === selectedBouquet._id &&
            bc.component_id === compIdToRemove
          ),
      ),
    );
  };

  const removeTagFromBouquet = (tagIdToRemove) => {
    setBouquetTags(
      bouquetTags.filter(
        (bt) =>
          !(
            bt.bouquet_id === selectedBouquet._id && bt.tag_id === tagIdToRemove
          ),
      ),
    );
  };

  const handleAddTagToExisting = () => {
    if (!addTagId) return;
    const tId = BigInt(addTagId);

    // Защита от дублей
    const alreadyExists = bouquetTags.some(
      (bt) => bt.bouquet_id === selectedBouquet._id && bt.tag_id === tId,
    );
    if (alreadyExists) {
      alert("Этот тег уже привязан.");
      return;
    }

    const maxId = bouquetTags.reduce(
      (max, bt) => (bt._id > max ? bt._id : max),
      0n,
    );
    const newBt = {
      _id: maxId + 1n,
      bouquet_id: selectedBouquet._id,
      tag_id: tId,
    };
    setBouquetTags([...bouquetTags, newBt]);
    setIsAddTagOpen(false);
    setAddTagId("");
  };

  const openCompModal = (target) => {
    setCompModalTarget(target);
    if (target === "new") {
      setTempSelections({ ...newBouquet.selectedComponents });
    } else {
      const currentComps = bouquetComponents.filter(
        (bc) => bc.bouquet_id === target,
      );
      const selections = {};
      currentComps.forEach((bc) => {
        selections[String(bc.component_id)] = bc.quantity;
      });
      setTempSelections(selections);
    }
    setIsCompModalOpen(true);
  };

  const handleCompSelectionToggle = (compIdStr, isChecked) => {
    setTempSelections((prev) => {
      const upd = { ...prev };
      if (isChecked) {
        up单d[compIdStr] = 1;
      } else {
        delete upd[compIdStr];
      }
      return upd;
    });
  };

  const handleCompQtyChange = (compIdStr, qty) => {
    setTempSelections((prev) => {
      if (!prev[compIdStr] && qty > 0) return prev;
      return { ...prev, [compIdStr]: qty };
    });
  };

  const saveCompSelections = () => {
    if (compModalTarget === "new") {
      setNewBouquet((prev) => ({
        ...prev,
        selectedComponents: tempSelections,
      }));
    } else {
      // Удаляем старые связи для этого букета
      const otherComps = bouquetComponents.filter(
        (bc) => bc.bouquet_id !== compModalTarget,
      );

      // Создаем новые связи
      let maxBcId = bouquetComponents.reduce(
        (max, bc) => (bc._id > max ? bc._id : max),
        0n,
      );
      const newCompsList = Object.entries(tempSelections).map(
        ([cIdStr, qty]) => {
          maxBcId += 1n;
          return {
            _id: maxBcId,
            bouquet_id: compModalTarget,
            component_id: BigInt(cIdStr),
            quantity: parseFloat(qty),
          };
        },
      );

      setBouquetComponents([...otherComps, ...newCompsList]);
    }
    setIsCompModalOpen(false);
  };

  // ==========================================
  // РЕНДЕР ГЛАВНОЙ ТАБЛИЦЫ
  // ==========================================

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
            <th>Изображение</th>
            <th>Название</th>
            <th>Тип</th>
            <th>Удален / Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {bouquets.map((b) => {
            const isDeleted = !!b.deleted_at;

            // Проверяем, есть ли у букета удаленные компоненты
            const bComps = bouquetComponents.filter(
              (bc) => bc.bouquet_id === b._id,
            );
            const hasDeletedComponents = bComps.some((bc) => {
              const c = components.find((comp) => comp._id === bc.component_id);
              return c ? !!c.deleted_at : true; // Если компонента вообще нет в базе — это тоже ошибка
            });

            return (
              <tr
                key={String(b._id)}
                className={
                  isDeleted || hasDeletedComponents
                    ? "admin-bouquets-row-deleted"
                    : ""
                }
              >
                <td>
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      overflow: "hidden",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    <BouquetImage imageBlob={b.image_url} altText={b.name} />
                  </div>
                </td>
                <td
                  className="admin-bouquets-cell-clickable"
                  onClick={() => setSelectedBouquetId(b._id)}
                >
                  {b.name}
                </td>
                <td>{b.is_custom ? "Кастомный" : "Стандарт"}</td>
                <td>
                  {hasDeletedComponents ? (
                    <span
                      style={{
                        color: "var(--color-error)",
                        fontWeight: "bold",
                        fontSize: "12px",
                      }}
                    >
                      Отсутствуют компоненты
                    </span>
                  ) : (
                    <input
                      type="checkbox"
                      checked={isDeleted}
                      onChange={() => toggleDeleteStatus(b._id, isDeleted)}
                    />
                  )}
                </td>
                <td>
                  <button
                    className="admin-bouquets-btn-delete"
                    onClick={() => setIsConfirmDeleteOpen(b._id)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ========================================== */}
      {/* МОДАЛКА: ДЕТАЛИ БУКЕТА (Редактирование) */}
      {/* ========================================== */}
      {selectedBouquet && (
        <AdminModal
          title={`Детали: ${selectedBouquet.name}`}
          onClose={() => setSelectedBouquetId(null)}
        >
          <div className="admin-desc-edit-group">
            <label>Изображение букета:</label>
            <div
              style={{
                width: "150px",
                height: "150px",
                marginBottom: "12px",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <BouquetImage
                imageBlob={selectedBouquet.image_url}
                altText={selectedBouquet.name}
              />
            </div>

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
              onClick={() => openCompModal(selectedBouquet._id)}
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
            <strong>{calculateBouquetPrice(selectedBouquet._id)} ₽</strong>
          </p>

          <h3 className="admin-subsection-title">Теги букета:</h3>
          <div className="admin-tags-list">
            {/* Динамически вычисляем теги этого букета */}
            {(() => {
              const bTagsLinks = bouquetTags.filter(
                (bt) => bt.bouquet_id === selectedBouquet._id,
              );
              if (bTagsLinks.length === 0)
                return <span className="admin-text-muted">Нет тегов</span>;

              return bTagsLinks.map((bt) => {
                const actualTag = tags.find((t) => t._id === bt.tag_id);
                return (
                  <span key={String(bt._id)} className="admin-tag-badge">
                    {actualTag ? actualTag.name : "Неизвестный тег"}
                    <button onClick={() => removeTagFromBouquet(bt.tag_id)}>
                      &times;
                    </button>
                  </span>
                );
              });
            })()}
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
              {/* Динамически вычисляем состав */}
              {(() => {
                const bComps = bouquetComponents.filter(
                  (bc) => bc.bouquet_id === selectedBouquet._id,
                );
                return bComps.map((bc) => {
                  const actualComp = components.find(
                    (c) => c._id === bc.component_id,
                  );
                  const isCompDeleted = actualComp
                    ? !!actualComp.deleted_at
                    : true;

                  return (
                    <tr key={String(bc._id)}>
                      <td
                        style={
                          isCompDeleted
                            ? {
                                color: "var(--color-error)",
                                textDecoration: "line-through",
                              }
                            : {}
                        }
                      >
                        {actualComp ? actualComp.name : "Удаленный компонент"}{" "}
                        {isCompDeleted && "(Удален)"}
                      </td>
                      <td>
                        {bc.quantity} {actualComp ? actualComp.unit : "шт."}
                      </td>
                      <td>
                        <button
                          className="admin-bouquets-icon-btn"
                          onClick={() =>
                            removeComponentFromBouquet(bc.component_id)
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
                });
              })()}
            </tbody>
          </table>
        </AdminModal>
      )}

      {/* ========================================== */}
      {/* МОДАЛКА: ВЫБОР КОМПОНЕНТОВ */}
      {/* ========================================== */}
      {isCompModalOpen && (
        <AdminModal
          title="Выбор компонентов"
          onClose={() => setIsCompModalOpen(false)}
        >
          <div className="admin-comp-grid">
            {components.map((c) => {
              const cIdStr = String(c._id);
              const isSelected = !!tempSelections[cIdStr];
              const qty = tempSelections[cIdStr] || "";
              return (
                <label
                  key={cIdStr}
                  className={`admin-comp-card ${isSelected ? "admin-comp-card--selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="admin-hidden-checkbox"
                    checked={isSelected}
                    onChange={(e) =>
                      handleCompSelectionToggle(cIdStr, e.target.checked)
                    }
                  />
                  <div className="admin-comp-card-image">
                    <div
                      style={{ width: "100%", height: "100%", display: "flex" }}
                    >
                      <BouquetImage imageBlob={c.image_url} altText={c.name} />
                    </div>
                  </div>
                  <div className="admin-comp-card-info">
                    <h4 className="admin-comp-card-title">{c.name}</h4>
                    <div className="admin-comp-card-action">
                      {isSelected ? (
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={qty}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            handleCompQtyChange(cIdStr, e.target.value)
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
            Закрепить выбор
          </button>
        </AdminModal>
      )}

      {/* ========================================== */}
      {/* МОДАЛКА: ПРИВЯЗАТЬ ТЕГ */}
      {/* ========================================== */}
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
                <option key={String(t._id)} value={String(t._id)}>
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

      {/* ========================================== */}
      {/* МОДАЛКА: СОЗДАТЬ НОВЫЙ БУКЕТ */}
      {/* ========================================== */}
      {isAddBouquetOpen && (
        <AdminModal
          title="Создание нового букета"
          onClose={() => setIsAddBouquetOpen(false)}
        >
          <form className="admin-bouquets-form" onSubmit={handleAddBouquet}>
            <label>Имя букета:</label>
            <input
              type="text"
              value={newBouquet.name}
              onChange={(e) =>
                setNewBouquet({ ...newBouquet, name: e.target.value })
              }
              required
            />

            <label>Описание:</label>
            <textarea
              value={newBouquet.description}
              onChange={(e) =>
                setNewBouquet({ ...newBouquet, description: e.target.value })
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
                onChange={handleImageUploadNew}
                className="admin-file-upload-input"
              />
            </label>
            {newBouquet.image_url && (
              <div
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  marginBottom: "16px",
                }}
              >
                <BouquetImage
                  imageBlob={newBouquet.image_url}
                  altText="Preview"
                />
              </div>
            )}

            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                checked={newBouquet.is_custom}
                onChange={(e) =>
                  setNewBouquet({ ...newBouquet, is_custom: e.target.checked })
                }
              />
              Это кастомный букет?
            </label>

            <h3 className="admin-subsection-title">Состав букета:</h3>
            <div className="admin-selected-comps-preview">
              {Object.keys(newBouquet.selectedComponents).length === 0 ? (
                <p className="admin-text-muted">Компоненты еще не выбраны.</p>
              ) : (
                <ul className="admin-simple-list">
                  {Object.entries(newBouquet.selectedComponents).map(
                    ([idStr, qty]) => {
                      const c = components.find(
                        (comp) => comp._id === BigInt(idStr),
                      );
                      return (
                        <li key={idStr}>
                          {c ? c.name : "Неизвестно"} — {qty} {c ? c.unit : ""}
                        </li>
                      );
                    },
                  )}
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

      {/* ========================================== */}
      {/* МОДАЛКА: ПОДТВЕРЖДЕНИЕ УДАЛЕНИЯ */}
      {/* ========================================== */}
      {isConfirmDeleteOpen !== null && (
        <AdminModal
          title="Ты уверена, Лили?"
          onClose={() => setIsConfirmDeleteOpen(null)}
        >
          <div className="admin-bouquets-confirm">
            <p>Это действие навсегда уничтожит букет.</p>
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
                Отмена
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
};

export default AdminBouquets;
