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
            const movieData = {
                title: "Babu & the Goose",
                description: "A funny movie about a goose.",
                price: 15000,
                categoryId: moviesCat.id,
                thumbnail: "/assets/babu_goose.jpg"
            };
            const [movie, created] = await Video.findOrCreate({
                where: { title: movieData.title },
                defaults: movieData
            });
            if (!created) await movie.update(movieData);
        }

        // 3. Add Dummy Book
        if (storyBooksCat) {
            console.log("Seeding Books...");
            const bookData = {
                title: "The Wise Tortoise",
                description: "An classic African fable.",
                price: 5000,
                categoryId: storyBooksCat.id,
                coverImage: "/assets/tortoise_book.jpg",
                fileUrl: "https://grealm.org/assets/docs/business-services.pdf"
            };
            const [book, created] = await Book.findOrCreate({
                where: { title: bookData.title },
                defaults: bookData
            });
            if (!created) await book.update(bookData);
        }

        // 4. Add or Update Dummy African Story
        if (africanStoriesCat) {
            console.log("Seeding African Stories...");
            const storyData = {
                title: "The Lion and the Hare",
                description: "A classic tale of wit and strength.",
                price: 20000,
                categoryId: africanStoriesCat.id,
                thumbnail: "/assets/lion_hare_thumb.jpg",
                videoUrl: "/assets/lion_hare.mp4",
                storyBookUrl: "https://grealm.org/assets/docs/business-services.pdf",
                coloringBookUrl: "https://grealm.org/assets/docs/business-services.pdf",
                flashcardsUrl: "https://grealm.org/assets/docs/business-services.pdf"
            };

            const [story, created] = await AfricanStory.findOrCreate({
                where: { title: storyData.title },
                defaults: storyData
            });

            if (!created) {
                await story.update(storyData);
            }
        }

        // 5. Add or Update Dummy Memory Verse
        const memoryVersesCat = await Category.findOne({ where: { name: "Memory Verses" } });
        if (memoryVersesCat) {
            console.log("Seeding Memory Verses...");
            const verseData = {
                title: "John 3:16",
                description: "For God so loved the world...",
                price: 0,
                categoryId: memoryVersesCat.id,
                thumbnail: "/assets/john316.jpg",
                fileUrl: "/assets/john316.mp4"
            };

            const [verse, created] = await Video.findOrCreate({
                where: { title: verseData.title },
                defaults: verseData
            });
            if (!created) await verse.update(verseData);
        }

        // 6. Add or Update Dummy Coloring Book
        const coloringCat = await Category.findOne({ where: { name: "Coloring Books" } });
        if (coloringCat) {
            console.log("Seeding Coloring Books...");
            const bookData = {
                title: "Animals of the Bible",
                description: "Color your favorite animals.",
                price: 3000,
                categoryId: coloringCat.id,
                coverImage: "/assets/animals_coloring.jpg",
                fileUrl: "https://grealm.org/assets/docs/business-services.pdf"
            };

            const [book, created] = await Book.findOrCreate({
                where: { title: bookData.title },
                defaults: bookData
            });
            if (!created) await book.update(bookData);
        }

        console.log("Products seeded successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding products:", error);
        process.exit(1);
    }
};

seedProducts();
