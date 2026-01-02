require('dotenv').config();
const seedHomepageData = require('./seedHomepage');
const sequelize = require('./config/database');

async function run() {
    try {
        await sequelize.authenticate();
        // Ensure tables exist
        await sequelize.sync();
        await seedHomepageData();
        console.log("Seed completed.");
        process.exit(0);
    } catch (err) {
        console.error("Seed failed:", err);
        process.exit(1);
    }
}

run();
