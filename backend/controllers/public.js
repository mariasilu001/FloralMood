const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const models = require("../models");
const vars = require("../vars");
const { Op } = require("sequelize");

const router = express.Router();

const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const existingUsername = await models.User.findOne({
            where: {
                username: username,
            },
        });
        if (existingUsername) {
            return res.status(409).json({
                message: "account with this username is already existing",
            });
        }

        const existingEmail = await models.User.findOne({
            where: {
                email: email,
            },
        });
        if (existingEmail) {
            return res.status(409).json({
                message: "account wit this email is already existing",
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await models.User.create({
            username: username,
            email: email,
            passwordHash: passwordHash,
            roleId: 2,
        });

        const token = await jwt.sign(
            {
                userId: newUser.userId,
                roleId: newUser.roleId,
            },
            vars.JWT_SECRET,
        );

        return res.status(201).json({
            userRole: newUser.roleId,
            token: token,
        });
    } catch (error) {
        next(error);
    }
};
router.post("/register", register);

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await models.User.findOne({
            where: {
                email: email,
            },
        });
        if (!user) {
            return res.status(404).json({ message: "user is not found" });
        }

        const rightPassword = await bcrypt.compare(password, user.passwordHash);
        if (!rightPassword) {
            return res.status(403).json({ message: "wrong password" });
        }

        const token = await jwt.sign(
            {
                userId: user.userId,
                roleId: user.roleId,
            },
            vars.JWT_SECRET,
        );

        return res.status(201).json({
            userRole: user.roleId,
            token: token,
        });
    } catch (error) {
        next(error);
    }
};
router.post("/login", login);

const getAllBouquets = async (req, res, next) => {
    try {
        const today = new Date();
        const bouquets = await models.Bouquet.findAll({
            where: {
                isCustom: false,
                userId: null,
                deletedAt: null,
            },
            include: [
                {
                    model: models.Component,
                    as: "components",
                    include: {
                        model: models.ComponentPrice,
                        as: "prices",
                        where: {
                            startDate: {
                                [Op.lte]: today,
                            },
                            endDate: {
                                [Op.gte]: today,
                            },
                        },
                    },
                },
                {
                    model: models.Tag,
                    as: "tags",
                },
            ],
        });

        return res.json({
            bouquets: bouquets,
        });
    } catch (error) {
        next(error);
    }
};
router.get("/bouquets", getAllBouquets);

const getOneBouquet = async (req, res, next) => {
    try {
        const { bouquetId } = req.params;
        const today = new Date();

        const bouquet = await models.Bouquet.findByPk(bouquetId, {
            include: [
                {
                    model: models.Review,
                    as: "reviews",
                    include: {
                        model: models.User,
                        as: "author",
                        attributes: ["username"],
                    },
                },
                {
                    model: models.Component,
                    as: "components",
                    include: [
                        {
                            model: models.ComponentCategory,
                            as: "category",
                        },
                        {
                            model: models.ComponentPrice,
                            as: "prices",
                            where: {
                                startDate: { [Op.lte]: today },
                                endDate: { [Op.gte]: today },
                            },
                            required: false,
                        },
                    ],
                },
            ],
        });

        if (!bouquet) {
            return res.status(404).json({ message: "bouquet is not found" });
        }

        const reviewsCount = bouquet.reviews.length;
        const avgRating =
            reviewsCount > 0
                ? bouquet.reviews.reduce((acc, rev) => acc + rev.rating, 0) /
                  reviewsCount
                : 0;

        
        let componentsCost = 0;
        const componentsData = bouquet.components.map((comp) => {
            const currentPrice = comp.prices[0]?.price || 0;
            const quantity = comp.BouquetComponent.quantity;
            componentsCost += parseFloat(currentPrice) * parseFloat(quantity);

            return {
                name: comp.name,
                imageUrl: comp.imageUrl,
                category: comp.category.name,
                price: parseFloat(currentPrice),
                unit: comp.unit,
            };
        });

        
        const finalPrice = (componentsCost * 1.06).toFixed(2);

        return res.json({
            bouquet: {
                name: bouquet.name,
                imageUrl: bouquet.imageUrl,
                description: bouquet.description,
                avgRating: parseFloat(avgRating.toFixed(1)),
                totalPrice: parseFloat(finalPrice),
            },
            components: componentsData,
            reviews: bouquet.reviews.map((rev) => ({
                username: rev.author.username,
                text: rev.text,
                rating: rev.rating,
                createdAt: rev.createdAt,
            })),
        });
    } catch (error) {
        next(error);
    }
};
router.get("/bouquets/:bouquetId", getOneBouquet);


const getComponents = async (req, res, next) => {
    try {
        const today = new Date();
        const components = await models.Component.findAll({
            where: {
                deletedAt: null, 
            },
            include: [
                {
                    model: models.ComponentPrice,
                    as: "prices",
                    where: {
                        startDate: { [Op.lte]: today },
                        endDate: { [Op.gte]: today },
                    },
                    required: false,
                },
            ],
            attributes: [
                "componentId",
                "name",
                "imageUrl",
                "categoryId",
                "unit",
            ],
        });

        
        const formattedComponents = components.map((c) => ({
            componentId: c.componentId,
            name: c.name,
            imageUrl: c.imageUrl,
            categoryId: c.categoryId,
            unit: c.unit,
            price: c.prices.length > 0 ? parseFloat(c.prices[0].price) : 0,
        }));

        return res.json({ components: formattedComponents });
    } catch (error) {
        next(error);
    }
};


const getCategories = async (req, res, next) => {
    try {
        const categories = await models.ComponentCategory.findAll({
            where: { deletedAt: null },
            attributes: ["categoryId", "name"], 
        });
        return res.json({ categories });
    } catch (error) {
        next(error);
    }
};


const getTags = async (req, res, next) => {
    try {
        const tags = await models.Tag.findAll();
        return res.json({ tags });
    } catch (error) {
        next(error);
    }
};


const getGlobalEvents = async (req, res, next) => {
    try {
        const globalEvents = await models.GlobalEvent.findAll();
        return res.json({ globalEvents });
    } catch (error) {
        next(error);
    }
};


const getEventTypes = async (req, res, next) => {
    try {
        const eventTypes = await models.EventType.findAll({
            include: {
                model: models.Tag,
                as: "tags",
            },
        });
        return res.json({ eventTypes });
    } catch (error) {
        next(error);
    }
};


const getTimeSlots = async (req, res, next) => {
    try {
        const timeSlots = await models.DeliverTimeSlot.findAll();
        return res.json({ timeSlots });
    } catch (error) {
        next(error);
    }
};


const getPaymentMethods = async (req, res, next) => {
    try {
        const paymentMethods = await models.PaymentMethod.findAll({
            where: { isActive: true }, 
        });
        return res.json({ paymentMethods });
    } catch (error) {
        next(error);
    }
};


const getTicketSubjects = async (req, res, next) => {
    try {
        const subjects = await models.TicketSubject.findAll();
        return res.json({ subjects });
    } catch (error) {
        next(error);
    }
};
router.get("/components", getComponents);
router.get("/categories", getCategories);
router.get("/tags", getTags);
router.get("/events/global", getGlobalEvents);
router.get("/events/types", getEventTypes);
router.get("/delivery/time-slots", getTimeSlots);
router.get("/payment-methods", getPaymentMethods);
router.get("/tickets/subjects", getTicketSubjects);

module.exports = router;
