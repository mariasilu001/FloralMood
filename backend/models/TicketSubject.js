const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class TicketSubject extends Model {}

TicketSubject.init(
    {
        subjectId: {
            field: "subject_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            field: "name",
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "TicketSubject",
        tableName: "ticket_subjects",
        timestamps: false,
    },
);

module.exports = TicketSubject;
