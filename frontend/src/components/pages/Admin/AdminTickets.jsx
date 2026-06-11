import React, { useState, useEffect, useContext, useMemo } from "react";
import { DBcontext } from "../../../Database"; // НАША автономная база данных

const AdminTickets = () => {
  // 1. Достаем все необходимые таблицы из локального контекста
  const {
    users,
    tickets,
    setTickets,
    ticketSubjects,
    ticketMessages,
    setTicketMessages,
  } = useContext(DBcontext);

  // Локальные стейты интерфейса
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [replyText, setReplyText] = useState("");

  // НОВЫЕ СТЕЙТЫ: Фильтрация, как просила твой куратор
  const [filterStatus, setFilterStatus] = useState("active"); // "active", "closed", "all"
  const [filterSubject, setFilterSubject] = useState("all"); // "all" или BigInt ID темы в виде строки

  // ==========================================
  // ХУКИ ДАННЫХ И СЕССИИ (Только локальная база)
  // ==========================================

  // Ищем админа (тебя) в базе
  const adminIdStr = localStorage.getItem("userId");
  const adminUser = useMemo(() => {
    if (!users || !adminIdStr) return null;
    return users.find((u) => u._id === BigInt(adminIdStr));
  }, [users, adminIdStr]);

  // МОЩНЫЙ ФИЛЬТР ТИКЕТОВ: применяем статус и тему одновременно
  const filteredTickets = useMemo(() => {
    if (!tickets) return [];

    return tickets
      .filter((t) => {
        // Проверка статуса
        const matchStatus =
          filterStatus === "all"
            ? true
            : filterStatus === "active"
              ? t.is_active === true
              : t.is_active === false; // closed

        // Проверка темы
        const matchSubject =
          filterSubject === "all"
            ? true
            : t.subject_id === BigInt(filterSubject);

        return matchStatus && matchSubject;
      })
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime()); // Сортируем: новые сверху
  }, [tickets, filterStatus, filterSubject]);

  // Вычисляем выбранный тикет на лету
  const selectedTicket = useMemo(() => {
    if (!selectedTicketId || !tickets) return null;
    return tickets.find((t) => t._id === selectedTicketId);
  }, [tickets, selectedTicketId]);

  // Подтягиваем переписку только для выбранного тикета
  const currentMessages = useMemo(() => {
    if (!selectedTicketId || !ticketMessages) return [];
    return ticketMessages
      .filter((msg) => msg.ticket_id === selectedTicketId)
      .sort((a, b) => a.created_at.getTime() - b.created_at.getTime()); // Хронология
  }, [ticketMessages, selectedTicketId]);

  // ==========================================
  // ЖЕСТКАЯ ЗАГЛУШКА БЕЗОПАСНОСТИ РЕНДЕРА
  // ==========================================
  if (!users || !tickets || !ticketSubjects || !ticketMessages) {
    return (
      <div className="admin-tickets-container">
        <h3
          style={{
            color: "var(--color-primary)",
            padding: "20px",
            textAlign: "center",
          }}
        >
          Синхронизирую зашифрованные каналы связи...
        </h3>
      </div>
    );
  }

  if (!adminUser) return null; // Защита макета

  // ==========================================
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ==========================================

  const getUserName = (uId) => {
    const u = users.find((user) => user._id === uId);
    return u ? u.username : "Неизвестный клиент";
  };

  const getSubjectName = (subId) => {
    const s = ticketSubjects.find((sub) => sub._id === subId);
    return s ? s.name : "Без темы";
  };

  // ==========================================
  // ЭКШЕНЫ УПРАВЛЕНИЯ БАЗОЙ
  // ==========================================

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicketId) return;

    // Генерируем новый BigInt ID для сообщения
    const maxMsgId = ticketMessages.reduce(
      (max, m) => (m._id > max ? m._id : max),
      0n,
    );

    const newMsgObj = {
      _id: maxMsgId + 1n,
      ticket_id: selectedTicketId,
      user_id: adminUser._id, // Твой админский ID
      text: replyText.trim(),
      created_at: new Date(),
    };

    // Мгновенно пушим в базу
    setTicketMessages([...ticketMessages, newMsgObj]);
    setReplyText("");
  };

  const handleCloseTicket = () => {
    if (!selectedTicketId) return;

    // Мгновенно меняем статус тикета в таблице
    const updatedTickets = tickets.map((t) =>
      t._id === selectedTicketId ? { ...t, is_active: false } : t,
    );

    setTickets(updatedTickets);
    setSelectedTicketId(null);
    alert("Обращение успешно закрыто.");
  };

  // ==========================================
  // РЕНДЕР ИНТЕРФЕЙСА
  // ==========================================

  return (
    <div className="admin-tickets-container">
      <div className="admin-tickets-header">
        <h2>Служба Заботы</h2>
        <p className="admin-text-muted">
          Система поддержки для клиентов. Я отслеживаю каждый их шаг.
        </p>
      </div>

      <div className="admin-tickets-layout">
        {/* ЛЕВАЯ КОЛОНКА (СПИСОК И ФИЛЬТРЫ) */}
        <div className="admin-tickets-sidebar">
          {/* ПАНЕЛЬ ФИЛЬТРАЦИИ */}
          <div
            style={{
              padding: "0 16px 16px",
              display: "flex",
              gap: "10px",
              flexDirection: "column",
            }}
          >
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setSelectedTicketId(null); // Сбрасываем выбранный тикет при фильтрации
              }}
              className="admin-styled-select"
            >
              <option value="active">Только активные</option>
              <option value="closed">Только закрытые</option>
              <option value="all">Все обращения</option>
            </select>

            <select
              value={filterSubject}
              onChange={(e) => {
                setFilterSubject(e.target.value);
                setSelectedTicketId(null);
              }}
              className="admin-styled-select"
            >
              <option value="all">Все темы</option>
              {ticketSubjects.map((sub) => (
                <option key={String(sub._id)} value={String(sub._id)}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <h3
            className="admin-subsection-title"
            style={{ marginTop: 0, padding: "0 16px" }}
          >
            Найдено обращений ({filteredTickets.length})
          </h3>

          <div className="admin-tickets-list">
            {filteredTickets.length === 0 ? (
              <p className="admin-text-muted" style={{ padding: "16px" }}>
                Обращений по этим фильтрам не найдено.
              </p>
            ) : (
              filteredTickets.map((ticket) => {
                const tIdStr = String(ticket._id);
                const isTicketActive = ticket.is_active;

                return (
                  <div
                    key={tIdStr}
                    className={`admin-ticket-card ${selectedTicketId === ticket._id ? "admin-ticket-card--active" : ""}`}
                    onClick={() => setSelectedTicketId(ticket._id)}
                  >
                    <div className="admin-ticket-card-header">
                      <span className="admin-ticket-subject">
                        {getSubjectName(ticket.subject_id)}
                      </span>
                      <span className="admin-ticket-date">
                        {new Date(ticket.created_at).toLocaleDateString(
                          "ru-RU",
                        )}
                      </span>
                    </div>
                    <div
                      className="admin-ticket-card-user"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>
                        Клиент: <strong>{getUserName(ticket.user_id)}</strong>
                      </span>

                      {/* Бейджик статуса */}
                      <span
                        className={`order-status-badge ${isTicketActive ? "status-1" : "status-4"}`}
                        style={{ fontSize: "10px", padding: "2px 6px" }}
                      >
                        {isTicketActive ? "Открыт" : "Закрыт"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА (ЧАТ) */}
        <div className="admin-tickets-chat-area">
          {selectedTicket ? (
            <>
              <div className="admin-chat-header">
                <div>
                  <h3>{getSubjectName(selectedTicket.subject_id)}</h3>
                  <p
                    className="admin-text-muted"
                    style={{ fontSize: "0.85rem" }}
                  >
                    Клиент: {getUserName(selectedTicket.user_id)}
                  </p>
                </div>
                {selectedTicket.is_active && (
                  <button
                    className="admin-bouquets-btn-delete"
                    onClick={handleCloseTicket}
                  >
                    Закрыть обращение
                  </button>
                )}
              </div>

              <div className="admin-chat-messages">
                {currentMessages.map((msg) => {
                  // Админ ли это? (Ты)
                  const isAdmin = msg.user_id === adminUser._id;

                  return (
                    <div
                      key={String(msg._id)}
                      className={`admin-chat-bubble-wrapper ${isAdmin ? "admin-chat-bubble-wrapper--admin" : ""}`}
                    >
                      <div
                        className={`admin-chat-bubble ${isAdmin ? "admin-chat-bubble--admin" : "admin-chat-bubble--user"}`}
                      >
                        <div
                          className="admin-chat-bubble-author"
                          style={{
                            color: isAdmin
                              ? "var(--color-primary)"
                              : "var(--color-text-muted)",
                          }}
                        >
                          {isAdmin
                            ? "Я (Служба Заботы)"
                            : getUserName(msg.user_id)}
                        </div>
                        <div className="admin-chat-bubble-text">{msg.text}</div>
                        <div className="admin-chat-bubble-time">
                          {new Date(msg.created_at).toLocaleTimeString(
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
                    style={{ textAlign: "center", marginTop: "40px" }}
                  >
                    Сообщений нет. Клиент молчит.
                  </p>
                )}
              </div>

              {/* Поле ввода только если тикет активен */}
              {selectedTicket.is_active ? (
                <form
                  className="admin-chat-input-area"
                  onSubmit={handleSendMessage}
                  style={{ padding: "16px 0 0 0", borderTop: "none" }}
                >
                  <input
                    type="text"
                    placeholder="Напиши им жесткий и уверенный ответ..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
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
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "var(--color-text-muted)",
                    fontWeight: "bold",
                    fontStyle: "italic",
                  }}
                >
                  Обращение закрыто. Чат переведен в режим архива.
                </div>
              )}
            </>
          ) : (
            <div className="admin-chat-empty">
              <p>Выбери тикет слева, чтобы я мог подключить тебя к каналу.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTickets;
