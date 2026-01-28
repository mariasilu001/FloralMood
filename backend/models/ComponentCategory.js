const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class ComponentCategory extends Model {}

ComponentCategory.init(
    {
        categoryId: {
            field: "category_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            field: "name",
            type: DataTypes.TEXT,
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
        modelName: "ComponentCategory",
        tableName: "component_categories",
        timestamps: false,
    },
);

module.exports = ComponentCategory;
