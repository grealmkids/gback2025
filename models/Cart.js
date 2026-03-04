const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Cart = sequelize.define(
    "Cart",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true, // Allow generic anon carts if needed, but strictly users here
        },
    },
    {
        timestamps: true,
        tableName: "carts",
    }
);

module.exports = Cart;
