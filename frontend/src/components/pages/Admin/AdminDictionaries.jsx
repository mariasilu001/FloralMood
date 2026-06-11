import React, { useState, useContext, useMemo } from "react";
import { DBcontext } from "../../../Database"; // Наша автономная база данных
import AdminModal from "../../admin/AdminModal";

const AdminDictionaries = () => {
  // 1. Забираем ВСЕ справочники из оперативной памяти
  const {
    tags,
    setTags,
    eventTypes,
    setEventTypes,
    globalEvents,
    setGlobalEvents,
    eventTypeTags,
    setEventTypeTags,
    paymentMethods,
    setPaymentMethods,
    deliverTimeSlots,
    setDeliverTimeSlots,
    componentCategories,
    setComponentCategories,
  } = useContext(DBcontext);

  // 2. Стейт вкладок (Какой справочник сейчас открыт)
  const [activeTab, setActiveTab] = useState("tags");

  // 3. Стейты модалки и формы
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  // ==========================================
  // ЖЕСТКАЯ ЗАГЛУШКА БЕЗОПАСНОСТИ
  // ==========================================
  if (
    !tags ||
    !eventTypes ||
    !globalEvents ||
    !eventTypeTags ||
    !paymentMethods ||
    !deliverTimeSlots ||
    !componentCategories
  ) {
    return (
      <div
        className="admin-bouquets-container"
        style={{ textAlign: "center", padding: "50px" }}
      >
        <h3 style={{ color: "var(--color-primary)" }}>
          Синхронизирую системные реестры...
        </h3>
      </div>
    );
  }

  // ==========================================
  // КОНФИГУРАЦИЯ ВКЛАДОК
  // ==========================================
  const tabs = [
    { id: "tags", label: "Теги букетов" },
    { id: "eventTypes", label: "Типы ивентов" },
    { id: "globalEvents", label: "Глобальные праздники" },
    { id: "eventTypeTags", label: "Связи: Ивенты + Теги" },
    { id: "paymentMethods", label: "Методы оплаты" },
    { id: "deliverTimeSlots", label: "Слоты доставки" },
    { id: "categories", label: "Категории компонентов" },
  ];

  // ==========================================
  // ЭКШЕНЫ СОХРАНЕНИЯ (Магия одного обработчика)
  // ==========================================
  const handleSave = (e) => {
    e.preventDefault();

    switch (activeTab) {
      case "tags": {
        const maxId = tags.reduce((m, t) => (t._id > m ? t._id : m), 0n);
        setTags([...tags, { _id: maxId + 1n, name: formData.name }]);
        break;
      }
      case "eventTypes": {
        const maxId = eventTypes.reduce((m, t) => (t._id > m ? t._id : m), 0n);
        setEventTypes([
          ...eventTypes,
          { _id: maxId + 1n, name: formData.name },
        ]);
        break;
      }
      case "globalEvents": {
        const maxId = globalEvents.reduce(
          (m, t) => (t._id > m ? t._id : m),
          0n,
        );
        setGlobalEvents([
          ...globalEvents,
          {
            _id: maxId + 1n,
            event_type_id: BigInt(formData.event_type_id),
            name: formData.name,
            event_date: formData.event_date,
          },
        ]);
        break;
      }
      case "eventTypeTags": {
        const maxId = eventTypeTags.reduce(
          (m, t) => (t._id > m ? t._id : m),
          0n,
        );
        // Защита от дублей
        const exists = eventTypeTags.some(
          (et) =>
            et.event_type_id === BigInt(formData.event_type_id) &&
            et.tag_id === BigInt(formData.tag_id),
        );
        if (exists) {
          alert("Такая связь уже существует!");
          return;
        }
        setEventTypeTags([
          ...eventTypeTags,
          {
            _id: maxId + 1n,
            event_type_id: BigInt(formData.event_type_id),
            tag_id: BigInt(formData.tag_id),
          },
        ]);
        break;
      }
      case "paymentMethods": {
        const maxId = paymentMethods.reduce(
          (m, t) => (t._id > m ? t._id : m),
          0n,
        );
        setPaymentMethods([
          ...paymentMethods,
          { _id: maxId + 1n, name: formData.name, is_active: true },
        ]);
        break;
      }
      case "deliverTimeSlots": {
        const maxId = deliverTimeSlots.reduce(
          (m, t) => (t._id > m ? t._id : m),
          0n,
        );
        setDeliverTimeSlots([
          ...deliverTimeSlots,
          {
            _id: maxId + 1n,
            name: formData.name,
            start_time: formData.start_time + ":00",
            end_time: formData.end_time + ":00",
          },
        ]);
        break;
      }
      case "categories": {
        const maxId = componentCategories.reduce(
          (m, t) => (t._id > m ? t._id : m),
          0n,
        );
        setComponentCategories([
          ...componentCategories,
          {
            _id: maxId + 1n,
            name: formData.name,
            created_at: new Date(),
            deleted_at: null,
          },
        ]);
        break;
      }
      default:
        break;
    }

    setIsModalOpen(false);
    setFormData({});
  };

  // ==========================================
  // ЭКШЕНЫ УДАЛЕНИЯ / ПЕРЕКЛЮЧЕНИЯ
  // ==========================================
  const handleDelete = (id, tab) => {
    if (!window.confirm("Удалить эту запись?")) return;

    if (tab === "tags") setTags(tags.filter((t) => t._id !== id));
    if (tab === "eventTypes")
      setEventTypes(eventTypes.filter((t) => t._id !== id));
    if (tab === "globalEvents")
      setGlobalEvents(globalEvents.filter((t) => t._id !== id));
    if (tab === "eventTypeTags")
      setEventTypeTags(eventTypeTags.filter((t) => t._id !== id));
    if (tab === "deliverTimeSlots")
      setDeliverTimeSlots(deliverTimeSlots.filter((t) => t._id !== id));
  };

  const toggleStatus = (id, tab, currentStatus) => {
    if (tab === "paymentMethods") {
      setPaymentMethods(
        paymentMethods.map((p) =>
          p._id === id ? { ...p, is_active: !currentStatus } : p,
        ),
      );
    }
    if (tab === "categories") {
      setComponentCategories(
        componentCategories.map((c) =>
          c._id === id
            ? { ...c, deleted_at: currentStatus ? null : new Date() }
            : c,
        ),
      );
    }
  };

  // ==========================================
  // ДИНАМИЧЕСКИЙ РЕНДЕР ТАБЛИЦ
  // ==========================================
  const renderTable = () => {
    switch (activeTab) {
      case "tags":
      case "eventTypes":
        const data = activeTab === "tags" ? tags : eventTypes;
        return (
          <table className="admin-bouquets-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={String(item._id)}>
                  <td>{String(item._id)}</td>
                  <td style={{ fontWeight: "bold" }}>{item.name}</td>
                  <td>
                    <button
                      className="admin-bouquets-btn-delete"
                      onClick={() => handleDelete(item._id, activeTab)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "globalEvents":
        return (
          <table className="admin-bouquets-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Праздник</th>
                <th>Тип ивента</th>
                <th>Дата (ММ-ДД)</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {globalEvents.map((item) => {
                const type = eventTypes.find(
                  (et) => et._id === item.event_type_id,
                );
                return (
                  <tr key={String(item._id)}>
                    <td>{String(item._id)}</td>
                    <td style={{ fontWeight: "bold" }}>{item.name}</td>
                    <td>{type ? type.name : "—"}</td>
                    <td>{item.event_date}</td>
                    <td>
                      <button
                        className="admin-bouquets-btn-delete"
                        onClick={() => handleDelete(item._id, activeTab)}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );

      case "eventTypeTags":
        return (
          <table className="admin-bouquets-table">
            <thead>
              <tr>
                <th>ID связи</th>
                <th>Тип ивента</th>
                <th>Привязанный Тег</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {eventTypeTags.map((item) => {
                const type = eventTypes.find(
                  (et) => et._id === item.event_type_id,
                );
                const tag = tags.find((t) => t._id === item.tag_id);
                return (
                  <tr key={String(item._id)}>
                    <td>{String(item._id)}</td>
                    <td
                      style={{
                        fontWeight: "bold",
                        color: "var(--color-primary)",
                      }}
                    >
                      {type ? type.name : "—"}
                    </td>
                    <td
                      style={{ fontWeight: "bold", color: "var(--color-blue)" }}
                    >
                      #{tag ? tag.name : "—"}
                    </td>
                    <td>
                      <button
                        className="admin-bouquets-btn-delete"
                        onClick={() => handleDelete(item._id, activeTab)}
                      >
                        Разорвать
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );

      case "paymentMethods":
        return (
          <table className="admin-bouquets-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Метод оплаты</th>
                <th>Статус (Активен)</th>
              </tr>
            </thead>
            <tbody>
              {paymentMethods.map((item) => (
                <tr
                  key={String(item._id)}
                  className={
                    !item.is_active ? "admin-bouquets-row-deleted" : ""
                  }
                >
                  <td>{String(item._id)}</td>
                  <td style={{ fontWeight: "bold" }}>{item.name}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={item.is_active}
                      onChange={() =>
                        toggleStatus(item._id, activeTab, item.is_active)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "deliverTimeSlots":
        return (
          <table className="admin-bouquets-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Название слота</th>
                <th>Начало</th>
                <th>Конец</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {deliverTimeSlots.map((item) => (
                <tr key={String(item._id)}>
                  <td>{String(item._id)}</td>
                  <td style={{ fontWeight: "bold" }}>{item.name}</td>
                  <td>{item.start_time}</td>
                  <td>{item.end_time}</td>
                  <td>
                    <button
                      className="admin-bouquets-btn-delete"
                      onClick={() => handleDelete(item._id, activeTab)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "categories":
        return (
          <table className="admin-bouquets-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Категория</th>
                <th>Списана (Удалена)</th>
              </tr>
            </thead>
            <tbody>
              {componentCategories.map((item) => {
                const isDeleted = !!item.deleted_at;
                return (
                  <tr
                    key={String(item._id)}
                    className={isDeleted ? "admin-bouquets-row-deleted" : ""}
                  >
                    <td>{String(item._id)}</td>
                    <td style={{ fontWeight: "bold" }}>{item.name}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={isDeleted}
                        onChange={() =>
                          toggleStatus(item._id, activeTab, isDeleted)
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      default:
        return null;
    }
  };

  // ==========================================
  // ДИНАМИЧЕСКИЙ РЕНДЕР ФОРМЫ В МОДАЛКЕ
  // ==========================================
  const renderFormFields = () => {
    switch (activeTab) {
      case "tags":
      case "eventTypes":
      case "paymentMethods":
      case "categories":
        return (
          <>
            <label>Название:</label>
            <input
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </>
        );
      case "globalEvents":
        return (
          <>
            <label>Название праздника:</label>
            <input
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <label>Тип ивента:</label>
            <select
              className="admin-styled-select"
              required
              value={formData.event_type_id || ""}
              onChange={(e) =>
                setFormData({ ...formData, event_type_id: e.target.value })
              }
            >
              <option value="">-- Выбери --</option>
              {eventTypes.map((et) => (
                <option key={String(et._id)} value={String(et._id)}>
                  {et.name}
                </option>
              ))}
            </select>
            <label>Дата (строго ММ-ДД):</label>
            <input
              type="text"
              placeholder="Например: 12-31"
              required
              maxLength="5"
              value={formData.event_date || ""}
              onChange={(e) =>
                setFormData({ ...formData, event_date: e.target.value })
              }
            />
          </>
        );
      case "eventTypeTags":
        return (
          <>
            <label>Тип ивента:</label>
            <select
              className="admin-styled-select"
              required
              value={formData.event_type_id || ""}
              onChange={(e) =>
                setFormData({ ...formData, event_type_id: e.target.value })
              }
            >
              <option value="">-- Выбери --</option>
              {eventTypes.map((et) => (
                <option key={String(et._id)} value={String(et._id)}>
                  {et.name}
                </option>
              ))}
            </select>
            <label>Тег букета:</label>
            <select
              className="admin-styled-select"
              required
              value={formData.tag_id || ""}
              onChange={(e) =>
                setFormData({ ...formData, tag_id: e.target.value })
              }
            >
              <option value="">-- Выбери --</option>
              {tags.map((t) => (
                <option key={String(t._id)} value={String(t._id)}>
                  {t.name}
                </option>
              ))}
            </select>
          </>
        );
      case "deliverTimeSlots":
        return (
          <>
            <label>Название слота (например, 'Утро'):</label>
            <input
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <div className="admin-form-row">
              <div className="admin-form-col">
                <label>Время начала (ЧЧ:ММ):</label>
                <input
                  type="time"
                  required
                  value={formData.start_time || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                />
              </div>
              <div className="admin-form-col">
                <label>Время конца (ЧЧ:ММ):</label>
                <input
                  type="time"
                  required
                  value={formData.end_time || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                />
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-bouquets-container">
      <div
        className="admin-bouquets-header"
        style={{
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "20px",
        }}
      >
        <h2>Справочники системы</h2>

        {/* ПАНЕЛЬ ВКЛАДОК */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            width: "100%",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={
                activeTab === tab.id
                  ? "profile-btn-primary"
                  : "profile-btn-outline"
              }
              style={{
                margin: 0,
                padding: "8px 16px",
                fontSize: "14px",
                border: "1px solid var(--color-primary)",
              }}
              onClick={() => {
                setActiveTab(tab.id);
                setFormData({});
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "20px",
        }}
      >
        <button
          className="admin-bouquets-btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          + Добавить запись
        </button>
      </div>

      {/* ВРАППЕР ДЛЯ ТАБЛИЦЫ СО СКРОЛЛОМ (Как мы чинили в заказах!) */}
      <div
        style={{
          width: "100%",
          overflowX: "auto",
          maxHeight: "calc(100vh - 350px)",
          overflowY: "auto",
          borderRadius: "8px",
          border: "1px solid #eee",
        }}
      >
        {renderTable()}
      </div>

      {/* УНИВЕРСАЛЬНАЯ МОДАЛКА */}
      {isModalOpen && (
        <AdminModal
          title={`Добавить: ${tabs.find((t) => t.id === activeTab)?.label}`}
          onClose={() => {
            setIsModalOpen(false);
            setFormData({});
          }}
        >
          <form className="admin-bouquets-form" onSubmit={handleSave}>
            {renderFormFields()}
            <button
              type="submit"
              className="admin-bouquets-btn-primary"
              style={{ marginTop: "24px" }}
            >
              Сохранить в базу
            </button>
          </form>
        </AdminModal>
      )}
    </div>
  );
};

export default AdminDictionaries;
