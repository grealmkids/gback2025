require('dotenv').config();
const sequelize = require('./config/database');
const BillingAddress = require('./models/billingAddress');

const syncTable = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        await BillingAddress.sync({ alter: true }); // Updates the table schema to include unique constraints
        console.log('BillingAddress table synced successfully.');
    } catch (error) {
        console.error('Error syncing table:', error);
    } finally {
        await sequelize.close();
    }
};

syncTable();
