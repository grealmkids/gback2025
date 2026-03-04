require("dotenv").config();
const { sequelize, Cart, CartItem, Transaction } = require("./models");

async function syncNewModels() {
    try {
        await sequelize.authenticate();
        console.log("Connected to DB");

        await Cart.sync({ alter: true });
        console.log("Cart synced");

        await CartItem.sync({ alter: true });
        console.log("CartItem synced");

        await Transaction.sync({ alter: true });
        console.log("Transaction synced");

        console.log("All new models synced successfully!");
    } catch (err) {
        console.error("Error syncing models:", err);
    } finally {
        process.exit(0);
    }
}
syncNewModels();
