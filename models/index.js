const sequelize = require("../config/database");
const Album = require("./album");
const ClientAlbum = require("./clientAlbum");
const User = require("./user");
const BillingAddress = require("./billingAddress");
const Category = require("./category");
const Video = require("./video");
const Book = require("./book");

// Define associations
ClientAlbum.belongsTo(Album, { foreignKey: "albumId" });
Album.hasMany(ClientAlbum, { foreignKey: "albumId" });

ClientAlbum.belongsTo(User, { foreignKey: "userId" });
User.hasMany(ClientAlbum, { foreignKey: "userId" });

// Category Associations
Category.hasMany(Album, { foreignKey: "categoryId" });
Album.belongsTo(Category, { foreignKey: "categoryId" });

Category.hasMany(Video, { foreignKey: "categoryId" });
Video.belongsTo(Category, { foreignKey: "categoryId" });

Category.hasMany(Book, { foreignKey: "categoryId" });
Book.belongsTo(Category, { foreignKey: "categoryId" });

// BillingAddress associations are defined in the billingAddress.js file (or handled via model definition usually, but we'll leave this comment)

module.exports = {
    sequelize,
    Album,
    ClientAlbum,
    User,
    BillingAddress,
    Category,
    Video,
    Book
};
