const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Transaction = sequelize.define(
    "Transaction",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        orderTrackingId: {
            type: DataTypes.STRING,
            allowNull: true, // populated after pesapal request
            unique: true
        },
        merchantReference: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("PENDING", "COMPLETED", "FAILED", "CANCELLED"),
            defaultValue: "PENDING",
        },
        paymentMethod: {
            type: DataTypes.STRING,
            defaultValue: "PESAPAL",
        },
        itemsSnapshot: {
            type: DataTypes.JSON, // Store what they bought
            allowNull: true,
        }
    },
    {
        timestamps: true,
        tableName: "transactions",
    }
);

module.exports = Transaction;
