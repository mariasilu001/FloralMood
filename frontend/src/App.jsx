import React, { useState, useEffect } from "react";
import { Routes, Route, Router } from "react-router-dom";
import "./index.css";
import { MOCK_IMAGE, initialData } from "./assets/dummyData";

import Register from "./components/pages/Register";
import Login from "./components/pages/Login";
import MainLayout from "./components/layout/MainLayout";
import Home from "./components/pages/Home/Home";
import AdminBouquets from "./components/pages/Admin/AdminBouquets";
import AdminLayout from "./components/layout/AdminLayout";

// Мой жесткий хук. Он подчинит себе твой localStorage.
function useLocalStorageState(key, defaultVal) {
    const [state, setState] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                return JSON.parse(item);
            } else {
                window.localStorage.setItem(key, JSON.stringify(defaultVal));
                return defaultVal;
            }
        } catch (error) {
            console.error(`Ошибка чтения ${key} из localStorage:`, error);
            return defaultVal;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Ошибка записи ${key} в localStorage:`, error);
        }
    }, [key, state]);

    return [state, setState];
}

function App() {
    // Я создал для тебя 27 независимых стейтов. Не вздумай жаловаться, что их много.
    // Ты хотела каждый объект отдельным стейтом — я сделал это.
    const [userRoles, setUserRoles] = useLocalStorageState(
        "user_roles",
        initialData.user_roles,
    );
    const [users, setUsers] = useLocalStorageState("users", initialData.users);
    const [searchHistory, setSearchHistory] = useLocalStorageState(
        "search_history",
        initialData.search_history,
    );
    const [ticketSubjects, setTicketSubjects] = useLocalStorageState(
        "ticket_subjects",
        initialData.ticket_subjects,
    );
    const [tickets, setTickets] = useLocalStorageState(
        "tickets",
        initialData.tickets,
    );
    const [ticketMessages, setTicketMessages] = useLocalStorageState(
        "ticket_messages",
        initialData.ticket_messages,
    );
    const [userDeliveryAddresses, setUserDeliveryAddresses] =
        useLocalStorageState(
            "user_delivery_addresses",
            initialData.user_delivery_addresses,
        );
    const [componentCategories, setComponentCategories] = useLocalStorageState(
        "component_categories",
        initialData.component_categories,
    );
    const [components, setComponents] = useLocalStorageState(
        "components",
        initialData.components,
    );
    const [componentPrices, setComponentPrices] = useLocalStorageState(
        "component_prices",
        initialData.component_prices,
    );
    const [bouquets, setBouquets] = useLocalStorageState(
        "bouquets",
        initialData.bouquets,
    );
    const [bouquetComponents, setBouquetComponents] = useLocalStorageState(
        "bouquet_components",
        initialData.bouquet_components,
    );
    const [tags, setTags] = useLocalStorageState("tags", initialData.tags);
    const [bouquetTags, setBouquetTags] = useLocalStorageState(
        "bouquet_tags",
        initialData.bouquet_tags,
    );
    const [favorites, setFavorites] = useLocalStorageState(
        "favorites",
        initialData.favorites,
    );
    const [cartItems, setCartItems] = useLocalStorageState(
        "cart_items",
        initialData.cart_items,
    );
    const [orderStatuses, setOrderStatuses] = useLocalStorageState(
        "order_statuses",
        initialData.order_statuses,
    );
    const [paymentMethods, setPaymentMethods] = useLocalStorageState(
        "payment_methods",
        initialData.payment_methods,
    );
    const [deliverTimeSlots, setDeliverTimeSlots] = useLocalStorageState(
        "deliver_time_slots",
        initialData.deliver_time_slots,
    );
    const [orders, setOrders] = useLocalStorageState(
        "orders",
        initialData.orders,
    );
    const [orderItems, setOrderItems] = useLocalStorageState(
        "order_items",
        initialData.order_items,
    );
    const [reviews, setReviews] = useLocalStorageState(
        "reviews",
        initialData.reviews,
    );
    const [reviewPhotos, setReviewPhotos] = useLocalStorageState(
        "review_photos",
        initialData.review_photos,
    );
    const [eventTypes, setEventTypes] = useLocalStorageState(
        "event_types",
        initialData.event_types,
    );
    const [eventTypeTags, setEventTypeTags] = useLocalStorageState(
        "event_type_tags",
        initialData.event_type_tags,
    );
    const [events, setEvents] = useLocalStorageState(
        "events",
        initialData.events,
    );
    const [globalEvents, setGlobalEvents] = useLocalStorageState(
        "global_events",
        initialData.global_events,
    );

    return (
        <>
            <Routes>
                <Route
                    path="/auth/register"
                    element={<Register setUsers={setUsers} users={users} />}
                />
                <Route
                    path="/auth/login"
                    element={<Login setUsers={setUsers} users={users} />}
                />

                <Route element={<MainLayout />}>
                    <Route
                        path="/"
                        element={
                            <Home
                                globalEvents={globalEvents}
                                events={events}
                                eventTypes={eventTypes}
                                eventTypeTags={eventTypeTags}
                                bouquets={bouquets}
                                bouquetTags={bouquetTags}
                                bouquetComponents={bouquetComponents}
                                componentPrices={componentPrices}
                                cartItems={cartItems}
                                setCartItems={setCartItems}
                            />
                        }
                    />
                </Route>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route
                        path="bouquets"
                        element={
                            <AdminBouquets
                                bouquets={bouquets}
                                setBouquets={setBouquets}
                                components={components}
                                componentPrices={componentPrices}
                                bouquetComponents={bouquetComponents}
                                setBouquetComponents={setBouquetComponents}
                                tags={tags}
                                bouquetTags={bouquetTags}
                                setBouquetTags={setBouquetTags}
                            />
                        }
                    />
                </Route>
            </Routes>
        </>
    );
}

export default App;
