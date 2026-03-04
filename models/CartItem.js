const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CartItem = sequelize.define(
    "CartItem",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        cartId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        productType: {
            type: DataTypes.STRING, // e.g., 'Album', 'Book', 'Video', 'AfricanStory'
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        coverImage: {
            type: DataTypes.TEXT,
            allowNull: true,
        }
    },
    {
        timestamps: true,
        tableName: "cart_items",
    }
);

module.exports = CartItem;
