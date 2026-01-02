require('dotenv').config();
const sequelize = require('./config/database');
// Require dependent models to ensure they are registered with Sequelize
const User = require('./models/user');
const Album = require('./models/album');
const ClientAlbum = require('./models/clientAlbum');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync the model to create/alter the table
        await ClientAlbum.sync({ alter: true });
        console.log('ClientAlbum table synced successfully (created or updated).');

    } catch (error) {
        console.error('Error syncing ClientAlbum table:', error);
    } finally {
        await sequelize.close();
    }
})();
