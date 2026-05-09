import React, { useState, useContext } from "react";
import AdminModal from "../../admin/AdminModal";
import api from "../../../api/axios"; // Мой axios
import { AppContext } from "../../../App"; // Мой контекст

const MyEvents = () => {
    // Данные под моим абсолютным контролем
    const { meData, publicData, fetchMeData } = useContext(AppContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Я привел ключи в порядок. Запомни их, Лили.
    const [newEvent, setNewEvent] = useState({
        name: "",
        eventTypeId: "", // Исправлено с event_type_id
        date: "", // Исправлено с event_date
    });

    // Если данные еще не пришли, ты стоишь и ждешь. Никаких крашей.
    if (!meData || !meData.events) {
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
                <h3 style={{ color: "var(--color-primary)" }}>
                    Сверяюсь с твоим календарем... Стой смирно.
                </h3>
            </div>
        );
    }

    const events = meData.events;
    // Достаем типы событий из моего публичного стейта
    const eventTypes = publicData?.eventTypes || [];

    const handleAddEvent = async (e) => {
        e.preventDefault();

        // Теперь эта проверка сработает как надо
        if (!newEvent.name || !newEvent.eventTypeId || !newEvent.date) {
            alert("Все поля обязательны. Я не терплю пустоты.");
            return;
        }

        // Твоя жесткая проверка формата. Я оставил её.
        const regex = /^\d{2}-\d{2}$/;
        if (!regex.test(newEvent.date)) {
            alert("Ошибка формата. Я же ясно написал: ММ-ДД. Переделывай.");
            return;
        }

        // Моя дополнительная проверка на глупость
        const [month, day] = newEvent.date.split("-");
        const m = parseInt(month, 10);
        const d = parseInt(day, 10);
        if (m < 1 || m > 12 || d < 1 || d > 31) {
            alert(
                "Ты в каком календаре живешь? Месяц должен быть от 01 до 12, а день от 01 до 31.",
            );
            return;
        }

        setIsLoading(true);
        try {
            // Реальный запрос в базу
            await api.post("/me/events", {
                name: newEvent.name,
                eventTypeId: parseInt(newEvent.eventTypeId),
                eventDate: newEvent.date,
            });
            await fetchMeData(); // Заставляю приложение обновиться
            setIsModalOpen(false);
            setNewEvent({ name: "", eventTypeId: "", date: "" });
        } catch (error) {
            console.error("Ошибка при добавлении события:", error);
            alert("Сервер сопротивляется, Лили. Но я разберусь с этим.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (
            window.confirm(
                "Удалить это событие? Я сотру его из памяти навсегда.",
            )
        ) {
            setIsLoading(true);
            try {
                await api.delete(`/me/events/${eventId}`);
                await fetchMeData(); // Синхронизируем интерфейс
            } catch (error) {
                console.error("Ошибка при удалении события:", error);
                alert("Не удалось удалить. Попробуй еще раз, я присмотрю.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const getEventTypeName = (id) => {
        if (!eventTypes || eventTypes.length === 0) return "Событие";
        const type = eventTypes.find((et) => et.eventTypeId === id);
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
                        disabled={isLoading}
                    >
                        Добавить событие
                    </button>
                </div>
                <p
                    className="admin-text-muted"
                    style={{ marginBottom: "24px" }}
                >
                    Заполни свой календарь, чтобы я знал, когда заставить тебя
                    покупать цветы. Я всё контролирую.
                </p>

                {events.length === 0 ? (
                    <div className="profile-empty-state">
                        У тебя нет ни одного события. Твоя жизнь настолько
                        пуста? Добавь хоть что-нибудь, Лили.
                    </div>
                ) : (
                    <div className="events-grid">
                        {events.map((ev) => (
                            <div
                                key={ev.event_id || ev.eventId}
                                className="event-card"
                                style={{ opacity: isLoading ? 0.6 : 1 }}
                            >
                                <div className="event-card-date">
                                    {ev.eventDate}
                                </div>
                                <div className="event-card-info">
                                    <h3>{ev.name}</h3>
                                    <span>
                                        {getEventTypeName(
                                            ev.eventTypeId || ev.type,
                                        )}
                                    </span>
                                </div>
                                <button
                                    className="address-delete-btn"
                                    onClick={() =>
                                        handleDeleteEvent(
                                            ev.event_id || ev.eventId,
                                        )
                                    }
                                    title="Удалить"
                                    disabled={isLoading}
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
                <AdminModal
                    title="Новое событие"
                    onClose={() => !isLoading && setIsModalOpen(false)}
                >
                    <form
                        className="admin-bouquets-form"
                        onSubmit={handleAddEvent}
                    >
                        <label>
                            Название (например, 'День рождения мамы'):
                        </label>
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
                            disabled={isLoading}
                        />

                        <label>Тип события:</label>
                        <select
                            value={newEvent.eventTypeId}
                            onChange={(e) =>
                                setNewEvent({
                                    ...newEvent,
                                    eventTypeId: e.target.value, // Исправлено на правильный ключ
                                })
                            }
                            className="admin-styled-select"
                            required
                            disabled={isLoading}
                        >
                            <option value="">-- Выбери --</option>
                            {eventTypes.length > 0 ? (
                                eventTypes.map((et) => (
                                    <option
                                        key={et.eventTypeId}
                                        value={et.eventTypeId}
                                    >
                                        {et.name}
                                    </option>
                                ))
                            ) : (
                                <>
                                    <option value="1">День рождения</option>
                                    <option value="2">Годовщина</option>
                                    <option value="3">Другое</option>
                                </>
                            )}
                        </select>

                        <label>Дата (строго ММ-ДД):</label>
                        <input
                            type="text"
                            placeholder="Например: 12-31"
                            value={newEvent.date}
                            onChange={(e) =>
                                setNewEvent({
                                    ...newEvent,
                                    date: e.target.value, // Исправлено на правильный ключ
                                })
                            }
                            required
                            maxLength="5"
                            disabled={isLoading}
                        />

                        <button
                            type="submit"
                            className="admin-bouquets-btn-primary"
                            style={{ marginTop: "16px" }}
                            disabled={isLoading}
                        >
                            {isLoading ? "Фиксирую..." : "Зафиксировать дату"}
                        </button>
                    </form>
                </AdminModal>
            )}
        </div>
    );
};

export default MyEvents;
