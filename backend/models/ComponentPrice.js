const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class ComponentPrice extends Model {}

ComponentPrice.init(
    {
        priceId: {
            field: "price_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        componentId: {
            field: "component_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "components",
                key: "component_id",
            },
        },
        price: {
            field: "price",
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        startDate: {
            field: "start_date",
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        endDate: {
            field: "end_date",
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "ComponentPrice",
        tableName: "component_prices",
        timestamps: false,
    },
);

module.exports = ComponentPrice;
