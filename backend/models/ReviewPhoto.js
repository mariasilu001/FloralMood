const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class ReviewPhoto extends Model {}

ReviewPhoto.init(
    {
        photoId: {
            field: "photo_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        reviewId: {
            field: "review_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "reviews",
                key: "review_id",
            },
        },
        photoUrl: {
            field: "photo_url",
            type: DataTypes.STRING(500),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "ReviewPhoto",
        tableName: "review_photos",
        timestamps: false,
    },
);

module.exports = ReviewPhoto;
