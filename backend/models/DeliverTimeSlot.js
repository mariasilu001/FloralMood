const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class DeliverTimeSlot extends Model {}

DeliverTimeSlot.init(
    {
        timeSlotId: {
            field: "time_slot_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            field: "name",
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        startTime: {
            field: "start_time",
            type: DataTypes.TIME,
            allowNull: false,
        },
        endTime: {
            field: "end_time",
            type: DataTypes.TIME,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "DeliverTimeSlot",
        tableName: "deliver_time_slots",
        timestamps: false,
    },
);

module.exports = DeliverTimeSlot;
