require("dotenv").config();
const sequelize = require("./config/database");
const HomepageProduction = require("./models/HomepageProduction");
const HomepageService = require("./models/HomepageService");
const seedHomepageData = require("./seedHomepage");

async function setupHomepage() {
    try {
        console.log("Syncing Homepage tables...");
        await HomepageProduction.sync({ force: true });
        await HomepageService.sync({ force: true });
        console.log("Homepage tables synced.");

        console.log("Seeding Homepage data...");
        await seedHomepageData();
        console.log("Homepage setup complete.");
        process.exit(0);
    } catch (error) {
        console.error("Error setting up homepage:", error);
        process.exit(1);
    }
}

setupHomepage();
