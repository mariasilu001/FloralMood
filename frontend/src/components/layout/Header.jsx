import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ searchHistory, setSearchHistory }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    // Достаем пользователя так, как я тебя учил
    const currentUserStr = localStorage.getItem("currentUser");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        // Записываем историю поиска, как ты и проектировала
        const newQuery = {
            query_id:
                searchHistory.length > 0
                    ? Math.max(...searchHistory.map((q) => q.query_id)) + 1
                    : 1,
            user_id: currentUser ? currentUser.userId : null,
            text: searchQuery,
            created_at: new Date().toISOString(),
            deleted_at: null,
        };

        setSearchHistory([...searchHistory, newQuery]);
        navigate(`/search?q=${searchQuery}`);
        setSearchQuery("");
    };

    return (
        <header className="site-header">
            <div className="header-container">
                {/* Логотип */}
                <Link to="/" className="logo-link">
                    <div className="logo-icon">FM</div>
                    <span className="logo-text">FloralMood</span>
                </Link>

                {/* Строка поиска */}
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Найти свой идеальный букет..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit">Искать</button>
                </form>

                {/* Навигация */}
                <nav className="header-nav">
                    {currentUser ? (
                        <>
                            <Link
                                to="/favorites"
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
                            <Link
                                to="/cart"
                                className="nav-icon"
                                title="Корзина"
                            >
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
                            <Link
                                to="/profile"
                                className="nav-icon"
                                title="Профиль"
                            >
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
                                </svg>{" "}
                                {currentUser.username}
                            </Link>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/auth/login" className="btn-login">
                                Войти
                            </Link>
                            <Link to="/auth/register" className="btn-register">
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
