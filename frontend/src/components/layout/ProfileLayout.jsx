import React, { useState, useEffect, useMemo, useContext } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { DBcontext } from "../../Database"; // Наша локальная база!

const ProfileLayout = () => {
  const navigate = useNavigate();

  // 1. Достаем таблицу пользователей из нашей базы
  const { users, setUsers } = useContext(DBcontext);

  // ==========================================
  // ХУКИ ДОЛЖНЫ БЫТЬ НАВЕРХУ!
  // ==========================================

  // Безопасно ищем пользователя через BigInt
  const userIdStr = localStorage.getItem("userId");

  const user = useMemo(() => {
    if (!users || !userIdStr) return null;
    return users.find((u) => u._id === BigInt(userIdStr));
  }, [users, userIdStr]);

  // Локальный стейт для хранения сгенерированной ссылки на аватар
  const [avatarSrc, setAvatarSrc] = useState(null);

  // Эффект для безопасного создания ссылки на картинку в памяти
  useEffect(() => {
    // Если юзера нет или у него нет аватара — сбрасываем ссылку
    if (!user || !user.avatar) {
      setAvatarSrc(null);
      return;
    }

    let objectUrl = null;

    // Если аватар — это бинарный файл (Blob / File)
    if (user.avatar instanceof Blob || user.avatar instanceof File) {
      objectUrl = URL.createObjectURL(user.avatar);
      setAvatarSrc(objectUrl);
    } else {
      // Если это просто строковая ссылка (на случай моковых данных)
      setAvatarSrc(user.avatar);
    }

    // Cleanup: очищаем память при смене аватара или уходе со страницы
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [user]); // Зависим от объекта user

  // Эффект защиты: если база загрузилась, а юзера в ней нет — выгоняем на страницу входа
  useEffect(() => {
    if (users && !user) {
      navigate("/login");
    }
  }, [users, user, navigate]);

  // ==========================================
  // ЭКШЕНЫ
  // ==========================================

  const handleAvatarChange = (e) => {
    // Берем первый выбранный файл из инпута
    const file = e.target.files[0];
    if (!file) return;

    // Мы модифицируем таблицу пользователей!
    // Проходимся методом .map() по массиву users.
    const updatedUsers = users.map((u) => {
      // Если находим нашего текущего юзера
      if (u._id === user._id) {
        // Возвращаем копию его объекта, где заменяем avatar на наш ФАЙЛ (Blob)
        return { ...u, avatar: file };
      }
      // Остальных юзеров возвращаем без изменений
      return u;
    });

    // Жестко перезаписываем стейт базы данных.
    // useEffect в Database.jsx сам сохранит это в IndexedDB.
    setUsers(updatedUsers);
    alert("Умница. Аватар сохранен в локальную базу данных.");
  };

  // ==========================================
  // ЗАГЛУШКИ БЕЗОПАСНОСТИ (После всех хуков!)
  // ==========================================

  if (!users) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        Загрузка профиля...
      </div>
    );
  }

  if (!user) {
    return null; // Компонент скроется и effect перенаправит на /login
  }

  // ==========================================
  // РЕНДЕР
  // ==========================================

  return (
    <div className="profile-container">
      <aside className="profile-sidebar">
        <div className="profile-user-badge">
          <label
            className="profile-avatar-wrapper"
            title="Изменить аватар"
            style={{ cursor: "pointer" }}
          >
            {/* Невидимый инпут для файла */}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
            <div className="profile-avatar">
              {/* Рендерим нашу безопасную локальную ссылку */}
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Аватар"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                // Заглушка: первая буква имени, если аватара нет
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    color: "#888",
                    backgroundColor: "#eee",
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="profile-avatar-overlay">
                <span>Изменить</span>
              </div>
            </div>
          </label>
          <div className="profile-name">{user.username}</div>
        </div>

        <nav className="profile-nav">
          <NavLink
            to="/profile"
            end
            className={({ isActive }) =>
              isActive
                ? "profile-nav-link profile-nav-link--active"
                : "profile-nav-link"
            }
          >
            Личные данные
          </NavLink>
          <NavLink
            to="/profile/custom-bouquets"
            className={({ isActive }) =>
              isActive
                ? "profile-nav-link profile-nav-link--active"
                : "profile-nav-link"
            }
          >
            Мои кастомные букеты
          </NavLink>
          <NavLink
            to="/profile/events"
            className={({ isActive }) =>
              isActive
                ? "profile-nav-link profile-nav-link--active"
                : "profile-nav-link"
            }
          >
            Календарь событий
          </NavLink>
          <NavLink
            to="/profile/orders"
            className={({ isActive }) =>
              isActive
                ? "profile-nav-link profile-nav-link--active"
                : "profile-nav-link"
            }
          >
            История заказов
          </NavLink>
          <NavLink
            to="/profile/favorites"
            className={({ isActive }) =>
              isActive
                ? "profile-nav-link profile-nav-link--active"
                : "profile-nav-link"
            }
          >
            Избранное
          </NavLink>
          <NavLink
            to="/profile/tickets"
            className={({ isActive }) =>
              isActive
                ? "profile-nav-link profile-nav-link--active"
                : "profile-nav-link"
            }
          >
            Служба заботы
          </NavLink>
        </nav>
      </aside>

      <div className="profile-content">
        <Outlet />
      </div>
    </div>
  );
};

export default ProfileLayout;
