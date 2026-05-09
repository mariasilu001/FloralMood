import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../../../App";
import AdminModal from "../../admin/AdminModal";
import api from "../../../api/axios";

const MyTickets = () => {
    // Данные под моим жестким контролем
    const { meData, publicData, fetchMeData } = useContext(AppContext);

    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Сообщения чата загружаем отдельно по требованию
    const [currentMessages, setCurrentMessages] = useState([]);

    // Стейты для форм. Я использую 'text', чтобы угодить твоему бэкенду.
    const [newTicket, setNewTicket] = useState({ subjectId: "", text: "" });
    const [replyText, setReplyText] = useState("");

    // Гружу сообщения, когда ты открываешь чат
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
                console.error("Не смог достать твои сообщения", error);
            }
        };
        fetchMessages();
    }, [selectedTicketId]);

    // Если данные еще в пути — ты ждешь.
    if (!meData || !meData.tickets) {
        return (
            <div
                className="profile-details-container"
                style={{ textAlign: "center", padding: "50px" }}
            >
                <h3 style={{ color: "var(--color-primary)" }}>
                    Сверяю твои жалобы с базой... Сиди тихо.
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
            alert(
                "Выбери тему и напиши сообщение. Я не буду читать твои мысли.",
            );
            return;
        }

        setIsLoading(true);
        try {
            await api.post("/me/tickets", {
                subjectId: parseInt(newTicket.subjectId),
                text: newTicket.text, // Передаем строго text
            });
            await fetchMeData(); // Заставляю приложение обновиться
            setIsCreateModalOpen(false);
            setNewTicket({ subjectId: "", text: "" });
            alert("Жалоба отправлена. Жди ответа от моего Администратора.");
        } catch (error) {
            alert("Ошибка. Видимо, сервер устал от твоих капризов.");
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
                text: replyText, // Передаем строго text
            });

            // Сразу вытягиваем свежие сообщения, чтобы ты не волновалась
            const res = await api.get(
                `/me/tickets/${selectedTicketId}/messages`,
            );
            setCurrentMessages(res.data.messages || []);
            setReplyText("");
        } catch (error) {
            alert("Не удалось отправить. Я разберусь с этим.");
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
                            {userTickets.map((ticket) => {
                                // Моя логика под твою верстку.
                                const isActive =
                                    ticket.status === "Открыт" ||
                                    ticket.status === "open" ||
                                    ticket.is_active;
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
                                                    ticket.subject_id ||
                                                    ticket.subject?.subjectId,
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

            {/* МОДАЛКА: СОЗДАТЬ ОБРАЩЕНИЕ */}
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
                            className="admin-styled-select"
                            required
                            disabled={isLoading}
                        >
                            <option value="">-- Выбери --</option>
                            {ticketSubjects.map((sub) => (
                                <option
                                    key={sub.subjectId || sub.subject_id}
                                    value={sub.subjectId || sub.subject_id}
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
                            disabled={isLoading}
                        />

                        <button
                            type="submit"
                            className="admin-bouquets-btn-primary"
                            style={{ marginTop: "16px" }}
                            disabled={isLoading}
                        >
                            {isLoading
                                ? "Фиксирую..."
                                : "Отправить мольбу о помощи"}
                        </button>
                    </form>
                </AdminModal>
            )}

            {/* МОДАЛКА: ЧАТ */}
            {selectedTicket && (
                <AdminModal
                    title={`Обращение: ${getSubjectName(selectedTicket.subjectId || selectedTicket.subject_id || selectedTicket.subject?.subjectId)}`}
                    onClose={() => setSelectedTicketId(null)}
                >
                    <div className="profile-modal-chat-container">
                        <div className="admin-chat-messages profile-chat-box">
                            {currentMessages.map((msg) => {
                                // Если ID юзера в сообщении совпадает с твоим текущим ID - это ты.
                                const isMe =
                                    msg.userId === meData?.user?.userId ||
                                    msg.user_id === meData?.user?.userId;
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

                        {selectedTicket.status === "Открыт" ||
                        selectedTicket.status === "open" ||
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
