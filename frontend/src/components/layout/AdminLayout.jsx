import React, { useContext, useMemo } from "react";
import { Navigate, Outlet, NavLink, Link } from "react-router-dom";
import { DBcontext } from "../../Database"; // НАША локальная база данных

const AdminLayout = () => {
  // 1. Достаем список пользователей из нашей локальной базы
  const { users } = useContext(DBcontext);

  // 2. Идентификация сессии через localStorage (как мы делали в профиле)
  const userIdStr = localStorage.getItem("userId");

  // Ищем юзера и считаем роль
  const user = useMemo(() => {
    if (!users || !userIdStr) return null;
    return users.find((u) => u._id === BigInt(userIdStr));
  }, [users, userIdStr]);

  // 3. ЖЕСТКАЯ ЗАГЛУШКА
  // Если база еще грузится, не пускаем дальше
  if (!users) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        Проверка прав доступа...
      </div>
    );
  }

  // 4. ЗАЩИТА АДМИНКИ:
  // Если юзера нет или его роль не 1n (админ) — выкидываем на главную
  if (!user || user.role_id !== 1n) {
    return <Navigate to="/" replace />;
  }

  // Если всё хорошо, возвращаем верстку
  return (
    <div className="admin-layout-wrapper">
      <header className="admin-layout-header">
        <div className="admin-layout-top">
          <Link to="/" className="admin-layout-logo">
            <span className="admin-layout-logo-icon">FM</span>
          </Link>
          <h1 className="admin-layout-title">FloralMood Direction</h1>
        </div>
        <nav className="admin-layout-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive
                ? "admin-layout-nav-link admin-layout-nav-link--active"
                : "admin-layout-nav-link"
            }
          >
            Статистика
          </NavLink>
          <NavLink
            to="/admin/bouquets"
            className={({ isActive }) =>
              isActive
                ? "admin-layout-nav-link admin-layout-nav-link--active"
                : "admin-layout-nav-link"
            }
          >
            Управление букетами
          </NavLink>
          <NavLink
            to="/admin/components"
            className={({ isActive }) =>
              isActive
                ? "admin-layout-nav-link admin-layout-nav-link--active"
                : "admin-layout-nav-link"
            }
          >
            Управление компонентами
          </NavLink>
          <NavLink
            to="/admin/tickets"
            className={({ isActive }) =>
              isActive
                ? "admin-layout-nav-link admin-layout-nav-link--active"
                : "admin-layout-nav-link"
            }
          >
            Служба заботы
          </NavLink>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              isActive
                ? "admin-layout-nav-link admin-layout-nav-link--active"
                : "admin-layout-nav-link"
            }
          >
            Управление заказами
          </NavLink>
        </nav>
      </header>
      <main className="admin-layout-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
