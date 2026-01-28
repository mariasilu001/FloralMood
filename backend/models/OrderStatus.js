const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class OrderStatus extends Model {}

OrderStatus.init(
    {
        statusId: {
            field: "status_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            field: "name",
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        description: {
            field: "description",
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "OrderStatus",
        tableName: "order_statuses",
        timestamps: false,
    },
);

module.exports = OrderStatus;
