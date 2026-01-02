require('dotenv').config();
const sequelize = require('./config/database');
const Album = require('./models/album');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        const count = await Album.count();
        console.log(`Total Albums found: ${count}`);

        if (count > 0) {
            const albums = await Album.findAll();
            console.log('Sample Album:', JSON.stringify(albums[0], null, 2));
        }
    } catch (error) {
        console.error('Error checking albums:', error);
    } finally {
        await sequelize.close();
    }
})();
