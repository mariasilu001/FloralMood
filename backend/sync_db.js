const { Op } = require("sequelize");
const { sequelize, Bouquet, Component, ComponentPrice } = require("./models"); // Твой путь к моделям

async function cleanup() {
    try {
        const today = new Date();
        const bouquet = await Bouquet.findByPk(1, {
            include: {
                model: Component,
                as: "components",
                include: {
                    model: ComponentPrice,
                    as: "prices",
                    where: {
                        startDate: { [Op.lte]: today },
                        [Op.or]: [
                            { endDate: { [Op.gte]: today } }, 
                            { endDate: null },
                        ],
                    },
                    require: true,
                },
            },
        });
        // Используй JSON.stringify с отступами (null, 2)
        //console.log(JSON.stringify(bouquet, null, 2));
        console.log(false === null)
        console.log(false === undefined)
    } catch (error) {
        console.error("Ошибка при удалении:", error);
    } finally {
        await sequelize.close();
    }
}

cleanup();
