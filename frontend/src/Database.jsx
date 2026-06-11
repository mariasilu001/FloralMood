import React, { createContext, useState, useEffect } from "react";
import localforage from "localforage";

import mockBouquets from "./mock/bouquets.js";
import mockBouquetComponents from "./mock/bouquet_components.js";
import mockBouquetTags from "./mock/bouquet_tags.js";
import mockCartItems from "./mock/cartItems.js";
import mockCategories from "./mock/categories.js";
import mockComponents from "./mock/components.js";
import mockComponentPrices from "./mock/components_prices.js";
import mockDeliverTimeSlots from "./mock/delivery_time_slots.js";
import mockEvents from "./mock/events.js";
import mockEventTypes from "./mock/event_types.js";
import mockEventTypeTags from "./mock/event_type_tags.js";
import mockFavorites from "./mock/favorites.js";
import mockGlobalEvents from "./mock/global_events.js";
import mockOrders from "./mock/orders.js";
import mockOrderItems from "./mock/order_items.js";
import mockOrderStatuses from "./mock/order_statuses.js";
import mockPaymentMethods from "./mock/payment_methods.js";
import mockReviews from "./mock/reviews.js";
import mockSearchHistory from "./mock/search_history.js";
import mockTags from "./mock/tags.js";
import mockTickets from "./mock/tickets.js";
import mockTicketMessages from "./mock/ticket_messages.js";
import mockTicketSubjects from "./mock/ticket_subjects.js";
import mockUsers from "./mock/users.js";
import mockUserDeliveryAddresses from "./mock/user_delivery_addresses.js";
import mockUserRoles from "./mock/user_roles.js";
import mockReviewPhotos from "./mock/review_photos.js";

export const DBcontext = createContext();

const base64ToBlob = (base64String) => {
  const parts = base64String.split(",");
  if (parts.length !== 2) return null;

  const mime = parts[0].match(/:(.*?);/)[1];

  const byteString = atob(parts[1]);

  let n = byteString.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = byteString.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
};

async function fetchImageToBlob(imageUrl) {
  const response = await fetch(imageUrl);
  const blobData = await response.blob();
  return blobData;
}

export const ContextProvider = ({ children }) => {
  const [users, setUsers] = useState(null);
  const [roles, setRoles] = useState(null);
  const [searchHistory, setSearchHistory] = useState(null);
  const [ticketSubjects, setTicketSubjects] = useState(null);
  const [tickets, setTickets] = useState(null);
  const [ticketMessages, setTicketMessages] = useState(null);
  const [deliveryAddresses, setDeliveryAddresses] = useState(null);
  const [componentCategories, setComponentCategories] = useState(null);
  const [components, setComponents] = useState(null);
  const [componentPrices, setComponentPrices] = useState(null);
  const [bouquets, setBouquets] = useState(null);
  const [bouquetComponents, setBouquetComponents] = useState(null);
  const [tags, setTags] = useState(null);
  const [bouquetTags, setBouquetTags] = useState(null);
  const [favorites, setFavorites] = useState(null);
  const [cartItems, setCartItems] = useState(null);
  const [orderStatuses, setOrderStatuses] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState(null);
  const [deliverTimeSlots, setDeliverTimeSlots] = useState(null);
  const [orders, setOrders] = useState(null);
  const [orderItems, setOrderItems] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [reviewPhotos, setReviewPhotos] = useState(null);
  const [eventTypes, setEventTypes] = useState(null);
  const [eventTypeTags, setEventTypeTags] = useState(null);
  const [events, setEvents] = useState(null);
  const [globalEvents, setGlobalEvents] = useState(null);

  useEffect(() => {
    const initializeData = async () => {
      const storedUsers = await localforage.getItem("users");
      const storedRoles = await localforage.getItem("roles");
      const storedSearchHistory = await localforage.getItem("searchHistory");
      const storedTicketSubjects = await localforage.getItem("ticketSubjects");
      const storedTickets = await localforage.getItem("tickets");
      const storedTicketMessages = await localforage.getItem("ticketMessages");
      const storedDeliveryAddresses =
        await localforage.getItem("deliveryAddresses");
      const storedComponentCategories = await localforage.getItem(
        "componentCategories",
      );
      const storedComponents = await localforage.getItem("components");
      const storedComponentPrices =
        await localforage.getItem("componentPrices");
      const storedBouquets = await localforage.getItem("bouquets");
      const storedBouquetComponents =
        await localforage.getItem("bouquetComponents");
      const storedTags = await localforage.getItem("tags");
      const storedBouquetTags = await localforage.getItem("bouquetTags");
      const storedFavorites = await localforage.getItem("favorites");
      const storedCartItems = await localforage.getItem("cartItems");
      const storedOrderStatuses = await localforage.getItem("orderStatuses");
      const storedPaymentMethods = await localforage.getItem("paymentMethods");
      const storedDeliverTimeSlots =
        await localforage.getItem("deliverTimeSlots");
      const storedOrders = await localforage.getItem("orders");
      const storedOrderItems = await localforage.getItem("orderItems");
      const storedReviews = await localforage.getItem("reviews");
      const storedReviewPhotos = await localforage.getItem("reviewPhotos");
      const storedEventTypes = await localforage.getItem("eventTypes");
      const storedEventTypeTags = await localforage.getItem("eventTypeTags");
      const storedEvents = await localforage.getItem("events");
      const storedGlobalEvents = await localforage.getItem("globalEvents");

      if (
        !storedUsers ||
        !storedRoles ||
        !storedSearchHistory ||
        !storedTicketSubjects ||
        !storedTickets ||
        !storedTicketMessages ||
        !storedDeliveryAddresses ||
        !storedComponentCategories ||
        !storedComponents ||
        !storedComponentPrices ||
        !storedBouquets ||
        !storedBouquetComponents ||
        !storedTags ||
        !storedBouquetTags ||
        !storedFavorites ||
        !storedCartItems ||
        !storedOrderStatuses ||
        !storedPaymentMethods ||
        !storedDeliverTimeSlots ||
        !storedOrders ||
        !storedOrderItems ||
        !storedReviews ||
        !storedReviewPhotos ||
        !storedEventTypes ||
        !storedEventTypeTags ||
        !storedEvents ||
        !storedGlobalEvents
      ) {
        await localforage.setItem("users", mockUsers);
        await localforage.setItem("roles", mockUserRoles);
        await localforage.setItem("searchHistory", mockSearchHistory);
        await localforage.setItem("ticketSubjects", mockTicketSubjects);
        await localforage.setItem("tickets", mockTickets);
        await localforage.setItem("ticketMessages", mockTicketMessages);
        await localforage.setItem(
          "deliveryAddresses",
          mockUserDeliveryAddresses,
        );
        await localforage.setItem("componentCategories", mockCategories);
        //============== КОМПОНЕНТЫ И ИХ ФОТКИ ========================
        const processedComponents = await Promise.all(
          mockComponents.map(async (component) => {
            const updatedComponent = { ...component };

            if (updatedComponent.image_url) {
              const imageBlob = await fetchImageToBlob(
                updatedComponent.image_url,
              );
              updatedComponent.image_url = imageBlob;
            }
            return updatedComponent;
          }),
        );
        await localforage.setItem("components", processedComponents);
        // ============================================================

        await localforage.setItem("componentPrices", mockComponentPrices);

        //=============== БУКЕТЫ И ИХ ФОТКИ ============================
        const processedBouquets = await Promise.all(
          mockBouquets.map(async (bouquet) => {
            const updatedBouquet = { ...bouquet };

            if (updatedBouquet.image_url) {
              const imageBlob = await fetchImageToBlob(
                updatedBouquet.image_url,
              );
              updatedBouquet.image_url = imageBlob;
            }
            return updatedBouquet;
          }),
        );

        await localforage.setItem("bouquets", processedBouquets);

        // =============================================

        await localforage.setItem("bouquetComponents", mockBouquetComponents);
        await localforage.setItem("tags", mockTags);
        await localforage.setItem("bouquetTags", mockBouquetTags);
        await localforage.setItem("favorites", mockFavorites);
        await localforage.setItem("cartItems", mockCartItems);
        await localforage.setItem("orderStatuses", mockOrderStatuses);
        await localforage.setItem("paymentMethods", mockPaymentMethods);
        await localforage.setItem("deliverTimeSlots", mockDeliverTimeSlots);
        await localforage.setItem("orders", mockOrders);
        await localforage.setItem("orderItems", mockOrderItems);
        await localforage.setItem("reviews", mockReviews);
        //=================== ФОТКИ В ОТЗЫВАХ ==================
        const processedReviewPhotos = await Promise.all(
          mockReviewPhotos.map(async (photo) => {
            const updatedPhoto = { ...photo };

            if (updatedPhoto.photo_url) {
              const imageBlob = await fetchImageToBlob(updatedPhoto.photo_url);
              updatedPhoto.photo_url = imageBlob;
            }
            return updatedPhoto;
          }),
        );

        await localforage.setItem("reviewPhotos", processedReviewPhotos);
        // =====================================================
        await localforage.setItem("eventTypes", mockEventTypes);
        await localforage.setItem("eventTypeTags", mockEventTypeTags);
        await localforage.setItem("events", mockEvents);
        await localforage.setItem("globalEvents", mockGlobalEvents);

        setUsers(mockUsers);
        setRoles(mockUserRoles);
        setSearchHistory(mockSearchHistory);
        setTicketSubjects(mockTicketSubjects);
        setTickets(mockTickets);
        setTicketMessages(mockTicketMessages);
        setDeliveryAddresses(mockUserDeliveryAddresses);
        setComponentCategories(mockCategories);
        setComponents(processedComponents);
        setComponentPrices(mockComponentPrices);
        setBouquets(processedBouquets);
        setBouquetComponents(mockBouquetComponents);
        setTags(mockTags);
        setBouquetTags(mockBouquetTags);
        setFavorites(mockFavorites);
        setCartItems(mockCartItems);
        setOrderStatuses(mockOrderStatuses);
        setPaymentMethods(mockPaymentMethods);
        setDeliverTimeSlots(mockDeliverTimeSlots);
        setOrders(mockOrders);
        setOrderItems(mockOrderItems);
        setReviews(mockReviews);
        setReviewPhotos(processedReviewPhotos);
        setEventTypes(mockEventTypes);
        setEventTypeTags(mockEventTypeTags);
        setEvents(mockEvents);
        setGlobalEvents(mockGlobalEvents);
      } else {
        setUsers(storedUsers);
        setRoles(storedRoles);
        setSearchHistory(storedSearchHistory);
        setTicketSubjects(storedTicketSubjects);
        setTickets(storedTickets);
        setTicketMessages(storedTicketMessages);
        setDeliveryAddresses(storedDeliveryAddresses);
        setComponentCategories(storedComponentCategories);
        setComponents(storedComponents);
        setComponentPrices(storedComponentPrices);
        setBouquets(storedBouquets);
        setBouquetComponents(storedBouquetComponents);
        setTags(storedTags);
        setBouquetTags(storedBouquetTags);
        setFavorites(storedFavorites);
        setCartItems(storedCartItems);
        setOrderStatuses(storedOrderStatuses);
        setPaymentMethods(storedPaymentMethods);
        setDeliverTimeSlots(storedDeliverTimeSlots);
        setOrders(storedOrders);
        setOrderItems(storedOrderItems);
        setReviews(storedReviews);
        setReviewPhotos(storedReviewPhotos);
        setEventTypes(storedEventTypes);
        setEventTypeTags(storedEventTypeTags);
        setEvents(storedEvents);
        setGlobalEvents(storedGlobalEvents);
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (users !== null) {
      localforage.setItem("users", users);
    }
  }, [users]);

  useEffect(() => {
    if (roles !== null) {
      localforage.setItem("roles", roles);
    }
  }, [roles]);

  useEffect(() => {
    if (searchHistory !== null) {
      localforage.setItem("searchHistory", searchHistory);
    }
  }, [searchHistory]);

  useEffect(() => {
    if (ticketSubjects !== null) {
      localforage.setItem("ticketSubjects", ticketSubjects);
    }
  }, [ticketSubjects]);

  useEffect(() => {
    if (tickets !== null) {
      localforage.setItem("tickets", tickets);
    }
  }, [tickets]);

  useEffect(() => {
    if (ticketMessages !== null) {
      localforage.setItem("ticketMessages", ticketMessages);
    }
  }, [ticketMessages]);

  useEffect(() => {
    if (deliveryAddresses !== null) {
      localforage.setItem("deliveryAddresses", deliveryAddresses);
    }
  }, [deliveryAddresses]);

  useEffect(() => {
    if (componentCategories !== null) {
      localforage.setItem("componentCategories", componentCategories);
    }
  }, [componentCategories]);

  useEffect(() => {
    if (components !== null) {
      localforage.setItem("components", components);
    }
  }, [components]);

  useEffect(() => {
    if (componentPrices !== null) {
      localforage.setItem("componentPrices", componentPrices);
    }
  }, [componentPrices]);

  useEffect(() => {
    if (bouquets !== null) {
      localforage.setItem("bouquets", bouquets);
    }
  }, [bouquets]);

  useEffect(() => {
    if (bouquetComponents !== null) {
      localforage.setItem("bouquetComponents", bouquetComponents);
    }
  }, [bouquetComponents]);

  useEffect(() => {
    if (tags !== null) {
      localforage.setItem("tags", tags);
    }
  }, [tags]);

  useEffect(() => {
    if (bouquetTags !== null) {
      localforage.setItem("bouquetTags", bouquetTags);
    }
  }, [bouquetTags]);

  useEffect(() => {
    if (favorites !== null) {
      localforage.setItem("favorites", favorites);
    }
  }, [favorites]);

  useEffect(() => {
    if (cartItems !== null) {
      localforage.setItem("cartItems", cartItems);
    }
  }, [cartItems]);

  useEffect(() => {
    if (orderStatuses !== null) {
      localforage.setItem("orderStatuses", orderStatuses);
    }
  }, [orderStatuses]);

  useEffect(() => {
    if (paymentMethods !== null) {
      localforage.setItem("paymentMethods", paymentMethods);
    }
  }, [paymentMethods]);

  useEffect(() => {
    if (deliverTimeSlots !== null) {
      localforage.setItem("deliverTimeSlots", deliverTimeSlots);
    }
  }, [deliverTimeSlots]);

  useEffect(() => {
    if (orders !== null) {
      localforage.setItem("orders", orders);
    }
  }, [orders]);

  useEffect(() => {
    if (orderItems !== null) {
      localforage.setItem("orderItems", orderItems);
    }
  }, [orderItems]);

  useEffect(() => {
    if (reviews !== null) {
      localforage.setItem("reviews", reviews);
    }
  }, [reviews]);

  useEffect(() => {
    if (reviewPhotos !== null) {
      localforage.setItem("reviewPhotos", reviewPhotos);
    }
  }, [reviewPhotos]);

  useEffect(() => {
    if (eventTypes !== null) {
      localforage.setItem("eventTypes", eventTypes);
    }
  }, [eventTypes]);

  useEffect(() => {
    if (eventTypeTags !== null) {
      localforage.setItem("eventTypeTags", eventTypeTags);
    }
  }, [eventTypeTags]);

  useEffect(() => {
    if (events !== null) {
      localforage.setItem("events", events);
    }
  }, [events]);

  useEffect(() => {
    if (globalEvents !== null) {
      localforage.setItem("globalEvents", globalEvents);
    }
  }, [globalEvents]);

  return (
    <DBcontext.Provider
      value={{
        users,
        setUsers,
        roles,
        setRoles,
        searchHistory,
        setSearchHistory,
        ticketSubjects,
        setTicketSubjects,
        tickets,
        setTickets,
        ticketMessages,
        setTicketMessages,
        deliveryAddresses,
        setDeliveryAddresses,
        componentCategories,
        setComponentCategories,
        components,
        setComponents,
        componentPrices,
        setComponentPrices,
        bouquets,
        setBouquets,
        bouquetComponents,
        setBouquetComponents,
        tags,
        setTags,
        bouquetTags,
        setBouquetTags,
        favorites,
        setFavorites,
        cartItems,
        setCartItems,
        orderStatuses,
        setOrderStatuses,
        paymentMethods,
        setPaymentMethods,
        deliverTimeSlots,
        setDeliverTimeSlots,
        orders,
        setOrders,
        orderItems,
        setOrderItems,
        reviews,
        setReviews,
        reviewPhotos,
        setReviewPhotos,
        eventTypes,
        setEventTypes,
        eventTypeTags,
        setEventTypeTags,
        events,
        setEvents,
        globalEvents,
        setGlobalEvents,
      }}
    >
      {children}
    </DBcontext.Provider>
  );
};
