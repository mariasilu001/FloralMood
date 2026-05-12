import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../../App";
import api from "../../../api/axios";

const AdminTickets = () => {
    const { user, adminData, publicData, fetchAdminData } =
        useContext(AppContext);

    const tickets = adminData.allTickets || [];
    const ticketSubjects = publicData.ticketSubjects || [];

    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [currentMessages, setCurrentMessages] = useState([]);
    const [replyText, setReplyText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const activeTickets = tickets.filter(
        (t) =>
            t.isActive === true ||
            t.isActive === 1 ||
            t.is_active === 1 ||
            t.status === "Открыт" ||
            t.status === "open",
    );

    const selectedTicket = tickets.find(
        (t) => (t.ticketId || t.ticket_id) === selectedTicketId,
    );

    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedTicketId) {
                setCurrentMessages([]);
                return;
            }
            try {
                const res = await api.get(
                    `/admin/tickets/${selectedTicketId}/messages`,
                );
                setCurrentMessages(res.data.messages || []);
            } catch (error) {
                console.error("Ошибка загрузки переписки:", error);
            }
        };
        fetchMessages();
    }, [selectedTicketId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedTicketId) return;

        setIsLoading(true);
        try {
            // Я отправляю text, как мы и договаривались на бэкенде
            await api.post(`/admin/tickets/${selectedTicketId}/messages`, {
                text: replyText,
            });

            // Мгновенно обновляю чат
            const res = await api.get(
                `/admin/tickets/${selectedTicketId}/messages`,
            );
            setCurrentMessages(res.data.messages || []);
            setReplyText("");
        } catch (error) {
            console.error(error);
            alert("Ошибка сети..");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseTicket = async () => {
        if (!selectedTicketId) return;

        try {
            await api.put(`/admin/tickets/${selectedTicketId}/close`);
            await fetchAdminData(); // Обновляю глобальный стейт, чтобы тикет исчез из активных
            setSelectedTicketId(null);
        } catch (error) {
            console.error(error);
            alert("Не удалось закрыть тикет");
        }
    };

    // Бэкенд уже собрал данные юзера в поле user, я использую это
    const getUserName = (ticketUser) => {
        return ticketUser ? ticketUser.username : "Неизвестный нытик";
    };

    const getSubjectName = (subId) => {
        const s = ticketSubjects.find(
            (s) => (s.subjectId || s.subject_id) === subId,
        );
        return s ? s.name : "Без темы";
    };

    if (!adminData.allTickets) {
        return (
            <div className="admin-tickets-container">
                <h3 style={{ color: "var(--color-primary)", padding: "20px" }}>
                   загрузка
                </h3>
            </div>
        );
    }

    return (
        <div className="admin-tickets-container">
            <div className="admin-tickets-header">
                <h2>Служба Заботы</h2>
                <p className="admin-text-muted">
                   Система поддержки для клиентов
                </p>
            </div>

            <div className="admin-tickets-layout">
                {/* ЛЕВАЯ КОЛОНКА */}
                <div className="admin-tickets-sidebar">
                    <h3
                        className="admin-subsection-title"
                        style={{ marginTop: 0 }}
                    >
                        Активные обращения ({activeTickets.length})
                    </h3>
                    <div className="admin-tickets-list">
                        {activeTickets.length === 0 ? (
                            <p
                                className="admin-text-muted"
                                style={{ padding: "16px" }}
                            >
                                Нет активных проблем.
                            </p>
                        ) : (
                            activeTickets.map((ticket) => {
                                const tId = ticket.ticketId || ticket.ticket_id;
                                return (
                                    <div
                                        key={tId}
                                        className={`admin-ticket-card ${selectedTicketId === tId ? "admin-ticket-card--active" : ""}`}
                                        onClick={() => setSelectedTicketId(tId)}
                                    >
                                        <div className="admin-ticket-card-header">
                                            <span className="admin-ticket-subject">
                                                {getSubjectName(
                                                    ticket.subjectId ||
                                                        ticket.subject_id,
                                                )}
                                            </span>
                                            <span className="admin-ticket-date">
                                                {new Date(
                                                    ticket.createdAt ||
                                                        ticket.created_at,
                                                ).toLocaleDateString("ru-RU")}
                                            </span>
                                        </div>
                                        <div className="admin-ticket-card-user">
                                            Клиент:{" "}
                                            <strong>
                                                {getUserName(ticket.user)}
                                            </strong>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ПРАВАЯ КОЛОНКА */}
                <div className="admin-tickets-chat-area">
                    {selectedTicket ? (
                        <>
                            <div className="admin-chat-header">
                                <div>
                                    <h3>
                                        {getSubjectName(
                                            selectedTicket.subjectId ||
                                                selectedTicket.subject_id,
                                        )}
                                    </h3>
                                    <p
                                        className="admin-text-muted"
                                        style={{ fontSize: "0.85rem" }}
                                    >
                                        Клиент:{" "}
                                        {getUserName(selectedTicket.user)}
                                    </p>
                                </div>
                                <button
                                    className="admin-bouquets-btn-delete"
                                    onClick={handleCloseTicket}
                                >
                                    Закрыть обращение
                                </button>
                            </div>

                            <div className="admin-chat-messages">
                                {currentMessages.map((msg) => {
                                    
                                    const isAdmin = msg.userId === user?.userId;
                                    return (
                                        <div
                                            key={
                                                msg.messageId || msg.message_id
                                            }
                                            className={`admin-chat-bubble-wrapper ${isAdmin ? "admin-chat-bubble-wrapper--admin" : ""}`}
                                        >
                                            <div
                                                className={`admin-chat-bubble ${isAdmin ? "admin-chat-bubble--admin" : "admin-chat-bubble--user"}`}
                                            >
                                                <div className="admin-chat-bubble-author">
                                                    {isAdmin
                                                        ? "Я (Поддержка)"
                                                        : getUserName(
                                                              selectedTicket.user,
                                                          )}
                                                </div>
                                                <div className="admin-chat-bubble-text">
                                                    {msg.text}
                                                </div>
                                                <div className="admin-chat-bubble-time">
                                                    {new Date(
                                                        msg.createdAt ||
                                                            msg.created_at,
                                                    ).toLocaleTimeString(
                                                        "ru-RU",
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        },
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {currentMessages.length === 0 && (
                                    <p
                                        className="admin-text-muted"
                                        style={{
                                            textAlign: "center",
                                            marginTop: "40px",
                                        }}
                                    >
                                        Сообщений нет.
                                    </p>
                                )}
                            </div>

                            <form
                                className="admin-chat-input-area"
                                onSubmit={handleSendMessage}
                            >
                                <input
                                    type="text"
                                    placeholder="Напиши им жесткий и уверенный ответ..."
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
                        </>
                    ) : (
                        <div className="admin-chat-empty">
                            <p>
                                Выбери тикет слева
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminTickets;
