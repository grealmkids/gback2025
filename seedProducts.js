require("dotenv").config();
const { sequelize, Category, Album, Video, Book } = require("./models");

const seedProducts = async () => {
    try {
        // Categories are assumed to be seeded already
        const kindergartenCat = await Category.findOne({ where: { name: "Kindergarten Albums" } });
        const moviesCat = await Category.findOne({ where: { name: "Movies" } });
        const storyBooksCat = await Category.findOne({ where: { name: "Story Books" } });

        if (!kindergartenCat) {
            console.error("Categories not found. Run seedCategories.js first.");
            process.exit(1);
        }

        // 1. Link existing albums to Kindergarten Category
        console.log("Linking Albums...");
        await Album.update(
            { categoryId: kindergartenCat.id },
            { where: { categoryId: null } }
        );

        // 2. Add Dummy Movie
        if (moviesCat) {
            console.log("Seeding Movies...");
            await Video.findOrCreate({
                where: { title: "Babu & the Goose" },
                defaults: {
                    title: "Babu & the Goose",
                    description: "A funny movie about a goose.",
                    price: 15000,
                    categoryId: moviesCat.id,
                    thumbnail: "assets/babu_goose.jpg" // Placeholder
                }
            });
        }

        // 3. Add Dummy Book
        if (storyBooksCat) {
            console.log("Seeding Books...");
            await Book.findOrCreate({
                where: { title: "The Wise Tortoise" },
                defaults: {
                    title: "The Wise Tortoise",
                    description: "An classic African fable.",
                    price: 5000,
                    categoryId: storyBooksCat.id,
                    coverImage: "assets/tortoise_book.jpg" // Placeholder
                }
            });
        }

        console.log("Products seeded successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding products:", error);
        process.exit(1);
    }
};

seedProducts();
