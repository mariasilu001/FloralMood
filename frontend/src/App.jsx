import React, { createContext, useState, useEffect } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import api from "./api/axios"; // Мой покорный axios

// --- ИМПОРТЫ ЛЕЙАУТОВ (Каркасы страниц) ---
import MainLayout from "./components/layout/MainLayout";
import ProfileLayout from "./components/layout/ProfileLayout";
import AdminLayout from "./components/layout/AdminLayout";

// --- ИМПОРТЫ ПУБЛИЧНЫХ СТРАНИЦ ---
import Home from "./components/pages/Home/Home";
import Login from "./components/pages/Login";
import Register from "./components/pages/Register";
import Customizer from "./components/pages/Customizer/Customizer";
import Cart from "./components/pages/Cart/Cart";
import BouquetDetails from "./components/pages/BouquetDetails/BouquetDetails";

// --- ИМПОРТЫ ЛИЧНОГО КАБИНЕТА ---
import PersonalDetails from "./components/pages/Profile/PersonalDetails";
import OrderHistory from "./components/pages/Profile/OrderHistory";
import MyTickets from "./components/pages/Profile/MyTickets";
import MyFavorites from "./components/pages/Profile/MyFavorites";
import MyEvents from "./components/pages/Profile/MyEvents";
import MyCustomBouquets from "./components/pages/Profile/MyCustomBouquets";

// --- ИМПОРТЫ АДМИНКИ (Моя территория) ---
import AdminCharts from "./components/pages/Admin/AdminCharts";
import AdminBouquets from "./components/pages/Admin/AdminBouquets";
import AdminComponents from "./components/pages/Admin/AdminComponents";
import AdminTickets from "./components/pages/Admin/AdminTickets";

import ScrollToTop from "./components/utils/ScrollToTop";

// Создаю Контекст. Через него ты будешь получать всё.
export const AppContext = createContext();

const App = () => {
    // --- АВТОРИЗАЦИЯ ---
    const [user, setUser] = useState(null);
    const [roleId, setRoleId] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    // --- ПУБЛИЧНЫЕ ДАННЫЕ (Для всех) ---
    const [publicData, setPublicData] = useState({
        bouquets: [],
        components: [],
        categories: [],
        tags: [],
        globalEvents: [],
        eventTypes: [],
        timeSlots: [],
        paymentMethods: [],
        ticketSubjects: [],
    });

    // --- ЛИЧНЫЕ ДАННЫЕ (Только для тебя) ---
    // Я задаю дефолтные пустые массивы. Больше никакого undefined!
    const [meData, setMeData] = useState({
        addresses: [],
        events: [],
        favorites: [],
        cart: { items: [], totalCartPrice: 0 },
        orders: [],
        customBouquets: [],
        tickets: [],
    });

    // --- АДМИНСКИЕ ДАННЫЕ (Моя абсолютная власть) ---
    const [adminData, setAdminData] = useState({
        allBouquets: [],
        allComponents: [],
        allTickets: [],
        revenueStats: [],
        statusesStats: [],
        topBouquets: [],
        supportStats: [],
    });

    // Загрузка публичных данных
    const fetchPublicData = async () => {
        try {
            const [
                resBouquets,
                resComponents,
                resCategories,
                resTags,
                resGlobalEvents,
                resEventTypes,
                resTimeSlots,
                resPaymentMethods,
                resTicketSubjects,
            ] = await Promise.all([
                api.get("/bouquets"),
                api.get("/components"),
                api.get("/categories"),
                api.get("/tags"),
                api.get("/events/global"),
                api.get("/events/types"),
                api.get("/delivery/time-slots"),
                api.get("/payment-methods"),
                api.get("/tickets/subjects"),
            ]);

            setPublicData({
                bouquets: resBouquets.data.bouquets || [],
                components: resComponents.data.components || [],
                categories: resCategories.data.categories || [],
                tags: resTags.data.tags || [],
                globalEvents: resGlobalEvents.data.globalEvents || [],
                eventTypes: resEventTypes.data.eventTypes || [],
                timeSlots: resTimeSlots.data.timeSlots || [],
                paymentMethods: resPaymentMethods.data.paymentMethods || [],
                ticketSubjects: resTicketSubjects.data.subjects || [],
            });
        } catch (error) {
            console.error("Ошибка загрузки публичных данных:", error);
        }
    };

    // Загрузка твоих личных данных
    const fetchMeData = async () => {
        try {
            const [
                resAddresses,
                resEvents,
                resFavorites,
                resCart,
                resOrders,
                resCustomBouquets,
                resTickets,
            ] = await Promise.all([
                api.get("/me/addresses"),
                api.get("/me/events"),
                api.get("/me/favorites"),
                api.get("/me/cart"),
                api.get("/me/orders"),
                api.get("/me/custom-bouquets"),
                api.get("/me/tickets"),
            ]);

            setMeData({
                addresses: resAddresses.data.addresses || [],
                events: resEvents.data.events || [],
                favorites: resFavorites.data.favorites || [],
                cart: resCart.data || { items: [], totalCartPrice: 0 },
                orders: resOrders.data.orders || [],
                customBouquets: resCustomBouquets.data.bouquets || [],
                tickets: resTickets.data.tickets || [],
            });
        } catch (error) {
            console.error("Ошибка загрузки личных данных:", error);
        }
    };

    // Загрузка админки
    const fetchAdminData = async () => {
        try {
            const [
                resBouquets,
                resComponents,
                resTickets,
                resRev,
                resStat,
                resTop,
                resSup,
            ] = await Promise.all([
                api.get("/admin/bouquets"),
                api.get("/admin/components"),
                api.get("/admin/tickets"),
                api.get("/admin/stats/revenue?period=day"),
                api.get("/admin/stats/statuses"),
                api.get("/admin/stats/top-bouquets"),
                api.get("/admin/stats/support"),
            ]);

            setAdminData({
                allBouquets: resBouquets.data.bouquets || [],
                allComponents: resComponents.data.components || [],
                allTickets: resTickets.data.tickets || [],
                revenueStats: resRev.data.data || [],
                statusesStats: resStat.data.data || [],
                topBouquets: resTop.data.data || [],
                supportStats: resSup.data.data || [],
            });
        } catch (error) {
            console.error("Ошибка загрузки админских данных:", error);
        }
    };

    // Проверка авторизации при запуске
    const checkAuth = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setIsAuthLoading(false);
            return;
        }
        try {
            const res = await api.get("/me");
            setUser(res.data.user);
            const savedRoleId = localStorage.getItem("roleId");
            setRoleId(savedRoleId ? parseInt(savedRoleId) : 2);
        } catch (error) {
            console.error("Токен умер. Я выкидываю тебя из системы.");
            localStorage.removeItem("token");
            localStorage.removeItem("roleId");
            setUser(null);
            setRoleId(null);
        } finally {
            setIsAuthLoading(false);
        }
    };

    // Эффект первичной инициализации
    useEffect(() => {
        checkAuth();
        fetchPublicData();
    }, []);

    // Эффект подгрузки личных и админских данных, когда мы узнали пользователя
    useEffect(() => {
        if (user) {
            fetchMeData();
            if (roleId === 1) {
                fetchAdminData();
            }
        } else {
            // Если ты вышла, я стираю всё, чтобы никто другой не увидел твои данные.
            setMeData({
                addresses: [],
                events: [],
                favorites: [],
                cart: { items: [], totalCartPrice: 0 },
                orders: [],
                customBouquets: [],
                tickets: [],
            });
            setAdminData({
                allBouquets: [],
                allComponents: [],
                allTickets: [],
                revenueStats: [],
                statusesStats: [],
                topBouquets: [],
                supportStats: [],
            });
        }
    }, [user, roleId]);

    const contextValue = {
        user,
        setUser,
        roleId,
        setRoleId,
        publicData,
        fetchPublicData,
        meData,
        fetchMeData,
        adminData,
        fetchAdminData,
        isAuthLoading, // Отдаю это в контекст, чтобы твои компоненты могли проверить загрузку
    };

    // Пока я не выяснил, кто ты, я не пущу тебя дальше этого экрана
    if (isAuthLoading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    background: "#1a1a2e",
                    color: "#f26076",
                }}
            >
                <h2>Я проверяю твои данные, Лили. Стой смирно и жди.</h2>
            </div>
        );
    }

    return (
        <AppContext.Provider value={contextValue}>
            <ScrollToTop />
            <Routes>
                {/* --- ПУБЛИЧНЫЕ РОУТЫ (Без Лейаута) --- */}
                <Route
                    path="/login"
                    element={!user ? <Login /> : <Navigate to="/profile" />}
                />
                {/*<Route
                    path="/register"
                    element={!user ? <Register /> : <Navigate to="/profile" />}
                />*/}

                <Route path="/" element={<MainLayout />}>
                    {/*<Route index element={<Home />} />
                    <Route path="customizer" element={<Customizer />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="bouquet/:id" element={<BouquetDetails />} />>*/}

                    <Route
                        path="/profile"
                        element={
                            user ? <ProfileLayout /> : <Navigate to="/login" />
                        }
                    >
                        <Route index element={<PersonalDetails />} />
                        {/*<Route path="orders" element={<OrderHistory />} />
                    <Route path="tickets" element={<MyTickets />} />
                    <Route path="favorites" element={<MyFavorites />} />*/}
                        <Route path="events" element={<MyEvents />} />
                        <Route
                            path="custom-bouquets"
                            element={<MyCustomBouquets />}
                        />
                    </Route>
                </Route>

                {/*<Route
                    path="/admin"
                    element={
                        user && roleId === 1 ? (
                            <AdminLayout />
                        ) : (
                            <Navigate to="/" />
                        )
                    }
                >
                    <Route index element={<AdminCharts />} />
                    <Route path="bouquets" element={<AdminBouquets />} />
                    <Route path="components" element={<AdminComponents />} />
                    <Route path="tickets" element={<AdminTickets />} />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />*/}
            </Routes>
        </AppContext.Provider>
    );
};

export default App;
