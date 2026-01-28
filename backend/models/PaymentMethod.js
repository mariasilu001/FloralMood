const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class PaymentMethod extends Model {}

PaymentMethod.init(
    {
        paymentMethodId: {
            field: "payment_method_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            field: "name",
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        isActive: {
            field: "is_active",
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: "PaymentMethod",
        tableName: "payment_methods",
        timestamps: false,
    },
);

module.exports = PaymentMethod;
