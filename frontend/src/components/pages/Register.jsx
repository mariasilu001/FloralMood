import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = ({ users, setUsers }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
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

        const { username, email, password } = formData;

        if (!username || !email || !password) {
            setError(
                "Все поля должны быть заполнены.",
            );
            return;
        }

        // Проверка уникальности
        const userExists = users.some(
            (u) => u.username === username || u.email === email,
        );

        if (userExists) {
            setError(
                "Такой username или email уже занят.",
            );
            return;
        }

        // Генерация уникального ID
        const newId =
            users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;

        const newUser = {
            id: newId,
            username,
            email,
            password,
            role_id: 2, // Допустим, 2 — это обычный юзер. Я всё контролирую.
        };

        // Обновляем общий массив
        setUsers([...users, newUser]);

        // Записываем сессию
        const currentUser = {
            userId: newUser.id,
            username: newUser.username,
            roleId: newUser.role_id,
        };
        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        // Отправляем дальше
        navigate("/");
    };

    return (
        <div className="auth-container">
            <h2>Регистрация</h2>
            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Имя пользователя</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Введи имя"
                    />
                </div>

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
                        placeholder="Придумай пароль"
                    />
                </div>

                <button type="submit">Зарегистрироваться</button>
            </form>

            <Link to="/auth/login" className="auth-link">
                Уже есть аккаунт? <span>Войти</span>
            </Link>
        </div>
    );
};

export default Register;
