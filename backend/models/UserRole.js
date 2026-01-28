const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class UserRole extends Model {}

UserRole.init(
    {
        roleId: {
            field: "role_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            field: "name",
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "UserRole",
        tableName: "user_roles",
        timestamps: false,
    },
);

module.exports = UserRole;
