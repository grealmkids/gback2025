const sequelize = require("../config/database");
const Album = require("./album");
const PurchasedItem = require("./PurchasedItem");
const User = require("./user");
const BillingAddress = require("./billingAddress");
const Category = require("./category");
const Video = require("./video");
const Book = require("./book");
const AfricanStory = require("./africanStory");
const HomepageService = require("./HomepageService");
const Cart = require("./Cart");
const CartItem = require("./CartItem");
const Transaction = require("./Transaction");

// Define Universal Purchase associations
PurchasedItem.belongsTo(User, { foreignKey: "userId" });
User.hasMany(PurchasedItem, { foreignKey: "userId" });

// Category Associations
Category.hasMany(Album, { foreignKey: "categoryId" });
Album.belongsTo(Category, { foreignKey: "categoryId" });

Category.hasMany(Video, { foreignKey: "categoryId" });
Video.belongsTo(Category, { foreignKey: "categoryId" });

Category.hasMany(Book, { foreignKey: "categoryId" });
Book.belongsTo(Category, { foreignKey: "categoryId" });

Category.hasMany(AfricanStory, { foreignKey: "categoryId" });
AfricanStory.belongsTo(Category, { foreignKey: "categoryId" });

// Cart Associations
User.hasOne(Cart, { foreignKey: "userId" });
Cart.belongsTo(User, { foreignKey: "userId" });

Cart.hasMany(CartItem, { foreignKey: "cartId" });
CartItem.belongsTo(Cart, { foreignKey: "cartId" });

// Transaction Associations
User.hasMany(Transaction, { foreignKey: "userId" });
Transaction.belongsTo(User, { foreignKey: "userId" });

// BillingAddress associations are defined in the billingAddress.js file (or handled via model definition usually, but we'll leave this comment)

module.exports = {
    sequelize,
    Album,
    PurchasedItem,
    User,
    BillingAddress,
    Category,
    Video,
    Book,
    Book,
    AfricanStory,
    HomepageService,
    Cart,
    CartItem,
    Transaction
};
