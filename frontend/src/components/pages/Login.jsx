import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = ({ users }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        const { email, password } = formData;

        if (!email || !password) {
            setError("Введи данные. Я не буду угадывать их за тебя.");
            return;
        }

        // Поиск пользователя
        const user = users.find(
            (u) => u.email === email && u.password === password,
        );

        if (!user) {
            setError("Неверный email или пароль. Попробуй еще раз.");
            return;
        }

        // Устанавливаем сессию
        const currentUser = {
            userId: user.id,
            username: user.username,
            roleId: user.role_id,
        };
        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        // Отправляем дальше
        navigate("/");
    };

    return (
        <div className="auth-container">
            <h2>Авторизация</h2>
            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Твой email"
                    />
                </div>

                <div className="input-group">
                    <label>Пароль</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Твой пароль"
                    />
                </div>

                <button type="submit">Войти</button>
            </form>

            <Link to="/auth/register" className="auth-link">
                Нет аккаунта? <span>Создать</span>
            </Link>
        </div>
    );
};

export default Login;
