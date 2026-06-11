import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import { DBcontext } from "../../Database";

const Register = () => {
  const navigate = useNavigate();

  // Вытаскиваем глобальные инструменты из контекстов
  const { setUser } = useContext(AppContext);
  const { users, setUsers } = useContext(DBcontext);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);

  // Жесткая заглушка: пока контекст базы данных равен null, ничего не рендерим
  if (!users) {
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const { username, email, password } = formData;

    if (!username || !email || !password) {
      setError("Все поля должны быть заполнены");
      return;
    }

    const userExists = users.some(
      (u) => u.username === username || u.email === email,
    );

    if (userExists) {
      setError(
        "Такой username или email уже занят",
      );
      return;
    }

    // Безопасный поиск максимального ID для типа BigInt через метод reduce
    const maxId = users.reduce((max, u) => (u._id > max ? u._id : max), 0n);
    const newId = maxId + 1n;

    // Формируем объект строго по структуре твоих моковых данных
    const newUser = {
      _id: newId,
      username: username,
      email: email,
      password_hash: password,
      role_id: 2n, // 2n — тип BigInt для роли обычного покупателя (customer)
      avatar: null,
      created_at: new Date(), // Объект даты, как в файле users.js
      deleted_at: null,
    };

    // Обновляем массив пользователей в глобальном состоянии базы данных
    setUsers([...users, newUser]);

    // Авторизуем пользователя в глобальном AppContext
    setUser(newUser);

    // Записываем в локальное хранилище строго строковое значение userId
    localStorage.setItem("userId", String(newUser._id));

    // Уводим пользователя на главную страницу
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
