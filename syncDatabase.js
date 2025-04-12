require("dotenv").config();

const sequelize = require("./config/database");
const User = require("./models/user");
const Album = require("./models/album");
const ClientAlbum = require("./models/clientAlbum");
const bcrypt = require("bcrypt");

// Define associations
User.hasMany(ClientAlbum, { foreignKey: "userId" });
ClientAlbum.belongsTo(User, { foreignKey: "userId" });

Album.hasMany(ClientAlbum, { foreignKey: "albumId" });
ClientAlbum.belongsTo(Album, { foreignKey: "albumId" });

async function syncDatabase() {
  try {
    await sequelize.sync({ force: true }); // Use force: true to drop and recreate tables
    console.log("Database synchronized successfully.");

    // Hash the password before inserting
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Insert actual data
    const user = await User.create({
      firstname: "Ocha",
      lastname: "Alfie",
      email: "ochalfie@gmail.com",
      phone: "256773913902",
      country: "Uganda",
      password: hashedPassword,
      role: "client",
      accountStatus: "verified",
    });

    // Add album data
    const albums = [
      {
        id: "domestic-animals",
        title: "Domestic Animals",
        image: "/assets/domesticanimals.jpg",
        songs: 4,
        video: 4,
        audio: 4,
        coloringPics: 15,
        coloredPics: 15,
        ugx: "10,000",
        usd: 4,
        contents: [
          "Domestic Animal Names",
          "Domestic Animal Sounds",
          "Domestic Animal Homes",
          "Domestic Animal Young Ones",
          "11 Domestic Animals",
        ],
      },
      {
        id: "wild-animals",
        title: "Wild Animals",
        image: "/assets/wildanimals.jpg",
        songs: 4,
        video: 4,
        audio: 4,
        coloringPics: 10,
        coloredPics: 10,
        ugx: "10,000",
        usd: 4,
        contents: [
          "Wild Animal Names",
          "Wild Animal Sounds",
          "Wild Animal Homes",
          "Wild vs Domestic",
          "11 Wild Animals",
        ],
      },
      {
        id: "my-body",
        title: "My Body",
        image: "/assets/body.jpg",
        songs: 8,
        video: 8,
        audio: 8,
        coloringPics: 20,
        coloredPics: 20,
        ugx: "15,000",
        usd: 5,
        contents: [
          "My Body Parts",
          "Head to Toe Song",
          "Body Functions",
          "Taking Care of My Body",
          "Growing Up",
        ],
      },
    ];

    for (const album of albums) {
      await Album.upsert(album);
    }

    console.log("Album data synced successfully.");

    process.exit(0);
  } catch (error) {
    console.error("Error synchronizing database:", error);
    process.exit(1);
  }
}

syncDatabase();
