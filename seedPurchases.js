require('dotenv').config();
const sequelize = require('./config/database');
const ClientAlbum = require('./models/clientAlbum');
const User = require('./models/user');
const Album = require('./models/album');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Find user with ID 1
        const user = await User.findByPk(1);
        if (!user) {
            console.log('User ID 1 not found. Creating dummy user...');
            // Create if not exists (though previous restore should have created it or similar)
            // For now, assuming user 1 might not exist if tables were wiped.
            // But restoreAlgorithms didn't create users. 
            // Let's create a generic user if id 1 is missing.
            await User.create({
                id: 1,
                firstname: "Test",
                lastname: "User",
                email: "test@example.com",
                password: "password",
                role: "client",
                accountStatus: "verified"
            });
        }

        // Find some albums
        const albums = await Album.findAll({ limit: 3 });
        if (albums.length === 0) {
            console.error('No albums found to purchase! Run restoreAlbums.js first.');
            process.exit(1);
        }

        console.log(`Found ${albums.length} albums. creating purchases...`);

        // Create Purchases
        const purchases = [
            {
                userId: 1,
                albumId: albums[0].id,
                paymentStatus: 'PAID',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 1,
                albumId: albums[1].id,
                paymentStatus: 'WARNING_FAILED', // Just testing different statuses if UI supports it, otherwise PENDING
                // Actually user said: PENDING, FAILED, PAID, INITIATED
                paymentStatus: 'PENDING',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        // Clear previous purchases for clean slate
        await ClientAlbum.destroy({ where: { userId: 1 } });

        await ClientAlbum.bulkCreate(purchases);

        console.log('Dummy purchased albums seeded successfully for User ID 1.');

    } catch (error) {
        console.error('Error seeding purchases:', error);
    } finally {
        await sequelize.close();
    }
})();
