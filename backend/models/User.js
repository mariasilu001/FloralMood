const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class User extends Model {}

User.init(
    {
        userId: {
            field: "user_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            field: "username",
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        email: {
            field: "email",
            type: DataTypes.STRING(255),
            unique: true,
            allowNull: false,
        },
        passwordHash: {
            field: "password_hash",
            type: DataTypes.TEXT,
            allowNull: false,
        },
        // avatar: {
        //     type: DataTypes.STRING,
        //     allowNull: true,
        // },
        roleId: {
            field: "role_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "user_roles",
                key: "role_id",
            },
        },
        createdAt: {
            field: "created_at",
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        deletedAt: {
            field: "deleted_at",
            type: DataTypes.DATE,
            defaultValue: null,
        },
    },
    {
        sequelize,
        modelName: "User",
        tableName: "users",
        timestamps: false,
    },
);

module.exports = User;
