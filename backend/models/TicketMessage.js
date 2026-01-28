const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class TicketMessage extends Model {}

TicketMessage.init(
    {
        messageId: {
            field: "message_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        ticketId: {
            field: "ticket_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "tickets",
                key: "ticket_id",
            },
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
    },
    {
        sequelize,
        modelName: "TicketMessage",
        tableName: "ticket_messages",
        timestamps: false,
    },
);

module.exports = TicketMessage;
