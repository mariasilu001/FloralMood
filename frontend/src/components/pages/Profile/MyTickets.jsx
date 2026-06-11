import React, { useState, useMemo, useContext } from "react";
import { DBcontext } from "../../../Database";
import AdminModal from "../../admin/AdminModal";

const MyTickets = () => {
  // Вытаскиваем таблицы локальной базы данных и функции их перезаписи из нашего контекста
  const {
    users,
    tickets,
    setTickets,
    ticketSubjects,
    ticketMessages,
    setTicketMessages,
  } = useContext(DBcontext);

  // Локальные состояния для управления интерфейсом чата
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Стейты полей ввода текстовых форм
  const [newTicket, setNewTicket] = useState({ subjectId: "", text: "" });
  const [replyText, setReplyText] = useState("");

  // ==========================================
  // ХУКИ ДАННЫХ И СЕССИИ (Строго на самом верху компонента)
  // ==========================================

  // Восстанавливаем локальную сессию пользователя по строковому ключу
  const userIdStr = localStorage.getItem("userId");

  const user = useMemo(() => {
    if (!users || !userIdStr) return null;
    return users.find((u) => u._id === BigInt(userIdStr));
  }, [users, userIdStr]);

  // Фильтруем таблицу тикетов, оставляя только записи текущего пользователя
  const userTickets = useMemo(() => {
    if (!tickets || !user) return [];
    return tickets.filter((t) => t.user_id === user._id);
  }, [tickets, user]);

  // Вычисляем архив сообщений для выбранного в данный момент тикета
  const currentMessages = useMemo(() => {
    if (!ticketMessages || !selectedTicketId) return [];
    return ticketMessages.filter((msg) => msg.ticket_id === selectedTicketId);
  }, [ticketMessages, selectedTicketId]);

  // Ищем активный объект выбранного тикета в отфильтрованном массиве
  const selectedTicket = useMemo(() => {
    if (!userTickets || !selectedTicketId) return null;
    return userTickets.find((t) => t._id === selectedTicketId);
  }, [userTickets, selectedTicketId]);

  // ==========================================
  // ЖЕСТКАЯ ЗАГЛУШКА БЕЗОПАСНОСТИ РЕНДЕРА
  // ==========================================
  if (!users || !tickets || !ticketSubjects || !ticketMessages) {
    return (
      <div
        className="profile-details-container"
        style={{ textAlign: "center", padding: "50px" }}
      >
        <h3 style={{ color: "var(--color-primary)" }}>
          Синхронизирую зашифрованные каналы связи...
        </h3>
      </div>
    );
  }

  if (!user) return null;

  // Функция для сопоставления ID темы с ее строковым названием
  const getSubjectName = (subId) => {
    const s = ticketSubjects.find((sub) => sub._id === subId);
    return s ? s.name : "Без темы";
  };

  // ==========================================
  // ЭКШЕНЫ УПРАВЛЕНИЯ ЛОКАЛЬНОЙ БАЗОЙ
  // ==========================================

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!newTicket.subjectId || !newTicket.text.trim()) {
      alert("Выбери тему и напиши хоть слово");
      return;
    }

    // Вычисляем новый уникальный BigInt ID для тикета
    const maxTicketId = tickets.reduce(
      (max, t) => (t._id > max ? t._id : max),
      0n,
    );
    const newTicketId = maxTicketId + 1n;

    // Формируем структуру нового тикета под схему базы данных
    const newTicketObj = {
      _id: newTicketId,
      user_id: user._id,
      subject_id: BigInt(newTicket.subjectId),
      is_active: true,
      created_at: new Date(),
    };

    // Автоматически создаем первое сообщение внутри этого тикета
    const maxMsgId = ticketMessages.reduce(
      (max, m) => (m._id > max ? m._id : max),
      0n,
    );
    const newMsgObj = {
      _id: maxMsgId + 1n,
      ticket_id: newTicketId,
      user_id: user._id,
      text: newTicket.text.trim(),
      created_at: new Date(),
    };

    // Записываем новые массивы объектов в реактивные состояния контекста
    setTickets([...tickets, newTicketObj]);
    setTicketMessages([...ticketMessages, newMsgObj]);

    setIsCreateModalOpen(false);
    setNewTicket({ subjectId: "", text: "" });
    alert("Твоя мольба о помощи услышана локальной базой данных.");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicketId) return;

    // Вычисляем следующий инкрементный ID для сообщения
    const maxMsgId = ticketMessages.reduce(
      (max, m) => (m._id > max ? m._id : max),
      0n,
    );

    const newMsgObj = {
      _id: maxMsgId + 1n,
      ticket_id: selectedTicketId,
      user_id: user._id,
      text: replyText.trim(),
      created_at: new Date(),
    };

    // Пушим новое сообщение в стейт, вызывая мгновенный рендер чата
    setTicketMessages([...ticketMessages, newMsgObj]);
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
        <p className="admin-text-muted" style={{ marginBottom: "24px" }}>
          Здесь хранятся ваши обращения в поддержку
        </p>

        {userTickets.length === 0 ? (
          <div className="profile-empty-state">У вас еще не было обращений</div>
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
                const isActive = ticket.is_active === true;

                return (
                  <tr key={String(ticket._id)}>
                    <td
                      style={{
                        fontWeight: "bold",
                        color: "var(--color-text-dark)",
                      }}
                    >
                      {getSubjectName(ticket.subject_id)}
                    </td>
                    <td>
                      {new Date(ticket.created_at).toLocaleString("ru-RU")}
                    </td>
                    <td>
                      <span
                        className={`order-status-badge ${isActive ? "status-1" : "status-4"}`}
                      >
                        {isActive ? "В работе" : "Решено"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="profile-btn-outline"
                        style={{ padding: "6px 12px" }}
                        onClick={() => setSelectedTicketId(ticket._id)}
                      >
                        {isActive ? "Открыть чат" : "Посмотреть архив"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* МОДАЛКА: СОЗДАТЬ ТИКЕТ */}
      {isCreateModalOpen && (
        <AdminModal
          title="Новое обращение"
          onClose={() => setIsCreateModalOpen(false)}
        >
          <form className="admin-bouquets-form" onSubmit={handleCreateTicket}>
            <label>Тема проблемы:</label>
            <select
              value={newTicket.subjectId}
              onChange={(e) =>
                setNewTicket({ ...newTicket, subjectId: e.target.value })
              }
              required
            >
              <option value="">-- Выбери тему --</option>
              {ticketSubjects.map((sub) => (
                <option key={String(sub._id)} value={String(sub._id)}>
                  {sub.name}
                </option>
              ))}
            </select>

            <label>Опишите свою проблему:</label>
            <textarea
              value={newTicket.text}
              onChange={(e) =>
                setNewTicket({ ...newTicket, text: e.target.value })
              }
              required
              rows="5"
              placeholder="Расскажи, что сломалось..."
            />

            <button
              type="submit"
              className="admin-bouquets-btn-primary"
              style={{ marginTop: "16px" }}
            >
              Отправить
            </button>
          </form>
        </AdminModal>
      )}

      {/* МОДАЛКА: ТЕКУЩИЙ ЧАТ ТИКЕТА */}
      {selectedTicket && (
        <AdminModal
          title={`Обращение: ${getSubjectName(selectedTicket.subject_id)}`}
          onClose={() => setSelectedTicketId(null)}
        >
          <div className="profile-modal-chat-container">
            <div className="admin-chat-messages profile-chat-box">
              {currentMessages.map((msg) => {
                const isMe = msg.user_id === user._id;

                return (
                  <div
                    key={String(msg._id)}
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
                          textAlign: isMe ? "right" : "left",
                          fontWeight: "bold",
                        }}
                      >
                        {isMe ? user.username || "Ты" : "Служба Заботы"}
                      </div>
                      <div className="admin-chat-bubble-text">{msg.text}</div>
                      <div
                        className="admin-chat-bubble-time"
                        style={{
                          textAlign: isMe ? "right" : "left",
                          fontSize: "10px",
                          opacity: 0.6,
                        }}
                      >
                        {new Date(msg.created_at).toLocaleTimeString("ru-RU", {
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
                style={{ padding: "16px 0 0 0", borderTop: "none" }}
              >
                <input
                  type="text"
                  placeholder="Напиши ответ..."
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
                className="profile-ticket-closed-msg"
                style={{
                  textAlign: "center",
                  padding: "10px",
                  color: "#aaa",
                  fontWeight: "bold",
                }}
              >
                Обращение закрыто. Чат доступен в режиме архива.
              </div>
            )}
          </div>
        </AdminModal>
      )}
    </div>
  );
};

export default MyTickets;
