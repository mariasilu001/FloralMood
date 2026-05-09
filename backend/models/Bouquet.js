const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class Bouquet extends Model {}

Bouquet.init(
    {
        bouquetId: {
            field: "bouquet_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            field: "user_id",
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "users",
                key: "user_id",
            },
        },
        name: {
            field: "name",
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            field: "description",
            type: DataTypes.TEXT,
            allowNull: true,
        },
        imageUrl: {
            field: "image_url",
            type: DataTypes.STRING(1000),
            allowNull: true,
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
        isCustom: {
            field: "is_custom",
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        modelName: "Bouquet",
        tableName: "bouquets",
        timestamps: false,
    },
);

module.exports = Bouquet;
