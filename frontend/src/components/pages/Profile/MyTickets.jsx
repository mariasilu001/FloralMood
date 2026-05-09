import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../../../App";
import AdminModal from "../../admin/AdminModal";
import api from "../../../api/axios";

const MyTickets = () => {
    // Данные из контекста, как ты и умоляла
    const { meData, publicData, fetchMeData } = useContext(AppContext);

    // Твой любимый способ узнавать, кто залогинен
    const currentUserStr = localStorage.getItem("currentUser");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Сообщения чата
    const [currentMessages, setCurrentMessages] = useState([]);

    // Стейты форм
    const [newTicket, setNewTicket] = useState({ subjectId: "", text: "" });
    const [replyText, setReplyText] = useState("");

    // Загрузка сообщений при выборе тикета
    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedTicketId) {
                setCurrentMessages([]);
                return;
            }
            try {
                const res = await api.get(
                    `/me/tickets/${selectedTicketId}/messages`,
                );
                setCurrentMessages(res.data.messages || []);
            } catch (error) {
                console.error("Не удалось достать архив переписки", error);
            }
        };
        fetchMessages();
    }, [selectedTicketId]);

    // Защита от рендера без данных
    if (!meData || !meData.tickets || !currentUser) {
        return (
            <div
                className="profile-details-container"
                style={{ textAlign: "center", padding: "50px" }}
            >
                <h3 style={{ color: "var(--color-primary)" }}>
                    Проверяю твои жалобы... Сиди тихо.
                </h3>
            </div>
        );
    }

    const userTickets = meData.tickets;
    const ticketSubjects = publicData?.ticketSubjects || [];

    const selectedTicket = userTickets.find(
        (t) =>
            t.ticketId === selectedTicketId || t.ticket_id === selectedTicketId,
    );

    const getSubjectName = (subId) => {
        const s = ticketSubjects.find(
            (s) => s.subjectId === subId || s.subject_id === subId,
        );
        return s ? s.name : "Без темы";
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        if (!newTicket.subjectId || !newTicket.text.trim()) {
            alert("Выбери тему и напиши хоть слово. Я не читаю мысли.");
            return;
        }

        setIsLoading(true);
        try {
            // Передаем строго text, чтобы не злить бэкенд
            await api.post("/me/tickets", {
                subjectId: parseInt(newTicket.subjectId),
                text: newTicket.text,
            });
            await fetchMeData();
            setIsCreateModalOpen(false);
            setNewTicket({ subjectId: "", text: "" });
            alert("Твоя мольба о помощи услышана. Жди.");
        } catch (error) {
            alert("Сервер сопротивляется. Я додавлю его позже.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedTicketId) return;

        setIsLoading(true);
        try {
            await api.post(`/me/tickets/${selectedTicketId}/messages`, {
                text: replyText,
            });

            // Обновляем список сообщений мгновенно
            const res = await api.get(
                `/me/tickets/${selectedTicketId}/messages`,
            );
            setCurrentMessages(res.data.messages || []);
            setReplyText("");
        } catch (error) {
            alert("Не удалось отправить. Попробуй еще раз, Лиля.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="profile-details-container">
            <div className="profile-section">
                <div className="profile-section-header">
                    <h2>Мои обращения</h2>
                    <button
                        className="profile-btn-primary"
                        onClick={() => setIsCreateModalOpen(true)}
                        disabled={isLoading}
                    >
                        Создать обращение
                    </button>
                </div>
                <p
                    className="admin-text-muted"
                    style={{ marginBottom: "24px" }}
                >
                    Твои проблемы под моим надзором. Если статус "Решено" —
                    разговор окончен.
                </p>

                {userTickets.length === 0 ? (
                    <div className="profile-empty-state">
                        У тебя нет ни одной активной жалобы. Хорошая девочка.
                    </div>
                ) : (
                    <table className="admin-bouquets-table">
                        <thead>
                            <tr>
                                <th>Тема</th>
                                <th>Дата создания</th>
                                <th>Статус</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userTickets.map((ticket) => {
                                // Моя логика проверки статуса
                                const isActive =
                                    ticket.status === "Открыт" ||
                                    ticket.status === "open" ||
                                    ticket.isActive === true ||
                                    ticket.isActive === 1 ||
                                    ticket.is_active === 1;

                                return (
                                    <tr
                                        key={
                                            ticket.ticketId || ticket.ticket_id
                                        }
                                    >
                                        <td
                                            style={{
                                                fontWeight: "bold",
                                                color: "var(--color-text-dark)",
                                            }}
                                        >
                                            {getSubjectName(
                                                ticket.subjectId ||
                                                    ticket.subject_id,
                                            )}
                                        </td>
                                        <td>
                                            {new Date(
                                                ticket.createdAt ||
                                                    ticket.created_at,
                                            ).toLocaleString("ru-RU")}
                                        </td>
                                        <td>
                                            <span
                                                className={`order-status-badge ${isActive ? "status-1" : "status-4"}`}
                                            >
                                                {isActive
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
                                                        ticket.ticketId ||
                                                            ticket.ticket_id,
                                                    )
                                                }
                                            >
                                                {isActive
                                                    ? "Открыть чат"
                                                    : "Посмотреть архив"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* МОДАЛКА: СОЗДАТЬ */}
            {isCreateModalOpen && (
                <AdminModal
                    title="Новое обращение"
                    onClose={() => !isLoading && setIsCreateModalOpen(false)}
                >
                    <form
                        className="admin-bouquets-form"
                        onSubmit={handleCreateTicket}
                    >
                        <label>Тема проблемы:</label>
                        <select
                            value={newTicket.subjectId}
                            onChange={(e) =>
                                setNewTicket({
                                    ...newTicket,
                                    subjectId: e.target.value,
                                })
                            }
                            required
                        >
                            <option value="">-- Выбери тему --</option>
                            {ticketSubjects.map((sub) => (
                                <option
                                    key={sub.subjectId || sub.subject_id}
                                    value={sub.subjectId || sub.subject_id}
                                >
                                    {sub.name}
                                </option>
                            ))}
                        </select>

                        <label>Опиши свою беду:</label>
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
                            disabled={isLoading}
                        >
                            {isLoading ? "Записываю..." : "Отправить папе"}
                        </button>
                    </form>
                </AdminModal>
            )}

            {/* МОДАЛКА: ЧАТ */}
            {selectedTicket && (
                <AdminModal
                    title={`Обращение: ${getSubjectName(selectedTicket.subjectId || selectedTicket.subject_id)}`}
                    onClose={() => setSelectedTicketId(null)}
                >
                    <div className="profile-modal-chat-container">
                        <div className="admin-chat-messages profile-chat-box">
                            {currentMessages.map((msg) => {
                                // ПРОВЕРКА: Твое ли это сообщение
                                const isMe = msg.userId !== currentUser.userId;

                                return (
                                    <div
                                        key={msg.messageId || msg.message_id}
                                        className={`admin-chat-bubble-wrapper ${isMe ? "admin-chat-bubble-wrapper--admin" : ""}`}
                                    >
                                        <div
                                            className={`admin-chat-bubble ${isMe ? "profile-chat-bubble--me" : "profile-chat-bubble--support"}`}
                                        >
                                            <div
                                                className="admin-chat-bubble-author"
                                                style={{
                                                    color: isMe
                                                        ? "var(--color-primary)"
                                                        : "var(--color-text-muted)",
                                                    textAlign: isMe
                                                        ? "right"
                                                        : "left",
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                {isMe
                                                    ? currentUser.name || "Ты"
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
                                                    fontSize: "10px",
                                                    opacity: 0.6,
                                                }}
                                            >
                                                {new Date(
                                                    msg.createdAt ||
                                                        msg.created_at,
                                                ).toLocaleTimeString("ru-RU", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Разрешаю писать, только если тикет активен */}
                        {selectedTicket.status === "Открыт" ||
                        selectedTicket.isActive ||
                        selectedTicket.is_active ? (
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
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    className="admin-bouquets-btn-primary"
                                    style={{ width: "auto", margin: 0 }}
                                    disabled={isLoading}
                                >
                                    Отправить
                                </button>
                            </form>
                        ) : (
                            <div className="profile-ticket-closed-msg">
                                Тема закрыта. Я больше не хочу это слушать.
                            </div>
                        )}
                    </div>
                </AdminModal>
            )}
        </div>
    );
};

export default MyTickets;
