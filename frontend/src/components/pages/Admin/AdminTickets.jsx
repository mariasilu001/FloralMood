import React, { useState } from "react";

const AdminTickets = ({ tickets, setTickets, ticketMessages, setTicketMessages, ticketSubjects, users }) => {
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [replyText, setReplyText] = useState("");

    const currentUserStr = localStorage.getItem("currentUser");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    // Выбираем только активные тикеты, как ты и просила
    const activeTickets = tickets.filter(t => t.is_active === 1 || t.is_active === true);
    
    const selectedTicket = tickets.find(t => t.ticket_id === selectedTicketId);
    const currentMessages = ticketMessages.filter(m => m.ticket_id === selectedTicketId);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedTicketId) return;

        const newMessageId = ticketMessages.length > 0 ? Math.max(...ticketMessages.map(m => m.message_id)) + 1 : 1;
        const newMessage = {
            message_id: newMessageId,
            ticket_id: selectedTicketId,
            user_id: currentUser.userId, // От лица админа
            text: replyText,
            created_at: new Date().toISOString()
        };

        setTicketMessages([...ticketMessages, newMessage]);
        setReplyText("");
    };

    const handleCloseTicket = () => {
        if (!selectedTicketId) return;
        
        setTickets(prev => prev.map(t => 
            t.ticket_id === selectedTicketId ? { ...t, is_active: 0 } : t
        ));
        
        setSelectedTicketId(null);
        alert("Жалоба безжалостно закрыта. Больше они нас не побеспокоят.");
    };

    const getUserName = (userId) => {
        const u = users.find(u => u.user_id === userId);
        return u ? u.username : "Неизвестный";
    };

    const getSubjectName = (subId) => {
        const s = ticketSubjects.find(s => s.subject_id === subId);
        return s ? s.name : "Без темы";
    };

    return (
        <div className="admin-tickets-container">
            <div className="admin-tickets-header">
                <h2>Служба Заботы</h2>
                <p className="admin-text-muted">Разберись с их недовольством.</p>
            </div>

            <div className="admin-tickets-layout">
                {/* ЛЕВАЯ КОЛОНКА: Список тикетов */}
                <div className="admin-tickets-sidebar">
                    <h3 className="admin-subsection-title" style={{marginTop: 0}}>Активные обращения ({activeTickets.length})</h3>
                    <div className="admin-tickets-list">
                        {activeTickets.length === 0 ? (
                            <p className="admin-text-muted" style={{padding: '16px'}}>Нет активных проблем. Идеально.</p>
                        ) : (
                            activeTickets.map(ticket => (
                                <div 
                                    key={ticket.ticket_id} 
                                    className={`admin-ticket-card ${selectedTicketId === ticket.ticket_id ? 'admin-ticket-card--active' : ''}`}
                                    onClick={() => setSelectedTicketId(ticket.ticket_id)}
                                >
                                    <div className="admin-ticket-card-header">
                                        <span className="admin-ticket-subject">{getSubjectName(ticket.subject_id)}</span>
                                        <span className="admin-ticket-date">{new Date(ticket.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="admin-ticket-card-user">
                                        Клиент: <strong>{getUserName(ticket.user_id)}</strong>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ПРАВАЯ КОЛОНКА: Чат тикета */}
                <div className="admin-tickets-chat-area">
                    {selectedTicket ? (
                        <>
                            <div className="admin-chat-header">
                                <div>
                                    <h3>{getSubjectName(selectedTicket.subject_id)}</h3>
                                    <p className="admin-text-muted" style={{fontSize: '0.85rem'}}>Клиент: {getUserName(selectedTicket.user_id)}</p>
                                </div>
                                <button className="admin-bouquets-btn-delete" onClick={handleCloseTicket}>
                                    Закрыть обращение
                                </button>
                            </div>
                            
                            <div className="admin-chat-messages">
                                {currentMessages.map(msg => {
                                    const isAdmin = msg.user_id === currentUser.userId;
                                    return (
                                        <div key={msg.message_id} className={`admin-chat-bubble-wrapper ${isAdmin ? 'admin-chat-bubble-wrapper--admin' : ''}`}>
                                            <div className={`admin-chat-bubble ${isAdmin ? 'admin-chat-bubble--admin' : 'admin-chat-bubble--user'}`}>
                                                <div className="admin-chat-bubble-author">
                                                    {isAdmin ? "Я (Поддержка)" : getUserName(msg.user_id)}
                                                </div>
                                                <div className="admin-chat-bubble-text">{msg.text}</div>
                                                <div className="admin-chat-bubble-time">
                                                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {currentMessages.length === 0 && <p className="admin-text-muted" style={{textAlign: 'center', marginTop: '40px'}}>Сообщений нет. Странно.</p>}
                            </div>

                            <form className="admin-chat-input-area" onSubmit={handleSendMessage}>
                                <input 
                                    type="text" 
                                    placeholder="Напиши им жесткий и уверенный ответ..." 
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                />
                                <button type="submit" className="admin-bouquets-btn-primary" style={{width: 'auto', margin: 0}}>Отправить</button>
                            </form>
                        </>
                    ) : (
                        <div className="admin-chat-empty">
                            <p>Выбери тикет слева, чтобы я мог проанализировать их нытье.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminTickets;