const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class Order extends Model {}

Order.init(
    {
        orderId: {
            field: "order_id",
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
        statusId: {
            field: "status_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "order_statuses",
                key: "status_id",
            },
        },
        comment: {
            field: "comment",
            type: DataTypes.TEXT,
            allowNull: true,
        },
        isHidden: {
            field: "is_hidden",
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        addressId: {
            field: "address_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "user_delivery_addresses",
                key: "address_id",
            },
        },
        createdAt: {
            field: "created_at",
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        totalPrice: {
            field: "total_price",
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        paymentMethodId: {
            field: "payment_method_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "payment_methods",
                key: "payment_method_id",
            },
        },
        deliveryDate: {
            field: "delivery_date",
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        timeSlotId: {
            field: "time_slot_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "deliver_time_slots",
                key: "time_slot_id",
            },
        },
        isPaid : {
            field: "is_paid",
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    },
    {
        sequelize,
        modelName: "Order",
        tableName: "orders",
        timestamps: false,
    },
);

module.exports = Order;
