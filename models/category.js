const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Category = sequelize.define(
    "Category",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING, // e.g., 'VIDEO MP4', 'PDF', 'COLLECTION'
            allowNull: true,
        },
        icon: {
            type: DataTypes.STRING, // FontAwesome icon class
            allowNull: true,
        },
        displayOrder: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        tableName: "categories",
        timestamps: false,
    }
);

module.exports = Category;
