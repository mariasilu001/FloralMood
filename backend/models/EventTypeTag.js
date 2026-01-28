const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class EventTypeTag extends Model {}

EventTypeTag.init(
    {
        eventTypeTagId: {
            field: "event_type_tag_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        eventTypeId: {
            field: "event_type_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "event_types",
                key: "event_type_id",
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
        modelName: "EventTypeTag",
        tableName: "event_type_tags",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ["event_type_id", "tag_id"],
            },
        ],
    },
);

module.exports = EventTypeTag;
