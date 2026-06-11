import React, { useState, useMemo, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminModal from "../../admin/AdminModal";
import { DBcontext } from "../../../Database"; // НАША локальная база данных

const MyEvents = () => {
  const navigate = useNavigate();

  // 1. Достаем все необходимые таблицы и функции из нашего локального контекста
  const { users, events, setEvents, eventTypes, eventTypeTags, tags } =
    useContext(DBcontext);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Локальное состояние формы
  const [newEvent, setNewEvent] = useState({
    name: "",
    eventTypeId: "",
    date: "",
  });

  // ==========================================
  // ХУКИ ДАННЫХ И СЕССИИ (Строго на самом верху!)
  // ==========================================

  // Ищем тебя в базе данных по BigInt-идентификатору
  const userIdStr = localStorage.getItem("userId");
  const user = useMemo(() => {
    if (!users || !userIdStr) return null;
    return users.find((u) => u._id === BigInt(userIdStr));
  }, [users, userIdStr]);

  // Вычисляем только ТВОИ личные события
  const myEventsList = useMemo(() => {
    if (!events || !user) return [];
    return events.filter((e) => e.user_id === user._id);
  }, [events, user]);

  // ДИНАМИЧЕСКИЙ ПОИСК ТЕГОВ ДЛЯ ВЫБРАННОГО ТИПА СОБЫТИЯ
  const selectedTypeTags = useMemo(() => {
    // Если тип события еще не выбран, или таблицы не загрузились — возвращаем пустой массив
    if (!newEvent.eventTypeId || !eventTypeTags || !tags) return [];

    // Превращаем строковый ID из селекта в BigInt для базы данных
    const selectedId = BigInt(newEvent.eventTypeId);

    // Фильтруем таблицу связей eventTypeTags, оставляя только записи для этого типа ивента
    const relations = eventTypeTags.filter(
      (ett) => ett.event_type_id === selectedId,
    );

    // Собираем массив ID тегов, которые привязаны к этому событию
    const targetTagIds = relations.map((ett) => ett.tag_id);

    // Находим полноценные объекты тегов из таблицы tags
    return tags.filter((t) => targetTagIds.includes(t._id));
  }, [newEvent.eventTypeId, eventTypeTags, tags]);

  // ==========================================
  // ЗАГЛУШКА БЕЗОПАСНОСТИ (После всех хуков!)
  // ==========================================
  if (!users || !events || !eventTypes || !eventTypeTags || !tags) {
    return (
      <div
        className="profile-details-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <h3 style={{ color: "var(--color-primary)" }}>Загрузка календаря...</h3>
      </div>
    );
  }

  if (!user) return null; // Если сессии нет, макет профиля сам сделает редирект

  // ==========================================
  // ФУНКЦИИ УПРАВЛЕНИЯ (ЭКШЕНЫ)
  // ==========================================

  const handleAddEvent = (e) => {
    e.preventDefault(); // Запрещаем перезагрузку страницы

    if (!newEvent.name || !newEvent.eventTypeId || !newEvent.date) {
      alert("Все поля обязательны.");
      return;
    }

    const regex = /^\d{2}-\d{2}$/;
    if (!regex.test(newEvent.date)) {
      alert("Ошибка формата. Используй строго формат ММ-ДД (например, 12-31).");
      return;
    }

    const [monthStr, dayStr] = newEvent.date.split("-");
    const m = parseInt(monthStr, 10);
    const d = parseInt(dayStr, 10);
    if (m < 1 || m > 12 || d < 1 || d > 31) {
      alert("Месяц должен быть от 01 до 12, а день от 01 до 31.");
      return;
    }

    // Генерируем новый BigInt ID для события
    const maxId = events.reduce((max, ev) => (ev._id > max ? ev._id : max), 0n);

    const newEventObj = {
      _id: maxId + 1n,
      user_id: user._id, // Твой BigInt идентификатор
      event_type_id: BigInt(newEvent.eventTypeId), // Превращаем в BigInt перед сохранением
      name: newEvent.name.trim(),
      event_date: newEvent.date,
      created_at: new Date(),
    };

    // Записываем новое событие в глобальный массив нашей базы
    setEvents([...events, newEventObj]);

    setIsModalOpen(false);
    setNewEvent({ name: "", eventTypeId: "", date: "" });
    alert("Событие успешно зафиксировано в твоем календаре.");
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm("Удалить это событие?")) {
      // Оставляем в массиве только те события, чей _id не равен удаляемому
      const updatedEvents = events.filter((ev) => ev._id !== eventId);
      setEvents(updatedEvents);
    }
  };

  const getEventTypeName = (typeId) => {
    if (!eventTypes || eventTypes.length === 0) return "Событие";
    const type = eventTypes.find((et) => et._id === typeId);
    return type ? type.name : "Неизвестно";
  };

  return (
    <div className="profile-details-container">
      <div className="profile-section">
        <div className="profile-section-header">
          <h2>Мои памятные даты</h2>
          <button
            className="profile-btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            Добавить событие
          </button>
        </div>
        <p className="admin-text-muted" style={{ marginBottom: "24px" }}>
          Здесь хранятся ваши личные памятные события. Я слежу за ними.
        </p>

        {myEventsList.length === 0 ? (
          <div className="profile-empty-state">
            У тебя нет ни одного личного события, Лили.
          </div>
        ) : (
          <div className="events-grid">
            {myEventsList.map((ev) => (
              <div key={ev._id} className="event-card">
                <div className="event-card-date">{ev.event_date}</div>
                <div className="event-card-info">
                  <h3>{ev.name}</h3>
                  <span>{getEventTypeName(ev.event_type_id)}</span>
                </div>
                <button
                  className="address-delete-btn"
                  onClick={() => handleDeleteEvent(ev._id)}
                  title="Удалить"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* МОДАЛКА ДОБАВЛЕНИЯ СОБЫТИЯ */}
      {isModalOpen && (
        <AdminModal title="Новое событие" onClose={() => setIsModalOpen(false)}>
          <form className="admin-bouquets-form" onSubmit={handleAddEvent}>
            <label>Название (например, 'День рождения мамы'):</label>
            <input
              type="text"
              value={newEvent.name}
              onChange={(e) =>
                setNewEvent({
                  ...newEvent,
                  name: e.target.value,
                })
              }
              required
            />

            <label>Тип события:</label>
            <select
              value={newEvent.eventTypeId}
              onChange={(e) =>
                setNewEvent({
                  ...newEvent,
                  eventTypeId: e.target.value,
                })
              }
              className="admin-styled-select"
              required
            >
              <option value="">-- Выбери --</option>
              {eventTypes.map((et) => (
                <option key={et._id} value={String(et._id)}>
                  {et.name}
                </option>
              ))}
            </select>

            {/* ========================================== */}
            {/* НОВЫЙ БЛОК: ОТОБРАЖЕНИЕ ТЕГОВ ПРИ ВЫБОРЕ */}
            {/* ========================================== */}
            {selectedTypeTags.length > 0 && (
              <div
                style={{
                  marginTop: "10px",
                  marginBottom: "15px",
                  padding: "10px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    fontWeight: "bold",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Будет связано с тегами букетов:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {selectedTypeTags.map((tag) => (
                    <span
                      key={tag._id}
                      style={{
                        fontSize: "12px",
                        background: "var(--color-blue, #2f80ed)",
                        color: "#fff",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* ========================================== */}

            <label>Дата (строго ММ-ДД):</label>
            <input
              type="text"
              placeholder="Например: 12-31"
              value={newEvent.date}
              onChange={(e) =>
                setNewEvent({
                  ...newEvent,
                  date: e.target.value,
                })
              }
              required
              maxLength="5"
            />

            <button
              type="submit"
              className="admin-bouquets-btn-primary"
              style={{ marginTop: "16px" }}
            >
              Зафиксировать дату
            </button>
          </form>
        </AdminModal>
      )}
    </div>
  );
};

export default MyEvents;
