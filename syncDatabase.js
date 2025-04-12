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

(async () => {
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

    process.exit(0);
  } catch (error) {
    console.error("Error synchronizing database:", error);
    process.exit(1);
  }
})();
