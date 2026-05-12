const express = require("express");
const models = require("../models");
const { Op } = require("sequelize");
const upload = require("../middleware/multerConfig.js");

const router = express.Router();

const getRevenueStats = async (req, res, next) => {
    try {
        const { period = "day" } = req.query; 

        const orders = await models.Order.findAll({
            where: { statusId: { [Op.ne]: 5 } }, 
            attributes: ["createdAt", "totalPrice"],
        });

        const grouped = {};
        orders.forEach((order) => {
          
            const dateStr =
                period === "month"
                    ? order.createdAt.toISOString().substring(0, 7) // YYYY-MM
                    : order.createdAt.toISOString().substring(0, 10); // YYYY-MM-DD

            if (!grouped[dateStr]) grouped[dateStr] = 0;
      
            grouped[dateStr] += parseFloat(order.totalPrice || 0);
        });

        const data = Object.keys(grouped)
            .sort()
            .map((date) => ({
                date,
                Выручка: parseFloat(grouped[date].toFixed(2)), 
            }));

        return res.json({ data });
    } catch (error) {
        next(error);
    }
};
router.get("/stats/revenue", getRevenueStats);

// GET: /api/admin/stats/statuses - Воронка статусов
const getStatusesStats = async (req, res, next) => {
    try {
        const orders = await models.Order.findAll({
            include: [{ model: models.OrderStatus, as: "status" }],
        });

        const grouped = {};
        orders.forEach((order) => {
            const statusName = order.status ? order.status.name : "Неизвестно";
            if (!grouped[statusName]) grouped[statusName] = 0;
            grouped[statusName] += 1;
        });

        const data = Object.keys(grouped).map((name) => ({
            name,
            value: grouped[name], 
        }));

        return res.json({ data });
    } catch (error) {
        next(error);
    }
};
router.get("/stats/statuses", getStatusesStats);

// GET: /api/admin/stats/top-bouquets - Топ продаваемых букетов
const getTopBouquetsStats = async (req, res, next) => {
    try {
        const items = await models.OrderItem.findAll({
            include: [{ model: models.Bouquet, as: "bouquet" }],
        });

        const grouped = {};
        items.forEach((item) => {
            if (!item.bouquet) return;
            const name = item.bouquet.name;
            if (!grouped[name]) grouped[name] = 0;
            grouped[name] += item.quantity;
        });

        const data = Object.keys(grouped)
            .map((name) => ({
                name,
                Количество: grouped[name], 
            }))
            .sort((a, b) => b.Количество - a.Количество)
            .slice(0, 5); 

        return res.json({ data });
    } catch (error) {
        next(error);
    }
};
router.get("/stats/top-bouquets", getTopBouquetsStats);

// GET: /api/admin/stats/support - Нагрузка на поддержку
const getSupportStats = async (req, res, next) => {
    try {
        const tickets = await models.Ticket.findAll();

        const grouped = {};
        tickets.forEach((t) => {
            const dateStr = t.createdAt.toISOString().substring(0, 10);
            if (!grouped[dateStr]) {
                grouped[dateStr] = { date: dateStr, Открытые: 0, Закрытые: 0 };
            }

            if (t.status === "Открыт") {
                grouped[dateStr].Открытые += 1;
            } else {
                grouped[dateStr].Закрытые += 1;
            }
        });

        const data = Object.values(grouped).sort((a, b) =>
            a.date.localeCompare(b.date),
        );

        return res.json({ data });
    } catch (error) {
        next(error);
    }
};
router.get("/stats/support", getSupportStats);


// GET: Выгрузить ВСЕ букеты
const getAllAdminBouquets = async (req, res, next) => {
    try {
        const bouquets = await models.Bouquet.findAll({
            include: [
                {
                    model: models.Component,
                    as: "components",
                },
                {
                    model: models.Tag,
                    as: "tags", 
                },
            ],
            order: [["createdAt", "DESC"]],
        });
        return res.json({ bouquets });
    } catch (error) {
        next(error);
    }
};

const createBouquet = async (req, res, next) => {
    try {
        const { name, description, isCustom, userId } = req.body;
        
        const imageUrl = req.file ? req.file.filename : "default_bouquet.jpg";

        if (!name)
            return res.status(400).json({
                message:
                    "У букета должно быть имя.",
            });

        const bouquet = await models.Bouquet.create({
            name,
            description,
            imageUrl,
          
            isCustom: isCustom === "true" || isCustom === true,
            userId: userId || null,
        });

        return res.status(201).json({
            message: "Букет создан.",
            bouquet,
        });
    } catch (error) {
        next(error);
    }
};

// PUT: Изменить букет
const updateBouquet = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, isDeleted } = req.body;

        const bouquet = await models.Bouquet.findByPk(id);
        if (!bouquet) {
            return res
                .status(404)
                .json({ message: "Букет не найден." });
        }

        if (name) bouquet.name = name;
        if (description) bouquet.description = description;
        if (req.file) bouquet.imageUrl = req.file.filename;

        if (isDeleted === "true" || isDeleted === true) {
            bouquet.deletedAt = new Date();
        } else if (isDeleted === "false" || isDeleted === false) {
            bouquet.deletedAt = null;
        }

        await bouquet.save();
        return res.json({ message: "Букет обновился.", bouquet });
    } catch (error) {
        next(error);
    }
};

// DELETE: Списать букет (Soft Delete)
const softDeleteBouquet = async (req, res, next) => {
    try {
        const { id } = req.params;

        const bouquet = await models.Bouquet.findByPk(id);
        if (!bouquet) {
            return res.status(404).json({
                message: "не существует.",
            });
        }

        bouquet.deletedAt = new Date();
        await bouquet.save();

        return res.json({
            message: "Букет списан",
        });
    } catch (error) {
        next(error);
    }
};

// PUT: Жестко перезаписать состав
const updateBouquetComponents = async (req, res, next) => {
    const t = await models.sequelize.transaction();
    try {
        const { id } = req.params;
        const { components } = req.body; 
        await models.BouquetComponent.destroy({
            where: { bouquetId: id },
            transaction: t,
        });

        if (components && components.length > 0) {
            const data = components.map((c) => ({
                bouquetId: id,
                componentId: c.componentId,
                quantity: c.quantity,
            }));
            await models.BouquetComponent.bulkCreate(data, { transaction: t });
        }

        await t.commit();
        return res.json({ message: "Состав новый " });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

// POST: Повесить тег на букет
const addBouquetTag = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { tagId } = req.body;

        if (!tagId)
            return res
                .status(400)
                .json({ message: "Пустота" });

        const [bouquetTag, created] = await models.BouquetTag.findOrCreate({
            where: { bouquetId: id, tagId: tagId },
        });

        return res
            .status(201)
            .json({ message: "Тег привязан.", bouquetTag });
    } catch (error) {
        next(error);
    }
};

// DELETE: Оторвать тег
const removeBouquetTag = async (req, res, next) => {
    try {
        const { id, tag_id } = req.params;

        const result = await models.BouquetTag.destroy({
            where: { bouquetId: id, tagId: tag_id },
        });

        if (!result)
            return res
                .status(404)
                .json({ message: "Этого тега и так нет на букете." });

        return res.json({ message: "Тег оторван." });
    } catch (error) {
        next(error);
    }
};

// GET: Выгрузить все компоненты, включая удаленные
const getAllComponents = async (req, res, next) => {
    try {
        const components = await models.Component.findAll({
            include: [
                { model: models.ComponentCategory, as: "category" },
                { model: models.ComponentPrice, as: "prices" }, 
            ],
            order: [["createdAt", "DESC"]],
        });
        return res.json({ components });
    } catch (error) {
        next(error);
    }
};

// POST: Регистрация нового компонеоа
const createComponent = async (req, res, next) => {
    const t = await models.sequelize.transaction();
    try {
        const { name, categoryId, unit, price } = req.body;
        const imageUrl = req.file ? req.file.filename : "default_component.jpg";

        if (!name || price === undefined) {
            await t.rollback();
            return res.status(400).json({
                message:
                    "Имя и начальная цена обязательны.",
            });
        }

        const component = await models.Component.create(
            {
                name,
                categoryId: categoryId || null,
                imageUrl,
                unit: unit || "шт",
            },
            { transaction: t },
        );

        const today = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 100);

        await models.ComponentPrice.create(
            {
                componentId: component.componentId,
                price: parseFloat(price),
                startDate: today,
                endDate: endDate,
            },
            { transaction: t },
        );

        await t.commit();
        return res.status(201).json({
            message: "Компонент загружен.",
            component,
        });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

// PUT: Редактировать инфу о компоненте
const updateComponent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, categoryId, unit, isDeleted } = req.body;

        const component = await models.Component.findByPk(id);
        if (!component)
            return res.status(404).json({ message: "Компонент не найден." });

        if (name) component.name = name;
        if (categoryId) component.categoryId = categoryId;
        if (unit) component.unit = unit;
        if (req.file) component.imageUrl = req.file.filename;

        if (isDeleted === "true" || isDeleted === true)
            component.deletedAt = new Date();
        else if (isDeleted === "false" || isDeleted === false)
            component.deletedAt = null;

        await component.save();
        return res.json({
            message: "Инвентарь обновлен.",
            component,
        });
    } catch (error) {
        next(error);
    }
};

// DELETE: Списание компонента (Soft Delete)
const deleteComponent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const component = await models.Component.findByPk(id);

        if (!component)
            return res
                .status(404)
                .json({ message: "не существует." });

        component.deletedAt = new Date();
        await component.save();

        return res.json({
            message:
                "Компонент списан",
        });
    } catch (error) {
        next(error);
    }
};



// POST: Ввести новую цену
const addComponentPrice = async (req, res, next) => {
    const t = await models.sequelize.transaction();
    try {
        const { id } = req.params;
        const { price } = req.body;

        if (price === undefined) {
            await t.rollback();
            return res
                .status(400)
                .json({ message: "пусто" });
        }

        const today = new Date();

        const currentPrice = await models.ComponentPrice.findOne({
            where: {
                componentId: id,
                startDate: { [Op.lte]: today },
                endDate: { [Op.gte]: today },
            },
            transaction: t,
        });

        if (currentPrice) {
            currentPrice.endDate = today;
            await currentPrice.save({ transaction: t });
        }

        // 2. Создаем новую цену
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 100);

        const newPrice = await models.ComponentPrice.create(
            {
                componentId: id,
                price: parseFloat(price),
                startDate: today,
                endDate: endDate,
            },
            { transaction: t },
        );

        await t.commit();
        return res.status(201).json({
            message: "Новая цена установлена",
            newPrice,
        });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};


const deleteComponentPrice = async (req, res, next) => {
    try {
        const { price_id } = req.params;


        const result = await models.ComponentPrice.destroy({
            where: { priceId: price_id },
        });

        if (!result)
            return res
                .status(404)
                .json({ message: "Такой цены нет" });

        return res.json({
            message: "цена удалена.",
        });
    } catch (error) {
        next(error);
    }
};

// --- ВЛАСТЬ НАД ЖАЛОБАМИ (СЛУЖБА ЗАБОТЫ) ---

// GET: Получить вообще все тикеты от всех пользователей
const getAllTickets = async (req, res, next) => {
    try {
        const tickets = await models.Ticket.findAll({
            include: [
                {
                    model: models.User,
                    as: "author", 
                    attributes: ["userId", "username", "email"],
                },
                {
                    model: models.TicketSubject,
                    as: "subject",
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const formattedTickets = tickets.map((t) => {
            const ticketJSON = t.toJSON();
            ticketJSON.user = ticketJSON.author; 
            delete ticketJSON.author;
            return ticketJSON;
        });

        return res.json({ tickets: formattedTickets });
    } catch (error) {
        next(error);
    }
};

// GET: Читать тикеи любого клиента
const getAdminTicketMessages = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ticket = await models.Ticket.findByPk(id);

        if (!ticket) {
            return res.status(404).json({
                message:
                    "Этого тикета не существует. Хватит искать призраков, Лили.",
            });
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


const addAdminTicketMessage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { text } = req.body; 

        if (!text) {
            return res.status(400).json({
                message: "пустое сообщение.",
            });
        }

        const ticket = await models.Ticket.findByPk(id);
        if (!ticket) {
            return res.status(404).json({
                message: "Тикет не найден.",
            });
        }

        const newMessage = await models.TicketMessage.create({
            ticketId: id,
            userId: req.user.userId,
            text: text,
        });

        return res.status(201).json({
            message: "Твой вердикт отправлен",
            newMessage,
        });
    } catch (error) {
        next(error);
    }
};

// PUT: Закрыть обращение 
const closeTicket = async (req, res, next) => {
    try {
        const { id } = req.params;

        const ticket = await models.Ticket.findByPk(id);
        if (!ticket) {
            return res.status(404).json({ message: "Тикет не найден." });
        }

        ticket.isActive = false;
        ticket.is_active = false;
        ticket.status = "Закрыт";
        await ticket.save();

        return res.json({
            message: "Обращение завершено.",
            ticket,
        });
    } catch (error) {
        next(error);
    }
};

router.get("/orders", async (req, res, next) => {
    try {
        const orders = await models.Order.findAll({
            include: [
                {
                    model: models.User,
                    as: "user",
               
                    attributes: ["userId", "username", "email"],
                },
                { model: models.OrderStatus, as: "status" },
                {
                    model: models.OrderItem,
                    as: "orderItems",
                    include: [{ model: models.Bouquet, as: "bouquet" }],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        return res.json({ orders });
    } catch (error) {
        next(error);
    }
});

router.get("/order-statuses", async (req, res, next) => {
    try {
        const statuses = await models.OrderStatus.findAll();
        return res.json({ statuses });
    } catch (error) {
        next(error);
    }
});

router.put("/orders/:id/status", async (req, res, next) => {
    try {
        const { id } = req.params;
        const { statusId } = req.body;

        if (!statusId) {
            return res.status(400).json({
                message: "нет статуса",
            });
        }

        const order = await models.Order.findByPk(id);
        if (!order) {
            return res.status(404).json({ message: "Заказ не найден." });
        }

        order.statusId = statusId;
        await order.save();

        const updatedStatus = await models.OrderStatus.findByPk(statusId);

        return res.json({
            message: "Статус заказа изменен.",
            status: updatedStatus,
        });
    } catch (error) {
        next(error);
    }
});


router.get("/bouquets", getAllAdminBouquets);

router.post("/bouquets", upload.single("image"), createBouquet);
router.put("/bouquets/:id", upload.single("image"), updateBouquet);
router.delete("/bouquets/:id", softDeleteBouquet);

router.get("/components", getAllComponents);
router.post("/components", upload.single("image"), createComponent);
router.put("/components/:id", upload.single("image"), updateComponent);
router.delete("/components/:id", deleteComponent);


router.put("/bouquets/:id/components", updateBouquetComponents);
router.post("/bouquets/:id/tags", addBouquetTag);
router.delete("/bouquets/:id/tags/:tag_id", removeBouquetTag);


router.post("/components/:id/prices", addComponentPrice);
router.delete("/components/prices/:price_id", deleteComponentPrice);


router.get("/tickets", getAllTickets);
router.get("/tickets/:id/messages", getAdminTicketMessages);
router.post("/tickets/:id/messages", addAdminTicketMessage);
router.put("/tickets/:id/close", closeTicket);

module.exports = router;
