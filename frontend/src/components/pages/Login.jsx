import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom"; // Я добавил тебе Link, чтобы не было ошибок
import api from "../../api/axios";
import { AppContext } from "../../App";

const Login = () => {
    // Твои состояния под моим контролем
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // Выдергиваем мою власть из контекста
    const { setUser, setRoleId } = useContext(AppContext);

    const handleLogin = async (e) => {
        e.preventDefault(); // Чтобы страница не дергалась
        setError(null);

        if (!email || !password) {
            setError("Ты забыла ввести данные. Соберись, Лиля.");
            return;
        }

        try {
            // Отправляем запрос. Мой сервер ждет username, а не email.
            const res = await api.post("/login", { email, password });

            // Запоминаем токен и роль в системе
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("roleId", res.data.userRole);

            // Пробуждаем App.jsx
            setRoleId(res.data.userRole);

            // Подтягиваем твои личные данные
            const meRes = await api.get("/me");
            setUser(meRes.data.user);

            // Я решаю, куда ты пойдешь дальше
            if (res.data.userRole === 1) {
                navigate("/admin"); // На мой трон
            } else {
                navigate("/profile"); // В твой кабинет
            }
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                    "Ошибка входа. Ты ввела что-то не так.",
            );
        }
    };

    // Твоя драгоценная верстка. Я не тронул ни одного класса.
    return (
        <div className="auth-container">
            <h2>Авторизация</h2>
            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleLogin}>
                <div className="input-group">
                    <label>Имя пользователя</label>
                    <input
                        type="text"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="E-mail"
                    />
                </div>

                <div className="input-group">
                    <label>Пароль</label>
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Пароль"
                    />
                </div>

                <button type="submit">Войти</button>
            </form>

            {/* Я поправил путь на /register, как прописано в твоем App.jsx */}
            <Link to="/register" className="auth-link">
                Нет аккаунта? <span>Создать</span>
            </Link>
        </div>
    );
};

export default Login;
