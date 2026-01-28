const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class CartItem extends Model {}

CartItem.init(
    {
        cartItemId: {
            field: "cart_item_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            field: "user_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "user_id",
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
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt: {
            field: "created_at",
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: "CartItem",
        tableName: "cart_items",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ["user_id", "bouquet_id"],
            },
        ],
    },
);

module.exports = CartItem;
