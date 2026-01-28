const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class Tag extends Model {}

Tag.init(
    {
        tagId: {
            field: "tag_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            field: "name",
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        modelName: "Tag",
        tableName: "tags",
        timestamps: false,
    },
);

module.exports = Tag;
