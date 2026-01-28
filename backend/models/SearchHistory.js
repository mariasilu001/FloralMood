const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class SearchHistory extends Model {}

SearchHistory.init(
    {
        queryId: {
            field: "query_id",
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
        text: {
            field: "text",
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
        tableName: "search_history",
        modelName: "SearchHistory",
        timestamps: false,
    },
);

module.exports = SearchHistory;
