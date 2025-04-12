const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ClientAlbum = sequelize.define(
  "ClientAlbum",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "user", key: "id" }, // Corrected table name
    },
    albumId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "album", key: "id" }, // Corrected table name
    },
  },
  {
    tableName: "client_album",
    timestamps: false,
  }
);

ClientAlbum.belongsTo(sequelize.models.Album, { foreignKey: "albumId" });

module.exports = ClientAlbum;
