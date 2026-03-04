const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PurchasedItem = sequelize.define(
    "PurchasedItem",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "user", key: "id" },
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        productType: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "e.g., 'album', 'book', 'video', 'african_story'",
        },
        paymentStatus: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "PENDING", // PENDING, FAILED, COMPLETED
            comment: "Payment status of the order",
        },
        paymentReference: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "Pesapal Order Tracking ID or reference",
        },
    },
    {
        tableName: "purchased_items",
        timestamps: true,
    }
);

module.exports = PurchasedItem;
