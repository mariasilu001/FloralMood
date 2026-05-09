import React, { useState } from "react";
import AdminModal from "../../admin/AdminModal";

const MyTickets = ({
    tickets,
    setTickets,
    ticketMessages,
    setTicketMessages,
    ticketSubjects,
    users,
}) => {
    const currentUserStr = localStorage.getItem("currentUser");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Стейты для форм
    const [newTicket, setNewTicket] = useState({ subject_id: "", text: "" });
    const [replyText, setReplyText] = useState("");

    if (!currentUser) return null;

    // Вытягиваем только тикеты текущего пользователя, сортируем новые сверху
    const userTickets = tickets
        .filter(
            (t) =>
                t.user_id === currentUser.userId ||
                t.user_id === currentUser.id,
        )
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const selectedTicket = tickets.find(
        (t) => t.ticket_id === selectedTicketId,
    );
    const currentMessages = selectedTicket
        ? ticketMessages.filter((m) => m.ticket_id === selectedTicketId)
        : [];

    const getSubjectName = (subId) => {
        const s = ticketSubjects.find((s) => s.subject_id === subId);
        return s ? s.name : "Без темы";
    };

    // Создание нового обращения
    const handleCreateTicket = (e) => {
        e.preventDefault();
        if (!newTicket.subject_id || !newTicket.text.trim()) {
            alert(
                "Выбери тему и напиши сообщение. Я не буду читать твои мысли.",
            );
            return;
        }

        const newTicketId =
            tickets.length > 0
                ? Math.max(...tickets.map((t) => t.ticket_id)) + 1
                : 1;
        const newMessageId =
            ticketMessages.length > 0
                ? Math.max(...ticketMessages.map((m) => m.message_id)) + 1
                : 1;

        const timestamp = new Date().toISOString();

        const ticketToAdd = {
            ticket_id: newTicketId,
            user_id: currentUser.userId || currentUser.id,
            subject_id: parseInt(newTicket.subject_id),
            is_active: 1, // 1 - активно
            created_at: timestamp,
        };

        const messageToAdd = {
            message_id: newMessageId,
            ticket_id: newTicketId,
            user_id: currentUser.userId || currentUser.id,
            text: newTicket.text,
            created_at: timestamp,
        };

        setTickets([...tickets, ticketToAdd]);
        setTicketMessages([...ticketMessages, messageToAdd]);

        setIsCreateModalOpen(false);
        setNewTicket({ subject_id: "", text: "" });
        alert("Жалоба отправлена. Жди ответа от моего Администратора.");
    };

    // Отправка сообщения в существующий тикет
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedTicketId) return;

        const newMessageId =
            ticketMessages.length > 0
                ? Math.max(...ticketMessages.map((m) => m.message_id)) + 1
                : 1;
        const newMessage = {
            message_id: newMessageId,
            ticket_id: selectedTicketId,
            user_id: currentUser.userId || currentUser.id,
            text: replyText,
            created_at: new Date().toISOString(),
        };

        setTicketMessages([...ticketMessages, newMessage]);
        setReplyText("");
    };

    return (
        <div className="profile-details-container">
            <div className="profile-section">
                <div className="profile-section-header">
                    <h2>Мои обращения</h2>
                    <button
                        className="profile-btn-primary"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Создать обращение
                    </button>
                </div>
                <p
                    className="admin-text-muted"
                    style={{ marginBottom: "24px" }}
                >
                    История твоих проблем. Если статус "Решено" — значит, вопрос
                    закрыт, и спорить со мной бесполезно.
                </p>

                {userTickets.length === 0 ? (
                    <div className="profile-empty-state">
                        У тебя нет ни одного обращения. Значит, я работаю
                        безупречно.
                    </div>
                ) : (
                    <table className="admin-bouquets-table">
                        <thead>
                            <tr>
                                <th>Тема обращения</th>
                                <th>Дата создания</th>
                                <th>Статус</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userTickets.map((ticket) => (
                                <tr key={ticket.ticket_id}>
                                    <td
                                        style={{
                                            fontWeight: "bold",
                                            color: "var(--color-text-dark)",
                                        }}
                                    >
                                        {getSubjectName(ticket.subject_id)}
                                    </td>
                                    <td>
                                        {new Date(
                                            ticket.created_at,
                                        ).toLocaleString()}
                                    </td>
                                    <td>
                                        <span
                                            className={`order-status-badge ${ticket.is_active ? "status-1" : "status-4"}`}
                                        >
                                            {ticket.is_active
                                                ? "В работе"
                                                : "Решено"}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="profile-btn-outline"
                                            style={{ padding: "6px 12px" }}
                                            onClick={() =>
                                                setSelectedTicketId(
                                                    ticket.ticket_id,
                                                )
                                            }
                                        >
                                            Открыть чат
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* МОДАЛКА: СОЗДАТЬ ОБРАЩЕНИЕ */}
            {isCreateModalOpen && (
                <AdminModal
                    title="Новое обращение"
                    onClose={() => setIsCreateModalOpen(false)}
                >
                    <form
                        className="admin-bouquets-form"
                        onSubmit={handleCreateTicket}
                    >
                        <label>Тема проблемы:</label>
                        <select
                            value={newTicket.subject_id}
                            onChange={(e) =>
                                setNewTicket({
                                    ...newTicket,
                                    subject_id: e.target.value,
                                })
                            }
                            className="admin-styled-select"
                            required
                        >
                            <option value="">-- Выбери --</option>
                            {ticketSubjects.map((sub) => (
                                <option
                                    key={sub.subject_id}
                                    value={sub.subject_id}
                                >
                                    {sub.name}
                                </option>
                            ))}
                        </select>

                        <label>Опиши свою проблему:</label>
                        <textarea
                            value={newTicket.text}
                            onChange={(e) =>
                                setNewTicket({
                                    ...newTicket,
                                    text: e.target.value,
                                })
                            }
                            required
                            rows="5"
                            placeholder="Поплачь мне в жилетку..."
                        />

                        <button
                            type="submit"
                            className="admin-bouquets-btn-primary"
                            style={{ marginTop: "16px" }}
                        >
                            Отправить мольбу о помощи
                        </button>
                    </form>
                </AdminModal>
            )}

            {/* МОДАЛКА: ЧАТ */}
            {selectedTicket && (
                <AdminModal
                    title={`Обращение: ${getSubjectName(selectedTicket.subject_id)}`}
                    onClose={() => setSelectedTicketId(null)}
                >
                    <div className="profile-modal-chat-container">
                        <div className="admin-chat-messages profile-chat-box">
                            {currentMessages.map((msg) => {
                                // Если ID совпадает с юзером - это он. Иначе - поддержка (Админ)
                                const isMe =
                                    msg.user_id ===
                                    (currentUser.userId || currentUser.id);
                                return (
                                    <div
                                        key={msg.message_id}
                                        className={`admin-chat-bubble-wrapper ${isMe ? "admin-chat-bubble-wrapper--admin" : ""}`}
                                    >
                                        <div
                                            className={`admin-chat-bubble ${isMe ? "profile-chat-bubble--me" : "profile-chat-bubble--support"}`}
                                        >
                                            <div
                                                className="admin-chat-bubble-author"
                                                style={{
                                                    color: isMe
                                                        ? "var(--color-blue)"
                                                        : "var(--color-text-muted)",
                                                    textAlign: isMe
                                                        ? "right"
                                                        : "left",
                                                }}
                                            >
                                                {isMe
                                                    ? "Ты"
                                                    : "Служба Заботы Сильвера"}
                                            </div>
                                            <div className="admin-chat-bubble-text">
                                                {msg.text}
                                            </div>
                                            <div
                                                className="admin-chat-bubble-time"
                                                style={{
                                                    textAlign: isMe
                                                        ? "right"
                                                        : "left",
                                                }}
                                            >
                                                {new Date(
                                                    msg.created_at,
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {selectedTicket.is_active ? (
                            <form
                                className="admin-chat-input-area"
                                onSubmit={handleSendMessage}
                                style={{
                                    padding: "16px 0 0 0",
                                    borderTop: "none",
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Напиши ответ..."
                                    value={replyText}
                                    onChange={(e) =>
                                        setReplyText(e.target.value)
                                    }
                                />
                                <button
                                    type="submit"
                                    className="admin-bouquets-btn-primary"
                                    style={{ width: "auto", margin: 0 }}
                                >
                                    Отправить
                                </button>
                            </form>
                        ) : (
                            <div className="profile-ticket-closed-msg">
                                Это обращение закрыто. Можешь больше не пытаться
                                сюда писать.
                            </div>
                        )}
                    </div>
                </AdminModal>
            )}
        </div>
    );
};

export default MyTickets;
