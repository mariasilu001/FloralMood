import React from "react";
import { Navigate, Outlet, NavLink, Link } from "react-router-dom";

const AdminLayout = () => {
    const currentUserStr = localStorage.getItem("currentUser");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    // Мой жесткий контроль. Только Админ (roleId === 1) имеет право быть здесь.
    if (!currentUser || currentUser.roleId !== 1) {
        return <Navigate to="/" replace />;
    }

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
                </nav>
            </header>
            <main className="admin-layout-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
