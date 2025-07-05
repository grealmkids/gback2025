const sequelize = require("../config/database");
const Album = require("./album");
const ClientAlbum = require("./clientAlbum");
const User = require("./user");
const BillingAddress = require("./billingAddress");

// Define associations
ClientAlbum.belongsTo(Album, { foreignKey: "albumId" });
Album.hasMany(ClientAlbum, { foreignKey: "albumId" });

ClientAlbum.belongsTo(User, { foreignKey: "userId" });
User.hasMany(ClientAlbum, { foreignKey: "userId" });

// BillingAddress associations are defined in the billingAddress.js file

module.exports = { sequelize, Album, ClientAlbum, User, BillingAddress };
