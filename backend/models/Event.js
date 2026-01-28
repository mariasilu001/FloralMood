const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class Event extends Model {}

Event.init(
    {
        eventId: {
            field: "event_id",
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
        eventTypeId: {
            field: "event_type_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "event_types",
                key: "event_type_id",
            },
        },
        name: {
            field: "name",
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        eventDate: {
            field: "event_date",
            type: DataTypes.STRING(5),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "Event",
        tableName: "events",
        timestamps: false,
    },
);

module.exports = Event;
