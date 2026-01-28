const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class Review extends Model {}

Review.init(
    {
        reviewId: {
            field: "review_id",
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
        orderId: {
            field: "order_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "orders",
                key: "order_id",
            },
        },
        rating: {
            field: "rating",
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        text: {
            field: "text",
            type: DataTypes.TEXT,
            allowNull: true,
        },
        createdAt: {
            field: "created_at",
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        changedAt: {
            field: "changed_at",
            type: DataTypes.DATE,
            defaultValue: null,
        },
        deletedAt: {
            field: "deleted_at",
            type: DataTypes.DATE,
            defaultValue: null,
        },
    },
    {
        sequelize,
        modelName: "Review",
        tableName: "reviews",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ["user_id", "order_id", "bouquet_id"],
            },
        ],
    },
);

module.exports = Review;
