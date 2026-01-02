const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ClientAlbum = sequelize.define(
  "ClientAlbum",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "user", key: "id" },
    },
    albumId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "album", key: "id" },
    },
    paymentStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "PENDING", // PENDING, FAILED, PAID, INITIATED
      comment: "Payment status of the order",
    },
  },
  {
    tableName: "client_album",
    timestamps: true, // Enable timestamps for createdAt/updatedAt
  }
);

// ClientAlbum.belongsTo(sequelize.models.Album, { foreignKey: "albumId" });

module.exports = ClientAlbum;
