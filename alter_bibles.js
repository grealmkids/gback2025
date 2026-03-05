require('dotenv').config();
const sequelize = require('./config/database');
const { DataTypes } = require('sequelize');

async function alterTable() {
    try {
        await sequelize.authenticate();
        console.log("Connection established");

        const queryInterface = sequelize.getQueryInterface();

        // Ensure thumbnail exists, then add photo_urls. Thumbnail should already exist from dynamic creation.
        // We add photo_url_2, 3, 4, 5 (since photo_url_1 was added by the user as photo_url_1)

        await queryInterface.addColumn('hard_copy_books', 'photo_url_2', { type: DataTypes.STRING, allowNull: true });
        console.log("Added photo_url_2");
        await queryInterface.addColumn('hard_copy_books', 'photo_url_3', { type: DataTypes.STRING, allowNull: true });
        console.log("Added photo_url_3");
        await queryInterface.addColumn('hard_copy_books', 'photo_url_4', { type: DataTypes.STRING, allowNull: true });
        console.log("Added photo_url_4");
        await queryInterface.addColumn('hard_copy_books', 'photo_url_5', { type: DataTypes.STRING, allowNull: true });
        console.log("Added photo_url_5");

        console.log("Alteration complete.");
        process.exit(0);
    } catch (e) {
        console.error("Failed:", e);
        process.exit(1);
    }
}

alterTable();
