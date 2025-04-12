const sequelize = require("../config/database");
const Album = require("./album");
const ClientAlbum = require("./clientAlbum");
const User = require("./user");

// Define associations
ClientAlbum.belongsTo(Album, { foreignKey: "albumId" });
Album.hasMany(ClientAlbum, { foreignKey: "albumId" });

ClientAlbum.belongsTo(User, { foreignKey: "userId" });
User.hasMany(ClientAlbum, { foreignKey: "userId" });

module.exports = { sequelize, Album, ClientAlbum, User };
