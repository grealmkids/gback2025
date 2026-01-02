require("dotenv").config();
const { sequelize, Category } = require("./models");

const seedCategories = async () => {
    try {
        await sequelize.sync({ alter: true }); // Sync all models

        const categories = [
            {
                name: "Kindergarten Albums",
                type: "COLLECTION",
                icon: "fa-music",
                displayOrder: 1,
            },
            {
                name: "African Stories",
                type: "VIDEO",
                icon: "fa-feather-alt", // Or fa-paw
                displayOrder: 2,
            },
            {
                name: "Movies",
                type: "VIDEO",
                icon: "fa-video",
                displayOrder: 3,
            },
            {
                name: "Memory Verses",
                type: "VIDEO",
                icon: "fa-scroll", // Scroll for verses
                displayOrder: 4,
            },
            {
                name: "Story Books",
                type: "PDF",
                icon: "fa-book-open",
                displayOrder: 5,
            },
            {
                name: "Coloring Books",
                type: "PDF",
                icon: "fa-paint-brush",
                displayOrder: 6,
            },
        ];

        console.log("Seeding Categories...");
        for (const cat of categories) {
            await Category.findOrCreate({
                where: { name: cat.name },
                defaults: cat,
            });
        }

        console.log("Categories seeded successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding categories:", error);
        process.exit(1);
    }
};

seedCategories();
