const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class Component extends Model {}

Component.init(
    {
        componentId: {
            field: "component_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
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
        categoryId: {
            field: "category_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "component_categories",
                key: "category_id",
            },
        },
        imageUrl: {
            field: "image_url",
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        unit: {
            field: "unit",
            type: DataTypes.STRING(50),
            allowNull: false,
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
        modelName: "Component",
        tableName: "components",
        timestamps: false,
    },
);

module.exports = Component;
