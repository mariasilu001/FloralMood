const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class BouquetTag extends Model {}

BouquetTag.init(
    {
        bouquetTagId: {
            field: "bouquet_tag_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
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
        tagId: {
            field: "tag_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "tags",
                key: "tag_id",
            },
        },
    },
    {
        sequelize,
        modelName: "BouquetTag",
        tableName: "bouquet_tags",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ["tag_id", "bouquet_id"],
            },
        ],
    },
);

module.exports = BouquetTag;
