const sequelize = require("./config/database");
const User = require("./models/user");
const Album = require("./models/album");
const ClientAlbum = require("./models/clientAlbum");

(async () => {
  try {
    // Add sample users
    const users = await User.bulkCreate([
      {
        firstname: "John",
        lastname: "Doe",
        email: "john.doe@example.com",
        phone: "256773913901",
        country: "Uganda",
        password: "password123",
        role: "client",
        accountStatus: "verified",
      },
      {
        firstname: "Jane",
        lastname: "Smith",
        email: "ochalfie@gmail.com",
        phone: "256773913902",
        country: "Kenya",
        password: "password123",
        role: "client",
        accountStatus: "unverified",
      },
    ]);

    // Add sample albums
    const albums = await Album.bulkCreate([
      {
        title: "Album 1",
        description: "This is the first album.",
        price: 10.99,
      },
      {
        title: "Album 2",
        description: "This is the second album.",
        price: 15.99,
      },
    ]);

    // Add sample client-album relationships
    await ClientAlbum.bulkCreate([
      {
        userId: users[0].id,
        albumId: albums[0].id,
      },
      {
        userId: users[0].id,
        albumId: albums[1].id,
      },
    ]);

    console.log("Database seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
})();
