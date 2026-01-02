require('dotenv').config();
const sequelize = require('./config/database');
const Album = require('./models/album');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync the model to alter the table
        await Album.sync({ alter: true });
        console.log('Album table synced successfully (added downloadZip column).');

    } catch (error) {
        console.error('Error syncing Album table:', error);
    } finally {
        await sequelize.close();
    }
})();
