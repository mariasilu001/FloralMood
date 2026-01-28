const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class Ticket extends Model {}

Ticket.init(
    {
        ticketId: {
            field: "ticket_id",
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
        subjectId: {
            field: "subject_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "ticket_subjects",
                key: "subject_id",
            },
        },
        isActive: {
            field: "is_active",
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        createdAt: {
            field: "created_at",
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: "Ticket",
        tableName: "tickets",
        timestamps: false,
    },
);

module.exports = Ticket;
