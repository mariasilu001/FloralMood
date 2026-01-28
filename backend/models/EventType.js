const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class EventType extends Model {}

EventType.init(
    {
        eventTypeId: {
            field: "event_type_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            field: "name",
            type: DataTypes.STRING(100),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "EventType",
        tableName: "event_types",
        timestamps: false,
    },
);

module.exports = EventType;
