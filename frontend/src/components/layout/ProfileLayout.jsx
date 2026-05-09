import React, { useContext } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { AppContext } from "../../App";
import api from "../../api/axios";

const ProfileLayout = () => {
    // Вся твоя жизнь теперь лежит здесь
    const { user, setUser } = useContext(AppContext);

    // Этот предохранитель уже есть в App.jsx, но пусть будет, чтобы не было ошибок рендера
    if (!user) return null; 

    // Мой правильный загрузчик аватарок
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file); // Мой бэкенд ждет файл в поле image
        // Нам нужно отправить put запрос на /me. Я передаю старые данные, чтобы они не стерлись
        formData.append("username", user.username);
        if (user.email) formData.append("email", user.email);

        try {
            // Отправляем файл на сервер
            const res = await api.put("/me", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            // Обновляем контекст, чтобы новая картинка появилась везде
            setUser(res.data.user);
            alert("Аватар обновлен. Теперь ты выглядишь приемлемо.");
        } catch (error) {
            console.error(error);
            alert("Ошибка загрузки. Файл слишком большой или это вообще не картинка.");
        }
    };

    return (
        <div className="profile-container">
            <aside className="profile-sidebar">
                <div className="profile-user-badge">
                    <label className="profile-avatar-wrapper" title="Изменить аватар">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            style={{ display: "none" }}
                        />
                        <div className="profile-avatar">
                            {/* Картинка тянется из папки uploads моего сервера */}
                            {user.avatar ? (
                                <img src={`/uploads/${user.avatar}`} alt="Аватар" />
                            ) : (
                                user.username.charAt(0).toUpperCase()
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
                            isActive ? "profile-nav-link profile-nav-link--active" : "profile-nav-link"
                        }
                    >
                        Личные данные
                    </NavLink>
                    <NavLink
                        to="/profile/custom-bouquets"
                        className={({ isActive }) =>
                            isActive ? "profile-nav-link profile-nav-link--active" : "profile-nav-link"
                        }
                    >
                        Мои кастомные букеты
                    </NavLink>
                    <NavLink
                        to="/profile/events"
                        className={({ isActive }) =>
                            isActive ? "profile-nav-link profile-nav-link--active" : "profile-nav-link"
                        }
                    >
                        Календарь событий
                    </NavLink>
                    <NavLink
                        to="/profile/orders"
                        className={({ isActive }) =>
                            isActive ? "profile-nav-link profile-nav-link--active" : "profile-nav-link"
                        }
                    >
                        История заказов
                    </NavLink>
                    <NavLink
                        to="/profile/favorites"
                        className={({ isActive }) =>
                            isActive ? "profile-nav-link profile-nav-link--active" : "profile-nav-link"
                        }
                    >
                        Избранное
                    </NavLink>
                    <NavLink
                        to="/profile/tickets"
                        className={({ isActive }) =>
                            isActive ? "profile-nav-link profile-nav-link--active" : "profile-nav-link"
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