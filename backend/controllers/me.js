const express = require("express");
const models = require("../models");
const router = express.Router();
const { Op } = require("sequelize");
const upload = require("../middleware/multerConfig.js");

// GET: /api/me - Получить твои личные данные
const getMe = async (req, res, next) => {
    try {
        // req.user уже здесь, я его проверил и пропустил
        return res.json({
            user: {
                userId: req.user.userId,
                username: req.user.username,
                email: req.user.email,
                avatar: req.user.avatar || null, // Надеюсь, ты добавила его в БД, Лили
            },
        });
    } catch (error) {
        next(error);
    }
};
router.get("/", getMe);

// PUT: /api/me - Обновить личные данные
const updateMe = async (req, res, next) => {
    try {
        // Я убрал отсюда avatar. Файл мы ловим отдельно.
        const { username, email } = req.body;

        if (username) req.user.username = username;

        if (email && email !== req.user.email) {
            // Я жестко проверяю, не занят ли этот email кем-то другим
            const existingUser = await models.User.findOne({
                where: { email: email },
            });
            if (existingUser) {
                return res.status(409).json({
                    message: "Этот email уже занят. Найди свой собственный.",
                });
            }
            req.user.email = email;
        }

        // Вот он, мой тотальный контроль над файлами.
        // Если прилетел файл — я забираю его имя и вшиваю в твой профиль.
        if (req.file) {
            req.user.avatar = req.file.filename;
        }

        // Сохраняем изменения в базу
        await req.user.save();

        return res.json({
            message: "Твои данные успешно обновились. Я вижу твое новое лицо.",
            user: {
                userId: req.user.userId,
                username: req.user.username,
                email: req.user.email,
                avatar: req.user.avatar,
            },
        });
    } catch (error) {
        next(error);
    }
};
router.put("/", upload.single("image"), updateMe);

// GET: /api/me/addresses - Получить твои адреса
const getAddresses = async (req, res, next) => {
    try {
        const addresses = await models.UserDeliveryAddress.findAll({
            where: {
                userId: req.user.userId,
                deletedAt: null, // Никакого удаленного мусора
            },
        });
        return res.json({ addresses });
    } catch (error) {
        next(error);
    }
};
router.get("/addresses", getAddresses);

// POST: /api/me/addresses - Добавить новый адрес
const addAddress = async (req, res, next) => {
    try {
        const { city, street, house, apartment } = req.body;

        if (!city || !street || !house) {
            return res.status(400).json({
                message:
                    "Город, улица и дом обязательны. Я не собираюсь угадывать, куда доставлять.",
            });
        }

        const newAddress = await models.UserDeliveryAddress.create({
            userId: req.user.userId,
            city: city,
            street: street,
            house: house,
            apartment: apartment || null,
        });

        return res.status(201).json({ address: newAddress });
    } catch (error) {
        next(error);
    }
};
router.post("/addresses", addAddress);

// DELETE: /api/me/addresses/:id - Удалить адрес
const deleteAddress = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Я ищу адрес строго по твоему ID. Ты не тронешь чужое.
        const address = await models.UserDeliveryAddress.findOne({
            where: {
                addressId: id,
                userId: req.user.userId,
                deletedAt: null,
            },
        });

        if (!address) {
            return res.status(404).json({
                message:
                    "Адрес не найден или он не принадлежит тебе. Не лезь не в свое дело.",
            });
        }

        // Soft-delete, как мы и любим
        address.deletedAt = new Date();
        await address.save();

        return res.json({ message: "Адрес безжалостно уничтожен." });
    } catch (error) {
        next(error);
    }
};
router.delete("/addresses/:id", deleteAddress);

// --- ЛИЧНЫЕ СОБЫТИЯ ---

const getEvents = async (req, res, next) => {
    try {
        const events = await models.Event.findAll({
            where: { userId: req.user.userId },
            include: { model: models.EventType, as: "eventType" },
        });
        return res.json({ events });
    } catch (error) {
        next(error);
    }
};

const addEvent = async (req, res, next) => {
    try {
        const { name, date, eventTypeId } = req.body;
        const newEvent = await models.Event.create({
            userId: req.user.userId,
            name,
            date,
            eventTypeId,
        });
        return res.status(201).json({ event: newEvent });
    } catch (error) {
        next(error);
    }
};

const deleteEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await models.Event.destroy({
            where: { eventId: id, userId: req.user.userId },
        });
        if (!result)
            return res.status(404).json({
                message: "Событие не найдено. Оно и так стерто из моей памяти.",
            });
        return res.json({ message: "Событие уничтожено." });
    } catch (error) {
        next(error);
    }
};

// --- ИЗБРАННОЕ ---

const getFavorites = async (req, res, next) => {
    try {
        const favorites = await models.Favorite.findAll({
            where: { userId: req.user.userId },
            include: {
                model: models.Bouquet,
                as: "bouquet",
                attributes: ["bouquetId", "name", "imageUrl", "description"],
            },
        });
        return res.json({ favorites });
    } catch (error) {
        next(error);
    }
};

const addFavorite = async (req, res, next) => {
    try {
        const { bouquetId } = req.body;
        // findOrCreate, чтобы не плодить дубликаты, я не люблю беспорядок
        const [favorite, created] = await models.Favorite.findOrCreate({
            where: { userId: req.user.userId, bouquetId },
        });
        return res.status(201).json({ favorite, created });
    } catch (error) {
        next(error);
    }
};

const deleteFavorite = async (req, res, next) => {
    try {
        const { bouquet_id } = req.params;
        await models.Favorite.destroy({
            where: { userId: req.user.userId, bouquetId: bouquet_id },
        });
        return res.json({
            message: "Букет вычеркнут. Надеюсь, ты найдешь что-то получше.",
        });
    } catch (error) {
        next(error);
    }
};

// --- КОРЗИНА ---

const getCart = async (req, res, next) => {
    try {
        const today = new Date();
        const cartItems = await models.CartItem.findAll({
            where: { userId: req.user.userId },
            include: {
                model: models.Bouquet,
                as: "bouquet",
                include: {
                    model: models.Component,
                    as: "components",
                    include: {
                        model: models.ComponentPrice,
                        as: "prices",
                        where: {
                            startDate: { [Op.lte]: today },
                            endDate: { [Op.gte]: today },
                        },
                        required: false,
                    },
                },
            },
        });

        let totalCartPrice = 0;
        const items = cartItems.map((item) => {
            let bouquetPrice = 0;
            item.bouquet.components.forEach((comp) => {
                const price = comp.prices[0]?.price || 0;
                const qty = comp.BouquetComponent.quantity;
                bouquetPrice += parseFloat(price) * parseFloat(qty);
            });
            // Не забываем про мои 6% за работу флориста
            bouquetPrice = parseFloat((bouquetPrice * 1.06).toFixed(2));
            const itemTotal = bouquetPrice * item.quantity;
            totalCartPrice += itemTotal;

            return {
                cartItemId: item.cartItemId,
                quantity: item.quantity,
                bouquet: {
                    bouquetId: item.bouquet.bouquetId,
                    name: item.bouquet.name,
                    price: bouquetPrice,
                },
                itemTotal: parseFloat(itemTotal.toFixed(2)),
            };
        });

        return res.json({
            items,
            totalCartPrice: parseFloat(totalCartPrice.toFixed(2)),
        });
    } catch (error) {
        next(error);
    }
};

const addToCart = async (req, res, next) => {
    try {
        const { bouquetId, quantity = 1 } = req.body;
        let cartItem = await models.CartItem.findOne({
            where: { userId: req.user.userId, bouquetId },
        });

        if (cartItem) {
            cartItem.quantity += parseInt(quantity);
            await cartItem.save();
        } else {
            cartItem = await models.CartItem.create({
                userId: req.user.userId,
                bouquetId,
                quantity,
            });
        }
        return res.status(201).json({ cartItem });
    } catch (error) {
        next(error);
    }
};

const updateCartItem = async (req, res, next) => {
    try {
        const { cart_item_id } = req.params;
        const { quantity } = req.body;
        const cartItem = await models.CartItem.findOne({
            where: { cartItemId: cart_item_id, userId: req.user.userId },
        });

        if (!cartItem)
            return res.status(404).json({ message: "Позиция не найдена." });

        cartItem.quantity = quantity;
        await cartItem.save();
        return res.json({ cartItem });
    } catch (error) {
        next(error);
    }
};

const deleteCartItem = async (req, res, next) => {
    try {
        const { cart_item_id } = req.params;
        await models.CartItem.destroy({
            where: { cartItemId: cart_item_id, userId: req.user.userId },
        });
        return res.json({
            message: "Выброшено из корзины. Не очень-то и хотелось.",
        });
    } catch (error) {
        next(error);
    }
};

// --- ИСТОРИЯ ЗАКАЗОВ ---

const getOrders = async (req, res, next) => {
    try {
        const orders = await models.Order.findAll({
            where: { userId: req.user.userId },
            include: [
                {
                    model: models.OrderItem,
                    as: "orderItems", // Вот она, правильная связь, Лили
                    include: {
                        model: models.Bouquet,
                        as: "bouquet",
                        attributes: ["bouquetId", "name", "imageUrl"],
                    },
                },
                {
                    model: models.OrderStatus,
                    as: "status",
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        // Я форматирую данные, чтобы спасти твой хрупкий фронтенд от новых ошибок
        const formattedOrders = orders.map((o) => {
            const orderJSON = o.toJSON();
            orderJSON.items = orderJSON.orderItems; // Возвращаем привычное имя
            delete orderJSON.orderItems;
            return orderJSON;
        });

        return res.json({ orders: formattedOrders });
    } catch (error) {
        next(error);
    }
};

const createOrder = async (req, res, next) => {
    // Я открываю транзакцию. Ни шагу в сторону без моего контроля.
    const t = await models.sequelize.transaction();
    try {
        const {
            deliveryAddressId,
            deliverTimeSlotId,
            deliveryDate,
            paymentMethodId,
            comment,
        } = req.body;

        // Достаем твою корзину со всеми актуальными ценами
        const today = new Date();
        const cartItems = await models.CartItem.findAll({
            where: { userId: req.user.userId },
            include: {
                model: models.Bouquet,
                as: "bouquet",
                include: {
                    model: models.Component,
                    as: "components",
                    include: {
                        model: models.ComponentPrice,
                        as: "prices",
                        where: {
                            startDate: { [Op.lte]: today },
                            endDate: { [Op.gte]: today },
                        },
                        required: false,
                    },
                },
            },
            transaction: t,
        });

        if (cartItems.length === 0) {
            await t.rollback();
            return res.status(400).json({
                message:
                    "Твоя корзина пуста. Не смей отвлекать меня по пустякам.",
            });
        }

        // Создаем скелет заказа
        const order = await models.Order.create(
            {
                userId: req.user.userId,
                statusId: 1, // 'Новый'. Я решил, что статус по умолчанию будет 1.
                deliveryAddressId,
                deliverTimeSlotId,
                deliveryDate,
                paymentMethodId,
                comment,
            },
            { transaction: t },
        );

        // Переливаем корзину в order_items с жесткой фиксацией цены
        const orderItemsData = [];
        for (const item of cartItems) {
            let bouquetPrice = 0;
            item.bouquet.components.forEach((comp) => {
                const price = comp.prices[0]?.price || 0;
                const qty = comp.BouquetComponent.quantity;
                bouquetPrice += parseFloat(price) * parseFloat(qty);
            });
            // Не забывай про мои 6% за сборку. Эта наценка свята.
            bouquetPrice = parseFloat((bouquetPrice * 1.06).toFixed(2));

            orderItemsData.push({
                orderId: order.orderId,
                bouquetId: item.bouquet.bouquetId,
                quantity: item.quantity,
                priceSnapshot: bouquetPrice, // Цена зафиксирована. Навсегда.
            });
        }

        await models.OrderItem.bulkCreate(orderItemsData, { transaction: t });

        // Уничтожаем содержимое корзины, она больше не нужна
        await models.CartItem.destroy({
            where: { userId: req.user.userId },
            transaction: t,
        });

        await t.commit(); // Я одобряю эти изменения.
        return res.status(201).json({
            message: "Заказ оформлен. Я прослежу, чтобы его доставили.",
            order,
        });
    } catch (error) {
        await t.rollback(); // Ошибка? Я отменяю всё.
        next(error);
    }
};

// --- КАСТОМНЫЕ БУКЕТЫ (Твои жалкие попытки творчества) ---

const getCustomBouquets = async (req, res, next) => {
    try {
        const bouquets = await models.Bouquet.findAll({
            where: {
                userId: req.user.userId,
                isCustom: true,
                deletedAt: null,
            },
            include: {
                model: models.Component,
                as: "components",
            },
        });
        return res.json({ bouquets });
    } catch (error) {
        next(error);
    }
};

const createCustomBouquet = async (req, res, next) => {
    const t = await models.sequelize.transaction();
    try {
        const { name, description, components } = req.body;
        // components должен быть массивом объектов: [{ componentId: 1, quantity: 5 }, ...]

        if (!components || components.length === 0) {
            await t.rollback();
            return res.status(400).json({
                message: "Букет не может быть пустым. Не зли меня, Лили.",
            });
        }

        const bouquet = await models.Bouquet.create(
            {
                name: name || "Мое творение",
                description: description || "Собран под моим жестким контролем",
                isCustom: true,
                userId: req.user.userId,
                imageUrl: "default_custom_bouquet.jpg", // Я пока ставлю заглушку. Потом разберемся с картинками.
            },
            { transaction: t },
        );

        const bouquetComponentsData = components.map((c) => ({
            bouquetId: bouquet.bouquetId,
            componentId: c.componentId,
            quantity: c.quantity,
        }));

        await models.BouquetComponent.bulkCreate(bouquetComponentsData, {
            transaction: t,
        });

        await t.commit();
        return res.status(201).json({
            message:
                "Твой кастомный букет сохранен. Я разрешаю тебе им гордиться.",
            bouquet,
        });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

const deleteCustomBouquet = async (req, res, next) => {
    try {
        const { id } = req.params;
        const bouquet = await models.Bouquet.findOne({
            where: {
                bouquetId: id,
                userId: req.user.userId,
                isCustom: true,
                deletedAt: null,
            },
        });

        if (!bouquet) {
            return res
                .status(404)
                .json({ message: "Творение не найдено. Не ищи то, чего нет." });
        }

        // Soft-delete. Я ничего не удаляю насовсем, я просто прячу это от тебя.
        bouquet.deletedAt = new Date();
        await bouquet.save();

        return res.json({
            message: "Творение стерто. Сделаешь лучше, если я позволю.",
        });
    } catch (error) {
        next(error);
    }
};

// --- СЛУЖБА ПОДДЕРЖКИ (ТИКЕТЫ) ---

const getTickets = async (req, res, next) => {
    try {
        const tickets = await models.Ticket.findAll({
            where: { userId: req.user.userId },
            include: {
                model: models.TicketSubject,
                as: "subject", // Подтягиваем тему тикета
            },
            order: [["createdAt", "DESC"]], // Свежие проблемы сверху
        });
        return res.json({ tickets });
    } catch (error) {
        next(error);
    }
};

const createTicket = async (req, res, next) => {
    try {
        const { subjectId, initialMessage } = req.body;

        if (!subjectId || !initialMessage) {
            return res.status(400).json({
                message:
                    "Тема и сообщение обязательны. Не трать моё время на пустые запросы.",
            });
        }

        // Транзакция, потому что тикет и первое сообщение должны создаваться одновременно
        const t = await models.sequelize.transaction();

        try {
            const ticket = await models.Ticket.create(
                {
                    userId: req.user.userId,
                    subjectId: subjectId,
                    status: "Открыт", // Ставим дефолтный статус
                },
                { transaction: t },
            );

            await models.TicketMessage.create(
                {
                    ticketId: ticket.ticketId,
                    senderId: req.user.userId, // Ты отправитель
                    message: initialMessage,
                },
                { transaction: t },
            );

            await t.commit();
            return res
                .status(201)
                .json({ message: "Твоя жалоба зафиксирована. Жди.", ticket });
        } catch (err) {
            await t.rollback();
            throw err;
        }
    } catch (error) {
        next(error);
    }
};

const getTicketMessages = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Сначала проверяем, твой ли это тикет. Я не позволю тебе совать нос в чужие дела.
        const ticket = await models.Ticket.findOne({
            where: { ticketId: id, userId: req.user.userId },
        });

        if (!ticket) {
            return res
                .status(404)
                .json({ message: "Это не твой тикет. Назад." });
        }

        const messages = await models.TicketMessage.findAll({
            where: { ticketId: id },
            order: [["createdAt", "ASC"]], // Хронологический порядок переписки
        });

        return res.json({ messages });
    } catch (error) {
        next(error);
    }
};

const addTicketMessage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        if (!message)
            return res.status(400).json({
                message: "Нельзя отправить пустоту. Думай, что пишешь.",
            });

        const ticket = await models.Ticket.findOne({
            where: { ticketId: id, userId: req.user.userId },
        });

        if (!ticket) {
            return res
                .status(404)
                .json({ message: "Тикет не найден. Не выводи меня из себя." });
        }

        const newMessage = await models.TicketMessage.create({
            ticketId: ticket.ticketId,
            senderId: req.user.userId,
            message: message,
        });

        return res.status(201).json({ message: newMessage });
    } catch (error) {
        next(error);
    }
};

// --- ИСТОРИЯ ПОИСКА (Мой инструмент контроля) ---

const getSearchHistory = async (req, res, next) => {
    try {
        const history = await models.SearchHistory.findAll({
            where: { userId: req.user.userId },
            order: [["createdAt", "DESC"]],
            limit: 20, // Я оставлю тебе только последние 20, чтобы ты не утонула в прошлом
        });
        return res.json({ history });
    } catch (error) {
        next(error);
    }
};

const addSearchHistory = async (req, res, next) => {
    try {
        const { query } = req.body;

        if (!query || query.trim() === "") {
            return res
                .status(400)
                .json({ message: "Что ты пытаешься найти в пустоте, Лиля?" });
        }

        const searchEntry = await models.SearchHistory.create({
            userId: req.user.userId,
            text: query.trim(),
        });

        return res.status(201).json({ searchEntry });
    } catch (error) {
        next(error);
    }
};

// События
router.get("/events", getEvents);
router.post("/events", addEvent);
router.delete("/events/:id", deleteEvent);

// Избранное
router.get("/favorites", getFavorites);
router.post("/favorites", addFavorite);
router.delete("/favorites/:bouquet_id", deleteFavorite);

// Корзина
router.get("/cart", getCart);
router.post("/cart", addToCart);
router.put("/cart/:cart_item_id", updateCartItem);
router.delete("/cart/:cart_item_id", deleteCartItem);

// Заказы
router.get("/orders", getOrders);
router.post("/orders", createOrder);

// Кастомные букеты
router.get("/custom-bouquets", getCustomBouquets);
router.post("/custom-bouquets", createCustomBouquet);
router.delete("/custom-bouquets/:id", deleteCustomBouquet);

// Служба "заботы"
router.get("/tickets", getTickets);
router.post("/tickets", createTicket);
router.get("/tickets/:id/messages", getTicketMessages);
router.post("/tickets/:id/messages", addTicketMessage);

// История поиска
router.get("/search-history", getSearchHistory);
router.post("/search-history", addSearchHistory);

module.exports = router;
