import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../../../App";
import AdminModal from "../../admin/AdminModal";
import api from "../../../api/axios";

const MyTickets = () => {
    // Весь контроль сосредоточен в моих руках
    const { meData, publicData, fetchMeData } = useContext(AppContext);

    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Сообщения чата
    const [currentMessages, setCurrentMessages] = useState([]);

    // Стейты форм под твои требования
    const [newTicket, setNewTicket] = useState({ subjectId: "", text: "" });
    const [replyText, setReplyText] = useState("");

    // Я сам забираю сообщения, когда ты выбираешь тикет
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
                console.error(
                    "Не удалось достучаться до архива сообщений",
                    error,
                );
            }
        };
        fetchMessages();
    }, [selectedTicketId]);

    // Если данные пользователя еще не соизволили загрузиться
    if (!meData || !meData.tickets || !meData.user) {
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
    const currentUser = meData.user;

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
            alert("Выбери тему и напиши сообщение. Я не читаю мысли.");
            return;
        }

        setIsLoading(true);
        try {
            await api.post("/me/tickets", {
                subjectId: parseInt(newTicket.subjectId),
                text: newTicket.text,
            });
            await fetchMeData();
            setIsCreateModalOpen(false);
            setNewTicket({ subjectId: "", text: "" });
            alert("Твое обращение зафиксировано. Жди.");
        } catch (error) {
            alert("Ошибка сервера. Я разберусь с этим лично.");
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

            // Мгновенное обновление чата
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
                    Все твои проблемы под моим контролем. Если вопрос решен —
                    значит, я так решил.
                </p>

                {userTickets.length === 0 ? (
                    <div className="profile-empty-state">
                        У тебя нет активных жалоб. Значит, ты всем довольна.
                    </div>
                ) : (
                    <table className="admin-bouquets-table">
                        <thead>
                            <tr>
                                <th>Тема обращения</th>
                                <th>Дата</th>
                                <th>Статус</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userTickets.map((ticket) => {
                                // Моя логика проверки активности
                                const isActive =
                                    ticket.status === "Открыт" ||
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
                                            ).toLocaleDateString("ru-RU")}
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
                                                Открыть чат
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* МОДАЛКА: СОЗДАНИЕ */}
            {isCreateModalOpen && (
                <AdminModal
                    title="Новое обращение"
                    onClose={() => !isLoading && setIsCreateModalOpen(false)}
                >
                    <form
                        className="admin-bouquets-form"
                        onSubmit={handleCreateTicket}
                    >
                        <label>Тема:</label>
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

                        <label>Суть проблемы:</label>
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
                            placeholder="Опиши всё, что тебя тревожит..."
                        />

                        <button
                            type="submit"
                            className="admin-bouquets-btn-primary"
                            style={{ marginTop: "16px" }}
                            disabled={isLoading}
                        >
                            {isLoading ? "Фиксирую..." : "Отправить папе"}
                        </button>
                    </form>
                </AdminModal>
            )}

            {/* МОДАЛКА: ЧАТ */}
            {selectedTicket && (
                <AdminModal
                    title={`Диалог: ${getSubjectName(selectedTicket.subjectId || selectedTicket.subject_id)}`}
                    onClose={() => setSelectedTicketId(null)}
                >
                    <div className="profile-modal-chat-container">
                        <div className="admin-chat-messages profile-chat-box">
                            {currentMessages.map((msg) => {
                                // ЖЕСТКАЯ ПРОВЕРКА: Если userId сообщения совпадает с твоим — это ТЫ.
                                const isMe =
                                    msg.userId === currentUser.userId ||
                                    msg.user_id === currentUser.userId;

                                return (
                                    <div
                                        key={msg.messageId || msg.message_id}
                                        // Твой класс для выравнивания вправо (враппер админа в твоих стилях тянет вправо)
                                        className={`admin-chat-bubble-wrapper ${isMe ? "admin-chat-bubble-wrapper--admin" : ""}`}
                                    >
                                        <div
                                            // Классы оформления: me (розовый/синий) или support (серый)
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
                                                {/* Показываю твое имя, Лили, для твоих сообщений */}
                                                {isMe
                                                    ? currentUser.name
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

                        {/* Если тикет еще живой — я разрешаю тебе писать */}
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
                                    placeholder="Твой ответ..."
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
                                Тема закрыта. Я больше не хочу это обсуждать.
                            </div>
                        )}
                    </div>
                </AdminModal>
            )}
        </div>
    );
};

export default MyTickets;
