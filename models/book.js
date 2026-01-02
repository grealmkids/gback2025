const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Book = sequelize.define(
    "Book",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        price: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        fileUrl: {
            type: DataTypes.STRING, // PDF Link
            allowNull: true,
        },
        coverImage: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "categories",
                key: "id",
            },
        },
    },
    {
        tableName: "books", // Serves Story Books, Coloring Books
        timestamps: true,
    }
);

module.exports = Book;
