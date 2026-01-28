const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class BouquetComponent extends Model {}

BouquetComponent.init(
    {
        bouquetComponentId: {
            field: "bouquet_component_id",
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
        bouquetId: {
            field: "bouquet_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "bouquets",
                key: "bouquet_id",
            },
        },
        quantity: {
            field: "quantity",
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "BouquetComponent",
        tableName: "bouquet_components",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ["component_id", "bouquet_id"],
            },
        ],
    },
);

module.exports = BouquetComponent;
