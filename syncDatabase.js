require("dotenv").config();

const sequelize = require("./config/database");
const User = require("./models/user");
const Album = require("./models/album");
const ClientAlbum = require("./models/clientAlbum");

// Define associations
User.hasMany(ClientAlbum, { foreignKey: "userId" });
ClientAlbum.belongsTo(User, { foreignKey: "userId" });

Album.hasMany(ClientAlbum, { foreignKey: "albumId" });
ClientAlbum.belongsTo(Album, { foreignKey: "albumId" });

(async () => {
  try {
    await sequelize.sync({ force: true }); // Use force: true to drop and recreate tables
    console.log("Database synchronized successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error synchronizing database:", error);
    process.exit(1);
  }
})();
