require("dotenv").config();
const { sequelize, Category, Album, Video, Book, AfricanStory } = require("./models");

const seedProducts = async () => {
    try {
        await sequelize.sync({ alter: true }); // Ensure new tables are created

        // Categories are assumed to be seeded already
        const kindergartenCat = await Category.findOne({ where: { name: "Kindergarten Albums" } });
        const moviesCat = await Category.findOne({ where: { name: "Movies" } });
        const storyBooksCat = await Category.findOne({ where: { name: "Story Books" } });
        const africanStoriesCat = await Category.findOne({ where: { name: "African Stories" } });

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

        // 4. Add Dummy African Story
        if (africanStoriesCat) {
            console.log("Seeding African Stories...");
            await AfricanStory.findOrCreate({
                where: { title: "The Lion and the Hare" },
                defaults: {
                    title: "The Lion and the Hare",
                    description: "A classic tale of wit and strength.",
                    price: 20000,
                    categoryId: africanStoriesCat.id,
                    thumbnail: "assets/lion_hare_thumb.jpg",
                    videoUrl: "assets/lion_hare.mp4",
                    storyBookUrl: "assets/lion_hare_story.pdf",
                    coloringBookUrl: "assets/lion_hare_coloring.pdf",
                    flashcardsUrl: "assets/lion_hare_cards.pdf"
                }
            });
        }

        // 5. Add Dummy Memory Verse
        const memoryVersesCat = await Category.findOne({ where: { name: "Memory Verses" } });
        if (memoryVersesCat) {
            console.log("Seeding Memory Verses...");
            await Video.findOrCreate({
                where: { title: "John 3:16" },
                defaults: {
                    title: "John 3:16",
                    description: "For God so loved the world...",
                    price: 0,
                    categoryId: memoryVersesCat.id,
                    thumbnail: "assets/john316.jpg",
                    fileUrl: "assets/john316.mp4"
                }
            });
        }

        // 6. Add Dummy Coloring Book
        const coloringCat = await Category.findOne({ where: { name: "Coloring Books" } });
        if (coloringCat) {
            console.log("Seeding Coloring Books...");
            await Book.findOrCreate({
                where: { title: "Animals of the Bible" },
                defaults: {
                    title: "Animals of the Bible",
                    description: "Color your favorite animals.",
                    price: 3000,
                    categoryId: coloringCat.id,
                    coverImage: "assets/animals_coloring.jpg",
                    fileUrl: "assets/animals_coloring.pdf"
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
