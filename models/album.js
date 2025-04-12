const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Album = sequelize.define(
  "Album",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    downloadLink: { type: DataTypes.STRING, allowNull: false, unique: true },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "album",
    timestamps: false,
  }
);

// Removed direct import of `ClientAlbum` to avoid circular dependencies.

module.exports = Album;
