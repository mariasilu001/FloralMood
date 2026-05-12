const express = require("express");
const models = require("../models");
const router = express.Router();
const { Op } = require("sequelize");
const upload = require("../middleware/multerConfig.js");

const getMe = async (req, res, next) => {
    try {

        return res.json({
            user: {
                userId: req.user.userId,
                username: req.user.username,
                email: req.user.email,
                avatar: req.user.avatar || null,
                roleId: req.user.roleId,
            },
        });
    } catch (error) {
        next(error);
    }
};
router.get("/", getMe);

const updateMe = async (req, res, next) => {
    try {
        const { username, email } = req.body;

        if (username) req.user.username = username;

        if (email && email !== req.user.email) {
            const existingUser = await models.User.findOne({
                where: { email: email },
            });
            if (existingUser) {
                return res.status(409).json({
                    message: "Этот email уже занят.",
                });
            }
            req.user.email = email;
        }

        if (req.file) {
            req.user.avatar = req.file.filename;
        }

        await req.user.save();

        return res.json({
            message: " данные успешно обновились",
            user: {
                userId: req.user.userId,
                username: req.user.username,
                email: req.user.email,
                avatar: req.user.avatar,
                roleId: req.user.roleId, 
            },
        });
    } catch (error) {
        next(error);
    }
};
router.put("/", upload.single("image"), updateMe);

const getAddresses = async (req, res, next) => {
    try {
        const addresses = await models.UserDeliveryAddress.findAll({
            where: {
                userId: req.user.userId,
                deletedAt: null,
            },
        });
        return res.json({ addresses });
    } catch (error) {
        next(error);
    }
};
router.get("/addresses", getAddresses);

const addAddress = async (req, res, next) => {
    try {
        const { city, street, house, apartment } = req.body;

        if (!city || !street || !house) {
            return res.status(400).json({
                message:
                    "Город, улица и дом обязательны",
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

const deleteAddress = async (req, res, next) => {
    try {
        const { id } = req.params;
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
                    "Адрес не найде",
            });
        }

       
        address.deletedAt = new Date();
        await address.save();

        return res.json({ message: "Адрес уничтожен." });
    } catch (error) {
        next(error);
    }
};
router.delete("/addresses/:id", deleteAddress);


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
        const { name, eventDate, eventTypeId } = req.body;
        const newEvent = await models.Event.create({
            userId: req.user.userId,
            name,
            eventDate,
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
                message: "Событие не найдено.",
            });
        return res.json({ message: "Событие." });
    } catch (error) {
        next(error);
    }
};

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
            message: "Букет нкт",
        });
    } catch (error) {
        next(error);
    }
};


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

            bouquetPrice = parseFloat((bouquetPrice * 1.06).toFixed(2));
            const itemTotal = bouquetPrice * item.quantity;
            totalCartPrice += itemTotal;

            return {
                cartItemId: item.cartItemId,
                quantity: item.quantity,
                bouquet: {
                    bouquetId: item.bouquet.bouquetId,
                    name: item.bouquet.name,
                    imageUrl: item.bouquet.imageUrl, 
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
            message: "Выброшено из корзины.",
        });
    } catch (error) {
        next(error);
    }
};


const getOrders = async (req, res, next) => {
    try {
        const orders = await models.Order.findAll({
            where: { userId: req.user.userId },
            include: [
                {
                    model: models.OrderItem,
                    as: "orderItems", 
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
                {
                   
                    model: models.UserDeliveryAddress,
                    as: "address",
                },
            ],
            order: [["createdAt", "DESC"]],
        });


        const formattedOrders = orders.map((o) => {
            const orderJSON = o.toJSON();
            orderJSON.items = orderJSON.orderItems; 
            delete orderJSON.orderItems;
            return orderJSON;
        });

        return res.json({ orders: formattedOrders });
    } catch (error) {
        next(error);
    }
};

const createOrder = async (req, res, next) => {
    const t = await models.sequelize.transaction();
    try {
        const {
            deliveryAddressId,
            deliverTimeSlotId,
            deliveryDate,
            paymentMethodId,
            comment,
        } = req.body;

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
                    "Твоя корзина пуста.",
            });
        }

        let calculatedTotalPrice = 0;
        const processedItems = [];

        for (const item of cartItems) {
            let bouquetPrice = 0;
            item.bouquet.components.forEach((comp) => {
                const price = comp.prices[0]?.price || 0;
                const qty = comp.BouquetComponent.quantity;
                bouquetPrice += parseFloat(price) * parseFloat(qty);
            });

   
            bouquetPrice = parseFloat((bouquetPrice * 1.06).toFixed(2));
            calculatedTotalPrice += bouquetPrice * item.quantity;

            processedItems.push({
                bouquetId: item.bouquet.bouquetId,
                quantity: item.quantity,
                priceSnapshot: bouquetPrice,
            });
        }

   
        const order = await models.Order.create(
            {
                userId: req.user.userId,
                statusId: 1,
                addressId: deliveryAddressId, 
                timeSlotId: deliverTimeSlotId,
                deliveryDate: deliveryDate,
                paymentMethodId: paymentMethodId,
                comment: comment,
                totalPrice: parseFloat(calculatedTotalPrice.toFixed(2)),
            },
            { transaction: t },
        );

        const orderItemsData = processedItems.map((pItem) => ({
            orderId: order.orderId,
            bouquetId: pItem.bouquetId,
            quantity: pItem.quantity,
            priceSnapshot: pItem.priceSnapshot,
        }));

        await models.OrderItem.bulkCreate(orderItemsData, { transaction: t });

        await models.CartItem.destroy({
            where: { userId: req.user.userId },
            transaction: t,
        });

        await t.commit(); 
        return res.status(201).json({
            message: "Заказ оформлен.",
            order,
        });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};


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

        if (!components || components.length === 0) {
            await t.rollback();
            return res.status(400).json({
                message: "Букет не может быть пустым.",
            });
        }

        const bouquet = await models.Bouquet.create(
            {
                name: name || "Мое творение",
                description: description || "Собран",
                isCustom: true,
                userId: req.user.userId,
                imageUrl: "default_custom_bouquet.jpg", 
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
                "Твой кастомный букет сохранен.",
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
                .json({ message: "не найдено." });
        }

        bouquet.deletedAt = new Date();
        await bouquet.save();

        return res.json({
            message: " стерто",
        });
    } catch (error) {
        next(error);
    }
};


const getTickets = async (req, res, next) => {
    try {
        const tickets = await models.Ticket.findAll({
            where: { userId: req.user.userId },
            include: {
                model: models.TicketSubject,
                as: "subject", 
            },
            order: [["createdAt", "DESC"]],
        });
        return res.json({ tickets });
    } catch (error) {
        next(error);
    }
};


const createTicket = async (req, res, next) => {
    try {
        const { subjectId, text } = req.body;

        if (!subjectId || !text) {
            return res.status(400).json({
                message:
                    "Тема и сообщение обязательны.",
            });
        }

        const t = await models.sequelize.transaction();

        try {
            const ticket = await models.Ticket.create(
                {
                    userId: req.user.userId,
                    subjectId: subjectId,
                    status: "Открыт",
                },
                { transaction: t },
            );

            await models.TicketMessage.create(
                {
                    ticketId: ticket.ticketId,
                    userId: req.user.userId, 
                    text: text, 
                },
                { transaction: t },
            );

            await t.commit();
            return res
                .status(201)
                .json({ message: " жалоба зафиксирована.", ticket });
        } catch (err) {
            await t.rollback();
            throw err;
        }
    } catch (error) {
        next(error);
    }
};

const addTicketMessage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { text } = req.body; 

        if (!text)
            return res.status(400).json({
                message: "Нельзя отправить пустоту.",
            });

        const ticket = await models.Ticket.findOne({
            where: { ticketId: id, userId: req.user.userId },
        });

        if (!ticket) {
            return res
                .status(404)
                .json({ message: "Тикет не найден" });
        }

        const newMessage = await models.TicketMessage.create({
            ticketId: ticket.ticketId,
            userId: req.user.userId, 
            text: text, 
        });

        return res.status(201).json({ message: newMessage });
    } catch (error) {
        next(error);
    }
};

const getTicketMessages = async (req, res, next) => {
    try {
        const { id } = req.params;

        
        const ticket = await models.Ticket.findOne({
            where: { ticketId: id, userId: req.user.userId },
        });

        if (!ticket) {
            return res
                .status(404)
                .json({ message: "Это не твой тикет." });
        }

        const messages = await models.TicketMessage.findAll({
            where: { ticketId: id },
            order: [["createdAt", "ASC"]], 
        });

        return res.json({ messages });
    } catch (error) {
        next(error);
    }
};



const getSearchHistory = async (req, res, next) => {
    try {
        const history = await models.SearchHistory.findAll({
            where: { userId: req.user.userId },
            order: [["createdAt", "DESC"]],
            limit: 20, 
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
                .json({ message: "ybxtuj" });
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



const addReview = async (req, res, next) => {
    try {
        const { id } = req.params; 
        const { rating, text } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res
                .status(400)
                .json({
                    message:
                        "Рейтинг должен быть от 1 до 5.",
                });
        }

        
        const orderItem = await models.OrderItem.findOne({
            where: { bouquetId: id },
            include: {
                model: models.Order,
                as: "order",
                where: { userId: req.user.userId },
            },
        });

        if (!orderItem) {
            return res
                .status(403)
                .json({
                    message:
                        "yt ndjq",
                });
        }

        
        const existingReview = await models.Review.findOne({
            where: { userId: req.user.userId, bouquetId: id },
        });

        if (existingReview) {
            return res
                .status(409)
                .json({ message: "уже есть отзыв" });
        }

        const newReview = await models.Review.create({
            userId: req.user.userId,
            bouquetId: id,
            orderId: orderItem.orderId, 
            rating,
            text,
        });

        return res
            .status(201)
            .json({
                message: "сохранеин",
                review: newReview,
            });
    } catch (error) {
        next(error);
    }
};

router.post("/bouquets/:id/reviews", addReview);


router.get("/events", getEvents);
router.post("/events", addEvent);
router.delete("/events/:id", deleteEvent);


router.get("/favorites", getFavorites);
router.post("/favorites", addFavorite);
router.delete("/favorites/:bouquet_id", deleteFavorite);


router.get("/cart", getCart);
router.post("/cart", addToCart);
router.put("/cart/:cart_item_id", updateCartItem);
router.delete("/cart/:cart_item_id", deleteCartItem);


router.get("/orders", getOrders);
router.post("/orders", createOrder);


router.get("/custom-bouquets", getCustomBouquets);
router.post("/custom-bouquets", createCustomBouquet);
router.delete("/custom-bouquets/:id", deleteCustomBouquet);


router.get("/tickets", getTickets);
router.post("/tickets", createTicket);
router.get("/tickets/:id/messages", getTicketMessages);
router.post("/tickets/:id/messages", addTicketMessage);


router.get("/search-history", getSearchHistory);
router.post("/search-history", addSearchHistory);

module.exports = router;
