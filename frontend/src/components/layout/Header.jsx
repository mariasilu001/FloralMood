import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DBcontext } from "../../Database"; // НАША база данных

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  // Вытаскиваем нужные таблицы из контекста
  const { searchHistory, setSearchHistory, users } = useContext(DBcontext);

  // Жесткая заглушка: пока базы нет, шапку не рендерим
  if (!searchHistory || !users) return null;

  // Моя правильная механика сессии
  const userIdStr = localStorage.getItem("userId");

  // Если строка в хранилище есть, превращаем её в BigInt и ищем юзера. Иначе - null.
  const user = userIdStr
    ? users.find((u) => u._id === BigInt(userIdStr))
    : null;

  const userHistory = user
    ? searchHistory
        .filter((h) => h.user_id === user._id)
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .slice(0, 5)
    : [];

  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    if (user) {
      const maxId = searchHistory.reduce(
        (max, item) => (item._id > max ? item._id : max),
        0n,
      );

      const newHistoryItem = {
        _id: maxId + 1n,
        user_id: user._id,
        text: searchQuery.trim(),
        created_at: new Date(),
        deleted_at: null,
      };

      setSearchHistory([newHistoryItem, ...searchHistory]);
    }

    setShowHistory(false);
    navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
  };

  const handleHistoryClick = (text) => {
    setSearchQuery(text);
    setShowHistory(false);
    navigate(`/?q=${encodeURIComponent(text)}`);
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <Link to="/" className="logo-link">
          <div className="logo-icon">FM</div>
          <span className="logo-text">FloralMood</span>
        </Link>

        <form
          onSubmit={handleSearch}
          className="search-form"
          style={{ position: "relative" }}
        >
          <input
            type="text"
            placeholder="Найти свой идеальный букет..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
          />
          <button type="submit">Искать</button>

          {showHistory && userHistory.length > 0 && (
            <ul
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                width: "100%",
                background: "#fff",
                zIndex: 10,
                listStyle: "none",
                padding: "10px",
                margin: 0,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                borderRadius: "8px",
                textAlign: "left",
              }}
            >
              <li
                style={{ fontSize: "12px", color: "#888", marginBottom: "5px" }}
              >
                История поиска:
              </li>
              {userHistory.map((h) => (
                <li
                  key={h._id}
                  style={{
                    padding: "8px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                    color: "#333",
                  }}
                  onMouseDown={() => handleHistoryClick(h.text)}
                >
                  {h.text}
                </li>
              ))}
            </ul>
          )}
        </form>

        <nav className="header-nav">
          {user ? (
            <>
              <Link
                to="/profile/favorites"
                className="nav-icon"
                title="Избранное"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-heart-fill"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"
                  />
                </svg>{" "}
                Избранное
              </Link>
              <Link to="/cart" className="nav-icon" title="Корзина">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-cart-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                </svg>{" "}
                Корзина
              </Link>
              <Link to="/profile" className="nav-icon" title="Профиль">
                {user.avatar ? (
                  <img
                    src={`/${user.avatar}`}
                    alt="Аватар"
                    className="header-avatar"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-person-square"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                    <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1v-1c0-1-1-4-6-4s-6 3-6 4v1a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" />
                  </svg>
                )}{" "}
                {user.username}
              </Link>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                Войти
              </Link>
              <Link to="/register" className="btn-register">
                Зарегистрироваться
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
