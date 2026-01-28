const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class Favorite extends Model {}

Favorite.init(
    {
        favoriteId: {
            field: "favorite_id",
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
        createdAt: {
            field: "created_at",
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: "Favorite",
        tableName: "favorites",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ["user_id", "bouquet_id"],
            },
        ],
    },
);

module.exports = Favorite;
