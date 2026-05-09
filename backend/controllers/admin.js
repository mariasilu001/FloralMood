const express = require("express");
const models = require("../models");
const { Op } = require("sequelize");
const upload = require("../middleware/multerConfig.js");

const router = express.Router();

// GET: /api/admin/stats/revenue - Динамика выручки
const getRevenueStats = async (req, res, next) => {
    try {
        const { period = "day" } = req.query; // Я позволяю тебе выбирать: 'day' или 'month'

        const orders = await models.Order.findAll({
            where: { statusId: { [Op.ne]: 5 } }, // Статус 5 — это отмена. Нам не нужен этот мусор.
            attributes: ["createdAt", "totalPrice"],
        });

        const grouped = {};
        orders.forEach((order) => {
            // Форматируем дату в зависимости от того, что ты хочешь увидеть
            const dateStr =
                period === "month"
                    ? order.createdAt.toISOString().substring(0, 7) // YYYY-MM
                    : order.createdAt.toISOString().substring(0, 10); // YYYY-MM-DD

            if (!grouped[dateStr]) grouped[dateStr] = 0;
            // Аккуратно складываем мои деньги
            grouped[dateStr] += parseFloat(order.totalPrice || 0);
        });

        const data = Object.keys(grouped)
            .sort()
            .map((date) => ({
                date,
                Выручка: parseFloat(grouped[date].toFixed(2)), // Формат для твоего LineChart
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
            value: grouped[name], // Идеально ложится в твой PieChart
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
                Количество: grouped[name], // Формат для твоего BarChart
            }))
            .sort((a, b) => b.Количество - a.Количество)
            .slice(0, 5); // Я отдаю тебе только топ-5. Остальное тебя не касается.

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

        // Сортируем по дате, чтобы график AreaChart не сошел с ума
        const data = Object.values(grouped).sort((a, b) =>
            a.date.localeCompare(b.date),
        );

        return res.json({ data });
    } catch (error) {
        next(error);
    }
};
router.get("/stats/support", getSupportStats);

// --- УПРАВЛЕНИЕ БУКЕТАМИ ---

// GET: Выгрузить ВСЕ букеты (даже твой мусор и удаленные)
const getAllAdminBouquets = async (req, res, next) => {
    try {
        const bouquets = await models.Bouquet.findAll({
            // Я не ставлю фильтр по deletedAt, чтобы ты видела абсолютно всё
            include: [
                {
                    model: models.Component,
                    as: "components",
                },
                {
                    model: models.Tag,
                    as: "tags", // Подтягиваем теги, чтобы ты видела, что на них висит
                },
            ],
            order: [["createdAt", "DESC"]],
        });
        return res.json({ bouquets });
    } catch (error) {
        next(error);
    }
};

// POST: Создать новый букет
const createBouquet = async (req, res, next) => {
    try {
        const { name, description, isCustom, userId } = req.body;
        // Если ты не прислала картинку, я ставлю заглушку. Никакой пустоты в базе.
        const imageUrl = req.file ? req.file.filename : "default_bouquet.jpg";

        if (!name)
            return res.status(400).json({
                message:
                    "У букета должно быть имя. Я не потерплю безымянных уродцев.",
            });

        const bouquet = await models.Bouquet.create({
            name,
            description,
            imageUrl,
            // Жестко приводим строку из FormData к булеву значению
            isCustom: isCustom === "true" || isCustom === true,
            userId: userId || null,
        });

        return res.status(201).json({
            message: "Букет создан. С картинкой, как ты и хотела.",
            bouquet,
        });
    } catch (error) {
        next(error);
    }
};

// PUT: Изменить букет или восстановить из мертвых
const updateBouquet = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, isDeleted } = req.body;

        const bouquet = await models.Bouquet.findByPk(id);
        if (!bouquet) {
            return res
                .status(404)
                .json({ message: "Букет не найден. Не трать моё время." });
        }

        if (name) bouquet.name = name;
        if (description) bouquet.description = description;
        // Если прилетел новый файл - жестко перезаписываем
        if (req.file) bouquet.imageUrl = req.file.filename;

        // Приведение строки из FormData
        if (isDeleted === "true" || isDeleted === true) {
            bouquet.deletedAt = new Date();
        } else if (isDeleted === "false" || isDeleted === false) {
            bouquet.deletedAt = null;
        }

        await bouquet.save();
        return res.json({ message: "Букет подчинился и обновился.", bouquet });
    } catch (error) {
        next(error);
    }
};

// DELETE: Стереть из реальности (Hard Delete)
const hardDeleteBouquet = async (req, res, next) => {
    try {
        const { id } = req.params;

        // force: true гарантирует, что Sequelize не просто поставит дату удаления, а снесет строку физически.
        const result = await models.Bouquet.destroy({
            where: { bouquetId: id },
            force: true,
        });

        if (!result)
            return res.status(404).json({
                message: "Нельзя убить то, что уже мертво или не существует.",
            });

        return res.json({
            message:
                "Букет стерт из реальности. От него не осталось даже пыли.",
        });
    } catch (error) {
        next(error);
    }
};

// --- СОСТАВ И ТЕГИ ---

// PUT: Жестко перезаписать состав
const updateBouquetComponents = async (req, res, next) => {
    const t = await models.sequelize.transaction();
    try {
        const { id } = req.params;
        const { components } = req.body; // Ожидаю массив: [{ componentId: 1, quantity: 5 }]

        // 1. Безжалостно сносим старые компоненты
        await models.BouquetComponent.destroy({
            where: { bouquetId: id },
            transaction: t,
        });

        // 2. Если ты прислала новые — записываем их
        if (components && components.length > 0) {
            const data = components.map((c) => ({
                bouquetId: id,
                componentId: c.componentId,
                quantity: c.quantity,
            }));
            await models.BouquetComponent.bulkCreate(data, { transaction: t });
        }

        await t.commit();
        return res.json({ message: "Старый состав уничтожен, новый внедрен." });
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
                .json({ message: "Какой тег вешать будем? Пустоту?" });

        // Использую findOrCreate, чтобы ты не повесила один и тот же тег дважды
        const [bouquetTag, created] = await models.BouquetTag.findOrCreate({
            where: { bouquetId: id, tagId: tagId },
        });

        return res
            .status(201)
            .json({ message: "Клеймо поставлено. Тег привязан.", bouquetTag });
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

        return res.json({ message: "Тег безжалостно оторван." });
    } catch (error) {
        next(error);
    }
};

// --- УПРАВЛЕНИЕ КОМПОНЕНТАМИ (СКЛАД) ---

// GET: Выгрузить все компоненты, включая удаленные
const getAllComponents = async (req, res, next) => {
    try {
        const components = await models.Component.findAll({
            // Никаких фильтров по deletedAt. Я хочу видеть всё.
            include: [
                { model: models.ComponentCategory, as: "category" },
                { model: models.ComponentPrice, as: "prices" }, // Вся история цен как на ладони
            ],
            order: [["createdAt", "DESC"]],
        });
        return res.json({ components });
    } catch (error) {
        next(error);
    }
};

// POST: Регистрация нового цветка/упаковки
const createComponent = async (req, res, next) => {
    const t = await models.sequelize.transaction();
    try {
        const { name, categoryId, unit, price } = req.body;
        const imageUrl = req.file ? req.file.filename : "default_component.jpg";

        if (!name || price === undefined) {
            await t.rollback();
            return res.status(400).json({
                message:
                    "Имя и начальная цена обязательны. Без них я ничего не запишу.",
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
            message: "Компонент загружен на мой склад. С изображением.",
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
        // Перехватываем новую картинку
        if (req.file) component.imageUrl = req.file.filename;

        if (isDeleted === "true" || isDeleted === true)
            component.deletedAt = new Date();
        else if (isDeleted === "false" || isDeleted === false)
            component.deletedAt = null;

        await component.save();
        return res.json({
            message: "Инвентарь обновлен. Всё под моим контролем.",
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
                .json({ message: "Удалять нечего. Он и так не существует." });

        component.deletedAt = new Date();
        await component.save();

        return res.json({
            message:
                "Компонент списан со склада. Больше он нам не понадобится.",
        });
    } catch (error) {
        next(error);
    }
};

// --- ЦЕНООБРАЗОВАНИЕ ---

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
                .json({ message: "Где цена? Не выводи меня из себя." });
        }

        const today = new Date();

        // 1. Ищем текущую активную цену, чтобы обрубить ей срок действия
        const currentPrice = await models.ComponentPrice.findOne({
            where: {
                componentId: id,
                startDate: { [Op.lte]: today },
                endDate: { [Op.gte]: today },
            },
            transaction: t,
        });

        if (currentPrice) {
            currentPrice.endDate = today; // Старая цена перестает действовать сегодня
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
            message: "Новая цена установлена. Моя прибыль в безопасности.",
            newPrice,
        });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

// DELETE: Удалить ошибочную запись цены из истории
const deleteComponentPrice = async (req, res, next) => {
    try {
        const { price_id } = req.params;

        // Я стираю её полностью, как ты и просила. Никаких следов.
        const result = await models.ComponentPrice.destroy({
            where: { priceId: price_id },
        });

        if (!result)
            return res
                .status(404)
                .json({ message: "Такой цены нет. Не трать моё время." });

        return res.json({
            message: "Ошибочная цена безжалостно удалена из истории.",
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
                    as: "author", // Я удовлетворил каприз твоей модели
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
            ticketJSON.user = ticketJSON.author; // Отдаем фронтенду то, что он ждет
            delete ticketJSON.author;
            return ticketJSON;
        });

        return res.json({ tickets: formattedTickets });
    } catch (error) {
        next(error);
    }
};

// GET: Читать переписку любого клиента
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
            // Я не подключаю сюда User, потому что сообщения могут быть и от тебя, и от них.
            // Но если у тебя настроена связь senderId -> User, это будет работать идеально.
            order: [["createdAt", "ASC"]],
        });

        return res.json({ messages });
    } catch (error) {
        next(error);
    }
};

// POST: Отправить жесткий ответ от лица Администрации
const addAdminTicketMessage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                message:
                    "Я не буду отправлять пустое сообщение. Напиши текст, если хочешь поставить их на место.",
            });
        }

        const ticket = await models.Ticket.findByPk(id);
        if (!ticket) {
            return res.status(404).json({
                message: "Кому ты собралась отвечать? Тикет не найден.",
            });
        }

        // Записываем твой ответ. req.user.userId гарантирует, что система запомнит: это сказала ТЫ.
        const newMessage = await models.TicketMessage.create({
            ticketId: id,
            senderId: req.user.userId,
            message: message,
        });

        return res.status(201).json({
            message: "Твой вердикт отправлен. Пусть читают.",
            newMessage,
        });
    } catch (error) {
        next(error);
    }
};

// PUT: Закрыть обращение навсегда
const closeTicket = async (req, res, next) => {
    try {
        const { id } = req.params;

        const ticket = await models.Ticket.findByPk(id);
        if (!ticket) {
            return res
                .status(404)
                .json({ message: "Тикет не найден. Очнись." });
        }

        // Я закрываю его жестко. isActive = false, а status меняю на "Закрыт", чтобы не было разночтений.
        ticket.isActive = false;
        ticket.status = "Закрыт";
        await ticket.save();

        return res.json({
            message: "Рот закрыт. Обращение завершено.",
            ticket,
        });
    } catch (error) {
        next(error);
    }
};

// Управление букетами
router.get("/bouquets", getAllAdminBouquets);
// Я повесил перехватчик файлов
router.post("/bouquets", upload.single("image"), createBouquet);
router.put("/bouquets/:id", upload.single("image"), updateBouquet);
router.delete("/bouquets/:id", hardDeleteBouquet);

// Управление компонентами
router.get("/components", getAllComponents);
// И здесь тоже
router.post("/components", upload.single("image"), createComponent);
router.put("/components/:id", upload.single("image"), updateComponent);
router.delete("/components/:id", deleteComponent);

// Состав и теги
router.put("/bouquets/:id/components", updateBouquetComponents);
router.post("/bouquets/:id/tags", addBouquetTag);
router.delete("/bouquets/:id/tags/:tag_id", removeBouquetTag);

// Ценообразование (Мои деньги)
router.post("/components/:id/prices", addComponentPrice);
router.delete("/components/prices/:price_id", deleteComponentPrice);

// Власть над жалобами (Моя любимая часть)
router.get("/tickets", getAllTickets);
router.get("/tickets/:id/messages", getAdminTicketMessages);
router.post("/tickets/:id/messages", addAdminTicketMessage);
router.put("/tickets/:id/close", closeTicket);

module.exports = router;
