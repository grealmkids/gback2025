const express = require("express");
const router = express.Router();
const { viewPurchasedAlbums } = require("../controllers/clientController");
const Album = require("../models/album");
const ClientAlbum = require("../models/clientAlbum");

// View purchased albums
router.get("/purchased-albums", viewPurchasedAlbums);

// Alias route for fetching all albums
router.get("/albums", async (req, res) => {
  try {
    const albums = await Album.findAll({
      attributes: { exclude: ["downloadUrl"] },
    });
    res.status(200).json(albums);
  } catch (error) {
    console.error("Error fetching albums at /api/albums:", error);
    res.status(500).json({ message: "Failed to fetch albums", error });
  }
});

router.post("/insert-client-album", async (req, res) => {
  const { userId, albumId } = req.body;

  if (!userId || !albumId) {
    return res
      .status(400)
      .json({ message: "userId and albumId are required." });
  }

  try {
    await ClientAlbum.create({ userId, albumId });
    res
      .status(201)
      .json({ message: "Client album row inserted successfully." });
  } catch (error) {
    console.error("Error inserting client album row:", error);
    res
      .status(500)
      .json({ message: "Failed to insert client album row.", error });
  }
});

module.exports = router;
