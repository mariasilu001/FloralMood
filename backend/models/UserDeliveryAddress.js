const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class UserDeliveryAddress extends Model {}

UserDeliveryAddress.init(
    {
        addressId: {
            field: "address_id",
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
        city: {
            field: "city",
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        street: {
            field: "street",
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        house: {
            field: "house",
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        apartment: {
            field: "apartment",
            type: DataTypes.STRING(50),
        },
        createdAt: {
            field: "created_at",
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: "UserDeliveryAddress",
        tableName: "user_delivery_addresses",
        timestamps: false,
    },
);

module.exports = UserDeliveryAddress;
