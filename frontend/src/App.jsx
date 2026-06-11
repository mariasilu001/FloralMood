import React, { createContext, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import api from "./api/axios";
import { ContextProvider } from "./Database";

// --- ИМПОРТЫ ЛЕЙАУТОВ ---
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

// --- ИМПОРТЫ АДМИНКИ ---
import AdminCharts from "./components/pages/Admin/AdminCharts";
import AdminBouquets from "./components/pages/Admin/AdminBouquets";
import AdminComponents from "./components/pages/Admin/AdminComponents";
import AdminTickets from "./components/pages/Admin/AdminTickets";
import AdminOrders from "./components/admin/AdminOrders";

import ScrollToTop from "./components/utils/ScrollToTop";

export const AppContext = createContext();

const App = () => {
  const [user, setUser] = useState(null);

  // // ВОТ ТО, ЧТО ТЫ ПРОСИЛА. Я сразу беру из localStorage и делаю числом.
  // // Если там пусто, будет null.
  // const [roleId, setRoleId] = useState(
  //     Number(localStorage.getItem("roleId")) || 1,
  // );

  // const localRole = localStorage.getItem("roleId");

  // const [isAuthLoading, setIsAuthLoading] = useState(true);

  // const [publicData, setPublicData] = useState({
  //     bouquets: [],
  //     components: [],
  //     categories: [],
  //     tags: [],
  //     globalEvents: [],
  //     eventTypes: [],
  //     timeSlots: [],
  //     paymentMethods: [],
  //     ticketSubjects: [],
  // });

  // const [meData, setMeData] = useState({
  //     addresses: [],
  //     events: [],
  //     favorites: [],
  //     cart: { items: [], totalCartPrice: 0 },
  //     orders: [],
  //     customBouquets: [],
  //     tickets: [],
  // });

  // const [adminData, setAdminData] = useState({
  //     allBouquets: [],
  //     allComponents: [],
  //     allTickets: [],
  //     revenueStats: [],
  //     statusesStats: [],
  //     topBouquets: [],
  //     supportStats: [],
  // });

  // const fetchPublicData = async () => {
  //     try {
  //         const [
  //             resBouquets,
  //             resComponents,
  //             resCategories,
  //             resTags,
  //             resGlobalEvents,
  //             resEventTypes,
  //             resTimeSlots,
  //             resPaymentMethods,
  //             resTicketSubjects,
  //         ] = await Promise.all([
  //             api.get("/bouquets"),
  //             api.get("/components"),
  //             api.get("/categories"),
  //             api.get("/tags"),
  //             api.get("/events/global"),
  //             api.get("/events/types"),
  //             api.get("/delivery/time-slots"),
  //             api.get("/payment-methods"),
  //             api.get("/tickets/subjects"),
  //         ]);

  //         setPublicData({
  //             bouquets: resBouquets.data.bouquets || [],
  //             components: resComponents.data.components || [],
  //             categories: resCategories.data.categories || [],
  //             tags: resTags.data.tags || [],
  //             globalEvents: resGlobalEvents.data.globalEvents || [],
  //             eventTypes: resEventTypes.data.eventTypes || [],
  //             timeSlots: resTimeSlots.data.timeSlots || [],
  //             paymentMethods: resPaymentMethods.data.paymentMethods || [],
  //             ticketSubjects: resTicketSubjects.data.subjects || [],
  //         });
  //     } catch (error) {
  //         console.error("Ошибка загрузки публичных данных:", error);
  //     }
  // };

  // const fetchMeData = async () => {
  //     try {
  //         const [
  //             resAddresses,
  //             resEvents,
  //             resFavorites,
  //             resCart,
  //             resOrders,
  //             resCustomBouquets,
  //             resTickets,
  //         ] = await Promise.all([
  //             api.get("/me/addresses"),
  //             api.get("/me/events"),
  //             api.get("/me/favorites"),
  //             api.get("/me/cart"),
  //             api.get("/me/orders"),
  //             api.get("/me/custom-bouquets"),
  //             api.get("/me/tickets"),
  //         ]);

  //         setMeData({
  //             addresses: resAddresses.data.addresses || [],
  //             events: resEvents.data.events || [],
  //             favorites: resFavorites.data.favorites || [],
  //             cart: resCart.data || { items: [], totalCartPrice: 0 },
  //             orders: resOrders.data.orders || [],
  //             customBouquets: resCustomBouquets.data.bouquets || [],
  //             tickets: resTickets.data.tickets || [],
  //         });
  //     } catch (error) {
  //         console.error("Ошибка загрузки личных данных:", error);
  //     }
  // };

  // const fetchAdminData = async () => {
  //     try {
  //         const [
  //             resBouquets,
  //             resComponents,
  //             resTickets,
  //             resRev,
  //             resStat,
  //             resTop,
  //             resSup,
  //         ] = await Promise.all([
  //             api.get("/admin/bouquets"),
  //             api.get("/admin/components"),
  //             api.get("/admin/tickets"),
  //             api.get("/admin/stats/revenue?period=day"),
  //             api.get("/admin/stats/statuses"),
  //             api.get("/admin/stats/top-bouquets"),
  //             api.get("/admin/stats/support"),
  //         ]);

  //         setAdminData({
  //             allBouquets: resBouquets.data.bouquets || [],
  //             allComponents: resComponents.data.components || [],
  //             allTickets: resTickets.data.tickets || [],
  //             revenueStats: resRev.data.data || [],
  //             statusesStats: resStat.data.data || [],
  //             topBouquets: resTop.data.data || [],
  //             supportStats: resSup.data.data || [],
  //         });
  //     } catch (error) {
  //         console.error("Ошибка загрузки админских данных:", error);
  //     }
  // };

  // // Я ДОБАВИЛ ЭТУ ФУНКЦИЮ ОБРАТНО. Без нее приложение зависало в вечной загрузке.
  // const checkAuth = async () => {
  //     const token = localStorage.getItem("token");
  //     if (!token) {
  //         setIsAuthLoading(false);
  //         return;
  //     }
  //     try {
  //         const res = await api.get("/me");
  //         setUser(res.data.user);
  //         // Роль мы уже достали в useState, так что просто снимаем блокировку
  //     } catch (error) {
  //         console.error("Токен умер. Я очищаю твои данные.");
  //         localStorage.removeItem("token");
  //         localStorage.removeItem("roleId");
  //         setUser(null);
  //         setRoleId(null);
  //     } finally {
  //         setIsAuthLoading(false);
  //     }
  // };

  // useEffect(() => {
  //     checkAuth(); // Вызываем проверку при старте
  //     fetchPublicData();
  // }, []);

  // useEffect(() => {
  //     if (user) {
  //         fetchMeData();
  //         if (Number(localRole) === 1) {
  //             fetchAdminData();
  //         }
  //     } else {
  //         setMeData({
  //             addresses: [],
  //             events: [],
  //             favorites: [],
  //             cart: { items: [], totalCartPrice: 0 },
  //             orders: [],
  //             customBouquets: [],
  //             tickets: [],
  //         });
  //         setAdminData({
  //             allBouquets: [],
  //             allComponents: [],
  //             allTickets: [],
  //             revenueStats: [],
  //             statusesStats: [],
  //             topBouquets: [],
  //             supportStats: [],
  //         });
  //     }
  // }, [user, roleId]);

  const contextValue = {
    user,
    setUser,
    //     roleId,
    //     setRoleId, // ЭТО НУЖНО ДЛЯ Login.jsx!
    //     publicData,
    //     fetchPublicData,
    //     meData,
    //     fetchMeData,
    //     adminData,
    //     setAdminData,
    //     fetchAdminData,
    //     isAuthLoading,
  };

  // if (isAuthLoading) {
  //     return (
  //         <div
  //             style={{
  //                 display: "flex",
  //                 justifyContent: "center",
  //                 alignItems: "center",
  //                 height: "100vh",
  //                 background: "#1a1a2e",
  //                 color: "#f26076",
  //             }}
  //         >
  //             <h2>Я проверяю твои данные, Лиля. Стой смирно и жди.</h2>
  //         </div>
  //     );
  // }

  return (
    <ContextProvider>
      <AppContext.Provider value={contextValue}>
        <ScrollToTop />
        <Routes>
          <Route
            path="/login"
            element={<Login /> /*: <Navigate to="/profile" />*/}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/profile" />}
          />

          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="customizer" element={<Customizer />} />
            {/*<Route path="cart" element={<Cart />} />*/}
            <Route path="bouquet/:id" element={<BouquetDetails />} />

            <Route
              path="/profile"
              element={<ProfileLayout /> /*  <Navigate to="/login"/> */}
            >
              <Route index element={<PersonalDetails />} />
              {/*<Route path="orders" element={<OrderHistory />} />*/}
              {/*<Route path="tickets" element={<MyTickets />} />*/}
              {/*<Route path="favorites" element={<MyFavorites />} />*/}
              {/*<Route path="events" element={<MyEvents />} />*/}
              {/*<Route
              path="custom-bouquets"
              element={<MyCustomBouquets />}
            />*/}
            </Route>
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            {/*<Route index element={<AdminCharts />} />*/}
            {/*<Route path="bouquets" element={<AdminBouquets />} />*/}
            {/*<Route path="components" element={<AdminComponents />} />*/}
            {/*<Route path="tickets" element={<AdminTickets />} />*/}
            {/*<Route path="orders" element={<AdminOrders />} />*/}
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AppContext.Provider>
    </ContextProvider>
  );
};

export default App;
