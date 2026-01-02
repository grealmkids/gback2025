const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Video = sequelize.define(
    "Video",
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
            type: DataTypes.STRING,
            allowNull: true,
        },
        previewUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        thumbnail: {
            type: DataTypes.STRING,
            allowNull: true
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
        tableName: "videos", // Serves Movies, African Stories, Memory Verses
        timestamps: true,
    }
);

module.exports = Video;
