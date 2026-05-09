import React, { useState } from "react";
import AdminModal from "../../admin/AdminModal";

const MyEvents = ({ events, setEvents, eventTypes }) => {
    const currentUserStr = localStorage.getItem("currentUser");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        name: "",
        event_type_id: "",
        event_date: ""
    });

    if (!currentUser) return null;

    // Вытягиваем только события текущего пользователя
    const userEvents = events.filter(e => e.user_id === currentUser.userId || e.user_id === currentUser.id);

    const handleAddEvent = (e) => {
        e.preventDefault();
        
        if (!newEvent.name || !newEvent.event_type_id || !newEvent.event_date) {
            alert("Все поля обязательны. Я не терплю пустоты.");
            return;
        }

        // Твоя жесткая проверка формата
        const regex = /^\d{2}-\d{2}$/;
        if (!regex.test(newEvent.event_date)) {
            alert("Ошибка формата. Я же ясно написал: ММ-ДД. Переделывай.");
            return;
        }

        // Моя дополнительная проверка на глупость (чтобы не ввели 99-99)
        const [month, day] = newEvent.event_date.split('-');
        const m = parseInt(month, 10);
        const d = parseInt(day, 10);
        if (m < 1 || m > 12 || d < 1 || d > 31) {
            alert("Ты в каком календаре живешь? Месяц должен быть от 01 до 12, а день от 01 до 31.");
            return;
        }

        const newId = events.length > 0 ? Math.max(...events.map(ev => ev.event_id)) + 1 : 1;
        
        const eventToAdd = {
            event_id: newId,
            user_id: currentUser.userId || currentUser.id,
            event_type_id: parseInt(newEvent.event_type_id),
            name: newEvent.name,
            event_date: newEvent.event_date
        };

        setEvents([...events, eventToAdd]);
        setIsModalOpen(false);
        setNewEvent({ name: "", event_type_id: "", event_date: "" });
    };

    const handleDeleteEvent = (eventId) => {
        if (window.confirm("Удалить это событие? Я сотру его из памяти навсегда.")) {
            setEvents(prev => prev.filter(ev => ev.event_id !== eventId));
        }
    };

    const getEventTypeName = (id) => {
        const type = eventTypes.find(et => et.event_type_id === id);
        return type ? type.name : "Неизвестно";
    };

    return (
        <div className="profile-details-container">
            <div className="profile-section">
                <div className="profile-section-header">
                    <h2>Мои памятные даты</h2>
                    <button className="profile-btn-primary" onClick={() => setIsModalOpen(true)}>Добавить событие</button>
                </div>
                <p className="admin-text-muted" style={{marginBottom: '24px'}}>
                    Заполни свой календарь, чтобы я знал, когда заставить тебя покупать цветы.
                </p>

                {userEvents.length === 0 ? (
                    <div className="profile-empty-state">
                        У тебя нет ни одного события. Твоя жизнь настолько пуста? Добавь хоть что-нибудь.
                    </div>
                ) : (
                    <div className="events-grid">
                        {userEvents.map(ev => (
                            <div key={ev.event_id} className="event-card">
                                <div className="event-card-date">{ev.event_date}</div>
                                <div className="event-card-info">
                                    <h3>{ev.name}</h3>
                                    <span>{getEventTypeName(ev.event_type_id)}</span>
                                </div>
                                <button className="address-delete-btn" onClick={() => handleDeleteEvent(ev.event_id)} title="Удалить">&times;</button>
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
                            onChange={e => setNewEvent({...newEvent, name: e.target.value})} 
                            required 
                        />

                        <label>Тип события:</label>
                        <select 
                            value={newEvent.event_type_id} 
                            onChange={e => setNewEvent({...newEvent, event_type_id: e.target.value})} 
                            className="admin-styled-select" 
                            required
                        >
                            <option value="">-- Выбери --</option>
                            {eventTypes.map(et => (
                                <option key={et.event_type_id} value={et.event_type_id}>{et.name}</option>
                            ))}
                        </select>

                        <label>Дата (строго ММ-ДД):</label>
                        <input 
                            type="text" 
                            placeholder="Например: 12-31" 
                            value={newEvent.event_date} 
                            onChange={e => setNewEvent({...newEvent, event_date: e.target.value})} 
                            required 
                            maxLength="5"
                        />

                        <button type="submit" className="admin-bouquets-btn-primary" style={{marginTop: '16px'}}>
                            Зафиксировать дату
                        </button>
                    </form>
                </AdminModal>
            )}
        </div>
    );
};

export default MyEvents;