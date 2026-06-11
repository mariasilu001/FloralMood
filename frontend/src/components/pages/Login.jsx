import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom"; // Я добавил тебе Link, чтобы не было ошибок
import { AppContext } from "../../App";
import { DBcontext } from "../../Database";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const { setUser, user } = useContext(AppContext);
  const { users } = useContext(DBcontext);
  if (!users) {
    return null;
  }

  const handleLogin = (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Заполните все поля!");
      return;
    }

    const currUser = users.find((u) => u.email === email);

    if (!currUser) {
      setError("Пользователь не найден");
      return;
    }

    if (currUser.password_hash !== password) {
      setError("Неверный пароль");
      return;
    }

    setUser(currUser);
    localStorage.setItem("userId", currUser._id);
    navigate("/");
  };

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

      <Link to="/register" className="auth-link">
        Нет аккаунта? <span>Создать</span>
      </Link>
    </div>
  );
};

export default Login;
